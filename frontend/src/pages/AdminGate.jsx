import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TopBar from '@/components/TopBar';
import GlowCard from '@/components/GlowCard';
import BigCTAButton from '@/components/BigCTAButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import { ADMIN_PIN, unlockAdmin, isAdminUnlocked } from '@/lib/identity';
import { toast } from 'sonner';

export default function AdminGate() {
  const nav = useNavigate();
  const [pin, setPin] = useState('');
  const [shaking, setShaking] = useState(false);

  React.useEffect(() => {
    if (isAdminUnlocked()) nav('/admin/dashboard', { replace: true });
  }, [nav]);

  function submit(e) {
    e.preventDefault();
    if ((pin || '').trim() === ADMIN_PIN) {
      unlockAdmin();
      toast.success('Welcome, admin');
      nav('/admin/dashboard', { replace: true });
    } else {
      setShaking(true);
      toast.error('Wrong PIN');
      setTimeout(() => setShaking(false), 400);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar showAdminLink={false} />
      <main className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={`w-full max-w-[420px] ${shaking ? 'animate-[shake_0.4s]' : ''}`}
        >
          <GlowCard className="p-6 sm:p-8" testId="admin-gate-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-[12px] bg-[color:var(--cb-accent)]/15 text-[color:var(--cb-accent)] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display text-xl tracking-tight">Admin access</div>
                <div className="text-xs text-[color:var(--cb-muted)]">Enter your office PIN.</div>
              </div>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-3">
              <Label htmlFor="pin" className="text-xs text-[color:var(--cb-muted)]">PIN</Label>
              <Input
                id="pin"
                data-testid="admin-pin-input"
                inputMode="numeric"
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="bg-[color:var(--cb-card-2)] border-[color:var(--cb-border)] text-[color:var(--cb-text)] focus-visible:ring-[color:var(--cb-ring)]"
              />
              <BigCTAButton type="submit" testId="admin-pin-submit" className="mt-2">
                Unlock
              </BigCTAButton>
            </form>
          </GlowCard>
        </motion.div>
      </main>
    </div>
  );
}
