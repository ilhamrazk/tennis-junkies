export type GameType = 'Single' | 'Double';
export type SessionStatus = 'draft' | 'active' | 'completed';

export interface Session {
  id: string;
  eventTitle: string;
  hostName: string;
  gameType: GameType;
  courtCount: number;
  currentRound: number;
  status: SessionStatus;
  players: string[];
  createdAt: string;
}

export interface Match {
  id: string;
  sessionId: string;
  round: number;
  court: number;
  teamA1: string;
  teamA2: string;
  teamB1: string;
  teamB2: string;
  scoreA: number | null;
  scoreB: number | null;
  isCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlayerStanding {
  rank: number;
  name: string;
  played: number;
  won: number;
  lost: number;
  points: number;
  diff: number;
}

