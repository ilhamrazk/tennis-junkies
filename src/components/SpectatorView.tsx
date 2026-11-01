import React, { useState } from 'react';
import { Session, Match, PlayerStanding } from '../types/tennis';
import { Search, Trophy, X } from 'lucide-react';
import { LiveDot } from './ui';
import { StandingsTable } from './Standings';

interface SpectatorViewProps {
  session: Session;
  activeMatches: Match[];
  standings: PlayerStanding[];
  onBackToHost: () => void;
}

export const SpectatorView: React.FC<SpectatorViewProps> = ({
  session,
  activeMatches,
  standings,
}) => {
  const [searchPlayer, setSearchPlayer] = useState('');
  const isDouble = session.gameType === 'Double';
  const query = searchPlayer.trim().toLowerCase();

  return (
    <div className="space-y-7">
      <section className="space-y-4 px-1">
        <div className="flex items-center gap-2">
          <LiveDot />
          <span className="eyebrow !text-ball">Live feed &middot; update otomatis</span>
        </div>
        <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight">
          {session.eventTitle}
        </h2>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-chalk/35" />
          <input
            type="text"
            value={searchPlayer}
            onChange={(e) => setSearchPlayer(e.target.value)}
            placeholder="Cari nama kamu untuk tahu main di court mana"
            className="field !rounded-2xl !py-4 pl-12 pr-11"
          />
          {searchPlayer && (
            <button
              onClick={() => setSearchPlayer('')}
              aria-label="Hapus pencarian"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-1.5 text-chalk/70"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between px-1">
          <h3 className="font-display text-2xl font-extrabold tracking-tight">
            Ronde <span className="text-ball">{session.currentRound}</span>
          </h3>
          <span className="eyebrow">{activeMatches.length} court</span>
        </div>

        {activeMatches.length === 0 ? (
          <div className="card px-6 py-10 text-center text-sm text-chalk/50">
            Belum ada pertandingan di ronde ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {activeMatches.map((m, i) => {
              const teamA = [m.teamA1, isDouble ? m.teamA2 : ''].filter(Boolean);
              const teamB = [m.teamB1, isDouble ? m.teamB2 : ''].filter(Boolean);
              const isMine =
                !!query && [...teamA, ...teamB].some((n) => n.toLowerCase().includes(query));
              const dimmed = !!query && !isMine;

              return (
                <article
                  key={m.id}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className={`card animate-fade-up p-5 transition-all duration-300 ${
                    isMine ? '!border-ball shadow-ball' : ''
                  } ${dimmed ? 'opacity-35' : ''}`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex h-8 items-center rounded-lg bg-chalk px-3 font-display text-sm font-extrabold text-ink-950">
                      Court {m.court}
                    </span>
                    {isMine && (
                      <span className="rounded-full bg-ball px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-ink-950">
                        Giliran kamu
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div className="min-w-0 space-y-0.5 border-l-4 border-ball pl-3">
                      {teamA.map((n) => (
                        <p key={n} className="truncate text-base font-bold">
                          {n}
                        </p>
                      ))}
                    </div>
                    <span className="font-display text-xs font-extrabold text-chalk/30">VS</span>
                    <div className="min-w-0 space-y-0.5 border-r-4 border-clay pr-3 text-right">
                      {teamB.map((n) => (
                        <p key={n} className="truncate text-base font-bold">
                          {n}
                        </p>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h3 className="flex items-center gap-2 px-1 font-display text-2xl font-extrabold tracking-tight">
          <Trophy className="h-5 w-5 text-ball" />
          <span>Klasemen</span>
        </h3>
        {standings.length === 0 ? (
          <div className="card px-6 py-10 text-center text-sm text-chalk/50">
            Klasemen muncul setelah pertandingan pertama selesai.
          </div>
        ) : (
          <StandingsTable standings={standings} />
        )}
      </section>
    </div>
  );
};
