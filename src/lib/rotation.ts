import { Match, GameType, MatchmakingMode, PlayerStanding, PlayerCareerStats } from '../types/tennis';

/**
 * Generate match assignments for the next round.
 * Supports:
 * - 'fair': greedy rotation prioritizing equal court time, novel partners, and fresh opponents.
 * - 'balanced': smart skill-balanced matchmaking pairing strongest + developing vs mid + mid.
 */
export function generateMatchesForRound(
  sessionId: string,
  round: number,
  players: string[],
  gameType: GameType,
  courtCount: number,
  pastMatches: Match[],
  matchmakingMode: MatchmakingMode = 'fair',
  playerRatings?: Record<string, number>
): Match[] {
  if (!players || players.length === 0) return [];

  const playersNeededPerCourt = gameType === 'Double' ? 4 : 2;
  const totalSlots = Math.min(courtCount * playersNeededPerCourt, players.length);
  const activeCourts = Math.floor(totalSlots / playersNeededPerCourt);

  if (activeCourts === 0) return [];

  // Count how many times each player has played so far
  const playCounts: Record<string, number> = {};
  const partnerCounts: Record<string, Record<string, number>> = {};
  const opponentCounts: Record<string, Record<string, number>> = {};

  players.forEach((p) => {
    playCounts[p] = 0;
    partnerCounts[p] = {};
    opponentCounts[p] = {};
    players.forEach((other) => {
      partnerCounts[p][other] = 0;
      opponentCounts[p][other] = 0;
    });
  });

  pastMatches.forEach((m) => {
    const teamA = [m.teamA1, m.teamA2].filter(Boolean);
    const teamB = [m.teamB1, m.teamB2].filter(Boolean);

    [...teamA, ...teamB].forEach((p) => {
      if (playCounts[p] !== undefined) playCounts[p]++;
    });

    // Partners
    if (teamA.length === 2) {
      if (partnerCounts[teamA[0]]?.[teamA[1]] !== undefined) {
        partnerCounts[teamA[0]][teamA[1]]++;
        partnerCounts[teamA[1]][teamA[0]]++;
      }
    }
    if (teamB.length === 2) {
      if (partnerCounts[teamB[0]]?.[teamB[1]] !== undefined) {
        partnerCounts[teamB[0]][teamB[1]]++;
        partnerCounts[teamB[1]][teamB[0]]++;
      }
    }

    // Opponents
    teamA.forEach((a) => {
      teamB.forEach((b) => {
        if (opponentCounts[a]?.[b] !== undefined) opponentCounts[a][b]++;
        if (opponentCounts[b]?.[a] !== undefined) opponentCounts[b][a]++;
      });
    });
  });

  // Sort players: least matches played first to ensure equal court time for everyone
  const pool = [...players].sort((a, b) => {
    const diff = playCounts[a] - playCounts[b];
    if (diff !== 0) return diff;
    return Math.random() - 0.5;
  });

  // Select top N players for this round
  const selectedPlayers = pool.slice(0, activeCourts * playersNeededPerCourt);

  const matches: Match[] = [];

  if (gameType === 'Single') {
    // Single format: pair 2 by 2
    for (let c = 1; c <= activeCourts; c++) {
      const idx = (c - 1) * 2;
      let p1 = selectedPlayers[idx];
      let p2 = selectedPlayers[idx + 1];

      // If balanced and ratings are provided, try to pair closer skill levels in singles
      if (matchmakingMode === 'balanced' && playerRatings) {
        // rank by rating
        const r1 = playerRatings[p1] ?? 50;
        const r2 = playerRatings[p2] ?? 50;
        if (r2 > r1) {
          const tmp = p1;
          p1 = p2;
          p2 = tmp;
        }
      }

      matches.push({
        id: `m-${sessionId}-r${round}-c${c}`,
        sessionId,
        round,
        court: c,
        teamA1: p1,
        teamA2: '',
        teamB1: p2,
        teamB2: '',
        scoreA: null,
        scoreB: null,
        isCompleted: false,
      });
    }
  } else {
    // Double format: 4 players per court
    for (let c = 1; c <= activeCourts; c++) {
      const courtPlayers = selectedPlayers.slice((c - 1) * 4, c * 4);

      let teamA1: string;
      let teamA2: string;
      let teamB1: string;
      let teamB2: string;

      if (matchmakingMode === 'balanced' && playerRatings) {
        // Smart Balanced Matchmaking:
        // Sort the 4 players by skill rating (high to low)
        const sortedBySkill = [...courtPlayers].sort((a, b) => {
          const rateA = playerRatings[a] ?? 50;
          const rateB = playerRatings[b] ?? 50;
          return rateB - rateA;
        });

        // Pair 1 (strongest) + 4 (developing) vs 2 (mid) + 3 (mid)
        teamA1 = sortedBySkill[0];
        teamA2 = sortedBySkill[3];
        teamB1 = sortedBySkill[1];
        teamB2 = sortedBySkill[2];
      } else {
        // Fair Rotation: choose combination with lowest past partner repetition
        const [pA, pB, pC, pD] = courtPlayers;

        const cost1 = (partnerCounts[pA]?.[pB] || 0) + (partnerCounts[pC]?.[pD] || 0);
        const cost2 = (partnerCounts[pA]?.[pC] || 0) + (partnerCounts[pB]?.[pD] || 0);
        const cost3 = (partnerCounts[pA]?.[pD] || 0) + (partnerCounts[pB]?.[pC] || 0);

        teamA1 = pA;
        teamA2 = pB;
        teamB1 = pC;
        teamB2 = pD;

        if (cost2 < cost1 && cost2 <= cost3) {
          teamA1 = pA;
          teamA2 = pC;
          teamB1 = pB;
          teamB2 = pD;
        } else if (cost3 < cost1 && cost3 < cost2) {
          teamA1 = pA;
          teamA2 = pD;
          teamB1 = pB;
          teamB2 = pC;
        }
      }

      matches.push({
        id: `m-${sessionId}-r${round}-c${c}`,
        sessionId,
        round,
        court: c,
        teamA1,
        teamA2,
        teamB1,
        teamB2,
        scoreA: null,
        scoreB: null,
        isCompleted: false,
      });
    }
  }

  return matches;
}

