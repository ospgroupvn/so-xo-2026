// TicketInput Component
// Input component for entering lottery ticket numbers using OTP-style input

import React, { useState, useCallback } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from './ui/input-otp';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './layout/Layout';
import { cn } from '@/lib/utils';

interface TicketInputProps {
  onSubmit: (name: string, numbers: [string, string]) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export function TicketInput({ onSubmit, isLoading = false, className }: TicketInputProps) {
  const [name, setName] = useState('');
  const [firstNumber, setFirstNumber] = useState('');
  const [secondNumber, setSecondNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setSuccess(false);

    // Validate name
    if (!name.trim()) {
      setError('Vui lòng nhập tên của bạn');
      return;
    }

    if (name.trim().length > 50) {
      setError('Tên không được vượt quá 50 ký tự');
      return;
    }

    // Validate numbers
    if (firstNumber.length !== 3 || secondNumber.length !== 3) {
      setError('Vui lòng nhập đủ 3 chữ số cho mỗi bộ số');
      return;
    }

    try {
      await onSubmit(name.trim(), [firstNumber, secondNumber]);
      setSuccess(true);
      // Reset form
      setName('');
      setFirstNumber('');
      setSecondNumber('');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi đăng ký vé số');
    }
  }, [name, firstNumber, secondNumber, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && firstNumber.length === 3 && secondNumber.length === 3) {
        handleSubmit();
      }
    },
    [firstNumber, secondNumber, handleSubmit]
  );

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader>
        <CardTitle>Đăng Ký Vé Số</CardTitle>
        <CardDescription>Nhập tên và 2 bộ số vé Max 3D+ của bạn</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name Input */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Tên của bạn
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="VD: Nguyễn Văn A"
            maxLength={50}
            disabled={isLoading}
            className={cn(
              'w-full px-4 py-2 rounded-md border border-input bg-background',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'placeholder:text-muted-foreground'
            )}
          />
          <p className="text-xs text-muted-foreground">{name.length}/50 ký tự</p>
        </div>

        {/* Numbers Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Bộ số (3 chữ số mỗi bộ)</label>
          <div className="flex items-center justify-center gap-2">
            <InputOTP
              maxLength={3}
              value={firstNumber}
              onChange={setFirstNumber}
              disabled={isLoading}
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
              value={secondNumber}
              onChange={setSecondNumber}
              disabled={isLoading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Ví dụ: 123 - 456
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-600">Đăng ký vé số thành công!</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !name.trim() || firstNumber.length !== 3 || secondNumber.length !== 3}
          className={cn(
            'w-full px-4 py-2 rounded-md font-medium',
            'bg-primary text-primary-foreground',
            'hover:bg-primary/90',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors'
          )}
        >
          {isLoading ? 'Đang xử lý...' : 'Đăng Ký'}
        </button>
      </CardFooter>
    </Card>
  );
}
