// TicketCard Component
// Display component for showing a lottery ticket

import { cn } from '@/lib/utils';
import { Badge } from './layout/Layout';

interface TicketCardProps {
  id: string;
  participantName: string;
  numbers: [string, string];
  createdAt: string;
  prize?: string;
  isWinner?: boolean;
  className?: string;
}

export function TicketCard({
  id,
  participantName,
  numbers,
  createdAt,
  prize,
  isWinner = false,
  className,
}: TicketCardProps) {
  // Safety check for numbers
  if (!numbers || !Array.isArray(numbers) || numbers.length < 2) {
    return null;
  }

  const formattedDate = new Date(createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all',
        isWinner
          ? 'bg-green-500/10 border-green-500 shadow-lg shadow-green-500/20'
          : 'bg-card border-border',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-foreground">{participantName}</span>
        {prize && (
          <Badge variant="success" className="animate-pulse">
            {prize}
          </Badge>
        )}
      </div>

      {/* Numbers */}
      <div className="flex items-center justify-center gap-3 py-4">
        <div
          className={cn(
            'flex items-center gap-1',
            isWinner && 'animate-bounce'
          )}
        >
          {numbers[0].split('').map((digit, idx) => (
            <span
              key={`first-${idx}`}
              className={cn(
                'w-10 h-12 flex items-center justify-center',
                'text-xl font-bold rounded-md',
                'border',
                isWinner
                  ? 'bg-green-500 text-white border-green-600'
                  : 'bg-muted text-foreground border-border'
              )}
            >
              {digit}
            </span>
          ))}
        </div>
        <span className={cn('text-2xl font-bold', isWinner ? 'text-green-500' : 'text-muted-foreground')}>
          -
        </span>
        <div
          className={cn(
            'flex items-center gap-1',
            isWinner && 'animate-bounce'
          )}
        >
          {numbers[1].split('').map((digit, idx) => (
            <span
              key={`second-${idx}`}
              className={cn(
                'w-10 h-12 flex items-center justify-center',
                'text-xl font-bold rounded-md',
                'border',
                isWinner
                  ? 'bg-green-500 text-white border-green-600'
                  : 'bg-muted text-foreground border-border'
              )}
            >
              {digit}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Đăng ký: {formattedDate}</span>
        <span className="font-mono">#{id.slice(0, 8)}</span>
      </div>
    </div>
  );
}

// TicketList Component
interface Ticket {
  id: string;
  participantName: string;
  numbers: [string, string];
  createdAt: string;
  prize?: string;
}

interface TicketListProps {
  tickets: Ticket[];
  winnerIds?: Set<string>;
  className?: string;
}

export function TicketList({ tickets, winnerIds, className }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        <p>Chưa có vé số nào được đăng ký</p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          {...ticket}
          isWinner={winnerIds?.has(ticket.id)}
        />
      ))}
    </div>
  );
}
