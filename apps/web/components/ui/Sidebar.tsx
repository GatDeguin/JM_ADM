"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Inicio", href: "/inicio" },
  { label: "Catálogo", href: "/catalogo/productos-base" },
  { label: "Técnica", href: "/tecnica/formulas" },
  { label: "Operación", href: "/operacion/produccion" },
  { label: "Stock", href: "/stock/lotes" },
  { label: "Abastecimiento", href: "/abastecimiento/proveedores" },
  { label: "Comercial", href: "/comercial/pedidos" },
  { label: "Finanzas", href: "/finanzas/tesoreria" },
  { label: "Analítica", href: "/analitica/reportes" },
  { label: "Sistema", href: "/sistema/usuarios" }
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:block">
      <h1 className="mb-4 text-lg font-bold tracking-tight">JM ADM</h1>
      <nav className="space-y-1" aria-label="Navegación principal">
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
