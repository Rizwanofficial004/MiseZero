export function uid(prefix: string): string {
  const cryptoId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  return `${prefix}_${cryptoId}`;
}
