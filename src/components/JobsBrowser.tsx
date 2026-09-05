"use client";

import { useMemo, useState } from "react";
import type { Job } from "@/types/domain";
import { Input, Select } from "@/components/ui";
import { formatRelativeDays } from "@/lib/utils";

export function JobsBrowser({ jobs, accentColor }: { jobs: Job[]; accentColor: string }) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const openJobs = useMemo(() => jobs.filter((j) => j.is_open), [jobs]);

  const locations = useMemo(
    () => Array.from(new Set(openJobs.map((j) => j.location).filter(Boolean))).sort(),
    [openJobs]
  );
  const jobTypes = useMemo(
    () => Array.from(new Set(openJobs.map((j) => j.job_type).filter(Boolean))).sort(),
    [openJobs]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return openJobs.filter((job) => {
      if (q && !job.title.toLowerCase().includes(q)) return false;
      if (location !== "all" && job.location !== location) return false;
      if (jobType !== "all" && job.job_type !== jobType) return false;
      return true;
    });
  }, [openJobs, query, location, jobType]);

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[1.5fr_1fr_1fr]">
        <Input
          type="search"
          placeholder="Search job titles\u2026"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search open roles by title"
        />
        <Select value={location} onChange={(e) => setLocation(e.target.value)} aria-label="Filter by location">
          <option value="all">All locations</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </Select>
        <Select value={jobType} onChange={(e) => setJobType(e.target.value)} aria-label="Filter by job type">
          <option value="all">All job types</option>
          {jobTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>

      <p className="mt-4 text-sm text-slate" role="status">
        {filtered.length} open role{filtered.length === 1 ? "" : "s"}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-6 border border-dashed border-line p-8 text-center text-sm text-slate">
          No roles match your search. Try clearing a filter.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {filtered.map((job) => {
            const expanded = expandedId === job.id;
            return (
              <li key={job.id}>
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : job.id)}
                  aria-expanded={expanded}
                  className="group flex w-full items-center gap-4 py-4 text-left"
                  style={{ borderLeft: expanded ? `3px solid ${accentColor}` : "3px solid transparent" }}
                >
                  <div className="min-w-0 flex-1 pl-3">
                    <p className="font-medium text-ink">{job.title}</p>
                    <p className="mt-1 text-sm text-slate">
                      {[job.department, job.location, job.work_policy].filter(Boolean).join(" \u00b7 ")}
                    </p>
                  </div>
                  <span className="hidden shrink-0 text-xs text-slate sm:block">
                    {job.employment_type}
                  </span>
                  <span className="hidden shrink-0 text-xs text-slate md:block">
                    {formatRelativeDays(job.posted_at)}
                  </span>
                  <span aria-hidden className="shrink-0 text-slate transition-transform group-aria-expanded:rotate-45">
                    +
                  </span>
                </button>

                {expanded ? (
                  <div className="pb-6 pl-3 pr-8">
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
                      <div>
                        <dt className="text-xs text-slate">Job type</dt>
                        <dd className="text-ink">{job.job_type}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate">Experience</dt>
                        <dd className="text-ink">{job.experience_level}</dd>
                      </div>
                      {job.salary_range ? (
                        <div>
                          <dt className="text-xs text-slate">Salary</dt>
                          <dd className="text-ink">{job.salary_range}</dd>
                        </div>
                      ) : null}
                      <div>
                        <dt className="text-xs text-slate">Posted</dt>
                        <dd className="text-ink">{formatRelativeDays(job.posted_at)}</dd>
                      </div>
                    </dl>
                    {job.description ? (
                      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">{job.description}</p>
                    ) : null}
                    <button
                      type="button"
                      className="mt-4 px-4 py-2 text-sm font-medium text-paper"
                      style={{ backgroundColor: accentColor }}
                      title="Application flow is not part of this preview"
                      onClick={(e) => e.preventDefault()}
                    >
                      Apply now
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
