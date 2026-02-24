// API Client Service
// Provides HTTP client for backend API communication

import type {
  ApiResponse,
  TicketResponse,
  TicketListResponse,
  DrawResult,
  FetchResultResponse,
  WinnerResponse,
  CreateTicketRequest,
  UpdateTicketRequest,
  PaginationParams,
} from '../../../src/types/entities';

// @ts-ignore - Vite env
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'https://so-khop-xo-so.namnhcntt.workers.dev/api/v1';

// ==================== HTTP Client ====================

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || { code: 'UNKNOWN_ERROR', message: 'Lỗi không xác định' },
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Lỗi kết nối mạng',
        },
      };
    }
  }

  // ==================== Tickets API ====================

  async createTicket(
    data: CreateTicketRequest
  ): Promise<ApiResponse<TicketResponse>> {
    return this.request<TicketResponse>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTickets(
    params?: PaginationParams
  ): Promise<ApiResponse<TicketListResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const query = searchParams.toString();
    return this.request<TicketListResponse>(`/tickets${query ? `?${query}` : ''}`);
  }

  async updateTicket(
    id: string,
    data: UpdateTicketRequest,
    adminSecret: string
  ): Promise<ApiResponse<TicketResponse>> {
    return this.request<TicketResponse>(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'X-Admin-Secret': adminSecret,
      },
    });
  }

  async deleteTicket(id: string, adminSecret: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/tickets/${id}`, {
      method: 'DELETE',
      headers: {
        'X-Admin-Secret': adminSecret,
      },
    });
  }

  // ==================== Results API ====================

  async getTodayResult(): Promise<ApiResponse<DrawResult>> {
    return this.request<DrawResult>('/results/today');
  }

  async getResultByDate(date: string): Promise<ApiResponse<DrawResult>> {
    return this.request<DrawResult>(`/results/${date}`);
  }

  async triggerFetch(force: boolean = false): Promise<ApiResponse<FetchResultResponse>> {
    return this.request<FetchResultResponse>('/results/fetch', {
      method: 'POST',
      body: JSON.stringify({ force }),
    });
  }

  // ==================== Winners API ====================

  async getWinners(
    date?: string,
    prize?: string
  ): Promise<ApiResponse<WinnerResponse>> {
    const searchParams = new URLSearchParams();
    if (date) searchParams.set('date', date);
    if (prize) searchParams.set('prize', prize);

    const query = searchParams.toString();
    return this.request<WinnerResponse>(`/winners${query ? `?${query}` : ''}`);
  }

  // ==================== Health API ====================

  async checkHealth(): Promise<
    ApiResponse<{
      status: 'ok' | 'degraded';
      timestamp: string;
      services: { kv: string; scheduler: string };
    }>
  > {
    return this.request('/health');
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export class for testing
export { ApiClient };
