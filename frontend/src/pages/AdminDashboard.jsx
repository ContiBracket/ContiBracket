import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TopBar from '@/components/TopBar';
import GlowCard from '@/components/GlowCard';
import BigCTAButton from '@/components/BigCTAButton';
import StatusChip from '@/components/StatusChip';
import LoadingScreen from '@/components/LoadingScreen';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { isAdminUnlocked, lockAdmin } from '@/lib/identity';
import { listGames, createGame, listParticipants } from '@/lib/db';
import { Plus, Trophy, Users, ArrowRight, Lock, Copy, Tv } from 'lucide-react';
import { slugify } from '@/lib/slug';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const nav = useNavigate();
  const [games, setGames] = useState([]);
  const [participantCounts, setParticipantCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newQuestion, setNewQuestion] = useState('What do you think wins this bracket?');

  useEffect(() => {
    if (!isAdminUnlocked()) { nav('/admin', { replace: true }); return; }
    (async () => {
      try {
        const gs = await listGames();
        setGames(gs);
        // counts
        const counts = {};
        for (const g of gs) {
          try {
            const ps = await listParticipants(g.id);
            counts[g.id] = ps.filter((p) => !p.is_removed).length;
          } catch (e) { counts[g.id] = 0; }
        }
        setParticipantCounts(counts);
      } catch (e) { toast.error(e.message || 'Failed to load games'); }
      finally { setLoading(false); }
    })();
  }, [nav]);

  async function reload() {
    const gs = await listGames();
    setGames(gs);
  }

  async function doCreate() {
    if (!newTitle.trim()) { toast.error('Title required'); return; }
    setCreating(true);
    try {
      const slug = (newSlug || slugify(newTitle));
      const game = await createGame({
        title: newTitle.trim(),
        slug,
        prediction_question: newQuestion || 'What do you think wins this bracket?',
        status: 'draft',
      });
      toast.success('Game created');
      setCreateOpen(false);
      setNewTitle(''); setNewSlug(''); setNewQuestion('What do you think wins this bracket?');
      nav(`/admin/games/${game.id}`);
    } catch (e) {
      toast.error(e.message || 'Could not create game');
    } finally { setCreating(false); }
  }

  const grouped = useMemo(() => {
    const map = { live: [], paused: [], draft: [], complete: [] };
    for (const g of games) (map[g.status] ||= []).push(g);
    return map;
  }, [games]);

  if (loading) return <LoadingScreen label="Loading admin…" />;

  function copyParticipantLink(slug) {
    const url = `${window.location.origin}${window.location.pathname}#/game/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Participant link copied');
  }
  function copyDisplayLink(slug) {
    const url = `${window.location.origin}${window.location.pathname}#/display/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('TV/display link copied');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar
        subtitle="Admin"
        right={
          <button
            onClick={() => { lockAdmin(); nav('/admin'); }}
            data-testid="admin-lock-button"
            className="text-xs text-[color:var(--cb-muted)] hover:text-[color:var(--cb-text)] flex items-center gap-1"
          >
            <Lock className="w-3 h-3" /> Lock
          </button>
        }
        showAdminLink={false}
      />
      <main className="flex-1 px-4 sm:px-6 pb-12">
        <div className="mx-auto max-w-[1100px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl tracking-tight">Dashboard</h1>
              <p className="text-sm text-[color:var(--cb-muted)]">Create and run office brackets.</p>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <BigCTAButton testId="admin-create-game-button"><Plus className="w-4 h-4" /> New game</BigCTAButton>
              </DialogTrigger>
              <DialogContent className="bg-[color:var(--cb-card)] border-[color:var(--cb-border)] text-[color:var(--cb-text)]" data-testid="admin-create-game-dialog">
                <DialogHeader>
                  <DialogTitle className="font-display">Create a new bracket game</DialogTitle>
                  <DialogDescription>You can fine-tune everything else after creating it.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3">
                  <div>
                    <Label className="text-xs text-[color:var(--cb-muted)]">Title</Label>
                    <Input
                      data-testid="create-title-input"
                      value={newTitle}
                      onChange={(e) => { setNewTitle(e.target.value); setNewSlug(slugify(e.target.value)); }}
                      placeholder="Best Fast Food Chain"
                      className="mt-1 bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)]"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-[color:var(--cb-muted)]">Slug</Label>
                    <Input
                      data-testid="create-slug-input"
                      value={newSlug}
                      onChange={(e) => setNewSlug(slugify(e.target.value))}
                      placeholder="best-fast-food-chain"
                      className="mt-1 bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)]"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-[color:var(--cb-muted)]">Initial prediction question</Label>
                    <Textarea
                      data-testid="create-question-input"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      rows={2}
                      className="mt-1 bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)]"
                    />
                  </div>
                </div>
                <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                  <BigCTAButton variant="secondary" onClick={() => setCreateOpen(false)} testId="create-cancel">Cancel</BigCTAButton>
                  <BigCTAButton onClick={doCreate} loading={creating} testId="create-submit">Create</BigCTAButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {games.length === 0 ? (
            <GlowCard className="p-10 text-center" testId="admin-empty">
              <div className="font-display text-2xl">No games yet</div>
              <p className="text-sm text-[color:var(--cb-muted)] mt-2 mb-6">Click “New game” to set up your first bracket.</p>
            </GlowCard>
          ) : (
            <div className="flex flex-col gap-8">
              {['live', 'paused', 'draft', 'complete'].map((status) => grouped[status]?.length ? (
                <section key={status}>
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="font-display text-lg tracking-tight capitalize">{status === 'paused' ? 'Paused' : status === 'live' ? 'Active' : status === 'draft' ? 'Drafts' : 'Completed'}</h2>
                    <span className="text-xs text-[color:var(--cb-muted)]">({grouped[status].length})</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {grouped[status].map((g) => (
                      <motion.div key={g.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <GlowCard className="p-5" testId={`admin-game-card-${g.id}`}>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-[12px] bg-[color:var(--cb-accent-2)]/15 text-[color:var(--cb-accent-2)] flex items-center justify-center flex-none">
                              <Trophy className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-display text-lg truncate">{g.title}</h3>
                                <StatusChip status={g.status} />
                              </div>
                              <div className="text-xs text-[color:var(--cb-muted)] mt-0.5">/{g.slug}</div>
                              <div className="flex items-center gap-3 mt-2 text-xs text-[color:var(--cb-muted)]">
                                <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{participantCounts[g.id] ?? 0} players</span>
                                <span>Round {g.current_round_number || 0}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center gap-2 flex-wrap">
                            <BigCTAButton
                              variant="secondary"
                              onClick={() => nav(`/admin/games/${g.id}`)}
                              testId={`admin-manage-${g.id}`}
                            >Manage <ArrowRight className="w-4 h-4" /></BigCTAButton>
                            <BigCTAButton variant="ghost" onClick={() => copyParticipantLink(g.slug)} testId={`admin-copy-link-${g.id}`}><Copy className="w-4 h-4" /> Copy link</BigCTAButton>
                            <BigCTAButton variant="ghost" onClick={() => copyDisplayLink(g.slug)} testId={`admin-copy-display-${g.id}`}><Tv className="w-4 h-4" /> TV link</BigCTAButton>
                          </div>
                        </GlowCard>
                      </motion.div>
                    ))}
                  </div>
                </section>
              ) : null)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
