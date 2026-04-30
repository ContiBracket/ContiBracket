import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import BracketView from '@/components/BracketView';
import LoadingScreen from '@/components/LoadingScreen';
import DramaRevealOverlay from '@/components/DramaRevealOverlay';
import { getGameBySlug } from '@/lib/db';
import { loadBracketData } from '@/lib/bracketService';
import { Crown, Tv, Zap } from 'lucide-react';

const REVEALED_KEY = (slug) => `cb_drama_revealed_${slug}`;

function loadRevealedSet(slug) {
  try {
    const raw = localStorage.getItem(REVEALED_KEY(slug));
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch { return new Set(); }
}
function saveRevealedSet(slug, set) {
  try { localStorage.setItem(REVEALED_KEY(slug), JSON.stringify(Array.from(set))); } catch {}
}

/**
 * Fullscreen TV/display mode — minimal chrome, big bracket, no admin or emails.
 * Office Drama Mode: when game.drama_mode is on and a round is closed,
 * the TV reveals each match's winner one at a time with a spotlight pulse,
 * then resumes normal bracket display.
 */
export default function DisplayMode() {
  const { slug } = useParams();
  const [game, setGame] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [revealQueue, setRevealQueue] = useState([]);
  const [revealRoundLabel, setRevealRoundLabel] = useState('');
  const revealedRef = useRef(null);

  // Initialize revealed set from localStorage once per slug.
  useEffect(() => {
    revealedRef.current = loadRevealedSet(slug);
  }, [slug]);

  async function reload() {
    try {
      const g = await getGameBySlug(slug);
      if (!g) { setErr('Game not found'); setLoading(false); return; }
      setGame(g);
      const d = await loadBracketData(g.id);
      setData(d);
      setLoading(false);

      // Drama Mode reveal detection:
      if (g.drama_mode && revealedRef.current) {
        const revealed = revealedRef.current;
        // Find newly-complete (non-bye, with both items) matches we haven't revealed.
        const newMatches = (d.matches || [])
          .filter(
            (m) =>
              m.status === 'complete' &&
              !m.is_bye_match &&
              m.item_a_id &&
              m.item_b_id &&
              !revealed.has(m.id)
          )
          // Order by round, then match_number for stable reveal sequence
          .sort((a, b) => a.round_number - b.round_number || a.match_number - b.match_number);

        if (newMatches.length > 0) {
          // If we're already mid-reveal, don't restart — just append.
          setRevealQueue((prev) => {
            // Preserve existing in-flight queue, but skip any duplicates.
            const seen = new Set(prev.map((m) => m.id));
            const merged = [...prev];
            for (const m of newMatches) if (!seen.has(m.id)) merged.push(m);
            return merged;
          });
          // Decide a friendly round label from the first new match.
          const firstRound = newMatches[0].round_number;
          const allRounds = [...new Set((d.matches || []).map((x) => x.round_number))].sort((a, b) => a - b);
          const isFinal = firstRound === allRounds[allRounds.length - 1] && (d.matches || []).filter((x) => x.round_number === firstRound).length === 1;
          setRevealRoundLabel(isFinal ? 'Final' : `Round ${firstRound}`);
        }
      } else if (!g.drama_mode) {
        // Drama mode is off: mark every currently-complete match as already revealed
        // so a future toggle doesn't replay history.
        const revealed = revealedRef.current || new Set();
        for (const m of (d.matches || [])) if (m.status === 'complete' && !m.is_bye_match) revealed.add(m.id);
        revealedRef.current = revealed;
        saveRevealedSet(slug, revealed);
      }
    } catch (e) { setErr(e.message); setLoading(false); }
  }

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [slug]);
  useEffect(() => {
    const t = setInterval(reload, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [slug]);

  function onDramaDone() {
    // Mark all queued matches as revealed and clear the queue.
    const revealed = revealedRef.current || new Set();
    for (const m of revealQueue) revealed.add(m.id);
    revealedRef.current = revealed;
    saveRevealedSet(slug, revealed);
    setRevealQueue([]);
  }

  // Hide just-revealing matches' winner state in the underlying bracket while overlay is active.
  // We do this by passing a "matches-with-pending-status" view to BracketView.
  const displayMatches = useMemo(() => {
    if (!data?.matches) return [];
    if (revealQueue.length === 0) return data.matches;
    const queueIds = new Set(revealQueue.map((m) => m.id));
    return data.matches.map((m) => (queueIds.has(m.id)
      ? { ...m, status: 'closed', winner_item_id: null }
      : m));
  }, [data, revealQueue]);

  if (loading) return <LoadingScreen label="Warming up the tournament lights…" />;
  if (err) return <div className="min-h-screen flex items-center justify-center text-[color:var(--cb-muted)]">{err}</div>;

  return (
    <div data-testid="display-mode" className="min-h-screen px-6 sm:px-10 py-6 sm:py-10 flex flex-col">
      <header className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[color:var(--cb-accent)] to-[color:var(--cb-accent-2)] flex items-center justify-center shadow-[0_10px_30px_rgba(255,79,216,0.35)]">
            <Tv className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="text-xs text-[color:var(--cb-muted)] uppercase tracking-widest">ContiBracket Live</div>
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight leading-tight">{game.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {game.drama_mode && (
            <span
              data-testid="drama-mode-pill"
              className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--cb-warning)]/40 bg-[color:var(--cb-warning)]/15 text-[color:var(--cb-warning)] px-3 py-1.5 text-xs font-semibold uppercase tracking-widest"
            >
              <Zap className="w-3 h-3" /> Drama Mode
            </span>
          )}
          {game.status === 'complete' && game.winner_item_id && data?.itemsById[game.winner_item_id] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--cb-winner)]/40 bg-[color:var(--cb-winner)]/10 text-[color:var(--cb-winner)] px-4 py-2 font-display text-base sm:text-lg"
            >
              <Crown className="w-5 h-5" /> Champion: {data.itemsById[game.winner_item_id].name}
            </motion.div>
          )}
        </div>
      </header>

      <div className="flex-1">
        <BracketView
          matches={displayMatches}
          itemsById={data.itemsById}
          votesByMatch={data.votesByMatch}
          showVotePercents={!!game.show_vote_totals}
          finalWinnerId={revealQueue.length > 0 ? null : game.winner_item_id}
        />
      </div>

      <footer className="mt-6 text-center text-xs text-[color:var(--cb-muted)]">
        Updated automatically • ContiBracket
      </footer>

      {/* Drama overlay */}
      {revealQueue.length > 0 && data?.itemsById && (
        <DramaRevealOverlay
          queue={revealQueue}
          itemsById={data.itemsById}
          onDone={onDramaDone}
          roundLabel={revealRoundLabel}
        />
      )}
    </div>
  );
}
