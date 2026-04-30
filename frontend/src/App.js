import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Landing from '@/pages/Landing';
import PlayerGame from '@/pages/PlayerGame';
import AdminGate from '@/pages/AdminGate';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminGameManager from '@/pages/AdminGameManager';
import DisplayMode from '@/pages/DisplayMode';
import NotFound from '@/pages/NotFound';
import MisconfigScreen from '@/pages/MisconfigScreen';
import ErrorBoundary from '@/components/ErrorBoundary';
import { supabaseConfigOk } from '@/lib/supabaseClient';
import '@/App.css';

export default function App() {
  return (
    <div className="App relative min-h-screen">
      <div className="cb-ambient" />
      <div className="relative z-10">
        <ErrorBoundary>
          {!supabaseConfigOk ? (
            <MisconfigScreen />
          ) : (
            <HashRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/game/:slug" element={<PlayerGame />} />
                <Route path="/admin" element={<AdminGate />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/games/:gameId" element={<AdminGameManager />} />
                <Route path="/display/:slug" element={<DisplayMode />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </HashRouter>
          )}
        </ErrorBoundary>
      </div>
      <Toaster richColors position="top-center" theme="dark" />
    </div>
  );
}
