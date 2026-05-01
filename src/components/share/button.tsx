import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'inverted' | 'outlined';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type SharedButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const baseClasses =
  'inline-flex items-center justify-center rounded-md border font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-blue-700 bg-blue-700 text-neutral-50 hover:border-blue-600 hover:bg-blue-600 active:border-blue-800 active:bg-blue-800 disabled:border-blue-300 disabled:bg-blue-300 disabled:text-neutral-100',
  secondary:
    'border-neutral-100 bg-neutral-100 text-slate-700 hover:border-neutral-200 hover:bg-neutral-200 active:border-neutral-300 active:bg-neutral-300 disabled:border-neutral-100 disabled:bg-neutral-100 disabled:text-neutral-400',
  inverted:
    'border-slate-800 bg-slate-800 text-neutral-50 hover:border-slate-700 hover:bg-slate-700 active:border-slate-900 active:bg-slate-900 disabled:border-slate-300 disabled:bg-slate-300 disabled:text-neutral-100',
  outlined:
    'border-neutral-300 bg-transparent text-slate-700 hover:bg-neutral-100 active:border-neutral-400 active:bg-neutral-200 disabled:border-neutral-200 disabled:bg-transparent disabled:text-neutral-400',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 min-w-[104px] px-4 text-sm',
  md: 'h-10 min-w-[108px] px-5 text-base',
  lg: 'h-11 min-w-[112px] px-6 text-base',
};

function cn(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function SharedButton({
  children,
  className,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}: SharedButtonProps) {
  return (
    <button
      className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)}
      data-size={size}
      data-variant={variant}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
