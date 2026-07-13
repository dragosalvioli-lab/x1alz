const fs = require('fs');
let code = fs.readFileSync('src/utils/database.ts', 'utf-8');

// Imports
code = code.replace(
  /import \{ User, Room, Payment, Transaction, AdminLog, AppSettings, RankingEntry, RoomStatus, ChatMessage \} from '\.\.\/types';/,
  "import { User, Room, Payment, Transaction, AdminLog, AppSettings, RankingEntry, RoomStatus, ChatMessage, Ticket, TicketMessage } from '../types';"
);

// State array
code = code.replace(
  /private chatMessages: ChatMessage\[\] = \[\];/,
  "private chatMessages: ChatMessage[] = [];\n  private tickets: Ticket[] = [];"
);

// Listener
const newListener = `      onSnapshot(collection(firestore, 'messages'), (snap) => {
        this.chatMessages = snap.docs.map(d => d.data() as ChatMessage).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        this.notify();
      });
      onSnapshot(collection(firestore, 'tickets'), (snap) => {
        this.tickets = snap.docs.map(d => d.data() as Ticket).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.notify();
      });`;
code = code.replace(/      onSnapshot\(collection\(firestore, 'messages'\), \(snap\) => \{\n        this\.chatMessages = snap\.docs\.map\(d => d\.data\(\) as ChatMessage\)\.sort\(\(a,b\) => new Date\(a\.createdAt\)\.getTime\(\) - new Date\(b\.createdAt\)\.getTime\(\)\);\n        this\.notify\(\);\n      \}\);/, newListener);

// Methods
const newMethods = `
  getTickets(): Ticket[] {
    return this.tickets;
  }
  
  getTicketsByUser(userId: string): Ticket[] {
    return this.tickets.filter(t => t.userId === userId);
  }
  
  async createTicket(userId: string, category: 'Recebimento de ALZ' | 'Bugs' | 'Outro', text: string): Promise<void> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;
    
    const msgId = generateId();
    const initMsg: TicketMessage = {
      id: msgId,
      senderId: user.id,
      senderNick: user.gameNick,
      senderRole: user.role,
      text,
      createdAt: new Date().toISOString()
    };
    
    const ticket: Ticket = {
      id: generateId(),
      userId: user.id,
      userNick: user.gameNick,
      category,
      status: 'open',
      messages: [initMsg],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(doc(firestore, 'tickets', ticket.id), ticket);
  }
  
  async addTicketMessage(ticketId: string, senderId: string, text: string): Promise<void> {
    const ticket = this.tickets.find(t => t.id === ticketId);
    const sender = this.users.find(u => u.id === senderId);
    if (!ticket || !sender) return;
    
    const newMsg: TicketMessage = {
      id: generateId(),
      senderId: sender.id,
      senderNick: sender.gameNick,
      senderRole: sender.role,
      text,
      createdAt: new Date().toISOString()
    };
    
    const updatedMessages = [...ticket.messages, newMsg];
    await setDoc(doc(firestore, 'tickets', ticket.id), {
      ...ticket,
      messages: updatedMessages,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }
  
  async updateTicketStatus(ticketId: string, status: 'open' | 'in_progress' | 'closed'): Promise<void> {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    await setDoc(doc(firestore, 'tickets', ticket.id), {
      ...ticket,
      status,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }
  
  // -- End of new ticket methods`;

code = code.replace(/  async sendChatMessage/, newMethods + '\n\n  async sendChatMessage');

fs.writeFileSync('src/utils/database.ts', code);
