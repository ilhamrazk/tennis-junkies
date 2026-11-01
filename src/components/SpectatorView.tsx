import React, { useState } from 'react';
import { Session, Match, PlayerStanding } from '../types/tennis';
import { Trophy, Search, ShieldCheck, Flame } from 'lucide-react';

interface SpectatorViewProps {
  session: Session;
  activeMatches: Match[];
  standings: PlayerStanding[];
  onBackToHost: () => void;
  onSelectPlayer?: (name: string) => void;
}

export const SpectatorView: React.FC<SpectatorViewProps> = ({
  session,
  activeMatches,
  standings,
  onBackToHost,
  onSelectPlayer,
}) => {
  const [searchPlayer, setSearchPlayer] = useState('');
  const isDouble = session.gameType === 'Double';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Spectator Status Banner */}
      <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
          </span>
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-800">
            Live Spectator Feed &bull; Pembaruan Real-Time
          </span>
        </div>
        <button
          onClick={onBackToHost}
          className="text-xs font-black text-brand-orange hover:text-orange-600 flex items-center gap-1.5 transition underline"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Kembali ke Mode Host</span>
        </button>
      </div>

      {/* Player Court Finder */}
      <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-card space-y-2">
        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
          🔍 Cek Jadwal Main Saya
        </label>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchPlayer}
            onChange={(e) => setSearchPlayer(e.target.value)}
            placeholder="Ketik nama Anda untuk mencari court..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-orange focus:bg-white transition"
          />
        </div>
      </div>

      {/* Active Courts Live */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-brand-orange" />
            <span>Pertandingan Ronde {session.currentRound}</span>
          </h2>
          <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-600 text-white uppercase shadow-xs">
            LIVE
          </span>
        </div>

        {activeMatches.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 text-center text-slate-500 italic">
            Belum ada pertandingan yang berlangsung di ronde ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeMatches.map((m) => {
              const teamA = [m.teamA1, m.teamA2].filter(Boolean);
              const teamB = [m.teamB1, m.teamB2].filter(Boolean);
              const isUserInMatch =
                searchPlayer.trim() &&
                [...teamA, ...teamB].some((name) =>
                  name.toLowerCase().includes(searchPlayer.trim().toLowerCase())
                );

              return (
                <div
                  key={m.id}
                  className={`bg-white p-6 rounded-3xl border-2 transition shadow-card ${
                    isUserInMatch
                      ? 'border-brand-orange bg-orange-50/40 ring-2 ring-brand-orange'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-4 border-b-2 border-slate-100 pb-3">
                    <span className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                      <span className="text-brand-orange">🎾</span> COURT {m.court}
                    </span>
                    {isUserInMatch && (
                      <span className="bg-brand-orange text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                        Giliran Anda Main!
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center gap-3 text-center py-2">
                    {/* Team A */}
                    <div className="flex-1 space-y-1">
                      <p
                        onClick={() => onSelectPlayer && onSelectPlayer(m.teamA1)}
                        className={`font-black text-sm sm:text-base text-slate-900 truncate ${
                          onSelectPlayer ? 'cursor-pointer hover:text-brand-orange transition' : ''
                        }`}
                      >
                        {m.teamA1}
                      </p>
                      {isDouble && m.teamA2 && (
                        <p
                          onClick={() => onSelectPlayer && onSelectPlayer(m.teamA2)}
                          className={`font-bold text-xs text-slate-600 truncate ${
                            onSelectPlayer ? 'cursor-pointer hover:text-brand-orange transition' : ''
                          }`}
                        >
                          {m.teamA2}
                        </p>
                      )}
                    </div>

                    <div className="px-2 font-black text-brand-orange text-xs">VS</div>

                    {/* Team B */}
                    <div className="flex-1 space-y-1">
                      <p
                        onClick={() => onSelectPlayer && onSelectPlayer(m.teamB1)}
                        className={`font-black text-sm sm:text-base text-slate-900 truncate ${
                          onSelectPlayer ? 'cursor-pointer hover:text-brand-orange transition' : ''
                        }`}
                      >
                        {m.teamB1}
                      </p>
                      {isDouble && m.teamB2 && (
                        <p
                          onClick={() => onSelectPlayer && onSelectPlayer(m.teamB2)}
                          className={`font-bold text-xs text-slate-600 truncate ${
                            onSelectPlayer ? 'cursor-pointer hover:text-brand-orange transition' : ''
                          }`}
                        >
                          {m.teamB2}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Live Standings Feed */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-card space-y-4">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b-2 border-slate-100 pb-3">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span>Live Standings</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b-2 border-slate-100 text-slate-500 text-[11px] font-black uppercase tracking-wider">
                <th className="pb-3 text-center w-12">Pos</th>
                <th className="pb-3">Player Name</th>
                <th className="pb-3 text-center w-12">Main</th>
                <th className="pb-3 text-center w-12 text-emerald-600">Menang</th>
                <th className="pb-3 text-center w-12 text-red-500">Kalah</th>
                <th className="pb-3 text-center w-16 text-brand-orange">Poin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {standings.map((p, idx) => (
                <tr
                  key={p.name}
                  onClick={() => onSelectPlayer && onSelectPlayer(p.name)}
                  className="hover:bg-orange-50/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 text-center font-black">
                    {idx === 0 ? (
                      <span className="text-brand-orange text-base font-black">🥇 #1</span>
                    ) : idx === 1 ? (
                      <span className="text-slate-500 text-base font-black">🥈 #2</span>
                    ) : idx === 2 ? (
                      <span className="text-amber-600 text-base font-black">🥉 #3</span>
                    ) : (
                      <span className="text-slate-400 text-xs font-bold">#{idx + 1}</span>
                    )}
                  </td>
                  <td className="py-3 font-extrabold text-slate-900 hover:text-brand-orange transition">
                    {p.name}
                  </td>
                  <td className="py-3 text-center text-slate-600 font-bold text-xs sm:text-sm">
                    {p.played}
                  </td>
                  <td className="py-3 text-center text-emerald-600 font-black text-xs sm:text-sm">
                    {p.won}
                  </td>
                  <td className="py-3 text-center text-red-500 font-bold text-xs sm:text-sm">
                    {p.lost}
                  </td>
                  <td className="py-3 text-center font-mono text-brand-orange font-black text-base">
                    {p.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
