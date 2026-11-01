import React, { useState } from 'react';
import { Match, GameType } from '../types/tennis';
import { History, Pencil, Check } from 'lucide-react';
import { EmptyState } from './ui';

interface MatchHistoryProps {
  historyMatches: Match[];
  allPlayers: string[];
  gameType: GameType;
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
  onEditMatch,
}) => {
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

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between px-1">
        <div>
          <p className="eyebrow mb-1">Log pertandingan</p>
          <h2 className="font-display text-4xl font-extrabold leading-none tracking-tight">Riwayat</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-bold text-chalk/70">
          {historyMatches.length} selesai
        </span>
      </div>

      {historyMatches.length === 0 ? (
        <EmptyState
          icon={<History className="h-8 w-8" />}
          title="Belum ada match selesai"
          body="Hasil pertandingan yang sudah disimpan akan muncul di sini dan bisa dikoreksi kapan saja."
        />
      ) : (
        <div className="space-y-3">
          {historyMatches.map((m, i) => {
            const isEditing = editingMatchId === m.id;
            const a = m.scoreA ?? 0;
            const b = m.scoreB ?? 0;
            const aWon = a > b;
            const bWon = b > a;
            const teamA = [m.teamA1, isDouble ? m.teamA2 : ''].filter(Boolean);
            const teamB = [m.teamB1, isDouble ? m.teamB2 : ''].filter(Boolean);

            return (
              <article
                key={m.id}
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                className="card animate-fade-up p-4 sm:p-5"
              >
                {!isEditing ? (
                  <>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="eyebrow">
                        Ronde {m.round} &middot; Court {m.court}
                      </span>
                      <button
                        onClick={() => startEdit(m)}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-chalk/60 transition hover:bg-white/10 hover:text-chalk"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Koreksi</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                      <div className={`min-w-0 text-right ${aWon ? 'text-chalk' : 'text-chalk/45'}`}>
                        {teamA.map((n) => (
                          <p key={n} className={`truncate text-sm ${aWon ? 'font-extrabold' : 'font-semibold'}`}>
                            {n}
                          </p>
                        ))}
                      </div>

                      <div className="num flex items-center gap-2 rounded-2xl bg-ink-900 px-4 py-2 text-3xl font-extrabold">
                        <span className={aWon ? 'text-ball' : 'text-chalk/50'}>{a}</span>
                        <span className="text-lg text-chalk/20">:</span>
                        <span className={bWon ? 'text-clay' : 'text-chalk/50'}>{b}</span>
                      </div>

                      <div className={`min-w-0 ${bWon ? 'text-chalk' : 'text-chalk/45'}`}>
                        {teamB.map((n) => (
                          <p key={n} className={`truncate text-sm ${bWon ? 'font-extrabold' : 'font-semibold'}`}>
                            {n}
                          </p>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="eyebrow !text-ball">
                      Koreksi &middot; Ronde {m.round} &middot; Court {m.court}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <p className="eyebrow !text-[10px] !text-ball">Tim A</p>
                        <PlayerSelects k1="pA1" k2="pA2" />
                        <input
                          type="number"
                          inputMode="numeric"
                          value={editState.scoreA}
                          onChange={(e) => setEditState({ ...editState, scoreA: e.target.value })}
                          className="num h-14 w-full rounded-xl border border-ball/50 bg-ink-900 text-center text-3xl font-extrabold text-ball focus:outline-none focus:ring-4 focus:ring-ball/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="eyebrow !text-[10px] !text-clay">Tim B</p>
                        <PlayerSelects k1="pB1" k2="pB2" />
                        <input
                          type="number"
                          inputMode="numeric"
                          value={editState.scoreB}
                          onChange={(e) => setEditState({ ...editState, scoreB: e.target.value })}
                          className="num h-14 w-full rounded-xl border border-clay/50 bg-ink-900 text-center text-3xl font-extrabold text-clay focus:outline-none focus:ring-4 focus:ring-clay/10"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingMatchId(null)} className="btn-ghost !py-2.5 !text-xs">
                        Batal
                      </button>
                      <button onClick={() => saveEdit(m)} className="btn-primary !px-5 !py-2.5 !text-xs">
                        <Check className="h-4 w-4" strokeWidth={3} />
                        <span>Simpan</span>
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
