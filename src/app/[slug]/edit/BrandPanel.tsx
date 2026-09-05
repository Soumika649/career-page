"use client";

import { useState, useTransition } from "react";
import type { Company } from "@/types/domain";
import { Button, ColorInput, Field, Input } from "@/components/ui";
import { updateBranding } from "./actions";

export function BrandPanel({ company }: { company: Company }) {
  const [primary, setPrimary] = useState(company.primary_color);
  const [accent, setAccent] = useState(company.accent_color);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    formData.set("primary_color", primary);
    formData.set("accent_color", accent);
    startTransition(async () => {
      const result = await updateBranding(company.slug, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <form action={handleSubmit} className="max-w-xl space-y-6 border border-line bg-paper-raised p-6">
      <div>
        <h2 className="font-display text-xl text-ink">Brand</h2>
        <p className="mt-1 text-sm text-slate">
          This is what candidates see first &mdash; your name, story and colors.
        </p>
      </div>

      <Field label="Company name" htmlFor="name">
        <Input id="name" name="name" defaultValue={company.name} required />
      </Field>

      <Field label="Tagline" htmlFor="tagline" hint="One short line under your name.">
        <Input id="tagline" name="tagline" defaultValue={company.tagline} maxLength={140} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Primary color" htmlFor="primary_color">
          <ColorInput id="primary_color" value={primary} onChange={setPrimary} />
        </Field>
        <Field label="Accent color" htmlFor="accent_color">
          <ColorInput id="accent_color" value={accent} onChange={setAccent} />
        </Field>
      </div>

      <Field label="Logo URL" htmlFor="logo_url" hint="A direct link to a square logo image.">
        <Input id="logo_url" name="logo_url" defaultValue={company.logo_url} placeholder="https://\u2026" />
      </Field>

      <Field label="Banner image URL" htmlFor="banner_url" hint="A wide image for the top of your page.">
        <Input id="banner_url" name="banner_url" defaultValue={company.banner_url} placeholder="https://\u2026" />
      </Field>

      <Field
        label="Culture video URL"
        htmlFor="culture_video_url"
        hint="A YouTube or Vimeo link, shown on your careers page."
      >
        <Input
          id="culture_video_url"
          name="culture_video_url"
          defaultValue={company.culture_video_url}
          placeholder="https://\u2026"
        />
      </Field>

      {error ? <p className="border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p> : null}
      {saved && !error ? (
        <p className="border border-success/40 bg-success/5 px-3 py-2 text-sm text-success">Saved.</p>
      ) : null}

      <Button type="submit" variant="primary" disabled={isPending}>
        {isPending ? "Saving\u2026" : "Save changes"}
      </Button>
    </form>
  );
}
