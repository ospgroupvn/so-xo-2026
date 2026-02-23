// RegisterPage
// Page for registering new lottery tickets

import React, { useState, useCallback } from 'react';
import { Layout, Header } from '@/components/layout/Layout';
import { TicketInput } from '@/components/TicketInput';
import { TicketList } from '@/components/TicketCard';
import { api } from '@/services/api';
import type { TicketListResponse, CreateTicketRequest } from '../../../src/types/entities';

export function RegisterPage() {
  const [tickets, setTickets] = useState<TicketListResponse['tickets']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRegister = useCallback(
    async (name: string, numbers: [string, string]) => {
      setIsLoading(true);
      try {
        const response = await api.createTicket({ name, numbers });
        if (!response.success) {
          throw new Error(response.error?.message || 'Lỗi khi đăng ký vé số');
        }
        // Refresh tickets list
        setRefreshKey((k) => k + 1);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Fetch tickets on mount and after registration
  React.useEffect(() => {
    const fetchTickets = async () => {
      const response = await api.getTickets({ limit: 100 });
      if (response.success && response.data) {
        setTickets(response.data.tickets);
      }
    };
    fetchTickets();
  }, [refreshKey]);

  return (
    <Layout>
      <Header
        title="Đăng Ký Vé Số Max 3D+"
        subtitle="Nhập thông tin vé số của bạn để tham gia theo dõi kết quả"
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Registration Form */}
        <div>
          <TicketInput onSubmit={handleRegister} isLoading={isLoading} />
        </div>

        {/* Tickets List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Vé Số Đã Đăng Ký ({tickets.length})</h2>
          <TicketList tickets={tickets} />
        </div>
      </div>
    </Layout>
  );
}

export default RegisterPage;
