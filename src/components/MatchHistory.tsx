import React, { useState } from 'react';
import { Match, GameType, ArchivedSession } from '../types/tennis';
import { History, Pencil, Check, FolderArchive, Play, Share2, Calendar, Trophy } from 'lucide-react';
import { EmptyState } from './ui';

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

const select =
  'w-full rounded-xl border border-white/10 bg-ink-900 px-3 py-2.5 text-sm font-semibold text-chalk focus:border-ball/70 focus:outline-none';

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

  const isDouble = gameType === 'Double';

  const PlayerSelects: React.FC<{ k1: 'pA1' | 'pB1'; k2: 'pA2' | 'pB2' }> = ({ k1, k2 }) => (
    <div className="space-y-1.5">
      <select
        value={editState[k1]}
        onChange={(e) => setEditState({ ...editState, [k1]: e.target.value })}
        className={select}
      >
        {allPlayers.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      {isDouble && (
        <select
          value={editState[k2]}
          onChange={(e) => setEditState({ ...editState, [k2]: e.target.value })}
          className={select}
        >
          <option value="">- Kosong -</option>
          {allPlayers.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      )}
    </div>
  );

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
    <div className="space-y-5">
      <div className="flex items-end justify-between px-1">
        <div>
          <p className="eyebrow mb-1">Log &amp; Arsip</p>
          <h2 className="font-display text-4xl font-extrabold leading-none tracking-tight">Riwayat</h2>
        </div>
      </div>

      {/* Sub Tabs: Sesi Ini vs Arsip Sesi Mabar */}
      <div className="flex rounded-2xl border border-white/10 bg-white/[0.03] p-1">
        <button
          onClick={() => setSubTab('current')}
          className={`flex-1 rounded-xl py-2.5 text-xs font-extrabold transition ${
            subTab === 'current' ? 'bg-ball text-ink-950 shadow-ball' : 'text-chalk/60 hover:text-chalk'
          }`}
        >
          Match Sesi Ini ({historyMatches.length})
        </button>
        <button
          onClick={() => setSubTab('archive')}
          className={`flex-1 rounded-xl py-2.5 text-xs font-extrabold transition ${
            subTab === 'archive' ? 'bg-ball text-ink-950 shadow-ball' : 'text-chalk/60 hover:text-chalk'
          }`}
        >
          Arsip Sesi Mabar ({archivedSessions.length})
        </button>
      </div>

      {subTab === 'current' ? (
        historyMatches.length === 0 ? (
          <EmptyState
            icon={<History className="h-8 w-8" />}
            title="Belum ada pertandingan selesai"
            body="Pertandingan yang telah selesai dan disimpan akan muncul di sini."
          />
        ) : (
          <div className="space-y-3">
            {historyMatches.map((m, i) => {
              const isEditing = editingMatchId === m.id;
              const aWon = (m.scoreA ?? 0) > (m.scoreB ?? 0);
              const bWon = (m.scoreB ?? 0) > (m.scoreA ?? 0);

              return (
                <article
                  key={m.id}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className="card animate-fade-up p-4 transition-colors hover:border-white/15"
                >
                  <div className="mb-3 flex items-center justify-between text-xs font-bold text-chalk/45">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-chalk/75">
                        Ronde {m.round}
                      </span>
                      <span>Court {m.court}</span>
                    </div>
                    {!isEditing ? (
                      <button
                        onClick={() => startEdit(m)}
                        className="flex items-center gap-1 text-chalk/50 hover:text-ball transition"
                      >
                        <Pencil className="h-3 w-3" />
                        <span>Koreksi</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => saveEdit(m)}
                        className="flex items-center gap-1 font-bold text-ball hover:underline"
                      >
                        <Check className="h-3 w-3" />
                        <span>Simpan</span>
                      </button>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                      {/* Team A */}
                      <div className="min-w-0 space-y-0.5 border-l-4 border-ball pl-3">
                        {[m.teamA1, isDouble ? m.teamA2 : ''].filter(Boolean).map((n) => (
                          <p
                            key={n}
                            onClick={() => onSelectPlayer && onSelectPlayer(n)}
                            className="cursor-pointer truncate text-sm font-bold text-chalk hover:text-ball transition"
                            title="Tap untuk lihat profil"
                          >
                            {n}
                          </p>
                        ))}
                      </div>

                      {/* Score Box */}
                      <div className="num flex items-center gap-2 rounded-xl bg-ink-900/90 px-3 py-1.5 text-xl font-extrabold">
                        <span className={aWon ? 'text-ball' : 'text-chalk/40'}>{m.scoreA}</span>
                        <span className="text-xs text-chalk/25">-</span>
                        <span className={bWon ? 'text-clay' : 'text-chalk/40'}>{m.scoreB}</span>
                      </div>

                      {/* Team B */}
                      <div className="min-w-0 space-y-0.5 border-r-4 border-clay pr-3 text-right">
                        {[m.teamB1, isDouble ? m.teamB2 : ''].filter(Boolean).map((n) => (
                          <p
                            key={n}
                            onClick={() => onSelectPlayer && onSelectPlayer(n)}
                            className="cursor-pointer truncate text-sm font-bold text-chalk hover:text-clay transition"
                            title="Tap untuk lihat profil"
                          >
                            {n}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Edit Form */
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="eyebrow mb-1.5 !text-[10px] !text-ball">Tim A</p>
                          <PlayerSelects k1="pA1" k2="pA2" />
                        </div>
                        <div>
                          <p className="eyebrow mb-1.5 !text-[10px] !text-clay">Tim B</p>
                          <PlayerSelects k1="pB1" k2="pB2" />
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="number"
                          value={editState.scoreA}
                          onChange={(e) => setEditState({ ...editState, scoreA: e.target.value })}
                          className="field !w-20 text-center font-display text-xl font-black"
                        />
                        <span className="font-extrabold text-chalk/30">-</span>
                        <input
                          type="number"
                          value={editState.scoreB}
                          onChange={(e) => setEditState({ ...editState, scoreB: e.target.value })}
                          className="field !w-20 text-center font-display text-xl font-black"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingMatchId(null)}
                          className="btn-ghost !py-2 !text-xs"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => saveEdit(m)}
                          className="btn-primary !px-4 !py-2 !text-xs"
                        >
                          Simpan Koreksi
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )
      ) : (
        /* Archived Sessions List */
        archivedSessions.length === 0 ? (
          <EmptyState
            icon={<FolderArchive className="h-8 w-8" />}
            title="Belum ada arsip sesi"
            body="Sesi mabar yang dibuat dan dimainkan akan otomatis terarsip di cloud database."
          />
        ) : (
          <div className="space-y-3.5">
            {archivedSessions.map((s) => (
              <div key={s.id} className="card space-y-3 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="eyebrow flex items-center gap-1 !text-[10px]">
                      <Calendar className="h-3 w-3" />
                      {formatDate(s.createdAt)}
                    </span>
                    <h4 className="mt-0.5 font-display text-base font-bold text-chalk">{s.eventTitle}</h4>
                  </div>
                  <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-xs font-bold text-chalk/70">
                    Host: {s.hostName || 'Admin'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-chalk/65">
                  <span className="rounded-lg bg-white/[0.04] px-2 py-0.5">
                    {s.gameType === 'Double' ? 'Ganda' : 'Tunggal'} &middot; {s.courtCount} Lapangan
                  </span>
                  <span className="rounded-lg bg-white/[0.04] px-2 py-0.5">
                    {s.matchCount} Match Selesai
                  </span>
                </div>

                {s.podium && s.podium.length > 0 && (
                  <div className="rounded-xl border border-white/[0.06] bg-black/20 p-2.5">
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold text-chalk/50 uppercase tracking-wider">
                      <Trophy className="h-3 w-3 text-ball" />
                      <span>Podium Juara</span>
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

                <div className="flex gap-2 pt-1">
                  {onSelectSession && (
                    <button
                      onClick={() => onSelectSession(s.id)}
                      className="btn-primary flex-1 !py-2.5 !text-xs font-extrabold"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Buka Sesi Ini</span>
                    </button>
                  )}
                  {onOpenPosterForSession && (
                    <button
                      onClick={() => onOpenPosterForSession(s)}
                      className="btn-ghost flex-1 !py-2.5 !text-xs font-bold"
                    >
                      <Share2 className="h-3.5 w-3.5" />
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
