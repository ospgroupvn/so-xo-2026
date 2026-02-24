// InputOTP Component (from shadcn/ui)
// A one-time password input component

import * as React from 'react';

// Utility function
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

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

  // Safety check for value
  const safeValue = value || '';
  const char = safeValue[index] || '';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (safeValue[index]) {
        // Clear current slot
        const newValue = safeValue.substring(0, index) + safeValue.substring(index + 1);
        onChange(newValue);
      } else if (index > 0) {
        // Move to previous and clear
        const newValue = safeValue.substring(0, index - 1);
        onChange(newValue);
        const prevInput = inputRef.current?.previousElementSibling as HTMLInputElement;
        prevInput?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      const prevInput = inputRef.current?.previousElementSibling as HTMLInputElement;
      prevInput?.focus();
    } else if (e.key === 'ArrowRight' && index < maxLength - 1) {
      e.preventDefault();
      const nextInput = inputRef.current?.nextElementSibling as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const inputValue = e.target.value;
    // Get only the last digit entered
    const digit = inputValue.replace(/\D/g, '').slice(-1);

    if (digit) {
      // Replace or insert at current index
      let newValue = safeValue.split('');
      // Ensure array is long enough
      while (newValue.length <= index) {
        newValue.push('');
      }
      newValue[index] = digit;
      const result = newValue.join('').slice(0, maxLength);
      onChange(result);

      // Move to next input
      if (index < maxLength - 1) {
        const nextInput = inputRef.current?.nextElementSibling as HTMLInputElement;
        nextInput?.focus();
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
