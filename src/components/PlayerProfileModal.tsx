import React from 'react';
import { PlayerCareerStats, PlayerStanding } from '../types/tennis';
import { X, Flame, Users, Swords, Activity, Trophy } from 'lucide-react';

interface PlayerProfileModalProps {
  playerName: string;
  careerStats?: PlayerCareerStats;
  currentStanding?: PlayerStanding;
  onClose: () => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  playerName,
  careerStats,
  currentStanding,
  onClose,
}) => {
  const stats: PlayerCareerStats = careerStats || {
    rank: currentStanding?.rank ?? 1,
    name: playerName,
    played: currentStanding?.played ?? 0,
    won: currentStanding?.won ?? 0,
    lost: currentStanding?.lost ?? 0,
    winRate:
      currentStanding && currentStanding.played > 0
        ? Math.round((currentStanding.won / currentStanding.played) * 100)
        : 0,
    pointsScored: currentStanding?.points ?? 0,
    pointsConceded: 0,
    diff: currentStanding?.diff ?? 0,
    avgPoints:
      currentStanding && currentStanding.played > 0
        ? Number((currentStanding.points / currentStanding.played).toFixed(1))
        : 0,
    recentForm: currentStanding
      ? (Array(currentStanding.won).fill('W').concat(Array(currentStanding.lost).fill('L')) as ('W' | 'L')[])
      : [],
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative border-2 border-slate-200 text-slate-900 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-orange to-orange-500 text-white font-black text-2xl flex items-center justify-center shadow-brand shrink-0">
            {getInitials(stats.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="bg-orange-100 text-brand-orange px-2.5 py-0.5 rounded-full text-xs font-black">
                RANK #{stats.rank || 1}
              </span>
              {stats.winRate >= 60 && (
                <span className="flex items-center gap-1 text-[11px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Flame className="w-3 h-3 fill-amber-500 text-amber-500" /> On Fire
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-slate-900 truncate mt-1">{stats.name}</h3>
            <p className="text-xs text-slate-500 font-bold">Statistik Karir Komunitas</p>
          </div>
        </div>

        {/* Key Highlight Stats */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Win Rate
            </span>
            <span className="block text-xl font-black text-brand-orange mt-0.5 font-mono">
              {stats.winRate}%
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              {stats.won}W - {stats.lost}L
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Total Game
            </span>
            <span className="block text-xl font-black text-slate-900 mt-0.5 font-mono">
              {stats.played}
            </span>
            <span className="text-[11px] font-bold text-slate-500">Match Selesai</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Selisih Poin
            </span>
            <span
              className={`block text-xl font-black mt-0.5 font-mono ${
                stats.diff > 0
                  ? 'text-emerald-600'
                  : stats.diff < 0
                    ? 'text-red-500'
                    : 'text-slate-700'
              }`}
            >
              {stats.diff > 0 ? `+${stats.diff}` : stats.diff}
            </span>
            <span className="text-[11px] font-bold text-slate-500">{stats.pointsScored} Total Pts</span>
          </div>
        </div>

        {/* Form / Last 5 matches */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-brand-orange" />
              <span>5 Pertandingan Terakhir</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400">Terbaru &rarr; Lama</span>
          </div>
          {stats.recentForm && stats.recentForm.length > 0 ? (
            <div className="flex gap-2">
              {stats.recentForm.map((result, idx) => (
                <div
                  key={idx}
                  className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shadow-xs ${
                    result === 'W'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                  title={result === 'W' ? 'Menang' : 'Kalah'}
                >
                  {result}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Belum ada catatan form pertandingan.</p>
          )}
        </div>

        {/* Synergy Cards: Best Partner & Top Rival */}
        <div className="space-y-3">
          {/* Best Partner */}
          <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-orange flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>Partner Terbaik (Chemistry)</span>
              </span>
              {stats.bestPartner && (
                <span className="text-[10px] font-black bg-white text-brand-orange px-2 py-0.5 rounded-md border border-orange-200">
                  {stats.bestPartner.winRate}% Win Rate
                </span>
              )}
            </div>
            {stats.bestPartner ? (
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-orange text-white text-[10px] font-black flex items-center justify-center">
                    {getInitials(stats.bestPartner.name)}
                  </div>
                  <span className="font-extrabold text-sm text-slate-900">
                    {stats.bestPartner.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-600">
                  {stats.bestPartner.won} menang dari {stats.bestPartner.played} game
                </span>
              </div>
            ) : (
              <p className="mt-1 text-xs text-slate-400">Belum ada riwayat ganda yang cukup.</p>
            )}
          </div>

          {/* Top Rival */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-red-500" />
                <span>Rival Terberat (Head-to-Head)</span>
              </span>
              {stats.topRival && (
                <span className="text-[10px] font-black bg-white text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                  {stats.topRival.played}x Duel
                </span>
              )}
            </div>
            {stats.topRival ? (
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-700 text-white text-[10px] font-black flex items-center justify-center">
                    {getInitials(stats.topRival.name)}
                  </div>
                  <span className="font-extrabold text-sm text-slate-900">
                    {stats.topRival.name}
                  </span>
                </div>
                <span className="text-xs font-bold font-mono">
                  <span className="text-emerald-600 font-black">{stats.topRival.won}W</span> -{' '}
                  <span className="text-red-500 font-black">{stats.topRival.lost}L</span>
                </span>
              </div>
            ) : (
              <p className="mt-1 text-xs text-slate-400">Belum ada rivalitas yang tercatat.</p>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full btn-secondary py-3 text-xs font-bold"
        >
          Tutup Profil
        </button>
      </div>
    </div>
  );
};
