"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("fran@cosmetix.io");
  const [password, setPassword] = useState("demo1234");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) return;
    router.push("/inicio");
  };

  return (
    <main className="min-h-screen bg-[#f2f2f4] p-3 md:p-4">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1600px] overflow-hidden rounded-[28px] border border-[#e4e5ee] bg-white shadow-[0_12px_40px_rgba(10,16,45,0.08)] md:min-h-[calc(100vh-2rem)]">
        <section className="relative hidden w-[57%] overflow-hidden bg-[#1c134d] text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_30%,rgba(148,117,255,0.28),transparent_44%),radial-gradient(circle_at_25%_80%,rgba(117,98,238,0.24),transparent_36%)]" />
          <div className="relative z-10 h-full px-14 py-16">
            <h1 className="text-6xl font-extrabold tracking-tight">Cosmetix</h1>
            <p className="mt-2 text-2xl text-[#b299ff]">Gestión Integral de Producción</p>

            <h2 className="mt-16 max-w-2xl text-7xl font-semibold leading-[1.05] tracking-tight">
              Controlá tu producción <span className="text-[#a67cff]">de principio a fin</span>
            </h2>
            <div className="mt-7 h-1.5 w-20 rounded-full bg-[#8f63ff]" />
            <p className="mt-7 max-w-2xl text-3xl leading-relaxed text-[#ddd8ff]">
              Gestioná fórmulas, materias primas, producción por lotes, fraccionamiento, inventario y ventas desde una única plataforma.
            </p>

            <div className="mt-12 space-y-7 text-2xl">
              {[
                ["Recetario y Fórmulas", "Gestioná tus fórmulas y variantes"],
                ["Producción por Lotes", "Planificá y registrá cada lote"],
                ["Inventario Inteligente", "Controlá stock y materias primas"],
                ["Reportes y Trazabilidad", "Tomá decisiones con datos confiables"]
              ].map(([title, desc]) => (
                <div key={title} className="flex items-center gap-5">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl border border-[#6240be] bg-[#2c1f68] text-[#cbb6ff]">◻</div>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-[#ccc4f5]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 flex max-w-xl items-center gap-4 rounded-3xl border border-[#644db0] bg-[#5a43ac66] px-7 py-5">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#7b5be0] text-3xl">✓</div>
              <div>
                <p className="text-3xl font-semibold">Trazabilidad completa</p>
                <p className="text-xl text-[#d7cef7]">Desde la materia prima hasta el producto final.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center px-6 py-10 md:px-10">
          <div className="w-full max-w-[620px] rounded-[22px] border border-[#d8dae4] bg-[#fdfdfe] px-7 py-8 shadow-[0_8px_18px_rgba(26,31,57,0.04)] md:px-10 md:py-12">
            <div className="mx-auto mb-4 grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-[#8051ec] to-[#5b3dc9] text-5xl text-white">⚗</div>
            <h3 className="text-center text-6xl font-semibold tracking-tight text-[#1f2344]">Bienvenido</h3>
            <p className="mt-3 text-center text-2xl text-[#6e7390]">Ingresá a tu cuenta para continuar</p>

            <form className="mt-12 space-y-7" onSubmit={onSubmit}>
              <label className="block space-y-3">
                <span className="text-3xl font-medium text-[#20253f]">Correo electrónico</span>
                <input
                  className="h-16 w-full rounded-xl border border-[#d2d5e2] bg-white px-5 text-2xl text-[#1e2342] placeholder:text-[#a4a8ba]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@empresa.com"
                  type="email"
                  required
                />
              </label>

              <label className="block space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-medium text-[#20253f]">Contraseña</span>
                  <button type="button" className="text-xl text-[#7a4ef0] hover:underline">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <input
                  className="h-16 w-full rounded-xl border border-[#d2d5e2] bg-white px-5 text-2xl tracking-[0.3em] text-[#1e2342]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                />
              </label>

              <button
                className="mt-2 h-16 w-full rounded-xl bg-gradient-to-r from-[#6f43dc] to-[#7f4fe7] text-3xl font-semibold text-white shadow-[0_10px_20px_rgba(108,62,210,0.25)] transition hover:brightness-110"
                type="submit"
              >
                Ingresar
              </button>

              <div className="flex items-center gap-4 py-1 text-xl text-[#747a95]">
                <span className="h-px flex-1 bg-[#d5d8e5]" />o<span className="h-px flex-1 bg-[#d5d8e5]" />
              </div>

              <button type="button" className="h-16 w-full rounded-xl border border-[#d2d5e2] bg-white text-2xl font-medium text-[#4f556f]">
                Ingresar con otro usuario
              </button>
            </form>

            <p className="mt-12 text-center text-xl text-[#727892]">© 2024 Cosmetix. Todos los derechos reservados.</p>
            <p className="mt-2 text-center text-xl text-[#727892]">Versión 1.0.0</p>
          </div>
        </section>
      </div>
    </main>
  );
}
