/**
 * Wraps a result that can either be successful (`ok: true`) or an error (`ok: false`).
 */
export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/** Wraps a successful value. */
export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

/** Wraps an error. */
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
