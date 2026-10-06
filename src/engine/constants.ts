/**
 * Locked weights for the shadow-stock, risk, and safe-window engines.
 * The stock screen quotes SHADOW_FORMULA. Changing a weight changes the tests.
 */
export const SHADOW = {
  baseVariancePct: 10,
  dailyWidenPct: 3,
  conflictExtraPct: 15,
  neverConfirmedDays: 7,
  recencyDropPerDay: 8,
  recencyFloor: 20,
  neverConfirmedRecency: 20,
  confidenceCap: 98,
  weights: { recency: 0.5, completeness: 0.3, consistency: 0.2 },
  conflictConsistency: 40,
  okConsistency: 100,
  wideRangePct: 25,
  lowConfidence: 50,
  urgentUseByHours: 48,
} as const;

export const STORAGE_BUFFER_HOURS = {
  chilled: 4,
  frozen: 2,
  ambient: 6,
  opened: 2,
  prepared: 2,
} as const;

/** Surplus ÷ expected stock. Below the first cut is Low, then Med, High, and Critical. */
export const RISK_SHARE = {
  low: 0.15,
  med: 0.35,
  high: 0.6,
} as const;

export const SHADOW_FORMULA =
  "expected = last confirmed quantity + deliveries since − recipe consumption since − waste since − prep since. " +
  `Half-width % = ${SHADOW.baseVariancePct} + days since confirm × ${SHADOW.dailyWidenPct} + ${SHADOW.conflictExtraPct} if signals conflict. ` +
  "Range = expected ± expected × half-width %, lower bound 0. " +
  `Confidence = ${SHADOW.weights.recency} × recency + ${SHADOW.weights.completeness} × completeness + ${SHADOW.weights.consistency} × consistency, capped at ${SHADOW.confidenceCap}.`;
