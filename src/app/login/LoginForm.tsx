"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Field, Input } from "@/components/ui";
import { signIn, signUp } from "./actions";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "signin"
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = mode === "signin" ? await signIn(formData) : await signUp(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (mode === "signup") {
        setNotice("Account created. Redirecting you to set up your company\u2026");
      }
      const redirectTo = searchParams.get("redirectTo");
      router.push(redirectTo || "/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex border-b border-line">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 pb-3 text-sm font-medium ${
            mode === "signin" ? "border-b-2 border-ink text-ink" : "text-slate"
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 pb-3 text-sm font-medium ${
            mode === "signup" ? "border-b-2 border-ink text-ink" : "text-slate"
          }`}
        >
          Create account
        </button>
      </div>

      <form action={handleSubmit} className="space-y-5">
        <Field label="Work email" htmlFor="email">
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          hint={mode === "signup" ? "At least 8 characters." : undefined}
        >
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
        </Field>

        {error ? (
          <p role="alert" className="border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p role="status" className="border border-success/40 bg-success/5 px-3 py-2 text-sm text-success">
            {notice}
          </p>
        ) : null}

        <Button type="submit" variant="primary" className="w-full py-3" disabled={isPending}>
          {isPending ? "Please wait\u2026" : mode === "signin" ? "Log in" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate">
        <Link href="/" className="underline decoration-line underline-offset-4 hover:decoration-ink">
          &larr; Back to home
        </Link>
      </p>
    </div>
  );
}
