// Input Validation Helpers
// Provides validation functions for all API inputs

import type { CreateTicketRequest, UpdateTicketRequest } from '../types/entities';

// ==================== Name Validation ====================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const FORBIDDEN_CHARS = /[`<>'"&]/;

export function validateName(name: unknown): ValidationResult {
  const errors: string[] = [];

  // Check type
  if (typeof name !== 'string') {
    errors.push('Tên phải là chuỗi ký tự');
    return { valid: false, errors };
  }

  // Check empty
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    errors.push('Tên không được để trống');
  }

  // Check length
  if (trimmed.length > 50) {
    errors.push('Tên không được vượt quá 50 ký tự');
  }

  // Check forbidden characters
  if (FORBIDDEN_CHARS.test(trimmed)) {
    errors.push('Tên không được chứa các ký tự đặc biệt (<, >, \', ", &)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function sanitizeName(name: string): string {
  return name
    .trim()
    .replace(FORBIDDEN_CHARS, '')
    .slice(0, 50);
}

// ==================== Ticket Numbers Validation ====================

const THREE_DIGIT_PATTERN = /^[0-9]{3}$/;

export function validateTicketNumber(number: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof number !== 'string') {
    errors.push('Số vé phải là chuỗi ký tự');
    return { valid: false, errors };
  }

  if (!THREE_DIGIT_PATTERN.test(number)) {
    errors.push('Số vé phải là 3 chữ số (000-999)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateTicketNumbers(numbers: unknown): ValidationResult {
  const errors: string[] = [];

  // Check array
  if (!Array.isArray(numbers)) {
    errors.push('Số vé phải là một mảng');
    return { valid: false, errors };
  }

  // Check length
  if (numbers.length !== 2) {
    errors.push('Phải có đúng 2 bộ số');
    return { valid: false, errors };
  }

  // Validate each number
  numbers.forEach((num, index) => {
    const result = validateTicketNumber(num);
    if (!result.valid) {
      errors.push(`Bộ số ${index + 1}: ${result.errors.join(', ')}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function normalizeTicketNumbers(numbers: [string, string]): [string, string] {
  return numbers.map((n) => n.padStart(3, '0')) as [string, string];
}

// ==================== Create Ticket Request Validation ====================

export function validateCreateTicketRequest(body: unknown): {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
  data?: CreateTicketRequest;
} {
  const errors: Array<{ field: string; message: string }> = [];

  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'body', message: 'Request body không hợp lệ' }],
    };
  }

  const request = body as Record<string, unknown>;

  // Validate name
  const nameResult = validateName(request.name);
  if (!nameResult.valid) {
    errors.push({ field: 'name', message: nameResult.errors.join(', ') });
  }

  // Validate numbers
  const numbersResult = validateTicketNumbers(request.numbers);
  if (!numbersResult.valid) {
    numbersResult.errors.forEach((err, idx) => {
      errors.push({ field: `numbers[${idx}]`, message: err });
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      name: sanitizeName(request.name as string),
      numbers: normalizeTicketNumbers(request.numbers as [string, string]),
    },
  };
}

// ==================== Update Ticket Request Validation ====================

export function validateUpdateTicketRequest(body: unknown): {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
  data?: UpdateTicketRequest;
} {
  const errors: Array<{ field: string; message: string }> = [];

  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'body', message: 'Request body không hợp lệ' }],
    };
  }

  const request = body as Record<string, unknown>;

  // Validate numbers
  const numbersResult = validateTicketNumbers(request.numbers);
  if (!numbersResult.valid) {
    numbersResult.errors.forEach((err, idx) => {
      errors.push({ field: `numbers[${idx}]`, message: err });
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      numbers: normalizeTicketNumbers(request.numbers as [string, string]),
    },
  };
}

// ==================== Pagination Validation ====================

export function validatePagination(query: Record<string, unknown>): {
  page: number;
  limit: number;
} {
  let page = 1;
  let limit = 50;

  if (typeof query.page === 'string') {
    const parsed = parseInt(query.page, 10);
    if (!isNaN(parsed) && parsed > 0) {
      page = parsed;
    }
  }

  if (typeof query.limit === 'string') {
    const parsed = parseInt(query.limit, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
      limit = parsed;
    }
  }

  return { page, limit };
}

// ==================== Date Validation ====================

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function validateDate(date: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof date !== 'string') {
    errors.push('Ngày phải là chuỗi ký tự');
    return { valid: false, errors };
  }

  if (!DATE_PATTERN.test(date)) {
    errors.push('Ngày phải có định dạng YYYY-MM-DD');
    return { valid: false, errors };
  }

  // Check if valid date
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    errors.push('Ngày không hợp lệ');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}
