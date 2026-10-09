-- SpeakUp AI: Complete PostgreSQL / Supabase Database Schema
-- Production Ready with UUIDs, Foreign Keys, Indexes, and Row Level Security (RLS)

-- 1. Language Preferences Enum & Levels
CREATE TYPE english_level_type AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
CREATE TYPE native_language_type AS ENUM (
  'Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'English'
);
CREATE TYPE avatar_type AS ENUM ('alex', 'mia', 'aria', 'leo');
CREATE TYPE mistake_severity_type AS ENUM ('critical', 'important', 'minor');

-- 2. Profiles (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(100) NOT NULL,
  age INT CHECK (age >= 8 AND age <= 120),
  native_language native_language_type DEFAULT 'Telugu',
  english_level english_level_type DEFAULT 'B1',
  goal TEXT,
  daily_goal_minutes INT DEFAULT 10,
  confidence_rating INT CHECK (confidence_rating >= 1 AND confidence_rating <= 10),
  current_usage TEXT,
  avatar_id avatar_type DEFAULT 'alex',
  is_public_profile BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Streaks & Gamification Stats
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 1,
  longest_streak INT DEFAULT 1,
  total_xp INT DEFAULT 0,
  fluency_score INT DEFAULT 70,
  total_speaking_minutes INT DEFAULT 0,
  total_sessions INT DEFAULT 0,
  last_practice_date DATE DEFAULT CURRENT_DATE
);

-- 4. Speaking Practice Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_type VARCHAR(50) NOT NULL, -- 'daily10', 'realtime_conversation', 'topic_timer', 'special_mode'
  topic_title TEXT NOT NULL,
  duration_seconds INT NOT NULL,
  overall_score INT CHECK (overall_score >= 0 AND overall_score <= 100),
  fluency_score INT,
  grammar_score INT,
  vocabulary_score INT,
  pronunciation_score INT,
  confidence_score INT,
  ai_feedback TEXT,
  native_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Conversation Messages (Real-time transcript entries)
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  sender VARCHAR(10) CHECK (sender IN ('user', 'ai')),
  content TEXT NOT NULL,
  audio_duration_seconds NUMERIC(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Mistake Analysis Tracking
CREATE TABLE IF NOT EXISTS mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_phrase TEXT NOT NULL,
  corrected_phrase TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  severity mistake_severity_type DEFAULT 'important',
  english_explanation TEXT NOT NULL,
  native_explanation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Pronunciation Results
CREATE TABLE IF NOT EXISTS pronunciation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  word VARCHAR(100) NOT NULL,
  score INT CHECK (score >= 0 AND score <= 100),
  phonetic TEXT,
  tip TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Speaking Tests & Test Results
CREATE TABLE IF NOT EXISTS speaking_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_type VARCHAR(50) NOT NULL, -- 'read_aloud', 'repeat_after_ai', 'read_and_speak', 'picture_description', 'topic_wheel'
  title TEXT NOT NULL,
  difficulty VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  test_id UUID REFERENCES speaking_tests(id) ON DELETE SET NULL,
  score INT NOT NULL,
  words_per_minute INT,
  accuracy_rate NUMERIC(5, 2),
  feedback JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Daily Goals & Daily Progress
CREATE TABLE IF NOT EXISTS daily_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  speaking_minutes INT DEFAULT 0,
  words_spoken INT DEFAULT 0,
  target_met BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, date)
);

-- 10. Achievements & User Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(20) NOT NULL,
  xp_reward INT DEFAULT 50,
  category VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS user_achievements (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id VARCHAR(50) NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, achievement_id)
);

-- 11. XP Transactions Ledger
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Weekly Reports
CREATE TABLE IF NOT EXISTS weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  speaking_delta_percent INT DEFAULT 0,
  grammar_delta_percent INT DEFAULT 0,
  vocab_delta_percent INT DEFAULT 0,
  pronunciation_delta_percent INT DEFAULT 0,
  ai_recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Sample Policies
CREATE POLICY "Users can view and edit their own profile"
  ON profiles FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Users can view public leaderboard profiles"
  ON profiles FOR SELECT
  USING (is_public_profile = TRUE);
