"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Company, Job, Section } from "@/types/domain";
import { Button } from "@/components/ui";
import { togglePublish } from "./actions";
import { BrandPanel } from "./BrandPanel";
import { SectionsPanel } from "./SectionsPanel";
import { JobsPanel } from "./JobsPanel";

type Tab = "brand" | "sections" | "jobs";

export function EditorClient({
  company,
  sections,
  jobs,
}: {
  company: Company;
  sections: Section[];
  jobs: Job[];
}) {
  const [tab, setTab] = useState<Tab>("brand");
  const [isPublished, setIsPublished] = useState(company.is_published);
  const [isPending, startTransition] = useTransition();
  const [publishError, setPublishError] = useState<string | null>(null);

  function handlePublishToggle() {
    setPublishError(null);
    const next = !isPublished;
    startTransition(async () => {
      const result = await togglePublish(company.slug, next);
      if (result.error) {
        setPublishError(result.error);
        return;
      }
      setIsPublished(next);
    });
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "brand", label: "Brand" },
    { id: "sections", label: "Sections" },
    { id: "jobs", label: "Jobs" },
  ];

  return (
    <div className="min-h-screen bg-paper">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper-raised px-6 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-slate hover:text-ink">
            &larr; Companies
          </Link>
          <span aria-hidden className="text-line">
            |
          </span>
          <p className="font-display text-lg text-ink">{company.name}</p>
        </div>
        <div className="flex items-center gap-3">
          {publishError ? <span className="text-sm text-danger">{publishError}</span> : null}
          <span
            className={`text-xs font-medium ${isPublished ? "text-success" : "text-slate"}`}
          >
            {isPublished ? "Live" : "Draft \u2014 only you can see this"}
          </span>
          <Link href={`/${company.slug}/preview`} target="_blank">
            <Button variant="ghost">Preview</Button>
          </Link>
          <Button variant={isPublished ? "secondary" : "primary"} onClick={handlePublishToggle} disabled={isPending}>
            {isPending ? "Saving\u2026" : isPublished ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8 md:flex-row md:px-8">
        <nav className="flex shrink-0 gap-1 overflow-x-auto md:w-48 md:flex-col md:gap-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap px-4 py-2.5 text-left text-sm font-medium transition-colors md:px-3 ${
                tab === t.id ? "bg-ink text-paper" : "text-ink-soft hover:bg-line/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          {tab === "brand" ? <BrandPanel company={company} /> : null}
          {tab === "sections" ? <SectionsPanel slug={company.slug} sections={sections} /> : null}
          {tab === "jobs" ? <JobsPanel slug={company.slug} jobs={jobs} /> : null}
        </div>
      </div>
    </div>
  );
}
