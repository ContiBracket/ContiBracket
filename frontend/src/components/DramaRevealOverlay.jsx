import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BracketItemCard from './BracketItemCard';
import { Crown, Sparkles, Zap } from 'lucide-react';

/**
 * DramaRevealOverlay
 *
 * Plays a one-at-a-time spotlight reveal of newly-completed matches.
 * Used by TV display mode when game.drama_mode is true.
 *
 * Props:
 *   queue: ordered array of match objects to reveal (each with item_a_id, item_b_id, winner_item_id)
 *   itemsById: map of itemId -> item
 *   onDone(): called after the last reveal animates out
 *   roundLabel: string e.g. "Round 2" or "Final"
 */
export default function DramaRevealOverlay({ queue, itemsById, onDone, roundLabel = 'Round' }) {
  const [idx, setIdx] = useState(0);
  const total = queue.length;
  const reduce = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  useEffect(() => {
    if (idx >= total) {
      const t = setTimeout(() => onDone && onDone(), reduce ? 100 : 700);
      return () => clearTimeout(t);
    }
    const dwell = reduce ? 350 : 1900; // time per reveal (ms)
    const t = setTimeout(() => setIdx((x) => x + 1), dwell);
    return () => clearTimeout(t);
  }, [idx, total, onDone, reduce]);

  if (total === 0) return null;
  const current = queue[Math.min(idx, total - 1)];
  if (!current) return null;
  const a = itemsById[current.item_a_id];
  const b = itemsById[current.item_b_id];
  const winnerId = current.winner_item_id;
  const winnerSide = winnerId === current.item_a_id ? 'a' : 'b';
  const winnerItem = itemsById[winnerId];

  return (
    <AnimatePresence>
      {idx < total && (
        <motion.div
          key="drama-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          data-testid="drama-overlay"
          className="fixed inset-0 z-[80] flex items-center justify-center px-6"
          style={{
            background:
              'radial-gradient(900px circle at 50% 40%, rgba(0,0,0,0.55), rgba(0,0,0,0.85) 55%, rgba(0,0,0,0.95))',
            backdropFilter: 'blur(6px)',
          }}
        >
          {/* Animated spotlight glow */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(700px circle at 50% 55%, rgba(255,79,216,0.18), transparent 55%), radial-gradient(700px circle at 50% 55%, rgba(46,242,179,0.10), transparent 60%)',
            }}
          />

          {/* Top banner */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full border border-[color:var(--cb-warning)]/40 bg-[color:var(--cb-warning)]/15 text-[color:var(--cb-warning)] px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5" />
            Drama Mode • {roundLabel} • Reveal {idx + 1} of {total}
          </div>

          {/* Matchup container */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.97 }}
              transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative w-full max-w-[1100px] grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 sm:gap-6 items-stretch"
            >
              <SidePanel item={a} winning={winnerSide === 'a'} side="left" />
              <div className="flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [0.85, 1.1, 1] }}
                  transition={{ duration: 0.8 }}
                  className="rounded-full border border-[color:var(--cb-border)] bg-[color:var(--cb-card)] px-4 py-2 text-sm sm:text-base font-display text-[color:var(--cb-muted)] shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
                >
                  VS
                </motion.div>
              </div>
              <SidePanel item={b} winning={winnerSide === 'b'} side="right" />
            </motion.div>
          </AnimatePresence>

          {/* Winner banner */}
          {winnerItem && (
            <motion.div
              key={`winner-${current.id}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.7, duration: 0.45 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full border border-[color:var(--cb-winner)]/40 bg-[color:var(--cb-winner)]/10 text-[color:var(--cb-winner)] px-5 py-3 font-display text-lg sm:text-xl shadow-[0_18px_70px_rgba(46,242,179,0.18)]"
            >
              <Crown className="w-5 h-5" />
              {winnerItem.name} advances
              <Sparkles className="w-4 h-4" />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SidePanel({ item, winning, side }) {
  if (!item) {
    return (
      <div className="rounded-[20px] border border-dashed border-[color:var(--cb-border)] py-10 text-center text-[color:var(--cb-muted)] uppercase tracking-widest">
        BYE
      </div>
    );
  }
  const reveal = winning ? 'show' : 'fade';
  return (
    <motion.div
      animate={reveal}
      variants={{
        show: {
          scale: 1.04,
          filter: 'brightness(1.05)',
          transition: { delay: 0.7, duration: 0.5 },
        },
        fade: {
          opacity: 0.5,
          filter: 'grayscale(0.3) brightness(0.85)',
          transition: { delay: 0.7, duration: 0.5 },
        },
      }}
      className="relative"
    >
      {winning && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 1, 0.7], scale: [0.85, 1.05, 1] }}
          transition={{ delay: 0.7, duration: 0.9 }}
          className="absolute -inset-2 rounded-[24px]"
          style={{
            background:
              'radial-gradient(400px circle at 50% 50%, rgba(46,242,179,0.35), transparent 60%)',
            filter: 'blur(12px)',
            zIndex: -1,
          }}
        />
      )}
      <div
        className={`rounded-[20px] border p-4 sm:p-6 ${
          winning
            ? 'border-[color:var(--cb-winner)] ring-2 ring-[color:var(--cb-winner)] bg-[color:var(--cb-card)]'
            : 'border-[color:var(--cb-border)] bg-[color:var(--cb-card)]'
        }`}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-[16px] object-cover bg-black/20 flex-none"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[16px] bg-gradient-to-br from-white/10 to-white/0 border border-white/10 flex-none flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white/60" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-display text-2xl sm:text-3xl tracking-tight truncate">{item.name}</div>
            {item.description && (
              <div className="text-sm text-[color:var(--cb-muted)] truncate">{item.description}</div>
            )}
          </div>
          {winning && (
            <Crown className="hidden sm:block w-7 h-7 flex-none text-[color:var(--cb-winner)]" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
