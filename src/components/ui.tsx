import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const getInitials = (name: string) => {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export type Tone = 'ball' | 'clay' | 'neutral';

const avatarTone: Record<Tone, string> = {
  ball: 'bg-ball text-ink-950',
  clay: 'bg-clay text-ink-950',
  neutral: 'bg-white/10 text-chalk',
};

export const Avatar: React.FC<{ name: string; tone?: Tone; size?: 'sm' | 'md' | 'lg' }> = ({
  name,
  tone = 'neutral',
  size = 'md',
}) => {
  const sizes = {
    sm: 'w-7 h-7 text-[10px] rounded-lg',
    md: 'w-9 h-9 text-xs rounded-xl',
    lg: 'w-14 h-14 text-base rounded-2xl',
  };
  return (
    <div
      className={`${sizes[size]} ${avatarTone[tone]} font-display font-extrabold flex items-center justify-center shrink-0`}
    >
      {getInitials(name)}
    </div>
  );
};

export const LiveDot: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`relative flex h-2.5 w-2.5 ${className}`}>
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ball opacity-70" />
    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ball" />
  </span>
);

/** Tennis ball mark drawn in SVG so it stays crisp and on-brand. */
export const BallMark: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
    <circle cx="24" cy="24" r="23" fill="#D8F53B" />
    <path
      d="M5 12c9 3 14 9.5 14 18S14 44 6 46M43 36c-9-3-14-9.5-14-18S34 4 42 2"
      fill="none"
      stroke="#07100B"
      strokeWidth="2.4"
      strokeLinecap="round"
      opacity=".85"
    />
  </svg>
);

export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
}> = ({ icon, title, body, action }) => (
  <div className="card animate-fade-up mx-auto max-w-md space-y-4 px-6 py-12 text-center">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-ball-soft text-ball">
      {icon}
    </div>
    <div className="space-y-1.5">
      <h3 className="font-display text-xl font-bold text-chalk">{title}</h3>
      {body && <p className="mx-auto max-w-xs text-sm leading-relaxed text-chalk/55">{body}</p>}
    </div>
    {action}
  </div>
);

/** Bottom sheet on mobile, centered dialog on larger screens. */
export const Sheet: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({
  onClose,
  children,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-ink-950/80 backdrop-blur-md sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-md animate-sheet-up overflow-y-auto rounded-t-[2rem] border border-white/10 bg-ink-800 p-6 pb-8 shadow-dock sm:rounded-[2rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15 sm:hidden" />
        <button
          onClick={onClose}
          aria-label="Tutup"
          className="absolute right-4 top-4 rounded-full bg-white/5 p-2 text-chalk/60 transition hover:bg-white/10 hover:text-chalk"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
};
