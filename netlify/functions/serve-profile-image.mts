import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  // Path is /uploads/profile-images/:key
  const key = pathParts[pathParts.length - 1];

  if (!key) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const store = getStore("profile-images");
    const result = await store.getWithMetadata(key, { type: "blob" });

    if (!result) {
      return new Response("Not found", { status: 404 });
    }

    const { data, metadata } = result;
    const contentType = (metadata?.contentType as string) || "image/jpeg";

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new Response("Internal server error", { status: 500 });
  }
};

export const config: Config = {
  path: "/uploads/profile-images/*",
};
