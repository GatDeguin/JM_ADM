"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavGroup = {
  title: string;
  items: Array<{ label: string; href: string; badge?: number }>;
};

const navGroups: NavGroup[] = [
  {
    title: "",
    items: [
      { label: "Inicio", href: "/inicio" },
      { label: "Alertas", href: "/inicio/alertas", badge: 6 },
      { label: "Búsqueda Global", href: "/buscar" }
    ]
  },
  {
    title: "CATÁLOGO",
    items: [
      { label: "Productos y SKUs", href: "/catalogo/skus" },
      { label: "Presentaciones", href: "/catalogo/presentaciones" },
      { label: "Fórmulas", href: "/tecnica/formulas" },
      { label: "Insumos", href: "/tecnica/insumos" },
      { label: "Alias / Homologación", href: "/catalogo/alias" }
    ]
  },
  {
    title: "OPERACIÓN",
    items: [
      { label: "Producción", href: "/operacion/produccion" },
      { label: "Lotes", href: "/operacion/historial-lotes" },
      { label: "Fraccionamiento", href: "/operacion/fraccionamiento" },
      { label: "Control de Calidad", href: "/operacion/calidad" }
    ]
  },
  {
    title: "STOCK",
    items: [
      { label: "Balance", href: "/stock/balance" },
      { label: "Movimientos", href: "/stock/movimientos" },
      { label: "Inventarios", href: "/stock/inventarios" }
    ]
  },
  {
    title: "COMERCIAL",
    items: [
      { label: "Pedidos", href: "/comercial/pedidos" },
      { label: "Clientes", href: "/comercial/clientes" },
      { label: "Listas de Precios", href: "/comercial/listas" },
      { label: "Despachos", href: "/comercial/despachos" }
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-[330px] shrink-0 flex-col bg-[#17153f] text-white md:flex">
      <div className="border-b border-white/10 px-7 py-7">
        <p className="text-[52px] font-extrabold leading-none tracking-tight">Cosmetix</p>
        <p className="mt-2 text-xl text-[#ba9dff]">Gestión Integral de Producción</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {navGroups.map((group, groupIndex) => (
          <div key={`${group.title}-${groupIndex}`} className="mb-5">
            {group.title ? <p className="mb-2 px-4 text-base font-semibold tracking-[0.1em] text-[#a4a7cf]">{group.title}</p> : null}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-[28px] transition ${
                      active ? "bg-[#5f3fd5] font-semibold" : "text-[#f4f4ff] hover:bg-white/10"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge ? <span className="rounded-full bg-[#ff3b5b] px-2.5 py-0.5 text-base font-bold">{item.badge}</span> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-5">
        <button className="w-full rounded-xl border border-[#4f4f87] bg-[#1d1b4b] px-4 py-3 text-left text-[28px]">← Colapsar</button>
      </div>
    </aside>
  );
}
