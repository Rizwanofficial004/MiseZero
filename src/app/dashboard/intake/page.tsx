import { IntakeBoard } from "@/components/dashboard/intake-board";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";

export default function IntakePage() {
  return (
    <div>
      <DashboardHeader
        title="Smart Intake"
        description="Everyday signals — invoices, deliveries, POS, preparation, voice and targeted checks"
      />
      <div className="p-6">
        <IntakeBoard />
      </div>
    </div>
  );
}
