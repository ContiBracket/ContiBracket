import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingScreen({ label = 'Loading\u2026' }) {
  return (
    <div
      data-testid="loading-state"
      className="min-h-[40vh] flex flex-col items-center justify-center text-[color:var(--cb-muted)] gap-3"
    >
      <Loader2 className="w-6 h-6 animate-spin" />
      <div className="text-sm">{label}</div>
    </div>
  );
}

export default LoadingScreen;
