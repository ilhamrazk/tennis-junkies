import React, { useState } from 'react';
import { Match, GameType, ArchivedSession } from '../types/tennis';
import { History, Pencil, Check, FolderArchive, Play, Share2, Calendar, Trophy } from 'lucide-react';

interface MatchHistoryProps {
  historyMatches: Match[];
  allPlayers: string[];
  gameType: GameType;
  archivedSessions?: ArchivedSession[];
  isHostUnlocked: boolean;
  onRequestUnlockHost: () => void;
  onSelectSession?: (sessionId: string) => void;
  onOpenPosterForSession?: (session: ArchivedSession) => void;
  onSelectPlayer?: (name: string) => void;
  onEditMatch: (
    matchId: string,
    pA1: string,
    pA2: string,
    pB1: string,
    pB2: string,
    scoreA: number,
    scoreB: number
  ) => void;
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({
  historyMatches,
  allPlayers,
  gameType,
  archivedSessions = [],
  isHostUnlocked,
  onRequestUnlockHost,
  onSelectSession,
  onOpenPosterForSession,
  onSelectPlayer,
  onEditMatch,
}) => {
  const [subTab, setSubTab] = useState<'current' | 'archive'>('current');
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [editState, setEditState] = useState({
    pA1: '',
    pA2: '',
    pB1: '',
    pB2: '',
    scoreA: '',
    scoreB: '',
  });

  const startEdit = (m: Match) => {
    if (!isHostUnlocked) {
      onRequestUnlockHost();
      return;
    }
    setEditingMatchId(m.id);
    setEditState({
      pA1: m.teamA1,
      pA2: m.teamA2,
      pB1: m.teamB1,
      pB2: m.teamB2,
      scoreA: (m.scoreA ?? 0).toString(),
      scoreB: (m.scoreB ?? 0).toString(),
    });
  };

  const saveEdit = (m: Match) => {
    const sA = parseInt(editState.scoreA);
    const sB = parseInt(editState.scoreB);
    if (isNaN(sA) || isNaN(sB)) {
      alert('Masukkan angka skor yang valid!');
      return;
    }
    onEditMatch(m.id, editState.pA1, editState.pA2, editState.pB1, editState.pB2, sA, sB);
    setEditingMatchId(null);
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

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

  const isDouble = gameType === 'Double';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title Header */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
          <History className="w-6 h-6 text-blue-500" />
          <span>Riwayat Pertandingan</span>
        </h2>
      </div>

      {/* Segmented Switcher: Match Sesi Ini vs Arsip Sesi Mabar */}
      <div className="flex bg-white p-1 rounded-2xl border-2 border-slate-200 shadow-sm max-w-md mx-auto">
        <button
          onClick={() => setSubTab('current')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
            subTab === 'current'
              ? 'bg-brand-orange text-white shadow-brand'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Match Sesi Ini ({historyMatches.length})
        </button>
        <button
          onClick={() => setSubTab('archive')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
            subTab === 'archive'
              ? 'bg-brand-orange text-white shadow-brand'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Arsip Sesi Mabar ({archivedSessions.length})
        </button>
      </div>

      {subTab === 'current' ? (
        historyMatches.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl text-center text-slate-500 space-y-2 border-2 border-slate-200 shadow-card">
            <History className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-black text-slate-700">Belum ada pertandingan yang selesai.</p>
            <p className="text-xs text-slate-400">
              Pertandingan yang selesai diinput skornya akan tersimpan otomatis di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {historyMatches.map((m) => {
              const isEditing = editingMatchId === m.id;
              const aWon = (m.scoreA ?? 0) > (m.scoreB ?? 0);
              const bWon = (m.scoreB ?? 0) > (m.scoreA ?? 0);

              return (
                <div
                  key={m.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-card space-y-4 hover:border-slate-300 transition-colors"
                >
                  {/* Top Bar: Round, Court & Edit Trigger */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                        ROUND {m.round}
                      </span>
                      <span className="text-xs font-black text-slate-500">
                        COURT {m.court}
                      </span>
                    </div>

                    {!isEditing ? (
                      <button
                        onClick={() => startEdit(m)}
                        className="text-xs font-extrabold text-slate-500 hover:text-brand-orange flex items-center gap-1 transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Koreksi Skor / Pemain</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => saveEdit(m)}
                        className="text-xs font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition"
                      >
                        <Check className="w-4 h-4" />
                        <span>Simpan Perubahan</span>
                      </button>
                    )}
                  </div>

                  {!isEditing ? (
                    /* Display Mode */
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
                      {/* Team A */}
                      <div
                        className={`md:col-span-3 p-3.5 rounded-2xl border-2 transition ${
                          aWon
                            ? 'bg-orange-50 border-orange-300'
                            : 'bg-slate-50 border-slate-200 opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div
                              onClick={() => onSelectPlayer && onSelectPlayer(m.teamA1)}
                              className="flex items-center gap-2 cursor-pointer group"
                            >
                              <div className="w-6 h-6 rounded-lg bg-brand-orange text-white text-[10px] font-black flex items-center justify-center">
                                {getInitials(m.teamA1)}
                              </div>
                              <span className="font-extrabold text-slate-900 text-sm group-hover:text-brand-orange transition">
                                {m.teamA1}
                              </span>
                            </div>

                            {isDouble && m.teamA2 && (
                              <div
                                onClick={() => onSelectPlayer && onSelectPlayer(m.teamA2)}
                                className="flex items-center gap-2 cursor-pointer group"
                              >
                                <div className="w-6 h-6 rounded-lg bg-brand-orange text-white text-[10px] font-black flex items-center justify-center">
                                  {getInitials(m.teamA2)}
                                </div>
                                <span className="font-extrabold text-slate-900 text-sm group-hover:text-brand-orange transition">
                                  {m.teamA2}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="text-2xl font-black font-mono text-brand-orange">
                              {m.scoreA}
                            </span>
                            {aWon && (
                              <span className="block text-[10px] font-black text-emerald-600 uppercase">
                                Winner
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* VS Divider */}
                      <div className="md:col-span-1 text-center font-black text-xs text-slate-400">
                        VS
                      </div>

                      {/* Team B */}
                      <div
                        className={`md:col-span-3 p-3.5 rounded-2xl border-2 transition ${
                          bWon
                            ? 'bg-emerald-50 border-emerald-300'
                            : 'bg-slate-50 border-slate-200 opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div
                              onClick={() => onSelectPlayer && onSelectPlayer(m.teamB1)}
                              className="flex items-center gap-2 cursor-pointer group"
                            >
                              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center">
                                {getInitials(m.teamB1)}
                              </div>
                              <span className="font-extrabold text-slate-900 text-sm group-hover:text-brand-orange transition">
                                {m.teamB1}
                              </span>
                            </div>

                            {isDouble && m.teamB2 && (
                              <div
                                onClick={() => onSelectPlayer && onSelectPlayer(m.teamB2)}
                                className="flex items-center gap-2 cursor-pointer group"
                              >
                                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center">
                                  {getInitials(m.teamB2)}
                                </div>
                                <span className="font-extrabold text-slate-900 text-sm group-hover:text-brand-orange transition">
                                  {m.teamB2}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="text-2xl font-black font-mono text-emerald-700">
                              {m.scoreB}
                            </span>
                            {bWon && (
                              <span className="block text-[10px] font-black text-emerald-600 uppercase">
                                Winner
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Edit Mode Form */
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Edit Team A */}
                        <div className="space-y-2 p-3 bg-orange-50 rounded-2xl border border-orange-200">
                          <span className="text-[10px] font-black uppercase text-brand-orange">
                            Lineup Tim A &amp; Skor
                          </span>
                          <select
                            value={editState.pA1}
                            onChange={(e) => setEditState({ ...editState, pA1: e.target.value })}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                          >
                            {allPlayers.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>

                          {isDouble && (
                            <select
                              value={editState.pA2}
                              onChange={(e) => setEditState({ ...editState, pA2: e.target.value })}
                              className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                            >
                              <option value="">- Kosong -</option>
                              {allPlayers.map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                          )}

                          <input
                            type="number"
                            value={editState.scoreA}
                            onChange={(e) => setEditState({ ...editState, scoreA: e.target.value })}
                            className="w-full p-2 text-center bg-white border border-orange-300 rounded-xl text-lg font-black text-brand-orange"
                            placeholder="Skor Tim A"
                          />
                        </div>

                        {/* Edit Team B */}
                        <div className="space-y-2 p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                          <span className="text-[10px] font-black uppercase text-emerald-800">
                            Lineup Tim B &amp; Skor
                          </span>
                          <select
                            value={editState.pB1}
                            onChange={(e) => setEditState({ ...editState, pB1: e.target.value })}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                          >
                            {allPlayers.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>

                          {isDouble && (
                            <select
                              value={editState.pB2}
                              onChange={(e) => setEditState({ ...editState, pB2: e.target.value })}
                              className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                            >
                              <option value="">- Kosong -</option>
                              {allPlayers.map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                          )}

                          <input
                            type="number"
                            value={editState.scoreB}
                            onChange={(e) => setEditState({ ...editState, scoreB: e.target.value })}
                            className="w-full p-2 text-center bg-white border border-emerald-300 rounded-xl text-lg font-black text-emerald-700"
                            placeholder="Skor Tim B"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingMatchId(null)}
                          className="btn-secondary py-2 px-4 text-xs font-bold"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => saveEdit(m)}
                          className="btn-primary py-2 px-5 text-xs font-black"
                        >
                          Simpan Koreksi
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Archived Sessions List */
        archivedSessions.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl text-center text-slate-500 space-y-2 border-2 border-slate-200 shadow-card">
            <FolderArchive className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-black text-slate-700">Belum ada arsip sesi mabar.</p>
            <p className="text-xs text-slate-400">
              Setiap sesi mabar yang dimainkan akan terarsip otomatis di database cloud.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {archivedSessions.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-card space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-orange" />
                      {formatDate(s.createdAt)}
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                      {s.eventTitle}
                    </h4>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-black">
                    Host: {s.hostName || 'Admin'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                    {s.gameType === 'Double' ? 'Ganda' : 'Tunggal'} &middot; {s.courtCount} Court
                  </span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                    {s.matchCount} Match Selesai
                  </span>
                </div>

                {s.podium && s.podium.length > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1.5 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>Podium Juara</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {s.podium.slice(0, 3).map((pod) => (
                        <div key={pod.name} className="flex items-center gap-1.5">
                          <span className="text-xs">
                            {pod.place === 1 ? '🥇' : pod.place === 2 ? '🥈' : '🥉'}
                          </span>
                          <span className="text-xs font-extrabold text-slate-900 truncate">
                            {pod.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  {onSelectSession && (
                    <button
                      onClick={() => onSelectSession(s.id)}
                      className="btn-primary py-2.5 px-4 text-xs font-black flex-1 flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Buka Sesi Ini</span>
                    </button>
                  )}
                  {onOpenPosterForSession && (
                    <button
                      onClick={() => onOpenPosterForSession(s)}
                      className="btn-secondary py-2.5 px-4 text-xs font-bold flex-1 flex items-center justify-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Poster Sesi</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
