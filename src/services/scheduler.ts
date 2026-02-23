// Scheduler Service
// Handles cron-triggered fetch cycles

import type { Env, DrawResult } from '../types/entities';
import { logger } from '../utils/logger';
import { getDrawResult, saveDrawResult } from './kv';
import { scrapeResults, fetchResultsCycle } from './scraper';
import { matchAllTickets } from './matcher';

/**
 * Start the fetch cycle for lottery results
 * Called by cron trigger or manual API call
 */
export async function startFetchCycle(
  env: Env,
  force: boolean = false
): Promise<{ status: string; fetchedCount: number; message: string }> {
  const today = new Date().toISOString().split('T')[0];

  logger.info('Starting fetch cycle', { date: today, force });

  // Check if already fetched today (unless forced)
  if (!force) {
    const existing = await getDrawResult(env.KV, today);
    if (existing && existing.status === 'complete') {
      logger.info('Results already fetched for today', { date: today });
      return {
        status: 'already_complete',
        fetchedCount: existing.fetchedCount,
        message: 'Kết quả đã được lấy đầy đủ cho hôm nay',
      };
    }
  }

  // Perform fetch
  const result = await scrapeResults(today);

  if (result) {
    await saveDrawResult(env.KV, result);
    logger.info('Saved fetch result', { fetchedCount: result.fetchedCount, status: result.status });

    // If complete, run matcher
    if (result.status === 'complete') {
      await matchAllTickets(env, result);
    }

    return {
      status: result.status,
      fetchedCount: result.fetchedCount,
      message: result.status === 'complete'
        ? 'Lấy kết quả thành công'
        : `Đã lấy ${result.fetchedCount}/20 bộ số`,
    };
  }

  // If initial fetch failed, start polling cycle
  logger.info('Initial fetch incomplete, starting polling cycle');

  const completeResult = await fetchResultsCycle(
    today,
    async (count) => {
      logger.info('Fetch progress', { count });
    },
    60 // 60 minutes max
  );

  if (completeResult) {
    await saveDrawResult(env.KV, completeResult);
    logger.info('Saved complete fetch result', { fetchedCount: completeResult.fetchedCount });

    // Run matcher
    await matchAllTickets(env, completeResult);

    return {
      status: completeResult.status,
      fetchedCount: completeResult.fetchedCount,
      message: 'Lấy kết quả thành công',
    };
  }

  return {
    status: 'error',
    fetchedCount: 0,
    message: 'Không thể lấy kết quả',
  };
}

/**
 * Manual fetch trigger (for testing)
 */
export async function triggerManualFetch(env: Env, force: boolean = false): Promise<{
  success: boolean;
  message: string;
  status: string;
  fetchedCount: number;
}> {
  try {
    const result = await startFetchCycle(env, force);
    return {
      success: true,
      ...result,
    };
  } catch (error) {
    logger.error('Manual fetch failed', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Lỗi không xác định',
      status: 'error',
      fetchedCount: 0,
    };
  }
}

/**
 * Check if today is a draw day (Wednesday or Saturday)
 */
export function isDrawDay(): boolean {
  const day = new Date().getDay();
  return day === 3 || day === 6; // 3 = Wednesday, 6 = Saturday
}

/**
 * Get next draw day
 */
export function getNextDrawDay(): Date {
  const today = new Date();
  const currentDay = today.getDay();

  // Days until next draw (Wednesday = 3, Saturday = 6)
  let daysUntilDraw: number;
  if (currentDay < 3) {
    daysUntilDraw = 3 - currentDay;
  } else if (currentDay < 6) {
    daysUntilDraw = 6 - currentDay;
  } else {
    daysUntilDraw = 7 - currentDay + 3; // Next Wednesday
  }

  const nextDraw = new Date(today);
  nextDraw.setDate(today.getDate() + daysUntilDraw);
  return nextDraw;
}
