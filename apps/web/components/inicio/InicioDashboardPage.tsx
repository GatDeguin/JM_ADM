"use client";

import { Layout } from "@/components/layout";

const metrics = [
  { title: "Producción hoy", value: "13", foot: "18% vs ayer", color: "#6c59e5" },
  { title: "Lotes en proceso", value: "5", foot: "2 en QC", color: "#3474ff" },
  { title: "Stock crítico", value: "24", foot: "Ver detalles", color: "#ff8f2b" },
  { title: "Pedidos por despachar", value: "12", foot: "Ver detalles", color: "#26b468" },
  { title: "Cobros vencidos", value: "$ 2.350.000", foot: "12 clientes", color: "#ef4d67" },
  { title: "Caja y bancos", value: "$ 5.780.500", foot: "Saldo disponible", color: "#1aa35d" }
];

const bars = [900, 1200, 800, 1500, 1050, 600, 1000];

export function InicioDashboardPage() {
  return (
    <Layout title="Inicio" transitionPreset="soft-fade">
      <div className="space-y-6">
        <section className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#171c39]">¡Bienvenido, Fran! 👋</h1>
            <p className="mt-1 text-lg text-[#6d738d]">Aquí tienes un resumen de lo que está pasando en tu empresa hoy.</p>
          </div>
          <button className="rounded-xl bg-[#6842dc] px-8 py-3 text-xl font-semibold text-white">＋ Nueva</button>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-6">
          {metrics.map((metric) => (
            <article key={metric.title} className="rounded-2xl border border-[#e4e6f0] bg-white p-5 shadow-[0_3px_14px_rgba(28,32,60,0.06)]">
              <p className="text-lg text-[#232949]">{metric.title}</p>
              <p className="mt-2 text-4xl font-bold text-[#1b2142]">{metric.value}</p>
              <p className="mt-2 text-lg" style={{ color: metric.color }}>
                {metric.foot}
              </p>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <article className="rounded-2xl border border-[#e4e6f0] bg-white p-5 xl:col-span-4">
            <h2 className="text-3xl font-semibold text-[#1a1f3d]">Producción del día</h2>
            <div className="mt-6 flex items-center justify-center">
              <div className="grid h-64 w-64 place-items-center rounded-full bg-[conic-gradient(#32b67a_0_38%,#4d7de8_38%_76%,#ff8b2e_76%_91%,#7f68ec_91%_99%,#f16382_99%_100%)]">
                <div className="grid h-44 w-44 place-items-center rounded-full bg-white text-center">
                  <p className="text-5xl font-bold text-[#1a1f3e]">13</p>
                  <p className="text-lg text-[#69708c]">lotes totales</p>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-[#edf3ff] p-4 text-lg text-[#2d5fd7]">Buen ritmo de producción. Llevas 18% más lotes terminados que ayer.</div>
          </article>

          <article className="rounded-2xl border border-[#e4e6f0] bg-white p-5 xl:col-span-4">
            <h2 className="text-3xl font-semibold text-[#1a1f3d]">Actividad reciente</h2>
            <ul className="mt-4 space-y-3">
              {[
                ["Lote 122 liberado", "Hoy, 11:30"],
                ["Pedido #PED-0456 confirmado", "Hoy, 10:15"],
                ["Cobro registrado", "Hoy, 09:20"],
                ["Precio actualizado", "Ayer, 16:45"],
                ["Nuevo insumo recibido", "Ayer, 14:30"]
              ].map(([title, time]) => (
                <li key={title} className="flex items-center justify-between rounded-xl border border-[#eceef5] px-4 py-3">
                  <p className="text-lg font-medium text-[#1f2545]">{title}</p>
                  <span className="text-base text-[#69708c]">{time}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-[#e4e6f0] bg-white p-5 xl:col-span-4">
            <h2 className="text-3xl font-semibold text-[#1a1f3d]">Alertas importantes</h2>
            <ul className="mt-4 space-y-3">
              {[
                "6 alias sin homologar",
                "5 SKUs sin precio",
                "3 lotes en QC pendientes",
                "2 insumos con stock bajo"
              ].map((alert) => (
                <li key={alert} className="rounded-xl border border-[#eceef5] px-4 py-4 text-lg font-medium text-[#252b4d]">
                  {alert}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <article className="rounded-2xl border border-[#e4e6f0] bg-white p-5 xl:col-span-6">
            <h2 className="mb-4 text-3xl font-semibold text-[#1a1f3d]">Próximas tareas</h2>
            <div className="overflow-hidden rounded-xl border border-[#eaedf5]">
              <table className="w-full text-left">
                <thead className="bg-[#f7f8fc] text-base text-[#69708c]">
                  <tr>
                    <th className="px-3 py-2">Tarea</th>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Fecha</th>
                    <th className="px-3 py-2">Responsable</th>
                    <th className="px-3 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {["Recepción de insumos", "Control de calidad Lote 128", "Pago a proveedor", "Despacho pedido #PED-0448", "Inventario general"].map((task, idx) => (
                    <tr key={task} className="border-t border-[#edf0f7] text-base text-[#232a4a]">
                      <td className="px-3 py-2">{task}</td>
                      <td className="px-3 py-2">Operación</td>
                      <td className="px-3 py-2">Hoy, 14:00</td>
                      <td className="px-3 py-2">Fran</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-lg px-2 py-1 ${idx < 2 ? "bg-[#ffeacc] text-[#a26400]" : "bg-[#e7efff] text-[#2856bf]"}`}>
                          {idx < 2 ? "Pendiente" : "Programada"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-2xl border border-[#e4e6f0] bg-white p-5 xl:col-span-6">
            <h2 className="text-3xl font-semibold text-[#1a1f3d]">Ventas (últimos 7 días)</h2>
            <div className="mt-6 flex h-[320px] items-end justify-between gap-4 rounded-xl border border-[#eceef6] px-4 pb-4 pt-8">
              {bars.map((value, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full max-w-[54px] rounded-t-md bg-[#6f54dd]" style={{ height: `${value / 6}px` }} />
                  <span className="text-sm text-[#6c738f]">0{index + 1} Abr</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <footer className="pb-4 text-center text-base text-[#7a809a]">© 2024 Cosmetix. Todos los derechos reservados. Versión 1.0.0</footer>
      </div>
    </Layout>
  );
}
