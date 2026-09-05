"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Input, Select } from "@/components/ui";
import { formatRelativeDays } from "@/lib/utils";

export type HomeJob = {
  id: string;
  company_id: string;
  title: string;
  job_slug: string;
  department: string;
  location: string;
  work_policy: string;
  employment_type: string;
  experience_level: string;
  job_type: string;
  salary_range: string;
  description: string;
  is_open: boolean;
  posted_at: string;
  company: {
    slug: string;
    name: string;
    tagline: string;
    logo_url: string;
  };
};

export function HomeJobBrowser({ jobs }: { jobs: HomeJob[] }) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [workPolicy, setWorkPolicy] = useState("all");

  const locations = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.location).filter(Boolean))).sort(),
    [jobs]
  );

  const jobTypes = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.job_type).filter(Boolean))).sort(),
    [jobs]
  );

  const workPolicies = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.work_policy).filter(Boolean))).sort(),
    [jobs]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return jobs.filter((job) => {
      if (
        q &&
        !job.title.toLowerCase().includes(q) &&
        !job.company.name.toLowerCase().includes(q) &&
        !job.department.toLowerCase().includes(q)
      ) {
        return false;
      }

      if (location !== "all" && job.location !== location) return false;
      if (jobType !== "all" && job.job_type !== jobType) return false;
      if (workPolicy !== "all" && job.work_policy !== workPolicy) return false;

      return true;
    });
  }, [jobs, query, location, jobType, workPolicy]);

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <Input
          type="search"
          placeholder="Search jobs, companies, or departments…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search jobs, companies, or departments"
        />

        <Select
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          aria-label="Filter jobs by location"
        >
          <option value="all">All locations</option>
          {locations.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>

        <Select
          value={jobType}
          onChange={(event) => setJobType(event.target.value)}
          aria-label="Filter jobs by type"
        >
          <option value="all">All job types</option>
          {jobTypes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>

        <Select
          value={workPolicy}
          onChange={(event) => setWorkPolicy(event.target.value)}
          aria-label="Filter jobs by work policy"
        >
          <option value="all">All work policies</option>
          {workPolicies.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-sm text-slate" role="status">
          {filtered.length} open role{filtered.length === 1 ? "" : "s"}
        </p>

        {(query || location !== "all" || jobType !== "all" || workPolicy !== "all") && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setLocation("all");
              setJobType("all");
              setWorkPolicy("all");
            }}
            className="text-sm font-medium text-ink underline underline-offset-4"
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 border border-dashed border-line p-10 text-center">
          <p className="font-medium text-ink">No roles found</p>
          <p className="mt-2 text-sm text-slate">
            Try a different search term or clear the filters.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {filtered.map((job) => (
            <article
              key={job.id}
              className="border border-line bg-paper-raised p-5 transition-colors hover:border-ink"
            >
              <div className="flex items-start gap-4">
                {job.company.logo_url ? (
                  <img
                    src={job.company.logo_url}
                    alt=""
                    className="h-11 w-11 shrink-0 border border-line object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-line bg-paper font-display text-lg text-ink">
                    {job.company.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-ink">{job.title}</h3>
                  <p className="mt-1 text-sm text-slate">{job.company.name}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate">
                {[job.department, job.location, job.work_policy, job.employment_type]
                  .filter(Boolean)
                  .map((item) => (
                    <span key={item} className="border border-line px-2 py-1">
                      {item}
                    </span>
                  ))}
              </div>

              <p className="mt-4 line-clamp-2 text-sm leading-6 text-ink-soft">
                {job.description || job.company.tagline || "View this role on the company careers page."}
              </p>

              <div className="mt-5 flex items-center justify-between gap-4">
                <span className="text-xs text-slate">
                  {formatRelativeDays(job.posted_at)}
                </span>

                <Link
                  href={`/${job.company.slug}/careers#${job.job_slug}`}
                  className="text-sm font-medium text-ink underline underline-offset-4"
                >
                  View job
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
