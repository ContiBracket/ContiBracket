import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import BracketView from '@/components/BracketView';
import LoadingScreen from '@/components/LoadingScreen';
import { getGameBySlug } from '@/lib/db';
import { loadBracketData } from '@/lib/bracketService';
import { Crown, Tv } from 'lucide-react';

/**
 * Fullscreen TV/display mode — minimal chrome, big bracket, no admin or emails.
 */
export default function DisplayMode() {
  const { slug } = useParams();
  const [game, setGame] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  async function reload() {
    try {
      const g = await getGameBySlug(slug);
      if (!g) { setErr('Game not found'); setLoading(false); return; }
      setGame(g);
      const d = await loadBracketData(g.id);
      setData(d);
      setLoading(false);
    } catch (e) { setErr(e.message); setLoading(false); }
  }

  useEffect(() => { reload(); }, [slug]);
  useEffect(() => { const t = setInterval(reload, 5000); return () => clearInterval(t); }, [slug]);

  if (loading) return <LoadingScreen label="Warming up the tournament lights…" />;
  if (err) return <div className="min-h-screen flex items-center justify-center text-[color:var(--cb-muted)]">{err}</div>;

  return (
    <div data-testid="display-mode" className="min-h-screen px-6 sm:px-10 py-6 sm:py-10 flex flex-col">
      <header className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[color:var(--cb-accent)] to-[color:var(--cb-accent-2)] flex items-center justify-center shadow-[0_10px_30px_rgba(255,79,216,0.35)]">
            <Tv className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="text-xs text-[color:var(--cb-muted)] uppercase tracking-widest">ContiBracket Live</div>
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight leading-tight">{game.title}</h1>
          </div>
        </div>
        {game.status === 'complete' && game.winner_item_id && data?.itemsById[game.winner_item_id] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--cb-winner)]/40 bg-[color:var(--cb-winner)]/10 text-[color:var(--cb-winner)] px-4 py-2 font-display text-base sm:text-lg"
          >
            <Crown className="w-5 h-5" /> Champion: {data.itemsById[game.winner_item_id].name}
          </motion.div>
        )}
      </header>
      <div className="flex-1">
        <BracketView
          matches={data.matches}
          itemsById={data.itemsById}
          votesByMatch={data.votesByMatch}
          showVotePercents={!!game.show_vote_totals}
          finalWinnerId={game.winner_item_id}
        />
      </div>
      <footer className="mt-6 text-center text-xs text-[color:var(--cb-muted)]">
        Updated automatically • ContiBracket
      </footer>
    </div>
  );
}
