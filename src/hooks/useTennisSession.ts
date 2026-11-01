import { useState, useEffect, useMemo, useCallback } from 'react';
import { Session, Match, GameType } from '../types/tennis';
import { generateMatchesForRound, calculateStandings } from '../lib/rotation';
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
        // If it still contains dummy data, discard
        if (parsed.players?.includes('Budi Santoso')) {
          localStorage.removeItem(STORAGE_KEY);
        } else {
          return parsed;
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
    };
  });

  // Matches State
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

  const [isLoading, setIsLoading] = useState(false);

  // Save to LocalStorage whenever session or matches change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(matches));
  }, [matches]);

  // Supabase Realtime Listener (if configured)
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client || !session.id) return;

    // Listen for remote updates
    const channel = client
      .channel(`session-${session.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches', filter: `session_id=eq.${session.id}` },
        () => {
          fetchRemoteMatches(session.id);
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
      const mapped: Match[] = data.map((d: any) => ({
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
      }));
      setMatches(mapped);
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

  // 1. Lock and start session
  const lockSession = useCallback(() => {
    if (session.players.length === 0) return false;

    const round1Matches = generateMatchesForRound(
      session.id,
      1,
      session.players,
      session.gameType,
      session.courtCount,
      []
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
  }, [session]);

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
            next
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
    [session]
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

      // Update session players
      setSession((s) => ({
        ...s,
        players: s.players.map((p) => (p === oldName ? trimmedNew : p)),
      }));

      // Update in active/pending matches
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

  // 5. Edit completed match (for corrections)
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

  return {
    session,
    setSession,
    matches,
    activeMatches,
    historyMatches,
    standings,
    isLoading,
    lockSession,
    submitScore,
    updateMatchLineup,
    substitutePlayer,
    editCompletedMatch,
    resetSession,
  };
}
