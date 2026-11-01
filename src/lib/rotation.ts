import { Match, GameType } from '../types/tennis';

/**
 * Generate match assignments for the next round.
 * Uses a greedy fair-rotation strategy:
 * 1. Prioritize players with fewest matches played.
 * 2. Pair partners who have partnered the least.
 * 3. Match against opponents faced the least.
 */
export function generateMatchesForRound(
  sessionId: string,
  round: number,
  players: string[],
  gameType: GameType,
  courtCount: number,
  pastMatches: Match[]
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

  // Sort players: least matches played first, with subtle randomization to prevent deterministic lock
  const pool = [...players].sort((a, b) => {
    const diff = playCounts[a] - playCounts[b];
    if (diff !== 0) return diff;
    return Math.random() - 0.5;
  });

  // Select top N players for this round
  const selectedPlayers = pool.slice(0, activeCourts * playersNeededPerCourt);

  const matches: Match[] = [];

  if (gameType === 'Single') {
    // Pair up 2 by 2
    for (let c = 1; c <= activeCourts; c++) {
      const idx = (c - 1) * 2;
      const p1 = selectedPlayers[idx];
      const p2 = selectedPlayers[idx + 1];

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
    // Group into courts and find pairings with lowest past partner counts
    for (let c = 1; c <= activeCourts; c++) {
      const courtPlayers = selectedPlayers.slice((c - 1) * 4, c * 4);

      // We have 4 players: A, B, C, D
      // 3 possible pairings:
      // Option 1: (A, B) vs (C, D)
      // Option 2: (A, C) vs (B, D)
      // Option 3: (A, D) vs (B, C)
      const [pA, pB, pC, pD] = courtPlayers;

      const cost1 = (partnerCounts[pA]?.[pB] || 0) + (partnerCounts[pC]?.[pD] || 0);
      const cost2 = (partnerCounts[pA]?.[pC] || 0) + (partnerCounts[pB]?.[pD] || 0);
      const cost3 = (partnerCounts[pA]?.[pD] || 0) + (partnerCounts[pB]?.[pC] || 0);

      let teamA1 = pA;
      let teamA2 = pB;
      let teamB1 = pC;
      let teamB2 = pD;

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
 * Calculate Leaderboard Standings based on completed matches.
 */
export function calculateStandings(players: string[], matches: Match[]) {
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
        map[p].diff += (sA - sB);
        if (aWon) map[p].won += 1;
        else if (bWon) map[p].lost += 1;
      });

      teamB.forEach((p) => {
        if (!map[p]) map[p] = { played: 0, won: 0, lost: 0, points: 0, diff: 0 };
        map[p].played += 1;
        map[p].points += sB;
        map[p].diff += (sB - sA);
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

