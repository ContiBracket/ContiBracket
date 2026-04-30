import React, { useMemo, useState } from 'react';
import GlowCard from '@/components/GlowCard';
import BigCTAButton from '@/components/BigCTAButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Copy, Mail, Trash2, RotateCcw, Crown, Download } from 'lucide-react';
import { setPersonEmail, deletePrediction, deleteVotesForParticipant, removeParticipant, unremoveParticipant, deleteParticipant } from '@/lib/db';
import { toast } from 'sonner';

export default function AdminParticipantsTab({ game, participants, predictions, privateInfo, items, votes, matches, reload }) {
  const [emailDialog, setEmailDialog] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [busy, setBusy] = useState(false);

  const itemsById = useMemo(() => { const m = {}; for (const it of items) m[it.id] = it; return m; }, [items]);
  const predictionsByParticipant = useMemo(() => {
    const m = {}; for (const p of predictions) m[p.participant_id] = p; return m;
  }, [predictions]);
  const voteCountByParticipant = useMemo(() => {
    const m = {};
    for (const v of votes) m[v.participant_id] = (m[v.participant_id] || 0) + 1;
    return m;
  }, [votes]);

  function copyBcc() {
    const emails = participants
      .filter((p) => !p.is_removed)
      .map((p) => privateInfo[p.person_id]?.email)
      .filter(Boolean);
    if (emails.length === 0) { toast.message('No emails saved yet'); return; }
    navigator.clipboard.writeText(emails.join(', '));
    toast.success(`Copied ${emails.length} emails (BCC)`);
  }
  function copyMissing() {
    const missing = participants
      .filter((p) => !p.is_removed)
      .filter((p) => !privateInfo[p.person_id]?.email)
      .map((p) => p.people?.full_name || 'Unknown');
    if (missing.length === 0) { toast.success('Every active player has an email'); return; }
    navigator.clipboard.writeText(missing.join('\n'));
    toast.success(`Copied ${missing.length} names without email`);
  }
  function copyCorrectPredictors() {
    if (!game.winner_item_id) { toast.message('Game is not complete yet'); return; }
    const winners = participants
      .filter((p) => !p.is_removed)
      .filter((p) => predictionsByParticipant[p.id]?.item_id === game.winner_item_id);
    if (winners.length === 0) { toast.message('No one predicted the champion'); return; }
    const lines = winners.map((p) => {
      const e = privateInfo[p.person_id]?.email || '';
      return `${p.people?.full_name || 'Unknown'}${e ? ' <' + e + '>' : ''}`;
    });
    navigator.clipboard.writeText(lines.join('\n'));
    toast.success(`Copied ${winners.length} correct predictors`);
  }
  function exportCsv() {
    const rows = [['Name', 'Email', 'Joined', 'Predicted Champion', 'Correct?', 'Votes Submitted']];
    for (const p of participants) {
      const fullName = p.people?.full_name || 'Unknown';
      const email = privateInfo[p.person_id]?.email || '';
      const pred = predictionsByParticipant[p.id];
      const predName = pred ? (itemsById[pred.item_id]?.name || '') : '';
      const correct = game.winner_item_id && pred?.item_id === game.winner_item_id ? 'YES' : '';
      const voteCount = voteCountByParticipant[p.id] || 0;
      rows.push([fullName, email, p.joined_at, predName, correct, voteCount]);
    }
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${game.slug}-participants.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  }

  async function saveEmail() {
    if (!emailDialog) return;
    setBusy(true);
    try {
      await setPersonEmail(emailDialog.person_id, emailInput.trim() || null);
      toast.success('Email saved');
      setEmailDialog(null); setEmailInput('');
      reload();
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  async function resetPrediction(p) {
    setBusy(true);
    try {
      const pred = predictionsByParticipant[p.id];
      if (pred) { await deletePrediction(pred.id); }
      toast.success('Prediction reset');
      reload();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  }
  async function resetVotes(p) {
    setBusy(true);
    try {
      await deleteVotesForParticipant(game.id, p.id);
      toast.success('Votes reset');
      reload();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  }
  async function toggleRemove(p) {
    setBusy(true);
    try {
      if (p.is_removed) { await unremoveParticipant(p.id); toast.success('Re-added'); }
      else { await removeParticipant(p.id); toast.success('Removed (soft)'); }
      reload();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  }
  async function purge(p) {
    setBusy(true);
    try {
      await deleteParticipant(p.id);
      toast.success('Participant purged');
      reload();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <BigCTAButton variant="secondary" onClick={copyBcc} testId="copy-bcc-button"><Copy className="w-4 h-4" /> Copy BCC list</BigCTAButton>
        <BigCTAButton variant="ghost" onClick={copyMissing} testId="copy-missing-emails-button">Copy names missing email</BigCTAButton>
        {game.winner_item_id && (
          <BigCTAButton variant="ghost" onClick={copyCorrectPredictors} testId="copy-correct-predictors-button"><Crown className="w-4 h-4" /> Copy correct predictors</BigCTAButton>
        )}
        <BigCTAButton variant="ghost" onClick={exportCsv} testId="export-csv-button"><Download className="w-4 h-4" /> Export CSV</BigCTAButton>
      </div>

      {participants.length === 0 ? (
        <GlowCard className="p-8 text-center" testId="participants-empty">
          <div className="font-display text-xl">No participants yet</div>
          <p className="text-sm text-[color:var(--cb-muted)] mt-2">Share the player link from the header to bring people in.</p>
        </GlowCard>
      ) : (
        <GlowCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-[color:var(--cb-muted)] uppercase tracking-widest border-b border-[color:var(--cb-border)]">
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email (admin only)</th>
                  <th className="text-left px-4 py-3">Predicted</th>
                  <th className="text-left px-4 py-3">Votes</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => {
                  const fullName = p.people?.full_name || 'Unknown';
                  const email = privateInfo[p.person_id]?.email;
                  const pred = predictionsByParticipant[p.id];
                  const predName = pred ? (itemsById[pred.item_id]?.name || '—') : '—';
                  const correct = game.winner_item_id && pred?.item_id === game.winner_item_id;
                  return (
                    <tr key={p.id} className="border-b border-[color:var(--cb-border)]/60 last:border-b-0" data-testid={`participant-row-${p.id}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={p.is_removed ? 'line-through text-[color:var(--cb-muted)]' : ''}>{fullName}</span>
                          {p.is_removed && <span className="text-[10px] uppercase tracking-widest text-[color:var(--cb-danger)]">Removed</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={email ? '' : 'text-[color:var(--cb-muted)]'}>{email || '—'}</span>
                          <button
                            className="p-1.5 rounded hover:bg-white/5"
                            onClick={() => { setEmailDialog(p); setEmailInput(email || ''); }}
                            data-testid={`participant-email-edit-${p.id}`}
                            title="Edit email"
                          ><Mail className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span>{predName}</span>
                          {correct && <span className="text-[10px] inline-flex items-center gap-1 rounded-full bg-[color:var(--cb-winner)]/15 text-[color:var(--cb-winner)] px-1.5 py-0.5 font-medium"><Crown className="w-2.5 h-2.5" />Correct</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">{voteCountByParticipant[p.id] || 0}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => resetPrediction(p)} className="p-1.5 rounded hover:bg-white/5" title="Reset prediction" data-testid={`participant-reset-prediction-${p.id}`}><RotateCcw className="w-3.5 h-3.5" /></button>
                          <button onClick={() => resetVotes(p)} className="p-1.5 rounded hover:bg-white/5" title="Reset votes" data-testid={`participant-reset-votes-${p.id}`}><RotateCcw className="w-3.5 h-3.5 rotate-180" /></button>
                          <button onClick={() => toggleRemove(p)} className="p-1.5 rounded hover:bg-white/5" title={p.is_removed ? 'Re-add' : 'Remove'} data-testid={`participant-toggle-remove-${p.id}`}><Trash2 className="w-3.5 h-3.5" /></button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="p-1.5 rounded hover:bg-white/5 text-[color:var(--cb-danger)]" title="Purge" data-testid={`participant-purge-${p.id}`}><Trash2 className="w-3.5 h-3.5" /></button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[color:var(--cb-card)] border-[color:var(--cb-border)] text-[color:var(--cb-text)]">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Purge this participant?</AlertDialogTitle>
                                <AlertDialogDescription>This deletes their participation, votes, and prediction in this game. The global person profile is kept (so they can re-join future games).</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)]">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => purge(p)} className="bg-[color:var(--cb-danger)] text-black">Purge</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlowCard>
      )}

      <Dialog open={!!emailDialog} onOpenChange={(v) => !v && setEmailDialog(null)}>
        <DialogContent className="bg-[color:var(--cb-card)] border-[color:var(--cb-border)] text-[color:var(--cb-text)]" data-testid="email-edit-dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Email for {emailDialog?.people?.full_name}</DialogTitle>
          </DialogHeader>
          <Label className="text-xs text-[color:var(--cb-muted)]">Email address</Label>
          <Input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="name@office.com" className="bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)]" data-testid="email-input" />
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <BigCTAButton variant="secondary" onClick={() => setEmailDialog(null)} testId="email-cancel">Cancel</BigCTAButton>
            <BigCTAButton onClick={saveEmail} loading={busy} testId="email-save">Save</BigCTAButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
