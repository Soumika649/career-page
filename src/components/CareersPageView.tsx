import Image from "next/image";
import type { Company, Job, Section } from "@/types/domain";
import { JobsBrowser } from "@/components/JobsBrowser";

export function CareersPageView({
  company,
  sections,
  jobs,
  isPreview = false,
}: {
  company: Company;
  sections: Section[];
  jobs: Job[];
  isPreview?: boolean;
}) {
  const visibleSections = sections.filter((s) => s.is_visible).sort((a, b) => a.position - b.position);
  const openJobsCount = jobs.filter((j) => j.is_open).length;

  return (
    <div className="min-h-screen bg-paper" style={{ ["--company-primary" as string]: company.primary_color }}>
      {isPreview ? (
        <div className="sticky top-0 z-10 flex items-center justify-center gap-2 bg-ink px-4 py-2 text-center text-xs text-paper">
          Preview mode &mdash; this is how candidates will see your page
          {!company.is_published ? " once published." : "."}
        </div>
      ) : null}

      <header
        className="relative flex flex-col justify-end overflow-hidden"
        style={{ backgroundColor: company.primary_color, minHeight: "clamp(220px, 32vw, 380px)" }}
      >
        {company.banner_url ? (
          <Image
            src={company.banner_url}
            alt=""
            fill
            priority
            className="object-cover opacity-40"
            sizes="100vw"
            unoptimized
          />
        ) : null}
        <div className="relative mx-auto w-full max-w-4xl px-6 pb-10 pt-16 md:px-0">
          <div className="flex items-center gap-4">
            {company.logo_url ? (
              <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-paper-raised">
                <Image src={company.logo_url} alt={`${company.name} logo`} fill className="object-contain p-1.5" unoptimized />
              </div>
            ) : null}
            <div>
              <h1 className="font-display text-3xl text-paper md:text-4xl">{company.name}</h1>
              {company.tagline ? <p className="mt-1 max-w-xl text-paper/85">{company.tagline}</p> : null}
            </div>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-4xl px-6 py-12 md:px-0">
        {visibleSections.map((section) => (
          <section key={section.id} className="mb-14 grid gap-6 md:grid-cols-[1fr] lg:grid-cols-[2fr_1fr]">
            <div>
              <h2 className="font-display text-2xl text-ink">{section.title}</h2>
              {section.body ? (
                <p className="mt-3 max-w-2xl whitespace-pre-line text-ink-soft leading-relaxed">{section.body}</p>
              ) : null}
            </div>
            {section.image_url ? (
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-line/40">
                <Image src={section.image_url} alt="" fill className="object-cover" unoptimized />
              </div>
            ) : null}
          </section>
        ))}

        {company.culture_video_url ? (
          <section className="mb-14">
            <h2 className="font-display text-2xl text-ink">See life at {company.name}</h2>
            <div className="relative mt-4 aspect-video w-full overflow-hidden bg-ink">
              <iframe
                src={toEmbedUrl(company.culture_video_url)}
                title={`Life at ${company.name}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        ) : null}

        <section aria-labelledby="open-roles-heading">
          <h2 id="open-roles-heading" className="font-display text-2xl text-ink">
            Open roles
          </h2>
          <p className="mt-1 text-sm text-slate">
            {openJobsCount} open position{openJobsCount === 1 ? "" : "s"} at {company.name}.
          </p>
          <div className="mt-6">
            <JobsBrowser jobs={jobs} accentColor={company.accent_color} />
          </div>
        </section>
      </main>

      <footer className="border-t border-line px-6 py-8 text-center text-xs text-slate md:px-0">
        {company.name} careers, built with Careers Page Builder.
      </footer>
    </div>
  );
}

function toEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com") && parsed.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
    }
    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch {
    return url;
  }
}
