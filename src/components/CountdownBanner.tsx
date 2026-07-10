/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, Zap, Lock, RefreshCw } from 'lucide-react';
import { db } from '../utils/database';
import { GamerButton, GamerPanel } from './GamerCard';

interface CountdownBannerProps {
  onStatusChange?: () => void;
  isAdmin?: boolean;
}

export const CountdownBanner: React.FC<CountdownBannerProps> = ({ onStatusChange, isAdmin }) => {
  const [status, setStatus] = useState(db.isSystemOpen());
  const [countdownString, setCountdownString] = useState('');

  useEffect(() => {
    const updateStatus = () => {
      const s = db.isSystemOpen();
      setStatus(s);

      if (!s.isOpen) {
        const hours = Math.floor(s.remainingSeconds / 3600);
        const mins = Math.floor((s.remainingSeconds % 3600) / 60);
        const secs = s.remainingSeconds % 60;

        const hrStr = hours.toString().padStart(2, '0');
        const minStr = mins.toString().padStart(2, '0');
        const secStr = secs.toString().padStart(2, '0');

        setCountdownString(`${hrStr}:${minStr}:${secStr}`);
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleBypassToggle = () => {
    const settings = db.getSettings();
    db.updateSettings('system_evaluator', {
      isBypassActive: !settings.isBypassActive
    });
    setStatus(db.isSystemOpen());
    if (onStatusChange) onStatusChange();
  };

  if (status.isOpen) return null;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full animate-fade-in">
        <GamerPanel
          variant="gold"
          className="border-amber-500/30 text-center relative"
        >
          {/* Top Decorative Bars */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-amber-950/40 border border-amber-500/40 animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Lock className="w-12 h-12 text-amber-400" />
            </div>
          </div>

          <h2 className="font-display font-black text-3xl uppercase tracking-wider text-amber-400 mb-2">
            X1 ALZ FECHADO
          </h2>
          
          <p className="text-neutral-400 text-sm mb-6 max-w-sm mx-auto">
            O portal de apostas PvP opera exclusivamente nos horários de pico comercial para garantir monitoramento total dos administradores.
          </p>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
            <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest mb-1">
              Horário de Funcionamento
            </p>
            <p className="text-xl font-display font-bold text-neutral-200 mb-4">
              {status.openAtString} até {status.closeAtString}
            </p>

            <div className="h-[1px] bg-neutral-800 my-4" />

            <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest mb-2">
              Abertura em
            </p>
            <p className="text-4xl font-mono font-bold tracking-widest text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              {countdownString || "Carregando..."}
            </p>
          </div>
        </GamerPanel>
      </div>
    </div>
  );
};
