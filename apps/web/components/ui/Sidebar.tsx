"use client";
export function Sidebar(){const items=["Inicio","Catálogo","Técnica","Operación","Stock","Abastecimiento","Comercial","Finanzas","Analítica","Sistema"];return <aside className="hidden md:block w-64 border-r bg-white p-4"><h1 className="font-semibold mb-4">JM ADM</h1><nav className="space-y-2">{items.map(i=><div key={i} className="text-sm text-zinc-600">{i}</div>)}</nav></aside>;}
