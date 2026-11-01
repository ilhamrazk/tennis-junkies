import React from 'react';
import { PlayerStanding } from '../types/tennis';
import { Trophy, Share2, Crown } from 'lucide-react';

interface StandingsProps {
  standings: PlayerStanding[];
  onOpenShare: () => void;
}

export const Standings: React.FC<StandingsProps> = ({ standings, onOpenShare }) => {
  const top1 = standings[0];
  const top2 = standings[1];
  const top3 = standings[2];

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header with Title and Share button */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <span>Leaderboard & Podium Juara</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Klasemen perolehan poin realtime</p>
        </div>

        {standings.length > 0 && (
          <button
            onClick={onOpenShare}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-2.5 px-4 rounded-xl shadow-md active:scale-95 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Download Poster Story</span>
          </button>
        )}
      </div>

      {standings.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl text-center text-slate-500 space-y-2 border-2 border-slate-200 shadow-card">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-base font-black text-slate-700">Belum ada data pertandingan yang selesai.</p>
          <p className="text-xs text-slate-400">Klasemen akan terhitung otomatis setelah skor pertandingan pertama disubmit.</p>
        </div>
      ) : (
        <>
          {/* Top 3 Visual Podium */}
          {top1 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-card relative overflow-hidden">
              <div className="text-center mb-6">
                <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-brand-orange">
                  TOP 3 PODIUM
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end pt-4 pb-2 max-w-md mx-auto">
                {/* 2nd Place (Silver) */}
                <div className="flex flex-col items-center">
                  {top2 ? (
                    <>
                      <div className="relative mb-2">
                        <div className="w-13 sm:w-16 h-13 sm:h-16 rounded-2xl bg-slate-100 border-2 border-slate-400 flex items-center justify-center font-black text-slate-700 text-sm sm:text-base shadow-sm">
                          {getInitials(top2.name)}
                        </div>
                        <span className="absolute -bottom-2 -right-1 text-lg">🥈</span>
                      </div>
                      <p className="font-extrabold text-xs sm:text-sm text-slate-900 truncate max-w-[90px] sm:max-w-[110px] text-center">
                        {top2.name}
                      </p>
                      <span className="text-xs font-black text-slate-600">
                        {top2.points} pts
                      </span>
                      {/* Podium Stand */}
                      <div className="w-full h-16 sm:h-20 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-2xl mt-2 flex items-center justify-center font-black text-slate-600 text-lg sm:text-2xl border-t-2 border-slate-300">
                        2
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-16 bg-slate-50 rounded-t-2xl" />
                  )}
                </div>

                {/* 1st Place (Gold / Champion) */}
                <div className="flex flex-col items-center z-10">
                  <div className="relative mb-2">
                    <Crown className="w-6 h-6 text-brand-orange mx-auto mb-1 animate-bounce" />
                    <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-orange to-orange-400 border-2 border-amber-300 flex items-center justify-center font-black text-white text-xl sm:text-2xl shadow-brand">
                      {getInitials(top1.name)}
                    </div>
                    <span className="absolute -bottom-2 -right-1 text-2xl">🥇</span>
                  </div>
                  <p className="font-black text-sm sm:text-base text-slate-900 truncate max-w-[100px] sm:max-w-[130px] text-center">
                    {top1.name}
                  </p>
                  <span className="text-xs font-black text-brand-orange">
                    {top1.points} pts
                  </span>
                  {/* Podium Stand */}
                  <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-orange-400 to-amber-300 rounded-t-2xl mt-2 flex items-center justify-center font-black text-white text-3xl sm:text-4xl border-t-2 border-amber-400 shadow-md">
                    1
                  </div>
                </div>

                {/* 3rd Place (Bronze) */}
                <div className="flex flex-col items-center">
                  {top3 ? (
                    <>
                      <div className="relative mb-2">
                        <div className="w-13 sm:w-16 h-13 sm:h-16 rounded-2xl bg-amber-50 border-2 border-amber-500 flex items-center justify-center font-black text-amber-800 text-sm sm:text-base shadow-sm">
                          {getInitials(top3.name)}
                        </div>
                        <span className="absolute -bottom-2 -right-1 text-lg">🥉</span>
                      </div>
                      <p className="font-extrabold text-xs sm:text-sm text-slate-900 truncate max-w-[90px] sm:max-w-[110px] text-center">
                        {top3.name}
                      </p>
                      <span className="text-xs font-black text-slate-600">
                        {top3.points} pts
                      </span>
                      {/* Podium Stand */}
                      <div className="w-full h-12 sm:h-14 bg-gradient-to-t from-amber-200 to-amber-100 rounded-t-2xl mt-2 flex items-center justify-center font-black text-amber-800 text-base sm:text-xl border-t-2 border-amber-300">
                        3
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-12 bg-slate-50 rounded-t-2xl" />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Full Standings Table */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-card overflow-hidden">
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
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3.5 text-center font-black">
                        {idx === 0 ? (
                          <span className="text-brand-orange text-base font-black">#1</span>
                        ) : idx === 1 ? (
                          <span className="text-slate-500 text-base font-black">#2</span>
                        ) : idx === 2 ? (
                          <span className="text-amber-600 text-base font-black">#3</span>
                        ) : (
                          <span className="text-slate-400 text-xs font-bold">#{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 font-black text-[10px] text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                            {getInitials(p.name)}
                          </div>
                          <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 text-center text-slate-600 font-bold text-xs sm:text-sm">
                        {p.played}
                      </td>
                      <td className="py-3.5 text-center text-emerald-600 font-black text-xs sm:text-sm">
                        {p.won}
                      </td>
                      <td className="py-3.5 text-center text-red-500 font-bold text-xs sm:text-sm">
                        {p.lost}
                      </td>
                      <td className="py-3.5 text-center font-mono text-brand-orange font-black text-base sm:text-lg">
                        {p.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
