import type { APIRoute } from "astro";
import { getUserWithApproval } from "../../lib/auth";
import { createEntry, updateEntry, deleteEntry, getEntryByEmail } from "../../lib/entries";
import { logger } from "../../lib/logger";

const log = logger.scope("ENTRIES");

export const POST: APIRoute = async ({ request, redirect }) => {
  // Verify authentication and approval
  const auth = await getUserWithApproval(request);
  if (!auth) {
    log.warn("Unauthenticated request");
    return redirect("/login?message=auth_error", 302);
  }
  if (!auth.isApproved) {
    log.warn("Unapproved user:", auth.user.email);
    return redirect("/unauthorized?message=unauthorized", 302);
  }

  const { user } = auth;

  // Parse form data
  const formData = await request.formData();
  const method = formData.get("_method")?.toString() || "POST";

  log.debug("Request method:", method, "from user:", user.email);

  // Handle method override
  if (method === "DELETE") {
    return handleDelete(formData, user.email, redirect);
  }

  if (method === "PUT") {
    return handleUpdate(formData, user.email, redirect);
  }

  // Default: CREATE
  return handleCreate(formData, user, redirect);
};

async function handleCreate(
  formData: FormData,
  user: { email: string; name: string | null },
  redirect: (path: string, status?: number) => Response
): Promise<Response> {
  // Check if user already has an entry
  const existing = await getEntryByEmail(user.email);
  if (existing) {
    log.warn("User already has entry:", user.email);
    return redirect("/my-entry?message=entry_exists", 302);
  }

  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const needsPower = formData.get("needsPower") === "on";
  const notes = formData.get("notes")?.toString().trim() || null;

  if (!title || !description) {
    log.warn("Missing required fields");
    return redirect("/my-entry?message=unauthorized", 302);
  }

  try {
    await createEntry({
      title,
      description,
      needsPower,
      notes,
      userEmail: user.email,
      userName: user.name,
    });

    log.info("Entry created for:", user.email);
    return redirect("/my-entry?message=entry_created", 302);
  } catch (error) {
    log.error("Failed to create entry:", error);
    return redirect("/my-entry?message=unauthorized", 302);
  }
}

async function handleUpdate(
  formData: FormData,
  userEmail: string,
  redirect: (path: string, status?: number) => Response
): Promise<Response> {
  const id = parseInt(formData.get("id")?.toString() || "0", 10);
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const needsPower = formData.get("needsPower") === "on";
  const notes = formData.get("notes")?.toString().trim() || null;

  if (!id || !title || !description) {
    log.warn("Missing required fields for update");
    return redirect("/my-entry?message=unauthorized", 302);
  }

  try {
    const entry = await updateEntry(id, userEmail, {
      title,
      description,
      needsPower,
      notes,
    });

    if (!entry) {
      log.warn("Entry not found or not owned by user:", userEmail);
      return redirect("/my-entry?message=unauthorized", 302);
    }

    log.info("Entry updated for:", userEmail);
    return redirect("/my-entry?message=entry_updated", 302);
  } catch (error) {
    log.error("Failed to update entry:", error);
    return redirect("/my-entry?message=unauthorized", 302);
  }
}

async function handleDelete(
  formData: FormData,
  userEmail: string,
  redirect: (path: string, status?: number) => Response
): Promise<Response> {
  const id = parseInt(formData.get("id")?.toString() || "0", 10);

  if (!id) {
    log.warn("Missing entry ID for delete");
    return redirect("/my-entry?message=unauthorized", 302);
  }

  try {
    const deleted = await deleteEntry(id, userEmail);

    if (!deleted) {
      log.warn("Entry not found or not owned by user:", userEmail);
      return redirect("/my-entry?message=unauthorized", 302);
    }

    log.info("Entry deleted for:", userEmail);
    return redirect("/my-entry?message=entry_deleted", 302);
  } catch (error) {
    log.error("Failed to delete entry:", error);
    return redirect("/my-entry?message=unauthorized", 302);
  }
}
