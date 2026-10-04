# MiseZero

Design prototype for perishable stock decision support — when exact inventory is unknown.

## What this is

A **frontend-only prototype** with rich dummy data for client demos and requirements meetings. No working backend yet.

**Demo café:** Bloom & Crumb Café (Manchester) — sandwiches, bakery, coffee, limited prepared food.

## Features drafted

- **Landing page** — hero, features, end-to-end scenario, benchmark comparison, pricing plans, POS integration story
- **Sign up / Sign in** — plan selection, POS system choice (prototype flows to demo)
- **Today's Actions** — 60–90 second priority action list with confidence ranges
- **Alerts** — stock risks, safety windows, intake review, integration status
- **Smart Intake** — invoices, delivery notes, scale, POS exports with confidence scores
- **Stock Estimates** — perishable-state estimator with ranges vs deterministic baseline
- **Recommendations** — rescue optimiser with explainable binding constraints
- **Data Sources** — mixed connectivity (connected / partial / unavailable)
- **POS Mapping** — Square, Toast, Lightspeed, Epos Now per-client field mapping
- **Outcomes** — staff response and commercial impact learning loop
- **Calibration** — model performance metrics and baseline comparison chart
- **Settings** — venue profile, safety rules, product ontology

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — landing page  
Demo dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard) or sign in with any credentials

## Tech stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Recharts (calibration dashboard)
- Lucide icons

## Notes for client meetings

- Restaurants use different POS systems — mapping varies per client
- Some clients cannot grant API access — CSV/manual fallbacks shown in demo
- Decision support only — all recommendations require human approval
- Safety rules are hard constraints; models cannot override them
