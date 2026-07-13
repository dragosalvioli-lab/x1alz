import React, { useState, useEffect, useRef } from 'react';
import { User, Ticket, TicketMessage } from '../types';
import { db } from '../utils/database';
import { GamerButton } from './GamerCard';
import { Send, Plus, ChevronLeft, HeartHandshake } from 'lucide-react';

export const SupportTickets: React.FC<{ currentUser?: User | null }> = ({ currentUser }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'view'>('list');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  
  // Create form state
  const [category, setCategory] = useState<'Recebimento de ALZ' | 'Bugs' | 'Outro'>('Outro');
  const [message, setMessage] = useState('');
  
  // Reply state
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTickets = () => {
      if (currentUser) {
        setTickets(db.getTicketsByUser(currentUser.id));
      }
    };
    updateTickets();
    return db.subscribe(updateTickets);
  }, [currentUser]);

  useEffect(() => {
    if (viewMode === 'view' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [viewMode, tickets, selectedTicketId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !message.trim()) return;
    await db.createTicket(currentUser.id, category, message.trim());
    setCategory('Outro');
    setMessage('');
    setViewMode('list');
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !replyText.trim() || !selectedTicketId) return;
    await db.addTicketMessage(selectedTicketId, currentUser.id, replyText.trim());
    setReplyText('');
  };

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  if (!currentUser) {
    return (
      <div className="space-y-4 text-neutral-300 text-sm flex flex-col items-center justify-center py-10">
        <HeartHandshake className="w-12 h-12 text-amber-400 opacity-50 mb-4" />
        <p className="text-center">Você precisa estar logado para acessar o suporte.</p>
      </div>
    );
  }

  if (viewMode === 'create') {
    return (
      <div className="space-y-4 animate-fade-in flex flex-col h-[400px]">
        <div className="flex items-center gap-4">
          <button onClick={() => setViewMode('list')} className="text-neutral-400 hover:text-white transition-colors cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="font-display font-bold text-cyan-400">Novo Chamado</h3>
        </div>
        
        <form onSubmit={handleCreate} className="flex-1 flex flex-col gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-400 uppercase">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-[#0A0A0A] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Recebimento de ALZ">Problemas com recebimento de ALZ</option>
              <option value="Bugs">Bugs e Erros</option>
              <option value="Outro">Outro tipo de problema</option>
            </select>
          </div>
          <div className="space-y-1 flex-1 flex flex-col">
            <label className="text-xs font-bold text-neutral-400 uppercase">Mensagem</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descreva seu problema..."
              className="w-full flex-1 bg-[#0A0A0A] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-cyan-500 resize-none"
              required
            />
          </div>
          <GamerButton type="submit" variant="blue" className="w-full">
            Abrir Chamado
          </GamerButton>
        </form>
      </div>
    );
  }

  if (viewMode === 'view' && selectedTicket) {
    return (
      <div className="space-y-4 animate-fade-in flex flex-col h-[400px]">
        <div className="flex items-center gap-4 pb-2 border-b border-neutral-800 shrink-0">
          <button onClick={() => setViewMode('list')} className="text-neutral-400 hover:text-white transition-colors cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-display font-bold text-amber-400 text-sm">{selectedTicket.category}</h3>
            <p className="text-xs text-neutral-500">
              Status: <span className={selectedTicket.status === 'closed' ? 'text-neutral-400' : selectedTicket.status === 'in_progress' ? 'text-amber-400' : 'text-green-400'}>{selectedTicket.status.toUpperCase()}</span>
            </p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-neutral-800 min-h-0">
          {selectedTicket.messages.map((m, i) => (
            <div key={m.id} className={`flex flex-col ${m.senderId === currentUser.id ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-mono ${m.senderRole === 'admin' ? 'text-cyan-400' : 'text-neutral-400'}`}>
                  {m.senderRole === 'admin' ? 'Suporte (Admin)' : m.senderNick}
                </span>
                <span className="text-[9px] text-neutral-600 font-mono">
                  {new Date(m.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
              <div className={`p-3 rounded-xl text-sm max-w-[85%] ${m.senderId === currentUser.id ? 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tr-none' : 'bg-cyan-950/40 border border-cyan-900/50 text-cyan-50 rounded-tl-none'}`}>
                {m.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {selectedTicket.status !== 'closed' && (
          <form onSubmit={handleReply} className="flex gap-2 shrink-0">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Digite sua resposta..."
              className="flex-1 bg-[#0A0A0A] border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-cyan-500"
            />
            <button 
              type="submit"
              disabled={!replyText.trim()}
              className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-cyan-400 hover:bg-neutral-800 hover:border-cyan-500 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>
    );
  }

  // list mode
  return (
    <div className="space-y-4 flex flex-col min-h-[400px]">
      <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
        <h3 className="font-display text-neutral-300 font-bold">Meus Chamados</h3>
        <button
          onClick={() => setViewMode('create')}
          className="flex items-center gap-1 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> NOVO TICKET
        </button>
      </div>
      
      {tickets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
          <p className="text-sm">Você não tem chamados de suporte.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-neutral-800">
          {tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => { setSelectedTicketId(t.id); setViewMode('view'); }}
              className="w-full flex items-center justify-between p-3 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 rounded-xl transition-colors cursor-pointer text-left"
            >
              <div className="min-w-0">
                <p className="font-bold text-sm text-neutral-200 truncate">{t.category}</p>
                <p className="text-xs text-neutral-500 mt-1">Atualizado em: {new Date(t.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="shrink-0 pl-4">
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-1 rounded border ${
                  t.status === 'open' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                  t.status === 'in_progress' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                  'bg-neutral-800/50 border-neutral-700/50 text-neutral-500'
                }`}>
                  {t.status === 'open' ? 'Aberto' : t.status === 'in_progress' ? 'Em Progresso' : 'Fechado'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
