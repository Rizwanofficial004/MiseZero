import { uid } from "@/lib/ids";
import { pause } from "@/services/delay";
import { useMiseStore } from "@/store/useMiseStore";
import type { StoredAction } from "@/store/types";

export async function acceptAction(input: { productId: string; optionId: string; title: string; detail: string }) {
  await pause();
  const existing = useMiseStore.getState().actions.find((action) => action.productId === input.productId && action.status !== "done");
  const next: StoredAction = {
    id: existing?.id ?? uid("action"),
    productId: input.productId,
    optionId: input.optionId,
    title: input.title,
    detail: input.detail,
    status: "accepted",
    modification: "",
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  useMiseStore.getState().saveAction(next);
}

export async function modifyAction(input: { productId: string; optionId: string; title: string; detail: string; modification: string }) {
  if (!input.modification.trim()) throw new Error("Describe the change");
  await pause();
  const existing = useMiseStore.getState().actions.find((action) => action.productId === input.productId && action.status !== "done");
  useMiseStore.getState().saveAction({
    id: existing?.id ?? uid("action"),
    productId: input.productId,
    optionId: input.optionId,
    title: input.title,
    detail: input.detail,
    status: "modified",
    modification: input.modification.trim(),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  });
}

export async function dismissAction(input: { productId: string; optionId: string; title: string }) {
  await pause();
  const existing = useMiseStore.getState().actions.find((action) => action.productId === input.productId && action.status !== "done");
  useMiseStore.getState().saveAction({
    id: existing?.id ?? uid("action"),
    productId: input.productId,
    optionId: input.optionId,
    title: input.title,
    detail: "",
    status: "dismissed",
    modification: "",
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  });
}

export async function completeAction(input: { productId: string; qtySaved: number; qtyWasted: number; value: number }) {
  const existing = useMiseStore.getState().actions.find((action) => action.productId === input.productId && action.status !== "dismissed");
  if (!existing) throw new Error("Accept the action before marking it done");
  if ([input.qtySaved, input.qtyWasted, input.value].some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error("Outcome quantities must be zero or more");
  }
  await pause();
  useMiseStore.getState().saveAction({
    ...existing,
    status: "done",
    outcome: {
      qtySaved: input.qtySaved,
      qtyWasted: input.qtyWasted,
      value: input.value,
      recordedAt: new Date().toISOString(),
    },
  });
}

export async function undoAction(productId: string) {
  await pause();
  const existing = useMiseStore.getState().actions.find((action) => action.productId === productId && action.status !== "done");
  if (existing) useMiseStore.getState().deleteAction(existing.id);
}
