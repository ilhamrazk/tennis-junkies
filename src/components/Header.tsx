import React from 'react';
import { QrCode, Share2, Eye, ShieldCheck, Cloud, CloudOff } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { BallMark } from './ui';

interface HeaderProps {
  eventTitle: string;
  hostName: string;
  isSpectator: boolean;
  onToggleSpectator: () => void;
  onOpenQr: () => void;
  onOpenShare: () => void;
  hasStandings: boolean;
  isSessionActive: boolean;
}

const iconBtn =
  'flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 text-chalk/80 transition hover:bg-white/10 hover:text-chalk active:scale-95';

export const Header: React.FC<HeaderProps> = ({
  eventTitle,
  hostName,
  isSpectator,
  onToggleSpectator,
  onOpenQr,
  onOpenShare,
  hasStandings,
  isSessionActive,
}) => {
  return (
    <header className="mb-6 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <BallMark className="h-11 w-11 shrink-0 drop-shadow-[0_6px_16px_rgba(216,245,59,0.35)]" />
        <div className="min-w-0">
          <h1 className="font-display text-xl font-extrabold leading-none tracking-tight">
            Junkies<span className="text-ball">.</span>
          </h1>
          <p className="mt-1 flex items-center gap-1.5 truncate text-xs font-medium text-chalk/50">
            <span className="truncate">{isSessionActive ? eventTitle : 'Belum ada sesi'}</span>
            {hostName && isSessionActive && (
              <>
                <span className="text-chalk/20">/</span>
                <span className="shrink-0 text-chalk/80">{hostName}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div
          className="hidden h-11 items-center gap-2 rounded-2xl px-3 text-xs font-bold text-chalk/60 md:flex"
          title={isSupabaseConfigured ? 'Tersinkron ke cloud' : 'Tersimpan di perangkat ini'}
        >
          {isSupabaseConfigured ? (
            <Cloud className="h-4 w-4 text-ball" />
          ) : (
            <CloudOff className="h-4 w-4" />
          )}
          <span>{isSupabaseConfigured ? 'Cloud live' : 'Lokal'}</span>
        </div>

        {!isSpectator && (
          <button onClick={onOpenQr} className={iconBtn} title="QR code untuk penonton" aria-label="QR Lapangan">
            <QrCode className="h-[18px] w-[18px]" />
          </button>
        )}

        {hasStandings && !isSpectator && (
          <button onClick={onOpenShare} className={iconBtn} title="Poster klasemen" aria-label="Poster">
            <Share2 className="h-[18px] w-[18px]" />
          </button>
        )}

        <button
          onClick={onToggleSpectator}
          className={
            isSpectator
              ? 'flex h-11 items-center gap-2 rounded-2xl bg-ball px-4 text-sm font-extrabold text-ink-950 shadow-ball transition active:scale-95'
              : iconBtn
          }
          title={isSpectator ? 'Kembali ke mode host' : 'Lihat sebagai penonton'}
        >
          {isSpectator ? (
            <>
              <ShieldCheck className="h-[18px] w-[18px]" />
              <span>Host</span>
            </>
          ) : (
            <>
              <Eye className="h-[18px] w-[18px]" />
              <span className="hidden text-sm font-bold sm:inline">Penonton</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
