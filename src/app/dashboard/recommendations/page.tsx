import { RescueBoard } from "@/components/dashboard/rescue-board";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { getRecommendations } from "@/lib/data";

export default function RecommendationsPage() {
  return (
    <div>
      <DashboardHeader
        title="Rescue Optimiser"
        description="Feasible responses compared for commercial value, inside the safety window"
      />
      <div className="p-6">
        <RescueBoard recommendations={getRecommendations()} />
      </div>
    </div>
  );
}
