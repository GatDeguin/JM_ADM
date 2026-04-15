"use client";

export type MobileStickyCTAProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  error?: string | null;
  helperText?: string;
  className?: string;
};

export function MobileStickyCTA({ label, onClick, disabled, loading, error, helperText, className }: MobileStickyCTAProps) {
  return (
    <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95 md:hidden ${className ?? ""}`}>
      {error ? <p className="mb-2 rounded border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p> : null}
      <button type="button" className="btn-primary w-full" disabled={disabled || loading} onClick={onClick}>
        {loading ? "Procesando..." : label}
      </button>
      {helperText ? <p className="mt-1 text-center text-xs text-zinc-500 dark:text-zinc-400">{helperText}</p> : null}
    </div>
  );
}
