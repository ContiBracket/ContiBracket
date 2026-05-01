import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import TopBar from '@/components/TopBar';
import GlowCard from '@/components/GlowCard';
import BigCTAButton from '@/components/BigCTAButton';
import BracketItemCard from '@/components/BracketItemCard';
import BracketView from '@/components/BracketView';
import LoadingScreen from '@/components/LoadingScreen';
import ConfettiBurst from '@/components/ConfettiBurst';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Crown, Trophy } from 'lucide-react';
import {
  getGameBySlug, listItems, listMatches, listVotes,
  joinGame, getPrediction, createPrediction, castVote,
} from '@/lib/db';
import { savePlayer, getSavedPlayer, normalizeName, getOrCreateDeviceId } from '@/lib/identity';
import { activeVoteableMatches } from '@/lib/bracket';

function useGame(slug) {
  const [game, setGame] = useState(null);
  const [items, setItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [tick, setTick] = useState(0);

  async function reload() {
    try {
      const g = await getGameBySlug(slug);
      if (!g) { setErr('not_found'); setLoading(false); return; }
      setGame(g);
      const [it, mt, vt] = await Promise.all([listItems(g.id), listMatches(g.id), listVotes(g.id)]);
      setItems(it); setMatches(mt); setVotes(vt);
      setLoading(false);
    } catch (e) {
      setErr(e.message || 'Could not load game'); setLoading(false);
    }
  }
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [slug, tick]);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 4000); return () => clearInterval(t); }, []);
  return { game, items, matches, votes, loading, err, reload };
}

