export type GameType = 'Single' | 'Double';
export type SessionStatus = 'draft' | 'active' | 'completed';
export type MatchmakingMode = 'fair' | 'balanced';

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
  matchmakingMode?: MatchmakingMode;
  hostPin?: string;
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

export interface PlayerCareerStats {
  rank: number;
  name: string;
  played: number;
  won: number;
  lost: number;
  winRate: number; // 0 - 100 percentage
  pointsScored: number;
  pointsConceded: number;
  diff: number;
  avgPoints: number;
  bestPartner?: {
    name: string;
    played: number;
    won: number;
    winRate: number;
  };
  topRival?: {
    name: string;
    played: number;
    won: number;
    lost: number;
  };
  recentForm: ('W' | 'L')[];
}

export interface ArchivedSession {
  id: string;
  eventTitle: string;
  hostName: string;
  gameType: GameType;
  courtCount: number;
  currentRound: number;
  status: SessionStatus;
  createdAt: string;
  matchCount: number;
  podium: {
    place: number;
    name: string;
    points: number;
  }[];
}
