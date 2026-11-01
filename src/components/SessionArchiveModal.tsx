import React from 'react';
import { ArchivedSession } from '../types/tennis';
import { X, Calendar, Trophy, Play, Share2, RefreshCw, FolderArchive } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative border-2 border-slate-200 text-slate-900 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between pr-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
              <FolderArchive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Arsip Sesi Mabar</h3>
              <p className="text-xs text-slate-500 font-bold">
                {archivedSessions.length} sesi tersimpan di cloud database
              </p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition active:scale-95 disabled:opacity-50"
            title="Muat ulang arsip"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-orange' : ''}`} />
          </button>
        </div>

        {/* Sessions list */}
        {archivedSessions.length === 0 ? (
          <div className="bg-slate-50 p-8 rounded-2xl text-center text-slate-500 border border-slate-200">
            <p className="text-sm font-black text-slate-700">Belum ada sesi tersimpan di database.</p>
            <p className="text-xs text-slate-400 mt-1">
              Sesi yang kamu mainkan akan tersimpan di sini secara otomatis.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5 max-h-[58vh] overflow-y-auto pr-1">
            {archivedSessions.map((s) => {
              const isCurrent = s.id === currentSessionId;

              return (
                <div
                  key={s.id}
                  className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
                    isCurrent
                      ? 'border-brand-orange bg-orange-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-brand-orange" />
                        {formatDate(s.createdAt)}
                      </span>
                      <h4 className="font-black text-base text-slate-900 mt-0.5">{s.eventTitle}</h4>
                    </div>
                    {isCurrent && (
                      <span className="bg-brand-orange text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                        Aktif
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                      Host: {s.hostName || 'Admin'}
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                      {s.gameType === 'Double' ? 'Ganda' : 'Tunggal'} &bull; {s.courtCount} Lapangan
                    </span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                      {s.matchCount} Match &bull; {s.currentRound} Ronde
                    </span>
                  </div>

                  {s.podium && s.podium.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200">
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-amber-500" />
                        <span>Podium Sesi Ini</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {s.podium.slice(0, 3).map((pod) => (
                          <div key={pod.name} className="flex items-center gap-1">
                            <span className="text-xs">
                              {pod.place === 1 ? '🥇' : pod.place === 2 ? '🥈' : '🥉'}
                            </span>
                            <span className="text-xs font-extrabold text-slate-800 truncate">
                              {pod.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    {!isCurrent && (
                      <button
                        onClick={() => {
                          onSelectSession(s.id);
                          onClose();
                        }}
                        className="btn-primary py-2 px-3 text-xs font-black flex-1 flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Buka Sesi Ini</span>
                      </button>
                    )}
                    <button
                      onClick={() => onOpenPosterForSession(s)}
                      className="btn-secondary py-2 px-3 text-xs font-bold flex-1 flex items-center justify-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Poster Sesi</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button onClick={onClose} className="w-full btn-secondary py-3 text-xs font-bold">
          Tutup Arsip
        </button>
      </div>
    </div>
  );
};
