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
import { PlayerProfileModal } from './components/PlayerProfileModal';
import { SessionArchiveModal } from './components/SessionArchiveModal';
import { HostPinModal } from './components/HostPinModal';
import { SelfCheckInView } from './components/SelfCheckInView';
import { ArchivedSession } from './types/tennis';

export function App() {
  const {
    session,
    setSession,
    activeMatches,
    historyMatches,
    standings,
    allTimeStats,
    archivedSessions,
    isArchiveLoading,
    refreshArchive,
    switchSession,
    registerRsvp,
    isHostUnlocked,
    unlockHost,
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

  // Modals & View Modes
  const [isSpectator, setIsSpectator] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'spectator';
  });

  const [isRsvpMode, setIsRsvpMode] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'rsvp';
  });

  const [showQr, setShowQr] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [selectedPlayerForProfile, setSelectedPlayerForProfile] = useState<string | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showHostPinModal, setShowHostPinModal] = useState(false);
  const [archivedSessionForPoster, setArchivedSessionForPoster] = useState<ArchivedSession | null>(null);

  // Sync mode parameter to URL without page reload
  useEffect(() => {
    const url = new URL(window.location.href);
    if (isRsvpMode) {
      url.searchParams.set('mode', 'rsvp');
    } else if (isSpectator) {
      url.searchParams.set('mode', 'spectator');
    } else {
      url.searchParams.delete('mode');
    }
    window.history.replaceState({}, '', url.toString());
  }, [isSpectator, isRsvpMode]);

  // Find career stats and current standing for selected player in profile modal
  const selectedCareerStats = selectedPlayerForProfile
    ? allTimeStats.find((s) => s.name.toLowerCase() === selectedPlayerForProfile.toLowerCase())
    : undefined;

  const selectedCurrentStanding = selectedPlayerForProfile
    ? standings.find((s) => s.name.toLowerCase() === selectedPlayerForProfile.toLowerCase())
    : undefined;

  return (
    <div className="min-h-screen px-4 pt-5 pb-32 sm:px-6 sm:pt-8 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Header Bar */}
        <Header
          eventTitle={session.eventTitle}
          hostName={session.hostName}
          isSpectator={isSpectator || isRsvpMode}
          isHostUnlocked={isHostUnlocked}
          onToggleSpectator={() => {
            if (isRsvpMode) {
              setIsRsvpMode(false);
              setIsSpectator(false);
            } else {
              setIsSpectator(!isSpectator);
            }
          }}
          onOpenQr={() => setShowQr(true)}
          onOpenShare={() => setShowShare(true)}
          onOpenArchive={() => setShowArchiveModal(true)}
          onRequestUnlockHost={() => setShowHostPinModal(true)}
          hasStandings={standings.length > 0}
          isSessionActive={isSessionActive}
        />

        {/* View Router */}
        {isRsvpMode ? (
          /* Feature 4: Self Check-In / RSVP View */
          <SelfCheckInView
            session={session}
            onRegisterPlayer={registerRsvp}
            onSwitchToSpectator={() => {
              setIsRsvpMode(false);
              setIsSpectator(true);
            }}
          />
        ) : isSpectator ? (
          /* Spectator View Mode */
          <SpectatorView
            session={session}
            activeMatches={activeMatches}
            standings={standings}
            onSelectPlayer={(name) => setSelectedPlayerForProfile(name)}
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
                  isHostUnlocked={isHostUnlocked}
                  onRequestUnlockHost={() => setShowHostPinModal(true)}
                  onSubmitScore={submitScore}
                  onUpdateLineup={updateMatchLineup}
                  onOpenSetup={() => setActiveTab('setup')}
                  onSelectPlayer={(name) => setSelectedPlayerForProfile(name)}
                  isSessionActive={isSessionActive}
                />
              )}

              {activeTab === 'standings' && (
                <Standings
                  standings={standings}
                  allTimeStats={allTimeStats}
                  onOpenShare={() => setShowShare(true)}
                  onSelectPlayer={(name) => setSelectedPlayerForProfile(name)}
                />
              )}

              {activeTab === 'history' && (
                <MatchHistory
                  historyMatches={historyMatches}
                  allPlayers={session.players}
                  gameType={session.gameType}
                  archivedSessions={archivedSessions}
                  isHostUnlocked={isHostUnlocked}
                  onRequestUnlockHost={() => setShowHostPinModal(true)}
                  onSelectSession={(sessId) => switchSession(sessId)}
                  onOpenPosterForSession={(sess) => {
                    setArchivedSessionForPoster(sess);
                    setShowShare(true);
                  }}
                  onSelectPlayer={(name) => setSelectedPlayerForProfile(name)}
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
                  onOpenRsvpView={() => setIsRsvpMode(true)}
                />
              )}
            </main>
          </div>
        )}

        {/* Feature 1: Player Career Profile Modal */}
        {selectedPlayerForProfile && (
          <PlayerProfileModal
            playerName={selectedPlayerForProfile}
            careerStats={selectedCareerStats}
            currentStanding={selectedCurrentStanding}
            onClose={() => setSelectedPlayerForProfile(null)}
          />
        )}

        {/* Feature 2: Session Archive Modal */}
        {showArchiveModal && (
          <SessionArchiveModal
            archivedSessions={archivedSessions}
            currentSessionId={session.id}
            isLoading={isArchiveLoading}
            onRefresh={refreshArchive}
            onSelectSession={(sessId) => switchSession(sessId)}
            onOpenPosterForSession={(sess) => {
              setArchivedSessionForPoster(sess);
              setShowShare(true);
            }}
            onClose={() => setShowArchiveModal(false)}
          />
        )}

        {/* Feature 5: Host PIN Passcode Modal */}
        {showHostPinModal && (
          <HostPinModal
            expectedPin={session.hostPin || '1234'}
            onSuccess={() => {
              unlockHost(session.hostPin || '1234');
              setShowHostPinModal(false);
            }}
            onClose={() => setShowHostPinModal(false)}
          />
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
            eventTitle={archivedSessionForPoster ? archivedSessionForPoster.eventTitle : session.eventTitle}
            hostName={archivedSessionForPoster ? archivedSessionForPoster.hostName : session.hostName}
            standings={
              archivedSessionForPoster && archivedSessionForPoster.podium
                ? archivedSessionForPoster.podium.map((p) => ({
                    rank: p.place,
                    name: p.name,
                    played: 0,
                    won: 0,
                    lost: 0,
                    points: p.points,
                    diff: 0,
                  }))
                : standings
            }
            onClose={() => {
              setShowShare(false);
              setArchivedSessionForPoster(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
