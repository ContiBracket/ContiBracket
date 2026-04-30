import React from 'react';

export function StatusChip({ status }) {
  const map = {
    draft: { label: 'Draft', cls: 'bg-white/5 text-[color:var(--cb-muted)] border-[color:var(--cb-border)]' },
    live: { label: 'Live', cls: 'bg-[color:var(--cb-winner)]/15 text-[color:var(--cb-winner)] border-[color:var(--cb-winner)]/30' },
    paused: { label: 'Paused', cls: 'bg-[color:var(--cb-warning)]/15 text-[color:var(--cb-warning)] border-[color:var(--cb-warning)]/30' },
    complete: { label: 'Complete', cls: 'bg-[color:var(--cb-accent-2)]/15 text-[color:var(--cb-accent-2)] border-[color:var(--cb-accent-2)]/30' },
  };
  const v = map[status] || map.draft;
  return (
    <span
      data-testid={`status-chip-${status}`}
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${v.cls}`}
    >
      {v.label}
    </span>
  );
}

export default StatusChip;
