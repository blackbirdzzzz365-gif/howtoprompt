import { Suspense } from "react";
import { SimulatorPanel } from "@/components/simulator-panel";

export default function SimulatorPage() {
  return (
    <Suspense fallback={<div className="empty-state">Dang tai simulator...</div>}>
      <SimulatorPanel />
    </Suspense>
  );
}
