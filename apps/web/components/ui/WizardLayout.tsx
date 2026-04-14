"use client";

import type { ReactNode } from "react";
type WizardLayoutProps = {
  title: string;
  steps: Array<{ id: string; label: string }>;
  currentStep: string;
  loading?: boolean;
  error?: string | null;
  onStepChange?: (step: string) => void;
  children: ReactNode;
};

export function WizardLayout({ title, steps, currentStep, loading, error, onStepChange, children }: WizardLayoutProps) {
  if (loading) return <div className="rounded-xl border bg-white p-3 text-sm text-zinc-500">Cargando wizard...</div>;
  if (error) return <div className="rounded-xl border bg-white p-3 text-sm text-red-600">{error}</div>;

  return (
    <section className="rounded-xl border bg-white p-4">
      <h3 className="mb-3 font-semibold">{title}</h3>
      <div className="mb-4 flex flex-wrap gap-2">
        {steps.map((step, index) => (
          <button
            key={step.id}
            className={`rounded-full border px-3 py-1 text-sm ${currentStep === step.id ? "bg-zinc-900 text-white" : "bg-white"}`}
            onClick={() => onStepChange?.(step.id)}
          >
            {index + 1}. {step.label}
          </button>
        ))}
      </div>
      {children}
    </section>
  );
}
