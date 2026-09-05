import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: companies } = await supabase
    .from("companies")
    .select("slug, updated_at")
    .eq("is_published", true);

  const entries: MetadataRoute.Sitemap = (companies ?? []).map((c) => ({
    url: `/${c.slug}/careers`,
    lastModified: c.updated_at,
  }));

  return [{ url: "/" }, ...entries];
}
