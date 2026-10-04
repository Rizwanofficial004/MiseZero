"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { IntakeRecord } from "@/lib/data";
import { intakeSourceLabels } from "@/lib/labels";
import { formatCurrency } from "@/lib/utils";
import { Camera, FileSpreadsheet, Mic, ScanLine, Scale, Upload, Utensils } from "lucide-react";

const sourceIcons = {
  invoice: ScanLine,
  delivery_note: Camera,
  manual: ScanLine,
  scale: Scale,
  pos_export: FileSpreadsheet,
  voice: Mic,
  preparation: Utensils,
  waste: ScanLine,
  confirmation: ScanLine,
};

export function IntakeBoard({ records }: { records: IntakeRecord[] }) {
  const [lines, setLines] = useState(records);

  const confirmLine = (recordId: string, product: string) => {
    setLines((current) =>
      current.map((record) => {
        if (record.id !== recordId) return record;
        const extractedLines = record.extractedLines.map((line) =>
          line.product === product ? { ...line, needsConfirmation: false, confidence: 100 } : line,
        );
        const stillOpen = extractedLines.some((line) => line.needsConfirmation);
        return { ...record, extractedLines, status: stillOpen ? record.status : "confirmed" };
      }),
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-2">
        <CaptureTile icon={<Upload className="h-5 w-5" />} title="Documents & images" detail="Invoices, delivery notes, labels, photos and barcodes are reviewed on this page." />
        <Link href="/dashboard/staff-inputs" className="rounded-2xl border border-mint-300 bg-mint-50 px-4 py-4 transition hover:border-mint-400">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint-600 text-white">
            <Mic className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-semibold text-ink">Manual & Staff Inputs</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            Prepared batch records, waste capture, stock confirmations, and voice notes. Open the capture screen.
          </p>
        </Link>
      </div>

      <Card className="border-mint-200 bg-mint-50/70">
        <CardContent className="p-4 text-sm text-ink">
          <p className="font-semibold">Capture → Extract → Validate → Normalise → Pass to the decision engines</p>
          <p className="mt-1 text-ink-muted">
            Low-confidence fields stay highlighted until someone confirms them. A single check corrects the line without retyping the document.
          </p>
        </CardContent>
      </Card>

      {lines.map((record) => {
        const Icon = sourceIcons[record.source];
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
                      <h3 className="font-medium text-ink">{record.supplier ?? intakeSourceLabels[record.source]}</h3>
                      <Badge variant={record.status === "review" ? "warning" : "success"}>{record.status}</Badge>
                    </div>
                    <p className="text-sm text-ink-muted">
                      {record.uploadedAt}
                      {record.fileName && ` · ${record.fileName}`}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-ink-muted">
                      <th className="pb-2 pr-4">Product</th>
                      <th className="pb-2 pr-4">Quantity</th>
                      <th className="pb-2 pr-4">Unit cost</th>
                      <th className="pb-2 pr-4">Confidence</th>
                      <th className="pb-2">Check</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.extractedLines.map((line) => (
                      <tr key={`${record.id}-${line.product}`} className="border-t border-mint-100">
                        <td className="py-2 pr-4">
                          <p className="font-medium text-ink">{line.product}</p>
                          {line.prompt && <p className="text-xs text-ink-muted">{line.prompt}</p>}
                        </td>
                        <td className="py-2 pr-4 text-ink-muted">
                          {line.quantity} {line.unit}
                        </td>
                        <td className="py-2 pr-4 text-ink-muted">
                          {line.unitCost ? formatCurrency(line.unitCost) : "—"}
                        </td>
                        <td className="py-2 pr-4">
                          <Badge variant="confidence" confidence={line.confidence}>
                            {line.confidence}%
                          </Badge>
                        </td>
                        <td className="py-2">
                          {line.needsConfirmation ? (
                            <Button size="sm" variant="outline" onClick={() => confirmLine(record.id, line.product)}>
                              Confirm
                            </Button>
                          ) : (
                            <span className="text-xs text-ink-muted">Confirmed</span>
                          )}
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
  );
}

function CaptureTile({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-mint-200 bg-white px-4 py-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint-100 text-mint-700">{icon}</div>
      <p className="mt-3 text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-xs text-ink-muted">{detail}</p>
    </div>
  );
}
