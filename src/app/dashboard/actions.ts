"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export type CreateCompanyResult = { error?: string };

export async function createCompany(formData: FormData): Promise<CreateCompanyResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to be logged in." };
  }

  const name = String(formData.get("name") || "").trim();
  if (!name) {
    return { error: "Company name is required." };
  }

  let slug = slugify(name);
  if (!slug) {
    return { error: "That name can't be turned into a URL. Try adding letters or numbers." };
  }

  const { data: existing } = await supabase
    .from("companies")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const { error } = await supabase.from("companies").insert({
    owner_id: user.id,
    slug,
    name,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(`/${slug}/edit`);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
