import type { APIRoute } from "astro";
import { getUserWithApproval } from "../../../lib/auth";
import { createEntry, getAllEntries } from "../../../lib/entries";
import { db, entries } from "../../../db";
import { eq } from "drizzle-orm";
import { logger } from "../../../lib/logger";

const log = logger.scope("ADMIN-ENTRIES");

export const POST: APIRoute = async ({ request, redirect }) => {
  // Verify authentication, approval, and admin status
  const auth = await getUserWithApproval(request);
  if (!auth) {
    log.warn("Unauthenticated proxy entry request");
    return redirect("/login", 302);
  }
  if (!auth.isApproved) {
    log.warn("Unapproved user tried to manage proxy entry:", auth.user.email);
    return redirect("/unauthorized", 302);
  }
  if (!auth.isAdmin) {
    log.warn("Non-admin user tried to manage proxy entry:", auth.user.email);
    return new Response(null, { status: 404 });
  }

  const formData = await request.formData();
  const method = formData.get("_method")?.toString() || "POST";

  if (method === "DELETE") {
    return handleDelete(formData, auth.user.email, redirect);
  }

  return handleCreate(formData, auth.user.email, redirect);
};

async function handleCreate(
  formData: FormData,
  adminEmail: string,
  redirect: (path: string, status?: number) => Response
): Promise<Response> {
  const entrantName = formData.get("entrant_name")?.toString().trim();
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const needsPower = formData.get("needsPower") === "on";
  const notes = formData.get("notes")?.toString().trim() || null;

  if (!entrantName) {
    log.warn("Proxy entry missing entrant name, by:", adminEmail);
    return redirect("/entries/admin?message=missing_entrant_name", 302);
  }

  if (!title || !description) {
    log.warn("Proxy entry missing required fields, by:", adminEmail);
    return redirect("/entries/admin?message=missing_fields", 302);
  }

  // Generate a stable proxy email from the entrant name
  const proxyEmail = `proxy-${entrantName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}@proxy.local`;

  // Check if a proxy entry with this email already exists
  const allEntries = await getAllEntries();
  const existing = allEntries.find((e) => e.userEmail === proxyEmail);
  if (existing) {
    log.warn("Proxy entry already exists for:", entrantName, "by:", adminEmail);
    return redirect("/entries/admin?message=proxy_entry_exists", 302);
  }

  try {
    await createEntry({
      title,
      description,
      needsPower,
      notes,
      userEmail: proxyEmail,
      userName: entrantName,
    });

    log.info("Proxy entry created for:", entrantName, "by admin:", adminEmail);
    return redirect("/entries/admin?message=proxy_entry_saved", 302);
  } catch (error) {
    log.error("Failed to create proxy entry:", error);
    return redirect("/entries/admin?message=entry_error", 302);
  }
}

async function handleDelete(
  formData: FormData,
  adminEmail: string,
  redirect: (path: string, status?: number) => Response
): Promise<Response> {
  const id = parseInt(formData.get("id")?.toString() || "0", 10);

  if (!id) {
    log.warn("Missing entry ID for proxy delete");
    return redirect("/entries/admin?message=entry_error", 302);
  }

  // Verify the entry is a proxy entry
  const [existing] = await db
    .select()
    .from(entries)
    .where(eq(entries.id, id))
    .limit(1);

  if (!existing) {
    log.warn("Entry not found for proxy delete:", id);
    return redirect("/entries/admin?message=entry_not_found", 302);
  }

  if (!existing.userEmail.endsWith("@proxy.local")) {
    log.warn("Tried to delete non-proxy entry via admin:", id, "by:", adminEmail);
    return redirect("/entries/admin?message=not_proxy_entry", 302);
  }

  try {
    await db.delete(entries).where(eq(entries.id, id));
    log.info("Proxy entry deleted:", id, "by admin:", adminEmail);
    return redirect("/entries/admin?message=proxy_entry_deleted", 302);
  } catch (error) {
    log.error("Failed to delete proxy entry:", error);
    return redirect("/entries/admin?message=entry_error", 302);
  }
}
