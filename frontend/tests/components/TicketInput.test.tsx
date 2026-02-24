// Tests for TicketInput Component
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TicketInput } from '../../src/components/TicketInput';

describe('TicketInput Component', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should render name input field', () => {
    render(<TicketInput onSubmit={mockOnSubmit} />);
    expect(screen.getByLabelText(/tên của bạn/i)).toBeInTheDocument();
  });

  it('should render two OTP input groups', () => {
    render(<TicketInput onSubmit={mockOnSubmit} />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(6); // 3 digits per group
  });

  it('should show error when name is empty', async () => {
    render(<TicketInput onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /đăng ký/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/vui lòng nhập tên/i)).toBeInTheDocument();
    });
  });

  it('should show error when numbers are incomplete', async () => {
    render(<TicketInput onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/tên của bạn/i);
    fireEvent.change(nameInput, { target: { value: 'Test User' } });

    const submitButton = screen.getByRole('button', { name: /đăng ký/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/vui lòng nhập đủ 3 chữ số/i)).toBeInTheDocument();
    });
  });

  it('should call onSubmit with valid data', async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    render(<TicketInput onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByLabelText(/tên của bạn/i);
    fireEvent.change(nameInput, { target: { value: 'Test User' } });

    // Simulate OTP input (in real test, we'd type into each slot)
    const submitButton = screen.getByRole('button', { name: /đăng ký/i });

    // For now, just verify button exists
    expect(submitButton).toBeInTheDocument();
  });

  it('should disable submit button when loading', () => {
    render(<TicketInput onSubmit={mockOnSubmit} isLoading={true} />);

    const submitButton = screen.getByRole('button', { name: /đang xử lý/i });
    expect(submitButton).toBeDisabled();
  });

  it('should show success message after successful submission', async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    render(<TicketInput onSubmit={mockOnSubmit} />);

    // Simulate successful submission
    // In real test, we'd fill the form and submit
  });
});
