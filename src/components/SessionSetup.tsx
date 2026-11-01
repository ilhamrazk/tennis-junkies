import React, { useState } from 'react';
import { Session, GameType, MatchmakingMode } from '../types/tennis';
import { Lock, RotateCcw, UserPlus, AlertCircle, Users, User, Play, Sparkles, Scale, QrCode, Copy, Check, KeyRound } from 'lucide-react';
import { LiveDot } from './ui';

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
  { title: 'Tennis Junkies Beginner Game', level: 'Beginner' },
  { title: 'Tennis Junkies Upper Beginner Game', level: 'Upper Beginner' },
  { title: 'Tennis Junkies Intermediate Game', level: 'Intermediate' },
  { title: 'Tennis Junkies Single Game', level: 'Single' },
];

const HOSTS = ['Admin', 'Alfonso', 'Yessy', 'Jazzy', 'Fitha', 'Ezra'];

const Step: React.FC<{
  n: number;
  title: string;
  hint?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}> = ({ n, title, hint, right, children }) => (
  <section className="space-y-3">
    <div className="flex items-end justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="num flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.07] text-xs font-extrabold text-ball">
          {n}
        </span>
        <div>
          <h3 className="font-display text-lg font-bold leading-tight">{title}</h3>
          {hint && <p className="text-xs text-chalk/45">{hint}</p>}
        </div>
      </div>
      {right}
    </div>
    {children}
  </section>
);

