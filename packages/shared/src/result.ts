// /packages/shared/src/result.ts

import { Either, left, right, isLeft, isRight } from "./either";
import type { AppError } from "./errors";

export type Result<T, E = AppError> = Either<E, T>;

export const ok = <T>(value: T): Result<T> => right(value);
export const err = <E = AppError, T = never>(error: E): Result<T, E> => left(error);

export const isOk = <T, E>(r: Result<T, E>): r is Either<E, T> & { _tag: "Right" } => isRight(r);
export const isErr = <T, E>(r: Result<T, E>): r is Either<E, T> & { _tag: "Left" } => isLeft(r);

export function unwrap<T, E extends Error>(r: Result<T, E>): T {
  if (isLeft(r)) throw r.left;
  return r.right;
}

export function unwrapOr<T, E>(r: Result<T, E>, fallback: T): T {
  return isRight(r) ? r.right : fallback;
}

export async function fromPromise<T>(p: Promise<T>, onError: (e: unknown) => AppError): Promise<Result<T>> {
  try {
    const v = await p;
    return ok(v);
  } catch (e) {
    return err(onError(e));
  }
}

export function toPromise<T, E extends Error>(r: Result<T, E>): Promise<T> {
  return isRight(r) ? Promise.resolve(r.right) : Promise.reject(r.left);
}
