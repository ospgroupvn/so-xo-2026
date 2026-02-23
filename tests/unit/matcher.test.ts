// Unit Tests for Matcher Service
import { describe, it, expect } from 'vitest';
import { matchTicket } from '../../src/services/matcher';
import type { Ticket, DrawResult, Prize } from '../../src/types/entities';
import { Prize as PrizeEnum } from '../../src/types/entities';

describe('Matcher Service', () => {
  // Create mock draw result
  const createDrawResult = (overrides: Partial<DrawResult> = {}): DrawResult => ({
    id: '2026-02-23',
    date: '2026-02-23',
    first: ['123', '456'],
    second: [
      ['111', '222'],
      ['333', '444'],
    ],
    third: [
      ['555', '666'],
      ['777', '888'],
      ['999', '000'],
    ],
    fourth: [
      ['101', '202'],
      ['303', '404'],
      ['505', '606'],
      ['707', '808'],
    ],
    allNumbers: [],
    fetchedCount: 20,
    status: 'complete',
    fetchedAt: '2026-02-23T18:25:00.000Z',
    ...overrides,
  });

  // Create mock ticket
  const createTicket = (numbers: [string, string], id: string = 'test-ticket'): Ticket => ({
    id,
    participantId: 'participant-1',
    numbers,
    createdAt: '2026-02-23T10:00:00.000Z',
  });

  describe('First Prize (Giải nhất)', () => {
    it('should match first prize when both numbers match exactly', () => {
      const result = createDrawResult();
      const ticket = createTicket(['123', '456']);
      expect(matchTicket(ticket, result)).toBe(PrizeEnum.FIRST);
    });

    it('should match first prize when numbers match in different order', () => {
      const result = createDrawResult();
      const ticket = createTicket(['456', '123']);
      expect(matchTicket(ticket, result)).toBe(PrizeEnum.FIRST);
    });
  });

  describe('Second Prize (Giải nhì)', () => {
    it('should match second prize when both numbers match a second prize pair', () => {
      const result = createDrawResult();
      const ticket = createTicket(['111', '222']);
      expect(matchTicket(ticket, result)).toBe(PrizeEnum.SECOND);
    });

    it('should match second prize with different order', () => {
      const result = createDrawResult();
      const ticket = createTicket(['444', '333']);
      expect(matchTicket(ticket, result)).toBe(PrizeEnum.SECOND);
    });
  });

  describe('Third Prize (Giải ba)', () => {
    it('should match third prize when both numbers match a third prize pair', () => {
      const result = createDrawResult();
      const ticket = createTicket(['555', '666']);
      expect(matchTicket(ticket, result)).toBe(PrizeEnum.THIRD);
    });

    it('should match third prize for any of the three pairs', () => {
      const result = createDrawResult();
      const ticket = createTicket(['999', '000']);
      expect(matchTicket(ticket, result)).toBe(PrizeEnum.THIRD);
    });
  });

  describe('Fourth Prize (Giải tư)', () => {
    it('should match fourth prize when both numbers match a fourth prize pair', () => {
      const result = createDrawResult();
      const ticket = createTicket(['101', '202']);
      expect(matchTicket(ticket, result)).toBe(PrizeEnum.FOURTH);
    });
  });

  describe('Sixth Prize (Giải sáu)', () => {
    it('should match sixth prize when one number matches first prize', () => {
      const result = createDrawResult();
      const ticket = createTicket(['123', '999']); // 123 matches first prize pair
      expect(matchTicket(ticket, result)).toBe(PrizeEnum.SIXTH);
    });
  });

  describe('Seventh Prize (Giải bảy)', () => {
    it('should match seventh prize when one number matches second/third/fourth prize', () => {
      const result = createDrawResult();
      const ticket = createTicket(['111', '999']); // 111 matches second prize pair
      expect(matchTicket(ticket, result)).toBe(PrizeEnum.SEVENTH);
    });
  });

  describe('No Prize', () => {
    it('should return null when no numbers match', () => {
      const result = createDrawResult();
      const ticket = createTicket(['001', '002']);
      expect(matchTicket(ticket, result)).toBe(null);
    });
  });

  describe('Higher Prize Priority', () => {
    it('should return first prize (not sixth) when both numbers match first prize', () => {
      const result = createDrawResult();
      const ticket = createTicket(['123', '456']);
      // This should be first prize, not sixth
      expect(matchTicket(ticket, result)).toBe(PrizeEnum.FIRST);
    });
  });
});
