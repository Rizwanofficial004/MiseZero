/**
 * Frontend data boundary.
 *
 * Screens import from here, not from `./demo`. Each getter returns static
 * demo records today. When an API exists, replace the function body with a
 * request and keep the return types in `./types`.
 */

import {
  alerts,
  cafeProfile,
  coldStart,
  dataSources,
  intakeRecords,
  inventory,
  knowledgeGraphExample,
  outcomes,
  plans,
  positioning,
  products,
  recommendations,
  staffInputs,
  stockCheckPrompts,
  todayActions,
  voiceExamples,
  wasteEvents,
  wasteTrend,
} from "./demo";

export type * from "./types";
export * from "./demo";

export function getCafeProfile() {
  return cafeProfile;
}

export function getDailyActions() {
  return todayActions;
}

export function getAlerts() {
  return alerts;
}

export function getIntakeRecords() {
  return intakeRecords;
}

export function getInventory() {
  return inventory;
}

export function getRecommendations() {
  return recommendations;
}

export function getOutcomes() {
  return outcomes;
}

export function getDataSources() {
  return dataSources;
}

export function getPlans() {
  return plans;
}

export function getProducts() {
  return products;
}

export function getWasteEvents() {
  return wasteEvents;
}

export function getStaffInputs() {
  return staffInputs;
}

export function getStockCheckPrompts() {
  return stockCheckPrompts;
}

export function getVoiceExamples() {
  return voiceExamples;
}

export function getWasteTrend() {
  return wasteTrend;
}

export function getPositioning() {
  return positioning;
}

export function getVenueSettings() {
  return { cafeProfile, products, coldStart, knowledgeGraphExample };
}
