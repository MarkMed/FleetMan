// /packages/shared/src/either.ts

export type Either<L, R> = Left<L, R> | Right<L, R>;

export interface Left<L, R> {
  readonly _tag: "Left";
  readonly left: L;
}
export interface Right<L, R> {
  readonly _tag: "Right";
  readonly right: R;
}

export const left = <L, R = never>(l: L): Either<L, R> => ({ _tag: "Left", left: l });
export const right = <R, L = never>(r: R): Either<L, R> => ({ _tag: "Right", right: r });

export const isLeft = <L, R>(e: Either<L, R>): e is Left<L, R> => e._tag === "Left";
export const isRight = <L, R>(e: Either<L, R>): e is Right<L, R> => e._tag === "Right";

export function map<L, A, B>(e: Either<L, A>, f: (a: A) => B): Either<L, B> {
  return isRight(e) ? right(f(e.right)) : e;
}

export function mapLeft<L, R, L2>(e: Either<L, R>, f: (l: L) => L2): Either<L2, R> {
  return isLeft(e) ? left(f(e.left)) : e;
}

export function flatMap<L, A, B>(e: Either<L, A>, f: (a: A) => Either<L, B>): Either<L, B> {
  return isRight(e) ? f(e.right) : e;
}

export function match<L, R, B>(e: Either<L, R>, onLeft: (l: L) => B, onRight: (r: R) => B): B {
  return isRight(e) ? onRight(e.right) : onLeft((e as Left<L, R>).left);
}
