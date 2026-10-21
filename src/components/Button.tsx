import { Link } from 'react-router';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  to?: string;
  href?: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
}

export function Button({ 
  to, 
  href, 
  children, 
  className = '', 
  disabled,
  variant = 'primary',
  ...props 
}: ButtonProps) {
  
  // Height (44px) and radius (8px) mapped safely to CSS variables
  const baseStyles = "inline-flex items-center justify-center h-[var(--button-height)] px-6 font-bold rounded-[var(--radius)] transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--color-text)] focus-visible:ring-offset-[var(--focus-offset,2px)] focus-visible:ring-offset-white";
  
  // T04 Palette colors mapped via arbitrary values
  const variantStyles = {
    primary: "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]",
    secondary: "bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-border)]",
    outline: "bg-white text-[var(--color-accent)] border-2 border-[var(--color-accent)] hover:bg-[var(--color-surface)] hover:text-[var(--color-accent-hover)] hover:border-[var(--color-accent-hover)]",
    text: "bg-transparent text-[var(--color-accent)] hover:bg-[var(--color-surface)]"
  };

  const disabledStyles = "bg-[var(--color-surface)] text-[var(--color-text-muted)] cursor-not-allowed pointer-events-none";

  const stateStyles = disabled ? disabledStyles : variantStyles[variant];

  const combinedClassName = `${baseStyles} ${stateStyles} ${className}`.trim();

  if (to && !disabled) {
    return (
      <Link to={to} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  if (href && !disabled) {
    return (
      <a href={href} className={combinedClassName} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <button 
      className={combinedClassName} 
      disabled={disabled} 
      {...props}
    >
      {children}
    </button>
  );
}