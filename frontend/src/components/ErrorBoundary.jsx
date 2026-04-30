import React from 'react';
import GlowCard from '@/components/GlowCard';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[ContiBracket] Uncaught error:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <GlowCard className="p-6 sm:p-8 max-w-[640px] w-full" testId="error-boundary">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-[12px] bg-[color:var(--cb-danger)]/15 text-[color:var(--cb-danger)] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display text-xl">Something went sideways</div>
                <div className="text-xs text-[color:var(--cb-muted)]">ContiBracket hit an unexpected error while rendering.</div>
              </div>
            </div>
            <pre className="mt-3 text-xs whitespace-pre-wrap break-words rounded-[12px] border border-[color:var(--cb-border)] bg-[color:var(--cb-card-2)] p-3 text-[color:var(--cb-muted)]">
{String(this.state.error && this.state.error.stack || this.state.error || 'unknown')}
            </pre>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => { this.setState({ error: null }); window.location.hash = '/'; }}
                className="inline-flex items-center rounded-[16px] px-4 py-2 text-sm font-semibold bg-[color:var(--cb-card-2)] border border-[color:var(--cb-border)]"
              >Go home</button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center rounded-[16px] px-4 py-2 text-sm font-semibold bg-[color:var(--cb-accent)] text-black"
              >Reload</button>
            </div>
          </GlowCard>
        </div>
      );
    }
    return this.props.children;
  }
}
