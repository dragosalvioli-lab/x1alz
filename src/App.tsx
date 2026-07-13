/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Swords, 
  User as UserIcon, 
  Shield, 
  LogOut, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  BookOpen, 
  Trophy, 
  History, 
  MessageSquare, 
  Sparkles, 
  RefreshCw, 
  Database, 
  Zap,
  Lock,
  ChevronDown,
  ChevronUp, FileText, HeartHandshake
} from 'lucide-react';
import { User, Room } from './types';
import { db, formatALZ } from './utils/database';
import { sound } from './utils/audio';
import { GamerButton, GamerPanel, GamerBadge } from './components/GamerCard';
import { CountdownBanner } from './components/CountdownBanner';
import { AuthScreen } from './components/AuthScreen';
import { PlayerDashboard } from './components/PlayerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LiveDraw } from './components/LiveDraw';
import { InfoSection } from './components/InfoModals';
import { ChatBox } from './components/ChatBox';

export default function App() {
  const [user, setUser] = useState<User | null>(db.getSession());
  const [activeRoomDraw, setActiveRoomDraw] = useState<Room | null>(null);
  
  // Info overlays
  const [infoSection, setInfoSection] = useState<'about' | 'rules' | 'how_to' | 'ranking' | 'history' | 'support' | 'chat' | null>(null);
  
  // Audio state
  const [isMuted, setIsMuted] = useState(sound.getMutedState());
  
  // Time status
  const [systemOpen, setSystemOpen] = useState(db.isSystemOpen().isOpen);
  const [forceAuth, setForceAuth] = useState(false);
  
  // Developer Guidance Panel
  const [showDevPanel, setShowDevPanel] = useState(true);

  // Poll for time restrictions
  
  // Poll for time restrictions and subscribe to DB updates
  
  // Subscribe to DB
  
  const [, setTick] = useState(0);
  useEffect(() => {
    const checkTime = () => setSystemOpen(db.isSystemOpen().isOpen);
    checkTime();
    const interval = setInterval(checkTime, 5000);
    
    const unsubscribe = db.subscribe(() => {
      setTick(t => t + 1); // Force re-render on any DB update
      setSystemOpen(db.isSystemOpen().isOpen);
    });
    
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  // Update user automatically when tick changes (DB update)
  useEffect(() => {
    if (user) {
      const updated = db.getPlayers().find(p => p.id === user.id);
      if (updated) {
        setUser({ ...updated });
      }
    }
  }, [user?.id]); // Only re-run when user.id changes, and wait, we need to re-run when tick changes. Let's just use user?.id and let the render take care of it? No, setUser is only needed if we want user state updated.




  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setForceAuth(false);
    sound.playSuccess();
  };

  const handleLogout = () => {
    db.logout();
    setUser(null);
    setActiveRoomDraw(null);
    sound.playClick();
  };

  const toggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleRefreshUser = () => {
    if (user) {
      const players = db.getPlayers();
      const updated = players.find(p => p.id === user.id) || db.getSession();
      if (updated) {
        setUser({ ...updated });
      }
    }
  };

  // Launch live drawing
  const handleLaunchDraw = (room: Room) => {
    setActiveRoomDraw(room);
    sound.playAlert();
  };

  const handleDrawFinished = (winnerId: string) => {
    // Finalize drawing in the central database
    if (activeRoomDraw) {
      const res = db.finalizeRoomDraw(activeRoomDraw.id, winnerId);
      if (res.success) {
        // Refetch room details
        const refreshedRoom = db.getRooms().find(r => r.id === activeRoomDraw.id);
        if (refreshedRoom) {
          setActiveRoomDraw({ ...refreshedRoom });
        }
        handleRefreshUser();
      }
    }
  };

  // Quick Switch Roles to assist testing
  const quickSwitchRole = async (role: 'player' | 'admin') => {
    sound.playClick();
    if (role === 'admin') {
      const admin = db.getPlayers().find(p => p.email === 'admin@x1alz.com') || db.getPlayers()[0];
      // Switch user
      const res = await db.login('admin@x1alz.com', 'admin123');
      if (res.success && res.user) {
        setUser(res.user);
      }
    } else {
      const res = await db.login('lucas@gmail.com', '123456');
      if (res.success && res.user) {
        setUser(res.user);
      }
    }
  };

  const handleResetApp = () => {
    if (confirm('Deseja limpar todos os dados do banco local e reiniciar para o estado padrão de fábrica?')) {
      db.resetAllData();
      setUser(null);
      setActiveRoomDraw(null);
      setSystemOpen(db.isSystemOpen().isOpen);
      sound.playError();
    }
  };

  return (
    <div id="app-root" className="min-h-screen bg-transparent text-gray-100 flex font-sans selection:bg-neon-cyan selection:text-neutral-900 relative pb-16">
      
      {/* LEFT SIDEBAR NAVIGATION - DESKTOP FIRST */}
      <aside className="hidden md:flex w-72 shrink-0 flex-col border-r border-white/5 glass-panel z-10 shadow-[5px_0_30px_rgba(0,0,0,0.5)]">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-neon-cyan to-gold-cabal p-[1px]">
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-[#050505]">
                <span className="text-xl font-black italic tracking-tighter text-neon-cyan">X1</span>
                

    </div>
              

    </div>
            <h1 className="text-xl font-bold tracking-widest text-white">ALZ</h1>
            

    </div>
          

    </div>
        
        <nav className="flex-1 space-y-1 px-4 mt-4">
          <button 
            onClick={() => { setInfoSection(null); sound.playClick(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 font-bold tracking-widest uppercase text-xs border border-transparent cursor-pointer ${
              !infoSection 
                ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent text-white border-l-neon-cyan shadow-[inset_2px_0_0_#00E5FF,0_0_15px_rgba(0,229,255,0.1)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-l-white/30'
            }`}
          >
            <Swords className={`w-5 h-5 ${!infoSection ? 'text-neon-cyan' : 'text-gray-500'}`} />
            <span>Salas de Duelo</span>
          </button>

          <button 
            onClick={() => { setInfoSection('chat'); sound.playClick(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 font-bold tracking-widest uppercase text-xs border border-transparent cursor-pointer ${
              infoSection === 'chat' 
                ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent text-white border-l-neon-cyan shadow-[inset_2px_0_0_#00E5FF,0_0_15px_rgba(0,229,255,0.1)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-l-white/30'
            }`}
          >
            <MessageSquare className={`w-5 h-5 ${infoSection === 'chat' ? 'text-neon-cyan' : 'text-gray-500'}`} />
            <span>Taverna (Chat)</span>
          </button>
          
          <button 
            onClick={() => { setInfoSection('history'); sound.playClick(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 font-bold tracking-widest uppercase text-xs border border-transparent cursor-pointer ${
              infoSection === 'history' 
                ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent text-white border-l-neon-cyan shadow-[inset_2px_0_0_#00E5FF,0_0_15px_rgba(0,229,255,0.1)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-l-white/30'
            }`}
          >
            <History className={`w-5 h-5 ${infoSection === 'history' ? 'text-neon-cyan' : 'text-gray-500'}`} />
            <span>Histórico</span>
          </button>

          <button 
            onClick={() => { setInfoSection('ranking'); sound.playClick(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 font-bold tracking-widest uppercase text-xs border border-transparent cursor-pointer ${
              infoSection === 'ranking' 
                ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent text-white border-l-neon-cyan shadow-[inset_2px_0_0_#00E5FF,0_0_15px_rgba(0,229,255,0.1)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-l-white/30'
            }`}
          >
            <Trophy className={`w-5 h-5 ${infoSection === 'ranking' ? 'text-neon-cyan' : 'text-gray-500'}`} />
            <span>Ranking</span>
          </button>

          <button 
            onClick={() => { setInfoSection('rules'); sound.playClick(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 font-bold tracking-widest uppercase text-xs border border-transparent cursor-pointer ${
              infoSection === 'rules' 
                ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent text-white border-l-neon-cyan shadow-[inset_2px_0_0_#00E5FF,0_0_15px_rgba(0,229,255,0.1)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-l-white/30'
            }`}
          >
            <FileText className={`w-5 h-5 ${infoSection === 'rules' ? 'text-neon-cyan' : 'text-gray-500'}`} />
            <span>Regras</span>
          </button>

          <button 
            onClick={() => { setInfoSection('how_to'); sound.playClick(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 font-bold tracking-widest uppercase text-xs border border-transparent cursor-pointer ${
              infoSection === 'how_to' 
                ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent text-white border-l-neon-cyan shadow-[inset_2px_0_0_#00E5FF,0_0_15px_rgba(0,229,255,0.1)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-l-white/30'
            }`}
          >
            <HelpCircle className={`w-5 h-5 ${infoSection === 'how_to' ? 'text-neon-cyan' : 'text-gray-500'}`} />
            <span>Como Funciona</span>
          </button>

          <button 
            onClick={() => { setInfoSection('support'); sound.playClick(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 font-bold tracking-widest uppercase text-xs border border-transparent cursor-pointer ${
              infoSection === 'support' 
                ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent text-white border-l-neon-cyan shadow-[inset_2px_0_0_#00E5FF,0_0_15px_rgba(0,229,255,0.1)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-l-white/30'
            }`}
          >
            <HeartHandshake className={`w-5 h-5 ${infoSection === 'support' ? 'text-neon-cyan' : 'text-gray-500'}`} />
            <span>Suporte</span>
          </button>
        </nav>

        <div className="mt-auto border-t border-white/5 p-6 bg-transparent">
          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-500">
            <span>System Status</span>
            <span className="flex items-center gap-1 text-neon-cyan">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-cyan"></span> {systemOpen ? 'Online' : 'Fechado'}
            </span>
            

    </div>
          <div className="text-[11px] font-semibold text-gray-400 italic">"Sorte favorece os audazes"</div>
          

    </div>
      </aside>

      {/* MAIN LAYOUT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP HEADER */}
        <header className="flex items-center justify-between border-b border-white/5 glass-panel px-4 md:px-8 py-4 sticky top-0 z-40 shadow-[0_5px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-6">
            
            {/* Mobile Branding Link */}
            <div 
              onClick={() => { setInfoSection(null); sound.playClick(); }}
              className="flex md:hidden items-center gap-2 cursor-pointer active:scale-95 transition-transform"
            >
              <div className="p-2 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg">
                <Swords className="w-4 h-4 text-neon-cyan" />
                

    </div>
              <span className="font-display font-black text-sm tracking-wider text-white">X1 ALZ</span>
              

    </div>

            {user ? (
              <div className="hidden sm:flex items-center gap-6">
                <div className="space-y-0.5">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-mono">Jogador Logado</p>
                  <p className="font-bold text-white uppercase text-xs tracking-wider flex items-center gap-2">
                    {user.gameNick}
                    <span className="text-[9px] font-normal text-gold-cabal border border-gold-cabal/30 px-1.5 py-0.2 rounded uppercase font-sans">
                      {user.role === 'admin' ? 'ADMIN' : 'LVL 190'}
                    </span>
                  </p>
                  

    </div>
                <div className="h-8 w-px bg-white/10"></div>
                <div className="space-y-0.5">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-mono">
                    {user.role === 'admin' ? 'Perfil do Sistema' : 'Lucro Líquido'}
                  </p>
                  <p className={`font-black text-xs md:text-sm tracking-wide ${
                    user.role === 'admin' 
                      ? 'text-neon-cyan' 
                      : (db.getPlayers().find(p => p.id === user.id)?.profit ?? user.profit) >= 0 
                        ? 'text-emerald-400' 
                        : 'text-red-400'
                  }`}>
                    {user.role === 'admin' 
                      ? 'ADMINISTRATIVO' 
                      : `${(db.getPlayers().find(p => p.id === user.id)?.profit ?? user.profit) >= 0 ? '+' : ''}${formatALZ(db.getPlayers().find(p => p.id === user.id)?.profit ?? user.profit)}`
                    }
                  </p>
                  

    </div>
                

    </div>
            ) : (
              <div className="hidden sm:block space-y-0.5">
                <p className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-mono">Plataforma Arena</p>
                <p className="font-bold text-white uppercase text-xs tracking-wider">Cabal Neo PvP</p>
                

    </div>
            )}
            

    </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end text-right">
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 font-mono">Operação</span>
              <span className="text-[11px] font-bold text-neon-cyan font-mono">12:00 - 18:00</span>
              

    </div>

            <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

            <button
              onClick={toggleMute}
              title={isMuted ? 'Ativar Sons' : 'Mudar para Silencioso'}
              className="p-2 border border-white/10 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-neon-cyan" />}
            </button>

            {user && (
              <>
                <div className="h-8 w-px bg-white/10"></div>
                <button
                  onClick={handleLogout}
                  title="Sair da Conta"
                  className="p-2 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 rounded-full text-gray-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
            

    </div>
        </header>

        {/* MAIN BODY SCROLL AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {user && (
            <div className="mb-6 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-gold-cabal/10 to-transparent border border-gold-cabal/20 rounded-sm text-[10px] font-mono text-gold-cabal/80 uppercase tracking-widest shadow-[0_0_15px_rgba(212,175,55,0.05)]">
              <Sparkles className="w-4 h-4 text-gold-cabal shrink-0 animate-pulse" />
              <span className="truncate">{db.getSettings().welcomeMessage}</span>
              

    </div>
          )}

          {/* Mobile Navigation Quick Links */}
          {user && !activeRoomDraw && systemOpen && (
            <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none scroll-smooth">
              <button
                onClick={() => { setInfoSection(null); sound.playClick(); }}
                className={`px-3 py-1.5 rounded-lg border text-xxs font-mono font-bold uppercase shrink-0 transition-all cursor-pointer ${
                  !infoSection
                    ? 'bg-neon-cyan/15 border-neon-cyan/40 text-neon-cyan shadow-[0_0_8px_rgba(0,229,255,0.1)]'
                    : 'glass-panel border-white/10 text-gray-400'
                }`}
              >
                ⚔️ Arena
              </button>
              <button
                onClick={() => { setInfoSection('chat'); sound.playClick(); }}
                className={`px-3 py-1.5 rounded-lg border text-xxs font-mono font-bold uppercase shrink-0 transition-all cursor-pointer ${
                  infoSection === 'chat'
                    ? 'bg-neon-cyan/15 border-neon-cyan/40 text-neon-cyan shadow-[0_0_8px_rgba(0,229,255,0.1)]'
                    : 'glass-panel border-white/10 text-gray-400'
                }`}
              >
                💬 Chat
              </button>
              
              <button
                onClick={() => { setInfoSection('history'); sound.playClick(); }}
                className={`px-3 py-1.5 rounded-lg border text-xxs font-mono font-bold uppercase shrink-0 transition-all cursor-pointer ${
                  infoSection === 'history'
                    ? 'bg-neon-cyan/15 border-neon-cyan/40 text-neon-cyan shadow-[0_0_8px_rgba(0,229,255,0.1)]'
                    : 'glass-panel border-white/10 text-gray-400'
                }`}
              >
                📜 Histórico
              </button>
              <button
                onClick={() => { setInfoSection('ranking'); sound.playClick(); }}
                className={`px-3 py-1.5 rounded-lg border text-xxs font-mono font-bold uppercase shrink-0 transition-all cursor-pointer ${
                  infoSection === 'ranking'
                    ? 'bg-neon-cyan/15 border-neon-cyan/40 text-neon-cyan shadow-[0_0_8px_rgba(0,229,255,0.1)]'
                    : 'glass-panel border-white/10 text-gray-400'
                }`}
              >
                🏆 Ranking
              </button>
              <button
                onClick={() => { setInfoSection('rules'); sound.playClick(); }}
                className={`px-3 py-1.5 rounded-lg border text-xxs font-mono font-bold uppercase shrink-0 transition-all cursor-pointer ${
                  infoSection === 'rules'
                    ? 'bg-neon-cyan/15 border-neon-cyan/40 text-neon-cyan shadow-[0_0_8px_rgba(0,229,255,0.1)]'
                    : 'glass-panel border-white/10 text-gray-400'
                }`}
              >
                📖 Regras
              </button>
              <button
                onClick={() => { setInfoSection('how_to'); sound.playClick(); }}
                className={`px-3 py-1.5 rounded-lg border text-xxs font-mono font-bold uppercase shrink-0 transition-all cursor-pointer ${
                  infoSection === 'how_to'
                    ? 'bg-neon-cyan/15 border-neon-cyan/40 text-neon-cyan shadow-[0_0_8px_rgba(0,229,255,0.1)]'
                    : 'glass-panel border-white/10 text-gray-400'
                }`}
              >
                💡 Como Funciona
              </button>
              <button
                onClick={() => { setInfoSection('support'); sound.playClick(); }}
                className={`px-3 py-1.5 rounded-lg border text-xxs font-mono font-bold uppercase shrink-0 transition-all cursor-pointer ${
                  infoSection === 'support'
                    ? 'bg-neon-cyan/15 border-neon-cyan/40 text-neon-cyan shadow-[0_0_8px_rgba(0,229,255,0.1)]'
                    : 'glass-panel border-white/10 text-gray-400'
                }`}
              >
                💬 Suporte
              </button>
              

    </div>
          )}

          {/* Draw modal overlay gets priority */}
          {infoSection === 'chat' ? (
            <div className="h-[calc(100vh-200px)] w-full">
              <ChatBox currentUser={user} inline />
            </div>
          ) : activeRoomDraw ? (
            <LiveDraw
              room={activeRoomDraw}
              currentUser={user}
              onFinished={(winnerId) => handleDrawFinished(winnerId)}
              onCancel={() => { setActiveRoomDraw(null); sound.playClick(); }}
            />
          ) : (
            <>
              {/* If time restricted is CLOSED, render lock countdown screen */}
              {((!systemOpen && !forceAuth && !user) || (!systemOpen && user && user.role !== 'admin')) ? (
                <CountdownBanner 
                  onStatusChange={() => setSystemOpen(db.isSystemOpen().isOpen)} 
                  onAdminLoginRequest={() => {
                    if (user && user.role !== 'admin') {
                      handleLogout();
                    }
                    setForceAuth(true);
                  }}
                />
              ) : (
                /* Route: Auth screen vs Player Dashboard vs Admin Dashboard */
                <>
                  {!user ? (
                    <AuthScreen 
                      onSuccess={handleAuthSuccess}
                      onShowSection={(sec) => setInfoSection(sec)}
                      adminOnly={!systemOpen && forceAuth}
                    />
                  ) : user.role === 'admin' ? (
                    <AdminDashboard
                      adminUser={user}
                      onRefreshStats={handleRefreshUser}
                      onLaunchDraw={handleLaunchDraw}
                    />
                  ) : (
                    <PlayerDashboard
                      user={user}
                      onRefreshUser={handleRefreshUser}
                      onLaunchDraw={handleLaunchDraw}
                    />
                  )}
                </>
              )}
            </>
          )}

        </main>
        

    </div>

      {/* FLOATING OVERLAY DIALOGS */}
      {infoSection && infoSection !== 'chat' && (
        <InfoSection
          section={infoSection as any}
          onClose={() => { setInfoSection(null); sound.playClick(); }}
          currentUser={user}
        />
      )}
      
    </div>
  );
}
