"use client";

import { useState, useTransition } from "react";
import { Button, Field, Input } from "@/components/ui";
import { createCompany } from "./actions";

export function NewCompanyForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createCompany(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Field label="Company name" htmlFor="name" hint="You can change this later.">
          <Input id="name" name="name" placeholder="Acme Robotics" required autoFocus />
        </Field>
      </div>
      <Button type="submit" variant="primary" disabled={isPending} className="py-2.5">
        {isPending ? "Creating\u2026" : "Create careers page"}
      </Button>
      {error ? <p className="text-sm text-danger sm:ml-2">{error}</p> : null}
    </form>
  );
}
