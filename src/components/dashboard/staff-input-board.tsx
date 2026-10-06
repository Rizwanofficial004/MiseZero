"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AiBadge } from "@/components/ui/ai-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { wasteReasonLabels } from "@/lib/labels";
import type { WasteReason } from "@/lib/data";
import { formatVenue } from "@/lib/dates";
import { structureVoice } from "@/services/aiService";
import { confirmStock, recordPrep } from "@/services/inventoryService";
import { recordWaste } from "@/services/wasteService";
import { useDemo } from "@/services/useDemo";
import { useMiseStore } from "@/store/useMiseStore";
import type { CatalogProduct } from "@/store/types";
import { ClipboardCheck, Mic, Trash2, UtensilsCrossed } from "lucide-react";

const kinds = [
  { id: "prepared_batch", label: "Prepared batch records", detail: "Batches and opened packs the POS never sees", icon: UtensilsCrossed },
  { id: "waste", label: "Waste capture records", detail: "What left the kitchen, and why", icon: Trash2 },
  { id: "stock_confirmation", label: "Stock confirmations", detail: "A short check only when the decision needs it", icon: ClipboardCheck },
  { id: "voice", label: "Voice input / notes", detail: "Say what happened. MiseZero turns it into a record", icon: Mic },
] as const;

type Kind = (typeof kinds)[number]["id"];
type NamedProduct = { id: string; name: string; unit: string };

const reasons = Object.keys(wasteReasonLabels) as WasteReason[];

