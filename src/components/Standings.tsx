import React from 'react';
import { PlayerStanding } from '../types/tennis';
import { Trophy, Share2, Crown } from 'lucide-react';
import { Avatar, EmptyState } from './ui';

interface StandingsProps {
  standings: PlayerStanding[];
  onOpenShare: () => void;
}

export const StandingsTable: React.FC<{ standings: PlayerStanding[] }> = ({ standings }) => (
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
          className={`grid grid-cols-[2rem_1fr_2rem_2rem_2rem_3.25rem] items-center gap-2 px-4 py-3 transition hover:bg-white/[0.03] sm:grid-cols-[2.5rem_1fr_3rem_3rem_3rem_4rem] sm:px-5 ${
            idx === 0 ? 'bg-ball-soft' : ''
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
            <span className="truncate text-[15px] font-bold">{p.name}</span>
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

const Pedestal: React.FC<{
  player?: PlayerStanding;
  place: 1 | 2 | 3;
}> = ({ player, place }) => {
  const height = place === 1 ? 'h-32' : place === 2 ? 'h-24' : 'h-20';
  const style =
    place === 1
      ? 'bg-gradient-to-b from-ball to-ball-dim text-ink-950'
      : place === 2
        ? 'bg-gradient-to-b from-white/25 to-white/10 text-chalk'
        : 'bg-gradient-to-b from-clay/70 to-clay/25 text-chalk';

  return (
    <div className="flex min-w-0 flex-col items-center">
      {player ? (
        <>
          {place === 1 && <Crown className="mb-1.5 h-6 w-6 animate-bounce text-ball" />}
          <Avatar name={player.name} tone={place === 1 ? 'ball' : place === 3 ? 'clay' : 'neutral'} size="lg" />
          <p className="mt-2 w-full truncate text-center text-sm font-bold">{player.name}</p>
          <p className="text-xs font-semibold text-chalk/50">{player.points} poin</p>
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

export const Standings: React.FC<StandingsProps> = ({ standings, onOpenShare }) => {
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between px-1">
        <div>
          <p className="eyebrow mb-1">Realtime</p>
          <h2 className="font-display text-4xl font-extrabold leading-none tracking-tight">Klasemen</h2>
        </div>
        {standings.length > 0 && (
          <button onClick={onOpenShare} className="btn-ghost !px-4 !py-2.5 !text-xs">
            <Share2 className="h-4 w-4" />
            <span>Poster</span>
          </button>
        )}
      </div>

      {standings.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-8 w-8" />}
          title="Klasemen masih kosong"
          body="Klasemen terhitung otomatis setelah skor pertandingan pertama disimpan."
        />
      ) : (
        <>
          <div className="card animate-fade-up overflow-hidden px-4 pt-7 sm:px-8">
            <p className="eyebrow mb-5 text-center">Podium</p>
            <div className="mx-auto grid max-w-md grid-cols-3 items-end gap-2 sm:gap-4">
              <Pedestal player={standings[1]} place={2} />
              <Pedestal player={standings[0]} place={1} />
              <Pedestal player={standings[2]} place={3} />
            </div>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: '80ms' }}>
            <StandingsTable standings={standings} />
          </div>
        </>
      )}
    </div>
  );
};
