import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TopBar from '@/components/TopBar';
import GlowCard from '@/components/GlowCard';
import BigCTAButton from '@/components/BigCTAButton';
import StatusChip from '@/components/StatusChip';
import LoadingScreen from '@/components/LoadingScreen';
import BracketView from '@/components/BracketView';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { isAdminUnlocked } from '@/lib/identity';
import {
  getGameById, listItems, listMatches, listVotes, listParticipants,
  updateGame, deleteGame, listPredictions, listPrivateInfoMap,
} from '@/lib/db';
import { generateRound1, advanceRound, closeRoundAndTally, loadBracketData } from '@/lib/bracketService';
import { Copy, Tv, Lock, Play, Pause, Square, RefreshCw, Trash2, ArrowRight, Crown, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'sonner';

import AdminItemsTab from '@/components/admin/AdminItemsTab';
import AdminParticipantsTab from '@/components/admin/AdminParticipantsTab';
import AdminVotesTab from '@/components/admin/AdminVotesTab';
import AdminStyleTab from '@/components/admin/AdminStyleTab';
import AdminSettingsTab from '@/components/admin/AdminSettingsTab';
import AdminDangerTab from '@/components/admin/AdminDangerTab';

export default function AdminGameManager() {
  const { gameId } = useParams();
  const nav = useNavigate();
  const [game, setGame] = useState(null);
  const [items, setItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [votes, setVotes] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [privateInfo, setPrivateInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [seedingMode, setSeedingMode] = useState('order');
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (!isAdminUnlocked()) { nav('/admin', { replace: true }); return; }
    reload();
    // eslint-disable-next-line
  }, [gameId]);

  async function reload() {
    try {
      setLoading(true);
      const g = await getGameById(gameId);
      if (!g) { toast.error('Game not found'); nav('/admin/dashboard'); return; }
      setGame(g);
      const [it, mt, vt, ps, pred, priv] = await Promise.all([
        listItems(g.id), listMatches(g.id), listVotes(g.id),
        listParticipants(g.id), listPredictions(g.id), listPrivateInfoMap(),
      ]);
      setItems(it); setMatches(mt); setVotes(vt); setParticipants(ps); setPredictions(pred); setPrivateInfo(priv);
    } catch (e) { toast.error(e.message || 'Could not load'); }
    finally { setLoading(false); }
  }

  const itemsById = useMemo(() => { const m = {}; for (const it of items) m[it.id] = it; return m; }, [items]);
  const votesByMatch = useMemo(() => {
    const m = {};
    for (const v of votes) {
      m[v.match_id] = m[v.match_id] || {};
      m[v.match_id][v.selected_item_id] = (m[v.match_id][v.selected_item_id] || 0) + 1;
    }
    return m;
  }, [votes]);
  const currentRound = useMemo(() => matches.length === 0 ? 0 : Math.max(...matches.map((m) => m.round_number)), [matches]);
  const currentRoundMatches = useMemo(() => matches.filter((m) => m.round_number === currentRound), [matches, currentRound]);
  const unresolvedThisRound = currentRoundMatches.filter((m) => !m.is_bye_match && m.status !== 'complete');
  const tieMatches = currentRoundMatches.filter((m) => m.status === 'tie_needs_resolution');
  const activePlayers = participants.filter((p) => !p.is_removed);
  const totalRoundVotes = votes.filter((v) => currentRoundMatches.some((m) => m.id === v.match_id)).length;
  const missingVoters = useMemo(() => {
    const voteable = currentRoundMatches.filter((m) => !m.is_bye_match && m.status !== 'complete' && m.item_a_id && m.item_b_id);
    if (voteable.length === 0) return [];
    return activePlayers.filter((p) => {
      const myVotes = votes.filter((v) => v.participant_id === p.id && voteable.some((m) => m.id === v.match_id));
      return myVotes.length < voteable.length;
    });
  }, [activePlayers, currentRoundMatches, votes]);

  if (loading || !game) return <LoadingScreen label="Loading game…" />;

  // ---- Admin actions ----
  async function launchGame() {
    setBusy(true);
    try {
      if (items.length < 2) { toast.error('Add at least 2 items first'); return; }
      if (matches.length === 0) {
        await generateRound1(game.id, items, seedingMode);
      }
      await updateGame(game.id, { status: 'live', current_round_number: 1 });
      toast.success('Bracket launched');
      reload();
    } catch (e) { toast.error(e.message || 'Could not launch'); }
    finally { setBusy(false); }
  }
  async function pauseGame() {
    setBusy(true);
    try { await updateGame(game.id, { status: 'paused' }); toast.message('Game paused'); reload(); }
    catch (e) { toast.error(e.message); } finally { setBusy(false); }
  }
  async function resumeGame() {
    setBusy(true);
    try { await updateGame(game.id, { status: 'live' }); toast.message('Game resumed'); reload(); }
    catch (e) { toast.error(e.message); } finally { setBusy(false); }
  }
  async function endGame() {
    setBusy(true);
    try { await updateGame(game.id, { status: 'complete', completed_at: new Date().toISOString() }); toast.message('Game ended'); reload(); }
    catch (e) { toast.error(e.message); } finally { setBusy(false); }
  }
  async function reopenGame() {
    setBusy(true);
    try { await updateGame(game.id, { status: 'live', completed_at: null }); toast.message('Game reopened'); reload(); }
    catch (e) { toast.error(e.message); } finally { setBusy(false); }
  }
  async function regenerateBracket() {
    setBusy(true);
    try {
      await generateRound1(game.id, items, seedingMode, { force: true });
      await updateGame(game.id, { status: 'live', current_round_number: 1, winner_item_id: null, completed_at: null });
      toast.success('Bracket regenerated');
      reload();
    } catch (e) { toast.error(e.message || 'Could not regenerate'); }
    finally { setBusy(false); }
  }
  async function closeRound() {
    setBusy(true);
    try {
      const res = await closeRoundAndTally(game.id, currentRound, game.tie_break_mode || 'admin', items);
      toast.success(`Round closed (${res.closedCount} matches, ${res.ties} ties)`);
      reload();
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  }
  async function doAdvance() {
    setBusy(true);
    try {
      const res = await advanceRound(game.id);
      if (res.complete) toast.success('Game complete — champion crowned!');
      else if (res.advanced) toast.success(`Advanced to round ${currentRound + 1}`);
      else toast.message('Nothing to advance');
      reload();
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  function copyParticipantLink() {
    const url = `${window.location.origin}${window.location.pathname}#/game/${game.slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Participant link copied');
  }
  function copyDisplayLink() {
    const url = `${window.location.origin}${window.location.pathname}#/display/${game.slug}`;
    navigator.clipboard.writeText(url);
    toast.success('TV/display link copied');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar
        subtitle={`Admin • ${game.title}`}
        right={
          <Link to="/admin/dashboard" className="text-xs text-[color:var(--cb-muted)] hover:text-[color:var(--cb-text)]" data-testid="admin-back-dashboard">← Dashboard</Link>
        }
        showAdminLink={false}
      />
      <main className="flex-1 px-4 sm:px-6 pb-12">
        <div className="mx-auto max-w-[1180px]">
          {/* Header */}
          <GlowCard className="p-5 sm:p-6 mb-6" testId="admin-game-header">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-2xl sm:text-3xl tracking-tight truncate">{game.title}</h1>
                  <StatusChip status={game.status} />
                </div>
                <div className="text-xs text-[color:var(--cb-muted)] mt-1">/{game.slug} • round {currentRound || 0} / {items.length} items • {activePlayers.length} players</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <BigCTAButton variant="secondary" onClick={copyParticipantLink} testId="admin-copy-participant-link"><Copy className="w-4 h-4" /> Copy player link</BigCTAButton>
                <BigCTAButton variant="secondary" onClick={copyDisplayLink} testId="admin-copy-tv-link"><Tv className="w-4 h-4" /> Copy TV link</BigCTAButton>
              </div>
            </div>
            {/* Round controls */}
            <div className="mt-5 flex flex-wrap gap-2">
              {game.status === 'draft' && (
                <>
                  <Select value={seedingMode} onValueChange={setSeedingMode}>
                    <SelectTrigger className="w-[180px] bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)]" data-testid="seeding-mode-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order">Seed by sort order</SelectItem>
                      <SelectItem value="manual">Seed by seed_number</SelectItem>
                      <SelectItem value="random">Random seeding</SelectItem>
                    </SelectContent>
                  </Select>
                  <BigCTAButton onClick={launchGame} loading={busy} testId="admin-launch-button"><Play className="w-4 h-4" /> Launch bracket</BigCTAButton>
                </>
              )}
              {game.status === 'live' && (
                <>
                  <BigCTAButton variant="secondary" onClick={pauseGame} loading={busy} testId="admin-pause-button"><Pause className="w-4 h-4" /> Pause</BigCTAButton>
                  {unresolvedThisRound.length > 0 && (
                    <BigCTAButton onClick={closeRound} loading={busy} testId="admin-close-round-button"><Square className="w-4 h-4" /> Close round {currentRound}</BigCTAButton>
                  )}
                  {unresolvedThisRound.length === 0 && tieMatches.length === 0 && currentRound > 0 && (
                    <BigCTAButton onClick={doAdvance} loading={busy} testId="admin-advance-round-button"><ArrowRight className="w-4 h-4" /> Advance to round {currentRound + 1}</BigCTAButton>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <BigCTAButton variant="ghost" testId="admin-end-game-button">End</BigCTAButton>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-[color:var(--cb-card)] border-[color:var(--cb-border)] text-[color:var(--cb-text)]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>End the game?</AlertDialogTitle>
                        <AlertDialogDescription>This sets status to complete. You can always reopen.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)]">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={endGame} className="bg-[color:var(--cb-danger)] text-black">End game</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
              {game.status === 'paused' && (
                <BigCTAButton onClick={resumeGame} loading={busy} testId="admin-resume-button"><Play className="w-4 h-4" /> Resume</BigCTAButton>
              )}
              {game.status === 'complete' && (
                <BigCTAButton variant="secondary" onClick={reopenGame} loading={busy} testId="admin-reopen-button"><Play className="w-4 h-4" /> Reopen</BigCTAButton>
              )}
              {matches.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <BigCTAButton variant="ghost" testId="admin-regenerate-button"><RefreshCw className="w-4 h-4" /> Regenerate bracket</BigCTAButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[color:var(--cb-card)] border-[color:var(--cb-border)] text-[color:var(--cb-text)]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Regenerate bracket?</AlertDialogTitle>
                      <AlertDialogDescription>This deletes all current matches and votes. Predictions are kept.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)]">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={regenerateBracket} className="bg-[color:var(--cb-danger)] text-black">Regenerate</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            {/* Stats row */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <Stat label="Players" value={activePlayers.length} testId="stat-players" />
              <Stat label="Round" value={currentRound || 0} testId="stat-round" />
              <Stat label="Round votes" value={totalRoundVotes} testId="stat-round-votes" />
              <Stat label="Missing voters" value={missingVoters.length} testId="stat-missing" />
            </div>
          </GlowCard>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="bg-[color:var(--cb-card-2)] border border-[color:var(--cb-border)] flex flex-wrap h-auto">
              <TabsTrigger value="overview" data-testid="admin-tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="items" data-testid="admin-tab-items">Bracket items</TabsTrigger>
              <TabsTrigger value="participants" data-testid="admin-tab-participants">Participants</TabsTrigger>
              <TabsTrigger value="votes" data-testid="admin-tab-votes">Votes</TabsTrigger>
              <TabsTrigger value="style" data-testid="admin-tab-style">Style</TabsTrigger>
              <TabsTrigger value="settings" data-testid="admin-tab-settings">Settings</TabsTrigger>
              <TabsTrigger value="danger" data-testid="admin-tab-danger">Danger zone</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="pt-4">
              {matches.length === 0 ? (
                <GlowCard className="p-8 text-center" testId="overview-empty">
                  <div className="font-display text-xl">No bracket yet</div>
                  <p className="text-sm text-[color:var(--cb-muted)] mt-2">Add some items and launch the bracket to get started.</p>
                </GlowCard>
              ) : (
                <div className="space-y-4">
                  {tieMatches.length > 0 && (
                    <GlowCard className="p-5 border-[color:var(--cb-warning)]/40" testId="overview-ties">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <div className="font-display text-base text-[color:var(--cb-warning)]">Tied matches need your decision</div>
                          <div className="text-xs text-[color:var(--cb-muted)]">{tieMatches.length} matchups are tied. Resolve them in the Votes tab.</div>
                        </div>
                        <BigCTAButton variant="secondary" onClick={() => setTab('votes')} testId="overview-go-to-ties">Resolve ties</BigCTAButton>
                      </div>
                    </GlowCard>
                  )}
                  <BracketView
                    matches={matches}
                    itemsById={itemsById}
                    votesByMatch={votesByMatch}
                    showVotePercents
                    finalWinnerId={game.winner_item_id}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="items" className="pt-4">
              <AdminItemsTab game={game} items={items} reload={reload} />
            </TabsContent>

            <TabsContent value="participants" className="pt-4">
              <AdminParticipantsTab
                game={game}
                participants={participants}
                predictions={predictions}
                privateInfo={privateInfo}
                items={items}
                votes={votes}
                matches={matches}
                reload={reload}
              />
            </TabsContent>

            <TabsContent value="votes" className="pt-4">
              <AdminVotesTab
                game={game}
                items={items}
                matches={matches}
                votes={votes}
                participants={participants}
                reload={reload}
              />
            </TabsContent>

            <TabsContent value="style" className="pt-4">
              <AdminStyleTab game={game} reload={reload} />
            </TabsContent>

            <TabsContent value="settings" className="pt-4">
              <AdminSettingsTab game={game} reload={reload} />
            </TabsContent>

            <TabsContent value="danger" className="pt-4">
              <AdminDangerTab game={game} reload={reload} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, testId }) {
  return (
    <div data-testid={testId} className="rounded-[12px] border border-[color:var(--cb-border)] bg-[color:var(--cb-card-2)] px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest text-[color:var(--cb-muted)]">{label}</div>
      <div className="font-display text-xl mt-0.5">{value}</div>
    </div>
  );
}
