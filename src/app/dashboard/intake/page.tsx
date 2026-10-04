import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { intakeRecords } from "@/lib/data/demo";
import { formatCurrency } from "@/lib/utils";
import { Camera, FileSpreadsheet, ScanLine, Scale, Upload } from "lucide-react";

const sourceIcons = {
  invoice: ScanLine,
  delivery_note: Camera,
  manual: ScanLine,
  scale: Scale,
  pos_export: FileSpreadsheet,
};

const statusStyles = {
  processed: "success",
  review: "warning",
  confirmed: "success",
  failed: "warning",
} as const;

export default function IntakePage() {
  return (
    <div>
      <DashboardHeader
        title="Smart Intake"
        description="Invoices, delivery notes, scale weights, and POS exports — confidence-scored extraction"
      />
      <div className="p-6">
        <Card className="border-dashed border-2 border-mint-200 bg-mint-50/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Upload className="h-10 w-10 text-mint-500" strokeWidth={1.5} />
            <p className="mt-4 font-medium text-ink">Upload invoice, delivery note, or POS export</p>
            <p className="mt-2 max-w-md text-sm text-ink-muted">
              Upload a document and we’ll extract products, quantities, delivery times, and confidence scores for review.
            </p>
            <Button className="mt-6" variant="outline">Choose file</Button>
          </CardContent>
        </Card>

        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-ink-muted">
          Recent intake
        </h2>
        <div className="mt-4 space-y-4">
          {intakeRecords.map((record) => {
            const Icon = sourceIcons[record.source];
            const statusVariant = statusStyles[record.status];
            return (
              <Card key={record.id}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint-100 text-mint-700">
                        <Icon className="h-5 w-5" strokeWidth={1.7} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium text-ink">
                            {record.supplier ?? record.source.replace("_", " ")}
                          </h3>
                          <Badge variant={statusVariant}>{record.status}</Badge>
                        </div>
                        <p className="text-sm text-ink-muted">
                          {record.uploadedAt}
                          {record.fileName && ` · ${record.fileName}`}
                        </p>
                      </div>
                    </div>
                    {record.status === "review" && (
                      <Button size="sm">Review extraction</Button>
                    )}
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-ink-muted">
                          <th className="pb-2 pr-4">Product</th>
                          <th className="pb-2 pr-4">Quantity</th>
                          <th className="pb-2 pr-4">Unit cost</th>
                          <th className="pb-2">Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.extractedLines.map((line) => (
                          <tr key={`${record.id}-${line.product}`} className="border-t border-mint-100">
                            <td className="py-2 pr-4 font-medium text-ink">{line.product}</td>
                            <td className="py-2 pr-4 text-ink-muted">
                              {line.quantity} {line.unit}
                              {line.deliveryTime && (
                                <span className="text-xs text-ink-muted"> · {line.deliveryTime}</span>
                              )}
                            </td>
                            <td className="py-2 pr-4 text-ink-muted">
                              {line.unitCost ? formatCurrency(line.unitCost) : "—"}
                            </td>
                            <td className="py-2">
                              <Badge variant="confidence" confidence={line.confidence}>
                                {line.confidence}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