const choice = (active: boolean) =>
  `rounded-2xl border px-3 py-3.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
    active
      ? 'border-ball bg-ball-soft text-ball'
      : 'border-white/10 bg-white/[0.03] text-chalk/65 hover:border-white/25 hover:text-chalk'
  }`;

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
    <div className="mx-auto max-w-xl space-y-6">
      <div className="px-1">
        <p className="eyebrow mb-1">{isLocked ? 'Sesi terkunci' : 'Sesi baru'}</p>
        <h2 className="font-display text-4xl font-extrabold leading-none tracking-tight">Setup Sesi</h2>
      </div>

      {isLocked && (
        <div className="card animate-fade-up space-y-4 !border-ball/30 bg-ball-soft p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <LiveDot />
              <div className="min-w-0">
                <p className="eyebrow !text-[10px] !text-ball">Sesi aktif</p>
                <h3 className="truncate font-display text-base font-bold">{session.eventTitle}</h3>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
              Host: {session.hostName}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowSubstitute(!showSubstitute)} className="btn-ghost !py-2.5 !text-xs">
              <UserPlus className="h-4 w-4" />
              <span>Ganti pemain</span>
            </button>
            <button
              onClick={handleResetClick}
              className="btn-ghost ml-auto !border-red-400/30 !py-2.5 !text-xs !text-red-300 hover:!bg-red-500/10"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset sesi</span>
            </button>
          </div>
        </div>
      )}

      {showSubstitute && (
        <div className="card animate-fade-up space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-base font-bold">Substitusi pemain</h4>
            <button onClick={() => setShowSubstitute(false)} className="text-xs font-bold text-chalk/50 hover:text-chalk">
              Tutup
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="eyebrow mb-1.5 block !text-[10px]">Pemain keluar</label>
              <select value={subOldName} onChange={(e) => setSubOldName(e.target.value)} className="field">
                {session.players.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="eyebrow mb-1.5 block !text-[10px]">Pengganti</label>
              <input
                type="text"
                value={subNewName}
                onChange={(e) => setSubNewName(e.target.value)}
                placeholder="Nama baru"
                className="field"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowSubstitute(false)} className="btn-ghost !py-2.5 !text-xs">
              Batal
            </button>
            <button onClick={handleApplySubstitute} className="btn-primary !px-5 !py-2.5 !text-xs">
              Terapkan
            </button>
          </div>
        </div>
      )}

      {/* RSVP Self-Registration Banner */}
      {!isLocked && (
        <div className="card space-y-3.5 border-ball/30 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ball text-ink-950 font-black text-xs">
                RSVP
              </span>
              <div>
                <h4 className="font-display text-sm font-bold text-chalk">Pendaftaran Mandiri Pemain</h4>
                <p className="text-[11px] text-chalk/50">Bagikan link ini agar peserta bisa check-in sendiri</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopyRsvpLink}
              className="btn-ghost flex-1 !py-2.5 !text-xs"
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4 text-ball" />
                  <span className="text-ball">Link Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Salin Link Check-In</span>
                </>
              )}
            </button>

            {onOpenRsvpView && (
              <button
                type="button"
                onClick={onOpenRsvpView}
                className="btn-ghost !py-2.5 !text-xs"
                title="Buka form RSVP sekarang"
              >
                <span>Buka Form RSVP &rarr;</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="card space-y-8 p-5 sm:p-7">
        <Step n={1} title="Pilih event">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {EVENTS.map((e) => (
              <button
                key={e.title}
                type="button"
                disabled={isLocked}
                onClick={() => onUpdateSession({ eventTitle: e.title })}
                className={`${choice(session.eventTitle === e.title)} text-left`}
              >
                <span className="eyebrow block !text-[10px] !text-current opacity-60">Tennis Junkies</span>
                <span className="font-display text-base">{e.level}</span>
              </button>
            ))}
          </div>
        </Step>

        <Step n={2} title="Siapa host-nya?">
          <div className="flex flex-wrap gap-2">
            {HOSTS.map((h) => (
              <button
                key={h}
                type="button"
                disabled={isLocked}
                onClick={() => onUpdateSession({ hostName: h })}
                className={`${choice(session.hostName === h)} !rounded-full !px-5 !py-2.5`}
              >
                {h}
              </button>
            ))}
          </div>
        </Step>

        <Step n={3} title="Format &amp; Mode Matchmaking">
          {/* Double vs Single */}
          <div className="grid grid-cols-2 gap-2">
            {(['Double', 'Single'] as GameType[]).map((type) => (
              <button
                key={type}
                type="button"
                disabled={isLocked}
                onClick={() => onUpdateSession({ gameType: type })}
                className={`${choice(session.gameType === type)} flex items-center justify-center gap-2`}
              >
                {type === 'Double' ? <Users className="h-4 w-4" /> : <User className="h-4 w-4" />}
                <span>{type === 'Double' ? 'Ganda (Double)' : 'Tunggal (Single)'}</span>
              </button>
            ))}
          </div>

          {/* Court Count */}
          <div>
            <p className="eyebrow mb-2 !text-[10px]">Jumlah court</p>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((c) => (
                <button
                  key={c}
                  type="button"
                  disabled={isLocked}
                  onClick={() => onUpdateSession({ courtCount: c })}
                  className={`${choice(session.courtCount === c)} num !py-3 text-xl`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Smart Balanced Matchmaking Toggle */}
          <div className="pt-2">
            <p className="eyebrow mb-2 flex items-center gap-1.5 !text-[10px] !text-ball">
              <Scale className="h-3.5 w-3.5" />
              <span>Sistem Rotasi Matchmaking</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isLocked}
                onClick={() => onUpdateSession({ matchmakingMode: 'fair' })}
                className={`${choice((session.matchmakingMode || 'fair') === 'fair')} text-left !p-3`}
              >
                <span className="block font-display text-sm font-bold">Acak &amp; Adil</span>
                <span className="block text-[11px] opacity-60">Rotasi merata &amp; variasi partner baru</span>
              </button>

              <button
                type="button"
                disabled={isLocked}
                onClick={() => onUpdateSession({ matchmakingMode: 'balanced' })}
                className={`${choice(session.matchmakingMode === 'balanced')} text-left !p-3`}
              >
                <div className="flex items-center gap-1">
                  <span className="block font-display text-sm font-bold">Skill-Balanced</span>
                  <Sparkles className="h-3.5 w-3.5 text-ball" />
                </div>
                <span className="block text-[11px] opacity-60">Pasangkan kuat &amp; berkembang agar seimbang</span>
              </button>
            </div>
          </div>

          {/* Host PIN Security Setting */}
          <div className="pt-2">
            <p className="eyebrow mb-2 flex items-center gap-1.5 !text-[10px]">
              <KeyRound className="h-3.5 w-3.5 text-ball" />
              <span>PIN Keamanan Host (4 Digit)</span>
            </p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                maxLength={4}
                disabled={isLocked}
                value={session.hostPin || '1234'}
                onChange={(e) => onUpdateSession({ hostPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                className="field !w-32 text-center tracking-widest font-display text-lg font-black"
                placeholder="1234"
              />
              <span className="text-xs text-chalk/45 leading-tight">
                Mencegah penonton mengedit skor atau mereset turnamen. (Default: 1234)
              </span>
            </div>
          </div>
        </Step>

        <Step
          n={4}
          title="Daftar pemain"
          hint="Satu nama per baris (atau daftar mandiri via link RSVP di atas)"
          right={
            <div className="flex items-center gap-3">
              {!isLocked && parsedPlayers.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setPlayerInput('');
                    onUpdateSession({ players: [] });
                  }}
                  className="text-xs font-bold text-chalk/45 underline-offset-2 hover:text-red-300 hover:underline"
                >
                  Kosongkan
                </button>
              )}
              <span
                className={`num rounded-full px-3 py-1 text-sm font-extrabold ${
                  isOverLimit ? 'bg-red-500/20 text-red-300' : 'bg-white/[0.07] text-chalk'
                }`}
              >
                {parsedPlayers.length}
                <span className="text-chalk/40"> / {maxLimit}</span>
              </span>
            </div>
          }
        >
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${isOverLimit ? 'bg-red-400' : 'bg-ball'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <textarea
            disabled={isLocked}
            rows={7}
            value={playerInput}
            onChange={handlePlayerInputChange}
            placeholder={'Raffi Ahmad\nDesta Mahendra\nVincent Rompies'}
            className={`field !text-base leading-7 ${isOverLimit ? '!border-red-400/60' : ''}`}
          />

          {isOverLimit && (
            <p className="flex items-center gap-1.5 text-xs font-bold text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Kapasitas penuh. Hapus {parsedPlayers.length - maxLimit} nama sebelum mengunci sesi.</span>
            </p>
          )}
        </Step>

        {!isLocked ? (
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleLockClick}
              disabled={isOverLimit || parsedPlayers.length === 0}
              className="btn-primary flex-1 !py-4 text-base"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Kunci &amp; mulai sesi</span>
            </button>
            <button onClick={handleResetClick} className="btn-ghost !px-4" title="Reset form" aria-label="Reset form">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <p className="flex items-center justify-center gap-2 pt-1 text-center text-xs text-chalk/50">
            <Lock className="h-3.5 w-3.5" />
            <span>Pengaturan terkunci. Skor diinput di tab Lapangan.</span>
          </p>
        )}
      </div>
    </div>
  );
};
