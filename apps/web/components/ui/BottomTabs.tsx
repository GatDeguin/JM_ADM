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
    <nav aria-label="Navegación móvil" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-zinc-200 bg-white/95 text-xs shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`px-2 py-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 ${
              active ? "font-semibold text-zinc-900" : "text-zinc-500"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