export default function PlayerGame() {
  const { slug } = useParams();
  const saved = getSavedPlayer(slug);
  const { game, items, matches, votes, loading, err, reload } = useGame(slug);

  // Login state
  const [name, setName] = useState('');
  const [confirmingName, setConfirmingName] = useState(false);
  const [joining, setJoining] = useState(false);
  const [player, setPlayer] = useState(saved);

  // Prediction state
  const [prediction, setPrediction] = useState(null);
  const [predictingItemId, setPredictingItemId] = useState(null);
  const [confirmPredictionItem, setConfirmPredictionItem] = useState(null);

  // Voting state
  const [voteIdx, setVoteIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('vote');

  useEffect(() => {
    if (!game || !player) return;
    (async () => {
      try {
        const p = await getPrediction(game.id, player.participant_id);
        setPrediction(p || null);
      } catch (e) { /* ignore */ }
    })();
  }, [game, player]);

  // Helpers — all useMemo hooks must run before any early return
  const myVotesByMatch = useMemo(() => {
    if (!player) return {};
    const m = {};
    for (const v of votes) if (v.participant_id === player.participant_id) m[v.match_id] = v.selected_item_id;
    return m;
  }, [votes, player]);

  const voteCountsByMatch = useMemo(() => {
    const m = {};
    for (const v of votes) {
      m[v.match_id] = m[v.match_id] || {};
      m[v.match_id][v.selected_item_id] = (m[v.match_id][v.selected_item_id] || 0) + 1;
    }
    return m;
  }, [votes]);

  const itemsById = useMemo(() => {
    const m = {}; for (const it of items) m[it.id] = it; return m;
  }, [items]);

  const currentRound = useMemo(() => {
    if (!matches || matches.length === 0) return 0;
    return Math.max(...matches.map((m) => m.round_number));
  }, [matches]);

  const currentRoundMatches = useMemo(
    () => (matches || []).filter((m) => m.round_number === currentRound),
    [matches, currentRound]
  );

  const voteable = useMemo(() => activeVoteableMatches(currentRoundMatches), [currentRoundMatches]);

  const remainingMatches = useMemo(() => {
    if (!player) return voteable;
    return voteable.filter((m) => !myVotesByMatch[m.id]);
  }, [voteable, myVotesByMatch, player]);

  const allVotedThisRound = player && voteable.length > 0 && remainingMatches.length === 0;

  // ---- Loading / errors ----
  if (loading) return <LoadingScreen label="Loading bracket…" />;
  if (err === 'not_found' || !game) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <main className="flex-1 flex items-center justify-center px-4">
          <GlowCard className="p-8 max-w-[480px] text-center" testId="game-not-found">
            <div className="font-display text-2xl mb-2">Game not found</div>
            <p className="text-sm text-[color:var(--cb-muted)] mb-6">
              That link looks invalid. Ask your organizer for the correct link.
            </p>
            <Link to="/"><BigCTAButton variant="secondary" testId="game-not-found-home">Back to home</BigCTAButton></Link>
          </GlowCard>
        </main>
      </div>
    );
  }

  // ----------------- Login flow -----------------
  async function performJoin() {
    if (!name.trim() || !name.trim().includes(' ')) {
      toast.error('Please enter your full name (first and last).');
      return;
    }
    setJoining(true);
    try {
      const { person, participant } = await joinGame(game.id, name.trim());
      const payload = {
        person_id: person.id,
        participant_id: participant.id,
        full_name: person.full_name,
        normalized_name: person.normalized_name,
        device_id: getOrCreateDeviceId(),
      };
      savePlayer(slug, payload);
      setPlayer(payload);
      setConfirmingName(false);
      toast.success(`Welcome, ${person.full_name.split(' ')[0]}!`);
    } catch (e) {
      toast.error(e.message || 'Could not join.');
    } finally { setJoining(false); }
  }

  if (!player) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar subtitle={game.title} />
        <main className="flex-1 flex items-center justify-center px-4 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }} className="w-full max-w-[480px]"
          >
            <GlowCard className="p-6 sm:p-8" testId="player-login-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-[12px] bg-[color:var(--cb-accent)]/15 text-[color:var(--cb-accent)] flex items-center justify-center">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-[color:var(--cb-muted)]">Joining</div>
                  <h1 className="font-display text-xl tracking-tight">{game.title}</h1>
                </div>
              </div>
              <p className="text-sm text-[color:var(--cb-muted)] mb-4">
                Enter your full name to join this week’s bracket.
              </p>
              <form
                className="flex flex-col gap-3"
                onSubmit={(e) => { e.preventDefault(); if (name.trim()) setConfirmingName(true); }}
              >
                <Label htmlFor="fullname" className="text-xs text-[color:var(--cb-muted)]">First and Last Name</Label>
                <Input
                  id="fullname"
                  data-testid="player-name-input"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="First Last"
                  className="bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)] text-[color:var(--cb-text)] focus-visible:ring-[color:var(--cb-ring)]"
                />
                <BigCTAButton type="submit" testId="player-join-button" className="mt-2">Join ContiBracket</BigCTAButton>
              </form>
            </GlowCard>
          </motion.div>

          <Dialog open={confirmingName} onOpenChange={setConfirmingName}>
            <DialogContent
              className="bg-[color:var(--cb-card)] border-[color:var(--cb-border)] text-[color:var(--cb-text)]"
              data-testid="player-name-confirm-dialog"
            >
              <DialogHeader>
                <DialogTitle className="font-display">Confirm your name</DialogTitle>
                <DialogDescription>
                  You are joining as <span className="font-semibold text-[color:var(--cb-text)]">{name.trim()}</span>. Your name will be saved on this device. Continue?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                <BigCTAButton
                  variant="secondary"
                  onClick={() => setConfirmingName(false)}
                  testId="player-name-confirm-cancel"
                >Go back</BigCTAButton>
                <BigCTAButton onClick={performJoin} loading={joining} testId="player-name-confirm-yes">
                  Yes, that’s me
                </BigCTAButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    );
  }

  // ----------------- Game state guards -----------------
  const isDraft = game.status === 'draft';
  const isPaused = game.status === 'paused';
  const isComplete = game.status === 'complete';
  const noBracketYet = matches.length === 0;

  // ----------------- Prediction flow -----------------
  if (!isComplete && !prediction && !noBracketYet) {
    async function lockPrediction(item) {
      try {
        setPredictingItemId(item.id);
        const p = await createPrediction(game.id, player.participant_id, item.id);
        setPrediction(p);
        setConfirmPredictionItem(null);
        toast.success(`Champion locked: ${item.name}`);
      } catch (e) {
        toast.error(e.message || 'Could not save prediction');
      } finally { setPredictingItemId(null); }
    }
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar subtitle={game.title} />
        <main className="flex-1 px-4 sm:px-6 pb-12">
          <div className="mx-auto max-w-[820px]">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <GlowCard className="p-6 sm:p-8 mb-6" testId="prediction-card">
                <div className="text-xs text-[color:var(--cb-muted)] uppercase tracking-widest">Predict the champion</div>
                <h1 className="font-display text-2xl sm:text-3xl tracking-tight mt-1">{game.prediction_question}</h1>
                <p className="text-sm text-[color:var(--cb-muted)] mt-2">Pick the bracket item you think will win it all. You only get one prediction.</p>
              </GlowCard>
            </motion.div>

            <motion.div
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }}
              initial="hidden" animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
              data-testid="prediction-grid"
            >
              {items.map((it) => (
                <motion.div
                  key={it.id}
                  variants={{ hidden: { opacity: 0, y: 10, filter: 'blur(6px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.28 } } }}
                >
                  <BracketItemCard
                    item={it}
                    state="default"
                    size="lg"
                    onClick={() => setConfirmPredictionItem(it)}
                    testId={`prediction-choice-${it.id}`}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </main>

        <Dialog open={!!confirmPredictionItem} onOpenChange={(v) => !v && setConfirmPredictionItem(null)}>
          <DialogContent className="bg-[color:var(--cb-card)] border-[color:var(--cb-border)] text-[color:var(--cb-text)]" data-testid="prediction-confirm-dialog">
            <DialogHeader>
              <DialogTitle className="font-display">Lock it in?</DialogTitle>
              <DialogDescription>
                You’re predicting <span className="font-semibold text-[color:var(--cb-text)]">{confirmPredictionItem?.name}</span> will win the whole bracket. This can’t be changed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <BigCTAButton variant="secondary" onClick={() => setConfirmPredictionItem(null)} testId="prediction-confirm-cancel">Go back</BigCTAButton>
              <BigCTAButton onClick={() => lockPrediction(confirmPredictionItem)} loading={predictingItemId === confirmPredictionItem?.id} testId="prediction-confirm-lock">Lock it in</BigCTAButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ----------------- Final winner -----------------
  if (isComplete && game.winner_item_id && itemsById[game.winner_item_id]) {
    const champion = itemsById[game.winner_item_id];
    const correct = prediction && prediction.item_id === champion.id;
    return (
      <div className="min-h-screen flex flex-col relative">
        <ConfettiBurst enabled />
        <TopBar subtitle={game.title} />
        <main className="flex-1 px-4 sm:px-6 pb-12">
          <div className="mx-auto max-w-[860px]">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 240, damping: 18 }}>
              <GlowCard className="p-6 sm:p-10 text-center" testId="winner-card">
                <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--cb-winner)]/40 bg-[color:var(--cb-winner)]/10 text-[color:var(--cb-winner)] px-3 py-1 text-xs font-medium">
                  <Crown className="w-3.5 h-3.5" /> ContiBracket Champion
                </div>
                <h1 className="mt-4 font-display text-4xl sm:text-5xl tracking-tight">{champion.name}</h1>
                {champion.description && <p className="mt-2 text-sm text-[color:var(--cb-muted)]">{champion.description}</p>}
                <div className="mt-6 flex justify-center">
                  <BracketItemCard item={champion} state="winner" size="lg" />
                </div>
                <div className="mt-6 text-sm">
                  {correct ? (
                    <span className="text-[color:var(--cb-winner)] font-semibold" data-testid="winner-correct">You called it from the start.</span>
                  ) : (
                    <span className="text-[color:var(--cb-muted)]" data-testid="winner-not-correct">Your pick didn’t make it, but you still helped decide the bracket.</span>
                  )}
                </div>
              </GlowCard>
            </motion.div>
            <div className="mt-8">
              <BracketView matches={matches} itemsById={itemsById} votesByMatch={voteCountsByMatch} showVotePercents={!!game.show_vote_totals} yourPickItemId={prediction?.item_id} finalWinnerId={game.winner_item_id} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ----------------- Voting / waiting -----------------
  const myPickItemId = prediction?.item_id;
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar subtitle={game.title} />
      <main className="flex-1 px-4 sm:px-6 pb-12">
        <div className={activeTab === 'bracket' ? "w-full max-w-none" : "mx-auto max-w-[860px]"}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-[color:var(--cb-card-2)] border border-[color:var(--cb-border)]">
              <TabsTrigger value="vote" data-testid="tab-vote">Vote</TabsTrigger>
              <TabsTrigger value="bracket" data-testid="tab-bracket">Bracket</TabsTrigger>
            </TabsList>

            <TabsContent value="vote" className="pt-4">
              {isDraft || noBracketYet ? (
                <GlowCard className="p-6 text-center" testId="waiting-state">
                  <div className="font-display text-xl">Bracket not launched yet</div>
                  <p className="text-sm text-[color:var(--cb-muted)] mt-2 cb-pulse">Hang tight — the organizer is setting things up.</p>
                </GlowCard>
              ) : isPaused ? (
                <GlowCard className="p-6 text-center" testId="waiting-state">
                  <div className="font-display text-xl">Game paused</div>
                  <p className="text-sm text-[color:var(--cb-muted)] mt-2 cb-pulse">Voting will reopen soon.</p>
                </GlowCard>
              ) : voteable.length === 0 ? (
                <GlowCard className="p-6 text-center" testId="waiting-state">
                  <div className="font-display text-xl">Round complete</div>
                  <p className="text-sm text-[color:var(--cb-muted)] mt-2 cb-pulse">Waiting for the next round to open.</p>
                </GlowCard>
              ) : allVotedThisRound ? (
                <GlowCard className="p-6 text-center" testId="waiting-state">
                  <div className="font-display text-xl">You’re done voting for this round!</div>
                  <p className="text-sm text-[color:var(--cb-muted)] mt-2 cb-pulse">Waiting for the next round.</p>
                </GlowCard>
              ) : (
                <VoteScreen
                  game={game}
                  matches={voteable}
                  itemsById={itemsById}
                  myVotesByMatch={myVotesByMatch}
                  prediction={prediction}
                  player={player}
                  onVoted={async (matchId, itemId) => {
                    try {
                      await castVote(game.id, matchId, player.participant_id, itemId);
                      toast.success('Vote locked');
                      reload();
                    } catch (e) { toast.error(e.message || 'Could not submit vote'); }
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="bracket" className="pt-4 w-full">
              <BracketView
                matches={matches}
                itemsById={itemsById}
                votesByMatch={voteCountsByMatch}
                showVotePercents={!!game.show_vote_totals}
                yourPickItemId={myPickItemId}
                finalWinnerId={isComplete ? game.winner_item_id : null}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

// Submodule: voting screen
function VoteScreen({ game, matches, itemsById, myVotesByMatch, prediction, player, onVoted }) {
  const [idx, setIdx] = useState(0);
  const list = matches;
  const total = list.length;
  const safeIdx = Math.max(0, Math.min(idx, total - 1));
  const current = list[safeIdx];
  if (!current) return null;
  const a = itemsById[current.item_a_id];
  const b = itemsById[current.item_b_id];
  const myPickItemId = prediction?.item_id;
  const myVoteForThis = myVotesByMatch[current.id];

  async function vote(itemId) {
    await onVoted(current.id, itemId);
    if (idx < total - 1) setTimeout(() => setIdx((x) => x + 1), 280);
  }

  return (
    <div data-testid="vote-screen">
      <div className="flex items-center justify-between text-xs mb-3">
        <span className="text-[color:var(--cb-muted)]" data-testid="matchup-progress-label">
          Matchup {safeIdx + 1} of {total}
        </span>
        <span className="text-[color:var(--cb-muted)]">Round {current.round_number}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-5">
        <div
          data-testid="matchup-progress-bar"
          className="h-full bg-[color:var(--cb-accent)] transition-[width] duration-500"
          style={{ width: `${((safeIdx) / Math.max(total, 1)) * 100}%` }}
        />
      </div>

      <GlowCard className="p-4 sm:p-6">
        <div className="text-xs text-[color:var(--cb-muted)] uppercase tracking-widest text-center">{game.voting_question_template || 'Which one do you like more?'}</div>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.26, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-stretch"
          >
            <BracketItemCard
              item={a}
              state={myVoteForThis === a?.id ? 'selected' : 'default'}
              size="lg"
              showYourPick={myPickItemId === a?.id}
              onClick={() => vote(a.id)}
              testId="matchup-choice-a"
            />
            <div className="flex items-center justify-center">
              <span className="rounded-full border border-[color:var(--cb-border)] bg-[color:var(--cb-card)] px-3 py-1 text-xs font-semibold text-[color:var(--cb-muted)] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">VS</span>
            </div>
            <BracketItemCard
              item={b}
              state={myVoteForThis === b?.id ? 'selected' : 'default'}
              size="lg"
              showYourPick={myPickItemId === b?.id}
              onClick={() => vote(b.id)}
              testId="matchup-choice-b"
            />
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-between mt-5">
          <BigCTAButton variant="ghost" onClick={() => setIdx((x) => Math.max(0, x - 1))} testId="vote-prev-button" disabled={safeIdx === 0}>← Previous</BigCTAButton>
          <BigCTAButton variant="ghost" onClick={() => setIdx((x) => Math.min(total - 1, x + 1))} testId="vote-next-button" disabled={safeIdx >= total - 1}>Skip →</BigCTAButton>
        </div>
      </GlowCard>
    </div>
  );
}
