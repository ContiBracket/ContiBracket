import React, { useState } from 'react';
import GlowCard from '@/components/GlowCard';
import BigCTAButton from '@/components/BigCTAButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { updateGame } from '@/lib/db';
import { toast } from 'sonner';
import { slugify } from '@/lib/slug';

export default function AdminSettingsTab({ game, reload }) {
  const [s, setS] = useState({
    title: game.title || '',
    slug: game.slug || '',
    prediction_question: game.prediction_question || '',
    voting_question_template: game.voting_question_template || '',
    anonymous_voting_enabled: !!game.anonymous_voting_enabled,
    show_vote_totals: !!game.show_vote_totals,
    show_voter_names: !!game.show_voter_names,
    show_bracket_before_voting: !!game.show_bracket_before_voting,
    tie_break_mode: game.tie_break_mode || 'admin',
    drama_mode: !!game.drama_mode,
  });
  const [busy, setBusy] = useState(false);

  function up(k, v) { setS((p) => ({ ...p, [k]: v })); }

  async function save() {
    setBusy(true);
    try {
      await updateGame(game.id, { ...s, slug: slugify(s.slug) });
      toast.success('Settings saved');
      reload();
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlowCard className="p-5" testId="settings-game-card">
        <h3 className="font-display text-lg mb-3">Game info</h3>
        <div className="flex flex-col gap-3">
          <div>
            <Label className="text-xs text-[color:var(--cb-muted)]">Title</Label>
            <Input value={s.title} onChange={(e) => up('title', e.target.value)} className="mt-1 bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)]" data-testid="settings-title" />
          </div>
          <div>
            <Label className="text-xs text-[color:var(--cb-muted)]">Slug</Label>
            <Input value={s.slug} onChange={(e) => up('slug', e.target.value)} className="mt-1 bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)]" data-testid="settings-slug" />
            <div className="text-xs text-[color:var(--cb-muted)] mt-1">Player link: <code className="text-[color:var(--cb-text)]">/#/game/{slugify(s.slug)}</code></div>
          </div>
          <div>
            <Label className="text-xs text-[color:var(--cb-muted)]">Prediction question</Label>
            <Textarea rows={2} value={s.prediction_question} onChange={(e) => up('prediction_question', e.target.value)} className="mt-1 bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)]" data-testid="settings-prediction-q" />
          </div>
          <div>
            <Label className="text-xs text-[color:var(--cb-muted)]">Voting question template</Label>
            <Input value={s.voting_question_template} onChange={(e) => up('voting_question_template', e.target.value)} className="mt-1 bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)]" data-testid="settings-vote-q" />
          </div>
        </div>
      </GlowCard>
      <GlowCard className="p-5" testId="settings-rules-card">
        <h3 className="font-display text-lg mb-3">Voting rules</h3>
        <div className="flex flex-col gap-4">
          <SwitchRow label="Anonymous voting" desc="Players see totals/percentages but not names." checked={s.anonymous_voting_enabled} onChange={(v) => up('anonymous_voting_enabled', v)} testId="toggle-anonymous" />
          <SwitchRow label="Show vote totals" desc="Show vote counts/percentages on the bracket." checked={s.show_vote_totals} onChange={(v) => up('show_vote_totals', v)} testId="toggle-totals" />
          <SwitchRow label="Show voter names" desc="Show who voted for what (only when not anonymous)." checked={s.show_voter_names} onChange={(v) => up('show_voter_names', v)} testId="toggle-voter-names" />
          <SwitchRow label="Show bracket before voting" desc="Players can preview the bracket before voting opens." checked={s.show_bracket_before_voting} onChange={(v) => up('show_bracket_before_voting', v)} testId="toggle-bracket-before" />
          <SwitchRow label="Office Drama Mode" desc="Reveal results one matchup at a time on TV mode." checked={s.drama_mode} onChange={(v) => up('drama_mode', v)} testId="toggle-drama" />
          <div>
            <Label className="text-xs text-[color:var(--cb-muted)]">Tie-break mode</Label>
            <Select value={s.tie_break_mode} onValueChange={(v) => up('tie_break_mode', v)}>
              <SelectTrigger className="mt-1 bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)]" data-testid="settings-tie-mode"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin resolves manually</SelectItem>
                <SelectItem value="random">Random winner</SelectItem>
                <SelectItem value="higher_seed">Higher seed wins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-5">
          <BigCTAButton onClick={save} loading={busy} testId="settings-save-button">Save settings</BigCTAButton>
        </div>
      </GlowCard>
    </div>
  );
}

function SwitchRow({ label, desc, checked, onChange, testId }) {
  return (
    <div className="flex items-start gap-3">
      <Switch checked={checked} onCheckedChange={onChange} data-testid={testId} />
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-[color:var(--cb-muted)]">{desc}</div>
      </div>
    </div>
  );
}
