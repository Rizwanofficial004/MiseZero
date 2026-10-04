import { WasteBoard } from "@/components/dashboard/waste-board";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { dashboardSummary, getProducts, getWasteEvents, getWasteTrend } from "@/lib/data";

export default function WastePage() {
  return (
    <div>
      <DashboardHeader
        title="Waste & Evidence"
        description="What could not be saved, where it went, and how that compares with the prediction"
      />
      <div className="p-6">
        <WasteBoard
          initialEvents={getWasteEvents()}
          products={getProducts()}
          trend={getWasteTrend()}
          valueProtected={dashboardSummary.valueProtectedThisWeek}
        />
      </div>
    </div>
  );
}
