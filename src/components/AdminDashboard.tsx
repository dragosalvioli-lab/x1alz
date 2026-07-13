/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Coins, 
  Trophy, 
  Users, 
  Settings as SettingsIcon, 
  TrendingUp, 
  FileText, 
  Clipboard, 
  CheckCircle, 
  X, 
  Trash2, 
  Download, 
  Sliders, 
  Clock, 
  AlertCircle,
  HelpCircle,
  Play,
  HeartHandshake,
  MessageSquare
} from 'lucide-react';
import { Room, Payment, AppSettings, AdminLog, Transaction, Ticket } from '../types';
import { db, formatALZ, formatBrasiliaDateTime, formatBrasiliaTimeOnly } from '../utils/database';
import { GamerButton, GamerPanel, GamerBadge } from './GamerCard';

interface AdminDashboardProps {
  adminUser: any;
  onRefreshStats: () => void;
  onLaunchDraw: (room: Room) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  adminUser, 
  onRefreshStats, 
  onLaunchDraw 
}) => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'payments' | 'tickets' | 'reports' | 'settings'>('rooms');
  
  // Dynamic metrics
  const [metrics, setMetrics] = useState(db.getFinancialSummary());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  
  // Room filters
  const [roomFilterCode, setRoomFilterCode] = useState('');
  const [roomFilterStatus, setRoomFilterStatus] = useState<string>('all');

  // Configuration edit form
  const [settings, setSettings] = useState<AppSettings>(db.getSettings());
  const [settingsSuccess, setSettingsSuccess] = useState('');

  const loadAdminData = () => {
    setMetrics(db.getFinancialSummary());
    setRooms(db.getRooms());
    setPayments(db.getPayments());
    setLogs(db.getLogs());
    setTickets(db.getTickets());
  };

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filter rooms
  const filteredRooms = rooms.filter(r => {
    const codeMatch = r.code.toLowerCase().includes(roomFilterCode.toLowerCase());
    const statusMatch = roomFilterStatus === 'all' || r.status === roomFilterStatus;
    return codeMatch && statusMatch;
  });

  // Admin Actions
  const handleConfirmReceipt = (roomId: string) => {
    const res = db.confirmAlzReceipt(adminUser.id, roomId);
    if (res.success) {
      loadAdminData();
      onRefreshStats();
    }
  };

  const handleCancelRoom = (roomId: string) => {
    const res = db.cancelRoom(adminUser.id, roomId);
    if (res.success) {
      loadAdminData();
      onRefreshStats();
    }
  };

  const handleAdminStartSpinning = (roomId: string) => {
    const success = db.startSpinning(roomId);
    if (success) {
      loadAdminData();
      onRefreshStats();
      const updatedRoom = db.getRooms().find(r => r.id === roomId);
      if (updatedRoom) {
        onLaunchDraw(updatedRoom);
      }
    }
  };

  const handleMarkPaid = (paymentId: string) => {
    const res = db.markAsPaid(adminUser.id, paymentId);
    if (res.success) {
      loadAdminData();
      onRefreshStats();
    }
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess('');

    db.updateSettings(adminUser.id, {
      openingHour: settings.openingHour,
      closingHour: settings.closingHour,
      houseFeePercent: Number(settings.houseFeePercent),
      adminCharName: settings.adminCharName,
      welcomeMessage: settings.welcomeMessage,
      isBypassActive: settings.isBypassActive
    });

    setSettingsSuccess('Configurações atualizadas com sucesso no banco de dados!');
    loadAdminData();
    onRefreshStats();
    setTimeout(() => setSettingsSuccess(''), 4000);
  };

  // CSV Exporter for Financial reports
  const exportToCSV = () => {
    const headers = ['ID da Sala', 'Código', 'Data Finalizada', 'Criador', 'Oponente', 'Aposta Individual', 'Pote Bruto', 'Lucro Administrador (Taxa)', 'Vencedor', 'Líquido Pago', 'Status'];
    
    const rows = rooms
      .filter(r => r.status === 'finished')
      .map(r => [
        r.id,
        r.code,
        r.drawnAt ? new Date(r.drawnAt).toLocaleString() : '',
        r.player1Nick,
        r.player2Nick || '',
        r.betAmount.toString(),
        r.grossTotal.toString(),
        r.houseFeeAmount.toString(),
        r.winnerNick || '',
        r.netWinnerAmount.toString(),
        r.status
      ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_financeiro_x1alz_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-left">
      
      {/* Header with Title and Tab indicators */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GamerBadge variant="gold">Acesso Administrador</GamerBadge>
            <span className="text-xs text-neutral-500 font-mono">ID: {adminUser.gameNick}</span>
          </div>
          <h1 className="font-display font-black text-3xl uppercase tracking-wider text-neutral-100 mt-1">
            Painel Administrativo
          </h1>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'rooms', label: 'Gerenciar Salas', icon: Sliders },
            { id: 'payments', label: 'Pagamentos Fila', icon: CheckCircle },
            { id: 'reports', label: 'Relatórios Financeiros', icon: FileText },
            { id: 'settings', label: 'Configurações', icon: SettingsIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSettingsSuccess('');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Cards for financial metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Coins className="w-14 h-14 text-amber-400" />
          </div>
          <span className="text-xxs font-mono text-neutral-500 uppercase tracking-wider block">Acumulado Recebido</span>
          <span className="text-xl font-mono font-bold text-neutral-200 block mt-1">{formatALZ(metrics.totalReceived)}</span>
          <span className="text-xxs text-amber-400 block mt-1">Hoje: {formatALZ(metrics.receivedToday)}</span>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <CheckCircle className="w-14 h-14 text-emerald-400" />
          </div>
          <span className="text-xxs font-mono text-neutral-500 uppercase tracking-wider block">Total Pago aos Vencedores</span>
          <span className="text-xl font-mono font-bold text-emerald-400 block mt-1">{formatALZ(metrics.totalPaid)}</span>
          <span className="text-xxs text-neutral-400 block mt-1">Quitados in-game</span>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <TrendingUp className="w-14 h-14 text-amber-400" />
          </div>
          <span className="text-xxs font-mono text-neutral-500 uppercase tracking-wider block">Lucro Casa (Taxa {db.getSettings().houseFeePercent}%)</span>
          <span className="text-xl font-mono font-bold text-amber-400 block mt-1">{formatALZ(metrics.totalProfit)}</span>
          <span className="text-xxs text-neutral-400 block mt-1">Hoje: <strong className="text-amber-400 font-mono">{formatALZ(metrics.profitToday)}</strong></span>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-xl relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Users className="w-14 h-14 text-cyan-400" />
          </div>
          <span className="text-xxs font-mono text-neutral-500 uppercase tracking-wider block">Jogadores Online</span>
          <span className="text-xl font-mono font-bold text-cyan-400 block mt-1">{metrics.onlinePlayers} ativos</span>
          <span className="text-xxs text-neutral-400 block mt-1">Salas abertas: {metrics.activeRooms}</span>
        </div>

      </div>

      {/* Main Content Area based on Tab */}
      <div className="space-y-6">

        {/* GERENCIAR SALAS TAB */}
        {activeTab === 'rooms' && (
          <GamerPanel variant="gold" title="Lista Geral de Salas de Aposta" subtitle="Confirme recebimentos, cancele duelos ou force sorteios para teste">
            
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-neutral-950 p-4 border border-neutral-800 rounded-xl">
              <div className="flex-1">
                <label className="block text-xxs font-mono text-neutral-500 uppercase mb-1">Buscar por Código</label>
                <input
                  type="text"
                  value={roomFilterCode}
                  onChange={(e) => setRoomFilterCode(e.target.value)}
                  placeholder="Ex: X1-1250"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2 px-3 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-amber-500 uppercase font-mono"
                />
              </div>

              <div className="w-full sm:w-64">
                <label className="block text-xxs font-mono text-neutral-500 uppercase mb-1">Filtrar por Status</label>
                <select
                  value={roomFilterStatus}
                  onChange={(e) => setRoomFilterStatus(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2 px-3 text-xs text-neutral-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="all">Todas as Salas</option>
                  <option value="waiting_opponent">Aguardando Desafiante</option>
                  <option value="waiting_admin_confirmation">Aguardando Confirmação</option>
                  <option value="active">Pronto / Ativo</option>
                  <option value="spinning">Sorteando</option>
                  <option value="finished">Finalizados</option>
                  <option value="cancelled">Cancelados</option>
                </select>
              </div>
            </div>

            {filteredRooms.length === 0 ? (
              <p className="text-neutral-500 text-xs py-8 text-center font-sans">Nenhuma sala encontrada correspondente aos filtros ativos.</p>
            ) : (
              <div className="space-y-3.5">
                {filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-4 bg-neutral-950 border border-neutral-800/80 rounded-xl hover:border-neutral-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Info details */}
                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-amber-400 uppercase">
                          SALA {room.code}
                        </span>
                        <span className="text-xs text-neutral-500">|</span>
                        <span className="text-xs font-mono font-bold text-neutral-200">
                          Aposta: {formatALZ(room.betAmount)} (Pote: {formatALZ(room.betAmount * 2)})
                        </span>
                      </div>
                      
                      <div className="text-xxs text-neutral-400 font-sans space-y-0.5">
                        <p>Jogador 1: <strong className="text-neutral-200 font-mono">{room.player1Nick}</strong> ({room.player1Name})</p>
                        <p>Jogador 2: <strong className="text-neutral-200 font-mono">{room.player2Nick || 'Aguardando...'}</strong> {room.player2Name ? `(${room.player2Name})` : ''}</p>
                        <p className="text-[10px] text-neutral-500">Criada em: {new Date(room.createdAt).toLocaleString()}</p>
                      </div>

                      <div className="pt-1.5">
                        {room.status === 'waiting_opponent' && (
                          <GamerBadge variant="neutral">Aguardando Desafiante</GamerBadge>
                        )}
                        {room.status === 'waiting_admin_confirmation' && (
                          <GamerBadge variant="gold" className="animate-pulse">⚠️ ALZ Pendente de Validação</GamerBadge>
                        )}
                        {room.status === 'active' && (
                          <GamerBadge variant="success">ALZ Confirmados - Pronto</GamerBadge>
                        )}
                        {room.status === 'spinning' && (
                          <GamerBadge variant="blue" className="animate-pulse">Sorteando Vencedor</GamerBadge>
                        )}
                        {room.status === 'finished' && (
                          <GamerBadge variant="gold">Concluído (Vencedor: {room.winnerNick})</GamerBadge>
                        )}
                        {room.status === 'cancelled' && (
                          <GamerBadge variant="danger">Cancelado (ALZ Estornado)</GamerBadge>
                        )}
                      </div>
                    </div>

                    {/* Right: Administrative actions */}
                    <div className="flex flex-wrap gap-2 justify-start md:justify-end items-center shrink-0">
                      
                      {room.status === 'waiting_admin_confirmation' && (
                        <>
                          <GamerButton
                            onClick={() => handleConfirmReceipt(room.id)}
                            variant="gold"
                            className="py-1.5 px-3 text-xxs"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                            Confirmar Recebimento de ALZ
                          </GamerButton>

                          <GamerButton
                            onClick={() => handleCancelRoom(room.id)}
                            variant="danger"
                            className="py-1.5 px-3 text-xxs"
                          >
                            <X className="w-3.5 h-3.5" />
                            Recusar / Cancelar
                          </GamerButton>
                        </>
                      )}

                      {(room.status === 'waiting_opponent' || room.status === 'active') && (
                        <GamerButton
                          onClick={() => handleCancelRoom(room.id)}
                          variant="ghost"
                          className="py-1.5 px-3 text-xxs text-red-400 hover:text-red-300 hover:bg-red-950/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Cancelar Sala
                        </GamerButton>
                      )}

                      {room.status === 'active' && (
                        <GamerButton
                          onClick={() => handleAdminStartSpinning(room.id)}
                          variant="blue"
                          className="py-1.5 px-3.5 text-xxs shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Sorteio Manual (Girar)
                        </GamerButton>
                      )}

                      {room.status === 'spinning' && (
                        <GamerButton
                          onClick={() => onLaunchDraw(room)}
                          variant="blue"
                          className="py-1.5 px-3.5 text-xxs animate-pulse"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Ver Sorteio (Ao Vivo)
                        </GamerButton>
                      )}

                      {room.status === 'finished' && (
                        <div className="text-right text-xs font-mono">
                          <p className="text-neutral-500">Taxa da Casa: <strong className="text-amber-400 font-bold">+{formatALZ(room.houseFeeAmount)}</strong></p>
                          <p className="text-neutral-400">Pago ao Vencedor: {formatALZ(room.netWinnerAmount)}</p>
                        </div>
                      )}

                      {room.status === 'cancelled' && (
                        <span className="text-xxs text-neutral-500 font-mono italic">Reembolsado aos jogadores</span>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            )}

          </GamerPanel>
        )}

        {/* PAYMENTS LIST TAB */}
        {activeTab === 'payments' && (
          <GamerPanel variant="gold" title="Fila de Pagamentos In-Game" subtitle="Transfira os ALZ para o vencedor no jogo e depois marque como pago aqui para auditoria">
            
            <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-400 flex items-start gap-2.5 mb-6">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold text-neutral-200">Guia de Pagamentos:</span> Como a plataforma não integra diretamente com a API fechada do jogo, você deve abrir seu cliente do Cabal Neo, buscar o vencedor listado abaixo e efetuar o envio do <span className="font-bold text-amber-400">Valor Líquido</span> por correio ou trade seguro. Após fazer isso, clique em <span className="text-emerald-400 font-bold">Marcar como Pago</span> para conciliação financeira do seu balanço.
              </div>
            </div>

            {payments.length === 0 ? (
              <p className="text-neutral-500 text-xs py-8 text-center font-sans">Nenhum pagamento pendente ou histórico registrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-500 font-mono">
                      <th className="py-3 font-bold">VENCEDOR (NICK)</th>
                      <th className="py-3 font-bold">APOSTA INDIV.</th>
                      <th className="py-3 font-bold">POTE BRUTO</th>
                      <th className="py-3 font-bold">TAXA RETIDA</th>
                      <th className="py-3 font-bold text-amber-400">VALOR LÍQUIDO A PAGAR</th>
                      <th className="py-3 font-bold">STATUS</th>
                      <th className="py-3 font-bold text-right">AÇÕES ADM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900/50">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-900/30">
                        <td className="py-3.5">
                          <div className="font-mono font-bold text-neutral-300 uppercase">{p.winnerNick}</div>
                          <div className="text-[10px] text-neutral-500">Real: {p.winnerName}</div>
                        </td>
                        <td className="py-3.5 font-mono text-neutral-400">{formatALZ(p.betAmount)}</td>
                        <td className="py-3.5 font-mono text-neutral-400">{formatALZ(p.grossTotal)}</td>
                        <td className="py-3.5 font-mono text-red-400">-{formatALZ(p.feeDeducted)}</td>
                        <td className="py-3.5 font-mono font-black text-amber-400 text-sm">{formatALZ(p.netPayable)}</td>
                        <td className="py-3.5 font-mono">
                          {p.status === 'pending' ? (
                            <span className="px-2 py-0.5 rounded text-[9px] bg-red-500/10 border border-red-500/20 text-red-400 font-bold animate-pulse">PENDENTE</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">PAGO IN-GAME</span>
                          )}
                        </td>
                        <td className="py-3.5 text-right shrink-0">
                          {p.status === 'pending' ? (
                            <GamerButton
                              onClick={() => handleMarkPaid(p.id)}
                              variant="gold"
                              className="py-1 px-2 text-[10px] inline-flex"
                            >
                              Marcar como Pago
                            </GamerButton>
                          ) : (
                            <span className="text-xxs text-neutral-500 font-mono italic">
                              Pago em: {p.paidAt ? formatBrasiliaDateTime(p.paidAt) : ''}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </GamerPanel>
        )}

        {/* REPORTS & CSV EXPORT TAB */}
        {/* TAB: TICKETS */}
        {activeTab === 'tickets' && (
          <GamerPanel title="Gerenciamento de Suporte" icon={<HeartHandshake className="w-5 h-5" />} neonColor="amber">
            <div className="flex gap-4 h-[500px]">
              {/* Ticket List */}
              <div className="w-1/3 flex flex-col border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">
                <div className="p-3 bg-neutral-900 border-b border-neutral-800">
                  <h4 className="text-xs font-bold font-display text-neutral-300 uppercase">Tickets Abertos ({tickets.filter(t => t.status === 'open').length})</h4>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-neutral-800">
                  {tickets.map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setSelectedTicketId(t.id); setTicketReplyText(''); }}
                      className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer ${selectedTicketId === t.id ? 'bg-amber-950/40 border-amber-500/50' : 'bg-[#0A0A0A] border-neutral-800 hover:border-neutral-600'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-neutral-200">{t.userNick}</span>
                        <span className={`text-[9px] font-mono font-bold uppercase px-1.5 rounded ${
                          t.status === 'open' ? 'bg-green-500/20 text-green-400' :
                          t.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-neutral-800 text-neutral-500'
                        }`}>{t.status === 'open' ? 'Aberto' : t.status === 'in_progress' ? 'Em progresso' : 'Fechado'}</span>
                      </div>
                      <div className="text-[10px] text-amber-400 font-mono truncate">{t.category}</div>
                      <div className="text-xxs text-neutral-500 mt-1">{new Date(t.updatedAt).toLocaleString()}</div>
                    </button>
                  ))}
                  {tickets.length === 0 && <div className="text-center p-4 text-xs text-neutral-500 font-mono">Nenhum ticket encontrado.</div>}
                </div>
              </div>
              
              {/* Ticket Details */}
              <div className="w-2/3 flex flex-col border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">
                {selectedTicketId ? (
                  (() => {
                    const ticket = tickets.find(t => t.id === selectedTicketId);
                    if (!ticket) return null;
                    return (
                      <>
                        <div className="p-3 bg-neutral-900 border-b border-neutral-800 flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-bold font-display text-neutral-200">{ticket.userNick} - <span className="text-amber-400">{ticket.category}</span></h4>
                            <p className="text-xs text-neutral-500 font-mono">{ticket.id}</p>
                          </div>
                          <div className="flex gap-2">
                            {ticket.status !== 'closed' && (
                              <button 
                                onClick={() => db.updateTicketStatus(ticket.id, 'closed')}
                                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded cursor-pointer"
                              >
                                Fechar Ticket
                              </button>
                            )}
                            {ticket.status === 'closed' && (
                              <button 
                                onClick={() => db.updateTicketStatus(ticket.id, 'open')}
                                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded cursor-pointer"
                              >
                                Reabrir
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-neutral-800">
                          {ticket.messages.map(m => (
                            <div key={m.id} className={`flex flex-col ${m.senderRole === 'admin' ? 'items-end' : 'items-start'}`}>
                              <div className="text-[10px] text-neutral-500 font-mono mb-1">
                                {m.senderRole === 'admin' ? 'X1AlzAdmin' : m.senderNick} • {new Date(m.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </div>
                              <div className={`p-3 rounded-lg text-sm max-w-[80%] ${m.senderRole === 'admin' ? 'bg-amber-950/40 border border-amber-900/50 text-neutral-200' : 'bg-[#0A0A0A] border border-neutral-800 text-neutral-300'}`}>
                                {m.text}
                              </div>
                            </div>
                          ))}
                        </div>
                        {ticket.status !== 'closed' && (
                          <form 
                            onSubmit={(e) => { 
                              e.preventDefault(); 
                              if(ticketReplyText.trim()) { 
                                db.addTicketMessage(ticket.id, adminUser.id, ticketReplyText.trim()); 
                                setTicketReplyText(''); 
                                if(ticket.status === 'open') db.updateTicketStatus(ticket.id, 'in_progress');
                              } 
                            }} 
                            className="p-3 bg-[#0A0A0A] border-t border-neutral-800 flex gap-2"
                          >
                            <input
                              type="text"
                              value={ticketReplyText}
                              onChange={(e) => setTicketReplyText(e.target.value)}
                              placeholder="Digite a resposta ao jogador..."
                              className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-amber-500"
                            />
                            <GamerButton type="submit" variant="amber" disabled={!ticketReplyText.trim()} className="px-4">
                              <MessageSquare className="w-4 h-4" />
                            </GamerButton>
                          </form>
                        )}
                      </>
                    )
                  })()
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-neutral-600">
                    <HeartHandshake className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm font-mono">Selecione um ticket para visualizar</p>
                  </div>
                )}
              </div>
            </div>
          </GamerPanel>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <GamerPanel variant="gold" title="Relatório de Auditoria e Fechamento" subtitle="Exportações detalhadas para declaração de caixa">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-950 p-6 border border-neutral-800 rounded-xl">
                <div>
                  <h4 className="font-display font-bold text-neutral-200 text-sm uppercase">Exportar Planilha Completa</h4>
                  <p className="text-neutral-400 text-xs mt-1">Gera um arquivo de auditoria (.CSV) contendo todas as apostas liquidadas, taxas recolhidas e contas vinculadas.</p>
                </div>
                <GamerButton
                  onClick={exportToCSV}
                  variant="gold"
                  className="py-3 text-xs shrink-0"
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV de Auditoria
                </GamerButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-display font-bold text-amber-400 text-xs uppercase tracking-wider mb-3">Resumo Financeiro Periódico</h4>
                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-3 font-mono text-xs text-neutral-400">
                    <div className="flex justify-between">
                      <span>Total Recebido Hoje:</span>
                      <span className="text-neutral-200 font-bold">{formatALZ(metrics.receivedToday)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Pago Hoje aos Jogadores:</span>
                      <span className="text-emerald-400 font-bold">{formatALZ(metrics.paidToday)}</span>
                    </div>
                    <div className="h-[1px] bg-neutral-800" />
                    <div className="flex justify-between">
                      <span>Lucro Bruto da Casa Hoje:</span>
                      <span className="text-amber-400 font-bold">{formatALZ(metrics.profitToday)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lucro Estimado Semanal:</span>
                      <span className="text-neutral-200">{formatALZ(metrics.totalProfit * 1.4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lucro Estimado Mensal:</span>
                      <span className="text-neutral-200">{formatALZ(metrics.totalProfit * 3.2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-display font-bold text-amber-400 text-xs uppercase tracking-wider mb-3">Logs Recentes do Servidor</h4>
                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 h-40 overflow-y-auto font-mono text-[10px] text-neutral-400 space-y-2">
                    {logs.map((log) => (
                      <div key={log.id} className="border-b border-neutral-900 pb-1.5 last:border-0">
                        <span className="text-neutral-500">[{formatBrasiliaTimeOnly(log.createdAt)}]</span>{' '}
                        <span className="text-cyan-400 font-bold uppercase">{log.action}:</span>{' '}
                        <span className="text-neutral-300">{log.details}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </GamerPanel>
          </div>
        )}

        {/* SYSTEM CONFIGURATIONS TAB */}
        {activeTab === 'settings' && (
          <GamerPanel variant="gold" title="Parâmetros Globais do Sistema" subtitle="Altere horários de fechamento, taxas administrativas e credenciais in-game">
            
            {settingsSuccess && (
              <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg flex items-center gap-2 font-sans">
                <CheckCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateSettings} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                  <label className="block text-xxs font-mono text-neutral-400 uppercase tracking-wider mb-2">Horário de Funcionamento (Abertura e Fechamento)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-neutral-500 font-mono block mb-1">Hora de Abertura</span>
                      <input
                        type="text"
                        value={settings.openingHour}
                        onChange={(e) => setSettings({ ...settings, openingHour: e.target.value })}
                        placeholder="12:00"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2.5 px-3 text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 font-mono block mb-1">Hora de Fechamento</span>
                      <input
                        type="text"
                        value={settings.closingHour}
                        onChange={(e) => setSettings({ ...settings, closingHour: e.target.value })}
                        placeholder="18:00"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2.5 px-3 text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1.5 block font-sans">Fora desse horário, o painel restringe apostas e ativa a tela de fechamento.</span>
                </div>

                <div>
                  <label className="block text-xxs font-mono text-neutral-400 uppercase tracking-wider mb-2">Porcentagem de Taxa Retida pela Casa</label>
                  <div>
                    <span className="text-[10px] text-neutral-500 font-mono block mb-1">Taxa (%)</span>
                    <input
                      type="number"
                      value={settings.houseFeePercent}
                      onChange={(e) => setSettings({ ...settings, houseFeePercent: Number(e.target.value) })}
                      placeholder="5"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2.5 px-3 text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1.5 block font-sans">Retida no encerramento de cada duelo para cobrir custos de manutenção.</span>
                </div>

                <div>
                  <label className="block text-xxs font-mono text-neutral-400 uppercase tracking-wider mb-2">Nome do Personagem Receptor (Cabal Neo)</label>
                  <div>
                    <span className="text-[10px] text-neutral-500 font-mono block mb-1">Nome do Char</span>
                    <input
                      type="text"
                      value={settings.adminCharName}
                      onChange={(e) => setSettings({ ...settings, adminCharName: e.target.value })}
                      placeholder="X1Alz"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2.5 px-3 text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1.5 block font-sans">Nome exibido para os jogadores enviarem os ALZ apostados in-game.</span>
                </div>

                <div>
                  <label className="block text-xxs font-mono text-neutral-400 uppercase tracking-wider mb-2">Mensagem de Anúncio Inicial</label>
                  <div>
                    <span className="text-[10px] text-neutral-500 font-mono block mb-1">Texto de Boas-Vindas</span>
                    <input
                      type="text"
                      value={settings.welcomeMessage}
                      onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                      placeholder="Bem-vindo ao X1 ALZ!"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2.5 px-3 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1.5 block font-sans">Frase exibida no cabeçalho do portal para todos os usuários logados.</span>
                </div>

              </div>

              <div className="flex justify-end pt-2">
                <GamerButton
                  type="submit"
                  variant="gold"
                  className="px-8 py-3 text-xs"
                >
                  Salvar Configurações Globais
                </GamerButton>
              </div>

            </form>

          </GamerPanel>
        )}

      </div>

    </div>
  );
};
