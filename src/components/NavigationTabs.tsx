import React from 'react';
import { Trophy, History, Settings2, Zap } from 'lucide-react';

export type TabType = 'courts' | 'standings' | 'history' | 'setup';

interface NavigationTabsProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  activeMatchCount: number;
  completedMatchCount: number;
  isSessionActive: boolean;
  currentRound: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  completedMatchCount,
  isSessionActive,
  currentRound,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'courts',
      label: 'Lapangan',
      icon: <Zap className="h-[18px] w-[18px]" />,
      badge: isSessionActive ? `R${currentRound}` : undefined,
    },
    { id: 'standings', label: 'Klasemen', icon: <Trophy className="h-[18px] w-[18px]" /> },
    {
      id: 'history',
      label: 'Riwayat',
      icon: <History className="h-[18px] w-[18px]" />,
      badge: completedMatchCount > 0 ? String(completedMatchCount) : undefined,
    },
    { id: 'setup', label: 'Setup', icon: <Settings2 className="h-[18px] w-[18px]" /> },
  ];

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex w-full max-w-md items-center gap-1 rounded-[1.75rem] border border-white/10 bg-ink-800/90 p-1.5 shadow-dock backdrop-blur-xl">
        {tabs.map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-1 select-none flex-col items-center justify-center gap-1 rounded-[1.25rem] py-2.5 text-[11px] font-bold transition-all duration-200 ${
                active ? 'bg-ball text-ink-950 shadow-ball' : 'text-chalk/55 hover:text-chalk'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.badge && (
                <span
                  className={`absolute right-2 top-1.5 min-w-[18px] rounded-full px-1 text-center text-[9px] font-extrabold leading-[16px] ${
                    active ? 'bg-ink-950 text-ball' : 'bg-white/10 text-chalk/80'
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
