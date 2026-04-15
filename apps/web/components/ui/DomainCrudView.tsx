"use client";

import { Layout } from "@/components/layout";
import { PageHeader } from "@/components/ui/PageHeader";

type DomainCrudViewProps = {
  title: string;
  subtitle: string;
  domain: string;
};

export function DomainCrudView({ title, subtitle, domain }: DomainCrudViewProps) {
  return (
    <Layout title={title} transitionPreset="elevate-in">
      <PageHeader title={title} subtitle={subtitle} />
      <section className="card-base space-y-3 text-sm">
        <p>
          Esta vista quedó como <strong>fallback de demo</strong>. El flujo productivo debe usar una página
          específica por dominio en <code>apps/web/components/&lt;dominio&gt;/</code>.
        </p>
        <p>
          Dominio solicitado: <code>{domain}</code>
        </p>
      </section>
    </Layout>
  );
}
