import React from 'react';
import { ArchivedSession } from '../types/tennis';
import { Sheet, Avatar } from './ui';
import { Calendar, Users, Trophy, Play, Share2, RefreshCw, FolderArchive } from 'lucide-react';

interface SessionArchiveModalProps {
  archivedSessions: ArchivedSession[];
  currentSessionId: string;
  isLoading: boolean;
  onRefresh: () => void;
  onSelectSession: (sessionId: string) => void;
  onOpenPosterForSession: (session: ArchivedSession) => void;
  onClose: () => void;
}

export const SessionArchiveModal: React.FC<SessionArchiveModalProps> = ({
  archivedSessions,
  currentSessionId,
  isLoading,
  onRefresh,
  onSelectSession,
  onOpenPosterForSession,
  onClose,
}) => {
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <Sheet onClose={onClose}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ball-soft text-ball">
              <FolderArchive className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-black text-chalk">Arsip Sesi Mabar</h3>
              <p className="text-xs font-semibold text-chalk/50">
                {archivedSessions.length} sesi tersimpan di cloud
              </p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-chalk/70 transition hover:bg-white/10 active:scale-95 disabled:opacity-50"
            title="Muat ulang arsip"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-ball' : ''}`} />
          </button>
        </div>

        {/* Sessions list */}
        {archivedSessions.length === 0 ? (
          <div className="card px-5 py-8 text-center">
            <p className="text-sm font-semibold text-chalk/60">Belum ada sesi tersimpan di database.</p>
            <p className="mt-1 text-xs text-chalk/40">Sesi yang kamu mainkan akan tersimpan di sini otomatis.</p>
          </div>
        ) : (
          <div className="max-h-[62vh] space-y-3.5 overflow-y-auto pr-1">
            {archivedSessions.map((s) => {
              const isCurrent = s.id === currentSessionId;

              return (
                <div
                  key={s.id}
                  className={`card relative space-y-3 p-4 transition-all ${
                    isCurrent ? 'border-ball/50 bg-ball-soft/20' : 'hover:border-white/20'
                  }`}
                >
                  {/* Top Bar: Title & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="eyebrow flex items-center gap-1 !text-[10px]">
                          <Calendar className="h-3 w-3" />
                          {formatDate(s.createdAt)}
                        </span>
                        {isCurrent && (
                          <span className="rounded-full bg-ball px-2 py-0.5 text-[9px] font-black uppercase text-ink-950">
                            Aktif Sekarang
                          </span>
                        )}
                      </div>
                      <h4 className="mt-0.5 truncate font-display text-base font-bold text-chalk">
                        {s.eventTitle}
                      </h4>
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-chalk/65">
                    <span className="rounded-lg bg-white/[0.06] px-2.5 py-1">Host: {s.hostName || 'Admin'}</span>
                    <span className="rounded-lg bg-white/[0.06] px-2.5 py-1">
                      {s.gameType === 'Double' ? 'Ganda' : 'Tunggal'} &middot; {s.courtCount} Lapangan
                    </span>
                    <span className="rounded-lg bg-white/[0.06] px-2.5 py-1">
                      {s.matchCount} Match &middot; {s.currentRound} Ronde
                    </span>
                  </div>

                  {/* Podium Preview if available */}
                  {s.podium && s.podium.length > 0 && (
                    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-2.5">
                      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold text-chalk/50 uppercase tracking-wider">
                        <Trophy className="h-3 w-3 text-ball" />
                        <span>Podium Sesi Ini</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {s.podium.slice(0, 3).map((pod) => (
                          <div key={pod.name} className="flex min-w-0 items-center gap-1.5">
                            <span className="text-xs">
                              {pod.place === 1 ? '🥇' : pod.place === 2 ? '🥈' : '🥉'}
                            </span>
                            <span className="truncate text-xs font-bold text-chalk/90">{pod.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    {!isCurrent && (
                      <button
                        onClick={() => {
                          onSelectSession(s.id);
                          onClose();
                        }}
                        className="btn-primary flex-1 !py-2.5 !text-xs font-extrabold"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Buka Sesi Ini</span>
                      </button>
                    )}
                    <button
                      onClick={() => onOpenPosterForSession(s)}
                      className="btn-ghost flex-1 !py-2.5 !text-xs font-bold"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Poster Sesi</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button onClick={onClose} className="btn-ghost w-full !py-3 text-xs font-bold">
          Tutup Arsip
        </button>
      </div>
    </Sheet>
  );
};
