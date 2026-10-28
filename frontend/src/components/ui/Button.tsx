import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-DEFAULT/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5 rounded-2xl',
  };

  const variantStyles = {
    primary: 'bg-brand-DEFAULT hover:bg-brand-accent text-white shadow-lg shadow-brand-DEFAULT/25 hover:shadow-brand-DEFAULT/40',
    glow: 'bg-gradient-to-r from-brand-DEFAULT via-brand-accent to-brand-cyan text-white shadow-glow-indigo hover:shadow-glow-cyan hover:brightness-110',
    secondary: 'bg-surface-hover text-text-primary hover:bg-surface border border-border',
    outline: 'border border-border text-text-primary hover:bg-surface-hover hover:border-brand-DEFAULT/40',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-hover',
    danger: 'bg-status-error text-white hover:bg-red-600 shadow-md shadow-red-500/20',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      <span>{children}</span>
    </button>
  );
};
