import React, { useState } from 'react';
import { Match, GameType } from '../types/tennis';
import { ArrowUpDown, Check, ChevronDown, Minus, Plus, Settings2, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Avatar, EmptyState, LiveDot, Tone } from './ui';
import { BallMark } from './ui';

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

/** Name chip: shows the player, a transparent native <select> on top handles the change. */
const PlayerPick: React.FC<{
  value: string;
  tone: Tone;
  players: string[];
  allowEmpty?: boolean;
  onChange: (v: string) => void;
  onSelectPlayer?: (name: string) => void;
}> = ({ value, tone, players, allowEmpty, onChange, onSelectPlayer }) => (
  <div className="relative flex min-w-0 items-center justify-between rounded-xl py-1 pr-2 transition hover:bg-white/[0.04]">
    <div
      onClick={(e) => {
        if (value && onSelectPlayer) {
          e.stopPropagation();
          onSelectPlayer(value);
        }
      }}
      className="flex min-w-0 items-center gap-2.5 cursor-pointer group"
      title="Tap nama untuk lihat profil pemain"
    >
      <Avatar name={value} tone={tone} size="sm" />
      <span className={`truncate text-[15px] font-bold group-hover:text-ball transition ${value ? 'text-chalk' : 'text-chalk/35'}`}>
        {value || 'Pilih pemain'}
      </span>
    </div>
    <div className="relative shrink-0 flex items-center">
      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-chalk/30" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Ganti pemain"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      >
        {allowEmpty && <option value="">- Kosong -</option>}
        {players.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>
  </div>
);

interface TeamRowProps {
  label: string;
  tone: Tone;
  score: number;
  leading: boolean;
  onStep: (delta: number) => void;
  children: React.ReactNode;
}

const TeamRow: React.FC<TeamRowProps> = ({ label, tone, score, leading, onStep, children }) => {
  const isBall = tone === 'ball';
  const accent = isBall ? 'bg-ball' : 'bg-clay';
  const accentText = isBall ? 'text-ball' : 'text-clay';
  const plusBtn = isBall
    ? 'bg-ball text-ink-950 shadow-ball hover:bg-[#E4FF55]'
    : 'bg-clay text-ink-950 shadow-clay hover:bg-[#FF8D5E]';

  return (
    <div
      className={`relative flex items-center gap-3 overflow-hidden rounded-2xl border p-3 pl-5 transition-colors ${
        leading ? 'border-white/15 bg-white/[0.06]' : 'border-white/[0.06] bg-white/[0.02]'
      }`}
    >
      <span className={`absolute inset-y-0 left-0 w-1.5 ${accent}`} />

      <div className="min-w-0 flex-1">
        <p className={`eyebrow mb-0.5 !text-[10px] ${accentText}`}>{label}</p>
        {children}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={() => onStep(-1)}
          aria-label={`Kurangi skor ${label}`}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-chalk/70 transition hover:bg-white/10 active:scale-90"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span
          key={score}
          className={`num w-14 animate-pop text-center text-[56px] font-extrabold leading-none ${
            leading ? 'text-chalk' : 'text-chalk/55'
          }`}
        >
          {score}
        </span>
        <button
          onClick={() => onStep(1)}
          aria-label={`Tambah skor ${label}`}
          className={`flex h-14 w-14 items-center justify-center rounded-2xl transition active:scale-90 ${plusBtn}`}
        >
          <Plus className="h-6 w-6" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

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

  const getScore = (matchId: string) => scores[matchId] || { a: 0, b: 0 };

  const updateScore = (matchId: string, team: 'a' | 'b', delta: number) => {
    setScores((prev) => {
      const current = prev[matchId] || { a: 0, b: 0 };
      return {
        ...prev,
        [matchId]: { ...current, [team]: Math.max(0, current[team] + delta) },
      };
    });
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
      particleCount: 70,
      spread: 75,
      origin: { y: 0.75 },
      colors: ['#D8F53B', '#FF7A45', '#F1F5EC', '#B6D12C'],
    });

    onSubmitScore(match.id, sc.a, sc.b);

    setScores((prev) => {
      const copy = { ...prev };
      delete copy[match.id];
      return copy;
    });
  };

  if (!isSessionActive) {
    return (
      <EmptyState
        icon={<BallMark className="h-10 w-10" />}
        title="Belum ada sesi berjalan"
        body="Isi nama pemain di Setup, lalu kunci sesi. Jadwal rotasi lapangan dibuat otomatis."
        action={
          <button onClick={onOpenSetup} className="btn-primary mx-auto">
            <Settings2 className="h-4 w-4" />
            <span>Buka Setup</span>
          </button>
        }
      />
    );
  }

  const isDouble = gameType === 'Double';

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between px-1">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <LiveDot />
            <span className="eyebrow !text-ball">Sedang berlangsung</span>
          </div>
          <h2 className="font-display text-4xl font-extrabold leading-none tracking-tight">
            Ronde <span className="text-ball">{currentRound}</span>
          </h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-bold text-chalk/70">
          {activeMatches.length} court aktif
        </span>
      </div>

      <div className={`grid grid-cols-1 gap-5 ${activeMatches.length > 1 ? 'lg:grid-cols-2' : ''}`}>
        {activeMatches.map((m, i) => {
          const sc = getScore(m.id);
          const aLeads = sc.a > sc.b;
          const bLeads = sc.b > sc.a;

          return (
            <article
              key={m.id}
              style={{ animationDelay: `${i * 70}ms` }}
              className="card animate-fade-up space-y-3 p-4 sm:p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 items-center rounded-xl bg-chalk px-3 font-display text-sm font-extrabold tracking-tight text-ink-950">
                    Court {m.court}
                  </span>
                  <span className="eyebrow">{isDouble ? 'Ganda' : 'Tunggal'}</span>
                </div>
                <button
                  onClick={() => handleSwapTeams(m)}
                  title="Tukar posisi Tim A dan Tim B"
                  className="btn-ghost !rounded-xl !px-3 !py-2 !text-xs"
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <span>Tukar sisi</span>
                </button>
              </div>

              <TeamRow
                label="Tim A"
                tone="ball"
                score={sc.a}
                leading={aLeads}
                onStep={(d) => updateScore(m.id, 'a', d)}
              >
                <PlayerPick
                  value={m.teamA1}
                  tone="ball"
                  players={allPlayers}
                  onSelectPlayer={onSelectPlayer}
                  onChange={(v) => {
                    if (!isHostUnlocked) {
                      onRequestUnlockHost();
                      return;
                    }
                    onUpdateLineup(m.id, v, m.teamA2, m.teamB1, m.teamB2);
                  }}
                />
                {isDouble && (
                  <PlayerPick
                    value={m.teamA2}
                    tone="ball"
                    players={allPlayers}
                    allowEmpty
                    onSelectPlayer={onSelectPlayer}
                    onChange={(v) => {
                      if (!isHostUnlocked) {
                        onRequestUnlockHost();
                        return;
                      }
                      onUpdateLineup(m.id, m.teamA1, v, m.teamB1, m.teamB2);
                    }}
                  />
                )}
              </TeamRow>

              <TeamRow
                label="Tim B"
                tone="clay"
                score={sc.b}
                leading={bLeads}
                onStep={(d) => updateScore(m.id, 'b', d)}
              >
                <PlayerPick
                  value={m.teamB1}
                  tone="clay"
                  players={allPlayers}
                  onSelectPlayer={onSelectPlayer}
                  onChange={(v) => {
                    if (!isHostUnlocked) {
                      onRequestUnlockHost();
                      return;
                    }
                    onUpdateLineup(m.id, m.teamA1, m.teamA2, v, m.teamB2);
                  }}
                />
                {isDouble && (
                  <PlayerPick
                    value={m.teamB2}
                    tone="clay"
                    players={allPlayers}
                    allowEmpty
                    onSelectPlayer={onSelectPlayer}
                    onChange={(v) => {
                      if (!isHostUnlocked) {
                        onRequestUnlockHost();
                        return;
                      }
                      onUpdateLineup(m.id, m.teamA1, m.teamA2, m.teamB1, v);
                    }}
                  />
                )}
              </TeamRow>

              <button onClick={() => handleSubmit(m)} className="btn-primary w-full !py-4">
                {!isHostUnlocked ? (
                  <>
                    <Lock className="h-5 w-5" />
                    <span>Buka PIN Host untuk Simpan Skor</span>
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" strokeWidth={3} />
                    <span>Selesai &middot; Simpan skor {sc.a} - {sc.b}</span>
                  </>
                )}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
};
