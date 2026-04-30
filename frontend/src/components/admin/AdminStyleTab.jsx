import React, { useEffect, useState } from 'react';
import GlowCard from '@/components/GlowCard';
import BigCTAButton from '@/components/BigCTAButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { updateGame } from '@/lib/db';
import { toast } from 'sonner';

const PRESETS = {
  'ContiBingo Style (Default)': {
    bg: '#070A12', card: '#0B1226', text: '#EAF0FF', accent: '#FF4FD8',
    accent2: '#4DA3FF', winner: '#2EF2B3', bracket_line: '#2A3B6B',
    glow: 0.55,
  },
  'Tournament Night Pink': {
    bg: '#090611', card: '#120B24', text: '#FFF1FB', accent: '#FF4FD8',
    accent2: '#4DA3FF', winner: '#FFB020', bracket_line: '#3A2A55',
    glow: 0.7,
  },
  'Cool Blue Court': {
    bg: '#050B12', card: '#081A2F', text: '#EAF6FF', accent: '#4DA3FF',
    accent2: '#2EF2B3', winner: '#4DA3FF', bracket_line: '#1B3E63',
    glow: 0.5,
  },
};

export default function AdminStyleTab({ game, reload }) {
  const [style, setStyle] = useState(game.style_json || PRESETS['ContiBingo Style (Default)']);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setStyle(game.style_json || PRESETS['ContiBingo Style (Default)']); }, [game.id]); // eslint-disable-line

  function applyPreset(name) { setStyle({ ...PRESETS[name] }); }

  function update(field, value) { setStyle((s) => ({ ...s, [field]: value })); }

  async function save() {
    setBusy(true);
    try {
      await updateGame(game.id, { style_json: style });
      toast.success('Style saved');
      reload();
    } catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  // Apply style as CSS variables to the preview only.
  const previewVars = {
    '--cb-bg': style.bg, '--cb-card': style.card, '--cb-card-2': style.card,
    '--cb-text': style.text, '--cb-accent': style.accent,
    '--cb-accent-2': style.accent2, '--cb-winner': style.winner,
    '--cb-bracket-line': style.bracket_line,
    '--cb-glow-strength': String(style.glow),
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
      <GlowCard className="p-5" testId="style-editor">
        <h3 className="font-display text-lg mb-3">Theme editor</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.keys(PRESETS).map((p) => (
            <BigCTAButton key={p} variant="secondary" onClick={() => applyPreset(p)} testId={`preset-${p.replace(/\s+/g, '-').toLowerCase()}`}>{p}</BigCTAButton>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {[
            ['bg', 'Background'], ['card', 'Card'], ['text', 'Text'],
            ['accent', 'Accent'], ['accent2', 'Accent 2'], ['winner', 'Winner'],
            ['bracket_line', 'Bracket lines'],
          ].map(([k, label]) => (
            <div key={k} className="flex items-center gap-3">
              <input
                type="color"
                value={style[k] || '#000000'}
                onChange={(e) => update(k, e.target.value)}
                className="w-9 h-9 rounded border border-[color:var(--cb-border)] bg-transparent"
                data-testid={`color-${k}`}
              />
              <Input value={style[k] || ''} onChange={(e) => update(k, e.target.value)} className="flex-1 bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)]" />
              <span className="w-24 text-xs text-[color:var(--cb-muted)]">{label}</span>
            </div>
          ))}
          <div>
            <Label className="text-xs text-[color:var(--cb-muted)]">Glow intensity ({(style.glow ?? 0.55).toFixed(2)})</Label>
            <Slider value={[Math.round((style.glow ?? 0.55) * 100)]} onValueChange={(v) => update('glow', v[0] / 100)} max={100} step={1} className="mt-2" />
          </div>
        </div>
        <div className="mt-5">
          <BigCTAButton onClick={save} loading={busy} testId="style-save-button">Save theme</BigCTAButton>
        </div>
      </GlowCard>

      <div
        className="rounded-[18px] border border-[color:var(--cb-border)] p-6 min-h-[320px] cb-glow-halo"
        style={{ ...previewVars, background: style.bg, color: style.text }}
        data-testid="style-preview"
      >
        <div className="text-xs uppercase tracking-widest opacity-70">Preview</div>
        <h2 className="font-display text-2xl tracking-tight mt-1">{game.title}</h2>
        <p className="text-sm opacity-70 mt-1">{game.prediction_question}</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            className="rounded-[16px] p-3 border"
            style={{ background: style.card, borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <div className="font-display">Wingstop</div>
            <div className="opacity-70 text-xs">Sample item A</div>
          </div>
          <div
            className="rounded-[16px] p-3 border"
            style={{ background: style.card, borderColor: style.winner }}
          >
            <div className="font-display" style={{ color: style.winner }}>Buffalo Wild Wings</div>
            <div className="opacity-70 text-xs">Winner highlight</div>
          </div>
        </div>
        <button
          className="mt-4 inline-flex items-center rounded-[16px] px-4 py-2 text-sm font-semibold"
          style={{ background: style.accent, color: '#000' }}
        >
          Big CTA
        </button>
      </div>
    </div>
  );
}
