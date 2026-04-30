import React from 'react';
import { motion } from 'framer-motion';

export function GlowCard({ children, className = '', testId, as = 'div', whileHover, ...rest }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      data-testid={testId}
      className={`relative cb-glow-halo rounded-[18px] bg-[color:var(--cb-card)] border border-[color:var(--cb-border)] shadow-[0_18px_60px_rgba(0,0,0,0.55)] ${className}`}
      whileHover={whileHover}
      {...rest}
    >
      <span className="pointer-events-none absolute inset-0 rounded-[18px] ring-1 ring-inset ring-white/5" />
      <div className="relative z-[1]">{children}</div>
    </Comp>
  );
}

export default GlowCard;
