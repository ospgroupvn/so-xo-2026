// AdminPage
// Admin interface for managing tickets

import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Header, Card, CardHeader, CardTitle, CardContent, CardFooter, Badge } from '@/components/layout/Layout';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';
import type { TicketListResponse, ApiResponse } from '../../../src/types/entities';

export function AdminPage() {
  const [adminSecret, setAdminSecret] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tickets, setTickets] = useState<TicketListResponse['tickets']>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [editNumbers, setEditNumbers] = useState<[string, string]>(['', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load tickets
  useEffect(() => {
    const fetchTickets = async () => {
      const response = await api.getTickets({ limit: 100 });
      if (response.success && response.data) {
        setTickets(response.data.tickets);
      }
    };
    fetchTickets();
  }, []);

  // Handle authentication
  const handleAuthenticate = () => {
    if (adminSecret.trim()) {
      setIsAuthenticated(true);
      setMessage(null);
    }
  };

  // Handle ticket selection for editing
  const handleSelectTicket = (ticketId: string, numbers: [string, string]) => {
    setSelectedTicket(ticketId);
    setEditNumbers(numbers);
  };

  // Handle update ticket
  const handleUpdateTicket = useCallback(async () => {
    if (!selectedTicket || !adminSecret) return;
    if (editNumbers[0].length !== 3 || editNumbers[1].length !== 3) {
      setMessage({ type: 'error', text: 'Vui lòng nhập đủ 3 chữ số cho mỗi bộ' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.updateTicket(selectedTicket, editNumbers, adminSecret);
      if (response.success) {
        setMessage({ type: 'success', text: 'Cập nhật vé số thành công!' });
        // Refresh tickets
        const ticketsResponse = await api.getTickets({ limit: 100 });
        if (ticketsResponse.success && ticketsResponse.data) {
          setTickets(ticketsResponse.data.tickets);
        }
        setSelectedTicket(null);
      } else {
        setMessage({ type: 'error', text: response.error?.message || 'Lỗi khi cập nhật vé số' });
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedTicket, editNumbers, adminSecret]);

  // Handle delete ticket
  const handleDeleteTicket = useCallback(
    async (ticketId: string) => {
      if (!adminSecret) return;
      if (!confirm('Bạn có chắc chắn muốn xóa vé số này?')) return;

      setIsLoading(true);
      try {
        const response = await api.deleteTicket(ticketId, adminSecret);
        if (response.success) {
          setMessage({ type: 'success', text: 'Xóa vé số thành công!' });
          // Refresh tickets
          const ticketsResponse = await api.getTickets({ limit: 100 });
          if (ticketsResponse.success && ticketsResponse.data) {
            setTickets(ticketsResponse.data.tickets);
          }
        } else {
          setMessage({ type: 'error', text: response.error?.message || 'Lỗi khi xóa vé số' });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [adminSecret]
  );

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-20">
          <Card>
            <CardHeader>
              <CardTitle>Admin Login</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Admin Secret</label>
                  <input
                    type="password"
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAuthenticate()}
                    placeholder="Nhập mật mã admin"
                    className={cn(
                      'w-full mt-2 px-4 py-2 rounded-md border border-input bg-background',
                      'focus:outline-none focus:ring-2 focus:ring-ring'
                    )}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <button
                onClick={handleAuthenticate}
                disabled={!adminSecret.trim()}
                className={cn(
                  'w-full px-4 py-2 rounded-md font-medium',
                  'bg-primary text-primary-foreground',
                  'hover:bg-primary/90',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                Đăng Nhập
              </button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header title="Admin Panel" subtitle="Quản lý vé số đã đăng ký" />

      {/* Message */}
      {message && (
        <div
          className={cn(
            'mb-4 p-4 rounded-md',
            message.type === 'success' ? 'bg-green-500/10 border border-green-500' : 'bg-red-500/10 border border-red-500'
          )}
        >
          <p className={message.type === 'success' ? 'text-green-600' : 'text-red-600'}>{message.text}</p>
        </div>
      )}

      {/* Edit Form */}
      {selectedTicket && (
        <Card className="mb-6 border-blue-500">
          <CardHeader>
            <CardTitle>Chỉnh Sửa Vé Số</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-2">
              <InputOTP
                maxLength={3}
                value={editNumbers[0]}
                onChange={(v) => setEditNumbers([v, editNumbers[1]])}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
              </InputOTP>
              <InputOTPSeparator />
              <InputOTP
                maxLength={3}
                value={editNumbers[1]}
                onChange={(v) => setEditNumbers([editNumbers[0], v])}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <button
              onClick={handleUpdateTicket}
              disabled={isLoading}
              className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
            >
              Lưu
            </button>
            <button
              onClick={() => setSelectedTicket(null)}
              className="px-4 py-2 rounded-md border hover:bg-muted"
            >
              Hủy
            </button>
          </CardFooter>
        </Card>
      )}

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{ticket.participantName}</p>
                  <p className="text-lg font-mono">
                    {ticket.numbers[0]} - {ticket.numbers[1]}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ID: {ticket.id.slice(0, 8)}...
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSelectTicket(ticket.id, ticket.numbers)}
                    className="px-3 py-1 rounded-md bg-blue-500 text-white text-sm hover:bg-blue-600"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteTicket(ticket.id)}
                    disabled={isLoading}
                    className="px-3 py-1 rounded-md bg-red-500 text-white text-sm hover:bg-red-600"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tickets.length === 0 && (
        <p className="text-center text-muted-foreground py-8">Chưa có vé số nào</p>
      )}
    </Layout>
  );
}

export default AdminPage;
