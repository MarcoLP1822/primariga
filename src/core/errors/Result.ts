/**
 * Result Pattern Implementation
 *
 * Permette gestione errori type-safe senza throw/catch
 * Ispirato da Rust Result<T, E>
 */

export type Result<T, E = Error> = Success<T> | Failure<E>;

export class Success<T> {
  readonly ok = true as const;
  readonly error = null;

  constructor(readonly value: T) {}

  isSuccess(): this is Success<T> {
    return true;
  }

  isFailure(): this is never {
    return false;
  }

  map<U>(fn: (value: T) => U): Result<U, never> {
    return success(fn(this.value));
  }

  flatMap<U, E>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  getOrThrow(): T {
    return this.value;
  }

  getOrElse(_defaultValue: T): T {
    return this.value;
  }
}

export class Failure<E> {
  readonly ok = false as const;
  readonly value = null;

  constructor(readonly error: E) {}

  isSuccess(): this is never {
    return false;
  }

  isFailure(): this is Failure<E> {
    return true;
  }

  map<U>(_fn: (value: never) => U): Result<never, E> {
    return this as any;
  }

  flatMap<U>(_fn: (value: never) => Result<U, E>): Result<never, E> {
    return this as any;
  }

  getOrThrow(): never {
    throw this.error;
  }

  getOrElse<T>(defaultValue: T): T {
    return defaultValue;
  }
}

/**
 * Helper functions
 */
export function success<T>(value: T): Success<T> {
  return new Success(value);
}

export function failure<E>(error: E): Failure<E> {
  return new Failure(error);
}

/**
 * Wrap async function in Result
 */
export async function tryCatch<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
  try {
    const result = await fn();
    return success(result);
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Wrap sync function in Result
 */
export function tryCatchSync<T>(fn: () => T): Result<T, Error> {
  try {
    return success(fn());
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Combine multiple Results
 */
export function combine<T extends readonly Result<any, any>[]>(
  results: T
): Result<
  { [K in keyof T]: T[K] extends Result<infer V, any> ? V : never },
  T[number] extends Result<any, infer E> ? E : never
> {
  const values: any[] = [];

  for (const result of results) {
    if (result.isFailure()) {
      return result as any;
    }
    values.push(result.value);
  }

  return success(values as any);
}

/**
 * Convert Result to Promise (for async/await compatibility)
 */
export async function resultToPromise<T, E>(result: Result<T, E>): Promise<T> {
  if (result.isSuccess()) {
    return result.value;
  }
  throw result.error;
}
