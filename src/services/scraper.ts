// Scraper Service
// HTML scraper for fetching lottery results from xskt.com.vn

import * as cheerio from 'cheerio';
import type { DrawResult, PrizePair } from '../types/entities';
import { createEmptyDrawResult, updateDrawResultWithNumbers } from '../models/drawResult';
import { logger } from '../utils/logger';

const XSKT_URL = 'https://xskt.com.vn/xsmax3d';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Fetch HTML content from xskt.com.vn
 */
async function fetchHtml(url: string = XSKT_URL): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.text();
}

/**
 * Parse 3-digit number from text
 */
function parseNumber(text: string): string {
  const cleaned = text.replace(/\D/g, '');
  return cleaned.padStart(3, '0').slice(-3);
}

/**
 * Parse pair of numbers from elements
 */
function parsePair(elements: cheerio.Cheerio): PrizePair {
  const nums: string[] = [];
  elements.each((_, el) => {
    const text = cheerio.default(el).text().trim();
    if (text) {
      nums.push(parseNumber(text));
    }
  });
  return [nums[0] || '', nums[1] || ''];
}

/**
 * Scrape lottery results from xskt.com.vn
 * Note: This is a best-effort implementation based on expected HTML structure
 * The actual selectors may need adjustment based on real HTML
 */
export async function scrapeResults(date?: string): Promise<DrawResult | null> {
  let retries = 0;
  let lastError: Error | null = null;

  while (retries < MAX_RETRIES) {
    try {
      logger.info(`Scraping results (attempt ${retries + 1}/${MAX_RETRIES})`);

      const html = await fetchHtml();
      const $ = cheerio.load(html);
      const resultDate = date || new Date().toISOString().split('T')[0];
      let result = createEmptyDrawResult(resultDate);

      // Try to find results in the page
      // Note: Selectors may need to be adjusted based on actual HTML structure

      // Look for results container
      const resultContainer = $('.box-ketqua').first();
      if (!resultContainer.length) {
        // Try alternative selectors
        const altContainer = $('.ketqua, .result-box, .xs-results').first();
        if (!altContainer.length) {
          logger.warn('Could not find results container on page');
          return null;
        }
      }

      // Parse prize categories
      // Note: These selectors are placeholders and need to be adjusted
      const container = resultContainer.length ? resultContainer : $('.box-ketqua, .ketqua, .result-box').first();

      // First prize (Giải nhất)
      const firstPrize = container.find('.giai-nhat, .first-prize, .prize-1');
      if (firstPrize.length) {
        const pair = parsePair(firstPrize.find('.so-ket-qua, .number, span'));
        if (pair[0] && pair[1]) {
          result = updateDrawResultWithNumbers(result, { first: pair });
        }
      }

      // Second prize (Giải nhì) - 2 pairs
      const secondPrize = container.find('.giai-nhi, .second-prize, .prize-2');
      if (secondPrize.length >= 2) {
        const pairs: PrizePair[] = [];
        secondPrize.each((idx, el) => {
          if (idx < 2) {
            const pair = parsePair($(el).find('.so-ket-qua, .number, span'));
            if (pair[0] && pair[1]) {
              pairs.push(pair);
            }
          }
        });
        if (pairs.length === 2) {
          result = updateDrawResultWithNumbers(result, { second: pairs as [PrizePair, PrizePair] });
        }
      }

      // Third prize (Giải ba) - 3 pairs
      const thirdPrize = container.find('.giai-ba, .third-prize, .prize-3');
      if (thirdPrize.length >= 3) {
        const pairs: PrizePair[] = [];
        thirdPrize.each((idx, el) => {
          if (idx < 3) {
            const pair = parsePair($(el).find('.so-ket-qua, .number, span'));
            if (pair[0] && pair[1]) {
              pairs.push(pair);
            }
          }
        });
        if (pairs.length === 3) {
          result = updateDrawResultWithNumbers(result, { third: pairs as [PrizePair, PrizePair, PrizePair] });
        }
      }

      // Fourth prize (Giải tư) - 4 pairs
      const fourthPrize = container.find('.giai-tu, .fourth-prize, .prize-4');
      if (fourthPrize.length >= 4) {
        const pairs: PrizePair[] = [];
        fourthPrize.each((idx, el) => {
          if (idx < 4) {
            const pair = parsePair($(el).find('.so-ket-qua, .number, span'));
            if (pair[0] && pair[1]) {
              pairs.push(pair);
            }
          }
        });
        if (pairs.length === 4) {
          result = updateDrawResultWithNumbers(result, { fourth: pairs as [PrizePair, PrizePair, PrizePair, PrizePair] });
        }
      }

      logger.info('Scraping completed', {
        fetchedCount: result.fetchedCount,
        status: result.status,
      });

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.warn(`Scraping attempt ${retries + 1} failed`, { error: lastError.message });
      retries++;
      if (retries < MAX_RETRIES) {
        await sleep(RETRY_DELAY * retries); // Exponential backoff
      }
    }
  }

  logger.error('All scraping attempts failed', lastError);
  return null;
}

/**
 * Fetch cycle - polls until results are complete
 */
export async function fetchResultsCycle(
  date: string,
  onProgress?: (count: number) => void,
  maxAttempts: number = 60
): Promise<DrawResult | null> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    logger.info(`Fetch cycle attempt ${attempt}/${maxAttempts}`);

    const result = await scrapeResults(date);
    if (result) {
      onProgress?.(result.fetchedCount);

      if (result.status === 'complete') {
        logger.info('Results fetch complete', { fetchedCount: result.fetchedCount });
        return result;
      }
    }

    if (attempt < maxAttempts) {
      await sleep(60000); // Wait 1 minute before next attempt
    }
  }

  logger.warn('Fetch cycle did not complete within max attempts');
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
