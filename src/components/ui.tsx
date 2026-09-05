"use client";

import { cx } from "@/lib/utils";
import { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const base =
    "inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "bg-ink text-paper hover:bg-ink-soft",
    secondary: "bg-transparent text-ink border border-ink hover:bg-ink hover:text-paper",
    ghost: "bg-transparent text-ink hover:bg-line/60",
    danger: "bg-transparent text-danger border border-danger/40 hover:bg-danger hover:text-white",
  };
  return <button className={cx(base, variants[variant], className)} {...props} />;
}

export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-slate mt-1.5">{hint}</span> : null}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "w-full border border-line bg-paper-raised px-3 py-2 text-sm text-ink placeholder:text-slate/60 focus:border-ink transition-colors",
        props.className
      )}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cx(
        "w-full border border-line bg-paper-raised px-3 py-2 text-sm text-ink placeholder:text-slate/60 focus:border-ink transition-colors",
        props.className
      )}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cx(
        "w-full border border-line bg-paper-raised px-3 py-2 text-sm text-ink focus:border-ink transition-colors",
        props.className
      )}
    />
  );
}

export function ColorInput({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}) {
  return (
    <div className="flex items-center gap-2 border border-line bg-paper-raised px-3 py-2 focus-within:border-ink">
      <input
        id={id}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-6 w-8 shrink-0 cursor-pointer border-0 bg-transparent p-0"
        aria-label="Pick color"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm text-ink outline-none"
      />
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-sm text-ink"
    >
      <span
        className={cx(
          "relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-ink" : "bg-line"
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 h-4 w-4 rounded-full bg-paper transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5"
          )}
        />
      </span>
      {label}
    </button>
  );
}

export function LabelText(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={cx("text-sm font-medium text-ink", props.className)} />;
}
