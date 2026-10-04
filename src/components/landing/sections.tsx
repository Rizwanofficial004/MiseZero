"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/landing/reveal";
import { HeroPreview } from "@/components/landing/hero-preview";
import {
  benchmarkComparison,
  cafeProfile,
  dashboardSummary,
  knowledgeGraphExample,
  plans,
} from "@/lib/data/demo";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowRight,
  Cable,
  CheckCircle2,
  Gauge,
  Leaf,
  ScanLine,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="animate-blob pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-mint-200/70 blur-3xl" />
      <div className="animate-blob-delay pointer-events-none absolute -right-16 top-24 h-96 w-96 rounded-full bg-mint-100 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-16">
        <div>
          <motion.p
            className="inline-flex items-center gap-2 rounded-full border border-mint-200 bg-white/80 px-3 py-1 text-xs font-semibold text-mint-700"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <Leaf className="h-3.5 w-3.5" strokeWidth={1.75} />
            For independent cafés & restaurants
          </motion.p>
          <motion.h1
            className="font-serif mt-6 max-w-xl text-4xl leading-[1.08] text-ink sm:text-5xl lg:text-[3.75rem]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease }}
          >
            Save food before it becomes waste.
          </motion.h1>
          <motion.p
            className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease }}
          >
            MiseZero estimates perishable inventory with confidence ranges, calculates safety action windows,
            and recommends commercially sensible interventions — in a 60–90 second daily workflow.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease }}
          >
            <Link href="/signup">
              <Button size="lg">
                Start free trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                View prototype demo
              </Button>
            </Link>
          </motion.div>
          <motion.div
            className="mt-10 flex flex-wrap gap-5 text-sm text-ink-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-mint-600" strokeWidth={1.75} /> Food-safety constrained</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-mint-600" strokeWidth={1.75} /> Human approval required</span>
            <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-mint-600" strokeWidth={1.75} /> Works with partial data</span>
          </motion.div>
        </div>
        <HeroPreview />
      </div>
    </section>
  );
}

