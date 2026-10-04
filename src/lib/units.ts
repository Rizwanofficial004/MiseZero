export type Unit = "g" | "kg" | "ml" | "L" | "each";

export type UnitFamily = "mass" | "volume" | "count";

export function unitFamily(unit: Unit): UnitFamily {
  if (unit === "g" || unit === "kg") return "mass";
  if (unit === "ml" || unit === "L") return "volume";
  return "count";
}

export function sameFamily(a: Unit, b: Unit): boolean {
  return unitFamily(a) === unitFamily(b);
}

/** Convert a quantity into the family’s base unit: grams, millilitres, or count. */
export function toBase(qty: number, unit: Unit): number {
  if (unit === "kg" || unit === "L") return qty * 1000;
  return qty;
}

/** Convert a base-unit quantity back into the unit shown on screen. */
export function fromBase(qty: number, unit: Unit): number {
  if (unit === "kg" || unit === "L") return qty / 1000;
  return qty;
}

export function convert(qty: number, from: Unit, to: Unit): number {
  if (!sameFamily(from, to)) {
    throw new Error(`Cannot convert ${from} to ${to}`);
  }
  return fromBase(toBase(qty, from), to);
}
