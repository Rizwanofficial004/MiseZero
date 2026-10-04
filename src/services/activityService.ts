import { pause } from "@/services/delay";
import { useMiseStore } from "@/store/useMiseStore";

export async function listActivity() {
  await pause();
  return useMiseStore.getState().activity;
}

export async function resetDemo() {
  await pause();
  useMiseStore.getState().resetDemo();
}

export async function loadSample() {
  await pause();
  useMiseStore.getState().loadSample();
}

export async function signIn(email: string, password: string, name = "Sarah Chen") {
  if (!email.trim() || !email.includes("@")) throw new Error("Enter a work email");
  if (!password.trim()) throw new Error("Enter a password");
  await pause();
  useMiseStore.getState().setSession({ email: email.trim(), name: name.trim() || "Sarah Chen" });
  useMiseStore.getState().log(`Signed in as ${email.trim()}`, "session");
}

export async function signOut() {
  await pause();
  useMiseStore.getState().setSession(null);
}
