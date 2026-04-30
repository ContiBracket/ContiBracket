import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlowCard from '@/components/GlowCard';
import BigCTAButton from '@/components/BigCTAButton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteGame, deleteVotesForGame, deleteMatchesForGame } from '@/lib/db';
import { toast } from 'sonner';
import { Trash2, RefreshCw } from 'lucide-react';

export default function AdminDangerTab({ game, reload }) {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);

  async function nukeBracket() {
    setBusy(true);
    try {
      await deleteVotesForGame(game.id);
      await deleteMatchesForGame(game.id);
      toast.success('Bracket data wiped');
      reload();
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  }
  async function nukeGame() {
    setBusy(true);
    try {
      await deleteGame(game.id);
      toast.success('Game deleted');
      nav('/admin/dashboard');
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <GlowCard className="p-5 border-[color:var(--cb-warning)]/40" testId="danger-wipe-bracket-card">
        <h3 className="font-display text-lg">Wipe bracket data</h3>
        <p className="text-sm text-[color:var(--cb-muted)] mt-1">Deletes all matches and votes for this game. Items, participants, predictions, and emails are preserved.</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <BigCTAButton variant="secondary" testId="danger-wipe-bracket-button" className="mt-4"><RefreshCw className="w-4 h-4" /> Wipe bracket</BigCTAButton>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[color:var(--cb-card)] border-[color:var(--cb-border)] text-[color:var(--cb-text)]">
            <AlertDialogHeader>
              <AlertDialogTitle>Wipe bracket?</AlertDialogTitle>
              <AlertDialogDescription>All matches and votes will be deleted. Predictions remain.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)]">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={nukeBracket} className="bg-[color:var(--cb-danger)] text-black">Wipe</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </GlowCard>

      <GlowCard className="p-5 border-[color:var(--cb-danger)]/40" testId="danger-delete-game-card">
        <h3 className="font-display text-lg text-[color:var(--cb-danger)]">Delete game</h3>
        <p className="text-sm text-[color:var(--cb-muted)] mt-1">Deletes this game and all related items, participants (in-game), predictions, matches, and votes. Global person profiles and emails are kept.</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <BigCTAButton variant="danger" testId="danger-delete-game-button" className="mt-4"><Trash2 className="w-4 h-4" /> Delete game</BigCTAButton>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-[color:var(--cb-card)] border-[color:var(--cb-border)] text-[color:var(--cb-text)]">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this game?</AlertDialogTitle>
              <AlertDialogDescription>This is permanent. The game and all of its bracket data will be removed.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)]">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={nukeGame} className="bg-[color:var(--cb-danger)] text-black">Delete forever</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </GlowCard>
    </div>
  );
}
