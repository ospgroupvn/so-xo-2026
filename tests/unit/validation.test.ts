// Unit Tests for Validation Helpers
import { describe, it, expect } from 'vitest';
import {
  validateName,
  sanitizeName,
  validateTicketNumber,
  validateTicketNumbers,
  validateCreateTicketRequest,
  validateDate,
  normalizeTicketNumbers,
} from '../../src/utils/validation';

describe('Validation Helpers', () => {
  describe('validateName', () => {
    it('should accept valid names', () => {
      expect(validateName('Nguyễn Văn A')).toEqual({ valid: true, errors: [] });
      expect(validateName('John Doe')).toEqual({ valid: true, errors: [] });
      expect(validateName('A')).toEqual({ valid: true, errors: [] });
    });

    it('should reject non-string values', () => {
      expect(validateName(null).valid).toBe(false);
      expect(validateName(undefined).valid).toBe(false);
      expect(validateName(123).valid).toBe(false);
    });

    it('should reject empty names', () => {
      const result = validateName('');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject names with forbidden characters', () => {
      expect(validateName('<script>').valid).toBe(false);
      expect(validateName("O'Reilly").valid).toBe(false);
      expect(validateName('Test"Name').valid).toBe(false);
    });

    it('should reject names over 50 characters', () => {
      const longName = 'A'.repeat(51);
      expect(validateName(longName).valid).toBe(false);
    });
  });

  describe('sanitizeName', () => {
    it('should trim whitespace', () => {
      expect(sanitizeName('  John Doe  ')).toBe('John Doe');
    });

    it('should remove forbidden characters', () => {
      expect(sanitizeName('Test<Name>')).toBe('TestName');
    });

    it('should truncate to 50 characters', () => {
      const longName = 'A'.repeat(60);
      expect(sanitizeName(longName).length).toBe(50);
    });
  });

  describe('validateTicketNumber', () => {
    it('should accept valid 3-digit numbers', () => {
      expect(validateTicketNumber('000').valid).toBe(true);
      expect(validateTicketNumber('123').valid).toBe(true);
      expect(validateTicketNumber('999').valid).toBe(true);
    });

    it('should reject non-string values', () => {
      expect(validateTicketNumber(123).valid).toBe(false);
    });

    it('should reject numbers with wrong length', () => {
      expect(validateTicketNumber('12').valid).toBe(false);
      expect(validateTicketNumber('1234').valid).toBe(false);
    });

    it('should reject non-numeric strings', () => {
      expect(validateTicketNumber('abc').valid).toBe(false);
      expect(validateTicketNumber('12a').valid).toBe(false);
    });
  });

  describe('validateTicketNumbers', () => {
    it('should accept valid array of 2 numbers', () => {
      const result = validateTicketNumbers(['123', '456']);
      expect(result.valid).toBe(true);
    });

    it('should reject non-array values', () => {
      expect(validateTicketNumbers('123456').valid).toBe(false);
    });

    it('should reject arrays with wrong length', () => {
      expect(validateTicketNumbers(['123']).valid).toBe(false);
      expect(validateTicketNumbers(['123', '456', '789']).valid).toBe(false);
    });

    it('should reject invalid numbers in array', () => {
      expect(validateTicketNumbers(['ab', '456']).valid).toBe(false);
    });
  });

  describe('normalizeTicketNumbers', () => {
    it('should pad numbers with zeros', () => {
      expect(normalizeTicketNumbers(['1', '2'])).toEqual(['001', '002']);
    });

    it('should keep already normalized numbers', () => {
      expect(normalizeTicketNumbers(['123', '456'])).toEqual(['123', '456']);
    });
  });

  describe('validateCreateTicketRequest', () => {
    it('should accept valid request', () => {
      const result = validateCreateTicketRequest({
        name: 'John Doe',
        numbers: ['123', '456'],
      });
      expect(result.valid).toBe(true);
      expect(result.data?.name).toBe('John Doe');
    });

    it('should reject invalid body type', () => {
      expect(validateCreateTicketRequest(null).valid).toBe(false);
      expect(validateCreateTicketRequest('string').valid).toBe(false);
    });

    it('should sanitize and normalize data', () => {
      const result = validateCreateTicketRequest({
        name: '  John Doe  ',
        numbers: ['1', '45'],
      });
      expect(result.valid).toBe(true);
      expect(result.data?.name).toBe('John Doe');
      expect(result.data?.numbers).toEqual(['001', '045']);
    });
  });

  describe('validateDate', () => {
    it('should accept valid date format', () => {
      expect(validateDate('2026-02-23').valid).toBe(true);
    });

    it('should reject invalid format', () => {
      expect(validateDate('23-02-2026').valid).toBe(false);
      expect(validateDate('2026/02/23').valid).toBe(false);
    });

    it('should reject invalid dates', () => {
      expect(validateDate('2026-13-01').valid).toBe(false);
      expect(validateDate('2026-02-32').valid).toBe(false);
    });
  });
});
