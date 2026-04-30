import React from 'react';
import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TopBar({ title = 'ContiBracket', subtitle, right, showAdminLink = true }) {
  return (
    <header className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-3">
      <Link to="/" className="flex items-center gap-2 group" data-testid="top-logo-link">
        <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-[color:var(--cb-accent)] to-[color:var(--cb-accent-2)] flex items-center justify-center shadow-[0_10px_30px_rgba(255,79,216,0.25)]">
          <Trophy className="w-5 h-5 text-black" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-display text-base font-semibold tracking-tight">{title}</span>
          {subtitle && <span className="text-[11px] text-[color:var(--cb-muted)]">{subtitle}</span>}
        </div>
      </Link>
      <div className="flex items-center gap-3">
        {right}
        {showAdminLink && (
          <Link
            to="/admin"
            data-testid="top-admin-link"
            className="text-xs text-[color:var(--cb-muted)] hover:text-[color:var(--cb-text)] transition-colors"
          >
            Admin
          </Link>
        )}
      </div>
    </header>
  );
}

export default TopBar;
