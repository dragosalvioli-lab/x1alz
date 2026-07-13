/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Coins, 
  Trophy, 
  TrendingUp, 
  Users, 
  FileText, 
  Share2, 
  Play, 
  Sparkles, 
  Clipboard, 
  AlertCircle, 
  Swords, 
  X, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { User, Room, Transaction } from '../types';
import { db, formatALZ, formatBrasiliaDateTime } from '../utils/database';
import { GamerButton, GamerPanel, GamerBadge } from './GamerCard';

interface PlayerDashboardProps {
  user: User;
  onRefreshUser: () => void;
  onLaunchDraw: (room: Room) => void;
}

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ 
  user, 
  onRefreshUser, 
  onLaunchDraw 
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<Room[]>([]);
  const [history, setHistory] = useState<Room[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Create Room State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [betAmountOption, setBetAmountOption] = useState<number>(1000000000); // 1b default
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [invitedNick, setInvitedNick] = useState('');

  // Join Room State
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');

  // Info alerts
  const [alertMsg, setAlertMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchDashboardData = () => {
    const allRooms = db.getRooms();
    
    // Rooms where I am player1 or player2 (excluding finished/cancelled to keep active list clean)
    const myRooms = allRooms.filter(r => (r.player1Id === user.id || r.player2Id === user.id) && r.status !== 'finished' && r.status !== 'cancelled');
    setRooms(myRooms);

    // Available public rooms to join: status is waiting_opponent, NO invited player, and not created by me
    const publicAvailable = allRooms.filter(r => r.status === 'waiting_opponent' && !r.invitedPlayerId && r.player1Id !== user.id);
    setPublicRooms(publicAvailable);

    // Private invites sent directly to me (waiting for an opponent)
    const invites = allRooms.filter(r => r.status === 'waiting_opponent' && r.invitedPlayerId === user.id);
    setReceivedInvites(invites);

    // Historic finished rooms
    const finished = allRooms.filter(r => (r.player1Id === user.id || r.player2Id === user.id) && r.status === 'finished');
    setHistory(finished);

    // Filter transactions
    const myTrans = db.getTransactions().filter(t => t.userId === user.id);
    setTransactions(myTrans);
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 3000); // Poll for real-time updates
    return () => clearInterval(interval);
  }, [user.id]);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMsg('');

    let amount = betAmountOption;
    if (isCustom) {
      const parsed = parseFloat(customAmount);
      if (isNaN(parsed) || parsed <= 0) {
        setAlertMsg('Valor personalizado inválido.');
        return;
      }
      amount = Math.floor(parsed * 1000000); // Custom amount entered in millions (kk)
    }

    if (amount < 100000000) {
      setAlertMsg('O valor mínimo de aposta é de 100kk (100.000.000 ALZ).');
      return;
    }

    try {
      const newRoom = db.createRoom(user.id, amount, invitedNick);
      setShowCreateModal(false);
      setCustomAmount('');
      setIsCustom(false);
      setInvitedNick('');
      fetchDashboardData();
      onRefreshUser();
    } catch (e: any) {
      setAlertMsg(e.message || 'Erro ao criar aposta.');
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    setJoinSuccess('');

    if (!joinCode) {
      setJoinError('Por favor, informe o código da sala.');
      return;
    }

    const res = db.joinRoom(user.id, joinCode);
    if (res.success) {
      setJoinSuccess(`Você entrou na sala ${res.room?.code} com sucesso!`);
      setJoinCode('');
      fetchDashboardData();
      onRefreshUser();
    } else {
      setJoinError(res.error || 'Código inválido.');
    }
  };

  const handleJoinRoomDirect = (code: string) => {
    setJoinError('');
    setJoinSuccess('');
    const res = db.joinRoom(user.id, code);
    if (res.success) {
      setJoinSuccess(`Você entrou na sala ${res.room?.code} com sucesso!`);
      setJoinCode('');
      fetchDashboardData();
      onRefreshUser();
    } else {
      setJoinError(res.error || 'Erro ao entrar na sala.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Simulation controls to make testing amazing
  const triggerSimulationJoin = (roomId: string) => {
    const res = db.simulateOpponentJoin('system_bot', roomId);
    if (res.success) {
      fetchDashboardData();
      onRefreshUser();
    }
  };

  const cancelRoom = (roomId: string) => {
    db.cancelRoom(user.id, roomId);
    fetchDashboardData();
    onRefreshUser();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-left">
      
      {/* Top Banner with Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="glass-panel mmorpg-table border border-white/10 rounded-sm p-5 relative overflow-hidden group hover:border-cyan-500/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <Coins className="w-14 h-14 text-cyan-400" />
          </div>
          <span className="text-xxs font-mono text-gray-500 uppercase tracking-wider block">Total Apostado</span>
          <span className="text-lg font-mono font-bold text-cyan-400 block mt-1.5">{formatALZ(user.totalBet)}</span>
          <span className="text-xxs text-gray-400 block mt-1">Soma de todas as partidas</span>
        </div>

        <div className="glass-panel mmorpg-table border border-white/10 rounded-sm p-5 relative overflow-hidden group hover:border-amber-500/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <Trophy className="w-14 h-14 text-amber-400" />
          </div>
          <span className="text-xxs font-mono text-gray-500 uppercase tracking-wider block">Vitórias</span>
          <span className="text-lg font-mono font-bold text-amber-400 block mt-1.5">{user.wins} rodadas</span>
          <span className="text-xxs text-emerald-400 block mt-1">Taxa de win: {user.wins + user.losses > 0 ? ((user.wins / (user.wins + user.losses)) * 100).toFixed(0) : 0}%</span>
        </div>

        <div className="glass-panel mmorpg-table border border-white/10 rounded-sm p-5 relative overflow-hidden group hover:border-red-500/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <X className="w-14 h-14 text-red-500" />
          </div>
          <span className="text-xxs font-mono text-gray-500 uppercase tracking-wider block">Derrotas</span>
          <span className="text-lg font-mono font-bold text-red-400 block mt-1.5">{user.losses} rodadas</span>
          <span className="text-xxs text-gray-400 block mt-1">Perdas registradas</span>
        </div>

        <div className="glass-panel mmorpg-table border border-white/10 rounded-sm p-5 relative overflow-hidden group hover:border-emerald-500/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <TrendingUp className="w-14 h-14 text-emerald-400" />
          </div>
          <span className="text-xxs font-mono text-gray-500 uppercase tracking-wider block">Lucro Líquido</span>
          <span className={`text-lg font-mono font-bold block mt-1.5 ${user.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {user.profit >= 0 ? '+' : ''}{formatALZ(user.profit)}
          </span>
          <span className="text-xxs text-gray-400 block mt-1">Descontadas as taxas de {db.getSettings().houseFeePercent}%</span>
        </div>

        <div className="glass-panel mmorpg-table border border-white/10 rounded-sm p-5 relative overflow-hidden group hover:border-amber-500/50 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:-translate-y-1">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <Sparkles className="w-14 h-14 text-amber-400" />
          </div>
          <span className="text-xxs font-mono text-gray-500 uppercase tracking-wider block">Sequência Atual</span>
          <span className="text-lg font-mono font-bold text-amber-400 block mt-1.5">⚡ {user.streak} Wins</span>
          <span className="text-xxs text-gray-400 block mt-1">Melhor marca histórica: {user.maxStreak}</span>
        </div>

      </div>

      {/* Main Actions grid: Nova Aposta & Entrar na sala */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Quick Actions & Instructions */}
        <div className="lg:col-span-4 space-y-6">
          
          <GamerPanel variant="blue" title="Painel de Ações">
            <div className="space-y-4">
              <GamerButton
                onClick={() => setShowCreateModal(true)}
                variant="gold"
                className="w-full py-4 text-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_25px_rgba(245,158,11,0.35)]"
              >
                <PlusCircle className="w-5 h-5" /> Criar Nova Sala (Apostar)
              </GamerButton>

              <div className="h-[1px] glass-panel my-4" />

              <form onSubmit={handleJoinRoom} className="space-y-3">
                <label className="block text-xxs font-mono uppercase tracking-widest text-gray-400">
                  Entrar em Sala Existente
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Ex: X1-1250"
                    className="flex-1 glass-panel border border-white/10 rounded-lg py-2.5 px-3 text-xs text-gray-200 placeholder-neutral-600 focus:outline-none focus:border-cyan-500 uppercase font-mono"
                  />
                  <GamerButton type="submit" variant="blue" className="py-2.5 text-xs">
                    Entrar
                  </GamerButton>
                </div>
                {joinError && <p className="text-[10px] text-red-400 font-sans">⚠️ {joinError}</p>}
                {joinSuccess && <p className="text-[10px] text-emerald-400 font-sans">✅ {joinSuccess}</p>}
              </form>
            </div>
          </GamerPanel>

          <GamerPanel variant="dark" title="Como Funciona?" subtitle="Instruções passo a passo">
            <div className="text-xxs text-gray-400 space-y-3 leading-relaxed">
              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded glass-panel text-gray-300 font-mono flex items-center justify-center font-bold shrink-0">1</span>
                <p>
                  <span className="font-bold text-gray-200 uppercase">Crie ou Entre:</span> Defina o valor da aposta (ex: 1b) e crie sua sala ou entre no código enviado por outro oponente.
                </p>
              </div>
              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded glass-panel text-gray-300 font-mono flex items-center justify-center font-bold shrink-0">2</span>
                <p>
                  <span className="font-bold text-gray-200 uppercase">Envie os ALZ:</span> Transfira os ALZ apostados para o personagem oficial <span className="text-amber-400 font-bold">X1Alz</span> dentro do jogo.
                </p>
              </div>
              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded glass-panel text-gray-300 font-mono flex items-center justify-center font-bold shrink-0">3</span>
                <p>
                  <span className="font-bold text-gray-200 uppercase">Confirmação:</span> O administrador confirmará manualmente no painel que recebeu os ALZ. O status muda para <span className="text-emerald-400 font-bold">ATIVO</span>.
                </p>
              </div>
              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded glass-panel text-gray-300 font-mono flex items-center justify-center font-bold shrink-0">4</span>
                <p>
                  <span className="font-bold text-gray-200 uppercase">Sorteio:</span> Uma roleta animada decidirá o vencedor. O prêmio líquido (menos {db.getSettings().houseFeePercent}% de taxa da casa) é depositado na conta da plataforma do vencedor para resgate posterior in-game.
                </p>
              </div>
            </div>
          </GamerPanel>

        </div>

        {/* Right Column: Active betting rooms */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Convites de Duelo Recebidos */}
          {receivedInvites.length > 0 && (
            <GamerPanel variant="gold" title="Convites de Duelo Recebidos" subtitle="Você foi desafiado para um X1! Aceite o duelo abaixo:">
              <div className="space-y-4">
                {receivedInvites.map((room) => (
                  <div
                    key={room.id}
                    className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl hover:border-amber-500/60 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse-subtle"
                  >
                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-sm tracking-wide text-amber-400 font-mono uppercase">
                          SALA {room.code}
                        </span>
                        <span className="text-xs text-gray-500">|</span>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {formatALZ(room.betAmount)}
                        </span>
                      </div>
                      <div className="text-xxs text-gray-400">
                        Desafiante: <strong className="text-gray-200 font-mono">{room.player1Nick}</strong>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <GamerButton
                        onClick={() => handleJoinRoomDirect(room.code)}
                        variant="gold"
                        className="py-2 px-4 text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                      >
                        <Swords className="w-4 h-4" /> Aceitar Duelo
                      </GamerButton>
                    </div>
                  </div>
                ))}
              </div>
            </GamerPanel>
          )}

          {/* Salas Públicas Disponíveis */}
          <GamerPanel variant="blue" title="Salas Públicas Disponíveis" subtitle="Entre em uma sala aberta por outro jogador e inicie o duelo">
            {publicRooms.length === 0 ? (
              <div className="text-center py-6 glass-panel border border-white/10/60 rounded-xl">
                <p className="text-xs text-gray-500 font-sans">Nenhuma sala pública aberta no momento. Crie a sua acima!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {publicRooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-4 glass-panel border border-white/10/80 rounded-xl hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-3 text-left"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-mono text-xs font-bold text-cyan-400">{room.code}</span>
                        <span className="font-mono text-xs font-bold text-amber-400">{formatALZ(room.betAmount)}</span>
                      </div>
                      <p className="text-xxs text-gray-400">
                        Criador: <span className="font-mono text-gray-300">{room.player1Nick}</span>
                      </p>
                    </div>
                    <GamerButton
                      onClick={() => handleJoinRoomDirect(room.code)}
                      variant="blue"
                      className="w-full py-2 text-xxs font-bold"
                    >
                      <Play className="w-3.5 h-3.5" /> Entrar na Sala e Desafiar
                    </GamerButton>
                  </div>
                ))}
              </div>
            )}
          </GamerPanel>

          {/* Minhas Salas de Aposta */}
          <GamerPanel variant="blue" title="Minhas Salas de Aposta" subtitle="Partidas em que você está participando">
            {rooms.length === 0 ? (
              <div className="text-center py-8 glass-panel border border-white/10/60 rounded-xl">
                <p className="text-xs text-gray-500 font-sans">Você não está participando de nenhuma sala de apostas ativa.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rooms.map((room) => {
                  const isPlayer1 = room.player1Id === user.id;
                  const opponentNick = isPlayer1 
                    ? (room.player2Nick || (room.invitedPlayerNick ? `${room.invitedPlayerNick} (Privada)` : 'Aguardando adversário')) 
                    : room.player1Nick;
                  
                  return (
                    <div
                      key={room.id}
                      className="p-4 glass-panel border border-white/10/80 rounded-xl hover:border-neutral-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Left: Code, Bet Amount & Status */}
                      <div className="space-y-2 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-black text-sm tracking-wide text-cyan-400 font-mono uppercase">
                            SALA {room.code}
                          </span>
                          <span className="text-xs text-gray-500">|</span>
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {formatALZ(room.betAmount)}
                          </span>
                        </div>
 
                        <div className="flex flex-wrap items-center gap-2 text-xxs font-sans text-gray-400">
                          <span>Criador: <strong className="text-gray-300 font-mono">{room.player1Nick}</strong></span>
                          <span>vs</span>
                          <span>Oponente: <strong className="text-gray-300 font-mono">{opponentNick}</strong></span>
                        </div>
 
                        <div className="pt-1">
                          {room.status === 'waiting_opponent' && (
                            <GamerBadge variant={room.invitedPlayerNick ? 'gold' : 'neutral'}>
                              {room.invitedPlayerNick ? 'Aguardando Convidado' : 'Aguardando Desafiante'}
                            </GamerBadge>
                          )}
                          {room.status === 'waiting_admin_confirmation' && (
                            <GamerBadge variant="gold" className="animate-pulse">Aguardando Confirmação do Admin</GamerBadge>
                          )}
                          {room.status === 'active' && (
                            <GamerBadge variant="success">Pronto para Sorteio</GamerBadge>
                          )}
                          {room.status === 'spinning' && (
                            <GamerBadge variant="blue" className="animate-pulse">Sorteio Iniciado</GamerBadge>
                          )}
                          {room.status === 'finished' && (
                            <GamerBadge variant="gold">Finalizado (Vencedor: {room.winnerNick})</GamerBadge>
                          )}
                          {room.status === 'cancelled' && (
                            <GamerBadge variant="danger">Cancelado / Estornado</GamerBadge>
                          )}
                        </div>
                      </div>
 
                      {/* Right: Actions, Share links, Dev helpers */}
                      <div className="flex flex-wrap items-center gap-2 md:justify-end shrink-0">
                        
                        {/* Share link & simulation join for waiting_opponent */}
                        {room.status === 'waiting_opponent' && (
                          <>
                            <GamerButton
                              onClick={() => copyToClipboard(room.code)}
                              variant="ghost"
                              className="py-1.5 px-3 text-xxs font-mono"
                            >
                              <Clipboard className="w-3.5 h-3.5 text-gray-400" />
                              {copiedCode === room.code ? 'Copiado!' : 'Copiar Código'}
                            </GamerButton>
                            
                            {isPlayer1 && (
                              <GamerButton
                                onClick={() => cancelRoom(room.id)}
                                variant="ghost"
                                className="py-1.5 px-3 text-xxs text-red-400 hover:text-red-300 hover:bg-red-950/20"
                              >
                                Cancelar
                              </GamerButton>
                            )}
                          </>
                        )}
 
                        {/* Waiting admin message */}
                        {room.status === 'waiting_admin_confirmation' && (
                          <div className="flex flex-col gap-1.5 items-end">
                            <span className="text-[10px] text-amber-500 font-mono">Envie {formatALZ(room.betAmount)} para o char 'X1Alz'</span>
                            <span className="text-[9px] text-gray-500 italic block">O admin precisa validar no painel</span>
                          </div>
                        )}
 
                        {/* Draw spectator entry when ready */}
                        {room.status === 'active' && (
                          <GamerButton
                            onClick={() => onLaunchDraw(room)}
                            variant="blue"
                            className="py-2 px-4 text-xxs shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                          >
                            <Play className="w-3.5 h-3.5" />
                            ACOMPANHAR SORTEIO 🎥
                          </GamerButton>
                        )}
 
                        {room.status === 'spinning' && (
                          <GamerButton
                            onClick={() => onLaunchDraw(room)}
                            variant="blue"
                            className="py-2 px-4 text-xxs"
                          >
                            <Play className="w-3.5 h-3.5 animate-spin" />
                            Acompanhar Sorteio
                          </GamerButton>
                        )}
 
                        {room.status === 'finished' && (
                          <div className="flex flex-col items-end gap-1.5">
                            <div className="text-right">
                              <span className="text-xxs text-gray-500 block">Vencedor levou:</span>
                              <span className="text-xs font-mono font-bold text-emerald-400">{formatALZ(room.netWinnerAmount)}</span>
                            </div>
                            <GamerButton
                              onClick={() => onLaunchDraw({ ...room, isReplay: true })}
                              variant="blue"
                              className="py-1 px-2 text-[10px] uppercase font-bold tracking-wider"
                            >
                              Ver Replay 🎥
                            </GamerButton>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GamerPanel>

          {/* User History List */}
          <GamerPanel variant="dark" title="Meu Histórico de Partidas" subtitle="Lista de combates que foram finalizados">
            {history.length === 0 ? (
              <p className="text-gray-500 text-xs py-4 text-center">Nenhum duelo concluído encontrado no seu histórico.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-500 font-mono">
                      <th className="py-2.5 font-bold">SALA</th>
                      <th className="py-2.5 font-bold">VALOR</th>
                      <th className="py-2.5 font-bold">ADVERSÁRIO</th>
                      <th className="py-2.5 font-bold">VENCEDOR</th>
                      <th className="py-2.5 font-bold">DATA / HORA</th>
                      <th className="py-2.5 font-bold text-right">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900/50">
                    {history.map((h) => {
                      const isPlayer1 = h.player1Id === user.id;
                      const opp = isPlayer1 ? h.player2Nick : h.player1Nick;
                      const won = h.winnerId === user.id;
                      
                      return (
                        <tr key={h.id} className="hover:glass-panel font-sans">
                          <td className="py-3 font-mono font-bold text-gray-300 uppercase">{h.code}</td>
                          <td className="py-3 font-mono font-bold text-amber-400">{formatALZ(h.betAmount)}</td>
                          <td className="py-3 font-mono text-gray-400">{opp || "Não registrado"}</td>
                          <td className="py-3 font-mono">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              won ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {won ? 'VITÓRIA' : 'DERROTA'}
                            </span>
                          </td>
                          <td className="py-3 text-gray-500 font-mono text-[10px]">
                            {h.drawnAt ? formatBrasiliaDateTime(h.drawnAt) : 'Carregando...'}
                          </td>
                          <td className="py-3 text-right">
                            <GamerButton
                              onClick={() => onLaunchDraw({ ...h, isReplay: true })}
                              variant="blue"
                              className="py-1 px-2.5 text-[10px] uppercase font-bold tracking-wider"
                            >
                              Replay 🎥
                            </GamerButton>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </GamerPanel>

        </div>

      </div>

      {/* CREATE ROOM DIALOG MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 glass-panel backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="max-w-md w-full">
            <GamerPanel
              variant="gold"
              title="Criar Sala de Apostas"
              subtitle="Selecione o valor em ALZ que deseja apostar neste duelo"
              className="relative"
            >
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 p-1 rounded hover:glass-panel text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {alertMsg && (
                <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <span>{alertMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateRoom} className="space-y-6">
                
                {/* Options grid */}
                <div className="space-y-2">
                  <label className="block text-xxs font-mono uppercase tracking-wider text-gray-400">
                    Sugestões de Valores
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: '100kk ALZ', val: 100000000 },
                      { label: '500kk ALZ', val: 500000000 },
                      { label: '1b ALZ', val: 1000000000 },
                      { label: '2b ALZ', val: 2000000000 },
                      { label: '5b ALZ', val: 5000000000 },
                      { label: '10b ALZ', val: 10000000000 },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => {
                          setBetAmountOption(opt.val);
                          setIsCustom(false);
                          setAlertMsg('');
                        }}
                        className={`py-3 px-4 border rounded-lg font-mono text-xs font-bold transition-all text-center cursor-pointer ${
                          betAmountOption === opt.val && !isCustom
                            ? 'bg-amber-950/40 border-amber-500 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                            : 'glass-panel border-white/10 text-gray-400 hover:glass-panel hover:text-gray-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom input toggle */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="custom-amount-field" className="text-xxs font-mono uppercase tracking-wider text-gray-400">
                      Ou digite um valor personalizado
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustom(!isCustom)}
                      className="text-xxs text-amber-400 hover:underline cursor-pointer"
                    >
                      {isCustom ? 'Usar Sugestões' : 'Definir Valor Customizado'}
                    </button>
                  </div>

                  {isCustom && (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                          id="custom-amount-field"
                          type="number"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          placeholder="Ex: 250 (para 250kk ALZ)"
                          className="w-full glass-panel border border-white/10 rounded-lg py-2.5 pl-10 pr-12 text-xs text-gray-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xxs font-mono text-gray-500">
                          kk ALZ
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Invited Opponent Nick field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="invited-nick-field" className="text-xxs font-mono uppercase tracking-wider text-gray-400">
                      Convidar Jogador (Opcional)
                    </label>
                    <span className="text-[10px] text-gray-500 font-sans italic">
                      Deixe em branco para sala pública
                    </span>
                  </div>
                  <div className="relative">
                    <Swords className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input
                      id="invited-nick-field"
                      type="text"
                      value={invitedNick}
                      onChange={(e) => setInvitedNick(e.target.value)}
                      placeholder="Nick exato do oponente (ex: CabalMestre)"
                      className="w-full glass-panel border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs text-gray-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                    />
                  </div>
                </div>

                {/* Fee and Payout previews */}
                <div className="glass-panel border border-white/10 rounded-xl p-4 space-y-2 text-xs font-mono text-gray-400">
                  <div className="flex justify-between">
                    <span>Aposta Individual:</span>
                    <span className="text-gray-200">
                      {isCustom ? formatALZ(parseFloat(customAmount || '0') * 1000000) : formatALZ(betAmountOption)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pote Bruto Total:</span>
                    <span className="text-gray-200">
                      {isCustom 
                        ? formatALZ(parseFloat(customAmount || '0') * 1000000 * 2) 
                        : formatALZ(betAmountOption * 2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-red-400">
                    <span>Taxa da Casa ({db.getSettings().houseFeePercent}%):</span>
                    <span>
                      -{isCustom 
                        ? formatALZ(parseFloat(customAmount || '0') * 1000000 * 2 * (db.getSettings().houseFeePercent / 100)) 
                        : formatALZ(betAmountOption * 2 * (db.getSettings().houseFeePercent / 100))}
                    </span>
                  </div>
                  <div className="h-[1px] glass-panel my-1" />
                  <div className="flex justify-between font-bold text-amber-400">
                    <span>Prêmio Líquido do Vencedor:</span>
                    <span>
                      {isCustom 
                        ? formatALZ(parseFloat(customAmount || '0') * 1000000 * 2 * 0.95) 
                        : formatALZ(betAmountOption * 2 * 0.95)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <GamerButton
                    onClick={() => setShowCreateModal(false)}
                    variant="ghost"
                    className="flex-1 py-3"
                  >
                    Voltar
                  </GamerButton>
                  <GamerButton
                    type="submit"
                    variant="gold"
                    className="flex-1 py-3"
                  >
                    Confirmar e Abrir Sala
                  </GamerButton>
                </div>

              </form>
            </GamerPanel>
          </div>
        </div>
      )}

    </div>
  );
};
