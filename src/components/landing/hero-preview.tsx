"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <motion.div
        className="animate-float rounded-2xl border border-[#dfeae2] bg-white/90 p-4 shadow-soft"
        initial={{ opacity: 0, y: 28, rotate: 2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">Daily action</p>
          <Badge variant="priority" priority="high">High</Badge>
        </div>
        <h3 className="mt-3 text-xl font-semibold text-ink">Fresh cream</h3>
        <p className="mt-1 text-sm text-mint-700">Confirm stock and allocate eligible cream by 14:00</p>

        <div className="mt-5 flex items-center gap-5">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <span className="pulse-ring absolute inset-0 rounded-full bg-mint-300/50" />
            <svg viewBox="0 0 96 96" className="h-24 w-24 -rotate-90">
              <circle cx="48" cy="48" r="38" fill="none" stroke="#e6f6ee" strokeWidth="10" />
              <motion.circle
                cx="48"
                cy="48"
                r="38"
                fill="none"
                stroke="#34B87A"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={239}
                initial={{ strokeDashoffset: 239 }}
                animate={{ strokeDashoffset: 239 * (1 - 0.78) }}
                transition={{ duration: 1.4, delay: 0.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute text-center">
              <p className="text-lg font-bold text-ink">78%</p>
              <p className="text-[10px] text-ink-muted">confidence</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-ink-muted">Estimated remaining</p>
            <p className="font-serif text-3xl text-ink">4.2–5.8 L</p>
            <p className="mt-1 text-xs text-ink-muted">Most likely 4.9 L · action by 14:00</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="animate-float-slow absolute -right-4 -top-6 hidden w-44 rounded-xl border border-[#dfeae2] bg-white p-3 shadow-soft sm:block"
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.55 }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Safety window</p>
        <p className="mt-1 text-sm font-semibold text-ink">Closes 14:00</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mint-100">
          <motion.div
            className="h-full rounded-full bg-mint-500"
            initial={{ width: 0 }}
            animate={{ width: "62%" }}
            transition={{ duration: 1.1, delay: 0.8 }}
          />
        </div>
      </motion.div>

      <motion.div
        className="absolute -bottom-5 -left-5 hidden w-48 rounded-xl border border-[#dfeae2] bg-white p-3 shadow-soft sm:block"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <p className="text-[11px] font-semibold text-ink-muted">Vs deterministic</p>
        <p className="mt-1 text-sm text-ink">A ledger would say 5 L exactly. MiseZero keeps the range, because the kitchen record is incomplete.</p>
      </motion.div>
    </div>
  );
}
