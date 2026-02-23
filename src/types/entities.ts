// Type definitions cho Hệ Thống Theo Dõi Xổ Số Max 3D+
// Generated from data-model.md

// ==================== Participant ====================

export interface Participant {
  // Primary key: UUID v4
  id: string;

  // Tên người dùng (đã được sanitization)
  // - Trim whitespace
  // - Max 50 characters
  // - Filter HTML/JS characters
  name: string;

  // Danh sách ID các vé số đã đăng ký
  ticketIds: string[];

  // Thời điểm tạo
  createdAt: string; // ISO 8601
}

// ==================== Ticket ====================

export interface Ticket {
  // Primary key: UUID v4
  id: string;

  // Foreign key to Participant
  participantId: string;

  // 2 bộ số, mỗi bộ là string 3 chữ số
  // Ví dụ: ["123", "456"]
  numbers: [string, string];

  // Thời điểm tạo
  createdAt: string; // ISO 8601
}

// ==================== DrawResult ====================

export type PrizePair = [string, string];

export interface DrawResult {
  // Primary key: Date string (YYYY-MM-DD)
  id: string; // "2026-02-23"

  // Ngày quay số
  date: string; // "2026-02-23"

  // Giải nhất: 2 bộ số (1 cặp)
  first: PrizePair;

  // Giải nhì: 2 cặp, mỗi cặp 2 bộ số
  second: [PrizePair, PrizePair];

  // Giải ba: 3 cặp, mỗi cặp 2 bộ số
  third: [PrizePair, PrizePair, PrizePair];

  // Giải tư: 4 cặp, mỗi cặp 2 bộ số
  fourth: [PrizePair, PrizePair, PrizePair, PrizePair];

  // Tất cả 20 bộ số (flat array) để kiểm tra giải năm
  allNumbers: string[]; // 20 elements

  // Số lượng bộ số đã lấy (progress indicator)
  fetchedCount: number;

  // Trạng thái fetch
  status: 'partial' | 'complete';

  // Thời điểm fetch hoàn thành
  fetchedAt: string | null; // ISO 8601
}

// ==================== WinNotification ====================

export enum Prize {
  FIRST = 'GIẢI NHẤT',
  SECOND = 'GIẢI NHÌ',
  THIRD = 'GIẢI BA',
  FOURTH = 'GIẢI TƯ',
  FIFTH = 'GIẢI NĂM',
  SIXTH = 'GIẢI SÁU',
  SEVENTH = 'GIẢI BẢY',
}

export interface WinNotification {
  // Primary key: UUID v4
  id: string;

  // Foreign key to Ticket
  ticketId: string;

  // Foreign key to Participant
  participantId: string;

  // Tên người trúng (denormalized for display)
  participantName: string;

  // Vé số trúng (denormalized for display)
  ticketNumbers: [string, string];

  // Giải thưởng
  prize: Prize;

  // Ngày quay số
  drawDate: string;

  // Đã gửi webhook chưa
  webhookSent: boolean;

  // Thời điểm tạo thông báo
  createdAt: string; // ISO 8601
}

// ==================== API Types ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown> | Array<{ field: string; message: string }>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== Cloudflare Worker Types ====================

export interface Env {
  KV: KVNamespace;
  ENVIRONMENT: string;
  ADMIN_SECRET?: string;
  LARK_WEBHOOK_URL?: string;
}

// ==================== Ticket API Types ====================

export interface CreateTicketRequest {
  name: string;
  numbers: [string, string];
}

export interface UpdateTicketRequest {
  numbers: [string, string];
}

export interface TicketResponse {
  id: string;
  participantId: string;
  name: string;
  numbers: [string, string];
  createdAt: string;
}

export interface TicketListResponse {
  tickets: Array<{
    id: string;
    participantName: string;
    numbers: [string, string];
    createdAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== Results API Types ====================

export interface FetchResultRequest {
  force?: boolean;
}

export interface FetchResultResponse {
  message: string;
  status: 'in_progress' | 'complete' | 'error';
  fetchedCount: number;
}

// ==================== Winners API Types ====================

export interface WinnerResponse {
  date: string;
  winners: Array<{
    id: string;
    participantName: string;
    ticketNumbers: [string, string];
    prize: Prize;
    webhookSent: boolean;
    createdAt: string;
  }>;
  summary: Record<Prize, number> & { total: number };
}
