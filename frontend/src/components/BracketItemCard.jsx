import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles } from 'lucide-react';

export function BracketItemCard({
  item,
  state = 'default', // default | selected | winner | loser | bye
  byeLabel = 'BYE',
  showYourPick = false,
  showUpset = false,
  votesPercent,
  size = 'md', // md | lg
  onClick,
  testId,
}) {
  const isLg = size === 'lg';
  const padding = isLg ? 'p-4 sm:p-5' : 'p-3 sm:p-4';
  const titleSize = isLg ? 'text-base sm:text-lg' : 'text-sm sm:text-base';
  const imgSize = isLg ? 'h-14 w-14' : 'h-11 w-11';
  const interactive = !!onClick;

  const stateClasses = {
    default: 'border-[color:var(--cb-border)] bg-[color:var(--cb-card-2)]',
    selected: 'border-[color:var(--cb-accent)] ring-2 ring-[color:var(--cb-accent)] bg-[color:var(--cb-card-2)] shadow-[0_18px_60px_rgba(255,79,216,0.18)]',
    winner: 'border-[color:var(--cb-winner)] ring-2 ring-[color:var(--cb-winner)] bg-[color:var(--cb-card-2)] shadow-[0_18px_70px_rgba(46,242,179,0.18)]',
    loser: 'border-[color:var(--cb-border)] bg-[color:var(--cb-card-2)] opacity-60 grayscale-[0.15]',
    bye: 'border-dashed border-[color:var(--cb-border)] bg-transparent text-[color:var(--cb-muted)]',
  }[state];

  if (state === 'bye' || !item) {
    return (
      <div
        data-testid={testId || 'bracket-item-bye'}
        className={`relative w-full rounded-[16px] ${padding} ${stateClasses} flex items-center justify-center text-xs uppercase tracking-widest`}
      >
        {byeLabel}
      </div>
    );
  }

  const inlineColors = item.color_json && (item.color_json.bg || item.color_json.text || item.color_json.border) ? {
    backgroundColor: item.color_json.bg || undefined,
    color: item.color_json.text || undefined,
    borderColor: item.color_json.border || undefined,
  } : {};

  return (
    <motion.button
      type={interactive ? 'button' : undefined}
      onClick={onClick}
      disabled={!interactive}
      whileTap={interactive ? { scale: 0.985 } : undefined}
      whileHover={interactive ? { y: -2 } : undefined}
      data-testid={testId || 'bracket-item-card'}
      className={`group relative w-full text-left rounded-[16px] border ${padding} ${stateClasses} transition-[border-color,box-shadow,background-color] duration-200 ${interactive ? 'cursor-pointer hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--cb-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--cb-bg)]' : 'cursor-default'}`}
      style={inlineColors}
    >
      <div className="flex items-center gap-3">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className={`${imgSize} rounded-[12px] object-cover bg-black/20 flex-none`}
          />
        ) : (
          <div className={`${imgSize} rounded-[12px] bg-gradient-to-br from-white/10 to-white/0 border border-white/10 flex-none flex items-center justify-center`}>
            <Sparkles className="w-4 h-4 text-white/60" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className={`font-display ${titleSize} tracking-tight truncate`}>{item.name}</div>
          {item.description ? (
            <div className="text-xs text-[color:var(--cb-muted)] truncate">{item.description}</div>
          ) : null}
        </div>
        {state === 'winner' && (
          <div className="flex-none w-7 h-7 rounded-full bg-[color:var(--cb-winner)]/15 flex items-center justify-center">
            <Crown className="w-4 h-4 text-[color:var(--cb-winner)]" />
          </div>
        )}
      </div>

      {(showYourPick || showUpset || typeof votesPercent === 'number') && (
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {showYourPick && (
            <span
              data-testid="badge-your-pick"
              className="inline-flex items-center rounded-full bg-[color:var(--cb-accent)]/15 text-[color:var(--cb-accent)] px-2 py-0.5 text-xs font-medium"
            >
              Your pick
            </span>
          )}
          {showUpset && (
            <span
              data-testid="badge-upset"
              className="inline-flex items-center rounded-full bg-[color:var(--cb-warning)]/15 text-[color:var(--cb-warning)] px-2 py-0.5 text-xs font-medium"
            >
              UPSET
            </span>
          )}
          {typeof votesPercent === 'number' && (
            <div className="flex-1 min-w-[80px]">
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[color:var(--cb-accent-2)] transition-[width] duration-500"
                  style={{ width: `${Math.max(0, Math.min(100, votesPercent))}%` }}
                />
              </div>
              <div className="text-[10px] text-[color:var(--cb-muted)] mt-1">{Math.round(votesPercent)}%</div>
            </div>
          )}
        </div>
      )}
    </motion.button>
  );
}

export default BracketItemCard;
