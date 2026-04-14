"use client";
export function BottomTabs(){const items=["Inicio","Operación","Catálogo","Comercial","Finanzas","Más"];return <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t grid grid-cols-6 text-xs">{items.map(i=><div key={i} className="p-3 text-center">{i}</div>)}</div>;}
