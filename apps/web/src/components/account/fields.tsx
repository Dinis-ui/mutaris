"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/cn";

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
}

function FieldShell({
  id,
  label,
  hint,
  error,
  className,
  children,
}: FieldShellProps & { id: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-foreground">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, hint?: string, error?: string) {
  if (error) return `${id}-error`;
  return hint ? `${id}-hint` : undefined;
}

export function TextField({
  label,
  hint,
  error,
  className,
  ...props
}: FieldShellProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = React.useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} className={className}>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...props}
      />
    </FieldShell>
  );
}

export function TextareaField({
  label,
  hint,
  error,
  className,
  ...props
}: FieldShellProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = React.useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} className={className}>
      <Textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  hint,
  error,
  className,
  children,
  ...props
}: FieldShellProps & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const id = React.useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} className={className}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className="h-12 w-full appearance-none rounded-lg border border-border bg-input px-4 pr-11 text-base text-foreground [color-scheme:dark] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_option]:bg-popover [&_option]:text-foreground"
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>
    </FieldShell>
  );
}
