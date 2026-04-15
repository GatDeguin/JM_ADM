"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Inicio", href: "/inicio" },
  { label: "Operación", href: "/operacion/produccion" },
  { label: "Catálogo", href: "/catalogo/productos-base" },
  { label: "Comercial", href: "/comercial/pedidos" },
  { label: "Finanzas", href: "/finanzas/tesoreria" },
  { label: "Más", href: "/buscar" }
] as const;

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación móvil"
      className="glass-bg shadow-soft fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-zinc-200 text-xs backdrop-blur motion-overlay dark:border-zinc-800 md:hidden"
    >
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`group relative isolate flex min-h-14 touch-manipulation flex-col items-center justify-center overflow-hidden px-2 py-3 text-center antialiased transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] motion-state ${
              active
                ? "bg-white/65 font-semibold text-zinc-950 delay-75 dark:bg-zinc-900/65 dark:text-zinc-50"
                : "text-zinc-700 delay-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-4 top-1 h-0.5 origin-center rounded-full bg-sky-500 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                active ? "scale-x-100 opacity-100" : "scale-x-50 opacity-0"
              }`}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full bg-zinc-900/10 opacity-0 transition duration-500 ease-out group-active:scale-105 group-active:opacity-100 dark:bg-zinc-100/10"
            />
            <span className="relative z-10 tracking-[0.01em]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
