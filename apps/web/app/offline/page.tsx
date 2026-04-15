import Link from "next/link";

const KEY_ROUTES = [
  { href: "/", label: "Inicio general" },
  { href: "/inicio", label: "Módulo de inicio" },
  { href: "/buscar", label: "Buscador" },
  { href: "/comercial/pedidos", label: "Comercial / Pedidos" },
];

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-5 px-6 py-12">
      <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">Modo sin conexión</h1>
      <p className="text-zinc-700 dark:text-zinc-300">
        No logramos conectarnos al servidor. Aun así, podés acceder a estas vistas clave que quedan disponibles desde la caché local.
      </p>
      <ul className="grid gap-3">
        {KEY_ROUTES.map((route) => (
          <li key={route.href}>
            <Link
              className="inline-flex rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
              href={route.href}
            >
              {route.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
