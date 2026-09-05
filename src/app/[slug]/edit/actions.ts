"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isValidHexColor, isValidUrl, slugify } from "@/lib/utils";

type ActionResult = { error?: string; ok?: boolean };

async function requireCompany(slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, company: null };

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .maybeSingle();

  return { supabase, user, company };
}

// ---------------------------------------------------------------------------
// Branding
// ---------------------------------------------------------------------------
export async function updateBranding(slug: string, formData: FormData): Promise<ActionResult> {
  const { supabase, company } = await requireCompany(slug);
  if (!company) return { error: "Company not found." };

  const name = String(formData.get("name") || "").trim();
  const tagline = String(formData.get("tagline") || "").trim();
  const logo_url = String(formData.get("logo_url") || "").trim();
  const banner_url = String(formData.get("banner_url") || "").trim();
  const culture_video_url = String(formData.get("culture_video_url") || "").trim();
  const primary_color = String(formData.get("primary_color") || "").trim();
  const accent_color = String(formData.get("accent_color") || "").trim();

  if (!name) return { error: "Company name can't be empty." };
  if (!isValidHexColor(primary_color) || !isValidHexColor(accent_color)) {
    return { error: "Colors must be valid hex values, e.g. #14213D." };
  }
  for (const [label, value] of [
    ["Logo URL", logo_url],
    ["Banner URL", banner_url],
    ["Culture video URL", culture_video_url],
  ] as const) {
    if (!isValidUrl(value)) return { error: `${label} doesn't look like a valid link.` };
  }

  const { error } = await supabase
    .from("companies")
    .update({ name, tagline, logo_url, banner_url, culture_video_url, primary_color, accent_color })
    .eq("id", company.id);

  if (error) return { error: error.message };

  revalidatePath(`/${slug}/edit`);
  revalidatePath(`/${slug}/preview`);
  revalidatePath(`/${slug}/careers`);
  return { ok: true };
}

export async function togglePublish(slug: string, publish: boolean): Promise<ActionResult> {
  const { supabase, company } = await requireCompany(slug);
  if (!company) return { error: "Company not found." };

  const { error } = await supabase
    .from("companies")
    .update({ is_published: publish })
    .eq("id", company.id);

  if (error) return { error: error.message };

  revalidatePath(`/${slug}/edit`);
  revalidatePath(`/${slug}/careers`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------
export async function addSection(slug: string): Promise<ActionResult> {
  const { supabase, company } = await requireCompany(slug);
  if (!company) return { error: "Company not found." };

  const { data: existing } = await supabase
    .from("sections")
    .select("position")
    .eq("company_id", company.id)
    .order("position", { ascending: false })
    .limit(1);

  const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const { error } = await supabase.from("sections").insert({
    company_id: company.id,
    title: "New section",
    body: "",
    position: nextPosition,
  });

  if (error) return { error: error.message };
  revalidatePath(`/${slug}/edit`);
  return { ok: true };
}

export async function updateSection(
  slug: string,
  sectionId: string,
  formData: FormData
): Promise<ActionResult> {
  const { supabase, company } = await requireCompany(slug);
  if (!company) return { error: "Company not found." };

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const image_url = String(formData.get("image_url") || "").trim();

  if (!title) return { error: "Section title can't be empty." };
  if (!isValidUrl(image_url)) return { error: "Image URL doesn't look valid." };

  const { error } = await supabase
    .from("sections")
    .update({ title, body, image_url })
    .eq("id", sectionId)
    .eq("company_id", company.id);

  if (error) return { error: error.message };
  revalidatePath(`/${slug}/edit`);
  revalidatePath(`/${slug}/preview`);
  revalidatePath(`/${slug}/careers`);
  return { ok: true };
}

export async function toggleSectionVisibility(
  slug: string,
  sectionId: string,
  visible: boolean
): Promise<ActionResult> {
  const { supabase, company } = await requireCompany(slug);
  if (!company) return { error: "Company not found." };

  const { error } = await supabase
    .from("sections")
    .update({ is_visible: visible })
    .eq("id", sectionId)
    .eq("company_id", company.id);

  if (error) return { error: error.message };
  revalidatePath(`/${slug}/edit`);
  revalidatePath(`/${slug}/careers`);
  return { ok: true };
}

export async function deleteSection(slug: string, sectionId: string): Promise<ActionResult> {
  const { supabase, company } = await requireCompany(slug);
  if (!company) return { error: "Company not found." };

  const { error } = await supabase
    .from("sections")
    .delete()
    .eq("id", sectionId)
    .eq("company_id", company.id);

  if (error) return { error: error.message };
  revalidatePath(`/${slug}/edit`);
  revalidatePath(`/${slug}/careers`);
  return { ok: true };
}

export async function reorderSections(slug: string, orderedIds: string[]): Promise<ActionResult> {
  const { supabase, company } = await requireCompany(slug);
  if (!company) return { error: "Company not found." };

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("sections").update({ position: index }).eq("id", id).eq("company_id", company.id)
    )
  );

  revalidatePath(`/${slug}/edit`);
  revalidatePath(`/${slug}/preview`);
  revalidatePath(`/${slug}/careers`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------
function jobFromFormData(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  return {
    title,
    job_slug: slugify(`${title}-${formData.get("location") || ""}`) || slugify(title),
    department: String(formData.get("department") || "").trim(),
    location: String(formData.get("location") || "").trim(),
    work_policy: String(formData.get("work_policy") || "Onsite"),
    employment_type: String(formData.get("employment_type") || "Full time"),
    experience_level: String(formData.get("experience_level") || "Mid-level").trim(),
    job_type: String(formData.get("job_type") || "Permanent"),
    salary_range: String(formData.get("salary_range") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    is_open: formData.get("is_open") === "on",
  };
}

export async function addJob(slug: string, formData: FormData): Promise<ActionResult> {
  const { supabase, company } = await requireCompany(slug);
  if (!company) return { error: "Company not found." };

  const job = jobFromFormData(formData);
  if (!job.title) return { error: "Job title can't be empty." };

  const { error } = await supabase.from("jobs").insert({ company_id: company.id, ...job });
  if (error) return { error: error.message };

  revalidatePath(`/${slug}/edit`);
  revalidatePath(`/${slug}/careers`);
  return { ok: true };
}

export async function updateJob(slug: string, jobId: string, formData: FormData): Promise<ActionResult> {
  const { supabase, company } = await requireCompany(slug);
  if (!company) return { error: "Company not found." };

  const job = jobFromFormData(formData);
  if (!job.title) return { error: "Job title can't be empty." };

  const { error } = await supabase
    .from("jobs")
    .update(job)
    .eq("id", jobId)
    .eq("company_id", company.id);

  if (error) return { error: error.message };
  revalidatePath(`/${slug}/edit`);
  revalidatePath(`/${slug}/careers`);
  return { ok: true };
}

export async function deleteJob(slug: string, jobId: string): Promise<ActionResult> {
  const { supabase, company } = await requireCompany(slug);
  if (!company) return { error: "Company not found." };

  const { error } = await supabase.from("jobs").delete().eq("id", jobId).eq("company_id", company.id);
  if (error) return { error: error.message };

  revalidatePath(`/${slug}/edit`);
  revalidatePath(`/${slug}/careers`);
  return { ok: true };
}
