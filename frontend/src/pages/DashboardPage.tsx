// DashboardPage
// Main dashboard displaying tickets, results, and winners

import React, { useState, useEffect } from 'react';
import { Layout, Header, Grid, Card, CardHeader, CardTitle, CardContent, Badge, Section } from '@/components/layout/Layout';
import { TicketList } from '@/components/TicketCard';
import { usePolling } from '@/hooks/usePolling';
import { api } from '@/services/api';
import type { TicketListResponse, DrawResult, WinnerResponse, Prize } from '../../../src/types/entities';

export function DashboardPage() {
  const [tickets, setTickets] = useState<TicketListResponse['tickets']>([]);
  const [results, setResults] = useState<DrawResult | null>(null);
  const [winners, setWinners] = useState<WinnerResponse['winners']>([]);

  // Poll for tickets
  const { data: ticketsData } = usePolling(
    async () => {
      const response = await api.getTickets({ limit: 100 });
      return response.success ? response.data : null;
    },
    { interval: 10000, enabled: true }
  );

  // Poll for results
  const { data: resultsData } = usePolling(
    async () => {
      const response = await api.getTodayResult();
      return response.success ? response.data : null;
    },
    { interval: 5000, enabled: true }
  );

  // Poll for winners
  const { data: winnersData } = usePolling(
    async () => {
      const response = await api.getWinners();
      return response.success ? response.data : null;
    },
    { interval: 5000, enabled: true }
  );

  // Update state when data changes
  useEffect(() => {
    if (ticketsData) setTickets(ticketsData.tickets);
  }, [ticketsData]);

  useEffect(() => {
    if (resultsData) setResults(resultsData);
  }, [resultsData]);

  useEffect(() => {
    if (winnersData) setWinners(winnersData.winners);
  }, [winnersData]);

  // Get winner ticket IDs for highlighting
  const winnerIds = new Set(winners.map((w) => w.id));

  // Group winners by prize
  const winnersByPrize = winners.reduce(
    (acc, w) => {
      const prize = w.prize;
      if (!acc[prize]) acc[prize] = [];
      acc[prize].push(w);
      return acc;
    },
    {} as Record<Prize, typeof winners>
  );

  return (
    <Layout>
      <Header
        title="Dashboard Xổ Số Max 3D+"
        subtitle="Theo dõi kết quả và vé số trong thời gian thực"
      />

      <Grid cols={2} className="mb-8">
        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Kết Quả Hôm Nay</CardTitle>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ngày: {results.date}</span>
                  <Badge variant={results.status === 'complete' ? 'success' : 'warning'}>
                    {results.status === 'complete' ? 'Hoàn thành' : 'Đang lấy...'}
                  </Badge>
                </div>

                {/* Display results by prize */}
                <div className="space-y-3">
                  <PrizeRow label="Giải Nhất" numbers={results.first} />
                  <PrizeRow label="Giải Nhì" numbers={results.second.flat()} />
                  <PrizeRow label="Giải Ba" numbers={results.third.flat()} />
                  <PrizeRow label="Giải Tư" numbers={results.fourth.flat()} />
                </div>

                <p className="text-xs text-muted-foreground">
                  Đã lấy: {results.fetchedCount}/20 bộ số
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">Chưa có kết quả</p>
            )}
          </CardContent>
        </Card>

        {/* Winners Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Người Trúng Giải ({winners.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {winners.length > 0 ? (
              <div className="space-y-2">
                {Object.entries(winnersByPrize).map(([prize, winnerList]) => (
                  <div key={prize} className="flex items-center justify-between">
                    <span className="font-medium">{prize}</span>
                    <Badge variant="success">{winnerList.length}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Chưa có người trúng giải</p>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Tickets Section */}
      <Section title={`Vé Số Đã Đăng Ký (${tickets.length})`}>
        <TicketList tickets={tickets} winnerIds={winnerIds} />
      </Section>

      {/* Winners List */}
      {winners.length > 0 && (
        <Section title="Chi Tiết Người Trúng Giải">
          <div className="space-y-4">
            {winners.map((winner) => (
              <WinnerCard key={winner.id} winner={winner} />
            ))}
          </div>
        </Section>
      )}
    </Layout>
  );
}

// Prize Row Component
function PrizeRow({ label, numbers }: { label: string; numbers: string[] }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium w-24">{label}:</span>
      <div className="flex gap-1 flex-wrap">
        {numbers.filter((n) => n).map((num, idx) => (
          <span
            key={idx}
            className="px-2 py-1 bg-primary/10 rounded text-sm font-mono"
          >
            {num}
          </span>
        ))}
      </div>
    </div>
  );
}

// Winner Card Component
function WinnerCard({ winner }: { winner: WinnerResponse['winners'][0] }) {
  return (
    <Card className="border-green-500 bg-green-500/5">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{winner.participantName}</p>
            <p className="text-sm text-muted-foreground">
              {winner.ticketNumbers[0]} - {winner.ticketNumbers[1]}
            </p>
          </div>
          <Badge variant="success">{winner.prize}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default DashboardPage;
