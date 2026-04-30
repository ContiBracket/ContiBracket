import React from 'react';
import { motion } from 'framer-motion';

/**
 * One large CTA button styled per design tokens.
 */
export function BigCTAButton({
  children,
  variant = 'primary', // primary | secondary | ghost | danger
  className = '',
  testId,
  disabled,
  loading,
  type = 'button',
  onClick,
}) {
  const map = {
    primary:
      'bg-[color:var(--cb-accent)] text-black shadow-[0_10px_30px_rgba(255,79,216,0.22)] hover:shadow-[0_14px_44px_rgba(255,79,216,0.30)] hover:brightness-105',
    secondary:
      'bg-[color:var(--cb-card-2)] text-[color:var(--cb-text)] border border-[color:var(--cb-border)] hover:bg-[color:rgba(255,255,255,0.04)]',
    ghost:
      'bg-transparent text-[color:var(--cb-muted)] hover:text-[color:var(--cb-text)] hover:bg-white/5',
    danger:
      'bg-[color:var(--cb-danger)] text-black shadow-[0_10px_30px_rgba(255,77,109,0.25)] hover:brightness-110',
    success:
      'bg-[color:var(--cb-winner)] text-black shadow-[0_10px_30px_rgba(46,242,179,0.25)] hover:brightness-105',
  };
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      data-testid={testId}
      whileTap={!disabled ? { scale: 0.985 } : undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-[16px] px-5 py-3 text-sm font-semibold transition-[background-color,box-shadow,filter,border-color] duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cb-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--cb-bg)] ${map[variant]} ${className}`}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : null}
      {children}
    </motion.button>
  );
}

export default BigCTAButton;
