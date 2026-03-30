import { Suspense } from "react";
import { SimulatorPanel } from "@/components/simulator-panel";

export default function SimulatorPage() {
  return (
    <Suspense fallback={<div className="empty-state">Đang tải trình mô phỏng...</div>}>
      <SimulatorPanel />
    </Suspense>
  );
}
