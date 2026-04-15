import { Suspense } from "react";
import { NewSaleWizardPage } from "@/components/sales/NewSaleWizardPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NewSaleWizardPage />
    </Suspense>
  );
}
