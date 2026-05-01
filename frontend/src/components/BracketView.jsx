import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import BracketItemCard from './BracketItemCard';
import { Crown } from 'lucide-react';

/**
 * Visualizes a full bracket as a real tournament bracket —
 * proportional rounds + SVG "L"-shaped connector lines between
 * each child match and its two parent matches.
 *
 * Props:
 *   matches: match rows (include round_number, match_number, item_a_id, item_b_id, winner_item_id, status, is_bye_match)
 *   itemsById: map of itemId -> item
 *   votesByMatch: map of match_id -> { itemId: count }
 *   showVotePercents, yourPickItemId, finalWinnerId
 *   exportRef: optional ref forwarded to the outer wrapper (so admin can snapshot to PNG)
 */
export function BracketView({
  matches = [],
  itemsById = {},
  votesByMatch = {},
  showVotePercents = false,
  yourPickItemId = null,
  compact = false,
  finalWinnerId = null,
  exportRef = null,
}) {
  // Group matches by round
  const byRound = {};
  for (const m of matches) {
    byRound[m.round_number] = byRound[m.round_number] || [];
    byRound[m.round_number].push(m);
  }
  const rounds = Object.keys(byRound)
    .map((r) => parseInt(r, 10))
    .sort((a, b) => a - b);

  // Sort inside each round by match_number for stable pair-mapping to next round
  for (const rn of rounds) byRound[rn].sort((a, b) => a.match_number - b.match_number);

  // Container + per-match refs for line measurement
  const wrapRef = useRef(null);
  const matchRefs = useRef({});
  const [lines, setLines] = useState([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  const recompute = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const cRect = el.getBoundingClientRect();
    setSvgSize({ w: el.scrollWidth, h: el.scrollHeight });

    const newLines = [];
    for (const m of matches) {
      if (m.round_number < 2) continue;
      const prev = byRound[m.round_number - 1] || [];
      // Each child at match_number k has parents at 2k-1 and 2k in prev round.
      const pa = prev[(m.match_number - 1) * 2];
      const pb = prev[(m.match_number - 1) * 2 + 1];
      const childNode = matchRefs.current[m.id];
      const paNode = pa && matchRefs.current[pa.id];
      const pbNode = pb && matchRefs.current[pb.id];
      if (!childNode || !paNode || !pbNode) continue;
      const aR = paNode.getBoundingClientRect();
      const bR = pbNode.getBoundingClientRect();
      const cR = childNode.getBoundingClientRect();

      const scrollX = el.scrollLeft;
      const scrollY = el.scrollTop;
      const aX = aR.right - cRect.left + scrollX;
      const aY = aR.top + aR.height / 2 - cRect.top + scrollY;
      const bX = bR.right - cRect.left + scrollX;
      const bY = bR.top + bR.height / 2 - cRect.top + scrollY;
      const cX = cR.left - cRect.left + scrollX;
      const cY = cR.top + cR.height / 2 - cRect.top + scrollY;
      const midX = aX + Math.max(12, (cX - aX) / 2);
      const aClass = m.status === 'complete' && m.winner_item_id === pa?.winner_item_id ? 'cb-line cb-line--winner' : 'cb-line';
      const bClass = m.status === 'complete' && m.winner_item_id === pb?.winner_item_id ? 'cb-line cb-line--winner' : 'cb-line';
      // L-shaped path from parent-A to child
      newLines.push({
        key: `${m.id}-a`,
        d: `M ${aX} ${aY} H ${midX} V ${cY} H ${cX}`,
        cls: aClass,
      });
      // L-shaped path from parent-B to child (goes up instead of down)
      newLines.push({
        key: `${m.id}-b`,
        d: `M ${bX} ${bY} H ${midX} V ${cY} H ${cX}`,
        cls: bClass,
      });
    }
    setLines(newLines);
  }, [matches]); // eslint-disable-line

  useLayoutEffect(() => {
    recompute();
    // one more pass after layout settles (images loading, etc.)
    const t = setTimeout(recompute, 60);
    return () => clearTimeout(t);
  }, [recompute, rounds.length]);

  useEffect(() => {
    if (!wrapRef.current || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => recompute());
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [recompute]);

  if (rounds.length === 0) {
    return (
      <div data-testid="empty-state" className="text-center text-[color:var(--cb-muted)] py-10">
        No bracket yet.
      </div>
    );
  }

  // For seed-based upset detection
  function isUpset(m) {
    if (!m.winner_item_id) return false;
    const winner = itemsById[m.winner_item_id];
    const loserId = m.winner_item_id === m.item_a_id ? m.item_b_id : m.item_a_id;
    const loser = itemsById[loserId];
    if (!winner || !loser) return false;
    const ws = winner.seed_number || 9999;
    const ls = loser.seed_number || 9999;
    return ws > ls;
  }

  const COL_W = compact ? 240 : 280;
  const GAP_X = 44;

return (
  <div
    data-testid="bracket-view"
    ref={(node) => {
      wrapRef.current = node;
      if (exportRef) {
        if (typeof exportRef === 'function') exportRef(node);
        else exportRef.current = node;
      }
    }}
    className="cb-scroll relative w-full max-w-none overflow-auto pb-4"
    style={{
      minHeight: '75vh',
      height: '75vh',
    }}
  >
    <div
      className="relative flex items-stretch px-6 py-8"
      style={{
        width: 'max-content',
        minWidth: `${rounds.length * (COL_W + GAP_X)}px`,
        columnGap: GAP_X,
      }}
    >
        {/* SVG connectors overlay */}
        <svg
          className="pointer-events-none absolute inset-0"
          width={svgSize.w || '100%'}
          height={svgSize.h || '100%'}
          style={{ zIndex: 1 }}
          aria-hidden
        >
          {lines.map((l) => (
            <path key={l.key} d={l.d} className={l.cls} />
          ))}
        </svg>

        {rounds.map((rn) => {
          const ms = byRound[rn];
          const isFinalRound = rn === rounds[rounds.length - 1] && ms.length === 1;
          return (
            <div
              key={rn}
              data-testid={`round-column-${rn}`}
              className="relative flex flex-col justify-around py-2"
              style={{ width: COL_W, flex: '0 0 auto', zIndex: 2 }}
            >
              <div
                data-testid="round-column-header"
                className="absolute top-0 left-0 inline-flex items-center gap-2 rounded-full bg-[color:var(--cb-card)] border border-[color:var(--cb-border)] px-3 py-1 text-xs font-semibold text-[color:var(--cb-text)] shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
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
                    ref={(n) => { if (n) matchRefs.current[m.id] = n; }}
                    data-testid={`bracket-match-${m.id}`}
                    className="rounded-[14px] border border-[color:var(--cb-border)]/70 bg-[color:var(--cb-card)]/40 p-2 flex flex-col gap-2 my-2"
                  >
                    <BracketItemCard
                      item={a}
                      state={a ? stateFor(m.item_a_id) : 'bye'}
                      showYourPick={!!a && yourPickItemId === m.item_a_id}
                      showUpset={upset && m.winner_item_id === m.item_a_id}
                      votesPercent={showVotePercents && a ? aPct : undefined}
                    />
                    <div className="flex items-center justify-center text-[10px] uppercase tracking-widest text-[color:var(--cb-muted)]">vs</div>
                    <BracketItemCard
                      item={b}
                      state={b ? stateFor(m.item_b_id) : 'bye'}
                      showYourPick={!!b && yourPickItemId === m.item_b_id}
                      showUpset={upset && m.winner_item_id === m.item_b_id}
                      votesPercent={showVotePercents && b ? bPct : undefined}
                    />
                  </div>
                );
              })}
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
