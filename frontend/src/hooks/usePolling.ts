// HTTP Polling Hook
// Provides real-time data updates via HTTP polling

import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePollingOptions<T> {
  /** Polling interval in milliseconds (default: 5000) */
  interval?: number;
  /** Whether polling is enabled (default: true) */
  enabled?: boolean;
  /** Callback when data changes */
  onDataChange?: (data: T, previousData: T | null) => void;
  /** Callback when error occurs */
  onError?: (error: Error) => void;
  /** Immediate fetch on mount (default: true) */
  immediate?: boolean;
}

interface UsePollingResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isPolling: boolean;
  refetch: () => Promise<void>;
  start: () => void;
  stop: () => void;
}

/**
 * Custom hook for HTTP polling
 * Fetches data at regular intervals and provides real-time updates
 */
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  options: UsePollingOptions<T> = {}
): UsePollingResult<T> {
  const {
    interval = 5000,
    enabled = true,
    onDataChange,
    onError,
    immediate = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(enabled);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<T | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFn();

      if (!mountedRef.current) return;

      // Check if data changed
      const previousData = previousDataRef.current;
      const hasChanged = JSON.stringify(previousData) !== JSON.stringify(result);

      if (hasChanged) {
        setData(result);
        previousDataRef.current = result;

        if (onDataChange) {
          onDataChange(result, previousData);
        }
      }
    } catch (err) {
      if (!mountedRef.current) return;

      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);

      if (onError) {
        onError(error);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetchFn, onDataChange, onError]);

  const start = useCallback(() => {
    setIsPolling(true);
  }, []);

  const stop = useCallback(() => {
    setIsPolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Effect for initial fetch and polling
  useEffect(() => {
    mountedRef.current = true;

    if (immediate && isPolling) {
      fetchData();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [immediate, isPolling, fetchData]);

  // Effect for polling interval
  useEffect(() => {
    if (!isPolling) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(fetchData, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPolling, interval, fetchData]);

  return {
    data,
    error,
    isLoading,
    isPolling,
    refetch,
    start,
    stop,
  };
}

/**
 * Simplified hook for polling API endpoints
 */
export function useApiPolling<T>(
  endpoint: string,
  options: Omit<UsePollingOptions<T>, 'fetchFn'> = {}
): UsePollingResult<T> {
  const fetchFn = useCallback(async () => {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }, [endpoint]);

  return usePolling(fetchFn, options);
}
