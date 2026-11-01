import React, { useState } from 'react';
import { Session, GameType } from '../types/tennis';
import { Lock, RotateCcw, UserPlus, AlertCircle, Check, Copy, KeyRound, Scale, Sparkles, UserCheck } from 'lucide-react';

interface SessionSetupProps {
  session: Session;
  onUpdateSession: (partial: Partial<Session>) => void;
  onLockSession: () => void;
  onSubstitutePlayer: (oldName: string, newName: string) => void;
  onResetSession: () => void;
  onCloseSetup?: () => void;
  onOpenRsvpView?: () => void;
}

const EVENTS = [
  'Tennis Junkies Beginner Game',
  'Tennis Junkies Upper Beginner Game',
  'Tennis Junkies Intermediate Game',
  'Tennis Junkies Single Game',
];

const HOSTS = ['Admin', 'Alfonso', 'Yessy', 'Jazzy', 'Fitha', 'Ezra'];

export const SessionSetup: React.FC<SessionSetupProps> = ({
  session,
  onUpdateSession,
  onLockSession,
  onSubstitutePlayer,
  onResetSession,
  onCloseSetup,
  onOpenRsvpView,
}) => {
  const isLocked = session.status !== 'draft';
  const [playerInput, setPlayerInput] = useState(session.players.join('\n'));
  const [showSubstitute, setShowSubstitute] = useState(false);
  const [subOldName, setSubOldName] = useState(session.players[0] || '');
  const [subNewName, setSubNewName] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Sync playerInput whenever session.players changes externally (e.g. from RSVP check-ins)
  React.useEffect(() => {
    setPlayerInput(session.players.join('\n'));
  }, [session.players]);

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

  const handleCopyRsvpLink = () => {
    const rsvpUrl = `${window.location.origin}${window.location.pathname}?mode=rsvp&session=${session.id}`;
    navigator.clipboard.writeText(rsvpUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
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
              className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black ml-auto flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sesi Ini</span>
            </button>
          </div>
        </div>
      )}

      {/* RSVP Self-Registration Card (Available in Draft) */}
      {!isLocked && (
        <div className="bg-orange-50/70 border-2 border-orange-200 p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-orange text-white flex items-center justify-center font-black text-xs shadow-xs">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-brand-orange tracking-wider">
                  Pendaftaran Mandiri Pemain (RSVP)
                </h4>
                <p className="text-xs text-slate-600 font-medium">
                  Bagikan link ke grup agar peserta bisa check-in sendiri dari HP masing-masing
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopyRsvpLink}
              className="py-2.5 px-4 rounded-xl bg-white hover:bg-orange-50 border-2 border-orange-300 text-slate-800 font-black text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-black">Link Berhasil Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-brand-orange" />
                  <span>Salin Link Check-In</span>
                </>
              )}
            </button>

            {onOpenRsvpView && (
              <button
                type="button"
                onClick={onOpenRsvpView}
                className="py-2.5 px-4 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <span>Buka Form RSVP &rarr;</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Configuration Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-card space-y-6">
        {/* 1. Pilih Event Title */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
            1. Jenis Event Mabar
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EVENTS.map((ev) => (
              <button
                key={ev}
                type="button"
                disabled={isLocked}
                onClick={() => onUpdateSession({ eventTitle: ev })}
                className={`p-3 text-left rounded-xl border-2 font-bold text-xs sm:text-sm transition-all ${
                  session.eventTitle === ev
                    ? 'border-brand-orange bg-orange-50 text-brand-orange'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                } disabled:opacity-60`}
              >
                {ev}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Pilih Host Name */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
            2. Host / Penanggung Jawab
          </label>
          <div className="flex flex-wrap gap-2">
            {HOSTS.map((h) => (
              <button
                key={h}
                type="button"
                disabled={isLocked}
                onClick={() => onUpdateSession({ hostName: h })}
                className={`py-2 px-4 rounded-xl border-2 font-extrabold text-xs transition-all ${
                  session.hostName === h
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                } disabled:opacity-60`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Format & Jumlah Court */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
              3. Format Pertandingan
            </label>
            <div className="flex gap-2">
              {(['Double', 'Single'] as GameType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  disabled={isLocked}
                  onClick={() => onUpdateSession({ gameType: type })}
                  className={`flex-1 py-3 px-3 rounded-xl border-2 font-black text-xs transition-all ${
                    session.gameType === type
                      ? 'border-brand-orange bg-orange-50 text-brand-orange'
                      : 'border-slate-200 text-slate-700 bg-white'
                  } disabled:opacity-60`}
                >
                  {type === 'Double' ? 'Ganda (Double)' : 'Tunggal (Single)'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
              4. Jumlah Court Tersedia
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((c) => (
                <button
                  key={c}
                  type="button"
                  disabled={isLocked}
                  onClick={() => onUpdateSession({ courtCount: c })}
                  className={`flex-1 py-3 rounded-xl border-2 font-black text-xs transition-all ${
                    session.courtCount === c
                      ? 'border-brand-orange bg-brand-orange text-white shadow-sm'
                      : 'border-slate-200 text-slate-700 bg-white'
                  } disabled:opacity-60`}
                >
                  {c} Court
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Matchmaking Mode & Host PIN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Matchmaking Mode Switch */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-brand-orange" />
              <span>5. Sistem Matchmaking</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isLocked}
                onClick={() => onUpdateSession({ matchmakingMode: 'fair' })}
                className={`p-2.5 rounded-xl border-2 font-bold text-xs text-left transition-all ${
                  (session.matchmakingMode || 'fair') === 'fair'
                    ? 'border-brand-orange bg-orange-50 text-brand-orange'
                    : 'border-slate-200 text-slate-700 bg-white'
                } disabled:opacity-60`}
              >
                <span className="block font-black">Acak &amp; Adil</span>
                <span className="block text-[10px] text-slate-500">Rotasi merata</span>
              </button>

              <button
                type="button"
                disabled={isLocked}
                onClick={() => onUpdateSession({ matchmakingMode: 'balanced' })}
                className={`p-2.5 rounded-xl border-2 font-bold text-xs text-left transition-all ${
                  session.matchmakingMode === 'balanced'
                    ? 'border-brand-orange bg-orange-50 text-brand-orange'
                    : 'border-slate-200 text-slate-700 bg-white'
                } disabled:opacity-60`}
              >
                <span className="block font-black flex items-center gap-1">
                  Balanced <Sparkles className="w-3 h-3 text-brand-orange" />
                </span>
                <span className="block text-[10px] text-slate-500">Kuat + Berkembang</span>
              </button>
            </div>
          </div>

          {/* Host PIN Security */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-brand-orange" />
              <span>6. PIN Host (4 Digit)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={4}
                disabled={isLocked}
                value={session.hostPin || '1234'}
                onChange={(e) =>
                  onUpdateSession({
                    hostPin: e.target.value.replace(/\D/g, '').slice(0, 4),
                  })
                }
                className="w-24 p-2.5 text-center font-mono font-black text-base border-2 border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:border-brand-orange"
                placeholder="1234"
              />
              <span className="text-[11px] text-slate-500 font-medium leading-tight">
                Proteksi aksi kunci, submit skor, dan reset.
              </span>
            </div>
          </div>
        </div>

        {/* 5. Daftar Pemain Textarea with Quota Meter */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
              7. Daftar Nama Pemain
            </label>
            <span
              className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                isOverLimit
                  ? 'bg-red-100 text-red-600'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {parsedPlayers.length} / {maxLimit} Pemain Max
            </span>
          </div>

          {/* Quota Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isOverLimit ? 'bg-red-500' : 'bg-brand-orange'
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
                <span>LOCK &amp; MULAI SESI MABAR</span>
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
