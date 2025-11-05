import { useState, useCallback } from 'react';
import { AppError, normalizeError } from '../../core/errors';

interface AsyncState<T> {
  data: T | null;
  error: AppError | null;
  isLoading: boolean;
}

/**
 * Hook per gestire operazioni async con error handling
 *
 * @example
 * const { execute, data, error, isLoading } = useAsyncError();
 *
 * const handleFetch = async () => {
 *   await execute(async () => {
 *     const book = await fetchBook(id);
 *     return book;
 *   });
 * };
 */
export function useAsyncError<T = any>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(async (asyncFn: () => Promise<T>): Promise<T | null> => {
    setState({ data: null, error: null, isLoading: true });

    try {
      const result = await asyncFn();
      setState({ data: result, error: null, isLoading: false });
      return result;
    } catch (error) {
      const appError = normalizeError(error);
      setState({ data: null, error: appError, isLoading: false });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  const setData = useCallback((data: T) => {
    setState({ data, error: null, isLoading: false });
  }, []);

  const setError = useCallback((error: AppError | Error) => {
    const appError = normalizeError(error);
    setState({ data: null, error: appError, isLoading: false });
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
  };
}

/**
 * Hook semplificato per singola chiamata async
 */
export function useAsync<T>(asyncFn: () => Promise<T>, dependencies: any[] = []) {
  const { execute, ...state } = useAsyncError<T>();

  useState(() => {
    execute(asyncFn);
  });

  return state;
}
