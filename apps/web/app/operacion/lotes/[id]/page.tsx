import { CloseBatchPage } from "@/components/production/CloseBatchPage";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "LOT-001" }, { id: "LOT-002" }, { id: "LOT-003" }];
}

export default async function BatchDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CloseBatchPage batchId={id} />;
}
