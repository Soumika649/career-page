"use client";

import { useMemo, useState, useTransition } from "react";
import type { Job } from "@/types/domain";
import { Button, Input } from "@/components/ui";
import { addJob, deleteJob, updateJob } from "./actions";
import { JobForm } from "./JobForm";

export function JobsPanel({ slug, jobs }: { slug: string; jobs: Job[] }) {
  const [query, setQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((j) =>
      [j.title, j.department, j.location].join(" ").toLowerCase().includes(q)
    );
  }, [jobs, query]);

  function handleDelete(jobId: string, title: string) {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    startTransition(async () => {
      await deleteJob(slug, jobId);
    });
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">Jobs</h2>
          <p className="mt-1 text-sm text-slate">{jobs.length} role{jobs.length === 1 ? "" : "s"} on your page</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddForm((v) => !v)}>
          {showAddForm ? "Close" : "Add job"}
        </Button>
      </div>

      {showAddForm ? (
        <div className="border border-line bg-paper-raised p-5">
          <JobForm
            submitLabel="Add job"
            onCancel={() => setShowAddForm(false)}
            onSubmit={async (formData) => {
              const result = await addJob(slug, formData);
              if (!result.error) setShowAddForm(false);
              return result;
            }}
          />
        </div>
      ) : null}

      {jobs.length > 0 ? (
        <Input
          placeholder="Search your jobs by title, department or location\u2026"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search jobs"
        />
      ) : null}

      {jobs.length === 0 ? (
        <p className="border border-dashed border-line p-6 text-center text-sm text-slate">
          No jobs yet. Add your first open role above.
        </p>
      ) : filtered.length === 0 ? (
        <p className="border border-dashed border-line p-6 text-center text-sm text-slate">
          No jobs match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <ul className="divide-y divide-line border border-line bg-paper-raised">
          {filtered.map((job) => (
            <li key={job.id}>
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{job.title}</p>
                  <p className="truncate text-xs text-slate">
                    {[job.department, job.location, job.work_policy].filter(Boolean).join(" \u00b7 ")}
                    {!job.is_open ? " \u00b7 Closed" : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="ghost" onClick={() => setEditingId(editingId === job.id ? null : job.id)}>
                    {editingId === job.id ? "Close" : "Edit"}
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(job.id, job.title)} disabled={isPending}>
                    Delete
                  </Button>
                </div>
              </div>
              {editingId === job.id ? (
                <div className="border-t border-line px-4 py-4">
                  <JobForm
                    job={job}
                    submitLabel="Save job"
                    onCancel={() => setEditingId(null)}
                    onSubmit={(formData) => updateJob(slug, job.id, formData)}
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
