import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/ui/PageHeader";
import { KPIStatCard } from "@/components/ui/KPIStatCard";
import { DataTable } from "@/components/ui/DataTable";

export default function Page(){
 return <Layout title="Catalogo · Presentaciones"><PageHeader title="Catalogo · Presentaciones" subtitle="Gestión operativa integrada"/><div className="grid md:grid-cols-3 gap-3 mb-4"><KPIStatCard label="Registros" value={128}/><KPIStatCard label="Pendientes" value={7}/><KPIStatCard label="Estado" value="Operativo"/></div><DataTable/></Layout>
}
