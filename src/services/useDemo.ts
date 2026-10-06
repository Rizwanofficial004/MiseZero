"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { buildDashboard } from "@/engine/present";
import { useMiseStore } from "@/store/useMiseStore";

export function useDemo() {
  const data = useMiseStore(
    useShallow((state) => ({
      venue: state.venue,
      suppliers: state.suppliers,
      products: state.products,
      recipes: state.recipes,
      deliveries: state.deliveries,
      sales: state.sales,
      waste: state.waste,
      preps: state.preps,
      confirmations: state.confirmations,
      actions: state.actions,
      activity: state.activity,
      posMappings: state.posMappings,
      voiceNotes: state.voiceNotes,
      session: state.session,
    })),
  );
  const dashboard = useMemo(() => buildDashboard(data, new Date()), [data]);
  return { ...data, ...dashboard };
}
