// Tests for usePolling Hook
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePolling } from '../../src/hooks/usePolling';

describe('usePolling Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial null data', () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: 'test' });
    const { result } = renderHook(() => usePolling(fetchFn, { enabled: false }));

    expect(result.current.data).toBeNull();
    expect(result.current.isPolling).toBe(false);
  });

  it('should fetch data immediately when immediate is true', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: 'test' });
    const { result } = renderHook(() =>
      usePolling(fetchFn, { enabled: true, immediate: true, interval: 5000 })
    );

    await act(async () => {
      vi.runAllTimersAsync();
    });

    await waitFor(() => {
      expect(fetchFn).toHaveBeenCalled();
    });
  });

  it('should start polling when enabled', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: 'test' });
    const { result } = renderHook(() =>
      usePolling(fetchFn, { enabled: true, interval: 1000 })
    );

    expect(result.current.isPolling).toBe(true);
  });

  it('should stop polling when disabled', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: 'test' });
    const { result, rerender } = renderHook(
      ({ enabled }) => usePolling(fetchFn, { enabled, interval: 1000 }),
      { initialProps: { enabled: true } }
    );

    expect(result.current.isPolling).toBe(true);

    rerender({ enabled: false });

    expect(result.current.isPolling).toBe(false);
  });

  it('should handle errors gracefully', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('Network error'));
    const onError = vi.fn();

    const { result } = renderHook(() =>
      usePolling(fetchFn, { enabled: true, immediate: true, onError })
    );

    await act(async () => {
      vi.runAllTimersAsync();
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
  });

  it('should call onDataChange when data changes', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ value: 1 });
    const onDataChange = vi.fn();

    renderHook(() =>
      usePolling(fetchFn, {
        enabled: true,
        immediate: true,
        onDataChange,
        interval: 1000,
      })
    );

    await act(async () => {
      vi.runAllTimersAsync();
    });

    await waitFor(() => {
      expect(fetchFn).toHaveBeenCalled();
    });
  });

  it('should provide refetch function', () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: 'test' });
    const { result } = renderHook(() =>
      usePolling(fetchFn, { enabled: false })
    );

    expect(result.current.refetch).toBeDefined();
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should provide start and stop functions', () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: 'test' });
    const { result } = renderHook(() =>
      usePolling(fetchFn, { enabled: false })
    );

    expect(result.current.start).toBeDefined();
    expect(result.current.stop).toBeDefined();

    act(() => {
      result.current.start();
    });

    expect(result.current.isPolling).toBe(true);

    act(() => {
      result.current.stop();
    });

    expect(result.current.isPolling).toBe(false);
  });
});

// Import afterEach for cleanup
import { afterEach } from 'vitest';
