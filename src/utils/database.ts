/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


import { db as firestore, auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, onAuthStateChanged, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
import { collection, doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { User, Room, Payment, Transaction, AdminLog, AppSettings, RankingEntry, RoomStatus, ChatMessage, Ticket, TicketMessage } from '../types';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Helper to simulate hash for passwords
export const simulateHash = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'sha256_' + Math.abs(hash).toString(16);
};

// Initial Settings
const DEFAULT_SETTINGS: AppSettings = {
  openingHour: '12:00',
  closingHour: '18:00',
  houseFeePercent: 3,
  adminCharName: 'X1Alz',
  welcomeMessage: 'Bem-vindo ao X1 ALZ! A maior arena PvP de apostas de Cabal Neo.',
  isBypassActive: true
};

// Seed Players
const SEED_USERS: User[] = [
  {
    id: 'user_admin_1',
    name: 'Administrador Geral',
    gameNick: 'x1alzadmin',
    email: 'x1alzadmin@x1alz.com',
    role: 'admin',
    wins: 0,
    losses: 0,
    totalBet: 0,
    profit: 0,
    streak: 0,
    maxStreak: 0,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Seed Rooms
const SEED_ROOMS: Room[] = [];

// Seed Payments
const SEED_PAYMENTS: Payment[] = [];

export class X1Database {
  private users: User[] = [];
  private rooms: Room[] = [];
  private payments: Payment[] = [];
  private transactions: Transaction[] = [];
  private logs: AdminLog[] = [];
  private chatMessages: ChatMessage[] = [];
  private tickets: Ticket[] = [];
  private settings: AppSettings = DEFAULT_SETTINGS;
  private userPasswords: Record<string, string> = {}; // userId -> simulatedHash
  private activeSession: User | null = null;

  
  public onUpdate: (() => void)[] = [];

  subscribe(callback: () => void) {
    this.onUpdate.push(callback);
    return () => {
      this.onUpdate = this.onUpdate.filter(cb => cb !== callback);
    };
  }

  private notify() {
    this.onUpdate.forEach(cb => cb());
  }

  constructor() {
    // Session is still local
    this.setupFirebase();
  }

  private setupFirebase() {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!firebaseUser.emailVerified && firebaseUser.email !== 'x1alzadmin@x1alz.com') {
          this.activeSession = null;
        } else {
          try {
            const uDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
            if (uDoc.exists()) {
              this.activeSession = uDoc.data() as User;
            }
          } catch(e){}
        }
      } else {
        this.activeSession = null;
      }
      this.notify();
    });

    try {
      onSnapshot(collection(firestore, 'users'), (snap) => {
        this.users = snap.docs.map(d => d.data() as User);
        this.notify();
      });
      onSnapshot(collection(firestore, 'rooms'), (snap) => {
        this.rooms = snap.docs.map(d => d.data() as Room).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.notify();
      });
      onSnapshot(collection(firestore, 'payments'), (snap) => {
        this.payments = snap.docs.map(d => d.data() as Payment).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.notify();
      });
      onSnapshot(collection(firestore, 'transactions'), (snap) => {
        this.transactions = snap.docs.map(d => d.data() as Transaction).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.notify();
      });
      onSnapshot(collection(firestore, 'logs'), (snap) => {
        this.logs = snap.docs.map(d => d.data() as AdminLog).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.notify();
      });
      onSnapshot(collection(firestore, 'settings'), (snap) => {
        if (!snap.empty) {
          this.settings = snap.docs[0].data() as AppSettings;
        }
        this.notify();
      });
      onSnapshot(collection(firestore, 'messages'), (snap) => {
        this.chatMessages = snap.docs.map(d => d.data() as ChatMessage).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        this.notify();
      });
      onSnapshot(collection(firestore, 'tickets'), (snap) => {
        this.tickets = snap.docs.map(d => d.data() as Ticket).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.notify();
      });
    } catch(err) { console.error("Auth failed:", err); }
  }

  private saveUsers() { this.users.forEach(u => setDoc(doc(firestore, 'users', u.id), u).catch(()=>{})); }
  private saveRooms() { this.rooms.forEach(r => setDoc(doc(firestore, 'rooms', r.id), r).catch(()=>{})); }
  private savePayments() { this.payments.forEach(p => setDoc(doc(firestore, 'payments', p.id), p).catch(()=>{})); }
  private saveTransactions() { this.transactions.forEach(t => setDoc(doc(firestore, 'transactions', t.id), t).catch(()=>{})); }
  private saveLogs() { this.logs.forEach(l => setDoc(doc(firestore, 'logs', l.id), l).catch(()=>{})); }
  private saveSettings() { setDoc(doc(firestore, 'settings', 'global'), this.settings).catch(()=>{}); }
  
  resetAllData() {
    localStorage.clear();
    localStorage.setItem('x1_pristine_v2', 'true');
    this.users = [...SEED_USERS];
    this.rooms = [...SEED_ROOMS];
    this.payments = [...SEED_PAYMENTS];
    this.transactions = [];
    this.logs = [{ id: 'log_reset', adminId: 'system', action: 'Reset Geral', details: 'Dados limpos para estado padrão.', createdAt: new Date().toISOString() }];
    this.settings = { ...DEFAULT_SETTINGS };
        this.activeSession = null;
    this.saveUsers();
    this.saveRooms();
    this.savePayments();
    this.saveTransactions();
    this.saveLogs();
    this.saveSettings();
    
  }

  // Active User session
  getSession(): User | null {
    return this.activeSession;
  }

  logout() {
    this.activeSession = null;
    
  }

  // Registration
  async register(email: string, password: string, gameNick: string, guild: string): Promise<{ success: boolean; error?: string; user?: User }> {
    const cleanNick = gameNick.trim();
    const cleanGuild = guild.trim();

    if (this.users.some(u => u.gameNick.toLowerCase() === cleanNick.toLowerCase())) {
      return { success: false, error: 'Nick do jogo já cadastrado.' };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);

      const newUser: User = {
        id: userCredential.user.uid,
        name: cleanNick,
        gameNick: cleanNick,
        email: email.toLowerCase(),
        guild: cleanGuild,
        role: 'player',
        wins: 0,
        losses: 0,
        totalBet: 0,
        profit: 0,
        streak: 0,
        maxStreak: 0,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(firestore, 'users', newUser.id), newUser);
      await signOut(auth); // Sign out so they can't access until verified
      
      return { success: true, user: newUser };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  //
  async login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      if (email === 'x1alzadmin') {
        email = 'x1alzadmin@x1alz.com';
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user.emailVerified && userCredential.user.email !== 'x1alzadmin@x1alz.com') {
          await signOut(auth);
          return { success: false, error: 'Por favor, verifique seu email (verifique a caixa de spam).' };
      }
      
      const uDoc = await getDoc(doc(firestore, 'users', userCredential.user.uid));
      if (uDoc.exists()) {
        const uData = uDoc.data() as User;
        this.activeSession = uData;
        this.notify();
        return { success: true, user: uData };
      }
      return { success: false, error: 'Usuário não encontrado no banco de dados.' };
    } catch (e: any) {
      if (e.code === 'auth/invalid-credential' && email === 'x1alzadmin@x1alz.com') {
        // Try creating the admin account if it doesn't exist yet
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const uData: User = {
            id: userCredential.user.uid,
            name: 'Administrador Geral',
            gameNick: 'x1alzadmin',
            email: email,
            role: 'admin',
            wins: 0,
            losses: 0,
            totalBet: 0,
            profit: 0,
            streak: 0,
            maxStreak: 0,
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(firestore, 'users', userCredential.user.uid), uData);
          this.activeSession = uData;
          this.notify();
          return { success: true, user: uData };
        } catch (createError) {
          return { success: false, error: "Credenciais inválidas ou erro no login." };
        }
      }
      return { success: false, error: "Credenciais inválidas ou erro no login." };
    }
  }

  async recoverPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (email === 'x1alzadmin') {
        email = 'x1alzadmin@x1alz.com';
      }
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: "Erro ao tentar enviar email de recuperação. Verifique o email informado." };
    }
  }

  
  // Update Settings
  updateSettings(adminId: string, newSettings: Partial<AppSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.addLog(adminId, 'Configurações Alteradas', `Novos parâmetros de configuração aplicados.`);
  }

  getSettings(): AppSettings {
    return this.settings;
  }

  // Check Schedule
  isSystemOpen(): { isOpen: boolean; remainingSeconds: number; openAtString: string; closeAtString: string } {
    if (this.settings.isBypassActive) {
      return {
        isOpen: true,
        remainingSeconds: 0,
        openAtString: this.settings.openingHour,
        closeAtString: this.settings.closingHour
      };
    }

    // Convert current real-world time to Brasilia timezone (UTC -3)
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const brDate = new Date(utcTime - 3 * 3600000);
    const currentHour = brDate.getHours();
    const currentMinute = brDate.getMinutes();
    const currentSecond = brDate.getSeconds();
    const currentTotalSeconds = (currentHour * 3600) + (currentMinute * 60) + currentSecond;

    const [openH, openM] = this.settings.openingHour.split(':').map(Number);
    const [closeH, closeM] = this.settings.closingHour.split(':').map(Number);

    const openTotalSeconds = (openH * 3600) + (openM * 60);
    const closeTotalSeconds = (closeH * 3600) + (closeM * 60);

    let isOpen = false;
    let remainingSeconds = 0;

    if (openTotalSeconds <= closeTotalSeconds) {
      // Normal range, e.g., 12:00 to 18:00
      isOpen = currentTotalSeconds >= openTotalSeconds && currentTotalSeconds < closeTotalSeconds;
      
      if (!isOpen) {
        if (currentTotalSeconds < openTotalSeconds) {
          // Opens today
          remainingSeconds = openTotalSeconds - currentTotalSeconds;
        } else {
          // Opens tomorrow
          remainingSeconds = (24 * 3600 - currentTotalSeconds) + openTotalSeconds;
        }
      }
    } else {
      // Overnight range, e.g., 22:00 to 04:00 (next day)
      isOpen = currentTotalSeconds >= openTotalSeconds || currentTotalSeconds < closeTotalSeconds;

      if (!isOpen) {
        // e.g., currently 12:00, opens at 22:00
        remainingSeconds = openTotalSeconds - currentTotalSeconds;
      }
    }

    return {
      isOpen,
      remainingSeconds,
      openAtString: this.settings.openingHour,
      closeAtString: this.settings.closingHour
    };
  }

  // Players Stats
  getPlayers(): User[] {
    return this.users.filter(u => u.role === 'player');
  }

  getRooms(): Room[] {
    return this.rooms;
  }

  getPayments(): Payment[] {
    return this.payments;
  }

  getTransactions(): Transaction[] {
    return this.transactions;
  }

  getLogs(): AdminLog[] {
    return this.logs;
  }

  getGlobalMessages(): ChatMessage[] {
    return this.chatMessages.filter(m => !m.isPrivate);
  }

  getPrivateMessages(userId: string): ChatMessage[] {
    return this.chatMessages.filter(m => m.isPrivate && (m.senderId === userId || m.receiverId === userId));
  }


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
  
  // -- End of new ticket methods

  async sendChatMessage(userId: string, text: string, isPrivate: boolean, receiverId?: string): Promise<void> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;
    
    const msg: any = {
      id: generateId(),
      senderId: user.id,
      senderNick: user.gameNick,
      senderRole: user.role,
      text,
      isPrivate,
      createdAt: new Date().toISOString()
    };
    
    if (isPrivate) {
      msg.receiverId = receiverId || 'user_admin_1';
    }
    
    await setDoc(doc(firestore, 'messages', msg.id), msg);
  }

  // New Bet Room Creation
  createRoom(playerId: string, betAmount: number, invitedPlayerNick?: string): Room {
    if (!this.isSystemOpen().isOpen) {
      throw new Error('O portal de apostas está fechado no momento.');
    }
    const player = this.users.find(u => u.id === playerId);
    if (!player) throw new Error('Jogador não encontrado');

    let invitedPlayerId: string | null = null;
    let finalInvitedNick: string | null = null;

    if (invitedPlayerNick && invitedPlayerNick.trim()) {
      const cleanInvitedNick = invitedPlayerNick.trim();
      if (cleanInvitedNick.toLowerCase() === player.gameNick.toLowerCase()) {
        throw new Error('Você não pode desafiar a si mesmo.');
      }
      const opponent = this.users.find(u => u.gameNick.toLowerCase() === cleanInvitedNick.toLowerCase() && u.role === 'player');
      if (!opponent) {
        throw new Error(`Jogador com o nick "${cleanInvitedNick}" não foi encontrado no sistema.`);
      }
      invitedPlayerId = opponent.id;
      finalInvitedNick = opponent.gameNick;
    }

    const code = `X1-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRoom: Room = {
      id: 'room_' + generateId(),
      code,
      player1Id: player.id,
      player1Nick: player.gameNick,
      player1Name: player.name,
      player2Id: null,
      player2Nick: null,
      player2Name: null,
      betAmount,
      status: 'waiting_opponent',
      winnerId: null,
      winnerNick: null,
      grossTotal: 0,
      netWinnerAmount: 0,
      houseFeeAmount: 0,
      houseFeePercent: this.settings.houseFeePercent,
      adminConfirmed: false,
      adminConfirmedAt: null,
      createdAt: new Date().toISOString(),
      drawnAt: null,
      invitedPlayerId,
      invitedPlayerNick: finalInvitedNick
    };

    this.rooms.unshift(newRoom);
    this.saveRooms();

    // Log Transaction
    this.addTransaction(player.id, player.gameNick, 'bet_deposit', betAmount, newRoom.id);

    return newRoom;
  }

  // Join Room
  joinRoom(playerId: string, code: string): { success: boolean; error?: string; room?: Room } {
    if (!this.isSystemOpen().isOpen) {
      return { success: false, error: 'O portal de apostas está fechado no momento.' };
    }
    const player = this.users.find(u => u.id === playerId);
    if (!player) return { success: false, error: 'Jogador não encontrado.' };

    const cleanCode = code.trim().toUpperCase();
    const room = this.rooms.find(r => r.code === cleanCode);

    if (!room) {
      return { success: false, error: 'Sala não encontrada. Verifique o código.' };
    }

    if (room.status !== 'waiting_opponent') {
      return { success: false, error: 'Esta sala já está lotada ou indisponível.' };
    }

    if (room.player1Id === playerId) {
      return { success: false, error: 'Você não pode entrar na sua própria sala.' };
    }

    // Checking if it's a private room and the player is not the one invited
    if (room.invitedPlayerId && room.invitedPlayerId !== playerId) {
      return { success: false, error: 'Esta sala é privada e reservada para outro oponente convidado.' };
    }

    // Join room
    room.player2Id = player.id;
    room.player2Nick = player.gameNick;
    room.player2Name = player.name;
    room.status = 'waiting_admin_confirmation';

    this.saveRooms();

    // Add Transaction for player 2
    this.addTransaction(player.id, player.gameNick, 'bet_deposit', room.betAmount, room.id);

    return { success: true, room };
  }

  // Admin: Confirm ALZ Receipt
  confirmAlzReceipt(adminId: string, roomId: string): { success: boolean; error?: string; room?: Room } {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return { success: false, error: 'Sala não encontrada.' };

    if (room.status !== 'waiting_admin_confirmation') {
      return { success: false, error: 'Essa sala não está aguardando confirmação.' };
    }

    room.adminConfirmed = true;
    room.adminConfirmedAt = new Date().toISOString();
    room.status = 'active';

    this.saveRooms();

    // Log admin action
    this.addLog(adminId, 'Confirmar ALZ', `ALZ confirmados para a sala ${room.code} (${room.betAmount} ALZ por jogador)`);

    return { success: true, room };
  }

  // Admin: Cancel Room
  cancelRoom(adminId: string, roomId: string): { success: boolean; error?: string; room?: Room } {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return { success: false, error: 'Sala não encontrada.' };

    if (room.status === 'finished' || room.status === 'cancelled') {
      return { success: false, error: 'Esta sala já foi encerrada.' };
    }

    const previousStatus = room.status;
    room.status = 'cancelled';
    this.saveRooms();

    // Refund Players
    if (room.player1Id) {
      this.addTransaction(room.player1Id, room.player1Nick, 'admin_refund', room.betAmount, room.id);
    }
    if (room.player2Id) {
      this.addTransaction(room.player2Id, room.player2Nick!, 'admin_refund', room.betAmount, room.id);
    }

    // Log admin action
    this.addLog(adminId, 'Cancelar Sala', `Sala ${room.code} cancelada. Reembolsos emitidos.`);

    return { success: true, room };
  }

  // Spin Roulette Start
  startSpinning(roomId: string): boolean {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room || room.status !== 'active') return false;

    // Pre-determine a stable winner for this room
    const winnerId = Math.random() < 0.5 ? room.player1Id : room.player2Id;

    room.status = 'spinning';
    room.countdownStartedAt = new Date().toISOString();
    room.preDeterminedWinnerId = winnerId;
    this.saveRooms();
    return true;
  }

  // Update presence inside the live draw
  updateRoomPresence(roomId: string, playerId: string, isPresent: boolean): Room | null {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return null;

    let changed = false;
    if (room.player1Id === playerId) {
      if (room.player1Present !== isPresent) {
        room.player1Present = isPresent;
        room.player1PresentAt = isPresent ? new Date().toISOString() : null;
        changed = true;
      }
    } else if (room.player2Id === playerId) {
      if (room.player2Present !== isPresent) {
        room.player2Present = isPresent;
        room.player2PresentAt = isPresent ? new Date().toISOString() : null;
        changed = true;
      }
    }

    if (changed) {
      this.saveRooms();
    }
    return room;
  }

  // Request to skip the countdown ("Girar Agora")
  requestSkipCountdown(roomId: string, playerId: string): Room | null {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return null;

    room.skipRequestedBy = playerId;
    room.skipConfirmedBy = null; // Reset confirmation when a new request is made
    this.saveRooms();
    return room;
  }

  // Confirm / Agree to skip the countdown
  confirmSkipCountdown(roomId: string, playerId: string): Room | null {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return null;

    if (room.skipRequestedBy && room.skipRequestedBy !== playerId) {
      room.skipConfirmedBy = playerId;
      this.saveRooms();
    }
    return room;
  }

  // Reset skip requests
  resetSkipRequests(roomId: string): Room | null {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return null;

    room.skipRequestedBy = null;
    room.skipConfirmedBy = null;
    this.saveRooms();
    return room;
  }

  // Draw Room Winner (Sorteio)
  finalizeRoomDraw(roomId: string, forcedWinnerId?: string): { success: boolean; error?: string; room?: Room } {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return { success: false, error: 'Sala não encontrada.' };

    if (room.status !== 'active' && room.status !== 'spinning') {
      return { success: false, error: 'A sala deve estar ativa ou em sorteio para finalizar.' };
    }

    if (!room.player2Id) {
      return { success: false, error: 'A sala precisa de dois jogadores para sorteio.' };
    }

    // Sorteio aleatório ou forçado (para simulação fácil)
    let winnerId = forcedWinnerId;
    if (!winnerId) {
      winnerId = Math.random() < 0.5 ? room.player1Id : room.player2Id;
    }

    const loserId = winnerId === room.player1Id ? room.player2Id : room.player1Id;
    const winnerNick = winnerId === room.player1Id ? room.player1Nick : room.player2Nick!;
    const winnerName = winnerId === room.player1Id ? room.player1Name : room.player2Name!;

    const grossTotal = room.betAmount * 2;
    const feePercent = room.houseFeePercent;
    const houseFeeAmount = Math.floor(grossTotal * (feePercent / 100));
    const netWinnerAmount = grossTotal - houseFeeAmount;

    // Update Room
    room.winnerId = winnerId;
    room.winnerNick = winnerNick;
    room.grossTotal = grossTotal;
    room.netWinnerAmount = netWinnerAmount;
    room.houseFeeAmount = houseFeeAmount;
    room.status = 'finished';
    room.drawnAt = new Date().toISOString();

    // Update User Stats (Winner and Loser)
    const winnerUser = this.users.find(u => u.id === winnerId);
    if (winnerUser) {
      winnerUser.wins += 1;
      winnerUser.totalBet += room.betAmount;
      winnerUser.profit += (netWinnerAmount - room.betAmount); // Net win is won amount - bet amount
      winnerUser.streak += 1;
      if (winnerUser.streak > winnerUser.maxStreak) {
        winnerUser.maxStreak = winnerUser.streak;
      }
    }

    const loserUser = this.users.find(u => u.id === loserId);
    if (loserUser) {
      loserUser.losses += 1;
      loserUser.totalBet += room.betAmount;
      loserUser.profit -= room.betAmount;
      loserUser.streak = 0;
    }

    this.saveRooms();
    this.saveUsers();

    // Add Transactions
    this.addTransaction(winnerId, winnerNick, 'win_payout', netWinnerAmount, room.id);
    this.addTransaction('house', 'X1 ALZ House', 'house_fee', houseFeeAmount, room.id);

    // Create Payment record for Admin to fulfill later inside the game
    const newPayment: Payment = {
      id: 'pay_' + generateId(),
      roomId: room.id,
      winnerId: winnerId,
      winnerNick: winnerNick,
      winnerName: winnerName,
      betAmount: room.betAmount,
      grossTotal: grossTotal,
      netPayable: netWinnerAmount,
      feeDeducted: houseFeeAmount,
      status: 'pending',
      paidAt: null,
      createdAt: new Date().toISOString()
    };

    this.payments.unshift(newPayment);
    this.savePayments();

    return { success: true, room };
  }

  // Admin: Mark Payment as Paid
  markAsPaid(adminId: string, paymentId: string): { success: boolean; error?: string; payment?: Payment } {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) return { success: false, error: 'Pagamento não encontrado.' };

    if (payment.status === 'paid') {
      return { success: false, error: 'Pagamento já foi quitado.' };
    }

    payment.status = 'paid';
    payment.paidAt = new Date().toISOString();

    this.savePayments();

    // Log admin action
    this.addLog(adminId, 'Marcar Pago', `Pagamento de ${payment.netPayable} ALZ para ${payment.winnerNick} marcado como pago.`);

    return { success: true, payment };
  }

  // Simulation Helper: Simulate random player joining an empty room
  simulateOpponentJoin(adminId: string, roomId: string): { success: boolean; error?: string; room?: Room } {
    const room = this.rooms.find(r => r.id === roomId);
    if (!room) return { success: false, error: 'Sala não encontrada.' };
    if (room.status !== 'waiting_opponent') return { success: false, error: 'Sala não está aguardando oponente.' };

    // Find a random seed user that is not the owner
    const candidates = this.users.filter(u => u.id !== room.player1Id && u.role === 'player');
    if (candidates.length === 0) {
      return { success: false, error: 'Não há outros jogadores cadastrados no sistema para desafiar.' };
    }
    const randomOpponent = candidates[Math.floor(Math.random() * candidates.length)];

    room.player2Id = randomOpponent.id;
    room.player2Nick = randomOpponent.gameNick;
    room.player2Name = randomOpponent.name;
    room.status = 'waiting_admin_confirmation';

    this.saveRooms();

    // Log transaction
    this.addTransaction(randomOpponent.id, randomOpponent.gameNick, 'bet_deposit', room.betAmount, room.id);

    return { success: true, room };
  }

  // Base methods
  private addTransaction(userId: string, userNick: string, type: 'bet_deposit' | 'win_payout' | 'house_fee' | 'admin_refund', amount: number, roomId: string) {
    const t: Transaction = {
      id: 't_' + generateId(),
      userId,
      userNick,
      type,
      amount,
      roomId,
      createdAt: new Date().toISOString()
    };
    this.transactions.unshift(t);
    this.saveTransactions();
  }

  private addLog(adminId: string, action: string, details: string) {
    const l: AdminLog = {
      id: 'log_' + generateId(),
      adminId,
      action,
      details,
      createdAt: new Date().toISOString()
    };
    this.logs.unshift(l);
    this.saveLogs();
  }

  // Rankings Calculation
  getRankings(): RankingEntry[] {
    const players = this.getPlayers();
    return players
      .map(p => ({
        userId: p.id,
        name: p.name,
        gameNick: p.gameNick,
        wins: p.wins,
        losses: p.losses,
        totalBet: p.totalBet,
        profit: p.profit,
        streak: p.streak,
        maxStreak: p.maxStreak
      }))
      .sort((a, b) => b.wins - a.wins || b.profit - a.profit);
  }

  // Financial Summary Reports
  getFinancialSummary() {
    const finishedRooms = this.rooms.filter(r => r.status === 'finished');
    const payments = this.payments;

    const totalReceived = finishedRooms.reduce((sum, r) => sum + (r.betAmount * 2), 0);
    const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.netPayable, 0);
    const totalUnpaid = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.netPayable, 0);
    const totalProfit = finishedRooms.reduce((sum, r) => sum + r.houseFeeAmount, 0);

    // Filter today
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);

    const roomsToday = finishedRooms.filter(r => new Date(r.drawnAt!) >= startOfToday);
    const receivedToday = roomsToday.reduce((sum, r) => sum + (r.betAmount * 2), 0);
    const profitToday = roomsToday.reduce((sum, r) => sum + r.houseFeeAmount, 0);
    const paidToday = payments.filter(p => p.status === 'paid' && new Date(p.paidAt!) >= startOfToday).reduce((sum, p) => sum + p.netPayable, 0);

    return {
      totalReceived,
      totalPaid,
      totalUnpaid,
      totalProfit,
      receivedToday,
      profitToday,
      paidToday,
      onlinePlayers: this.getPlayers().length, // actual registered players count
      activeRooms: this.rooms.filter(r => r.status === 'active' || r.status === 'spinning').length,
      waitingConfirmation: this.rooms.filter(r => r.status === 'waiting_admin_confirmation').length,
      waitingOpponent: this.rooms.filter(r => r.status === 'waiting_opponent').length,
      finishedCount: finishedRooms.length
    };
  }

  // Supabase SQL Schema exporter
  getSupabaseSQL(): string {
    return `-- ====================================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS SUPABASE PARA "X1 ALZ"
-- Cole este script no Editor SQL (SQL Editor) do seu painel Supabase.
-- ====================================================================

-- 1. Habilitar extensões necessárias
create extension if not exists "uuid-ossp";

-- 2. Tabela de Usuários (users)
create table if nulls users (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  game_nick text not null unique,
  email text not null unique,
  role text not null default 'player' check (role in ('player', 'admin')),
  wins integer default 0,
  losses integer default 0,
  total_bet bigint default 0,
  profit bigint default 0,
  streak integer default 0,
  max_streak integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Criar índices de busca para usuários
create index idx_users_game_nick on users(game_nick);
create index idx_users_email on users(email);

-- 3. Tabela de Salas de Aposta (rooms / matches)
create table if not exists rooms (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  player1_id uuid references users(id) on delete cascade not null,
  player1_nick text not null,
  player1_name text not null,
  player2_id uuid references users(id) on delete set null,
  player2_nick text,
  player2_name text,
  bet_amount bigint not null,
  status text not null default 'waiting_opponent' check (status in ('waiting_opponent', 'waiting_admin_confirmation', 'active', 'spinning', 'finished', 'cancelled')),
  winner_id uuid references users(id) on delete set null,
  winner_nick text,
  gross_total bigint default 0,
  net_winner_amount bigint default 0,
  house_fee_amount bigint default 0,
  house_fee_percent integer default 5,
  admin_confirmed boolean default false,
  admin_confirmed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  drawn_at timestamp with time zone
);

create index idx_rooms_code on rooms(code);
create index idx_rooms_status on rooms(status);

-- 4. Tabela de Controle de Pagamentos Admin (payments)
create table if not exists payments (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references rooms(id) on delete cascade not null,
  winner_id uuid references users(id) on delete cascade not null,
  winner_nick text not null,
  winner_name text not null,
  bet_amount bigint not null,
  gross_total bigint not null,
  net_payable bigint not null,
  fee_deducted bigint not null,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  paid_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Tabela de Registro de Transações Financeiras (transactions)
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade not null,
  user_nick text not null,
  type text not null check (type in ('bet_deposit', 'win_payout', 'house_fee', 'admin_refund')),
  amount bigint not null,
  room_id uuid references rooms(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Tabela de Auditoria Administrativa (admin_logs)
create table if not exists admin_logs (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid references users(id) on delete cascade not null,
  action text not null,
  details text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Tabela de Configurações do Sistema (settings)
create table if not exists settings (
  id integer primary key default 1 check (id = 1),
  opening_hour text not null default '12:00',
  closing_hour text not null default '18:00',
  house_fee_percent integer not null default 5,
  admin_char_name text not null default 'X1Alz',
  welcome_message text default 'Bem-vindo ao X1 ALZ! A maior plataforma de apostas de Cabal Neo.'
);

-- Inserir configurações padrão iniciais
insert into settings (id, opening_hour, closing_hour, house_fee_percent, admin_char_name, welcome_message)
values (1, '12:00', '18:00', 5, 'X1Alz', 'Bem-vindo ao X1 ALZ! A maior plataforma de apostas de Cabal Neo.')
on conflict (id) do nothing;

-- ====================================================================
-- 8. Gatilhos de Atualização Automatizada de Rankings e Estatísticas
-- ====================================================================

-- Função para atualizar estatísticas de vitória/derrota/lucro ao finalizar um jogo
create or replace function handle_room_completion()
returns trigger as $$
declare
  house_fee_val bigint;
  net_amount bigint;
  loser_id_val uuid;
begin
  if (NEW.status = 'finished' and OLD.status <> 'finished') then
    -- Calcular taxas e valor líquido
    house_fee_val := (NEW.bet_amount * 2 * NEW.house_fee_percent) / 100;
    net_amount := (NEW.bet_amount * 2) - house_fee_val;

    -- Identificar o perdedor
    if (NEW.winner_id = NEW.player1_id) then
      loser_id_val := NEW.player2_id;
    else
      loser_id_val := NEW.player1_id;
    end if;

    -- Atualizar ganhador
    update users
    set wins = wins + 1,
        total_bet = total_bet + NEW.bet_amount,
        profit = profit + (net_amount - NEW.bet_amount),
        streak = streak + 1,
        max_streak = greatest(max_streak, streak + 1)
    where id = NEW.winner_id;

    -- Atualizar perdedor
    update users
    set losses = losses + 1,
        total_bet = total_bet + NEW.bet_amount,
        profit = profit - NEW.bet_amount,
        streak = 0
    where id = loser_id_val;

    -- Criar automaticamente a fatura de pagamento
    insert into payments (room_id, winner_id, winner_nick, winner_name, bet_amount, gross_total, net_payable, fee_deducted, status)
    values (NEW.id, NEW.winner_id, NEW.winner_nick, NEW.winner_name, NEW.bet_amount, NEW.bet_amount * 2, net_amount, house_fee_val, 'pending');

    -- Gravar transações financeiras
    insert into transactions (user_id, user_nick, type, amount, room_id)
    values (NEW.winner_id, NEW.winner_nick, 'win_payout', net_amount, NEW.id);

    insert into transactions (user_id, user_nick, type, amount, room_id)
    values (NEW.player1_id, NEW.player1_nick, 'bet_deposit', NEW.bet_amount, NEW.id);

    insert into transactions (user_id, user_nick, type, amount, room_id)
    values (NEW.player2_id, NEW.player2_nick, 'bet_deposit', NEW.bet_amount, NEW.id);
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create or replace trigger on_room_draw_complete
  after update on rooms
  for each row
  execute function handle_room_completion();
`;
  }
}

export const db = new X1Database();

export const formatBrasiliaDateTime = (dateVal: string | number | Date): string => {
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  
  // Convert to UTC - 3 hours (Brasília timezone)
  const utcTime = d.getTime();
  const brasiliaOffsetMs = -3 * 60 * 60 * 1000;
  const brasiliaDate = new Date(utcTime + brasiliaOffsetMs);
  
  const day = String(brasiliaDate.getUTCDate()).padStart(2, '0');
  const month = String(brasiliaDate.getUTCMonth() + 1).padStart(2, '0');
  const year = brasiliaDate.getUTCFullYear();
  const hours = String(brasiliaDate.getUTCHours()).padStart(2, '0');
  const minutes = String(brasiliaDate.getUTCMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const formatBrasiliaTimeOnly = (dateVal: string | number | Date): string => {
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  
  // Convert to UTC - 3 hours (Brasília timezone)
  const utcTime = d.getTime();
  const brasiliaOffsetMs = -3 * 60 * 60 * 1000;
  const brasiliaDate = new Date(utcTime + brasiliaOffsetMs);
  
  const hours = String(brasiliaDate.getUTCHours()).padStart(2, '0');
  const minutes = String(brasiliaDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(brasiliaDate.getUTCSeconds()).padStart(2, '0');
  
  return `${hours}:${minutes}:${seconds}`;
};

export const formatALZ = (val: number): string => {
  if (val >= 1000000000) {
    const b = val / 1000000000;
    return `${b % 1 === 0 ? b.toFixed(0) : b.toFixed(1)}B ALZ`;
  }
  if (val >= 1000000) {
    const kk = val / 1000000;
    return `${kk % 1 === 0 ? kk.toFixed(0) : kk.toFixed(1)}kk ALZ`;
  }
  return `${val.toLocaleString()} ALZ`;
};
