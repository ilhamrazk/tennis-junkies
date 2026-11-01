import React from 'react';
import { Trophy, History, Settings, Flame } from 'lucide-react';

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
  activeMatchCount,
  completedMatchCount,
  isSessionActive,
  currentRound,
}) => {
  return (
    <div className="w-full flex justify-center mb-6">
      <div className="bg-white p-1.5 rounded-2xl flex items-center gap-1.5 max-w-2xl w-full border-2 border-slate-200 shadow-sm overflow-x-auto">
        {/* Tab 1: Lapangan */}
        <button
          onClick={() => onSelectTab('courts')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 select-none ${
            activeTab === 'courts'
              ? 'bg-brand-orange text-white shadow-brand'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Flame className={`w-4 h-4 ${activeTab === 'courts' ? 'text-white' : 'text-brand-orange'}`} />
          <span>Lapangan</span>
          {isSessionActive && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                activeTab === 'courts'
                  ? 'bg-black/20 text-white'
                  : 'bg-orange-100 text-brand-orange'
              }`}
            >
              R{currentRound}
            </span>
          )}
        </button>

        {/* Tab 2: Klasemen */}
        <button
          onClick={() => onSelectTab('standings')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 select-none ${
            activeTab === 'standings'
              ? 'bg-brand-orange text-white shadow-brand'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Trophy className={`w-4 h-4 ${activeTab === 'standings' ? 'text-white' : 'text-amber-500'}`} />
          <span>Klasemen</span>
        </button>

        {/* Tab 3: Riwayat */}
        <button
          onClick={() => onSelectTab('history')}
          className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 select-none ${
            activeTab === 'history'
              ? 'bg-brand-orange text-white shadow-brand'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className={`w-4 h-4 ${activeTab === 'history' ? 'text-white' : 'text-blue-500'}`} />
          <span>Riwayat</span>
          {completedMatchCount > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === 'history'
                  ? 'bg-black/20 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {completedMatchCount}
            </span>
          )}
        </button>

        {/* Tab 4: Setup */}
        <button
          onClick={() => onSelectTab('setup')}
          className={`py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 select-none ${
            activeTab === 'setup'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Konfigurasi Sesi Mabar"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Setup</span>
        </button>
      </div>
    </div>
  );
};
