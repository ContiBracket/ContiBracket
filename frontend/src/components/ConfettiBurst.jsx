import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export function ConfettiBurst({ enabled = true }) {
  const ranRef = useRef(false);
  useEffect(() => {
    if (!enabled || ranRef.current) return;
    ranRef.current = true;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    const fire = (particleRatio, opts) => {
      confetti({
        ...opts,
        origin: opts.origin || { y: 0.7 },
        particleCount: Math.floor(220 * particleRatio),
        zIndex: 9999,
      });
    };
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.9 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });

    const t = setTimeout(() => {
      fire(0.2, { spread: 80, origin: { x: 0.2, y: 0.6 } });
      fire(0.2, { spread: 80, origin: { x: 0.8, y: 0.6 } });
    }, 400);
    return () => clearTimeout(t);
  }, [enabled]);

  return <div data-testid="champion-confetti-layer" />;
}

export default ConfettiBurst;
