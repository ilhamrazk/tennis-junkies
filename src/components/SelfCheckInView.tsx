import React, { useState } from 'react';
import { Session } from '../types/tennis';
import { BallMark, Avatar, LiveDot } from './ui';
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
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#D8F53B', '#FF7A45', '#F1F5EC'],
        });
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mendaftar. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSessionStarted = session.status !== 'draft';

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Top Banner */}
      <div className="card space-y-4 p-6 text-center">
        <BallMark className="mx-auto h-14 w-14 drop-shadow-[0_8px_20px_rgba(216,245,59,0.35)]" />
        <div>
          <div className="mb-1 flex items-center justify-center gap-2">
            <LiveDot />
            <span className="eyebrow !text-ball">Pendaftaran Mabar Mandiri</span>
          </div>
          <h2 className="font-display text-2xl font-black text-chalk">{session.eventTitle}</h2>
          <p className="mt-1 text-xs font-semibold text-chalk/50">
            Host: <span className="text-chalk/80">{session.hostName || 'Admin'}</span> &middot;{' '}
            {session.gameType === 'Double' ? 'Ganda' : 'Tunggal'} &middot; {session.courtCount} Court
          </p>
        </div>

        {/* Quota Progress */}
        <div className="space-y-1.5 text-left">
          <div className="flex justify-between text-xs font-bold text-chalk/60">
            <span>Kuota Peserta</span>
            <span className="num font-extrabold text-chalk">
              {session.players.length} / {maxLimit} Pemain
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFull ? 'bg-clay' : 'bg-ball'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Registration Form / Status */}
      {isSessionStarted ? (
        <div className="card space-y-3 border-ball/30 bg-ball-soft p-5 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-ball" />
          <h3 className="font-display text-lg font-bold text-chalk">Sesi Mabar Telah Dimulai!</h3>
          <p className="text-xs text-chalk/60">
            Pendaftaran sudah ditutup karena host telah mengunci rotasi lapangan. Silakan pantau giliran main kamu di
            live scoreboard.
          </p>
          <button onClick={onSwitchToSpectator} className="btn-primary w-full !py-3.5 !text-xs">
            <Eye className="h-4 w-4" />
            <span>Buka Live Score &amp; Giliran Main</span>
          </button>
        </div>
      ) : hasRegistered ? (
        <div className="card animate-fade-up space-y-4 border-ball/40 bg-ink-800 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-ball text-ink-950 font-black">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-display text-xl font-black text-chalk">Pendaftaran Berhasil!</h3>
            <p className="mt-1 text-sm text-chalk/70">
              Kamu terdaftar sebagai <span className="font-bold text-ball">{registeredAs}</span>.
            </p>
            <p className="mt-1 text-xs text-chalk/45">
              Tunggu Host memulai sesi mabar. Nama kamu sudah masuk ke antrian rotasi pertandingan!
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setHasRegistered(false)}
              className="btn-ghost flex-1 !py-3 text-xs"
            >
              Daftarkan Teman Lain
            </button>
            <button
              onClick={onSwitchToSpectator}
              className="btn-primary flex-1 !py-3 text-xs"
            >
              <Eye className="h-4 w-4" />
              <span>Lihat Lapangan</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-4 p-5">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-ball" />
            <h3 className="font-display text-lg font-bold text-chalk">Check-In / Masukkan Nama</h3>
          </div>

          <div>
            <label className="eyebrow mb-1.5 block !text-[10px]">Nama Kamu</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Contoh: Budi Santoso"
              disabled={isFull || isSubmitting}
              className="field !py-3.5 !text-base"
              autoFocus
            />
          </div>

          {errorMsg && (
            <p className="flex items-center gap-1.5 text-xs font-bold text-clay">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={isFull || isSubmitting || !playerName.trim()}
            className="btn-primary w-full !py-4 text-sm font-extrabold"
          >
            {isSubmitting ? (
              <span>Mendaftarkan...</span>
            ) : (
              <span>Daftar Sesi Mabar</span>
            )}
          </button>
        </form>
      )}

      {/* Live Registered Players List */}
      <div className="card space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-chalk/60" />
            <h4 className="font-display text-sm font-bold text-chalk">
              Pemain Terdaftar ({session.players.length})
            </h4>
          </div>
          <span className="text-[10px] font-bold text-ball uppercase">Update Otomatis</span>
        </div>

        {session.players.length === 0 ? (
          <p className="py-4 text-center text-xs text-chalk/40">Belum ada pemain yang check-in.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {session.players.map((p, idx) => (
              <div
                key={p + idx}
                className="flex items-center gap-2 rounded-xl bg-white/[0.04] p-2 transition hover:bg-white/[0.08]"
              >
                <Avatar name={p} tone="neutral" size="sm" />
                <span className="truncate text-xs font-bold text-chalk/90">{p}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Switch to Spectator Button */}
      <div className="text-center">
        <button
          onClick={onSwitchToSpectator}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-chalk/50 hover:text-ball transition"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Lihat Live Scoreboard / Mode Penonton</span>
        </button>
      </div>
    </div>
  );
};