export function LogoMarquee() {
  const items = ["Square", "Toast", "Lightspeed", "Epos Now", "CSV fallback", "Kitchen scale", "Invoice OCR"];
  const loop = [...items, ...items];
  return (
    <div className="border-y border-mint-200 bg-white/70 py-6">
      <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
        Built for mixed POS reality
      </p>
      <div className="overflow-hidden">
        <div className="animate-marquee flex w-max gap-10 px-6">
          {loop.map((item, i) => (
            <span key={`${item}-${i}`} className="whitespace-nowrap text-sm font-medium text-ink/70">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const features = [
    {
      icon: ScanLine,
      title: "Smart Intake",
      description: "Invoices, delivery notes, scale weights, and POS exports — confidence-scored extraction with quick corrections.",
    },
    {
      icon: Gauge,
      title: "Perishable-State Estimator",
      description: "Quantity ranges and confidence scores instead of false precision. Partial observability built in.",
    },
    {
      icon: ShieldCheck,
      title: "Safety Action Windows",
      description: "Deterministic food-safety rules calculate the last feasible intervention time — not just expiry dates.",
    },
    {
      icon: WandSparkles,
      title: "Rescue Optimiser",
      description: "Compare freeze, markdown, production reduction, and order changes — uncertainty-aware recommendations.",
    },
    {
      icon: Cable,
      title: "POS-aware mapping",
      description: "Square, Toast, Lightspeed, Epos Now — field mapping adapts to each venue. Secure exports keep you moving when a direct connection isn't available.",
    },
    {
      icon: Sparkles,
      title: "Explainable decisions",
      description: "Every recommendation ties to binding constraints, forecasts, and inventory confidence — not generic templates.",
    },
  ];

  return (
    <section id="features" className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="text-sm font-semibold text-mint-700">The product</p>
          <h2 className="font-serif mt-2 text-3xl text-ink md:text-4xl">Built around measurable uncertainty</h2>
          <p className="mt-4 max-w-2xl text-ink-muted">
            Not another inventory spreadsheet. MiseZero proves that imperfect stock information
            can drive safer, commercially useful decisions.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <Card className="group h-full transition-transform duration-300 hover:-translate-y-1">
                <CardContent className="p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint-100 text-mint-700 transition-colors group-hover:bg-mint-500 group-hover:text-white">
                    <f.icon className="h-5 w-5" strokeWidth={1.6} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-ink">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.description}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  const steps = [
    "Invoice recognised — 12 L cream delivered Monday 08:00",
    "POS & recipes indicate partial consumption (~4.5 L)",
    "System estimates 3.8–5.6 L remaining at 64% confidence",
    "Safety engine: intervention required before 14:00",
    "Optimiser evaluates recipe use, freeze, markdown, order reduction",
    "Low confidence → request quick stock confirmation",
    "Staff confirms 4.2 L → recommendation recalculates",
    "Outcome recorded → calibration updated",
  ];

  return (
    <section id="how-it-works" className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <p className="text-sm font-semibold text-mint-700">The proof</p>
          <h2 className="font-serif mt-2 text-3xl text-ink md:text-4xl">See the decision flow</h2>
          <p className="mt-4 max-w-2xl text-ink-muted">
            The demo café ({cafeProfile.name}) follows the core technical proof from our innovation case.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <ol className="relative space-y-3">
            <div className="absolute left-[15px] top-3 bottom-3 w-px bg-mint-200" />
            {steps.map((step, i) => (
              <Reveal key={step} delay={i * 0.05}>
                <li className="relative flex gap-4 rounded-2xl bg-mint-50/80 p-3 text-sm text-ink">
                  <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mint-500 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="pt-1.5">{step}</span>
                </li>
              </Reveal>
            ))}
          </ol>
          <Reveal delay={0.15}>
            <Card className="h-full">
              <CardContent className="p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">Knowledge chain</p>
                <div className="mt-6 space-y-4">
                  {knowledgeGraphExample.chain.map((item, i) => (
                    <div key={item.node}>
                      {i > 0 && <div className="mb-3 ml-5 h-6 w-px bg-mint-300" />}
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint-100 text-mint-700 text-xs font-bold">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-ink">{item.node}</p>
                          <p className="text-xs text-ink-muted">{item.relation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-6 rounded-2xl bg-mint-50 p-4 text-sm leading-relaxed text-ink">
                  {knowledgeGraphExample.insight}
                </p>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function BenchmarkSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 className="font-serif text-3xl text-ink">Pilot benchmark vs deterministic baseline</h2>
          <p className="mt-2 text-sm text-ink-muted">{benchmarkComparison.note}</p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benchmarkComparison.metrics.map((m, i) => (
            <Reveal key={m.label} delay={i * 0.06}>
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-ink-muted">{m.label}</p>
                  <div className="mt-4 flex items-end gap-5">
                    <div>
                      <p className="text-xs text-ink-muted/70">Baseline</p>
                      <p className="text-lg font-semibold text-ink-muted">{m.baseline}{m.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-mint-700">MiseZero</p>
                      <p className="font-serif text-3xl text-mint-700">{m.misezero}{m.unit}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="text-center">
          <p className="text-sm font-semibold text-mint-700">Pricing</p>
          <h2 className="font-serif mt-2 text-3xl text-ink md:text-4xl">Plans for every stage</h2>
          <p className="mt-4 text-ink-muted">From single-site pilots to multi-site enterprise with custom POS mapping</p>
        </Reveal>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 0.08}>
              <Card className={`h-full ${plan.highlighted ? "border-mint-400 ring-4 ring-mint-100" : ""}`}>
                <CardContent className="p-6">
                  {plan.highlighted && (
                    <span className="rounded-full bg-mint-100 px-2.5 py-0.5 text-xs font-semibold text-mint-700">
                      Most popular
                    </span>
                  )}
                  <h3 className="mt-3 text-xl font-semibold text-ink">{plan.name}</h3>
                  <p className="mt-2 text-sm text-ink-muted">{plan.description}</p>
                  <div className="mt-5">
                    {plan.price > 0 ? (
                      <p className="font-serif text-4xl text-ink">
                        {formatCurrency(plan.price)}
                        <span className="font-sans text-base font-medium text-ink-muted"> /month</span>
                      </p>
                    ) : (
                      <p className="font-serif text-4xl text-ink">Custom</p>
                    )}
                  </div>
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-ink-muted">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-mint-600" strokeWidth={1.75} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className="mt-8 block">
                    <Button variant={plan.highlighted ? "primary" : "outline"} className="w-full">
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PosSection() {
  return (
    <section id="pos" className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="text-sm font-semibold text-mint-700">Integrations</p>
            <h2 className="font-serif mt-2 text-3xl text-ink md:text-4xl">Every POS maps differently</h2>
            <p className="mt-4 text-ink-muted leading-relaxed">
              Restaurants use Square, Toast, Lightspeed, Epos Now, and bespoke systems.
              Menu item names rarely match supplier products or recipes. MiseZero adapts to the data you have available.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink-muted">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-mint-600 shrink-0" strokeWidth={1.75} /> Venue-specific field mapping configuration</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-mint-600 shrink-0" strokeWidth={1.75} /> Recipe-linked consumption from POS sales</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-mint-600 shrink-0" strokeWidth={1.75} /> CSV export fallback when APIs are unavailable</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-mint-600 shrink-0" strokeWidth={1.75} /> Unmapped items are flagged with mapping confidence</li>
            </ul>
            <Link href="/dashboard/integrations" className="mt-7 inline-block">
              <Button variant="outline">See POS mapping demo</Button>
            </Link>
          </Reveal>
          <Reveal delay={0.12}>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-ink">Data source readiness</p>
                <div className="mt-4 space-y-3">
                  <SourceRow name="Square POS" status="Partial — 28/42 fields mapped" ok={false} />
                  <SourceRow name="Invoice uploads" status="Connected" ok={true} />
                  <SourceRow name="Kitchen scale" status="Connected" ok={true} />
                  <SourceRow name="Toast POS (Site 2)" status="Offline — export available" ok={false} />
                </div>
                <p className="mt-4 text-xs text-ink-muted">
                  MiseZero keeps workflows moving across connected, partially connected, and offline sources.
                </p>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function SourceRow({ name, status, ok }: { name: string; status: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-mint-50 px-3.5 py-3 text-sm">
      <span className="font-medium text-ink">{name}</span>
      <span className={ok ? "text-mint-700" : "text-amber-700"}>{status}</span>
    </div>
  );
}

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-16">
      <div className="animate-blob pointer-events-none absolute left-1/4 top-0 h-64 w-64 rounded-full bg-mint-200 blur-3xl" />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <Reveal>
          <h2 className="font-serif text-3xl text-ink md:text-4xl">Make every ingredient count</h2>
          <p className="mt-4 text-ink-muted">
            See MiseZero in action with {cafeProfile.name} demo data — {dashboardSummary.actionsToday} actions today,
            {" "}{formatCurrency(dashboardSummary.valueProtectedThisWeek)} value protected this week.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/signup"><Button size="lg">Create account</Button></Link>
            <Link href="/dashboard"><Button size="lg" variant="outline">Open demo dashboard</Button></Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
