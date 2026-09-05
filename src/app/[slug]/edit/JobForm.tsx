"use client";

import { useState, useTransition } from "react";
import type { Job } from "@/types/domain";
import { Button, Field, Input, Select, Textarea, Toggle } from "@/components/ui";

const WORK_POLICIES = ["Remote", "Hybrid", "On-site"];
const EMPLOYMENT_TYPES = ["Full time", "Part time", "Contract"];
const JOB_TYPES = ["Permanent", "Temporary", "Internship"];

export function JobForm({
  job,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  job?: Job;
  onSubmit: (formData: FormData) => Promise<{ error?: string }>;
  onCancel?: () => void;
  submitLabel: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(job?.is_open ?? true);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    if (isOpen) formData.set("is_open", "on");
    startTransition(async () => {
      const result = await onSubmit(formData);
      if (result?.error) setError(result.error);
    });
  }

  const idPrefix = job?.id ?? "new";

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Job title" htmlFor={`title-${idPrefix}`}>
          <Input id={`title-${idPrefix}`} name="title" defaultValue={job?.title} required />
        </Field>
        <Field label="Department" htmlFor={`department-${idPrefix}`}>
          <Input id={`department-${idPrefix}`} name="department" defaultValue={job?.department} />
        </Field>
        <Field label="Location" htmlFor={`location-${idPrefix}`}>
          <Input id={`location-${idPrefix}`} name="location" defaultValue={job?.location} placeholder="City, Country" />
        </Field>
        <Field label="Salary range" htmlFor={`salary-${idPrefix}`}>
          <Input id={`salary-${idPrefix}`} name="salary_range" defaultValue={job?.salary_range} placeholder="e.g. $80K\u2013100K / year" />
        </Field>
        <Field label="Work policy" htmlFor={`work-${idPrefix}`}>
          <Select id={`work-${idPrefix}`} name="work_policy" defaultValue={job?.work_policy ?? "Remote"}>
            {WORK_POLICIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </Select>
        </Field>
        <Field label="Employment type" htmlFor={`emp-${idPrefix}`}>
          <Select id={`emp-${idPrefix}`} name="employment_type" defaultValue={job?.employment_type ?? "Full time"}>
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Job type" htmlFor={`type-${idPrefix}`}>
          <Select id={`type-${idPrefix}`} name="job_type" defaultValue={job?.job_type ?? "Permanent"}>
            {JOB_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Experience level" htmlFor={`exp-${idPrefix}`}>
          <Input id={`exp-${idPrefix}`} name="experience_level" defaultValue={job?.experience_level} placeholder="e.g. Mid-level" />
        </Field>
      </div>

      <Field label="Description" htmlFor={`desc-${idPrefix}`} hint="Optional \u2014 shown when a candidate opens the role.">
        <Textarea id={`desc-${idPrefix}`} name="description" defaultValue={job?.description} rows={4} />
      </Field>

      <Toggle checked={isOpen} onChange={setIsOpen} label={isOpen ? "Open for applications" : "Closed"} />

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? "Saving\u2026" : submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
