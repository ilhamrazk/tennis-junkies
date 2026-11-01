import React, { useState } from 'react';
import { Match, GameType } from '../types/tennis';
import { ArrowLeftRight, CheckCircle2, Plus, Minus, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActiveMatchesProps {
  currentRound: number;
  activeMatches: Match[];
  allPlayers: string[];
  gameType: GameType;
  isHostUnlocked: boolean;
  onRequestUnlockHost: () => void;
  onSubmitScore: (matchId: string, scoreA: number, scoreB: number) => void;
  onUpdateLineup: (matchId: string, pA1: string, pA2: string, pB1: string, pB2: string) => void;
  onOpenSetup: () => void;
  onSelectPlayer: (name: string) => void;
  isSessionActive: boolean;
}

export const ActiveMatches: React.FC<ActiveMatchesProps> = ({
  currentRound,
  activeMatches,
  allPlayers,
  gameType,
  isHostUnlocked,
  onRequestUnlockHost,
  onSubmitScore,
  onUpdateLineup,
  onOpenSetup,
  onSelectPlayer,
  isSessionActive,
}) => {
  const [scores, setScores] = useState<Record<string, { a: number; b: number }>>({});

  const getScore = (matchId: string) => {
    return scores[matchId] || { a: 0, b: 0 };
  };

  const updateScore = (matchId: string, team: 'a' | 'b', delta: number) => {
    setScores((prev) => {
      const current = prev[matchId] || { a: 0, b: 0 };
      const nextVal = Math.max(0, current[team] + delta);
      return {
        ...prev,
        [matchId]: {
          ...current,
          [team]: nextVal,
        },
      };
    });
  };

  const setExactScore = (matchId: string, team: 'a' | 'b', val: string) => {
    const num = parseInt(val) || 0;
    setScores((prev) => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] || { a: 0, b: 0 }),
        [team]: Math.max(0, num),
      },
    }));
  };

  const handleSwapTeams = (m: Match) => {
    if (!isHostUnlocked) {
      onRequestUnlockHost();
      return;
    }
    onUpdateLineup(m.id, m.teamB1, m.teamB2, m.teamA1, m.teamA2);
  };

  const handleSubmit = (match: Match) => {
    if (!isHostUnlocked) {
      onRequestUnlockHost();
      return;
    }

    const sc = getScore(match.id);

    if (sc.a === 0 && sc.b === 0) {
      if (!confirm('Skor masih 0 - 0. Apakah Anda yakin ingin submit skor ini?')) {
        return;
      }
    }

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#FF6B00', '#10B981', '#F59E0B', '#3B82F6'],
    });

    onSubmitScore(match.id, sc.a, sc.b);

    setScores((prev) => {
      const copy = { ...prev };
      delete copy[match.id];
      return copy;
    });
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  if (!isSessionActive) {
    return (
      <div className="bg-white p-8 sm:p-12 rounded-3xl text-center space-y-5 max-w-xl mx-auto border-2 border-slate-200 shadow-card">
        <div className="w-16 h-16 rounded-3xl bg-orange-50 border-2 border-orange-200 flex items-center justify-center text-3xl mx-auto text-brand-orange shadow-sm">
          🎾
        </div>
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">Sesi Mabar Belum Dimulai</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Silakan lengkapi nama pemain di menu Setup, lalu kunci sesi untuk membuat rotasi jadwal pertandingan otomatis.
          </p>
        </div>
        <button
          onClick={onOpenSetup}
          className="btn-primary py-3.5 px-8 text-sm inline-flex items-center gap-2 shadow-brand"
        >
          <span>Buka Setup Sesi</span>
        </button>
      </div>
    );
  }

  const isDouble = gameType === 'Double';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Subheader info bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-wide flex items-center gap-2">
            <span>Pertandingan Berjalan</span>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-brand-orange text-white">
              ROUND {currentRound}
            </span>
          </h2>
        </div>

        <span className="text-xs font-black px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
          {activeMatches.length} Court Aktif
        </span>
      </div>

      {/* Courts Cards */}
      <div className="grid grid-cols-1 gap-6">
        {activeMatches.map((m) => {
          const sc = getScore(m.id);

          return (
            <div
              key={m.id}
              className="bg-white rounded-3xl p-5 sm:p-7 shadow-card space-y-6 border-2 border-slate-200 hover:border-orange-300 transition-colors"
            >
              {/* Card Header: Court Badge & Swap teams button */}
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="bg-slate-900 text-white font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-xl uppercase tracking-wider shadow-sm">
                    COURT {m.court}
                  </span>
                  <span className="text-xs font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {isDouble ? 'Ganda (Double)' : 'Tunggal (Single)'}
                  </span>
                </div>

                <button
                  onClick={() => handleSwapTeams(m)}
                  className="flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-brand-orange bg-slate-50 hover:bg-orange-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-orange-200 transition active:scale-95"
                  title="Tukar posisi Tim A dan Tim B"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tukar Sisi</span>
                </button>
              </div>

              {/* Match Scoreboard Body */}
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                {/* TEAM A (Left) */}
                <div className="md:col-span-3 space-y-3 bg-orange-50/70 p-4 sm:p-5 rounded-2xl border-2 border-orange-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-black uppercase tracking-widest text-brand-orange">
                      TIM A
                    </span>
                  </div>

                  {/* Player A1 */}
                  <div className="flex items-center gap-2">
                    <div
                      onClick={() => onSelectPlayer(m.teamA1)}
                      className="w-8 h-8 rounded-xl bg-brand-orange text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs cursor-pointer hover:scale-105 transition"
                      title="Lihat Profil Pemain"
                    >
                      {getInitials(m.teamA1)}
                    </div>
                    <select
                      value={m.teamA1}
                      onChange={(e) => {
                        if (!isHostUnlocked) {
                          onRequestUnlockHost();
                          return;
                        }
                        onUpdateLineup(m.id, e.target.value, m.teamA2, m.teamB1, m.teamB2);
                      }}
                      className="bg-white border-2 border-orange-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-black text-slate-900 flex-1 focus:outline-none focus:border-brand-orange shadow-xs"
                    >
                      {allPlayers.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Player A2 (If Double) */}
                  {isDouble && (
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => m.teamA2 && onSelectPlayer(m.teamA2)}
                        className="w-8 h-8 rounded-xl bg-brand-orange text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs cursor-pointer hover:scale-105 transition"
                        title="Lihat Profil Pemain"
                      >
                        {getInitials(m.teamA2)}
                      </div>
                      <select
                        value={m.teamA2}
                        onChange={(e) => {
                          if (!isHostUnlocked) {
                            onRequestUnlockHost();
                            return;
                          }
                          onUpdateLineup(m.id, m.teamA1, e.target.value, m.teamB1, m.teamB2);
                        }}
                        className="bg-white border-2 border-orange-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-black text-slate-900 flex-1 focus:outline-none focus:border-brand-orange shadow-xs"
                      >
                        <option value="">- Kosong -</option>
                        {allPlayers.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Score Stepper Counter A */}
                  <div className="pt-2 flex items-center justify-between border-t border-orange-200">
                    <span className="text-xs font-black text-slate-600">Skor Game</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateScore(m.id, 'a', -1)}
                        className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 text-slate-800 flex items-center justify-center active:scale-90 transition border-2 border-slate-300 font-black shadow-xs"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={sc.a}
                        onChange={(e) => setExactScore(m.id, 'a', e.target.value)}
                        className="w-14 h-11 rounded-xl bg-white border-2 border-brand-orange text-center font-black text-2xl text-brand-orange focus:outline-none shadow-sm"
                      />
                      <button
                        onClick={() => updateScore(m.id, 'a', 1)}
                        className="w-10 h-10 rounded-xl bg-brand-orange hover:bg-orange-600 text-white flex items-center justify-center active:scale-90 transition font-black shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* VS Divider (Center) */}
                <div className="md:col-span-1 flex items-center justify-center my-1 md:my-0">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center font-black text-xs text-slate-600 shadow-xs">
                    VS
                  </div>
                </div>

                {/* TEAM B (Right) */}
                <div className="md:col-span-3 space-y-3 bg-emerald-50/70 p-4 sm:p-5 rounded-2xl border-2 border-emerald-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-black uppercase tracking-widest text-emerald-800">
                      TIM B
                    </span>
                  </div>

                  {/* Player B1 */}
                  <div className="flex items-center gap-2">
                    <div
                      onClick={() => onSelectPlayer(m.teamB1)}
                      className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs cursor-pointer hover:scale-105 transition"
                      title="Lihat Profil Pemain"
                    >
                      {getInitials(m.teamB1)}
                    </div>
                    <select
                      value={m.teamB1}
                      onChange={(e) => {
                        if (!isHostUnlocked) {
                          onRequestUnlockHost();
                          return;
                        }
                        onUpdateLineup(m.id, m.teamA1, m.teamA2, e.target.value, m.teamB2);
                      }}
                      className="bg-white border-2 border-emerald-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-black text-slate-900 flex-1 focus:outline-none focus:border-emerald-600 shadow-xs"
                    >
                      {allPlayers.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Player B2 (If Double) */}
                  {isDouble && (
                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => m.teamB2 && onSelectPlayer(m.teamB2)}
                        className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs cursor-pointer hover:scale-105 transition"
                        title="Lihat Profil Pemain"
                      >
                        {getInitials(m.teamB2)}
                      </div>
                      <select
                        value={m.teamB2}
                        onChange={(e) => {
                          if (!isHostUnlocked) {
                            onRequestUnlockHost();
                            return;
                          }
                          onUpdateLineup(m.id, m.teamA1, m.teamA2, m.teamB1, e.target.value);
                        }}
                        className="bg-white border-2 border-emerald-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-black text-slate-900 flex-1 focus:outline-none focus:border-emerald-600 shadow-xs"
                      >
                        <option value="">- Kosong -</option>
                        {allPlayers.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Score Stepper Counter B */}
                  <div className="pt-2 flex items-center justify-between border-t border-emerald-200">
                    <span className="text-xs font-black text-slate-600">Skor Game</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateScore(m.id, 'b', -1)}
                        className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 text-slate-800 flex items-center justify-center active:scale-90 transition border-2 border-slate-300 font-black shadow-xs"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={sc.b}
                        onChange={(e) => setExactScore(m.id, 'b', e.target.value)}
                        className="w-14 h-11 rounded-xl bg-white border-2 border-emerald-600 text-center font-black text-2xl text-emerald-700 focus:outline-none shadow-sm"
                      />
                      <button
                        onClick={() => updateScore(m.id, 'b', 1)}
                        className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center active:scale-90 transition font-black shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={() => handleSubmit(m)}
                className="w-full btn-primary py-4 text-xs sm:text-sm flex items-center justify-center gap-2 tracking-wider shadow-brand"
              >
                {!isHostUnlocked ? (
                  <>
                    <Lock className="w-5 h-5 text-white" />
                    <span>BUKA PIN HOST UNTUK SUBMIT SKOR</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>SUBMIT SKOR COURT {m.court} ({sc.a} - {sc.b})</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
