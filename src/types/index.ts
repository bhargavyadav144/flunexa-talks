export type EnglishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type NativeLanguage =
  | 'Telugu'
  | 'Hindi'
  | 'Tamil'
  | 'Kannada'
  | 'Malayalam'
  | 'Bengali'
  | 'Marathi'
  | 'Gujarati'
  | 'English';

export type AvatarId = 'nexa' | 'alex' | 'mia' | 'aria' | 'leo';

export type AvatarState =
  | 'idle'
  | 'speaking'
  | 'listening'
  | 'thinking'
  | 'correcting'
  | 'celebrating'
  | 'sleepy'
  | 'paused';

export interface UserProfile {
  name: string;
  age: number;
  nativeLanguage: NativeLanguage;
  level: EnglishLevel;
  goal: string;
  dailyGoalMinutes: number;
  confidence: number; // 1-10
  currentUsage: string;
  avatar: AvatarId;
  streak: number;
  longestStreak: number;
  totalXp: number;
  fluencyScore: number;
  todayMinutes: number;
  totalMinutes: number;
  totalSessions: number;
  isPublicProfile: boolean;
  onboarded: boolean;
}

export type MistakeSeverity = 'critical' | 'important' | 'minor';

export interface Mistake {
  id: string;
  original: string;
  corrected: string;
  category: 'Grammar' | 'Vocabulary' | 'Pronunciation' | 'Natural English' | 'Tense' | 'Preposition';
  severity: MistakeSeverity;
  nativeExplanation: string;
  englishExplanation: string;
}

export interface PronunciationWord {
  word: string;
  score: number;
  phonetic?: string;
  status: 'excellent' | 'good' | 'needs_improvement';
  tip: string;
}

export interface VocabularySuggestion {
  original: string;
  alternatives: string[];
  context: string;
}

export interface SessionAnalysis {
  id: string;
  timestamp: string;
  topicTitle: string;
  durationSeconds: number;
  overallScore: number;
  scores: {
    fluency: number;
    grammar: number;
    vocabulary: number;
    pronunciation: number;
    confidence: number;
    sentenceFormation: number;
  };
  fillerWords: {
    count: number;
    words: { word: string; count: number }[];
    previousCount: number;
    improvementPercent: number;
  };
  mistakes: Mistake[];
  pronunciationWords: PronunciationWord[];
  vocabularySuggestions: VocabularySuggestion[];
  newWords: { word: string; definition: string; example: string }[];
  aiFeedback: string;
  nativeSummary: string;
  xpEarned: number;
}

export interface TopicItem {
  id: string;
  title: string;
  category: 'Personal' | 'Education' | 'Technology' | 'Lifestyle' | 'Opinion' | 'Advanced';
  level: EnglishLevel;
  prompt: string;
  questions: string[];
  recommendedDurationMinutes: number;
  vocabularyHints: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
  category: 'streak' | 'speaking' | 'words' | 'milestone';
}

export interface DailyChallenge {
  id: string;
  title: string;
  targetMinutes?: number;
  rewardXp: number;
  completed: boolean;
  icon: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: AvatarId;
  xp: number;
  streak: number;
  level: EnglishLevel;
  isCurrentUser?: boolean;
}

export interface ConversationMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  audioDuration?: number;
  mistakesDetected?: Mistake[];
  funnyReaction?: string;
}

export interface SavedChat {
  id: string;
  title: string;
  timestamp: string;
  durationSeconds: number;
  messagesCount: number;
  fluencyScore: number;
  topic: string;
  messages: ConversationMessage[];
  mistakes: Mistake[];
  aiSummary: string;
  nativeLanguage: NativeLanguage;
}

export type PlanTier = 'free' | 'pro' | 'unlimited' | 'lifetime';

export interface SubscriptionPlan {
  id: PlanTier;
  name: string;
  badge: string;
  priceMonthUSD: number;
  priceMonthINR: number;
  priceYearUSD: number;
  priceYearINR: number;
  isOneTime?: boolean;
  description: string;
  features: string[];
  highlight: boolean;
  color: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  countryCode?: string;
  phoneNumber?: string;
  nativeLanguage: NativeLanguage;
  englishLevel: EnglishLevel;
  avatarId: AvatarId;
  plan: PlanTier;
  planExpiresAt: string | null;
  dailyGoalMinutes: number;
  streak: number;
  xp: number;
  createdAt: string;
}

export type AppView =
  | 'landing'
  | 'dashboard'
  | 'practice'
  | 'daily10'
  | 'tests'
  | 'topics'
  | 'progress'
  | 'achievements'
  | 'leaderboard'
  | 'coach'
  | 'special-modes'
  | 'profile'
  | 'saved-chats'
  | 'plans';

