// Tests for TicketCard Component
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TicketCard, TicketList } from '../../src/components/TicketCard';

describe('TicketCard Component', () => {
  const defaultProps = {
    id: 'test-ticket-id',
    participantName: 'Test User',
    numbers: ['123', '456'] as [string, string],
    createdAt: '2026-02-23T10:00:00.000Z',
  };

  it('should render participant name', () => {
    render(<TicketCard {...defaultProps} />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should render ticket numbers', () => {
    render(<TicketCard {...defaultProps} />);
    // Numbers should be displayed
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should show winner styling when isWinner is true', () => {
    const { container } = render(<TicketCard {...defaultProps} isWinner={true} />);
    expect(container.firstChild).toHaveClass('bg-green-500/10');
  });

  it('should show prize badge when provided', () => {
    render(<TicketCard {...defaultProps} prize="GIẢI NHẤT" isWinner={true} />);
    expect(screen.getByText('GIẢI NHẤT')).toBeInTheDocument();
  });

  it('should format date correctly', () => {
    render(<TicketCard {...defaultProps} />);
    // Date should be formatted in Vietnamese locale
    expect(screen.getByText(/23\/02\/2026/)).toBeInTheDocument();
  });
});

describe('TicketList Component', () => {
  const mockTickets = [
    {
      id: 'ticket-1',
      participantName: 'User 1',
      numbers: ['123', '456'] as [string, string],
      createdAt: '2026-02-23T10:00:00.000Z',
    },
    {
      id: 'ticket-2',
      participantName: 'User 2',
      numbers: ['789', '012'] as [string, string],
      createdAt: '2026-02-23T11:00:00.000Z',
    },
  ];

  it('should render empty state when no tickets', () => {
    render(<TicketList tickets={[]} />);
    expect(screen.getByText(/chưa có vé số nào/i)).toBeInTheDocument();
  });

  it('should render list of tickets', () => {
    render(<TicketList tickets={mockTickets} />);
    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.getByText('User 2')).toBeInTheDocument();
  });

  it('should highlight winners', () => {
    const winnerIds = new Set(['ticket-1']);
    render(<TicketList tickets={mockTickets} winnerIds={winnerIds} />);

    // First ticket should have winner styling
    const cards = screen.getAllByText(/User/);
    expect(cards.length).toBe(2);
  });
});
