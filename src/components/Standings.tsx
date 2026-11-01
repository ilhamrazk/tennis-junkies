import React, { useState } from 'react';
import { PlayerStanding, PlayerCareerStats } from '../types/tennis';
import { Trophy, Share2, Crown, Flame, Users, ChevronRight } from 'lucide-react';
import { Avatar, EmptyState } from './ui';

interface StandingsProps {
  standings: PlayerStanding[];
  allTimeStats?: PlayerCareerStats[];
  onOpenShare: () => void;
  onSelectPlayer: (name: string) => void;
}

export const StandingsTable: React.FC<{
  standings: PlayerStanding[];
  onSelectPlayer?: (name: string) => void;
}> = ({ standings, onSelectPlayer }) => (
  <div className="card overflow-hidden">
    <div className="grid grid-cols-[2rem_1fr_2rem_2rem_2rem_3.25rem] items-center gap-2 border-b border-white/[0.06] px-4 py-3 sm:grid-cols-[2.5rem_1fr_3rem_3rem_3rem_4rem] sm:px-5">
      <span className="eyebrow !text-[10px]">#</span>
      <span className="eyebrow !text-[10px]">Pemain</span>
      <span className="eyebrow text-center !text-[10px]">M</span>
      <span className="eyebrow text-center !text-[10px]">W</span>
      <span className="eyebrow text-center !text-[10px]">L</span>
      <span className="eyebrow text-right !text-[10px] !text-ball">Poin</span>
    </div>
    <ul className="divide-y divide-white/[0.05]">
      {standings.map((p, idx) => (
        <li
          key={p.name}
          onClick={() => onSelectPlayer && onSelectPlayer(p.name)}
          className={`grid grid-cols-[2rem_1fr_2rem_2rem_2rem_3.25rem] cursor-pointer items-center gap-2 px-4 py-3 transition hover:bg-white/[0.06] active:scale-[0.99] sm:grid-cols-[2.5rem_1fr_3rem_3rem_3rem_4rem] sm:px-5 ${
            idx === 0 ? 'bg-ball-soft/40' : ''
          }`}
        >
          <span
            className={`num text-lg font-extrabold ${
              idx === 0 ? 'text-ball' : idx < 3 ? 'text-chalk' : 'text-chalk/35'
            }`}
          >
            {idx + 1}
          </span>
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar name={p.name} tone={idx === 0 ? 'ball' : 'neutral'} size="sm" />
            <div className="min-w-0">
              <span className="block truncate text-[15px] font-bold text-chalk">{p.name}</span>
              <span className="text-[10px] font-medium text-chalk/40 sm:hidden">Tap untuk profil</span>
            </div>
          </div>
          <span className="text-center text-sm font-semibold text-chalk/55">{p.played}</span>
          <span className="text-center text-sm font-bold text-ball">{p.won}</span>
          <span className="text-center text-sm font-semibold text-clay">{p.lost}</span>
          <span className="num text-right text-xl font-extrabold">{p.points}</span>
        </li>
      ))}
    </ul>
  </div>
);

