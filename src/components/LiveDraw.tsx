/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Coins, ShieldAlert, Sparkles, AlertCircle, Clock, Play } from 'lucide-react';
import { Room, User } from '../types';
import { sound } from '../utils/audio';
import { db, formatALZ } from '../utils/database';
import { GamerButton, GamerPanel, GamerBadge } from './GamerCard';

interface LiveDrawProps {
  room: Room;
  currentUser?: User | null;
  onFinished: (winnerId: string) => void;
  onCancel: () => void;
}

export const LiveDraw: React.FC<LiveDrawProps> = ({ room, currentUser, onFinished, onCancel }) => {
  const isReplayMode = !!room.isReplay || room.status === 'finished';

  const calculateRemainingSeconds = () => {
    if (isReplayMode) return 0;
    if (!room.countdownStartedAt) return 0;
    const startTime = new Date(room.countdownStartedAt).getTime();
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const totalSeconds = 2 * 60; // 2 minutes
    const remaining = totalSeconds - elapsedSeconds;
    return remaining > 0 ? remaining : 0;
  };

  const [phase, setPhase] = useState<'countdown' | 'spinning' | 'winner'>(() => {
    if (isReplayMode) return 'spinning';
    const remaining = calculateRemainingSeconds();
    return remaining > 0 ? 'countdown' : 'spinning';
  });

  const [currentRoom, setCurrentRoom] = useState<Room>(room);
  const [secondsLeft, setSecondsLeft] = useState<number>(calculateRemainingSeconds);
  const [spinTick, setSpinTick] = useState(0);
  const [activeHighlight, setActiveHighlight] = useState<'p1' | 'p2'>('p1');

  // Poll room updates from database and track player presence
  useEffect(() => {
    if (isReplayMode) return;
    if (!currentUser) return;

    // Set presence to true immediately on mount
    const dbRoom = db.updateRoomPresence(room.id, currentUser.id, true);
    if (dbRoom) {
      setCurrentRoom({ ...dbRoom });
    }

    const interval = setInterval(() => {
      const updatedDbRoom = db.updateRoomPresence(room.id, currentUser.id, true);
      if (updatedDbRoom) {
        setCurrentRoom({ ...updatedDbRoom });

        // If the skip has been requested and confirmed, trigger spinning phase!
        if (updatedDbRoom.skipRequestedBy && updatedDbRoom.skipConfirmedBy) {
          setPhase('spinning');
          db.resetSkipRequests(room.id);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      // Clean up presence to false on exit
      db.updateRoomPresence(room.id, currentUser.id, false);
    };
  }, [room.id, currentUser, isReplayMode]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // Countdown timer loop
  useEffect(() => {
    if (phase !== 'countdown') return;

    const timer = setInterval(() => {
      const remaining = calculateRemainingSeconds();
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        setPhase('spinning');
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, room]);

  // Sound effects & state loop for the spinning phase
  useEffect(() => {
    if (phase !== 'spinning') return;

    let tickCount = 0;
    const maxTicks = 25; // number of times it shifts players
    const baseInterval = 100; // ms

    const triggerTick = () => {
      if (tickCount >= maxTicks) {
        // Finalize spinning, determine winner
        setPhase('winner');
        
        // Find designated winner
        const targetWinnerId = room.winnerId || room.preDeterminedWinnerId;
        let winner: 'p1' | 'p2' = 'p1';
        if (targetWinnerId) {
          winner = (targetWinnerId === room.player1Id) ? 'p1' : 'p2';
        } else {
          winner = Math.random() < 0.5 ? 'p1' : 'p2';
        }

        setActiveHighlight(winner);
        
        sound.playFanfare();
        startFireworks();

        const resolvedWinnerId = winner === 'p1' ? room.player1Id : room.player2Id!;
        
        // Only trigger onFinished callback if NOT in replay mode
        setTimeout(() => {
          if (!isReplayMode) {
            onFinished(resolvedWinnerId);
          }
        }, 1000);
        return;
      }

      // Alternate highlight
      setActiveHighlight(prev => prev === 'p1' ? 'p2' : 'p1');
      sound.playTick();
      tickCount++;

      // Progressively slower ticks to build anticipation
      const nextDelay = baseInterval + (tickCount * tickCount * 0.6);
      setTimeout(triggerTick, nextDelay);
    };

    // Begin spin automatically after 800ms
    const timer = setTimeout(() => {
      triggerTick();
    }, 800);

    return () => {
      clearTimeout(timer);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [phase, room]);

  // Fireworks Animation Engine using Canvas
  const startFireworks = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    canvas.height = canvas.parentElement?.clientHeight || 500;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      decay: number;
      size: number;
    }

    interface Firework {
      x: number;
      y: number;
      particles: Particle[];
    }

    let fireworks: Firework[] = [];
    const colors = ['#22d3ee', '#fbbf24', '#f59e0b', '#06b6d4', '#e11d48', '#10b981'];

    const createFirework = (x: number, y: number) => {
      const particles: Particle[] = [];
      const particleCount = 40 + Math.floor(Math.random() * 30);
      
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (Math.random() * 2), // slight gravity counter
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: 0.015 + Math.random() * 0.02,
          size: 2 + Math.random() * 3
        });
      }
      fireworks.push({ x, y, particles });
    };

    // Auto trigger initial fireworks
    createFirework(canvas.width * 0.3, canvas.height * 0.4);
    createFirework(canvas.width * 0.7, canvas.height * 0.3);
    createFirework(canvas.width * 0.5, canvas.height * 0.5);

    // Periodically spawn new ones
    const spawnTimer = setInterval(() => {
      if (document.hidden) return;
      createFirework(
        Math.random() * canvas.width,
        Math.random() * (canvas.height * 0.6) + canvas.height * 0.1
      );
    }, 1500);

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.2)'; // semi-transparent trace
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      fireworks.forEach((fw, fIdx) => {
        fw.particles.forEach((p, pIdx) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.05; // gravity force
          p.alpha -= p.decay;

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (p.alpha <= 0) {
            fw.particles.splice(pIdx, 1);
          }
        });

        if (fw.particles.length === 0) {
          fireworks.splice(fIdx, 1);
        }
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      clearInterval(spawnTimer);
    };
  };

  const getWinnerName = () => {
    if (activeHighlight === 'p1') return room.player1Nick;
    return room.player2Nick || "Oponente";
  };

  const calculateHouseFee = () => {
    return Math.floor(room.betAmount * 2 * (room.houseFeePercent / 100));
  };

  const calculateNetWinner = () => {
    return (room.betAmount * 2) - calculateHouseFee();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const isAdmin = currentUser?.role === 'admin';
  const bothPlayersPresent = isAdmin || !!(currentRoom.player1Present && currentRoom.player2Present);

  const handleRequestSkip = () => {
    if (!bothPlayersPresent) return;
    if (!currentUser) return;
    db.requestSkipCountdown(room.id, currentUser.id);
    const updated = db.getRooms().find(r => r.id === room.id);
    if (updated) {
      setCurrentRoom({ ...updated });
    }
    sound.playClick();
  };

  const handleConfirmSkip = () => {
    if (!currentUser) return;
    db.confirmSkipCountdown(room.id, currentUser.id);
    const updated = db.getRooms().find(r => r.id === room.id);
    if (updated) {
      setCurrentRoom({ ...updated });
      // If fully confirmed, start spinning!
      if (updated.skipRequestedBy && updated.skipConfirmedBy) {
        setPhase('spinning');
        db.resetSkipRequests(room.id);
      }
    }
    sound.playSuccess();
  };

  const handleRejectSkip = () => {
    db.resetSkipRequests(room.id);
    const updated = db.getRooms().find(r => r.id === room.id);
    if (updated) {
      setCurrentRoom({ ...updated });
    }
    sound.playClick();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in relative min-h-[70vh] flex flex-col justify-center">
      
      {/* Canvas Layer for Fireworks */}
      {phase === 'winner' && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10 rounded-2xl"
        />
      )}

      <GamerPanel
        variant={phase === 'winner' ? 'gold' : 'blue'}
        className="relative z-20 overflow-hidden border-2 shadow-2xl"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-amber-500 to-cyan-500" />

        {/* Room Header Info */}
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-white/10 pb-4 mb-8">
          <div>
            <GamerBadge variant="blue" className="mb-1.5">
              {isReplayMode ? 'Replay do Sorteio 🎥' : 'Sorteio Ao Vivo ⚡'}
            </GamerBadge>
            <h2 className="font-display font-black text-2xl uppercase tracking-wider text-gray-200">
              SALA {room.code}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500 font-mono block">VALOR APOSTADO INDIVIDUAL</span>
            <span className="text-xl font-mono font-bold text-gold-cabal">
              {formatALZ(room.betAmount)}
            </span>
          </div>
        </div>

        {phase === 'countdown' ? (
          <div className="text-center py-8 px-4 max-w-lg mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/30 rounded-full text-neon-cyan text-xxs font-mono uppercase tracking-wider animate-pulse">
              <Clock className="w-3.5 h-3.5 animate-spin" /> Aguardando Jogadores Ao Vivo
            </div>
            
            <div className="space-y-1.5">
              <h3 className="font-display font-black text-xl text-gray-200 uppercase tracking-wider">
                Contagem Regressiva do Duelo
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Os jogadores têm 2 minutos para se posicionarem. A roleta rodará automaticamente quando o tempo zerar.
              </p>
            </div>

            {/* Player Presence Indicator Cards */}
            <div className="grid grid-cols-2 gap-4 my-2">
              {/* Player 1 Card */}
              <div className={`p-3 rounded-xl border font-mono text-left relative overflow-hidden transition-all duration-300 ${
                currentRoom.player1Present 
                  ? 'border-neon-cyan/30 bg-cyan-950/10 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                  : 'border-white/10 bg-white/5/40 opacity-60'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-gray-400 font-sans tracking-wider">CRIADOR DA SALA</span>
                  <span className={`w-2 h-2 rounded-full ${currentRoom.player1Present ? 'bg-cyan-400 animate-pulse' : 'glass-panel'}`} />
                </div>
                <p className="font-display font-black text-sm uppercase text-gray-200 mt-1.5 truncate">
                  {currentRoom.player1Nick}
                </p>
                <p className="text-[9px] font-sans text-gray-500 mt-1">
                  {currentRoom.player1Present ? '🟢 Na tela do sorteio' : '⏳ Ausente / Não logou'}
                </p>
              </div>

              {/* Player 2 Card */}
              <div className={`p-3 rounded-xl border font-mono text-left relative overflow-hidden transition-all duration-300 ${
                currentRoom.player2Present 
                  ? 'border-gold-cabal/30 bg-amber-950/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                  : 'border-white/10 bg-white/5/40 opacity-60'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-gray-400 font-sans tracking-wider">DESAFIANTE</span>
                  <span className={`w-2 h-2 rounded-full ${currentRoom.player2Present ? 'bg-amber-400 animate-pulse' : 'glass-panel'}`} />
                </div>
                <p className="font-display font-black text-sm uppercase text-gray-200 mt-1.5 truncate">
                  {currentRoom.player2Nick || 'Sem Oponente'}
                </p>
                <p className="text-[9px] font-sans text-gray-500 mt-1">
                  {currentRoom.player2Present ? '🟢 Na tela do sorteio' : '⏳ Ausente / Não logou'}
                </p>
              </div>
            </div>

            {/* Giant Digital Timer */}
            <div className="glass-panel border border-white/10 rounded-2xl py-6 px-6 shadow-inner relative overflow-hidden">
              <div className="absolute inset-0 bg-neon-cyan/5 animate-pulse pointer-events-none" />
              <div className="font-mono text-4xl md:text-5xl font-black tracking-widest text-neon-cyan drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                {formatTime(secondsLeft)}
              </div>
              <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-2">
                O sorteio iniciará automaticamente quando o tempo zerar
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full glass-panel h-2 border border-white/10 rounded-full overflow-hidden">
              <div 
                className="bg-neon-cyan h-full transition-all duration-1000 shadow-[0_0_8px_#00E5FF]"
                style={{ width: `${(secondsLeft / 120) * 100}%` }}
              />
            </div>

            {/* Action buttons or Confirmation Request */}
            <div className="space-y-4 pt-2">
              {isAdmin ? (
                // Admin controls: can spin now or return
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <GamerButton
                    onClick={() => { setPhase('spinning'); sound.playClick(); }}
                    variant="blue"
                    className="w-full sm:w-auto py-3 px-6 text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    <Play className="w-4 h-4" /> 
                    Girar Agora (Admin) ⚡
                  </GamerButton>
                  
                  <GamerButton
                    onClick={onCancel}
                    variant="ghost"
                    className="w-full sm:w-auto py-3 px-6 text-xs text-gray-400 hover:text-gray-200"
                  >
                    Retornar ao Painel
                  </GamerButton>
                </div>
              ) : (
                // Regular player spectator: see status information and return button
                <div className="flex flex-col items-center gap-4">
                  <div className="p-3 glass-panel border border-white/5 rounded-xl text-center w-full max-w-sm">
                    <p className="text-xxs text-gold-cabal font-mono uppercase tracking-widest animate-pulse">
                      Aguardando Sorteio do Administrador ⏳
                    </p>
                    <p className="text-[10px] text-gray-500 font-sans mt-1">
                      O sorteio será iniciado ao vivo pelo organizador. Acompanhe o resultado!
                    </p>
                  </div>
                  
                  <GamerButton
                    onClick={onCancel}
                    variant="ghost"
                    className="py-2 px-6 text-xs text-gray-400 hover:text-gray-200"
                  >
                    Retornar ao Painel
                  </GamerButton>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Duel Stage Container */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-center my-6">
              
              {/* Player 1 Box */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className={`p-1.5 rounded-xl border-2 transition-all duration-300 ${
                  activeHighlight === 'p1' 
                    ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-105' 
                    : 'border-white/10 glass-panel/40 opacity-50 scale-95'
                }`}>
                  <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-neon-cyan/20 to-transparent border border-neon-cyan/50 flex items-center justify-center text-3xl font-display font-bold text-neon-cyan select-none shadow-inner">
                    ⚔️
                  </div>
                </div>
                <h4 className="font-display font-black text-lg text-gray-200 mt-4 tracking-wide uppercase">
                  {room.player1Nick}
                </h4>
                <p className="text-xs text-gray-500 font-mono mt-1">CRIADOR DA SALA</p>
                <GamerBadge variant="blue" className="mt-2">PROB: 50%</GamerBadge>
              </div>

              {/* Center Tension Roller */}
              <div className="md:col-span-2 flex flex-col items-center justify-center py-4">
                {phase === 'spinning' ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-dashed border-neon-cyan/20 animate-spin" />
                      <span className="font-display font-black text-3xl text-neon-cyan text-glow-cyan animate-pulse drop-shadow-[0_0_15px_#00E5FF]">VS</span>
                    </div>
                    <p className="text-xxs font-mono text-neon-cyan tracking-widest uppercase mt-4 animate-bounce">
                      SORTEANDO...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gold-cabal/10 border-2 border-gold-cabal/50 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                      <Trophy className="w-8 h-8 text-gold-cabal animate-bounce" />
                    </div>
                    <p className="text-xxs font-mono text-gold-cabal tracking-widest uppercase mt-4">
                      FIM DE DUELO
                    </p>
                  </div>
                )}
              </div>

              {/* Player 2 Box */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className={`p-1.5 rounded-xl border-2 transition-all duration-300 ${
                  activeHighlight === 'p2' 
                    ? 'border-amber-400 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-105' 
                    : 'border-white/10 glass-panel/40 opacity-50 scale-95'
                }`}>
                  <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-gold-cabal/20 to-transparent border border-gold-cabal/50 flex items-center justify-center text-3xl font-display font-bold text-gold-cabal select-none shadow-inner">
                    ⚡
                  </div>
                </div>
                <h4 className="font-display font-black text-lg text-gray-200 mt-4 tracking-wide uppercase">
                  {room.player2Nick || "Aguardando"}
                </h4>
                <p className="text-xs text-gray-500 font-mono mt-1">DESAFIANTE</p>
                <GamerBadge variant="gold" className="mt-2">PROB: 50%</GamerBadge>
              </div>

            </div>

            {/* Results Area */}
            {phase === 'winner' && (
              <div className="mt-8 pt-8 border-t border-white/10 text-center animate-fade-in relative z-20">
                <div className="max-w-md mx-auto">
                  
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-cabal/10 border border-gold-cabal/30 rounded-full text-gold-cabal text-xxs font-mono uppercase tracking-widest mb-3 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" /> {isReplayMode ? 'REPLAY CONCLUÍDO' : 'DUELO ENCERRADO COM SUCESSO'}
                  </div>

                  <h3 className="font-display font-black text-3xl text-gold-cabal uppercase tracking-wider mb-2">
                    Vencedor: {getWinnerName()}
                  </h3>

                  {/* Financial Box Calculation */}
                  <div className="glass-panel border border-white/10/80 rounded-xl p-5 my-6 text-left space-y-3 font-mono">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">VALOR TOTAL DO POTE (2x):</span>
                      <span className="text-gray-300 font-bold">{formatALZ(room.betAmount * 2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">TAXA ADMINISTRATIVA ({room.houseFeePercent}%):</span>
                      <span className="text-red-400 font-bold">-{formatALZ(calculateHouseFee())}</span>
                    </div>
                    <div className="h-[1px] glass-panel my-1" />
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-gray-300">VALOR LÍQUIDO A RECEBER:</span>
                      <span className="text-gold-cabal text-base">{formatALZ(calculateNetWinner())}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-gray-400 text-xxs text-left flex items-start gap-2 mb-6">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      O valor líquido acima foi contabilizado em sua conta na plataforma. O Administrador do <span className="font-bold text-gray-300">X1 ALZ</span> efetuará o envio de seus ALZ diretamente no jogo Cabal Neo para o seu personagem registrado.
                    </span>
                  </div>

                  <GamerButton
                    onClick={onCancel}
                    variant="gold"
                    className="w-full py-3.5 text-sm"
                  >
                    Retornar ao Painel
                  </GamerButton>

                </div>
              </div>
            )}
          </>
        )}
      </GamerPanel>
    </div>
  );
};
