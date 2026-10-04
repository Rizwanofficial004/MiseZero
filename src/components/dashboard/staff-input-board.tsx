"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Product, StaffInputKind, StaffInputRecord, StockCheckPrompt, WasteReason } from "@/lib/data";
import { wasteReasonLabels } from "@/lib/labels";
import { ClipboardCheck, Mic, Trash2, UtensilsCrossed } from "lucide-react";

const kinds: Array<{ id: StaffInputKind; label: string; detail: string; icon: typeof Mic }> = [
  { id: "prepared_batch", label: "Prepared batch records", detail: "Batches and opened packs the POS never sees", icon: UtensilsCrossed },
  { id: "waste", label: "Waste capture records", detail: "What left the kitchen, and why", icon: Trash2 },
  { id: "stock_confirmation", label: "Stock confirmations", detail: "A short check only when the decision needs it", icon: ClipboardCheck },
  { id: "voice", label: "Voice input / notes", detail: "Say what happened. MiseZero turns it into a record", icon: Mic },
];

const kindLabels: Record<StaffInputKind, string> = {
  prepared_batch: "Prepared batch",
  waste: "Waste capture",
  stock_confirmation: "Stock confirmation",
  voice: "Voice note",
};

const reasons = Object.keys(wasteReasonLabels) as WasteReason[];

type VoiceExample = {
  text: string;
  productName: string;
  quantity?: number;
  unit?: string;
  event: string;
};

export function StaffInputBoard({
  initialRecords,
  prompts,
  products,
  voiceExamples,
}: {
  initialRecords: StaffInputRecord[];
  prompts: StockCheckPrompt[];
  products: Product[];
  voiceExamples: VoiceExample[];
}) {
  const [kind, setKind] = useState<StaffInputKind>("prepared_batch");
  const [records, setRecords] = useState(initialRecords);
  const [openPrompts, setOpenPrompts] = useState(prompts);

  const addRecord = (record: Omit<StaffInputRecord, "id" | "recordedAt" | "staffName" | "status"> & { status?: StaffInputRecord["status"] }) => {
    setRecords((current) => [
      {
        id: `si-${Date.now()}`,
        recordedAt: "Just now",
        staffName: "Jamie · prep",
        status: record.status ?? "passed_to_intake",
        ...record,
      },
      ...current,
    ]);
  };

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
            {kind === "prepared_batch" && <BatchForm products={products} onSave={addRecord} />}
            {kind === "waste" && <WasteForm products={products} onSave={addRecord} />}
            {kind === "stock_confirmation" && (
              <ConfirmForm
                prompts={openPrompts}
                onConfirm={(prompt, quantity) => {
                  addRecord({
                    kind: "stock_confirmation",
                    summary: `Confirmed ${quantity} ${prompt.unit} of ${prompt.productName.toLowerCase()}`,
                    productName: prompt.productName,
                    quantity: Number(quantity),
                    unit: prompt.unit,
                    detail: "Physical check passed to Smart Intake. The stock range can tighten around this figure.",
                  });
                  setOpenPrompts((current) => current.filter((item) => item.id !== prompt.id));
                }}
              />
            )}
            {kind === "voice" && <VoiceForm examples={voiceExamples} onSave={addRecord} />}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-ink">Passed to Smart Intake</h2>
              <Badge variant="success">{records.length}</Badge>
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              Each note becomes a structured event. Staff are not asked to count the whole kitchen.
            </p>
            <ul className="mt-4 space-y-3">
              {records.map((record) => (
                <li key={record.id} className="rounded-xl border border-mint-100 px-3 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-ink">{record.summary}</p>
                    <Badge>{kindLabels[record.kind]}</Badge>
                    <Badge variant={record.status === "passed_to_intake" ? "success" : "warning"}>
                      {record.status === "passed_to_intake" ? "Passed to intake" : "Needs review"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    {record.recordedAt} · {record.staffName}
                    {record.quantity !== undefined ? ` · ${record.quantity} ${record.unit ?? ""}` : ""}
                  </p>
                  {record.detail && <p className="mt-1 text-sm text-ink-muted">{record.detail}</p>}
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
  onSave,
}: {
  products: Product[];
  onSave: (record: Omit<StaffInputRecord, "id" | "recordedAt" | "staffName">) => void;
}) {
  const [productName, setProductName] = useState("Club sandwich (batch)");
  const [quantity, setQuantity] = useState("24");
  const [note, setNote] = useState("Prepared for the lunch batch");
  const product = products.find((item) => item.name === productName);

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const qty = Number(quantity);
        if (!product || qty <= 0) return;
        onSave({
          kind: "prepared_batch",
          summary: `Prepared ${qty} ${product.unit} of ${product.name.toLowerCase()}`,
          productName: product.name,
          quantity: qty,
          unit: product.unit,
          status: "passed_to_intake",
          detail: note || "Prepared batch recorded by staff.",
        });
        setNote("");
      }}
    >
      <FormTitle title="Prepared batch record" detail="Log what was made or opened. This is the kitchen movement invoices and sales do not show." />
      <Field label="Product or batch">
        <select className="input-field" value={productName} onChange={(event) => setProductName(event.target.value)}>
          {products.map((item) => (
            <option key={item.id} value={item.name}>{item.name}</option>
          ))}
        </select>
      </Field>
      <Field label={`Quantity (${product?.unit ?? "units"})`}>
        <input className="input-field" value={quantity} onChange={(event) => setQuantity(event.target.value)} inputMode="decimal" />
      </Field>
      <Field label="Note">
        <input className="input-field" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Prepared 24 chicken sandwiches" />
      </Field>
      <Button type="submit">Save batch record</Button>
    </form>
  );
}

