import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WeeklyChart } from '../dashboard/WeeklyChart';
import {
  BarChart3,
  Clock,
  Flame,
  Award,
  TrendingUp,
  FileText,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export const ProgressView: React.FC = () => {
  const { user, dailyChallenges, completeChallenge } = useApp();

  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '3m' | 'all'>('7d');
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);

  // Format total minutes to Xh Ym
  const formatTotalTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 20px 80px' }}>
      {/* Top Banner */}
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
          gap: 16,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="badge badge-primary">ANALYTICS & TRAJECTORY</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Historical Performance</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900 }}>Your Fluency Progress Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 6 }}>
            Consistency compounds quickly. Track speaking duration, streak records, and linguistic growth.
          </p>
        </div>

        <button
          onClick={() => setShowWeeklyReport(true)}
          className="btn-primary"
          style={{ padding: '12px 24px', fontSize: 14 }}
        >
          <FileText size={16} />
          <span>View Weekly AI Report</span>
        </button>
      </div>

      {/* 5 Big KPI Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL SPEAKING TIME</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--color-primary-light)', marginTop: 4 }}>
            {formatTotalTime(user.totalMinutes)}
          </div>
          <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>Across all sessions</div>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL SESSIONS</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: '#10b981', marginTop: 4 }}>
            {user.totalSessions}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>Completed speaking drills</div>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>CURRENT STREAK</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: '#ef4444', marginTop: 4 }}>
            🔥 {user.streak} days
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>Active daily practice</div>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>LONGEST STREAK</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: '#f59e0b', marginTop: 4 }}>
            31 days
          </div>
          <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 4 }}>Personal record 🔥</div>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>AVERAGE SCORE</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: '#8b5cf6', marginTop: 4 }}>
            78%
          </div>
          <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>+11% this month</div>
        </div>
      </div>

      {/* Time Filter Pills: 7 days, 30 days, 3 months, All time */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>Trajectory Across Core Skills</h2>

        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '3m', label: '3 Months' },
            { id: 'all', label: 'All Time' },
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeFilter(tf.id as any)}
              className="glass-card"
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: 12,
                fontWeight: timeFilter === tf.id ? 800 : 500,
                color: timeFilter === tf.id ? 'var(--color-primary-light)' : 'var(--text-muted)',
                backgroundColor: timeFilter === tf.id ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-card)',
                border: timeFilter === tf.id ? '1px solid var(--color-primary)' : '1px solid var(--border-glass)',
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, marginBottom: 24 }} className="lg:grid-cols-2">
        {/* Weekly Speaking Activity Chart */}
        <div className="glass-card" style={{ padding: 24, borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Speaking Minutes & Fluency Trend</h3>
            <span className="badge badge-success">+18% Output</span>
          </div>
          <WeeklyChart />
        </div>

        {/* 5 Core Skill Breakdown Progress Bars */}
        <div className="glass-card" style={{ padding: 24, borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Skill Competency Breakdown</h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>CEFR Level {user.level}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { skill: 'Fluency & Flow', current: 74, previous: 66, color: '#10b981' },
              { skill: 'Grammar Accuracy', current: 78, previous: 71, color: '#6366f1' },
              { skill: 'Vocabulary Range', current: 75, previous: 63, color: '#06b6d4' },
              { skill: 'Pronunciation & Accent', current: 84, previous: 75, color: '#ec4899' },
              { skill: 'Speaking Confidence', current: 80, previous: 68, color: '#f59e0b' },
            ].map((item) => {
              const delta = item.current - item.previous;
              return (
                <div key={item.skill}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                    <span style={{ fontWeight: 600 }}>{item.skill}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>+{delta}%</span>
                      <strong style={{ color: item.color }}>{item.current}%</strong>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: 7, backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${item.current}%`, height: '100%', backgroundColor: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Challenges Section */}
      <div className="glass-card" style={{ padding: 24, borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <span className="badge badge-warning">DAILY MISSIONS</span>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>Today's Challenges</h3>
          </div>
          <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 800 }}>Complete All for +150 XP</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          {dailyChallenges.map((ch) => (
            <div
              key={ch.id}
              onClick={() => completeChallenge(ch.id)}
              className="glass-card glass-card-interactive"
              style={{
                padding: 16,
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: ch.completed ? '1px solid #10b981' : '1px solid var(--border-glass)',
                backgroundColor: ch.completed ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>{ch.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, textDecoration: ch.completed ? 'line-through' : 'none' }}>
                    {ch.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>+{ch.rewardXp} XP</div>
                </div>
              </div>

              {ch.completed ? (
                <CheckCircle2 size={18} color="#10b981" />
              ) : (
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--border-glass)' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Weekly AI Report Modal */}
      {showWeeklyReport && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: 640,
              backgroundColor: 'var(--bg-card-solid)',
              borderRadius: 'var(--radius-xl)',
              padding: 28,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge-primary">WEEKLY REPORT</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>AI Linguistic Synthesis</span>
              </div>
              <button onClick={() => setShowWeeklyReport(false)} className="btn-icon">
                ✕
              </button>
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 900 }}>Your Weekly English Report</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
              Performance deltas compared against your previous 7-day speaking volume.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
              <div className="glass-card" style={{ padding: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Speaking Output</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#10b981' }}>+18%</div>
              </div>
              <div className="glass-card" style={{ padding: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Grammar Accuracy</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-primary-light)' }}>+7%</div>
              </div>
              <div className="glass-card" style={{ padding: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Vocabulary Variety</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#06b6d4' }}>+12%</div>
              </div>
              <div className="glass-card" style={{ padding: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pronunciation Score</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#ec4899' }}>+9%</div>
              </div>
            </div>

            <div
              style={{
                padding: 16,
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '4px solid var(--color-primary)',
                marginBottom: 20,
              }}
            >
              <strong style={{ fontSize: 14, color: 'var(--color-primary-light)' }}>AI Recommendation:</strong>
              <p style={{ fontSize: 13, color: 'var(--text-main)', marginTop: 4, lineHeight: 1.5 }}>
                “This week, focus on past-tense sentences and speaking without filler words like 'um' and 'like'. Your pronunciation rhythm is notably clearer!”
              </p>
            </div>

            <button
              onClick={() => setShowWeeklyReport(false)}
              className="btn-primary"
              style={{ width: '100%', padding: '12px 20px', fontSize: 14 }}
            >
              Got it, Continue Practicing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
