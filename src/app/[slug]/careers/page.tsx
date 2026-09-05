import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CareersPageView } from "@/components/CareersPageView";

type Props = { params: Promise<{ slug: string }> };

async function getPublishedCompany(slug: string) {
  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!company) return null;

  const [{ data: sections }, { data: jobs }] = await Promise.all([
    supabase
      .from("sections")
      .select("*")
      .eq("company_id", company.id)
      .eq("is_visible", true)
      .order("position"),
    supabase
      .from("jobs")
      .select("*")
      .eq("company_id", company.id)
      .eq("is_open", true)
      .order("created_at", { ascending: false }),
  ]);

  return { company, sections: sections ?? [], jobs: jobs ?? [] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublishedCompany(slug);
  if (!data) return { title: "Careers page not found" };

  const { company } = data;
  const description =
    company.tagline || `Explore open roles at ${company.name} and learn what it's like to work there.`;

  return {
    title: `Careers at ${company.name}`,
    description,
    openGraph: {
      title: `Careers at ${company.name}`,
      description,
      images: company.banner_url ? [company.banner_url] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Careers at ${company.name}`,
      description,
    },
    alternates: { canonical: `/${company.slug}/careers` },
  };
}

export default async function CareersPage({ params }: Props) {
  const { slug } = await params;
  const data = await getPublishedCompany(slug);
  if (!data) notFound();

  const { company, sections, jobs } = data;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: company.name,
        description: company.tagline || undefined,
        logo: company.logo_url || undefined,
        url: `/${company.slug}/careers`,
      },
      ...jobs.map((job) => ({
        "@type": "JobPosting",
        title: job.title,
        datePosted: job.posted_at,
        employmentType: job.employment_type.toUpperCase().replace(" ", "_"),
        hiringOrganization: {
          "@type": "Organization",
          name: company.name,
          logo: company.logo_url || undefined,
        },
        jobLocationType: job.work_policy === "Remote" ? "TELECOMMUTE" : undefined,
        jobLocation: job.location
          ? {
              "@type": "Place",
              address: { "@type": "PostalAddress", addressLocality: job.location },
            }
          : undefined,
        description: job.description || job.title,
        industry: job.department || undefined,
      })),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CareersPageView company={company} sections={sections} jobs={jobs} />
    </>
  );
}
