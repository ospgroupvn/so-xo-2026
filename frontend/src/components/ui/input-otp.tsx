// InputOTP Component (from shadcn/ui)
// A one-time password input component

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputOTPProps {
  maxLength: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface InputOTPContextValue {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  disabled?: boolean;
}

const InputOTPContext = React.createContext<InputOTPContextValue | null>(null);

function useInputOTP() {
  const context = React.useContext(InputOTPContext);
  if (!context) {
    throw new Error('InputOTP components must be used within InputOTP');
  }
  return context;
}

export function InputOTP({
  maxLength,
  value,
  onChange,
  disabled,
  className,
  children,
}: InputOTPProps) {
  return (
    <InputOTPContext.Provider value={{ value, onChange, maxLength, disabled }}>
      <div className={cn('flex items-center gap-2', className)}>{children}</div>
    </InputOTPContext.Provider>
  );
}

export interface InputOTPGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function InputOTPGroup({ children, className }: InputOTPGroupProps) {
  return <div className={cn('flex items-center', className)}>{children}</div>;
}

export interface InputOTPSlotProps {
  index: number;
  className?: string;
}

export function InputOTPSlot({ index, className }: InputOTPSlotProps) {
  const { value, onChange, maxLength, disabled } = useInputOTP();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const char = value[index] || '';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      const newValue = value.slice(0, -1);
      onChange(newValue);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = inputRef.current?.previousElementSibling as HTMLInputElement;
      prevInput?.focus();
    } else if (e.key === 'ArrowRight' && index < maxLength - 1) {
      const nextInput = inputRef.current?.nextElementSibling as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const inputValue = e.target.value;
    const digit = inputValue.replace(/\D/g, '').slice(-1);

    if (digit) {
      const newValue = value + digit;
      if (newValue.length <= maxLength) {
        onChange(newValue);
        // Move to next input
        if (index < maxLength - 1) {
          const nextInput = inputRef.current?.nextElementSibling as HTMLInputElement;
          nextInput?.focus();
        }
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, maxLength);
    onChange(digits);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={char}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onPaste={handlePaste}
      disabled={disabled}
      className={cn(
        'w-10 h-12 text-center text-lg font-semibold border border-input rounded-md',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-colors',
        char && 'bg-primary/10 border-primary',
        className
      )}
    />
  );
}

export interface InputOTPSeparatorProps {
  className?: string;
  children?: React.ReactNode;
}

export function InputOTPSeparator({ className, children }: InputOTPSeparatorProps) {
  return (
    <div className={cn('flex items-center justify-center px-2', className)}>
      {children || <span className="text-muted-foreground text-xl font-bold">-</span>}
    </div>
  );
}

// Utility function (should be in lib/utils.ts, but included here for completeness)
export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
