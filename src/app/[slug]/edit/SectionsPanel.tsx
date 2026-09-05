"use client";

import { useState, useTransition } from "react";
import type { Section } from "@/types/domain";
import { Button, Field, Input, Textarea, Toggle } from "@/components/ui";
import {
  addSection,
  deleteSection,
  reorderSections,
  toggleSectionVisibility,
  updateSection,
} from "./actions";

export function SectionsPanel({ slug, sections }: { slug: string; sections: Section[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(sections[0]?.id ?? null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      const result = await addSection(slug);
      if (result.error) setError(result.error);
    });
  }

  function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const reordered = [...sections];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    startTransition(async () => {
      await reorderSections(
        slug,
        reordered.map((s) => s.id)
      );
    });
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-ink">Sections</h2>
          <p className="mt-1 text-sm text-slate">
            Tell your story. Reorder with the arrows, hide a section without deleting it.
          </p>
        </div>
        <Button variant="primary" onClick={handleAdd} disabled={isPending}>
          Add section
        </Button>
      </div>

      {error ? <p className="border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}

      {sections.length === 0 ? (
        <p className="border border-dashed border-line p-6 text-center text-sm text-slate">
          No sections yet. Add &ldquo;About Us&rdquo; or &ldquo;Life at the Company&rdquo; to get started.
        </p>
      ) : (
        <ul className="space-y-3">
          {sections.map((section, index) => (
            <SectionRow
              key={section.id}
              slug={slug}
              section={section}
              isFirst={index === 0}
              isLast={index === sections.length - 1}
              isExpanded={expandedId === section.id}
              onToggleExpand={() => setExpandedId(expandedId === section.id ? null : section.id)}
              onMoveUp={() => handleMove(index, -1)}
              onMoveDown={() => handleMove(index, 1)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function SectionRow({
  slug,
  section,
  isFirst,
  isLast,
  isExpanded,
  onToggleExpand,
  onMoveUp,
  onMoveDown,
}: {
  slug: string;
  section: Section;
  isFirst: boolean;
  isLast: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [visible, setVisible] = useState(section.is_visible);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave(formData: FormData) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateSection(slug, section.id, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  }

  function handleVisibility(next: boolean) {
    setVisible(next);
    startTransition(async () => {
      await toggleSectionVisibility(slug, section.id, next);
    });
  }

  function handleDelete() {
    if (!confirm(`Delete "${section.title}"? This can't be undone.`)) return;
    startTransition(async () => {
      await deleteSection(slug, section.id);
    });
  }

  return (
    <li className="border border-line bg-paper-raised">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex flex-col">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label="Move section up"
            className="text-slate hover:text-ink disabled:opacity-30"
          >
            &uarr;
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label="Move section down"
            className="text-slate hover:text-ink disabled:opacity-30"
          >
            &darr;
          </button>
        </div>
        <button type="button" onClick={onToggleExpand} className="flex-1 text-left">
          <p className="font-medium text-ink">{section.title || "Untitled section"}</p>
          <p className="truncate text-xs text-slate">{section.body || "No content yet"}</p>
        </button>
        <Toggle checked={visible} onChange={handleVisibility} label={visible ? "Shown" : "Hidden"} />
        <Button variant="danger" onClick={handleDelete} disabled={isPending}>
          Delete
        </Button>
      </div>

      {isExpanded ? (
        <form action={handleSave} className="space-y-4 border-t border-line px-4 py-4">
          <Field label="Title" htmlFor={`title-${section.id}`}>
            <Input id={`title-${section.id}`} name="title" defaultValue={section.title} required />
          </Field>
          <Field label="Content" htmlFor={`body-${section.id}`}>
            <Textarea id={`body-${section.id}`} name="body" defaultValue={section.body} rows={5} />
          </Field>
          <Field label="Image URL" htmlFor={`image-${section.id}`} hint="Optional.">
            <Input id={`image-${section.id}`} name="image_url" defaultValue={section.image_url} placeholder="https://\u2026" />
          </Field>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {saved && !error ? <p className="text-sm text-success">Saved.</p> : null}
          <Button type="submit" variant="secondary" disabled={isPending}>
            {isPending ? "Saving\u2026" : "Save section"}
          </Button>
        </form>
      ) : null}
    </li>
  );
}
