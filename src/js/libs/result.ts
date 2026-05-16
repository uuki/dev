export type Ok<T> = { readonly _tag: 'Ok'; readonly value: T };
export type Err<E> = { readonly _tag: 'Err'; readonly error: E };
export type Result<T, E = string> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({ _tag: 'Ok', value });
export const err = <E>(error: E): Err<E> => ({ _tag: 'Err', error });

export const isOk = <T, E>(r: Result<T, E>): r is Ok<T> => r._tag === 'Ok';
export const isErr = <T, E>(r: Result<T, E>): r is Err<E> => r._tag === 'Err';

export const map = <T, U, E>(r: Result<T, E>, f: (value: T) => U): Result<U, E> =>
  isOk(r) ? ok(f(r.value)) : r;

export const flatMap = <T, U, E>(
  r: Result<T, E>,
  f: (value: T) => Result<U, E>,
): Result<U, E> => (isOk(r) ? f(r.value) : r);

export const mapErr = <T, E, F>(r: Result<T, E>, f: (error: E) => F): Result<T, F> =>
  isErr(r) ? err(f(r.error)) : r;

export const getOrElse = <T, E>(r: Result<T, E>, fallback: T): T =>
  isOk(r) ? r.value : fallback;

export function pipe<T, E>(value: Result<T, E>): Result<T, E>;
export function pipe<T, U, E>(
  value: Result<T, E>,
  f1: (v: T) => Result<U, E>,
): Result<U, E>;
export function pipe<T, U, V, E>(
  value: Result<T, E>,
  f1: (v: T) => Result<U, E>,
  f2: (v: U) => Result<V, E>,
): Result<V, E>;
export function pipe<T, U, V, W, E>(
  value: Result<T, E>,
  f1: (v: T) => Result<U, E>,
  f2: (v: U) => Result<V, E>,
  f3: (v: V) => Result<W, E>,
): Result<W, E>;
export function pipe(
  value: Result<unknown, unknown>,
  ...fns: Array<(v: unknown) => Result<unknown, unknown>>
): Result<unknown, unknown> {
  return fns.reduce((acc, fn) => (isOk(acc) ? fn(acc.value) : acc), value);
}
