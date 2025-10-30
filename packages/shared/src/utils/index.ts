// /packages/shared/src/utils/index.ts

/** Identidad: útil en pipelines genéricos */
export const identity = <T>(x: T): T => x;

/** Nunca debería ocurrir: fuerza exhaustividad en switches con unions */
export function assertNever(x: never, msg = "Unexpected value"): never {
  throw new Error(`${msg}: ${String(x)}`);
}

/** Espera asíncrona simple */
export const sleep = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

/** Clamp numérico */
export const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

/** UUID simple (usa crypto si está disponible) */
export function createId(): string {
  const g = (globalThis as any);
  if (g.crypto?.randomUUID) return g.crypto.randomUUID();
  // fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/** JSON.parse seguro con fallback */
export function safeParseJSON<T = unknown>(s: string, fallback: T): T {
  try { return JSON.parse(s) as T; } catch { return fallback; }
}

/** try/catch funcional que devuelve Result */
import { Result, ok, err } from "../result";
import { unknownError } from "../errors";

export function tryResult<T>(fn: () => T): Result<T> {
  try {
    return ok(fn());
  } catch (e) {
    return err(unknownError("tryResult failed", undefined, e));
  }
}
