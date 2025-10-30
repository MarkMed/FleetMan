// /packages/shared/src/feature-flags.ts

type Primitive = string | number | boolean;

let runtimeOverrides: Record<string, Primitive> = {};

/** Permite setear/overrides en runtime (p. ej., al boot del frontend). */
export function setFeatureFlags(overrides: Record<string, Primitive>): void {
  runtimeOverrides = { ...runtimeOverrides, ...overrides };
}

export function getFlagRaw(name: string): string | undefined {
  // 1) Overrides en memoria
  const override = runtimeOverrides[name];
  if (override !== undefined) return String(override);

  // 2) Node (backend)
  // eslint-disable-next-line n/no-process-env
  if (typeof process !== "undefined" && (process as any).env && (process as any).env[name] !== undefined) {
    // eslint-disable-next-line n/no-process-env
    return (process as any).env[name];
  }

  // 3) Vite (frontend)
  try {
    // @ts-ignore - import.meta existe en ESM/bundlers; guardado con try
    if (typeof import.meta !== "undefined" && (import.meta as any).env) {
      // @ts-ignore
      const v = (import.meta as any).env[name];
      if (v !== undefined) return String(v);
    }
  } catch {
    // ignore
  }

  return undefined;
}

export function getFlagBool(name: string, defaultValue = false): boolean {
  const raw = getFlagRaw(name);
  if (raw === undefined) return defaultValue;
  const val = String(raw).toLowerCase().trim();
  if (["1", "true", "on", "yes"].includes(val)) return true;
  if (["0", "false", "off", "no"].includes(val)) return false;
  return defaultValue;
}

export function getFlagNumber(name: string, defaultValue: number): number {
  const raw = getFlagRaw(name);
  if (raw === undefined) return defaultValue;
  const n = Number(raw);
  return Number.isFinite(n) ? n : defaultValue;
}

export function getFlagString(name: string, defaultValue = ""): string {
  const raw = getFlagRaw(name);
  return raw === undefined ? defaultValue : String(raw);
}
