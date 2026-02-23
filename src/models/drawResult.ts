// DrawResult Model
// Factory functions for creating DrawResult entities

import type { DrawResult, PrizePair } from '../types/entities';

/**
 * Create a new empty DrawResult for a date
 */
export function createEmptyDrawResult(date: string): DrawResult {
  return {
    id: date,
    date,
    first: ['', ''] as PrizePair,
    second: [['', ''], ['', '']] as [PrizePair, PrizePair],
    third: [['', ''], ['', ''], ['', '']] as [PrizePair, PrizePair, PrizePair],
    fourth: [['', ''], ['', ''], ['', ''], ['', '']] as [PrizePair, PrizePair, PrizePair, PrizePair],
    allNumbers: [],
    fetchedCount: 0,
    status: 'partial',
    fetchedAt: null,
  };
}

/**
 * Update DrawResult with fetched numbers
 */
export function updateDrawResultWithNumbers(
  result: DrawResult,
  numbers: Partial<{
    first: PrizePair;
    second: [PrizePair, PrizePair];
    third: [PrizePair, PrizePair, PrizePair];
    fourth: [PrizePair, PrizePair, PrizePair, PrizePair];
  }>
): DrawResult {
  const updated = { ...result };

  if (numbers.first) {
    updated.first = numbers.first;
  }
  if (numbers.second) {
    updated.second = numbers.second;
  }
  if (numbers.third) {
    updated.third = numbers.third;
  }
  if (numbers.fourth) {
    updated.fourth = numbers.fourth;
  }

  // Calculate all numbers
  updated.allNumbers = extractAllNumbers(updated);

  // Update fetched count
  updated.fetchedCount = updated.allNumbers.filter((n) => n !== '').length;

  // Check if complete (20 numbers = 10 pairs)
  if (updated.fetchedCount >= 20) {
    updated.status = 'complete';
    updated.fetchedAt = new Date().toISOString();
  }

  return updated;
}

/**
 * Extract all numbers from prize categories
 */
function extractAllNumbers(result: DrawResult): string[] {
  const numbers: string[] = [];

  // First prize (1 pair = 2 numbers)
  numbers.push(...result.first);

  // Second prize (2 pairs = 4 numbers)
  result.second.forEach((pair) => numbers.push(...pair));

  // Third prize (3 pairs = 6 numbers)
  result.third.forEach((pair) => numbers.push(...pair));

  // Fourth prize (4 pairs = 8 numbers)
  result.fourth.forEach((pair) => numbers.push(...pair));

  return numbers;
}

/**
 * Get all pairs from DrawResult for matching
 */
export function getAllPairs(result: DrawResult): PrizePair[] {
  const pairs: PrizePair[] = [];

  pairs.push(result.first);
  pairs.push(...result.second);
  pairs.push(...result.third);
  pairs.push(...result.fourth);

  return pairs;
}

/**
 * Validate DrawResult data
 */
export function validateDrawResult(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid draw result data'] };
  }

  const result = data as Partial<DrawResult>;

  if (!result.id || typeof result.id !== 'string') {
    errors.push('Missing or invalid id');
  }

  if (!result.date || typeof result.date !== 'string') {
    errors.push('Missing or invalid date');
  }

  if (!Array.isArray(result.allNumbers)) {
    errors.push('allNumbers must be an array');
  }

  if (!['partial', 'complete'].includes(result.status || '')) {
    errors.push('status must be "partial" or "complete"');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