/**
 * Calculate Leaderboard Standings for current session.
 */
export function calculateStandings(players: string[], matches: Match[]): PlayerStanding[] {
  const map: Record<string, { played: number; won: number; lost: number; points: number; diff: number }> = {};

  players.forEach((p) => {
    map[p] = { played: 0, won: 0, lost: 0, points: 0, diff: 0 };
  });

  matches
    .filter((m) => m.isCompleted && m.scoreA !== null && m.scoreB !== null)
    .forEach((m) => {
      const sA = m.scoreA ?? 0;
      const sB = m.scoreB ?? 0;
      const teamA = [m.teamA1, m.teamA2].filter(Boolean);
      const teamB = [m.teamB1, m.teamB2].filter(Boolean);

      const aWon = sA > sB;
      const bWon = sB > sA;

      teamA.forEach((p) => {
        if (!map[p]) map[p] = { played: 0, won: 0, lost: 0, points: 0, diff: 0 };
        map[p].played += 1;
        map[p].points += sA;
        map[p].diff += sA - sB;
        if (aWon) map[p].won += 1;
        else if (bWon) map[p].lost += 1;
      });

      teamB.forEach((p) => {
        if (!map[p]) map[p] = { played: 0, won: 0, lost: 0, points: 0, diff: 0 };
        map[p].played += 1;
        map[p].points += sB;
        map[p].diff += sB - sA;
        if (bWon) map[p].won += 1;
        else if (aWon) map[p].lost += 1;
      });
    });

  // Sort: highest points, then highest won, then goal diff, then played
  const sorted = Object.entries(map)
    .map(([name, stat]) => ({
      name,
      ...stat,
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.won !== a.won) return b.won - a.won;
      if (b.diff !== a.diff) return b.diff - a.diff;
      return a.played - b.played;
    });

  return sorted.map((p, idx) => ({
    ...p,
    rank: idx + 1,
  }));
}

/**
 * Calculate All-Time Career Statistics across all completed matches.
 */
