import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User as UserIcon, Users } from 'lucide-react';
import { db } from '../utils/database';
import { User, ChatMessage } from '../types';

interface ChatBoxProps {
  currentUser: User;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'global' | 'private'>('global');
  const [adminSelectedUserId, setAdminSelectedUserId] = useState<string | null>(null);
  
  const [text, setText] = useState('');
  
  const [globalMsgs, setGlobalMsgs] = useState<ChatMessage[]>([]);
  const [privateMsgs, setPrivateMsgs] = useState<ChatMessage[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateMsgs = () => {
      setGlobalMsgs(db.getGlobalMessages());
      
      // Admin sees all private msgs to group them, player sees their own
      if (currentUser.role === 'admin') {
        // Admin fetches all private messages for grouping (we can get all by getting them all)
        // Wait, database only has getPrivateMessages(userId), which gives msgs where sender or receiver is userId.
        // For admin, we should fetch all private messages where they are receiver or sender. Wait, the admin ID is usually 'user_admin_1'.
        // So `db.getPrivateMessages(currentUser.id)` will get all msgs sent to or from the admin.
        setPrivateMsgs(db.getPrivateMessages(currentUser.id));
      } else {
        setPrivateMsgs(db.getPrivateMessages(currentUser.id));
      }
    };
    
    updateMsgs();
    const unsubscribe = db.subscribe(updateMsgs);
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    // Scroll to bottom when msgs change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [globalMsgs, privateMsgs, isOpen, activeTab, adminSelectedUserId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    let receiverId: string | undefined = undefined;
    
    if (activeTab === 'private') {
      if (currentUser.role === 'admin') {
        if (!adminSelectedUserId) return; // Need to select a user first
        receiverId = adminSelectedUserId;
      } else {
        receiverId = 'user_admin_1';
      }
    }
    
    await db.sendChatMessage(currentUser.id, text.trim(), activeTab === 'private', receiverId);
    setText('');
  };

  // Group private messages for admin
  const adminPrivateContacts = React.useMemo(() => {
    if (currentUser.role !== 'admin') return [];
    const contacts = new Map<string, { userId: string; nick: string; lastMessage: string }>();
    
    privateMsgs.forEach(m => {
      const otherId = m.senderId === currentUser.id ? m.receiverId : m.senderId;
      const otherNick = m.senderId === currentUser.id ? 'Usuário' : m.senderNick;
      if (otherId && otherId !== currentUser.id) {
        contacts.set(otherId, { userId: otherId, nick: otherNick, lastMessage: m.text });
      }
    });
    
    return Array.from(contacts.values());
  }, [privateMsgs, currentUser]);


  const renderMessages = (messages: ChatMessage[]) => {
    return (
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-neutral-800">
        {messages.map((m) => {
          const isMine = m.senderId === currentUser.id;
          return (
            <div key={m.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`text-[10px] font-mono ${isMine ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {m.senderNick} {m.senderRole === 'admin' && '👑'}
                </span>
                <span className="text-[8px] text-neutral-600 font-mono">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className={`px-3 py-2 rounded-lg text-xs max-w-[85%] ${
                isMine 
                  ? 'bg-amber-950/40 border border-amber-900/50 text-neutral-200 rounded-tr-none' 
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-tl-none'
              }`}>
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all cursor-pointer group"
      >
        <MessageCircle className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[320px] sm:w-[380px] h-[450px] bg-[#0A0A0A] border border-neutral-800 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-neutral-950 border-b border-neutral-800">
        <h3 className="font-display font-bold text-neutral-200 text-sm flex items-center gap-2 uppercase tracking-wider">
          <MessageCircle className="w-4 h-4 text-cyan-400" />
          Chat da Arena
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-red-400 transition-colors p-1 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800">
        <button 
          onClick={() => { setActiveTab('global'); setAdminSelectedUserId(null); }}
          className={`flex-1 py-2 text-xs font-mono font-bold uppercase tracking-widest transition-colors cursor-pointer ${
            activeTab === 'global' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/10' : 'text-neutral-500 hover:bg-neutral-900'
          }`}
        >
          Global
        </button>
        <button 
          onClick={() => { setActiveTab('private'); setAdminSelectedUserId(null); }}
          className={`flex-1 py-2 text-xs font-mono font-bold uppercase tracking-widest transition-colors cursor-pointer ${
            activeTab === 'private' ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-950/10' : 'text-neutral-500 hover:bg-neutral-900'
          }`}
        >
          Privado
        </button>
      </div>

      {/* Messages Area */}
      {activeTab === 'global' && renderMessages(globalMsgs)}
      
      {activeTab === 'private' && (
        <>
          {currentUser.role === 'admin' ? (
            !adminSelectedUserId ? (
              // Admin Contacts List
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {adminPrivateContacts.length === 0 ? (
                  <p className="text-center text-xs text-neutral-500 mt-10 font-mono">Nenhuma mensagem privada.</p>
                ) : (
                  adminPrivateContacts.map(contact => (
                    <button
                      key={contact.userId}
                      onClick={() => setAdminSelectedUserId(contact.userId)}
                      className="w-full p-3 flex items-center gap-3 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <div className="w-8 h-8 rounded bg-amber-950/40 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <UserIcon className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-neutral-200 truncate">{contact.nick}</p>
                        <p className="text-[10px] text-neutral-500 truncate">{contact.lastMessage}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : (
              // Admin DM with selected user
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-2 border-b border-neutral-800 bg-neutral-950 flex items-center">
                   <button 
                     onClick={() => setAdminSelectedUserId(null)}
                     className="text-xs text-neutral-400 hover:text-white mr-2"
                   >
                     ← Voltar
                   </button>
                   <span className="text-xs font-bold text-amber-400">Conversando com jogador</span>
                </div>
                {renderMessages(privateMsgs.filter(m => m.senderId === adminSelectedUserId || m.receiverId === adminSelectedUserId))}
              </div>
            )
          ) : (
            // Player DM with admin
            renderMessages(privateMsgs)
          )}
        </>
      )}

      {/* Input Area */}
      {(activeTab === 'global' || (activeTab === 'private' && (currentUser.role !== 'admin' || adminSelectedUserId))) && (
        <form onSubmit={handleSend} className="p-3 bg-neutral-950 border-t border-neutral-800 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-[#0A0A0A] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button 
            type="submit"
            disabled={!text.trim()}
            className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-cyan-400 hover:bg-neutral-800 hover:border-cyan-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
