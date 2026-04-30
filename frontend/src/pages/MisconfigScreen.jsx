import React from 'react';
import GlowCard from '@/components/GlowCard';
import { AlertTriangle } from 'lucide-react';

export default function MisconfigScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <GlowCard className="p-6 sm:p-8 max-w-[620px] w-full" testId="misconfig-screen">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-[12px] bg-[color:var(--cb-warning)]/15 text-[color:var(--cb-warning)] flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display text-xl tracking-tight">ContiBracket can’t reach Supabase</div>
            <div className="text-xs text-[color:var(--cb-muted)]">Missing or invalid environment variables.</div>
          </div>
        </div>
        <div className="text-sm text-[color:var(--cb-muted)] space-y-3">
          <p>This build was produced without the required env vars. Fix it in two steps:</p>
          <ol className="list-decimal pl-5 space-y-2 text-[color:var(--cb-text)]">
            <li>
              Add these three <strong>repository secrets</strong> on GitHub (Settings → Secrets and variables → Actions):
              <ul className="list-disc pl-5 mt-1 text-sm">
                <li><code>REACT_APP_SUPABASE_URL</code></li>
                <li><code>REACT_APP_SUPABASE_ANON_KEY</code></li>
                <li><code>REACT_APP_ADMIN_PIN</code></li>
              </ul>
            </li>
            <li>Re-run the GitHub Actions workflow (“Deploy ContiBracket to GitHub Pages”) or push any change to <code>main</code>.</li>
          </ol>
          <p className="text-xs">See <code>DEPLOY.md</code> for step-by-step guidance.</p>
        </div>
      </GlowCard>
    </div>
  );
}