export function calculateAllTimeStats(matches: Match[]): PlayerCareerStats[] {
  interface MutableStats {
    played: number;
    won: number;
    lost: number;
    pointsScored: number;
    pointsConceded: number;
    partners: Record<string, { played: number; won: number }>;
    rivals: Record<string, { played: number; won: number; lost: number }>;
    recentForm: ('W' | 'L')[];
  }

  const map: Record<string, MutableStats> = {};

  const ensurePlayer = (p: string) => {
    if (!map[p]) {
      map[p] = {
        played: 0,
        won: 0,
        lost: 0,
        pointsScored: 0,
        pointsConceded: 0,
        partners: {},
        rivals: {},
        recentForm: [],
      };
    }
  };

  // Sort matches by time / round ascending to calculate form chronologically
  const completedMatches = matches
    .filter((m) => m.isCompleted && m.scoreA !== null && m.scoreB !== null)
    .sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tA - tB;
    });

  completedMatches.forEach((m) => {
    const sA = m.scoreA ?? 0;
    const sB = m.scoreB ?? 0;
    const teamA = [m.teamA1, m.teamA2].filter(Boolean);
    const teamB = [m.teamB1, m.teamB2].filter(Boolean);

    const aWon = sA > sB;
    const bWon = sB > sA;

    // Process Team A
    teamA.forEach((p) => {
      ensurePlayer(p);
      map[p].played += 1;
      map[p].pointsScored += sA;
      map[p].pointsConceded += sB;
      if (aWon) {
        map[p].won += 1;
        map[p].recentForm.push('W');
      } else if (bWon) {
        map[p].lost += 1;
        map[p].recentForm.push('L');
      }

      // Partner stats
      teamA.forEach((partner) => {
        if (partner !== p) {
          if (!map[p].partners[partner]) map[p].partners[partner] = { played: 0, won: 0 };
          map[p].partners[partner].played += 1;
          if (aWon) map[p].partners[partner].won += 1;
        }
      });

      // Rival stats
      teamB.forEach((rival) => {
        if (!map[p].rivals[rival]) map[p].rivals[rival] = { played: 0, won: 0, lost: 0 };
        map[p].rivals[rival].played += 1;
        if (aWon) map[p].rivals[rival].won += 1;
        else if (bWon) map[p].rivals[rival].lost += 1;
      });
    });

    // Process Team B
    teamB.forEach((p) => {
      ensurePlayer(p);
      map[p].played += 1;
      map[p].pointsScored += sB;
      map[p].pointsConceded += sA;
      if (bWon) {
        map[p].won += 1;
        map[p].recentForm.push('W');
      } else if (aWon) {
        map[p].lost += 1;
        map[p].recentForm.push('L');
      }

      // Partner stats
      teamB.forEach((partner) => {
        if (partner !== p) {
          if (!map[p].partners[partner]) map[p].partners[partner] = { played: 0, won: 0 };
          map[p].partners[partner].played += 1;
          if (bWon) map[p].partners[partner].won += 1;
        }
      });

      // Rival stats
      teamA.forEach((rival) => {
        if (!map[p].rivals[rival]) map[p].rivals[rival] = { played: 0, won: 0, lost: 0 };
        map[p].rivals[rival].played += 1;
        if (bWon) map[p].rivals[rival].won += 1;
        else if (aWon) map[p].rivals[rival].lost += 1;
      });
    });
  });

  const list: PlayerCareerStats[] = Object.entries(map).map(([name, data]) => {
    const winRate = data.played > 0 ? Math.round((data.won / data.played) * 100) : 0;
    const diff = data.pointsScored - data.pointsConceded;
    const avgPoints = data.played > 0 ? Number((data.pointsScored / data.played).toFixed(1)) : 0;

    // Find Best Partner: highest winRate, minimum 1 win
    let bestPartner: PlayerCareerStats['bestPartner'];
    let bestPartnerScore = -1;
    Object.entries(data.partners).forEach(([partName, pStats]) => {
      const pWinRate = Math.round((pStats.won / pStats.played) * 100);
      const score = pStats.won * 10 + pWinRate;
      if (score > bestPartnerScore) {
        bestPartnerScore = score;
        bestPartner = {
          name: partName,
          played: pStats.played,
          won: pStats.won,
          winRate: pWinRate,
        };
      }
    });

    // Find Top Rival: most matches played against
    let topRival: PlayerCareerStats['topRival'];
    let maxRivalMatches = -1;
    Object.entries(data.rivals).forEach(([rivName, rStats]) => {
      if (rStats.played > maxRivalMatches) {
        maxRivalMatches = rStats.played;
        topRival = {
          name: rivName,
          played: rStats.played,
          won: rStats.won,
          lost: rStats.lost,
        };
      }
    });

    // Recent form: last 5 matches (reverse to get newest first)
    const recentForm = [...data.recentForm].reverse().slice(0, 5);

    return {
      rank: 0,
      name,
      played: data.played,
      won: data.won,
      lost: data.lost,
      winRate,
      pointsScored: data.pointsScored,
      pointsConceded: data.pointsConceded,
      diff,
      avgPoints,
      bestPartner,
      topRival,
      recentForm,
    };
  });

  // Sort: highest win rate, then won, then diff, then points
  list.sort((a, b) => {
    if (b.won !== a.won) return b.won - a.won;
    if (b.winRate !== a.winRate) return b.winRate - a.winRate;
    if (b.diff !== a.diff) return b.diff - a.diff;
    return b.pointsScored - a.pointsScored;
  });

  return list.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
}
