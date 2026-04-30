import React, { useMemo } from 'react';
import GlowCard from '@/components/GlowCard';
import BigCTAButton from '@/components/BigCTAButton';
import BracketItemCard from '@/components/BracketItemCard';
import { updateMatch, deleteVotesForParticipantMatch } from '@/lib/db';
import { toast } from 'sonner';

export default function AdminVotesTab({ game, items, matches, votes, participants, reload }) {
  const itemsById = useMemo(() => { const m = {}; for (const it of items) m[it.id] = it; return m; }, [items]);
  const tally = useMemo(() => {
    const m = {};
    for (const v of votes) {
      m[v.match_id] = m[v.match_id] || {};
      m[v.match_id][v.selected_item_id] = (m[v.match_id][v.selected_item_id] || 0) + 1;
    }
    return m;
  }, [votes]);
  const participantsById = useMemo(() => { const m = {}; for (const p of participants) m[p.id] = p; return m; }, [participants]);

  const byRound = {};
  for (const m of matches) {
    byRound[m.round_number] = byRound[m.round_number] || [];
    byRound[m.round_number].push(m);
  }
  const rounds = Object.keys(byRound).map((r) => parseInt(r, 10)).sort((a, b) => a - b);

  async function setWinner(match, itemId) {
    try {
      await updateMatch(match.id, { winner_item_id: itemId, status: 'complete' });
      toast.success('Match resolved');
      reload();
    } catch (e) { toast.error(e.message); }
  }

  async function clearVote(matchId, participantId) {
    try {
      await deleteVotesForParticipantMatch(matchId, participantId);
      toast.success('Vote cleared');
      reload();
    } catch (e) { toast.error(e.message); }
  }

  if (matches.length === 0) {
    return (
      <GlowCard className="p-8 text-center" testId="votes-empty">
        <div className="font-display text-xl">No bracket yet</div>
        <p className="text-sm text-[color:var(--cb-muted)] mt-2">Add items and launch a bracket to start collecting votes.</p>
      </GlowCard>
    );
  }

  return (
    <div className="space-y-6">
      {rounds.map((rn) => (
        <div key={rn}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-lg">Round {rn}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {byRound[rn].map((m) => {
              const a = itemsById[m.item_a_id]; const b = itemsById[m.item_b_id];
              const va = (tally[m.id]?.[m.item_a_id]) || 0;
              const vb = (tally[m.id]?.[m.item_b_id]) || 0;
              const total = va + vb;
              const totalPct = (n) => total ? Math.round((n / total) * 100) : 0;
              const matchVoters = votes.filter((v) => v.match_id === m.id);
              const isTie = m.status === 'tie_needs_resolution' || (m.status !== 'complete' && va === vb && total > 0 && a && b && !m.is_bye_match);

              return (
                <GlowCard key={m.id} className="p-4" testId={`votes-match-${m.id}`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[color:var(--cb-muted)]">Match {m.match_number} • {m.is_bye_match ? 'BYE' : m.status}</span>
                    {isTie && <span className="text-[color:var(--cb-warning)] font-semibold">Tie</span>}
                  </div>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex flex-col gap-2">
                      <BracketItemCard
                        item={a} state={m.winner_item_id === m.item_a_id ? 'winner' : (m.status === 'complete' ? 'loser' : 'default')}
                        votesPercent={total ? totalPct(va) : undefined}
                      />
                      {a && b && m.status !== 'complete' && (
                        <BigCTAButton variant="secondary" onClick={() => setWinner(m, m.item_a_id)} testId={`override-a-${m.id}`}>Set as winner</BigCTAButton>
                      )}
                      {m.status === 'complete' && a && (
                        <BigCTAButton variant="ghost" onClick={() => setWinner(m, m.item_a_id)} testId={`force-a-${m.id}`}>Force A</BigCTAButton>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <BracketItemCard
                        item={b} state={m.winner_item_id === m.item_b_id ? 'winner' : (m.status === 'complete' ? 'loser' : 'default')}
                        votesPercent={total ? totalPct(vb) : undefined}
                      />
                      {a && b && m.status !== 'complete' && (
                        <BigCTAButton variant="secondary" onClick={() => setWinner(m, m.item_b_id)} testId={`override-b-${m.id}`}>Set as winner</BigCTAButton>
                      )}
                      {m.status === 'complete' && b && (
                        <BigCTAButton variant="ghost" onClick={() => setWinner(m, m.item_b_id)} testId={`force-b-${m.id}`}>Force B</BigCTAButton>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-[color:var(--cb-muted)]">{matchVoters.length} vote{matchVoters.length === 1 ? '' : 's'}</div>
                  {matchVoters.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {matchVoters.map((v) => {
                        const p = participantsById[v.participant_id];
                        const itemName = itemsById[v.selected_item_id]?.name || '?';
                        return (
                          <span key={v.id} className="text-[11px] inline-flex items-center gap-1 rounded-full bg-white/5 border border-[color:var(--cb-border)] px-2 py-0.5">
                            {(p?.people?.full_name || 'Unknown')} → {itemName}
                            <button onClick={() => clearVote(v.match_id, v.participant_id)} className="opacity-60 hover:opacity-100" data-testid={`clear-vote-${v.id}`}>×</button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </GlowCard>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
