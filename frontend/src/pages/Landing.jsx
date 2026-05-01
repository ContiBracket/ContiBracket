import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import TopBar from '@/components/TopBar';
import GlowCard from '@/components/GlowCard';
import { Trophy, Sparkles, Users, ArrowRight, Tv } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1 px-4 sm:px-6 pb-12">
        <div className="mx-auto max-w-[720px] flex flex-col items-center text-center pt-6 sm:pt-12">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--cb-border)] bg-[color:var(--cb-card)] px-3 py-1 text-xs text-[color:var(--cb-muted)]"
          >
            <Sparkles className="w-3 h-3 text-[color:var(--cb-accent)]" />
            Office tournament
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight"
          >
            Welcome to <span className="text-[color:var(--cb-accent)]">ContiBracket</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
            className="mt-4 max-w-[560px] text-[color:var(--cb-muted)] text-sm sm:text-base"
          >
            Vote round by round on whatever the office is debating this week. Pick your champion.
            Watch the bracket play out. Crown a winner.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45 }}
            className="mt-8 w-full"
          >
            <GlowCard className="p-6 sm:p-8 text-left" testId="landing-info-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-[12px] bg-[color:var(--cb-accent)]/15 text-[color:var(--cb-accent)] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg">Joining a bracket?</h2>
                  <p className="text-xs text-[color:var(--cb-muted)]">Use the link your organizer sent you.</p>
                </div>
              </div>
              <p className="text-sm text-[color:var(--cb-muted)] leading-relaxed">
                Each game has its own link like
                <code className="mx-1 px-1.5 py-0.5 rounded bg-white/5 text-[color:var(--cb-text)]">/#/game/your-bracket-slug</code>
                Open it on your phone or computer, type your full name once, and you’re in.
              </p>
            </GlowCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.45 }}
            className="mt-6 w-full grid sm:grid-cols-2 gap-4"
          >
            <Link to="/admin" data-testid="landing-admin-link" className="block">
              <GlowCard className="p-5 hover:border-white/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-[color:var(--cb-accent-2)]/15 text-[color:var(--cb-accent-2)] flex items-center justify-center">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-display text-base">Admin</div>
                    <div className="text-xs text-[color:var(--cb-muted)]">Create and run office brackets</div>
                  </div>
                  <ArrowRight className="ml-auto w-4 h-4 text-[color:var(--cb-muted)]" />
                </div>
              </GlowCard>
            </Link>

            <a href="#/admin" data-testid="landing-tv-hint" className="block">
              <GlowCard className="p-5 hover:border-white/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-[color:var(--cb-winner)]/15 text-[color:var(--cb-winner)] flex items-center justify-center">
                    <Tv className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-display text-base">Office TV mode</div>
                    <div className="text-xs text-[color:var(--cb-muted)]">Each game has a /display/&lt;slug&gt; URL</div>
                  </div>
                  <ArrowRight className="ml-auto w-4 h-4 text-[color:var(--cb-muted)]" />
                </div>
              </GlowCard>
            </a>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
