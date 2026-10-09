import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Achievement,
  AppView,
  AvatarId,
  DailyChallenge,
  EnglishLevel,
  NativeLanguage,
  PlanTier,
  SavedChat,
  SessionAnalysis,
  UserAccount,
  UserProfile,
} from '../types';
import { authService } from '../services/authService';
import {
  INITIAL_ACHIEVEMENTS,
  INITIAL_DAILY_CHALLENGES,
  INITIAL_USER,
} from '../data/initialData';
import { soundService } from '../services/soundService';
import { triggerConfetti } from '../components/common/ConfettiTrigger';

interface AppContextType {
  user: UserProfile;
  theme: 'dark' | 'light';
  currentView: AppView;
  achievements: Achievement[];
  dailyChallenges: DailyChallenge[];
  recentAnalysis: SessionAnalysis | null;
  savedChats: SavedChat[];
  activeSavedChat: SavedChat | null;
  isResultModalOpen: boolean;
  isOnboardingOpen: boolean;
  selectedAvatar: AvatarId;
  // Auth & Plans state
  currentAccount: UserAccount | null;
  userPlan: PlanTier;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup' | 'forgot_password';
  openAuthModal: (mode?: 'login' | 'signup' | 'forgot_password') => void;
  closeAuthModal: () => void;
  setAccountAndLogin: (account: UserAccount) => void;
  logout: () => void;
  upgradeUserPlan: (plan: PlanTier) => void;
  updateUser: (partial: Partial<UserProfile>) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setCurrentView: (view: AppView) => void;
  addXp: (amount: number, reason?: string) => void;
  completeChallenge: (id: string) => void;
  unlockAchievement: (id: string) => void;
  openAnalysisModal: (analysis: SessionAnalysis) => void;
  closeAnalysisModal: () => void;
  setIsOnboardingOpen: (open: boolean) => void;
  setSelectedAvatar: (avatar: AvatarId) => void;
  saveChat: (chat: Omit<SavedChat, 'id'>) => SavedChat;
  deleteSavedChat: (id: string) => void;
  setActiveSavedChat: (chat: SavedChat | null) => void;
  resetProgress: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setIsSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or default
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('speakup_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_USER;
  });

  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('speakup_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('speakup_achievements');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_ACHIEVEMENTS;
  });

  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>(() => {
    const saved = localStorage.getItem('speakup_challenges');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_DAILY_CHALLENGES;
  });

  const [recentAnalysis, setRecentAnalysis] = useState<SessionAnalysis | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>(user.avatar || 'nexa');

  // Saved Chats State - Clean real data only
  const [savedChats, setSavedChats] = useState<SavedChat[]>(() => {
    const saved = localStorage.getItem('flunexa_saved_chats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Collapsible Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Auth & Plan State
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('flunexa_user_account');
    if (saved === 'logged_out') return null;
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Default logged-in learner (Bhargav with Telugu native language)
    return {
      id: 'usr-default-telugu',
      name: 'Bhargav',
      email: 'bhargav@flunexa.com',
      phoneNumber: '9876543210',
      countryCode: '+91',
      nativeLanguage: 'Telugu',
      englishLevel: 'B1',
      plan: 'pro',
      streak: 7,
      xp: 1472,
      avatarId: 'nexa',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const [userPlan, setUserPlan] = useState<PlanTier>(() => {
    return (currentAccount?.plan as PlanTier) || 'pro';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot_password'>('login');

  const openAuthModal = (mode: 'login' | 'signup' | 'forgot_password' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const setAccountAndLogin = (account: UserAccount) => {
    setCurrentAccount(account);
    setUserPlan(account.plan || 'free');
    localStorage.setItem('flunexa_user_account', JSON.stringify(account));
    setUser((prev) => ({
      ...prev,
      name: account.name || prev.name,
      nativeLanguage: account.nativeLanguage || prev.nativeLanguage,
      level: account.englishLevel || prev.level,
      streak: account.streak || prev.streak,
      totalXp: account.xp || prev.totalXp,
      avatar: account.avatarId || prev.avatar,
    }));
    closeAuthModal();
  };

  const logout = () => {
    authService.clearToken();
    setCurrentAccount(null);
    setUserPlan('free');
    localStorage.setItem('flunexa_user_account', 'logged_out');
  };

  const upgradeUserPlan = async (plan: PlanTier) => {
    setUserPlan(plan);
    if (currentAccount) {
      const updated = { ...currentAccount, plan };
      setCurrentAccount(updated);
      localStorage.setItem('flunexa_user_account', JSON.stringify(updated));
    }
    try {
      await authService.subscribePlan(plan);
    } catch (e) {
      // offline or mock
    }
    triggerConfetti();
    soundService.playAchievementFanfare();
  };

  // Sync session on mount
  useEffect(() => {
    authService.getCurrentUser().then((account) => {
      if (account) {
        setAccountAndLogin(account);
      }
    });
  }, []);

  const [activeSavedChat, setActiveSavedChat] = useState<SavedChat | null>(null);

  // Persist user & theme & saved chats changes
  useEffect(() => {
    localStorage.setItem('speakup_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('flunexa_saved_chats', JSON.stringify(savedChats));
  }, [savedChats]);

  useEffect(() => {
    localStorage.setItem('speakup_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('speakup_achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('speakup_challenges', JSON.stringify(dailyChallenges));
  }, [dailyChallenges]);

  const updateUser = (partial: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...partial }));
    if (partial.avatar) {
      setSelectedAvatar(partial.avatar);
    }
  };

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addXp = (amount: number, reason?: string) => {
    soundService.playXpChime();
    setUser((prev) => ({
      ...prev,
      totalXp: prev.totalXp + amount,
    }));
  };

  const completeChallenge = (id: string) => {
    setDailyChallenges((prev) =>
      prev.map((c) => {
        if (c.id === id && !c.completed) {
          addXp(c.rewardXp, `Completed ${c.title}`);
          return { ...c, completed: true };
        }
        return c;
      })
    );
  };

  const unlockAchievement = (id: string) => {
    setAchievements((prev) =>
      prev.map((a) => {
        if (a.id === id && !a.unlocked) {
          triggerConfetti(true);
          addXp(a.xpReward, `Unlocked ${a.title}`);
          return { ...a, unlocked: true, unlockedAt: 'Just now' };
        }
        return a;
      })
    );
  };

  const openAnalysisModal = (analysis: SessionAnalysis) => {
    setRecentAnalysis(analysis);
    setIsResultModalOpen(true);
    addXp(analysis.xpEarned, 'Speaking Session Completed');
    soundService.playCompleteDing();

    // Check if fluency unlock condition met
    if (analysis.scores.fluency >= 85) {
      unlockAchievement('ach-12'); // Fluent Speaker
    }
    // Update user minutes and score
    updateUser({
      todayMinutes: Math.min(10, user.todayMinutes + Math.round(analysis.durationSeconds / 60)),
      totalMinutes: user.totalMinutes + Math.round(analysis.durationSeconds / 60),
      totalSessions: user.totalSessions + 1,
      fluencyScore: Math.round((user.fluencyScore * 4 + analysis.scores.fluency) / 5),
    });
  };

  const closeAnalysisModal = () => {
    setIsResultModalOpen(false);
  };

  const resetProgress = () => {
    setUser(INITIAL_USER);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setDailyChallenges(INITIAL_DAILY_CHALLENGES);
    localStorage.removeItem('speakup_user');
    localStorage.removeItem('speakup_achievements');
    localStorage.removeItem('speakup_challenges');
  };

  const saveChat = (newChat: Omit<SavedChat, 'id'>) => {
    const fullChat: SavedChat = {
      ...newChat,
      id: 'chat-' + Date.now(),
    };
    setSavedChats((prev) => [fullChat, ...prev]);
    return fullChat;
  };

  const deleteSavedChat = (id: string) => {
    setSavedChats((prev) => prev.filter((c) => c.id !== id));
    if (activeSavedChat?.id === id) {
      setActiveSavedChat(null);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        theme,
        currentView,
        achievements,
        dailyChallenges,
        recentAnalysis,
        savedChats,
        activeSavedChat,
        isResultModalOpen,
        isOnboardingOpen,
        selectedAvatar,
        currentAccount,
        userPlan,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setAccountAndLogin,
        logout,
        upgradeUserPlan,
        updateUser,
        setTheme,
        toggleTheme,
        setCurrentView,
        addXp,
        completeChallenge,
        unlockAchievement,
        openAnalysisModal,
        closeAnalysisModal,
        setIsOnboardingOpen,
        setSelectedAvatar,
        saveChat,
        deleteSavedChat,
        setActiveSavedChat,
        resetProgress,
        isSidebarOpen,
        toggleSidebar,
        setIsSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
