"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type HomeJob = {
  id: string;
  title: string;
  location?: string | null;
  job_type?: string | null;
  company_name?: string | null;
  company_slug?: string | null;
  department?: string | null;
  work_policy?: string | null;
  employment_type?: string | null;
};

type HomeJobBrowserProps = {
  jobs: HomeJob[];
};

const JOBS_PER_PAGE = 9;

export function HomeJobBrowser({ jobs }: HomeJobBrowserProps) {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [workPolicy, setWorkPolicy] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const locations = useMemo(() => {
    return Array.from(
      new Set(jobs.map((job) => job.location?.trim()).filter((value): value is string => Boolean(value)))
    ).sort();
  }, [jobs]);

  const jobTypes = useMemo(() => {
    return Array.from(
      new Set(jobs.map((job) => job.job_type?.trim()).filter((value): value is string => Boolean(value)))
    ).sort();
  }, [jobs]);

  const workPolicies = useMemo(() => {
    return Array.from(
      new Set(jobs.map((job) => job.work_policy?.trim()).filter((value): value is string => Boolean(value)))
    ).sort();
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !searchValue ||
        job.title.toLowerCase().includes(searchValue) ||
        job.department?.toLowerCase().includes(searchValue) ||
        job.company_name?.toLowerCase().includes(searchValue);

      const matchesLocation = location === "all" || job.location?.trim() === location;

      const matchesJobType = jobType === "all" || job.job_type?.trim() === jobType;

      const matchesWorkPolicy = workPolicy === "all" || job.work_policy?.trim() === workPolicy;

      return matchesSearch && matchesLocation && matchesJobType && matchesWorkPolicy;
    });
  }, [jobs, search, location, jobType, workPolicy]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / JOBS_PER_PAGE));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * JOBS_PER_PAGE;

  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);

  const startJob = filteredJobs.length === 0 ? 0 : startIndex + 1;

  const endJob = Math.min(startIndex + JOBS_PER_PAGE, filteredJobs.length);

  function resetPage() {
    setCurrentPage(1);
  }

  function clearFilters() {
    setSearch("");
    setLocation("all");
    setJobType("all");
    setWorkPolicy("all");
    resetPage();
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);

    document.getElementById("jobs-heading")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const hasActiveFilters =
    Boolean(search) || location !== "all" || jobType !== "all" || workPolicy !== "all";

  return (
    // id="jobs" is the target for the "Find jobs" nav anchor (#jobs).
    // Without this id on the section itself, that link has nothing to scroll to.
    <section id="jobs" className="w-full" aria-labelledby="jobs-heading">
      {/* Header */}
      <div className="mb-6">
        <h2 id="jobs-heading" className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Explore open roles
        </h2>

        <p className="mt-2 text-sm text-slate-600">Find your next opportunity across our companies.</p>
      </div>

      {/* Filters */}
      <div className="mb-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <div>
          <label htmlFor="job-search" className="mb-2 block text-sm font-medium text-slate-700">
            Search jobs
          </label>

          <input
            id="job-search"
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              resetPage();
            }}
            placeholder="Search by job title..."
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div>
          <label htmlFor="job-location" className="mb-2 block text-sm font-medium text-slate-700">
            Location
          </label>

          <select
            id="job-location"
            value={location}
            onChange={(event) => {
              setLocation(event.target.value);
              resetPage();
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="all">All locations</option>

            {locations.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="job-type" className="mb-2 block text-sm font-medium text-slate-700">
            Job type
          </label>

          <select
            id="job-type"
            value={jobType}
            onChange={(event) => {
              setJobType(event.target.value);
              resetPage();
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="all">All job types</option>

            {jobTypes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="job-work-policy" className="mb-2 block text-sm font-medium text-slate-700">
            Work policy
          </label>

          <select
            id="job-work-policy"
            value={workPolicy}
            onChange={(event) => {
              setWorkPolicy(event.target.value);
              resetPage();
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="all">All work policies</option>

            {workPolicies.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div
        className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        aria-live="polite"
      >
        <p className="text-sm text-slate-600">
          {filteredJobs.length === 0 ? (
            "No jobs found"
          ) : (
            <>
              Showing <span className="font-semibold text-slate-900">{startJob}-{endJob}</span> of{" "}
              <span className="font-semibold text-slate-900">{filteredJobs.length}</span> jobs
            </>
          )}
        </p>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-slate-700 underline underline-offset-4 hover:text-slate-950"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Jobs */}
      {paginatedJobs.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedJobs.map((job) => (
            <article
              key={job.id}
              className="flex min-h-[250px] flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* COMPANY NAME */}
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                {job.company_name || "Company"}
              </p>

              {/* JOB TITLE */}
              <h3 className="text-lg font-semibold leading-snug text-slate-900">{job.title}</h3>

              {/* Department */}
              {job.department && <p className="mt-2 text-sm text-slate-600">{job.department}</p>}

              {/* Metadata */}
              <div className="mt-5 flex flex-wrap gap-2">
                {job.location && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {job.location}
                  </span>
                )}

                {job.job_type && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {job.job_type}
                  </span>
                )}

                {job.work_policy && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {job.work_policy}
                  </span>
                )}
              </div>

              {/* View company careers page */}
              <div className="mt-auto pt-6">
                {job.company_slug ? (
                  <Link
                    href={`/${job.company_slug}/careers`}
                    className="inline-flex items-center text-sm font-semibold text-slate-900 underline underline-offset-4 transition hover:text-slate-600"
                  >
                    View role
                    <span aria-hidden="true" className="ml-1">
                      →
                    </span>
                  </Link>
                ) : (
                  <span className="text-sm text-slate-400">Company page unavailable</span>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <h3 className="text-lg font-semibold text-slate-900">No matching jobs</h3>

          <p className="mt-2 text-sm text-slate-600">Try changing your search or filters.</p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {filteredJobs.length > JOBS_PER_PAGE && (
        <>
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Job results pagination">
            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
                const active = page === safeCurrentPage;

                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    aria-current={active ? "page" : undefined}
                    className={`min-w-10 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                      active
                        ? "bg-slate-900 text-white"
                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => goToPage(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </nav>

          <p className="mt-4 text-center text-xs text-slate-500">
            Page {safeCurrentPage} of {totalPages}
          </p>
        </>
      )}
    </section>
  );
}