import React from 'react';
import { PlayerCareerStats, PlayerStanding } from '../types/tennis';
import { Sheet, Avatar } from './ui';
import { Trophy, Flame, Users, Swords, Activity } from 'lucide-react';

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
  // If careerStats is missing, fallback using currentStanding or defaults
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

  return (
    <Sheet onClose={onClose}>
      <div className="space-y-6">
        {/* Header Profile */}
        <div className="flex items-center gap-4">
          <Avatar name={stats.name} tone="ball" size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="num flex h-6 items-center rounded-lg bg-ball px-2 text-xs font-black text-ink-950">
                Rank #{stats.rank || 1}
              </span>
              {stats.winRate >= 60 && (
                <span className="flex items-center gap-1 text-[11px] font-extrabold text-clay">
                  <Flame className="h-3.5 w-3.5 fill-clay" /> On Fire
                </span>
              )}
            </div>
            <h3 className="mt-1 truncate font-display text-2xl font-black tracking-tight text-chalk">
              {stats.name}
            </h3>
            <p className="text-xs font-semibold text-chalk/50">Statistik Karir Komunitas</p>
          </div>
        </div>

        {/* Win Rate & Primary Highlights */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="card flex flex-col items-center justify-center p-3 text-center">
            <span className="eyebrow !text-[9px]">Win Rate</span>
            <span className="num mt-1 text-2xl font-black text-ball">{stats.winRate}%</span>
            <span className="text-[10px] font-semibold text-chalk/40">
              {stats.won}W - {stats.lost}L
            </span>
          </div>

          <div className="card flex flex-col items-center justify-center p-3 text-center">
            <span className="eyebrow !text-[9px]">Total Game</span>
            <span className="num mt-1 text-2xl font-black text-chalk">{stats.played}</span>
            <span className="text-[10px] font-semibold text-chalk/40">Pertandingan</span>
          </div>

          <div className="card flex flex-col items-center justify-center p-3 text-center">
            <span className="eyebrow !text-[9px]">Selisih Poin</span>
            <span
              className={`num mt-1 text-2xl font-black ${
                stats.diff > 0 ? 'text-ball' : stats.diff < 0 ? 'text-clay' : 'text-chalk'
              }`}
            >
              {stats.diff > 0 ? `+${stats.diff}` : stats.diff}
            </span>
            <span className="text-[10px] font-semibold text-chalk/40">Total: {stats.pointsScored} pts</span>
          </div>
        </div>

        {/* Form / Last 5 matches */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="eyebrow flex items-center gap-1.5 !text-[10px]">
              <Activity className="h-3.5 w-3.5 text-ball" />
              <span>Performa 5 Game Terakhir</span>
            </p>
            <span className="text-[10px] font-semibold text-chalk/40">Terbaru &rarr; Lama</span>
          </div>
          {stats.recentForm && stats.recentForm.length > 0 ? (
            <div className="flex gap-2">
              {stats.recentForm.map((result, idx) => (
                <div
                  key={idx}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl font-display text-sm font-black transition ${
                    result === 'W'
                      ? 'bg-ball text-ink-950 shadow-ball'
                      : 'border border-clay/40 bg-clay/20 text-clay'
                  }`}
                  title={result === 'W' ? 'Menang' : 'Kalah'}
                >
                  {result}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-chalk/40 italic">Belum ada catatan form pertandingan.</p>
          )}
        </div>

        {/* Synergy Cards: Best Partner & Top Rival */}
        <div className="space-y-2.5">
          {/* Best Partner */}
          <div className="card p-3.5">
            <div className="flex items-center justify-between">
              <span className="eyebrow flex items-center gap-1.5 !text-[10px] !text-ball">
                <Users className="h-3.5 w-3.5" />
                <span>Partner Terbaik (Chemistry)</span>
              </span>
              {stats.bestPartner && (
                <span className="rounded-full bg-ball-soft px-2 py-0.5 text-[10px] font-extrabold text-ball">
                  {stats.bestPartner.winRate}% Menang
                </span>
              )}
            </div>
            {stats.bestPartner ? (
              <div className="mt-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar name={stats.bestPartner.name} tone="ball" size="sm" />
                  <span className="font-display text-sm font-bold text-chalk">
                    {stats.bestPartner.name}
                  </span>
                </div>
                <span className="text-xs font-semibold text-chalk/60">
                  {stats.bestPartner.won} menang dari {stats.bestPartner.played} game
                </span>
              </div>
            ) : (
              <p className="mt-2 text-xs text-chalk/40">Belum ada riwayat ganda yang cukup.</p>
            )}
          </div>

          {/* Top Rival */}
          <div className="card p-3.5">
            <div className="flex items-center justify-between">
              <span className="eyebrow flex items-center gap-1.5 !text-[10px] !text-clay">
                <Swords className="h-3.5 w-3.5" />
                <span>Rival Terberat (Head-to-Head)</span>
              </span>
              {stats.topRival && (
                <span className="rounded-full bg-clay-soft px-2 py-0.5 text-[10px] font-extrabold text-clay">
                  {stats.topRival.played}x Berhadapan
                </span>
              )}
            </div>
            {stats.topRival ? (
              <div className="mt-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar name={stats.topRival.name} tone="clay" size="sm" />
                  <span className="font-display text-sm font-bold text-chalk">
                    {stats.topRival.name}
                  </span>
                </div>
                <span className="num text-xs font-extrabold text-chalk/80">
                  H2H: <span className="text-ball">{stats.topRival.won}W</span> -{' '}
                  <span className="text-clay">{stats.topRival.lost}L</span>
                </span>
              </div>
            ) : (
              <p className="mt-2 text-xs text-chalk/40">Belum ada rivalitas yang tercatat.</p>
            )}
          </div>
        </div>

        {/* Footer close */}
        <button onClick={onClose} className="btn-ghost w-full !py-3.5 text-xs font-bold">
          Tutup Profil
        </button>
      </div>
    </Sheet>
  );
};