export function StaffInputBoard() {
  const demo = useDemo();
  const toast = useToast();
  const [kind, setKind] = useState<Kind>("prepared_batch");
  const [pending, setPending] = useState(false);
  const products = demo.products;
  const prompts = demo.views.filter((view) => view.confirmationRequired).slice(0, 8);

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

  const records = [
    ...demo.preps.map((item) => ({
      id: item.id,
      at: item.date,
      kind: "prepared_batch" as const,
      summary: item.note || "Prepared batch",
      productName: products.find((product) => product.id === item.productId)?.name ?? "Product",
      quantity: item.qty,
      unit: item.unit,
      status: "passed_to_intake" as const,
    })),
    ...demo.waste.map((item) => ({
      id: item.id,
      at: item.date,
      kind: "waste" as const,
      summary: item.note || "Waste recorded",
      productName: products.find((product) => product.id === item.productId)?.name ?? "Product",
      quantity: item.qty,
      unit: item.unit,
      status: "passed_to_intake" as const,
    })),
    ...demo.confirmations.map((item) => ({
      id: item.id,
      at: item.date,
      kind: "stock_confirmation" as const,
      summary: "Stock confirmation",
      productName: products.find((product) => product.id === item.productId)?.name ?? "Product",
      quantity: item.qty,
      unit: item.unit,
      status: "passed_to_intake" as const,
    })),
    ...demo.voiceNotes.map((item) => ({
      id: item.id,
      at: item.at,
      kind: "voice" as const,
      summary: item.text,
      productName: item.productName,
      quantity: item.qty ?? undefined,
      unit: item.unit ?? undefined,
      status: item.status,
    })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kinds.map((item) => {
          const Icon = item.icon;
          const selected = kind === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setKind(item.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                selected ? "border-mint-400 bg-mint-50 ring-2 ring-mint-100" : "border-mint-200 bg-white hover:border-mint-300"
              }`}
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${selected ? "bg-mint-600 text-white" : "bg-mint-100 text-mint-700"}`}>
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <p className="mt-3 text-sm font-semibold text-ink">{item.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">{item.detail}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardContent className="p-5">
            {kind === "prepared_batch" && (
              <BatchForm
                products={products}
                pending={pending}
                onSave={(productId, qty, note) => void run(() => recordPrep(productId, qty, note), "Batch recorded")}
              />
            )}
            {kind === "waste" && (
              <WasteForm
                products={products}
                pending={pending}
                onSave={(productId, qty, reason) =>
                  void run(() => recordWaste({ productId, qty, reason, destination: "disposal", note: wasteReasonLabels[reason] }), "Waste recorded")
                }
              />
            )}
            {kind === "stock_confirmation" && (
              <ConfirmForm
                prompts={prompts.map((view) => ({
                  id: view.productId,
                  productName: view.productName,
                  unit: view.unit,
                  suggested: view.math.expected,
                  estimateLabel: `${Math.round(view.math.low * 10) / 10}–${Math.round(view.math.high * 10) / 10} ${view.unit}`,
                  deadline: view.actBy ? formatVenue(view.actBy, demo.venue.timezone) : "No deadline",
                  reason: view.flags.join(", ").replaceAll("_", " "),
                }))}
                pending={pending}
                onConfirm={(productId, quantity) => void run(() => confirmStock(productId, Number(quantity)), "Stock confirmation saved")}
              />
            )}
            {kind === "voice" && (
              <VoiceForm
                products={products}
                pending={pending}
                onSave={(text) =>
                  void run(async () => {
                    const draft = structureVoice(text, products);
                    useMiseStore.getState().addVoice({
                      id: `voice_${Date.now()}`,
                      text,
                      at: new Date().toISOString(),
                      productId: draft.productId,
                      productName: draft.productName,
                      qty: draft.qty,
                      unit: draft.unit,
                      event: draft.event,
                      status: draft.status,
                    });
                    if (draft.status === "passed_to_intake" && draft.productId && draft.qty) {
                      if (draft.event === "Waste") {
                        await recordWaste({ productId: draft.productId, qty: draft.qty, reason: "other", destination: "disposal", note: text });
                      } else if (draft.event === "Stock count") {
                        await confirmStock(draft.productId, draft.qty, draft.unit ?? undefined);
                      } else {
                        await recordPrep(draft.productId, draft.qty, text);
                      }
                    }
                  }, "Voice note saved")
                }
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-ink">Passed to Smart Intake</h2>
              <Badge variant="success">{records.length}</Badge>
            </div>
            <p className="mt-1 text-sm text-ink-muted">Each note becomes a structured event and updates stock when it has a quantity.</p>
            {records.length === 0 && <p className="mt-4 text-sm text-ink-muted">No staff records yet.</p>}
            <ul className="mt-4 space-y-3">
              {records.slice(0, 20).map((record) => (
                <li key={record.id} className="rounded-xl border border-mint-100 px-3 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-ink">{record.summary}</p>
                    <Badge>{record.kind.replaceAll("_", " ")}</Badge>
                    <Badge variant={record.status === "passed_to_intake" ? "success" : "warning"}>
                      {record.status === "passed_to_intake" ? "Passed to intake" : "Needs review"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    {formatVenue(record.at, demo.venue.timezone)} · {record.productName}
                    {record.quantity !== undefined ? ` · ${record.quantity} ${record.unit ?? ""}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BatchForm({
  products,
  pending,
  onSave,
}: {
  products: NamedProduct[];
  pending: boolean;
  onSave: (productId: string, qty: number, note: string) => void;
}) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("Prepared for the lunch batch");
  const product = products.find((item) => item.id === productId);

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const qty = Number(quantity);
        if (!product || qty <= 0) return;
        onSave(product.id, qty, note);
      }}
    >
      <FormTitle title="Prepared batch record" detail="Log what was made or opened. This quantity is subtracted from that product." />
      <Field label="Product or batch">
        <select className="input-field" value={productId} onChange={(event) => setProductId(event.target.value)}>
          {products.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </Field>
      <Field label={`Quantity (${product?.unit ?? "units"})`}>
        <input className="input-field" value={quantity} onChange={(event) => setQuantity(event.target.value)} inputMode="decimal" />
      </Field>
      <Field label="Note">
        <input className="input-field" value={note} onChange={(event) => setNote(event.target.value)} />
      </Field>
      <Button type="submit" disabled={pending}>Save batch record</Button>
    </form>
  );
}

function WasteForm({
  products,
  pending,
  onSave,
}: {
  products: NamedProduct[];
  pending: boolean;
  onSave: (productId: string, qty: number, reason: WasteReason) => void;
}) {
  const [productId, setProductId] = useState(products.find((item) => item.name === "Avocado")?.id ?? products[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState<WasteReason>("damage");
  const product = products.find((item) => item.id === productId);

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const qty = Number(quantity);
        if (!product || qty <= 0) return;
        onSave(product.id, qty, reason);
      }}
    >
      <FormTitle title="Waste capture record" detail="A short kitchen record of what was lost. The evidence pack keeps the full trail." />
      <Field label="Product">
        <select className="input-field" value={productId} onChange={(event) => setProductId(event.target.value)}>
          {products.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </Field>
      <Field label={`Quantity (${product?.unit ?? "units"})`}>
        <input className="input-field" value={quantity} onChange={(event) => setQuantity(event.target.value)} inputMode="decimal" />
      </Field>
      <Field label="Reason">
        <select className="input-field" value={reason} onChange={(event) => setReason(event.target.value as WasteReason)}>
          {reasons.map((item) => (
            <option key={item} value={item}>{wasteReasonLabels[item]}</option>
          ))}
        </select>
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>Save waste record</Button>
        <Link href="/dashboard/waste" className="text-sm font-medium text-mint-700 hover:underline">Open the evidence pack</Link>
      </div>
    </form>
  );
}

function ConfirmForm({
  prompts,
  pending,
  onConfirm,
}: {
  prompts: Array<{ id: string; productName: string; unit: string; suggested: number; estimateLabel: string; deadline: string; reason: string }>;
  pending: boolean;
  onConfirm: (productId: string, quantity: string) => void;
}) {
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  if (prompts.length === 0) {
    return (
      <div>
        <FormTitle title="Stock confirmations" detail="No checks are waiting. MiseZero only asks when a confirmation would change the decision." />
        <p className="rounded-xl bg-mint-50 px-3 py-3 text-sm text-ink">All prompted checks for today are done.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <FormTitle title="Stock confirmation" detail="Count only the item in front of you. The rest of the stock estimate stays a range." />
      {prompts.map((prompt) => (
        <form
          key={prompt.id}
          className="rounded-xl border border-mint-200 p-3"
          onSubmit={(event) => {
            event.preventDefault();
            onConfirm(prompt.id, quantities[prompt.id] ?? String(Math.round(prompt.suggested * 100) / 100));
          }}
        >
          <p className="text-sm font-semibold text-ink">{prompt.productName}</p>
          <p className="mt-1 text-xs text-ink-muted">Estimate {prompt.estimateLabel} · needed by {prompt.deadline}</p>
          <p className="mt-2 text-sm text-ink">{prompt.reason}</p>
          <input
            className="input-field mt-3 max-w-40"
            value={quantities[prompt.id] ?? String(Math.round(prompt.suggested * 100) / 100)}
            onChange={(event) => setQuantities((current) => ({ ...current, [prompt.id]: event.target.value }))}
            inputMode="decimal"
          />
          <Button size="sm" className="mt-3" type="submit" disabled={pending}>Confirm stock</Button>
        </form>
      ))}
    </div>
  );
}

function VoiceForm({
  products,
  pending,
  onSave,
}: {
  products: CatalogProduct[];
  pending: boolean;
  onSave: (text: string) => void;
}) {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const draft = transcript.trim() ? structureVoice(transcript, products) : null;
  const examples = ["Wasted 6 avocados", "Opened second 2-litre cream carton", "Counted 4.9 L fresh cream"];

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!transcript.trim()) return;
    onSave(transcript.trim());
    setTranscript("");
  };

  return (
    <form className="space-y-3" onSubmit={save}>
      <div className="flex items-center gap-2">
        <FormTitle title="Voice input" detail="Type a kitchen event, or play a sample note. The beta parser fills product, quantity, and event. You still press save." />
      </div>
      <AiBadge />
      <div className="flex flex-wrap gap-2">
        {examples.map((example) => (
          <button key={example} type="button" onClick={() => setTranscript(example)} className="rounded-full border border-mint-200 bg-mint-50 px-3 py-1 text-left text-xs text-ink hover:border-mint-400">
            {example}
          </button>
        ))}
      </div>
      <textarea className="input-field min-h-24" value={transcript} onChange={(event) => setTranscript(event.target.value)} placeholder="Opened second 2-litre cream carton" />
      <div className="rounded-xl bg-mint-50 px-3 py-3 text-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Structured result</p>
        {draft ? (
          <p className="mt-1 text-ink">
            {draft.event} · {draft.productName}
            {draft.qty !== null ? ` · ${draft.qty} ${draft.unit ?? ""}` : ""} · {draft.status === "passed_to_intake" ? "Ready" : "Needs review"}
          </p>
        ) : (
          <p className="mt-1 text-ink-muted">Pick a phrase or type what you would say.</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>Save voice note</Button>
        <Button
          type="button"
          variant="outline"
          disabled={listening}
          onClick={() => {
            setListening(true);
            window.setTimeout(() => {
              setTranscript(examples[1] ?? "");
              setListening(false);
            }, 900);
          }}
        >
          <Mic className="h-3.5 w-3.5" />
          {listening ? "Listening…" : "Play a sample note"}
        </Button>
      </div>
    </form>
  );
}

function FormTitle({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mb-1">
      <h2 className="font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-ink-muted">{detail}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm text-ink">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}
