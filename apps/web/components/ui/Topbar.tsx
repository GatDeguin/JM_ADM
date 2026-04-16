"use client";

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#e4e6ee] bg-white px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex h-14 w-full max-w-2xl items-center rounded-xl border border-[#d6d9e4] bg-[#fafbff] px-4 text-[#666c84]">
          <span className="mr-3 text-2xl">⌕</span>
          <input
            className="w-full bg-transparent text-lg outline-none placeholder:text-[#7f8398]"
            placeholder="Buscar productos, lotes, clientes, fórmulas..."
          />
          <span className="rounded-md border border-[#d8dce8] bg-white px-2 py-0.5 text-sm">⌘ K</span>
        </div>

        <div className="flex items-center gap-3 text-[#2a2f4b]">
          <button className="grid h-11 w-11 place-items-center rounded-xl hover:bg-[#f3f4fa]">🔔</button>
          <button className="grid h-11 w-11 place-items-center rounded-xl hover:bg-[#f3f4fa]">📋</button>
          <div className="ml-2 flex items-center gap-3 rounded-xl px-2 py-1 hover:bg-[#f3f4fa]">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#5e4bd4] font-semibold text-white">FR</span>
            <div className="leading-tight">
              <p className="text-base font-semibold">Fran</p>
              <p className="text-sm text-[#6a708b]">Administrador</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
