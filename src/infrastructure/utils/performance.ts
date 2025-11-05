/**
 * Performance Utilities
 * 
 * Helper functions per ottimizzare performance React Native
 */

import { useCallback, useEffect, useRef } from 'react';

/**
 * useDebouncedCallback - Debounce function per ridurre chiamate frequenti
 * 
 * @example
 * const debouncedSearch = useDebouncedCallback((query) => {
 *   searchBooks(query);
 * }, 300);
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

/**
 * useThrottledCallback - Throttle function per limitare esecuzioni
 * 
 * @example
 * const throttledScroll = useThrottledCallback((event) => {
 *   handleScroll(event);
 * }, 100);
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottledCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRun.current;

      if (timeSinceLastRun >= delay) {
        callback(...args);
        lastRun.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(
          () => {
            callback(...args);
            lastRun.current = Date.now();
          },
          delay - timeSinceLastRun
        );
      }
    },
    [callback, delay]
  );
}

/**
 * usePrevious - Mantieni reference al valore precedente
 * 
 * @example
 * const previousCount = usePrevious(count);
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * useIsMounted - Check se component è mounted
 * Utile per evitare state updates su componenti unmounted
 * 
 * @example
 * const isMounted = useIsMounted();
 * 
 * useEffect(() => {
 *   fetchData().then(data => {
 *     if (isMounted()) {
 *       setData(data);
 *     }
 *   });
 * }, []);
 */
export function useIsMounted(): () => boolean {
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
}

/**
 * arePropsEqual - Helper per React.memo comparison
 * Deep comparison per props semplici
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function arePropsEqual<T extends Record<string, any>>(
  prevProps: T,
  nextProps: T
): boolean {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  return prevKeys.every((key) => {
    const prevValue = prevProps[key];
    const nextValue = nextProps[key];

    // Shallow comparison
    if (prevValue === nextValue) {
      return true;
    }

    // Array comparison
    if (Array.isArray(prevValue) && Array.isArray(nextValue)) {
      if (prevValue.length !== nextValue.length) {
        return false;
      }
      return prevValue.every((item, index) => item === nextValue[index]);
    }

    // Object comparison (shallow)
    if (
      typeof prevValue === 'object' &&
      prevValue !== null &&
      typeof nextValue === 'object' &&
      nextValue !== null
    ) {
      const prevObjKeys = Object.keys(prevValue);
      const nextObjKeys = Object.keys(nextValue);

      if (prevObjKeys.length !== nextObjKeys.length) {
        return false;
      }

      return prevObjKeys.every((k) => prevValue[k] === nextValue[k]);
    }

    return false;
  });
}
