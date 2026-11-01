import React, { useState } from 'react';
import { Match, GameType } from '../types/tennis';
import { History, Pencil, Check, X, ShieldAlert } from 'lucide-react';

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

export const MatchHistory: React.FC<MatchHistoryProps> = ({
  historyMatches,
  allPlayers,
  gameType,
  onEditMatch,
}) => {
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [editState, setEditState] = useState<{
    pA1: string;
    pA2: string;
    pB1: string;
    pB2: string;
    scoreA: string;
    scoreB: string;
  }>({ pA1: '', pA2: '', pB1: '', pB2: '', scoreA: '', scoreB: '' });

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

  const cancelEdit = () => {
    setEditingMatchId(null);
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

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between px-2 mb-2">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>Riwayat Pertandingan</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">Log semua match yang telah selesai</p>
        </div>
        <span className="text-xs font-black px-3 py-1 rounded-xl bg-white text-slate-700 border-2 border-slate-200 shadow-xs">
          {historyMatches.length} Selesai
        </span>
      </div>

      {historyMatches.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl text-center text-slate-500 space-y-2 border-2 border-slate-200 shadow-card">
          <History className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm font-bold">Belum ada pertandingan yang selesai.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {historyMatches.map((m) => {
            const isEditing = editingMatchId === m.id;
            const aWon = (m.scoreA ?? 0) > (m.scoreB ?? 0);
            const bWon = (m.scoreB ?? 0) > (m.scoreA ?? 0);

            const teamALabel = isDouble && m.teamA2 ? `${m.teamA1} & ${m.teamA2}` : m.teamA1;
            const teamBLabel = isDouble && m.teamB2 ? `${m.teamB1} & ${m.teamB2}` : m.teamB1;

            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition"
              >
                {!isEditing ? (
                  <div>
                    {/* Header info */}
                    <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2 font-black text-slate-900">
                        <span className="text-brand-orange">RONDE {m.round}</span>
                        <span>•</span>
                        <span>COURT {m.court}</span>
                      </div>
                      <button
                        onClick={() => startEdit(m)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-black text-xs uppercase transition px-2.5 py-1 rounded-lg hover:bg-blue-50"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Koreksi</span>
                      </button>
                    </div>

                    {/* Match Result Display */}
                    <div className="grid grid-cols-7 items-center gap-2 pt-3">
                      {/* Team A */}
                      <div
                        className={`col-span-3 text-right pr-2 ${
                          aWon ? 'font-black text-slate-900' : 'font-semibold text-slate-500'
                        }`}
                      >
                        <p className="text-xs sm:text-sm truncate">{teamALabel}</p>
                        {aWon && (
                          <span className="text-[10px] text-emerald-600 font-black uppercase">
                            ✓ Winner
                          </span>
                        )}
                      </div>

                      {/* Score Badge */}
                      <div className="col-span-1 flex justify-center">
                        <div className="px-3 py-1.5 rounded-xl bg-slate-50 border-2 border-slate-200 font-mono font-black text-sm sm:text-base text-slate-900 shadow-xs flex items-center gap-1.5">
                          <span className={aWon ? 'text-brand-orange' : 'text-slate-800'}>
                            {m.scoreA}
                          </span>
                          <span className="text-slate-300">-</span>
                          <span className={bWon ? 'text-emerald-600' : 'text-slate-800'}>
                            {m.scoreB}
                          </span>
                        </div>
                      </div>

                      {/* Team B */}
                      <div
                        className={`col-span-3 text-left pl-2 ${
                          bWon ? 'font-black text-slate-900' : 'font-semibold text-slate-500'
                        }`}
                      >
                        <p className="text-xs sm:text-sm truncate">{teamBLabel}</p>
                        {bWon && (
                          <span className="text-[10px] text-emerald-600 font-black uppercase">
                            ✓ Winner
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Mode Koreksi / Edit */
                  <div className="space-y-4 pt-1 bg-blue-50/50 p-3 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-1.5 text-xs font-black text-blue-700 uppercase tracking-wider">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Mode Koreksi Hasil Pertandingan</span>
                    </div>

                    <div className="grid grid-cols-7 items-center text-center gap-2">
                      {/* Team A dropdowns */}
                      <div className="col-span-2 space-y-1.5">
                        <select
                          value={editState.pA1}
                          onChange={(e) => setEditState({ ...editState, pA1: e.target.value })}
                          className="w-full bg-white border-2 border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-900 focus:outline-none"
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
                            className="w-full bg-white border-2 border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-900 focus:outline-none"
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

                      {/* Score A input */}
                      <div className="col-span-1">
                        <input
                          type="number"
                          value={editState.scoreA}
                          onChange={(e) => setEditState({ ...editState, scoreA: e.target.value })}
                          className="w-full h-11 bg-white border-2 border-brand-orange text-center rounded-xl font-black text-lg text-brand-orange focus:outline-none"
                        />
                      </div>

                      <div className="col-span-1 text-xs font-black text-slate-400">VS</div>

                      {/* Score B input */}
                      <div className="col-span-1">
                        <input
                          type="number"
                          value={editState.scoreB}
                          onChange={(e) => setEditState({ ...editState, scoreB: e.target.value })}
                          className="w-full h-11 bg-white border-2 border-emerald-600 text-center rounded-xl font-black text-lg text-emerald-600 focus:outline-none"
                        />
                      </div>

                      {/* Team B dropdowns */}
                      <div className="col-span-2 space-y-1.5">
                        <select
                          value={editState.pB1}
                          onChange={(e) => setEditState({ ...editState, pB1: e.target.value })}
                          className="w-full bg-white border-2 border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-900 focus:outline-none"
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
                            className="w-full bg-white border-2 border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-900 focus:outline-none"
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
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={cancelEdit}
                        className="btn-secondary py-2 px-4 text-xs font-bold"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => saveEdit(m)}
                        className="btn-primary py-2 px-5 text-xs font-black flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Simpan Koreksi</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
