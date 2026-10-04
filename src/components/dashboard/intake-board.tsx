"use client";

import Link from "next/link";
import { useState } from "react";
import { AiBadge } from "@/components/ui/ai-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { readBlob } from "@/lib/files";
import { formatCurrency } from "@/lib/utils";
import { confirmDelivery, deleteDelivery, importInvoiceFile, saveManualDelivery, updateDeliveryLines } from "@/services/invoiceService";
import { addManualSale, confirmSales, previewSalesCsv } from "@/services/salesService";
import { useDemo } from "@/services/useDemo";
import type { DeliveryLine } from "@/store/types";
import type { ParsedSale, RowError } from "@/engine/csv";
import { FileSpreadsheet, Mic, Upload } from "lucide-react";

export function IntakeBoard() {
  const demo = useDemo();
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [salesText, setSalesText] = useState("date,item,qty\n");
  const [salesRows, setSalesRows] = useState<ParsedSale[]>([]);
  const [salesErrors, setSalesErrors] = useState<RowError[]>([]);
  const [manualItem, setManualItem] = useState(demo.recipes[0]?.menuItemName ?? "");
  const [manualQty, setManualQty] = useState("1");
  const [supplierName, setSupplierName] = useState(demo.suppliers[0]?.name ?? "");
  const [lineProduct, setLineProduct] = useState(demo.products[0]?.id ?? "");
  const [lineQty, setLineQty] = useState("1");
  const [lineUseBy, setLineUseBy] = useState("");
  const [draftLines, setDraftLines] = useState<DeliveryLine[]>([]);

  const run = async (work: () => Promise<void>, success: string) => {
    setPending(true);
    try {
      await work();
      toast.push(success);
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "Could not save that", "error");
    } finally {
      setPending(false);
    }
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setExtracting(true);
    try {
      const delivery = await importInvoiceFile(file);
      if (delivery.fileId && !file.name.toLowerCase().endsWith(".csv")) {
        const stored = await readBlob(delivery.fileId);
        if (stored) setPreviewUrl(URL.createObjectURL(stored.blob));
      }
      toast.push(file.name.toLowerCase().endsWith(".csv") ? "Invoice CSV ready to review" : "Extraction ready to review");
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "Upload failed", "error");
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-2">
        <label className="rounded-2xl border border-dashed border-mint-200 bg-white px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-mint-100 text-mint-700">
            <Upload className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-semibold text-ink">Documents & images</p>
          <p className="mt-1 text-xs text-ink-muted">
            CSV is parsed on this page. PDF and photos are stored, then a beta extractor fills an editable table. Nothing hits stock until you confirm.
          </p>
          <span className="mt-3 inline-flex"><AiBadge /></span>
          <input
            className="mt-3 block text-xs"
            type="file"
            accept=".csv,application/pdf,image/*"
            onChange={(event) => void onFile(event.target.files?.[0])}
          />
          {extracting && <p className="mt-2 text-sm text-mint-700">Extracting…</p>}
        </label>
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

      {previewUrl && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-ink">File preview</p>
            <iframe title="Uploaded file" src={previewUrl} className="mt-3 h-64 w-full rounded-xl border border-mint-100" />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5">
          <h2 className="font-semibold text-ink">Manual delivery</h2>
          <p className="mt-1 text-sm text-ink-muted">Saved as a draft. Confirm it below before it changes stock.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <label className="text-sm text-ink md:col-span-2">
              Supplier
              <input className="input-field mt-1" value={supplierName} onChange={(event) => setSupplierName(event.target.value)} />
            </label>
            <label className="text-sm text-ink">
              Product
              <select className="input-field mt-1" value={lineProduct} onChange={(event) => setLineProduct(event.target.value)}>
                {demo.products.map((product) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm text-ink">
              Quantity
              <input className="input-field mt-1" value={lineQty} onChange={(event) => setLineQty(event.target.value)} inputMode="decimal" />
            </label>
            <label className="text-sm text-ink">
              Use-by
              <input className="input-field mt-1" type="date" value={lineUseBy} onChange={(event) => setLineUseBy(event.target.value)} />
            </label>
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const product = demo.products.find((item) => item.id === lineProduct);
                  const qty = Number(lineQty);
                  if (!product || qty <= 0 || !lineUseBy) {
                    toast.push("Product, quantity, and use-by are required", "error");
                    return;
                  }
                  setDraftLines((current) => [
                    ...current,
                    {
                      id: `draft_${current.length}`,
                      productId: product.id,
                      productName: product.name,
                      qty,
                      unit: product.unit,
                      unitCost: product.unitCost,
                      batch: "",
                      useBy: new Date(lineUseBy).toISOString(),
                    },
                  ]);
                }}
              >
                Add line
              </Button>
            </div>
          </div>
          {draftLines.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-ink-muted">
              {draftLines.map((line) => (
                <li key={line.id}>{line.productName} · {line.qty} {line.unit}</li>
              ))}
            </ul>
          )}
          <Button
            className="mt-3"
            disabled={pending}
            onClick={() =>
              void run(async () => {
                await saveManualDelivery({
                  supplierId: demo.suppliers.find((item) => item.name === supplierName)?.id ?? "",
                  supplierName,
                  date: new Date().toISOString(),
                  lines: draftLines,
                });
                setDraftLines([]);
              }, "Draft delivery saved")
            }
          >
            Save draft
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-mint-700" />
            <h2 className="font-semibold text-ink">Sales CSV</h2>
          </div>
          <p className="mt-1 text-sm text-ink-muted">Columns: date, item, qty. Item names must match a recipe. Bad rows stay out of stock.</p>
          <textarea className="input-field mt-3 min-h-28 font-mono text-xs" value={salesText} onChange={(event) => setSalesText(event.target.value)} />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() =>
                void run(async () => {
                  const parsed = await previewSalesCsv(salesText);
                  setSalesRows(parsed.rows);
                  setSalesErrors(parsed.errors);
                }, "Preview ready")
              }
            >
              Preview
            </Button>
            <Button type="button" disabled={pending || salesRows.length === 0} onClick={() => void run(() => confirmSales(salesRows), "Sales imported")}>
              Confirm import
            </Button>
          </div>
          {salesErrors.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-rose-700">
              {salesErrors.map((error) => (
                <li key={`${error.row}-${error.message}`}>Row {error.row}: {error.message}</li>
              ))}
            </ul>
          )}
          {salesRows.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-ink-muted">
              {salesRows.slice(0, 8).map((row) => (
                <li key={`${row.date}-${row.menuItemName}`}>{row.menuItemName} · {row.qty}</li>
              ))}
            </ul>
          )}
          <form
            className="mt-4 grid gap-3 border-t border-mint-100 pt-4 md:grid-cols-3"
            onSubmit={(event) => {
              event.preventDefault();
              void run(() => addManualSale({ menuItemName: manualItem, qty: Number(manualQty), date: new Date().toISOString() }), "Sale recorded");
            }}
          >
            <label className="text-sm text-ink">
              Menu item
              <select className="input-field mt-1" value={manualItem} onChange={(event) => setManualItem(event.target.value)}>
                {demo.recipes.map((recipe) => (
                  <option key={recipe.id}>{recipe.menuItemName}</option>
                ))}
              </select>
            </label>
            <label className="text-sm text-ink">
              Quantity
              <input className="input-field mt-1" value={manualQty} onChange={(event) => setManualQty(event.target.value)} inputMode="decimal" />
            </label>
            <div className="flex items-end">
              <Button type="submit" variant="outline" disabled={pending}>Add manual sale</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {demo.deliveries.map((record) => (
        <Card key={record.id}>
          <CardContent className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-ink">{record.supplierName || "Delivery"}</h3>
                  <Badge variant={record.status === "draft" ? "warning" : "success"}>{record.status}</Badge>
                  {record.source === "ocr" && <AiBadge />}
                </div>
                <p className="text-sm text-ink-muted">
                  {new Date(record.date).toLocaleString("en-GB")}
                  {record.fileName ? ` · ${record.fileName}` : ""}
                </p>
              </div>
              {record.status === "draft" && (
                <div className="flex gap-2">
                  <Button size="sm" disabled={pending} onClick={() => void run(() => confirmDelivery(record.id), "Delivery confirmed. Stock updated.")}>
                    Confirm
                  </Button>
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => void run(() => deleteDelivery(record.id), "Draft deleted")}>
                    Delete
                  </Button>
                </div>
              )}
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-ink-muted">
                    <th className="pb-2 pr-4">Product</th>
                    <th className="pb-2 pr-4">Quantity</th>
                    <th className="pb-2 pr-4">Unit cost</th>
                    <th className="pb-2">Use-by</th>
                  </tr>
                </thead>
                <tbody>
                  {record.lines.map((line) => (
                    <tr key={line.id} className="border-t border-mint-100">
                      <td className="py-2 pr-4">
                        {record.status === "draft" ? (
                          <select
                            className="input-field"
                            value={line.productId}
                            onChange={(event) => {
                              const product = demo.products.find((item) => item.id === event.target.value);
                              const lines = record.lines.map((item) =>
                                item.id === line.id
                                  ? { ...item, productId: product?.id ?? "", productName: product?.name ?? item.productName, unit: product?.unit ?? item.unit }
                                  : item,
                              );
                              void updateDeliveryLines(record.id, lines);
                            }}
                          >
                            <option value="">Match a product</option>
                            {demo.products.map((product) => (
                              <option key={product.id} value={product.id}>{product.name}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="font-medium text-ink">{line.productName}</p>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-ink-muted">
                        {record.status === "draft" ? (
                          <input
                            className="input-field max-w-28"
                            defaultValue={line.qty}
                            onBlur={(event) => {
                              const lines = record.lines.map((item) => (item.id === line.id ? { ...item, qty: Number(event.target.value) } : item));
                              void updateDeliveryLines(record.id, lines);
                            }}
                          />
                        ) : (
                          `${line.qty} ${line.unit}`
                        )}
                      </td>
                      <td className="py-2 pr-4 text-ink-muted">{line.unitCost ? formatCurrency(line.unitCost) : "—"}</td>
                      <td className="py-2 text-ink-muted">{line.useBy ? new Date(line.useBy).toLocaleDateString("en-GB") : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
