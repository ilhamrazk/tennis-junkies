import { useState, useEffect, useMemo, useCallback } from 'react';
import { Session, Match, GameType, ArchivedSession, MatchmakingMode, PlayerCareerStats } from '../types/tennis';
import { generateMatchesForRound, calculateStandings, calculateAllTimeStats } from '../lib/rotation';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'tennis_junkies_session_clean';
const MATCHES_STORAGE_KEY = 'tennis_junkies_matches_clean';

// Automatically purge legacy dummy data from previous runs
try {
  localStorage.removeItem('tennis_junkies_active_session');
  localStorage.removeItem('tennis_junkies_matches');
} catch (e) {
  // ignore
}

export function useTennisSession() {
  // Session State
  const [session, setSession] = useState<Session>(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.players?.includes('Budi Santoso')) {
          localStorage.removeItem(STORAGE_KEY);
        } else {
          return {
            matchmakingMode: 'fair',
            hostPin: '1234',
            ...parsed,
          };
        }
      } catch (e) {
        console.error(e);
      }
    }
    return {
      id: `session-${Date.now()}`,
      eventTitle: 'Tennis Junkies Beginner Game',
      hostName: '',
      gameType: 'Double' as GameType,
      courtCount: 2,
      currentRound: 1,
      status: 'draft',
      players: [],
      createdAt: new Date().toISOString(),
      matchmakingMode: 'fair',
      hostPin: '1234',
    };
  });

  // Matches State for Current Session
  const [matches, setMatches] = useState<Match[]>(() => {
    const cached = localStorage.getItem(MATCHES_STORAGE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  // All-time Matches across all sessions (for career stats)
  const [allTimeMatches, setAllTimeMatches] = useState<Match[]>([]);
  // Archive of past sessions
  const [archivedSessions, setArchivedSessions] = useState<ArchivedSession[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isArchiveLoading, setIsArchiveLoading] = useState(false);

  // Host PIN authorization state
  const [isHostUnlocked, setIsHostUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(`host_unlocked_${session.id}`) === 'true';
    } catch {
      return false;
    }
  });

  const unlockHost = useCallback((pin: string): boolean => {
    const targetPin = session.hostPin || '1234';
    if (pin === targetPin) {
      setIsHostUnlocked(true);
      try {
        sessionStorage.setItem(`host_unlocked_${session.id}`, 'true');
      } catch {}
      return true;
    }
    return false;
  }, [session.id, session.hostPin]);

  const lockHost = useCallback(() => {
    setIsHostUnlocked(false);
    try {
      sessionStorage.removeItem(`host_unlocked_${session.id}`);
    } catch {}
  }, [session.id]);

  // Save to LocalStorage whenever session or matches change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(matches));
  }, [matches]);

  // 1. Initial Load from Supabase on App Startup
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    const loadLatestFromCloud = async () => {
      setIsLoading(true);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const targetSessionId = urlParams.get('session');

        let sessionQuery = client
          .from('sessions')
          .select('*')
          .order('created_at', { ascending: false });

        if (targetSessionId) {
          sessionQuery = sessionQuery.eq('id', targetSessionId);
        }

        const { data: sessions, error: sErr } = await sessionQuery.limit(1);

        if (sErr || !sessions || sessions.length === 0) {
          setIsLoading(false);
          return;
        }

        const latest = sessions[0];
        await loadSessionMatches(latest);
      } catch (err) {
        console.warn('Failed to load latest session from cloud:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLatestFromCloud();
    loadAllCloudData();
  }, []);

  // Helper to load matches and populate state for a given session
  const loadSessionMatches = async (remoteSession: any) => {
    const client = supabase;
    if (!client) return;

    const { data: remoteMatches } = await client
      .from('matches')
      .select('*')
      .eq('session_id', remoteSession.id)
      .order('round', { ascending: true })
      .order('court', { ascending: true });

    const regularMatches: Match[] = [];
    const playerSet = new Set<string>();

    (remoteMatches || []).forEach((d: any) => {
      // Check if this row is an RSVP check-in row (round === 0)
      if (d.round === 0 && d.team_b1 === '__RSVP__') {
        if (d.team_a1) playerSet.add(d.team_a1);
      } else {
        regularMatches.push({
          id: d.id,
          sessionId: d.session_id,
          round: d.round,
          court: d.court,
          teamA1: d.team_a1,
          teamA2: d.team_a2 || '',
          teamB1: d.team_b1,
          teamB2: d.team_b2 || '',
          scoreA: d.score_a,
          scoreB: d.score_b,
          isCompleted: d.status === 'completed',
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        });

        [d.team_a1, d.team_a2, d.team_b1, d.team_b2].filter(Boolean).forEach((p) => playerSet.add(p));
      }
    });

    const restoredPlayers = Array.from(playerSet);

    setSession((prev) => ({
      ...prev,
      id: remoteSession.id,
      eventTitle: remoteSession.event_title,
      hostName: remoteSession.host_name,
      gameType: remoteSession.game_type,
      courtCount: remoteSession.court_count,
      currentRound: remoteSession.current_round,
      status: remoteSession.status,
      players: restoredPlayers.length > 0 ? restoredPlayers : prev.players,
      createdAt: remoteSession.created_at,
    }));

    setMatches(regularMatches);
  };

  // Load all matches and sessions to build All-Time Leaderboard and Archive
  const loadAllCloudData = async () => {
    const client = supabase;
    if (!client) return;
    setIsArchiveLoading(true);

    try {
      // 1. Fetch all completed matches
      const { data: allM } = await client
        .from('matches')
        .select('*')
        .eq('status', 'completed')
        .gt('round', 0);

      if (allM) {
        const mappedAll: Match[] = allM.map((d: any) => ({
          id: d.id,
          sessionId: d.session_id,
          round: d.round,
          court: d.court,
          teamA1: d.team_a1,
          teamA2: d.team_a2 || '',
          teamB1: d.team_b1,
          teamB2: d.team_b2 || '',
          scoreA: d.score_a,
          scoreB: d.score_b,
          isCompleted: true,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
        setAllTimeMatches(mappedAll);
      }

      // 2. Fetch all sessions
      const { data: allS } = await client
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (allS) {
        const matchesBySession: Record<string, Match[]> = {};
        if (allM) {
          allM.forEach((d: any) => {
            if (!matchesBySession[d.session_id]) matchesBySession[d.session_id] = [];
            matchesBySession[d.session_id].push({
              id: d.id,
              sessionId: d.session_id,
              round: d.round,
              court: d.court,
              teamA1: d.team_a1,
              teamA2: d.team_a2 || '',
              teamB1: d.team_b1,
              teamB2: d.team_b2 || '',
              scoreA: d.score_a,
              scoreB: d.score_b,
              isCompleted: d.status === 'completed',
              createdAt: d.created_at,
            });
          });
        }

        const archives: ArchivedSession[] = allS.map((s: any) => {
          const sessMatches = matchesBySession[s.id] || [];
          const players = new Set<string>();
          sessMatches.forEach((m) => {
            [m.teamA1, m.teamA2, m.teamB1, m.teamB2].filter(Boolean).forEach((p) => players.add(p));
          });
          const sessionStandings = calculateStandings(Array.from(players), sessMatches);
          const podium = sessionStandings.slice(0, 3).map((st) => ({
            place: st.rank,
            name: st.name,
            points: st.points,
          }));

          return {
            id: s.id,
            eventTitle: s.event_title,
            hostName: s.host_name,
            gameType: s.game_type,
            courtCount: s.court_count,
            currentRound: s.current_round,
            status: s.status,
            createdAt: s.created_at,
            matchCount: sessMatches.length,
            podium,
          };
        });

        setArchivedSessions(archives);
      }
    } catch (e) {
      console.warn('Load cloud archives warning:', e);
    } finally {
      setIsArchiveLoading(false);
    }
  };

  // Switch to an archived session
  const switchSession = useCallback(
    async (sessionId: string) => {
      const client = supabase;
      if (!client) return;
      setIsLoading(true);
      try {
        const { data: sData } = await client
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sData) {
          await loadSessionMatches(sData);
          // Update URL query param cleanly
          const url = new URL(window.location.href);
          url.searchParams.set('session', sessionId);
          window.history.replaceState({}, '', url.toString());
        }
      } catch (e) {
        console.error('Failed to switch session:', e);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 2. Supabase Realtime Listener (for live websocket updates)
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client || !session.id) return;

    const channel = client
      .channel(`session-${session.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches', filter: `session_id=eq.${session.id}` },
        () => {
          fetchRemoteMatches(session.id);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions', filter: `id=eq.${session.id}` },
        (payload: any) => {
          if (payload.new) {
            setSession((prev) => ({
              ...prev,
              currentRound: payload.new.current_round ?? prev.currentRound,
              status: payload.new.status ?? prev.status,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [session.id]);

  const fetchRemoteMatches = async (sessionId: string) => {
    const client = supabase;
    if (!client) return;
    const { data } = await client
      .from('matches')
      .select('*')
      .eq('session_id', sessionId)
      .order('round', { ascending: true })
      .order('court', { ascending: true });

    if (data && data.length > 0) {
      const regularMatches: Match[] = [];
      const playerSet = new Set<string>();

      data.forEach((d: any) => {
        if (d.round === 0 && d.team_b1 === '__RSVP__') {
          if (d.team_a1) playerSet.add(d.team_a1);
        } else {
          regularMatches.push({
            id: d.id,
            sessionId: d.session_id,
            round: d.round,
            court: d.court,
            teamA1: d.team_a1,
            teamA2: d.team_a2 || '',
            teamB1: d.team_b1,
            teamB2: d.team_b2 || '',
            scoreA: d.score_a,
            scoreB: d.score_b,
            isCompleted: d.status === 'completed',
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          });

          [d.team_a1, d.team_a2, d.team_b1, d.team_b2].filter(Boolean).forEach((p) => playerSet.add(p));
        }
      });

      if (playerSet.size > 0) {
        setSession((prev) => ({
          ...prev,
          players: Array.from(new Set([...prev.players, ...Array.from(playerSet)])),
        }));
      }

      setMatches(regularMatches);
    }
  };

  // Sync Session to Cloud
  const syncSessionToCloud = async (sess: Session) => {
    const client = supabase;
    if (!client) return;
    try {
      await client.from('sessions').upsert({
        id: sess.id,
        event_title: sess.eventTitle,
        host_name: sess.hostName,
        game_type: sess.gameType,
        court_count: sess.courtCount,
        current_round: sess.currentRound,
        status: sess.status,
      });
    } catch (e) {
      console.warn('Sync session to cloud warning:', e);
    }
  };

  // Sync Match to Cloud
  const syncMatchToCloud = async (match: Match) => {
    const client = supabase;
    if (!client) return;
    try {
      await client.from('matches').upsert({
        id: match.id,
        session_id: match.sessionId,
        round: match.round,
        court: match.court,
        team_a1: match.teamA1,
        team_a2: match.teamA2,
        team_b1: match.teamB1,
        team_b2: match.teamB2,
        score_a: match.scoreA,
        score_b: match.scoreB,
        status: match.isCompleted ? 'completed' : 'pending',
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Sync match to cloud warning:', e);
    }
  };

  // Register a player via RSVP (Self Check-in)
  const registerRsvp = useCallback(
    async (playerName: string): Promise<boolean> => {
      const trimmed = playerName.trim();
      if (!trimmed) return false;

      // Update local session players
      setSession((s) => {
        if (s.players.includes(trimmed)) return s;
        return {
          ...s,
          players: [...s.players, trimmed],
        };
      });

      // Sync session to cloud
      syncSessionToCloud(session);

      // Record in matches table as round 0 (RSVP record) for cloud persistence and realtime sync
      const client = supabase;
      if (client) {
        try {
          const rsvpId = `rsvp-${session.id}-${Date.now()}`;
          await client.from('matches').insert({
            id: rsvpId,
            session_id: session.id,
            round: 0,
            court: 0,
            team_a1: trimmed,
            team_a2: '',
            team_b1: '__RSVP__',
            team_b2: '',
            status: 'pending',
          });
        } catch (e) {
          console.warn('RSVP cloud write notice:', e);
        }
      }

      return true;
    },
    [session]
  );

  // Compute player skill ratings for Smart Balanced matchmaking
  const playerRatings = useMemo(() => {
    const ratings: Record<string, number> = {};
    const sessionStandings = calculateStandings(session.players, matches);
    sessionStandings.forEach((s) => {
      ratings[s.name] = (s.points * 5) + (s.won * 20);
    });
    // Add all-time ratings if available
    const career = calculateAllTimeStats(allTimeMatches);
    career.forEach((c) => {
      ratings[c.name] = (ratings[c.name] ?? 50) + c.winRate;
    });
    return ratings;
  }, [session.players, matches, allTimeMatches]);

  // 1. Lock and start session
  const lockSession = useCallback(() => {
    if (session.players.length === 0) return false;

    const round1Matches = generateMatchesForRound(
      session.id,
      1,
      session.players,
      session.gameType,
      session.courtCount,
      [],
      session.matchmakingMode || 'fair',
      playerRatings
    );

    const updatedSession: Session = {
      ...session,
      status: 'active',
      currentRound: 1,
    };

    setSession(updatedSession);
    setMatches(round1Matches);

    // Sync session first so foreign key constraint in matches table is satisfied
    syncSessionToCloud(updatedSession).then(() => {
      round1Matches.forEach((m) => syncMatchToCloud(m));
    });

    return true;
  }, [session, playerRatings]);

  // 2. Submit Score for a court match
  const submitScore = useCallback(
    (matchId: string, scoreA: number, scoreB: number) => {
      setMatches((prev) => {
        const next = prev.map((m) => {
          if (m.id === matchId) {
            const updated: Match = {
              ...m,
              scoreA,
              scoreB,
              isCompleted: true,
              updatedAt: new Date().toISOString(),
            };
            syncMatchToCloud(updated);
            // Also append to allTimeMatches for immediate career stats recalculation
            setAllTimeMatches((prevAll) => {
              const filtered = prevAll.filter((a) => a.id !== updated.id);
              return [...filtered, updated];
            });
            return updated;
          }
          return m;
        });

        // Check if all matches in the current round are completed
        const currentRoundMatches = next.filter((m) => m.round === session.currentRound);
        const allCompleted = currentRoundMatches.every((m) => m.isCompleted);

        if (allCompleted && currentRoundMatches.length > 0) {
          // Generate next round automatically
          const nextRoundNum = session.currentRound + 1;
          const nextRoundMatches = generateMatchesForRound(
            session.id,
            nextRoundNum,
            session.players,
            session.gameType,
            session.courtCount,
            next,
            session.matchmakingMode || 'fair',
            playerRatings
          );

          if (nextRoundMatches.length > 0) {
            setSession((s) => {
              const updated = { ...s, currentRound: nextRoundNum };
              syncSessionToCloud(updated);
              return updated;
            });
            nextRoundMatches.forEach((m) => syncMatchToCloud(m));
            return [...next, ...nextRoundMatches];
          }
        }

        return next;
      });
    },
    [session, playerRatings]
  );

  // 3. Live swap players inside an active match
  const updateMatchLineup = useCallback(
    (matchId: string, pA1: string, pA2: string, pB1: string, pB2: string) => {
      setMatches((prev) =>
        prev.map((m) => {
          if (m.id === matchId) {
            const updated = {
              ...m,
              teamA1: pA1,
              teamA2: pA2,
              teamB1: pB1,
              teamB2: pB2,
              updatedAt: new Date().toISOString(),
            };
            syncMatchToCloud(updated);
            return updated;
          }
          return m;
        })
      );
    },
    []
  );

  // 4. Substitute Player Name
  const substitutePlayer = useCallback(
    (oldName: string, newName: string) => {
      if (!newName.trim() || oldName === newName) return;

      const trimmedNew = newName.trim();

      setSession((s) => ({
        ...s,
        players: s.players.map((p) => (p === oldName ? trimmedNew : p)),
      }));

      setMatches((prev) =>
        prev.map((m) => {
          let changed = false;
          const updated = { ...m };
          if (updated.teamA1 === oldName) {
            updated.teamA1 = trimmedNew;
            changed = true;
          }
          if (updated.teamA2 === oldName) {
            updated.teamA2 = trimmedNew;
            changed = true;
          }
          if (updated.teamB1 === oldName) {
            updated.teamB1 = trimmedNew;
            changed = true;
          }
          if (updated.teamB2 === oldName) {
            updated.teamB2 = trimmedNew;
            changed = true;
          }
          if (changed) {
            syncMatchToCloud(updated);
          }
          return updated;
        })
      );
    },
    []
  );

  // 5. Edit completed match
  const editCompletedMatch = useCallback(
    (
      matchId: string,
      pA1: string,
      pA2: string,
      pB1: string,
      pB2: string,
      newScoreA: number,
      newScoreB: number
    ) => {
      setMatches((prev) =>
        prev.map((m) => {
          if (m.id === matchId) {
            const updated: Match = {
              ...m,
              teamA1: pA1,
              teamA2: pA2,
              teamB1: pB1,
              teamB2: pB2,
              scoreA: newScoreA,
              scoreB: newScoreB,
              isCompleted: true,
              updatedAt: new Date().toISOString(),
            };
            syncMatchToCloud(updated);
            return updated;
          }
          return m;
        })
      );
    },
    []
  );

  // 6. Reset Session
  const resetSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MATCHES_STORAGE_KEY);
    localStorage.removeItem('tennis_junkies_active_session');
    localStorage.removeItem('tennis_junkies_matches');
    setSession({
      id: `session-${Date.now()}`,
      eventTitle: 'Tennis Junkies Beginner Game',
      hostName: '',
      gameType: 'Double',
      courtCount: 2,
      currentRound: 1,
      status: 'draft',
      players: [],
      createdAt: new Date().toISOString(),
      matchmakingMode: 'fair',
      hostPin: '1234',
    });
    setMatches([]);
  }, []);

  // Computed Properties
  const activeMatches = useMemo(() => {
    return matches.filter((m) => m.round === session.currentRound && !m.isCompleted);
  }, [matches, session.currentRound]);

  const historyMatches = useMemo(() => {
    return matches
      .filter((m) => m.isCompleted)
      .sort((a, b) => b.round - a.round || b.court - a.court);
  }, [matches]);

  const standings = useMemo(() => {
    return calculateStandings(session.players, matches);
  }, [session.players, matches]);

  // Combined all completed matches (current session + cloud history)
  const combinedAllMatches = useMemo(() => {
    const idMap = new Map<string, Match>();
    allTimeMatches.forEach((m) => idMap.set(m.id, m));
    matches.filter((m) => m.isCompleted).forEach((m) => idMap.set(m.id, m));
    return Array.from(idMap.values());
  }, [allTimeMatches, matches]);

  const allTimeStats = useMemo(() => {
    return calculateAllTimeStats(combinedAllMatches);
  }, [combinedAllMatches]);

  return {
    session,
    setSession,
    matches,
    activeMatches,
    historyMatches,
    standings,
    allTimeStats,
    archivedSessions,
    isArchiveLoading,
    refreshArchive: loadAllCloudData,
    switchSession,
    registerRsvp,
    isLoading,
    isHostUnlocked,
    unlockHost,
    lockHost,
    lockSession,
    submitScore,
    updateMatchLineup,
    substitutePlayer,
    editCompletedMatch,
    resetSession,
  };
}
