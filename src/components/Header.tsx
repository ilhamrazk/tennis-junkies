import React from 'react';
import { QrCode, Share2, Eye, ShieldCheck, Wifi, Settings2 } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface HeaderProps {
  eventTitle: string;
  hostName: string;
  isSpectator: boolean;
  onToggleSpectator: () => void;
  onOpenQr: () => void;
  onOpenShare: () => void;
  onOpenSetup: () => void;
  hasStandings: boolean;
  isSessionActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  eventTitle,
  hostName,
  isSpectator,
  onToggleSpectator,
  onOpenQr,
  onOpenShare,
  onOpenSetup,
  hasStandings,
  isSessionActive,
}) => {
  return (
    <header className="bg-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-xl mb-6 border border-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Brand Logo & Event Tag */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-orange to-orange-500 shadow-brand shrink-0">
            <span className="text-2xl select-none">🎾</span>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white">
                THE JUNKIES <span className="text-brand-orange">CO.</span>
              </h1>
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                PRO ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-bold tracking-wide flex items-center gap-1.5 mt-0.5">
              <span>{eventTitle}</span>
              {hostName && (
                <>
                  <span className="text-white/20">•</span>
                  <span className="text-white">Host: {hostName}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Cloud Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              isSupabaseConfigured
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700/60'
                : 'bg-white/5 text-slate-300 border-white/10'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>{isSupabaseConfigured ? 'Cloud Live' : 'Local Cache'}</span>
          </div>

          {/* QR Lapangan Button */}
          <button
            onClick={onOpenQr}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl text-xs font-black border border-slate-700 transition active:scale-95 shadow-sm"
            title="Scan QR Code untuk penonton & pemain"
          >
            <QrCode className="w-4 h-4 text-brand-orange" />
            <span className="hidden sm:inline">QR Lapangan</span>
          </button>

          {/* Share Poster Button */}
          {hasStandings && (
            <button
              onClick={onOpenShare}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-black shadow-md transition active:scale-95"
              title="Unduh Poster Story Instagram / WA"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Poster</span>
            </button>
          )}

          {/* Setup Sesi Trigger */}
          <button
            onClick={onOpenSetup}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition active:scale-95"
            title="Buka Pengaturan Sesi"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* Spectator / Host View Toggle */}
          <button
            onClick={onToggleSpectator}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition active:scale-95 border ${
              isSpectator
                ? 'bg-brand-orange text-white border-brand-orange shadow-brand'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
            }`}
          >
            {isSpectator ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Host View</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-brand-orange" />
                <span className="hidden sm:inline">Spectator</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
