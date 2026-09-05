import Link from "next/link";
import { Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { HomeJobBrowser, type HomeJob } from "@/components/HomeJobBrowser";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: companies }, { data: jobs }] = await Promise.all([
    supabase
      .from("companies")
      .select("id, slug, name, tagline, logo_url, is_published")
      .eq("is_published", true)
      .order("name"),
    supabase
      .from("jobs")
      .select(
        "id, company_id, title, job_slug, department, location, work_policy, employment_type, experience_level, job_type, salary_range, description, is_open, posted_at"
      )
      .eq("is_open", true)
      .order("created_at", { ascending: false }),
  ]);

  const publishedCompanies = companies ?? [];
  const companyById = new Map(
    publishedCompanies.map((company) => [
      company.id,
      {
        slug: company.slug,
        name: company.name,
        tagline: company.tagline ?? "",
        logo_url: company.logo_url ?? "",
      },
    ])
  );

  const publicJobs: HomeJob[] = (jobs ?? [])
    .filter((job) => companyById.has(job.company_id))
    .map((job) => ({
      ...job,
      company: companyById.get(job.company_id)!,
    }));

  const featuredCompanies = publishedCompanies.slice(0, 6);

  return (
    <main id="main" className="min-h-screen bg-paper">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/95 px-6 py-4 backdrop-blur md:px-12">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="font-display text-lg font-medium text-ink">
            Careers Page 
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost">Recruiter login</Button>
            </Link>
            <Link href="/login?mode=signup">
              <Button variant="primary">For recruiters</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.05fr_0.95fr] md:px-12 md:py-24">
          <div>
            <p className="mb-4 text-sm font-medium text-slate">
              Find jobs. Discover companies. Build careers.
            </p>
            <h1 className="font-display text-4xl leading-[1.08] text-ink md:text-6xl">
              Your next opportunity starts here.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-ink-soft md:text-lg">
              Search open roles from companies using Careers Page Builder, or create a
              professional careers site for your own team.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#jobs"
                className="inline-flex items-center justify-center bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink-soft"
              >
                Find jobs
              </a>
              <Link href="/login?mode=signup">
                <Button variant="secondary" className="px-5 py-3">
                  Build a careers page
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate">
              <span>
                <strong className="text-ink">{publicJobs.length}</strong> open roles
              </span>
              <span>
                <strong className="text-ink">{publishedCompanies.length}</strong> companies
              </span>
            </div>
          </div>

          <div className="border border-line bg-paper-raised p-6 md:p-8">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate">
              For job seekers
            </p>
            <h2 className="mt-3 font-display text-2xl text-ink">
              Search without creating an account.
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink-soft">
              Browse published companies and open roles. Filter by location, job type,
              and work policy, then open the company careers page to learn more.
            </p>

            <div className="mt-6 space-y-3 text-sm">
              {[
                "Search by job title or company",
                "Filter remote, hybrid, and on-site roles",
                "See experience level and employment type",
                "Open the public company careers page",
              ].map((item) => (
                <div key={item} className="flex gap-3 border-t border-line pt-3">
                  <span aria-hidden className="text-amber">
                    ✓
                  </span>
                  <span className="text-ink-soft">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="jobs" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16 md:px-12 md:py-20">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate">
            Job board
          </p>
          <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">
            Find your next role
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
            Explore open positions from published company career pages.
          </p>
        </div>

        <HomeJobBrowser jobs={publicJobs} />
      </section>

      <section className="border-y border-line bg-paper-raised">
        <div className="mx-auto max-w-6xl px-6 py-16 md:px-12">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate">
                Companies
              </p>
              <h2 className="mt-2 font-display text-3xl text-ink">
                Explore company careers
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate">
              Visit a company page to learn about its culture, story, and current openings.
            </p>
          </div>

          {featuredCompanies.length === 0 ? (
            <p className="mt-8 border border-dashed border-line p-8 text-center text-sm text-slate">
              Published companies will appear here.
            </p>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCompanies.map((company) => (
                <Link
                  key={company.id}
                  href={`/${company.slug}/careers`}
                  className="group border border-line bg-paper p-5 transition-colors hover:border-ink"
                >
                  <div className="flex items-start gap-4">
                    {company.logo_url ? (
                      <img
                        src={company.logo_url}
                        alt=""
                        className="h-12 w-12 shrink-0 border border-line object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-line bg-paper-raised font-display text-lg text-ink">
                        {company.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="font-medium text-ink group-hover:underline">
                        {company.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate">
                        {company.tagline || "View this company's careers page."}
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 text-sm font-medium text-ink">
                    View careers <span aria-hidden>→</span>
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-12 md:py-20">
        <div className="border border-line bg-ink px-6 py-10 text-paper md:flex md:items-center md:justify-between md:gap-10 md:px-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-paper/60">
              For recruiters
            </p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">
              Turn your careers page into your best recruiting link.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-paper/75">
              Add your brand, company story, culture, and open jobs. Publish a fast public
              careers page that candidates can discover and share.
            </p>
          </div>

          <Link href="/login?mode=signup" className="mt-7 shrink-0 md:mt-0">
            <button className="inline-flex items-center justify-center bg-paper px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-paper/90">
              Build your careers page
            </button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-line px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-slate sm:flex-row sm:items-center sm:justify-between">
          <span>Careers Page Builder</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-ink">
              Recruiter login
            </Link>
            <Link href="/login?mode=signup" className="hover:text-ink">
              Create a careers page
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
