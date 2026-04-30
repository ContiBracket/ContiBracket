import React from 'react';
import BracketItemCard from './BracketItemCard';
import { Crown } from 'lucide-react';

/**
 * Visualizes a full bracket: rounds rendered as horizontal columns.
 * itemsById: map of itemId -> item object
 * matches: list of match rows from DB
 * votesByMatch: map of match_id -> { itemId: count }
 * showVotePercents: boolean
 * yourPickItemId: optional, used for "Your pick" badge
 * loserFade: boolean, faded styling for losers
 */
export function BracketView({
  matches = [],
  itemsById = {},
  votesByMatch = {},
  showVotePercents = false,
  yourPickItemId = null,
  compact = false,
  finalWinnerId = null,
}) {
  // Group matches by round
  const byRound = {};
  for (const m of matches) {
    byRound[m.round_number] = byRound[m.round_number] || [];
    byRound[m.round_number].push(m);
  }
  const rounds = Object.keys(byRound).map((r) => parseInt(r, 10)).sort((a, b) => a - b);
  if (rounds.length === 0) {
    return (
      <div data-testid="empty-state" className="text-center text-[color:var(--cb-muted)] py-10">
        No bracket yet.
      </div>
    );
  }

  // for upset detection: lower seed number = higher rank. winner has higher seed_number than loser.
  function isUpset(m) {
    if (!m.winner_item_id) return false;
    const winner = itemsById[m.winner_item_id];
    const loserId = m.winner_item_id === m.item_a_id ? m.item_b_id : m.item_a_id;
    const loser = itemsById[loserId];
    if (!winner || !loser) return false;
    const ws = winner.seed_number || 9999;
    const ls = loser.seed_number || 9999;
    return ws > ls; // higher seed number means lower rank
  }

  return (
    <div data-testid="bracket-view" className="cb-scroll w-full overflow-x-auto pb-2">
      <div className="flex gap-6 pr-6 min-w-max">
        {rounds.map((rn) => {
          const ms = byRound[rn].slice().sort((a, b) => a.match_number - b.match_number);
          const isFinalRound = rn === rounds[rounds.length - 1] && ms.length === 1;
          return (
            <div
              key={rn}
              className={`flex flex-col ${compact ? 'min-w-[220px] sm:min-w-[260px]' : 'min-w-[260px] sm:min-w-[320px]'}`}
              data-testid={`round-column-${rn}`}
            >
              <div
                data-testid="round-column-header"
                className="sticky top-0 z-10 mb-3 inline-flex items-center gap-2 self-start rounded-full bg-[color:var(--cb-card)] border border-[color:var(--cb-border)] px-3 py-1 text-xs font-semibold text-[color:var(--cb-text)] shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
              >
                {isFinalRound ? (
                  <>
                    <Crown className="w-3 h-3 text-[color:var(--cb-winner)]" />
                    Final
                  </>
                ) : (
                  <>Round {rn}</>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {ms.map((m) => {
                  const a = itemsById[m.item_a_id];
                  const b = itemsById[m.item_b_id];
                  const tally = votesByMatch[m.id] || {};
                  const total = (tally[m.item_a_id] || 0) + (tally[m.item_b_id] || 0);
                  const aPct = total ? ((tally[m.item_a_id] || 0) / total) * 100 : null;
                  const bPct = total ? ((tally[m.item_b_id] || 0) / total) * 100 : null;
                  const upset = isUpset(m);

                  function stateFor(itemId) {
                    if (!itemId) return 'bye';
                    if (m.status === 'complete' && m.winner_item_id === itemId) return 'winner';
                    if (m.status === 'complete' && m.winner_item_id && m.winner_item_id !== itemId) return 'loser';
                    return 'default';
                  }

                  return (
                    <div
                      key={m.id}
                      className="rounded-[16px] border border-[color:var(--cb-border)]/70 bg-[color:var(--cb-card)]/40 p-2 flex flex-col gap-2"
                      data-testid={`bracket-match-${m.id}`}
                    >
                      <BracketItemCard
                        item={a}
                        state={a ? stateFor(m.item_a_id) : 'bye'}
                        showYourPick={!!a && yourPickItemId === m.item_a_id}
                        showUpset={upset && m.winner_item_id === m.item_a_id}
                        votesPercent={showVotePercents && a ? aPct : undefined}
                        size={compact ? 'md' : 'md'}
                      />
                      <div className="flex items-center justify-center text-[10px] uppercase tracking-widest text-[color:var(--cb-muted)]">vs</div>
                      <BracketItemCard
                        item={b}
                        state={b ? stateFor(m.item_b_id) : 'bye'}
                        showYourPick={!!b && yourPickItemId === m.item_b_id}
                        showUpset={upset && m.winner_item_id === m.item_b_id}
                        votesPercent={showVotePercents && b ? bPct : undefined}
                        size={compact ? 'md' : 'md'}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {finalWinnerId && itemsById[finalWinnerId] && (
        <div className="mt-6 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--cb-winner)]/10 border border-[color:var(--cb-winner)]/40 px-4 py-2 text-sm font-semibold text-[color:var(--cb-winner)]">
            <Crown className="w-4 h-4" /> Champion: {itemsById[finalWinnerId].name}
          </div>
        </div>
      )}
    </div>
  );
}

export default BracketView;
