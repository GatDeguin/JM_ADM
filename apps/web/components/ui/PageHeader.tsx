"use client";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="space-y-1">
      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
      {subtitle ? <p className="max-w-3xl text-sm text-muted md:text-base">{subtitle}</p> : null}
    </header>
  );
}
