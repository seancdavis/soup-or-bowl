import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 4 * 1024 * 1024; // 4 MB

async function getAuthenticatedUser(request: Request, context: Context): Promise<{ email: string } | null> {
  const origin = request.headers.get("origin") || `https://${request.headers.get("host")}`;
  const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");

  // Get cookies, fixing for Neon Auth if on localhost
  const rawCookies = request.headers.get("cookie") || "";
  let cookies = rawCookies;

  if (isLocalhost) {
    const neonCookies = ["neon-auth.session_token", "neon-auth.session_challange"];
    for (const name of neonCookies) {
      const regex = new RegExp(`(^|;\\s*)${name}=`, "g");
      cookies = cookies.replace(regex, `$1__Secure-${name}=`);
    }
  }

  try {
    const response = await fetch(`${origin}/neon-auth/get-session?disableCookieCache=true`, {
      method: "GET",
      headers: {
        cookie: cookies,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data?.user?.email) {
      return null;
    }

    return { email: data.user.email };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export default async (request: Request, context: Context) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Authenticate the user
  const user = await getAuthenticatedUser(request, context);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    // Validate file exists
    if (!image || !image.size) {
      return Response.json({ error: "No image provided" }, { status: 400 });
    }

    // Validate file size
    if (image.size > MAX_SIZE) {
      return Response.json(
        { error: "File too large. Maximum size is 4 MB." },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(image.type)) {
      return Response.json(
        { error: "Invalid file type. Allowed: JPG, PNG, GIF, WebP" },
        { status: 400 }
      );
    }

    // Generate unique key based on user email for easy lookup and overwriting
    const extension = image.name.split(".").pop() || "jpg";
    const emailHash = Buffer.from(user.email).toString("base64url");
    const key = `profile-${emailHash}-${randomUUID().slice(0, 8)}.${extension}`;

    // Store in Netlify Blobs
    const store = getStore("profile-images");
    await store.set(key, image, {
      metadata: {
        contentType: image.type,
        originalFilename: image.name,
        userEmail: user.email,
        uploadedAt: new Date().toISOString(),
      },
    });

    return Response.json({
      success: true,
      key,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/upload-profile-image",
};
