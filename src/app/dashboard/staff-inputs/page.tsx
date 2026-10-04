import { StaffInputBoard } from "@/components/dashboard/staff-input-board";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";

export default function StaffInputsPage() {
  return (
    <div>
      <DashboardHeader
        title="Manual & Staff Inputs"
        description="Prepared batches, waste records, stock confirmations, and voice notes — the kitchen signals invoices and POS do not capture"
      />
      <div className="p-6">
        <StaffInputBoard />
      </div>
    </div>
  );
}
