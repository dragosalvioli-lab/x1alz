const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

// Update imports
code = code.replace(
  /import \{ Room, Payment, AppSettings, AdminLog, Transaction \} from '\.\.\/types';/,
  "import { Room, Payment, AppSettings, AdminLog, Transaction, Ticket } from '../types';"
);

// Add Ticket to imports from lucide-react if not present, HeartHandshake maybe?
code = code.replace(
  /Play\n\} from 'lucide-react';/,
  "Play,\n  HeartHandshake,\n  MessageSquare\n} from 'lucide-react';"
);

// Update activeTab state
code = code.replace(
  /useState\<'rooms' \| 'payments' \| 'reports' \| 'settings'\>\('rooms'\);/,
  "useState<'rooms' | 'payments' | 'tickets' | 'reports' | 'settings'>('rooms');"
);

// Add tickets state
code = code.replace(
  /const \[logs, setLogs\] = useState\<AdminLog\[\]\>\(\[\]\);/,
  "const [logs, setLogs] = useState<AdminLog[]>([]);\n  const [tickets, setTickets] = useState<Ticket[]>([]);\n  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);\n  const [ticketReplyText, setTicketReplyText] = useState('');"
);

// Update loadAdminData
code = code.replace(
  /setLogs\(db\.getLogs\(\)\);/,
  "setLogs(db.getLogs());\n    setTickets(db.getTickets());"
);

// Update tabs array
const tabsArrayOld = `  const tabs = [
    { id: 'rooms', label: 'Salas & Apostas', icon: Trophy },
    { id: 'payments', label: 'Financeiro', icon: Coins, badge: payments.filter(p => p.status === 'pending').length },
    { id: 'reports', label: 'Relatórios', icon: Clipboard },
    { id: 'settings', label: 'Sistema', icon: Sliders }
  ] as const;`;

const tabsArrayNew = `  const tabs = [
    { id: 'rooms', label: 'Salas & Apostas', icon: Trophy },
    { id: 'payments', label: 'Financeiro', icon: Coins, badge: payments.filter(p => p.status === 'pending').length },
    { id: 'tickets', label: 'Suporte', icon: HeartHandshake, badge: tickets.filter(t => t.status === 'open').length },
    { id: 'reports', label: 'Relatórios', icon: Clipboard },
    { id: 'settings', label: 'Sistema', icon: Sliders }
  ] as const;`;
  
code = code.replace(/  const tabs = \[[\s\S]*?\] as const;/, tabsArrayNew);

// Add Ticket Tab Content right before `{activeTab === 'reports' && (`
const ticketTabContent = `        {/* TAB: TICKETS */}
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
                      className={\`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer \${selectedTicketId === t.id ? 'bg-amber-950/40 border-amber-500/50' : 'bg-[#0A0A0A] border-neutral-800 hover:border-neutral-600'}\`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-neutral-200">{t.userNick}</span>
                        <span className={\`text-[9px] font-mono font-bold uppercase px-1.5 rounded \${
                          t.status === 'open' ? 'bg-green-500/20 text-green-400' :
                          t.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-neutral-800 text-neutral-500'
                        }\`}>{t.status === 'open' ? 'Aberto' : t.status === 'in_progress' ? 'Em progresso' : 'Fechado'}</span>
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
                            <div key={m.id} className={\`flex flex-col \${m.senderRole === 'admin' ? 'items-end' : 'items-start'}\`}>
                              <div className="text-[10px] text-neutral-500 font-mono mb-1">
                                {m.senderRole === 'admin' ? 'X1AlzAdmin' : m.senderNick} • {new Date(m.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </div>
                              <div className={\`p-3 rounded-lg text-sm max-w-[80%] \${m.senderRole === 'admin' ? 'bg-amber-950/40 border border-amber-900/50 text-neutral-200' : 'bg-[#0A0A0A] border border-neutral-800 text-neutral-300'}\`}>
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

        {activeTab === 'reports' && (`;

code = code.replace(/        \{activeTab === 'reports' && \(/, ticketTabContent);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
