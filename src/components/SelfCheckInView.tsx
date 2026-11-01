import React, { useState } from 'react';
import { Session } from '../types/tennis';
import { UserCheck, Users, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SelfCheckInViewProps {
  session: Session;
  onRegisterPlayer: (playerName: string) => Promise<boolean> | boolean;
  onSwitchToSpectator: () => void;
}

export const SelfCheckInView: React.FC<SelfCheckInViewProps> = ({
  session,
  onRegisterPlayer,
  onSwitchToSpectator,
}) => {
  const [playerName, setPlayerName] = useState('');
  const [hasRegistered, setHasRegistered] = useState(false);
  const [registeredAs, setRegisteredAs] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const maxLimit = session.gameType === 'Single' ? 6 : session.courtCount * 8;
  const isFull = session.players.length >= maxLimit;
  const progressPercent = Math.min(100, Math.round((session.players.length / maxLimit) * 100));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = playerName.trim();
    if (!trimmed) {
      setErrorMsg('Masukkan nama kamu!');
      return;
    }

    if (session.players.map((p) => p.toLowerCase()).includes(trimmed.toLowerCase())) {
      setErrorMsg(`Nama "${trimmed}" sudah terdaftar dalam sesi ini!`);
      return;
    }

    if (isFull) {
      setErrorMsg(`Kuota mabar sudah penuh (${maxLimit} pemain).`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const ok = await onRegisterPlayer(trimmed);
      if (ok !== false) {
        setHasRegistered(true);
        setRegisteredAs(trimmed);
        setPlayerName('');
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF6B00', '#10B981', '#F59E0B'],
        });
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mendaftar. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const isSessionStarted = session.status !== 'draft';

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-card text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-orange-50 border-2 border-orange-200 flex items-center justify-center text-3xl mx-auto shadow-sm">
          🎾
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
            PENDAFTARAN MABAR MANDIRI
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{session.eventTitle}</h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Host: <span className="text-slate-900">{session.hostName || 'Admin'}</span> &bull;{' '}
            {session.gameType === 'Double' ? 'Ganda' : 'Tunggal'} &bull; {session.courtCount} Court
          </p>
        </div>

        {/* Quota Progress */}
        <div className="space-y-1.5 text-left pt-2">
          <div className="flex justify-between text-xs font-bold text-slate-600">
            <span>Kuota Peserta</span>
            <span className="font-mono font-black text-slate-900">
              {session.players.length} / {maxLimit} Pemain
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isFull ? 'bg-red-500' : 'bg-brand-orange'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Registration Form / Status */}
      {isSessionStarted ? (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 text-center space-y-3 shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-black text-slate-900">Sesi Mabar Telah Dimulai!</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Pendaftaran mandiri telah ditutup karena host sudah mengunci sesi rotasi lapangan. Silakan pantau giliran main kamu di live scoreboard.
          </p>
          <button onClick={onSwitchToSpectator} className="btn-primary w-full py-3.5 text-xs">
            <Eye className="w-4 h-4" />
            <span>Lihat Lapangan &amp; Giliran Main</span>
          </button>
        </div>
      ) : hasRegistered ? (
        <div className="bg-white rounded-3xl p-6 border-2 border-emerald-300 shadow-card text-center space-y-4 animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Pendaftaran Berhasil!</h3>
            <p className="text-sm text-slate-600 mt-1">
              Kamu terdaftar sebagai <strong className="text-brand-orange">{registeredAs}</strong>.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Nama kamu telah masuk ke antrian rotasi pertandingan host. Bersiap di lapangan!
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setHasRegistered(false)}
              className="btn-secondary flex-1 py-3 text-xs font-bold"
            >
              Daftarkan Teman Lain
            </button>
            <button
              onClick={onSwitchToSpectator}
              className="btn-primary flex-1 py-3 text-xs"
            >
              <Eye className="w-4 h-4" />
              <span>Lihat Lapangan</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-brand-orange" />
            <h3 className="text-base font-black text-slate-900">Check-In / Masukkan Nama Kamu</h3>
          </div>

          <div>
            <input
              type="text"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Contoh: Budi Santoso"
              disabled={isFull || isSubmitting}
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-orange focus:bg-white transition"
              autoFocus
            />
          </div>

          {errorMsg && (
            <p className="text-xs font-bold text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={isFull || isSubmitting || !playerName.trim()}
            className="w-full btn-primary py-4 text-sm font-black shadow-brand"
          >
            {isSubmitting ? <span>Mendaftarkan...</span> : <span>DAFTAR SESI MABAR</span>}
          </button>
        </form>
      )}

      {/* Live Registered Players List */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <h4 className="font-black text-sm text-slate-900">
              Pemain Terdaftar ({session.players.length})
            </h4>
          </div>
          <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Update Realtime
          </span>
        </div>

        {session.players.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-400 italic">Belum ada pemain yang check-in.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {session.players.map((p, idx) => (
              <div
                key={p + idx}
                className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-200 font-black text-[10px] text-slate-700 flex items-center justify-center shrink-0">
                  {getInitials(p)}
                </div>
                <span className="font-extrabold text-xs text-slate-900 truncate">{p}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Switch to Spectator Button */}
      <div className="text-center pt-2">
        <button
          onClick={onSwitchToSpectator}
          className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-brand-orange transition underline"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Lihat Live Scoreboard / Mode Penonton</span>
        </button>
      </div>
    </div>
  );
};