export const AllTimeTable: React.FC<{
  stats: PlayerCareerStats[];
  onSelectPlayer: (name: string) => void;
}> = ({ stats, onSelectPlayer }) => (
  <div className="card overflow-hidden">
    <div className="grid grid-cols-[2rem_1fr_3.5rem_2.5rem_3.5rem] items-center gap-2 border-b border-white/[0.06] px-4 py-3 sm:grid-cols-[2.5rem_1fr_4.5rem_4.5rem_5rem] sm:px-5">
      <span className="eyebrow !text-[10px]">#</span>
      <span className="eyebrow !text-[10px]">Pemain</span>
      <span className="eyebrow text-center !text-[10px]">Win Rate</span>
      <span className="eyebrow text-center !text-[10px]">W-L</span>
      <span className="eyebrow text-right !text-[10px] !text-ball">+/- Poin</span>
    </div>
    <ul className="divide-y divide-white/[0.05]">
      {stats.map((p, idx) => (
        <li
          key={p.name}
          onClick={() => onSelectPlayer(p.name)}
          className={`grid grid-cols-[2rem_1fr_3.5rem_2.5rem_3.5rem] cursor-pointer items-center gap-2 px-4 py-3.5 transition hover:bg-white/[0.06] active:scale-[0.99] sm:grid-cols-[2.5rem_1fr_4.5rem_4.5rem_5rem] sm:px-5 ${
            idx === 0 ? 'bg-ball-soft/40' : ''
          }`}
        >
          <span
            className={`num text-lg font-extrabold ${
              idx === 0 ? 'text-ball' : idx < 3 ? 'text-chalk' : 'text-chalk/35'
            }`}
          >
            {idx + 1}
          </span>
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar name={p.name} tone={idx === 0 ? 'ball' : 'neutral'} size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[15px] font-bold text-chalk">{p.name}</span>
                {p.winRate >= 70 && <Flame className="h-3 w-3 shrink-0 text-clay fill-clay" />}
              </div>
              {p.bestPartner && (
                <span className="flex items-center gap-1 text-[10px] font-medium text-chalk/45 truncate">
                  <Users className="h-2.5 w-2.5 text-ball" />
                  Duet: {p.bestPartner.name}
                </span>
              )}
            </div>
          </div>
          <div className="text-center">
            <span className="num font-extrabold text-ball text-sm">{p.winRate}%</span>
          </div>
          <span className="text-center text-xs font-bold text-chalk/80">
            {p.won}-{p.lost}
          </span>
          <span
            className={`num text-right font-extrabold text-base ${
              p.diff > 0 ? 'text-ball' : p.diff < 0 ? 'text-clay' : 'text-chalk/60'
            }`}
          >
            {p.diff > 0 ? `+${p.diff}` : p.diff}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const Pedestal: React.FC<{
  player?: { name: string; scoreLabel: string };
  place: 1 | 2 | 3;
  onSelect?: () => void;
}> = ({ player, place, onSelect }) => {
  const height = place === 1 ? 'h-32' : place === 2 ? 'h-24' : 'h-20';
  const style =
    place === 1
      ? 'bg-gradient-to-b from-ball to-ball-dim text-ink-950'
      : place === 2
        ? 'bg-gradient-to-b from-white/25 to-white/10 text-chalk'
        : 'bg-gradient-to-b from-clay/70 to-clay/25 text-chalk';

  return (
    <div
      onClick={onSelect}
      className={`flex min-w-0 flex-col items-center ${player && onSelect ? 'cursor-pointer group' : ''}`}
    >
      {player ? (
        <>
          {place === 1 && <Crown className="mb-1.5 h-6 w-6 animate-bounce text-ball" />}
          <div className="transition group-hover:scale-105">
            <Avatar name={player.name} tone={place === 1 ? 'ball' : place === 3 ? 'clay' : 'neutral'} size="lg" />
          </div>
          <p className="mt-2 w-full truncate text-center text-sm font-bold text-chalk group-hover:text-ball transition">
            {player.name}
          </p>
          <p className="text-xs font-semibold text-chalk/50">{player.scoreLabel}</p>
        </>
      ) : (
        <div className="h-[5.5rem]" />
      )}
      <div
        className={`num mt-3 flex w-full items-start justify-center rounded-t-2xl pt-3 text-4xl font-extrabold ${height} ${style}`}
      >
        {place}
      </div>
    </div>
  );
};

export const Standings: React.FC<StandingsProps> = ({
  standings,
  allTimeStats = [],
  onOpenShare,
  onSelectPlayer,
}) => {
  const [viewMode, setViewMode] = useState<'session' | 'alltime'>('session');

  const hasCurrentStandings = standings.length > 0;
  const hasAllTime = allTimeStats.length > 0;

  return (
    <div className="space-y-5">
      {/* Top Header & Poster Button */}
      <div className="flex items-end justify-between px-1">
        <div>
          <p className="eyebrow mb-1">Papan Peringkat</p>
          <h2 className="font-display text-4xl font-extrabold leading-none tracking-tight">Klasemen</h2>
        </div>
        {hasCurrentStandings && viewMode === 'session' && (
          <button onClick={onOpenShare} className="btn-ghost !px-4 !py-2.5 !text-xs">
            <Share2 className="h-4 w-4" />
            <span>Poster</span>
          </button>
        )}
      </div>

      {/* Segmented Switcher: Sesi Ini vs Sepanjang Waktu */}
      <div className="flex rounded-2xl border border-white/10 bg-white/[0.03] p-1">
        <button
          onClick={() => setViewMode('session')}
          className={`flex-1 rounded-xl py-2.5 text-xs font-extrabold transition ${
            viewMode === 'session' ? 'bg-ball text-ink-950 shadow-ball' : 'text-chalk/60 hover:text-chalk'
          }`}
        >
          Sesi Ini ({standings.length})
        </button>
        <button
          onClick={() => setViewMode('alltime')}
          className={`flex-1 rounded-xl py-2.5 text-xs font-extrabold transition ${
            viewMode === 'alltime' ? 'bg-ball text-ink-950 shadow-ball' : 'text-chalk/60 hover:text-chalk'
          }`}
        >
          Sepanjang Waktu / All-Time ({allTimeStats.length})
        </button>
      </div>

      {viewMode === 'session' ? (
        !hasCurrentStandings ? (
          <EmptyState
            icon={<Trophy className="h-8 w-8" />}
            title="Klasemen sesi ini masih kosong"
            body="Klasemen terhitung otomatis setelah skor pertandingan pertama disimpan."
          />
        ) : (
          <>
            {/* Session Podium */}
            <div className="card animate-fade-up overflow-hidden px-4 pt-7 sm:px-8">
              <p className="eyebrow mb-5 text-center">Podium Sesi Ini</p>
              <div className="mx-auto grid max-w-md grid-cols-3 items-end gap-2 sm:gap-4">
                <Pedestal
                  player={standings[1] ? { name: standings[1].name, scoreLabel: `${standings[1].points} poin` } : undefined}
                  place={2}
                  onSelect={standings[1] ? () => onSelectPlayer(standings[1].name) : undefined}
                />
                <Pedestal
                  player={standings[0] ? { name: standings[0].name, scoreLabel: `${standings[0].points} poin` } : undefined}
                  place={1}
                  onSelect={standings[0] ? () => onSelectPlayer(standings[0].name) : undefined}
                />
                <Pedestal
                  player={standings[2] ? { name: standings[2].name, scoreLabel: `${standings[2].points} poin` } : undefined}
                  place={3}
                  onSelect={standings[2] ? () => onSelectPlayer(standings[2].name) : undefined}
                />
              </div>
            </div>

            {/* Session Table */}
            <div className="animate-fade-up" style={{ animationDelay: '80ms' }}>
              <StandingsTable standings={standings} onSelectPlayer={onSelectPlayer} />
            </div>
          </>
        )
      ) : (
        !hasAllTime ? (
          <EmptyState
            icon={<Trophy className="h-8 w-8" />}
            title="Statistik karir belum tercatat"
            body="Selesaikan pertandingan di cloud Supabase untuk merekam statistik seumur hidup komunitas."
          />
        ) : (
          <>
            {/* All-time Podium */}
            <div className="card animate-fade-up overflow-hidden px-4 pt-7 sm:px-8">
              <p className="eyebrow mb-5 text-center">Podium Juara All-Time</p>
              <div className="mx-auto grid max-w-md grid-cols-3 items-end gap-2 sm:gap-4">
                <Pedestal
                  player={
                    allTimeStats[1]
                      ? { name: allTimeStats[1].name, scoreLabel: `${allTimeStats[1].winRate}% WR` }
                      : undefined
                  }
                  place={2}
                  onSelect={allTimeStats[1] ? () => onSelectPlayer(allTimeStats[1].name) : undefined}
                />
                <Pedestal
                  player={
                    allTimeStats[0]
                      ? { name: allTimeStats[0].name, scoreLabel: `${allTimeStats[0].winRate}% WR` }
                      : undefined
                  }
                  place={1}
                  onSelect={allTimeStats[0] ? () => onSelectPlayer(allTimeStats[0].name) : undefined}
                />
                <Pedestal
                  player={
                    allTimeStats[2]
                      ? { name: allTimeStats[2].name, scoreLabel: `${allTimeStats[2].winRate}% WR` }
                      : undefined
                  }
                  place={3}
                  onSelect={allTimeStats[2] ? () => onSelectPlayer(allTimeStats[2].name) : undefined}
                />
              </div>
            </div>

            {/* All-time Table */}
            <div className="animate-fade-up" style={{ animationDelay: '80ms' }}>
              <AllTimeTable stats={allTimeStats} onSelectPlayer={onSelectPlayer} />
            </div>
          </>
        )
      )}
    </div>
  );
};
