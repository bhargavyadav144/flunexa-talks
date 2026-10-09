import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { RealtimeConversation } from './components/practice/RealtimeConversation';
import { DailyTenMode } from './components/practice/DailyTenMode';
import { TestCenter } from './components/tests/TestCenter';
import { TopicExplorer } from './components/topics/TopicExplorer';
import { ProgressView } from './components/progress/ProgressView';
import { AchievementsView } from './components/gamification/AchievementsView';
import { LeaderboardView } from './components/gamification/LeaderboardView';
import { AICoachView } from './components/coach/AICoachView';
import { SpecialModesView } from './components/special/SpecialModesView';
import { ProfileView } from './components/profile/ProfileView';
import { SavedChatsView } from './components/chats/SavedChatsView';
import { PlansView } from './components/plans/PlansView';
import { LandingPage } from './components/landing/LandingPage';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { SpeakingResultModal } from './components/analysis/SpeakingResultModal';
import { AuthModal } from './components/auth/AuthModal';

export const App: React.FC = () => {
  const { currentView, isOnboardingOpen, setIsOnboardingOpen } = useApp();

  // If user selected landing page view
  if (currentView === 'landing') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <LandingPage />
        <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
        <SpeakingResultModal />
        <AuthModal />
      </div>
    );
  }

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardHome />;
      case 'practice':
        return <RealtimeConversation />;
      case 'saved-chats':
        return <SavedChatsView />;
      case 'daily10':
        return <DailyTenMode />;
      case 'tests':
        return <TestCenter />;
      case 'topics':
        return <TopicExplorer />;
      case 'progress':
        return <ProgressView />;
      case 'achievements':
        return <AchievementsView />;
      case 'leaderboard':
        return <LeaderboardView />;
      case 'coach':
        return <AICoachView />;
      case 'special-modes':
        return <SpecialModesView />;
      case 'profile':
        return <ProfileView />;
      case 'plans':
        return <PlansView />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
      {/* Top Header */}
      <Navbar />

      {/* Main Workspace Body with Desktop Sidebar */}
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Modals */}
      <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
      <SpeakingResultModal />
      <AuthModal />
    </div>
  );
};
