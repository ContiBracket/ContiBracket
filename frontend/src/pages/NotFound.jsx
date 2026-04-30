import React from 'react';
import { Link } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import GlowCard from '@/components/GlowCard';
import BigCTAButton from '@/components/BigCTAButton';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1 flex items-center justify-center px-4">
        <GlowCard className="p-8 max-w-[480px] text-center" testId="notfound-card">
          <div className="font-display text-3xl mb-2">Nothing here</div>
          <p className="text-sm text-[color:var(--cb-muted)] mb-6">
            That game link looks invalid or expired. Ask your organizer for the correct link.
          </p>
          <Link to="/">
            <BigCTAButton variant="secondary" testId="notfound-home-button">Back to home</BigCTAButton>
          </Link>
        </GlowCard>
      </main>
    </div>
  );
}
