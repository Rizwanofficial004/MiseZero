import { WasteBoard } from "@/components/dashboard/waste-board";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";

export default function WastePage() {
  return (
    <div>
      <DashboardHeader
        title="Waste & Evidence"
        description="What could not be saved, where it went, and the outcomes of completed actions"
      />
      <div className="p-6">
        <WasteBoard />
      </div>
    </div>
  );
}