function WasteForm({
  products,
  onSave,
}: {
  products: Product[];
  onSave: (record: Omit<StaffInputRecord, "id" | "recordedAt" | "staffName">) => void;
}) {
  const [productName, setProductName] = useState("Avocado");
  const [quantity, setQuantity] = useState("6");
  const [reason, setReason] = useState<WasteReason>("damage");
  const product = products.find((item) => item.name === productName);

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const qty = Number(quantity);
        if (!product || qty <= 0) return;
        onSave({
          kind: "waste",
          summary: `Recorded ${qty} ${product.unit} of ${product.name.toLowerCase()} as waste`,
          productName: product.name,
          quantity: qty,
          unit: product.unit,
          status: "passed_to_intake",
          detail: `${wasteReasonLabels[reason]}. The evidence pack keeps the destination and value.`,
        });
      }}
    >
      <FormTitle title="Waste capture record" detail="A short kitchen record of what was lost. The evidence pack keeps the full trail." />
      <Field label="Product">
        <select className="input-field" value={productName} onChange={(event) => setProductName(event.target.value)}>
          {products.map((item) => (
            <option key={item.id} value={item.name}>{item.name}</option>
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
        <Button type="submit">Save waste record</Button>
        <Link href="/dashboard/waste" className="text-sm font-medium text-mint-700 hover:underline">
          Open the evidence pack
        </Link>
      </div>
    </form>
  );
}

function ConfirmForm({
  prompts,
  onConfirm,
}: {
  prompts: StockCheckPrompt[];
  onConfirm: (prompt: StockCheckPrompt, quantity: string) => void;
}) {
  const [quantities, setQuantities] = useState<Record<string, string>>(() =>
    Object.fromEntries(prompts.map((prompt) => [prompt.id, String(prompt.suggested)])),
  );

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
            onConfirm(prompt, quantities[prompt.id] ?? String(prompt.suggested));
          }}
        >
          <p className="text-sm font-semibold text-ink">{prompt.productName}</p>
          <p className="mt-1 text-sm text-ink-muted">{prompt.prompt}</p>
          <p className="mt-1 text-xs text-ink-muted">
            Estimate {prompt.estimateLabel} · needed by {prompt.deadline}
          </p>
          <p className="mt-2 text-sm text-ink">{prompt.reason}</p>
          <label className="mt-3 block text-xs font-medium text-ink" htmlFor={`check-${prompt.id}`}>
            Quantity remaining ({prompt.unit})
          </label>
          <input
            id={`check-${prompt.id}`}
            className="input-field mt-1 max-w-40"
            value={quantities[prompt.id] ?? ""}
            onChange={(event) => setQuantities((current) => ({ ...current, [prompt.id]: event.target.value }))}
            inputMode="decimal"
          />
          <Button size="sm" className="mt-3" type="submit">Confirm stock</Button>
        </form>
      ))}
    </div>
  );
}

function VoiceForm({
  examples,
  onSave,
}: {
  examples: VoiceExample[];
  onSave: (record: Omit<StaffInputRecord, "id" | "recordedAt" | "staffName">) => void;
}) {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const match = examples.find((example) => example.text.toLowerCase() === transcript.trim().toLowerCase());

  const save = (event: FormEvent) => {
    event.preventDefault();
    const text = transcript.trim();
    if (!text) return;
    onSave({
      kind: "voice",
      summary: text,
      productName: match?.productName ?? "Unparsed note",
      quantity: match?.quantity,
      unit: match?.unit,
      status: match ? "passed_to_intake" : "needs_review",
      detail: match
        ? `${match.event}. Structured from the voice note and passed to Smart Intake.`
        : "The note was saved, but the product and quantity still need a quick check.",
    });
    setTranscript("");
  };

  return (
    <form className="space-y-3" onSubmit={save}>
      <FormTitle title="Voice input" detail="Speak a kitchen event in one sentence. Known phrases become a product, a quantity, and an event type." />
      <div className="flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example.text}
            type="button"
            onClick={() => setTranscript(example.text)}
            className="rounded-full border border-mint-200 bg-mint-50 px-3 py-1 text-left text-xs text-ink hover:border-mint-400"
          >
            {example.text}
          </button>
        ))}
      </div>
      <textarea
        className="input-field min-h-24"
        value={transcript}
        onChange={(event) => setTranscript(event.target.value)}
        placeholder="Opened second 2-litre cream carton"
      />
      <div className="rounded-xl bg-mint-50 px-3 py-3 text-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">Structured result</p>
        {match ? (
          <p className="mt-1 text-ink">
            {match.event} · {match.productName}
            {match.quantity !== undefined ? ` · ${match.quantity} ${match.unit}` : ""}
          </p>
        ) : (
          <p className="mt-1 text-ink-muted">
            {transcript.trim() ? "Saved for review until a product and quantity are clear." : "Pick a phrase or type what you would say."}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit">Save voice note</Button>
        <Button
          type="button"
          variant="outline"
          disabled={listening}
          onClick={() => {
            setListening(true);
            window.setTimeout(() => {
              setTranscript(examples[1]?.text ?? "Opened second 2-litre cream carton");
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
