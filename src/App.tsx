import React, { useState, useEffect } from 'react';
import { useTennisSession } from './hooks/useTennisSession';
import { Header } from './components/Header';
import { NavigationTabs, TabType } from './components/NavigationTabs';
import { SessionSetup } from './components/SessionSetup';
import { ActiveMatches } from './components/ActiveMatches';
import { MatchHistory } from './components/MatchHistory';
import { Standings } from './components/Standings';
import { SpectatorView } from './components/SpectatorView';
import { QrModal } from './components/QrModal';
import { ShareModal } from './components/ShareModal';

export function App() {
  const {
    session,
    setSession,
    activeMatches,
    historyMatches,
    standings,
    lockSession,
    submitScore,
    updateMatchLineup,
    substitutePlayer,
    editCompletedMatch,
    resetSession,
  } = useTennisSession();

  const isSessionActive = session.status !== 'draft';

  // Navigation Tab State (defaults to 'setup' if draft, 'courts' if active)
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    return isSessionActive ? 'courts' : 'setup';
  });

  // Switch to courts tab automatically when session is locked
  const handleLockSession = () => {
    const success = lockSession();
    if (success) {
      setActiveTab('courts');
    }
  };

  // Modals & Spectator State
  const [isSpectator, setIsSpectator] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'spectator';
  });
  const [showQr, setShowQr] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Sync mode parameter to URL without page reload
  useEffect(() => {
    const url = new URL(window.location.href);
    if (isSpectator) {
      url.searchParams.set('mode', 'spectator');
    } else {
      url.searchParams.delete('mode');
    }
    window.history.replaceState({}, '', url.toString());
  }, [isSpectator]);

  return (
    <div className="min-h-screen px-4 pt-5 pb-32 sm:px-6 sm:pt-8 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Header Bar */}
        <Header
          eventTitle={session.eventTitle}
          hostName={session.hostName}
          isSpectator={isSpectator}
          onToggleSpectator={() => setIsSpectator(!isSpectator)}
          onOpenQr={() => setShowQr(true)}
          onOpenShare={() => setShowShare(true)}
          hasStandings={standings.length > 0}
          isSessionActive={isSessionActive}
        />

        {/* Spectator View Mode */}
        {isSpectator ? (
          <SpectatorView
            session={session}
            activeMatches={activeMatches}
            standings={standings}
            onBackToHost={() => setIsSpectator(false)}
          />
        ) : (
          /* Host / Tournament Manager View */
          <div>
            <NavigationTabs
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              activeMatchCount={activeMatches.length}
              completedMatchCount={historyMatches.length}
              isSessionActive={isSessionActive}
              currentRound={session.currentRound}
            />

            {/* Tab Views */}
            <main key={activeTab} className="animate-fade-in">
              {activeTab === 'courts' && (
                <ActiveMatches
                  currentRound={session.currentRound}
                  activeMatches={activeMatches}
                  allPlayers={session.players}
                  gameType={session.gameType}
                  onSubmitScore={submitScore}
                  onUpdateLineup={updateMatchLineup}
                  onOpenSetup={() => setActiveTab('setup')}
                  isSessionActive={isSessionActive}
                />
              )}

              {activeTab === 'standings' && (
                <Standings
                  standings={standings}
                  onOpenShare={() => setShowShare(true)}
                />
              )}

              {activeTab === 'history' && (
                <MatchHistory
                  historyMatches={historyMatches}
                  allPlayers={session.players}
                  gameType={session.gameType}
                  onEditMatch={editCompletedMatch}
                />
              )}

              {activeTab === 'setup' && (
                <SessionSetup
                  session={session}
                  onUpdateSession={(partial) => setSession((s) => ({ ...s, ...partial }))}
                  onLockSession={handleLockSession}
                  onSubstitutePlayer={substitutePlayer}
                  onResetSession={resetSession}
                  onCloseSetup={() => setActiveTab('courts')}
                />
              )}
            </main>
          </div>
        )}

        {/* QR Lapangan Modal */}
        {showQr && (
          <QrModal
            sessionId={session.id}
            eventTitle={session.eventTitle}
            onClose={() => setShowQr(false)}
          />
        )}

        {/* Share Story Poster Modal */}
        {showShare && (
          <ShareModal
            eventTitle={session.eventTitle}
            hostName={session.hostName}
            standings={standings}
            onClose={() => setShowShare(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
