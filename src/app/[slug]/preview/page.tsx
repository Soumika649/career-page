import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CareersPageView } from "@/components/CareersPageView";

export const metadata: Metadata = { title: "Preview", robots: { index: false, follow: false } };

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/${slug}/preview`);
  }

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!company) notFound();

  const [{ data: sections }, { data: jobs }] = await Promise.all([
    supabase.from("sections").select("*").eq("company_id", company.id).order("position"),
    supabase.from("jobs").select("*").eq("company_id", company.id).order("created_at", { ascending: false }),
  ]);

  return <CareersPageView company={company} sections={sections ?? []} jobs={jobs ?? []} isPreview />;
}
