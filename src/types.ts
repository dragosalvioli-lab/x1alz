/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  gameNick: string;
  email: string;
  guild?: string;
  role: 'player' | 'admin';
  wins: number;
  losses: number;
  totalBet: number;
  profit: number; // For players: net profit, for house: accumulated
  streak: number;
  maxStreak: number;
  createdAt: string;
}

export type RoomStatus = 
  | 'waiting_opponent' 
  | 'waiting_admin_confirmation' 
  | 'active' 
  | 'spinning'
  | 'finished' 
  | 'cancelled';

export interface Room {
  id: string;
  code: string;
  player1Id: string;
  player1Nick: string;
  player1Name: string;
  player2Id: string | null;
  player2Nick: string | null;
  player2Name: string | null;
  betAmount: number; // in ALZ (e.g. 1000000000 = 1b)
  status: RoomStatus;
  winnerId: string | null;
  winnerNick: string | null;
  grossTotal: number;
  netWinnerAmount: number;
  houseFeeAmount: number;
  houseFeePercent: number;
  adminConfirmed: boolean;
  adminConfirmedAt: string | null;
  createdAt: string;
  drawnAt: string | null;
  invitedPlayerId?: string | null;
  invitedPlayerNick?: string | null;
  countdownStartedAt?: string | null;
  preDeterminedWinnerId?: string | null;
  isReplay?: boolean;
  player1Present?: boolean;
  player2Present?: boolean;
  player1PresentAt?: string | null;
  player2PresentAt?: string | null;
  skipRequestedBy?: string | null;
  skipConfirmedBy?: string | null;
}

export interface Payment {
  id: string;
  roomId: string;
  winnerId: string;
  winnerNick: string;
  winnerName: string;
  betAmount: number;
  grossTotal: number;
  netPayable: number;
  feeDeducted: number;
  status: 'pending' | 'paid';
  paidAt: string | null;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userNick: string;
  type: 'bet_deposit' | 'win_payout' | 'house_fee' | 'admin_refund';
  amount: number;
  roomId: string;
  createdAt: string;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface AppSettings {
  openingHour: string; // "12:00"
  closingHour: string; // "18:00"
  houseFeePercent: number; // 3
  adminCharName: string; // "X1Alz"
  welcomeMessage: string;
  isBypassActive: boolean; // Developer mode to override 12h-18h schedule for easy evaluation
}

export interface RankingEntry {
  userId: string;
  name: string;
  gameNick: string;
  wins: number;
  losses: number;
  totalBet: number;
  profit: number;
  streak: number;
  maxStreak: number;
}
