import React, { useState } from 'react';
import { Session, GameType } from '../types/tennis';
import { Lock, RotateCcw, UserPlus, AlertCircle, Check } from 'lucide-react';

interface SessionSetupProps {
  session: Session;
  onUpdateSession: (partial: Partial<Session>) => void;
  onLockSession: () => void;
  onSubstitutePlayer: (oldName: string, newName: string) => void;
  onResetSession: () => void;
  onCloseSetup?: () => void;
}

export const SessionSetup: React.FC<SessionSetupProps> = ({
  session,
  onUpdateSession,
  onLockSession,
  onSubstitutePlayer,
  onResetSession,
  onCloseSetup,
}) => {
  const isLocked = session.status !== 'draft';
  const [playerInput, setPlayerInput] = useState(session.players.join('\n'));
  const [showSubstitute, setShowSubstitute] = useState(false);
  const [subOldName, setSubOldName] = useState(session.players[0] || '');
  const [subNewName, setSubNewName] = useState('');

  // Only sync when session is completely reset externally or session ID changes
  React.useEffect(() => {
    if (session.players.length === 0) {
      setPlayerInput('');
    }
  }, [session.id, session.players.length === 0]);

  const parsedPlayers = playerInput
    .split('\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const maxLimit = session.gameType === 'Single' ? 6 : session.courtCount * 8;
  const isOverLimit = parsedPlayers.length > maxLimit;
  const progressPercent = Math.min(100, Math.round((parsedPlayers.length / maxLimit) * 100));

  const handlePlayerInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPlayerInput(val);
    const updatedList = val
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    onUpdateSession({ players: updatedList });
  };

  const handleLockClick = () => {
    if (!session.hostName) {
      alert('Pilih Host / Penanggung Jawab terlebih dahulu!');
      return;
    }
    if (parsedPlayers.length === 0) {
      alert('Masukkan minimal 1 nama pemain!');
      return;
    }
    if (isOverLimit) {
      alert(`Jumlah peserta (${parsedPlayers.length}) melebihi kuota maksimal (${maxLimit})!`);
      return;
    }
    onUpdateSession({ players: parsedPlayers });
    onLockSession();
    if (onCloseSetup) onCloseSetup();
  };

  const handleApplySubstitute = () => {
    if (!subNewName.trim()) {
      alert('Masukkan nama pemain baru pengganti!');
      return;
    }
    onSubstitutePlayer(subOldName, subNewName.trim());
    const updated = playerInput.replace(new RegExp(`^${subOldName}$`, 'm'), subNewName.trim());
    setPlayerInput(updated);
    setSubNewName('');
    setShowSubstitute(false);
  };

  const handleResetClick = () => {
    if (
      confirm(
        'Apakah Anda yakin ingin mereset seluruh sesi mabar, riwayat pertandingan, dan klasemen untuk sesi ini?'
      )
    ) {
      onResetSession();
      setPlayerInput('');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Active Session Status Bar (if locked) */}
      {isLocked && (
        <div className="bg-emerald-50 border-2 border-emerald-300 p-5 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
                  SESI SEDANG BERJALAN AKTIF
                </span>
                <h3 className="text-base font-black text-slate-900">{session.eventTitle}</h3>
              </div>
            </div>

            <span className="px-3 py-1 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-slate-700 shadow-xs">
              Host: <span className="text-slate-900 font-black">{session.hostName}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-emerald-200">
            <button
              onClick={() => setShowSubstitute(!showSubstitute)}
              className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border-2 border-emerald-300 text-slate-800 font-black text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>Ganti / Substitusi Pemain</span>
            </button>

            <button
              onClick={handleResetClick}
              className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black ml-auto flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sesi</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Setup Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 border-2 border-orange-200 flex items-center justify-center text-brand-orange font-black text-xl shadow-xs">
              ⚙️
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">Konfigurasi Sesi Mabar</h2>
              <p className="text-xs text-slate-500 font-medium">Atur jenis event, lapangan, dan kuota pemain</p>
            </div>
          </div>

          {isLocked && (
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-black text-slate-600 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Terkunci
            </span>
          )}
        </div>

        <div className="space-y-5">
          {/* 1. Event Selection */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              Event / ID Mabar
            </label>
            <select
              disabled={isLocked}
              value={session.eventTitle}
              onChange={(e) => onUpdateSession({ eventTitle: e.target.value })}
              className="w-full bg-white border-2 border-slate-300 rounded-2xl p-3.5 text-sm font-extrabold text-slate-900 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100 disabled:text-slate-500 transition"
            >
              <option value="Tennis Junkies Beginner Game">Tennis Junkies Beginner Game</option>
              <option value="Tennis Junkies Upper Beginner Game">Tennis Junkies Upper Beginner Game</option>
              <option value="Tennis Junkies Intermediate Game">Tennis Junkies Intermediate Game</option>
              <option value="Tennis Junkies Single Game">Tennis Junkies Single Game</option>
            </select>
          </div>

          {/* 2. Host Selection */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              Host / Penanggung Jawab
            </label>
            <select
              disabled={isLocked}
              value={session.hostName}
              onChange={(e) => onUpdateSession({ hostName: e.target.value })}
              className="w-full bg-white border-2 border-slate-300 rounded-2xl p-3.5 text-sm font-extrabold text-slate-900 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100 disabled:text-slate-500 transition"
            >
              <option value="" disabled>-- Pilih Nama Host --</option>
              <option value="Admin">Admin</option>
              <option value="Alfonso">Alfonso</option>
              <option value="Yessy">Yessy</option>
              <option value="Jazzy">Jazzy</option>
              <option value="Fitha">Fitha</option>
              <option value="Ezra">Ezra</option>
            </select>
          </div>

          {/* 3. Game Type & Court Count (Interactive Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tipe Game */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                Tipe Permainan
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Double', 'Single'] as GameType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    disabled={isLocked}
                    onClick={() => onUpdateSession({ gameType: type })}
                    className={`py-3 px-3 rounded-2xl text-xs font-black transition border-2 ${
                      session.gameType === type
                        ? 'bg-orange-50 border-brand-orange text-brand-orange shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    } disabled:opacity-50`}
                  >
                    {type === 'Double' ? '👥 Double Game' : '👤 Single Game'}
                  </button>
                ))}
              </div>
            </div>

            {/* Jumlah Court */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                Jumlah Court
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((c) => (
                  <button
                    key={c}
                    type="button"
                    disabled={isLocked}
                    onClick={() => onUpdateSession({ courtCount: c })}
                    className={`py-3 rounded-2xl text-xs font-black transition border-2 ${
                      session.courtCount === c
                        ? 'bg-orange-50 border-brand-orange text-brand-orange shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    } disabled:opacity-50`}
                  >
                    {c} Court
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Daftar Pemain with Quota Bar */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Daftar Pemain (1 baris / nama)
                </label>
                {!isLocked && parsedPlayers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setPlayerInput('');
                      onUpdateSession({ players: [] });
                    }}
                    className="text-[11px] font-black text-red-500 hover:text-red-700 underline"
                  >
                    Kosongkan
                  </button>
                )}
              </div>

              <span
                className={`text-xs font-black px-3 py-1 rounded-lg border-2 ${
                  isOverLimit
                    ? 'bg-red-50 border-red-500 text-red-600'
                    : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                {parsedPlayers.length} / {maxLimit} Pemain
              </span>
            </div>

            {/* Quota Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-300 ${
                  isOverLimit
                    ? 'bg-red-500'
                    : 'bg-gradient-to-r from-brand-orange to-amber-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <textarea
              disabled={isLocked}
              rows={6}
              value={playerInput}
              onChange={handlePlayerInputChange}
              placeholder="Ketik 1 nama pemain per baris...&#10;Contoh:&#10;Raffi Ahmad&#10;Desta Mahendra&#10;Vincent Rompies"
              className={`w-full p-4 bg-white border-2 rounded-2xl font-bold text-base text-slate-900 placeholder-slate-400 focus:outline-none transition ${
                isOverLimit
                  ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                  : 'border-slate-300 focus:border-brand-orange focus:ring-2 focus:ring-orange-100'
              } disabled:bg-slate-100 disabled:text-slate-500`}
            />

            {isOverLimit && (
              <p className="text-xs text-red-600 font-bold flex items-center gap-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Kapasitas penuh! Hapus {parsedPlayers.length - maxLimit} nama sebelum Lock.</span>
              </p>
            )}
          </div>
        </div>

        {/* Panel Substitusi Pemain (Modal / Box) */}
        {showSubstitute && (
          <div className="p-5 rounded-2xl bg-orange-50 border-2 border-brand-orange space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-brand-orange tracking-wider flex items-center gap-1.5">
                <UserPlus className="w-4 h-4" />
                Substitusi / Ganti Nama Pemain
              </h4>
              <button
                onClick={() => setShowSubstitute(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Tutup
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Pemain Keluar
                </label>
                <select
                  value={subOldName}
                  onChange={(e) => setSubOldName(e.target.value)}
                  className="w-full p-3 border-2 border-slate-300 rounded-xl bg-white text-slate-900 font-extrabold text-sm"
                >
                  {session.players.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Pemain Pengganti Baru
                </label>
                <input
                  type="text"
                  value={subNewName}
                  onChange={(e) => setSubNewName(e.target.value)}
                  placeholder="Ketik nama baru..."
                  className="w-full p-3 border-2 border-slate-300 rounded-xl bg-white text-slate-900 font-extrabold text-sm focus:outline-none focus:border-brand-orange"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setShowSubstitute(false)}
                className="btn-secondary py-2 px-4 text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleApplySubstitute}
                className="btn-primary py-2 px-5 text-xs font-black"
              >
                Terapkan Ganti Nama
              </button>
            </div>
          </div>
        )}

        {/* Action Button: Lock or Start */}
        <div className="pt-2">
          {!isLocked ? (
            <div className="flex gap-3">
              <button
                onClick={handleLockClick}
                disabled={isOverLimit || parsedPlayers.length === 0}
                className="btn-primary py-4 px-6 text-sm flex-1 flex items-center justify-center gap-2 shadow-brand"
              >
                <Lock className="w-4 h-4" />
                <span>LOCK & MULAI SESI MABAR</span>
              </button>
              <button
                onClick={handleResetClick}
                className="btn-secondary px-5 py-4 text-xs font-bold text-slate-600 hover:text-red-600"
                title="Reset Form"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center pt-2">
              <p className="text-xs text-slate-500 font-medium">
                Sesi sedang berjalan. Buka tab <strong className="text-slate-900">Lapangan</strong> untuk memasukkan skor pertandingan.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
