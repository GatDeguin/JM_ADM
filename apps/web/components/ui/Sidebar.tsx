"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type SidebarItem = {
  label: string;
  href: string;
  icon: keyof typeof icons;
};

const items: SidebarItem[] = [
  { label: "Inicio", href: "/inicio", icon: "home" },
  { label: "Catálogo", href: "/catalogo/productos-base", icon: "grid" },
  { label: "Técnica", href: "/tecnica/formulas", icon: "flask" },
  { label: "Operación", href: "/operacion/produccion", icon: "settings" },
  { label: "Stock", href: "/stock/lotes", icon: "archive" },
  { label: "Abastecimiento", href: "/abastecimiento/proveedores", icon: "truck" },
  { label: "Comercial", href: "/comercial/pedidos", icon: "cart" },
  { label: "Finanzas", href: "/finanzas/tesoreria", icon: "wallet" },
  { label: "Analítica", href: "/analitica/reportes", icon: "chart" },
  { label: "Sistema", href: "/sistema/usuarios", icon: "users" }
];

const icons = {
  home: "M3 10.5L12 3l9 7.5M6.75 9v10.5h10.5V9",
  grid: "M4.5 4.5h6v6h-6zM13.5 4.5h6v6h-6zM4.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z",
  flask: "M9 3h6M10.5 3v5l-5.25 9a2.25 2.25 0 002 3.375h9.5a2.25 2.25 0 002-3.375L13.5 8V3",
  settings:
    "M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm8.5 3.75l-1.9.73a6.9 6.9 0 01-.57 1.37l.82 1.87-1.94 1.94-1.87-.82a6.9 6.9 0 01-1.37.57l-.73 1.9h-2.74l-.73-1.9a6.9 6.9 0 01-1.37-.57l-1.87.82-1.94-1.94.82-1.87a6.9 6.9 0 01-.57-1.37L3.5 12l.73-2.74a6.9 6.9 0 01.57-1.37l-.82-1.87L5.92 4.08l1.87.82c.44-.24.9-.43 1.37-.57l.73-1.9h2.74l.73 1.9c.47.14.93.33 1.37.57l1.87-.82 1.94 1.94-.82 1.87c.24.44.43.9.57 1.37L20.5 12z",
  archive: "M3.75 7.5h16.5v11.25H3.75zm2.25-3h12a1.5 1.5 0 011.5 1.5V7.5H4.5V6a1.5 1.5 0 011.5-1.5zm3.75 7.5h4.5",
  truck: "M1.5 6.75h12v8.25h-12zm12 3h4.5l2.25 2.25v3h-1.5a2.25 2.25 0 11-4.5 0h-3.75m-4.5 0a2.25 2.25 0 11-4.5 0",
  cart: "M3 4.5h2.25l2.25 10.5h9.75l2.25-7.5H6.75M9 19.5a.75.75 0 110 1.5.75.75 0 010-1.5zm8.25 0a.75.75 0 110 1.5.75.75 0 010-1.5z",
  wallet: "M3 6.75h18v10.5H3zm0 3h18M15.75 12h2.25",
  chart: "M4.5 18.75V5.25m6 13.5V9.75m6 9V12.75M3 20.25h18",
  users: "M7.5 11.25a3 3 0 100-6 3 3 0 000 6zm9 1.5a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM2.25 18a5.25 5.25 0 0110.5 0m1.5 0a3.75 3.75 0 017.5 0"
} as const;

function SidebarIcon({ icon }: { icon: SidebarItem["icon"] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0"
      aria-hidden="true"
    >
      <path d={icons[icon]} />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [pill, setPill] = useState({ top: 0, height: 0, visible: false });

  useEffect(() => {
    const syncPill = () => {
      const activeItem = items.find((item) => pathname.startsWith(item.href));
      if (!activeItem) {
        setPill((prev) => ({ ...prev, visible: false }));
        return;
      }

      const activeEl = itemRefs.current[activeItem.href];
      const navEl = navRef.current;
      if (!activeEl || !navEl) return;

      const top = activeEl.offsetTop;
      const height = activeEl.offsetHeight;
      setPill({ top, height, visible: true });
    };

    syncPill();
    window.addEventListener("resize", syncPill);
    return () => window.removeEventListener("resize", syncPill);
  }, [pathname]);

  return (
    <aside className="hidden w-64 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 md:block">
      <h1 className="mb-4 text-lg font-bold tracking-tight">JM ADM</h1>
      <nav ref={navRef} className="relative space-y-1" aria-label="Navegación principal">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 rounded-lg bg-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_7px_18px_rgba(0,0,0,0.22)] transition-[top,height,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] dark:bg-zinc-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_24px_rgba(0,0,0,0.35)]"
          style={{
            top: `${pill.top}px`,
            height: `${pill.height}px`,
            opacity: pill.visible ? 1 : 0
          }}
        />

        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              ref={(el) => {
                itemRefs.current[item.href] = el;
              }}
              aria-current={active ? "page" : undefined}
              className={`relative z-10 flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-[color,background-color,transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-state ${
                active
                  ? "text-white dark:text-zinc-900"
                  : "text-zinc-700 hover:-translate-y-px hover:bg-zinc-100/65 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_5px_14px_rgba(0,0,0,0.08)] dark:text-zinc-200 dark:hover:bg-zinc-800/60 dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_6px_16px_rgba(0,0,0,0.28)]"
              }`}
            >
              <SidebarIcon icon={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
