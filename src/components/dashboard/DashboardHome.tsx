import React from 'react';
import { useApp } from '../../context/AppContext';
import { ProgressRing } from '../common/ProgressRing';
import { TeacherAvatar } from '../avatar/TeacherAvatar';
import { WeeklyChart } from './WeeklyChart';
import {
  Flame,
  Star,
  Trophy,
  TrendingUp,
  Clock,
  Play,
  Film,
  Sparkles,
  ChevronRight,
  BookOpen,
  CheckCircle,
} from 'lucide-react';

export const DashboardHome: React.FC = () => {
  const { user, setCurrentView, selectedAvatar, achievements, currentAccount, openAuthModal } = useApp();

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const userLevel = Math.max(1, Math.floor(user.totalXp / 250) + 1);

  const handleStartDaily10 = () => {
    if (!currentAccount) {
      openAuthModal('signup');
      return;
    }
    setCurrentView('daily10');
  };

  const handleStartPractice = () => {
    if (!currentAccount) {
      openAuthModal('signup');
      return;
    }
    setCurrentView('practice');
  };

  const handleStartChallenge = () => {
    if (!currentAccount) {
      openAuthModal('signup');
      return;
    }
    setCurrentView('topics');
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 60px' }}>
      {/* Guest Notice Banner if not logged in */}
      {!currentAccount && (
        <div
          className="glass-card"
          style={{
            padding: '16px 22px',
            borderRadius: 'var(--radius-xl)',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 14,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(236, 72, 153, 0.12) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} color="var(--color-primary-light)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)' }}>
                You are currently in Preview Mode
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                You can browse all sections. To speak with AI Nexa, take tests, and save your real streak & XP, create a free account.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => openAuthModal('signup')}
              className="btn-primary"
              style={{ padding: '9px 20px', fontSize: 13, fontWeight: 700 }}
            >
              Sign Up Free
            </button>
            <button
              onClick={() => openAuthModal('login')}
              className="btn-secondary"
              style={{ padding: '9px 18px', fontSize: 13 }}
            >
              Log In
            </button>
          </div>
        </div>
      )}

      {/* Header Greeting Banner with Animated Teacher Avatar */}
      <div
        className="glass-card"
        style={{
          padding: '28px 32px',
          borderRadius: 'var(--radius-xl)',
          marginBottom: 24,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.14) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
        }}
      >
        <div style={{ maxWidth: 540 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="badge badge-primary">
              {user.streak > 0 ? `Day ${user.streak} Active Streak` : 'Start Your Streak Today'}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Native Explanations: <strong>{user.nativeLanguage}</strong>
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)', fontWeight: 800 }}>
            {getGreeting()}, {currentAccount ? user.name : 'Guest'} 👋
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 6, lineHeight: 1.5 }}>
            {user.totalSessions === 0
              ? 'Start your first 10-minute speaking session with Nexa to assess your baseline fluency.'
              : `Great dedication! You have completed ${user.totalSessions} speaking session${user.totalSessions === 1 ? '' : 's'} so far.`}
          </p>

          <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
            <button
              onClick={handleStartDaily10}
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: 14 }}
            >
              <Clock size={16} />
              <span>Start Daily 10 Session</span>
            </button>
            <button
              onClick={handleStartPractice}
              className="btn-secondary"
              style={{ padding: '12px 20px', fontSize: 14 }}
            >
              <span>Practice AI Conversation</span>
            </button>
          </div>
        </div>

        {/* Coach visual */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <TeacherAvatar avatarId={selectedAvatar} state="idle" size="lg" />
        </div>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Streak */}
        <div className="glass-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={26} color="#ef4444" fill={user.streak > 0 ? '#ef4444' : 'none'} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-main)' }}>
              {user.streak} Day Streak
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {user.streak > 0 ? `Personal Best: ${user.longestStreak} Days` : 'Practice today to begin'}
            </div>
          </div>
        </div>

        {/* Total XP */}
        <div className="glass-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Star size={26} color="#f59e0b" fill={user.totalXp > 0 ? '#f59e0b' : 'none'} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-main)' }}>
              {user.totalXp.toLocaleString()} XP
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Level {userLevel} • {user.totalXp === 0 ? 'Getting Started' : 'Active Speaker'}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="glass-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={26} color="var(--color-primary-light)" />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-main)' }}>
              {unlockedCount} / {achievements.length} Badges
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {unlockedCount === 0 ? 'Complete sessions to unlock' : 'Achievements Unlocked'}
            </div>
          </div>
        </div>

        {/* Fluency Score */}
        <div className="glass-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={26} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-main)' }}>
              {user.fluencyScore > 0 ? `${user.fluencyScore}% Fluency` : 'Fluency Pending'}
            </div>
            <div style={{ fontSize: 12, color: user.fluencyScore > 0 ? '#10b981' : 'var(--text-muted)', fontWeight: 600 }}>
              {user.totalSessions > 0 ? `${user.totalSessions} sessions logged` : 'Take test to calibrate'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Goal Ring & Lessons + Challenge */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Today's Goal Circular Progress Ring Card */}
        <div className="glass-card" style={{ padding: 26, borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <span className="badge badge-primary">DAILY TARGET</span>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>10 MINUTES SPEAKING</h2>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Resets at midnight</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '14px 0', flexWrap: 'wrap', gap: 16 }}>
            <ProgressRing
              progress={Math.min(100, (user.todayMinutes / Math.max(1, user.dailyGoalMinutes)) * 100)}
              size={150}
              strokeWidth={12}
              primaryColor="#6366f1"
              centerText={`${user.todayMinutes} / ${user.dailyGoalMinutes}`}
              subText="Minutes Today"
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {user.todayMinutes >= user.dailyGoalMinutes ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontWeight: 700 }}>
                  <CheckCircle size={18} />
                  <span>Goal Completed for Today! 🎉</span>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: user.todayMinutes > 0 ? '#10b981' : 'var(--border-glass)' }} />
                    <span style={{ fontSize: 13, color: 'var(--text-main)' }}>
                      {user.todayMinutes > 0 ? `${user.todayMinutes} mins practiced` : '0 mins practiced yet'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--color-primary-light)' }} />
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {Math.max(0, user.dailyGoalMinutes - user.todayMinutes)} mins remaining
                    </span>
                  </div>
                </>
              )}

              <button
                onClick={handleStartDaily10}
                className="btn-primary"
                style={{ marginTop: 6, padding: '8px 18px', fontSize: 13 }}
              >
                {user.todayMinutes >= user.dailyGoalMinutes ? 'Practice Extra (+25 XP)' : 'Start Practice (+50 XP)'}
              </button>
            </div>
          </div>
        </div>

        {/* Continue Learning & Daily Speaking Challenge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Continue Learning Banner */}
          <div className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="badge badge-primary">RECOMMENDED LESSON</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Core Foundation</span>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '6px 0 4px' }}>Talking About Yourself & Daily Life</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
              Learn to introduce your background, express thoughts clearly, and speak without hesitation.
            </p>

            <button
              onClick={handleStartPractice}
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: 13, width: '100%' }}
            >
              <Play size={15} fill="#ffffff" />
              <span>Start Speaking Practice</span>
            </button>
          </div>

          {/* Daily Speaking Challenge */}
          <div
            className="glass-card"
            style={{
              padding: 20,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(239, 68, 68, 0.08) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="badge badge-warning">TODAY'S TOPIC CHALLENGE</span>
              <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>+40 XP</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0 12px' }}>
              <Film size={22} color="#f59e0b" />
              <div style={{ fontSize: 15, fontWeight: 700 }}>
                “Speak for 2 minutes about your favorite hobby or memory.”
              </div>
            </div>

            <button
              onClick={handleStartChallenge}
              className="btn-secondary"
              style={{
                padding: '10px 20px',
                fontSize: 13,
                width: '100%',
                backgroundColor: 'rgba(245, 158, 11, 0.18)',
                color: '#fbbf24',
                borderColor: 'rgba(245, 158, 11, 0.3)',
              }}
            >
              <span>Explore Topics</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Performance Radar Breakdown & Weekly Progress Graph */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Today's Performance Breakdown */}
        <div className="glass-card" style={{ padding: 24, borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontSize: 19, fontWeight: 800 }}>Today's Performance</h2>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>AI Linguistic Scan</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { metric: 'Pronunciation', score: user.fluencyScore > 0 ? Math.min(100, user.fluencyScore + 4) : 0, color: '#10b981' },
              { metric: 'Grammar', score: user.fluencyScore > 0 ? Math.max(0, user.fluencyScore - 2) : 0, color: '#6366f1' },
              { metric: 'Confidence', score: user.fluencyScore > 0 ? Math.min(100, user.fluencyScore + 1) : 0, color: '#ec4899' },
              { metric: 'Vocabulary', score: user.fluencyScore > 0 ? Math.max(0, user.fluencyScore - 5) : 0, color: '#06b6d4' },
              { metric: 'Fluency', score: user.fluencyScore, color: '#f59e0b' },
            ].map((item) => (
              <div key={item.metric}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600 }}>{item.metric}</span>
                  <span style={{ fontWeight: 800, color: item.score > 0 ? item.color : 'var(--text-muted)' }}>
                    {item.score > 0 ? `${item.score}%` : 'Pending'}
                  </span>
                </div>
                <div style={{ width: '100%', height: 7, backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${item.score}%`,
                      height: '100%',
                      backgroundColor: item.color,
                      borderRadius: 4,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            ))}
            {user.totalSessions === 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 6, fontStyle: 'italic' }}>
                Take your first practice session or test to calibrate live scores.
              </div>
            )}
          </div>
        </div>

        {/* Weekly Progress Graph */}
        <div className="glass-card" style={{ padding: 24, borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h2 style={{ fontSize: 19, fontWeight: 800 }}>Weekly Speaking Activity</h2>
            <button
              onClick={() => setCurrentView('progress')}
              style={{ fontSize: 12, color: 'var(--color-primary-light)', fontWeight: 600 }}
            >
              Detailed Report →
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            Track your consistency and fluency improvement over Monday–Sunday.
          </p>
          <WeeklyChart />
        </div>
      </div>
    </div>
  );
};
