import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'inverted' | 'outlined';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type SharedButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
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
      className={cn('ui-button', className)}
      data-size={size}
      data-variant={variant}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
