import React from 'react';
import { useApp } from '../../context/AppContext';
import { LEVEL_TIERS } from '../../data/initialData';
import { Award, Flame, Star, CheckCircle2, Lock } from 'lucide-react';

export const AchievementsView: React.FC = () => {
  const { achievements, user } = useApp();

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  // Determine current XP tier
  const currentTier =
    LEVEL_TIERS.find((t) => user.totalXp >= t.minXp && user.totalXp <= t.maxXp) ||
    LEVEL_TIERS[LEVEL_TIERS.length - 1];

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '20px 20px 80px' }}>
      {/* Top Banner */}
      <div
        className="glass-card"
        style={{
          padding: '28px 32px',
          borderRadius: 'var(--radius-xl)',
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(99, 102, 241, 0.12) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span className="badge badge-warning">MILESTONES & XP</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Gamified Progression</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900 }}>Achievement Badges</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 6, maxWidth: 640 }}>
          Earn XP, climb fluency ranks, and unlock prestige badges by consistently speaking English every day.
        </p>
      </div>

      {/* Level Tier Progression Banner */}
      <div className="glass-card" style={{ padding: 24, borderRadius: 'var(--radius-xl)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>CURRENT RANK:</span>
            <div style={{ fontSize: 22, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{currentTier.badge}</span>
              <span>Level {currentTier.level}: {currentTier.name}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#f59e0b' }}>{user.totalXp.toLocaleString()} XP</span>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Next tier: {currentTier.maxXp + 1} XP</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', height: 10, backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 5, overflow: 'hidden' }}>
          <div
            style={{
              width: `${Math.min(100, ((user.totalXp - currentTier.minXp) / (currentTier.maxXp - currentTier.minXp)) * 100)}%`,
              height: '100%',
              background: 'var(--gradient-amber)',
              borderRadius: 5,
            }}
          />
        </div>
      </div>

      {/* 12 Achievement Cards Grid */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>All Badges ({unlockedCount} / {achievements.length} Unlocked)</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className="glass-card"
            style={{
              padding: 20,
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16,
              border: ach.unlocked ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-glass)',
              backgroundColor: ach.unlocked ? 'rgba(245, 158, 11, 0.06)' : 'var(--bg-card)',
              opacity: ach.unlocked ? 1 : 0.65,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                backgroundColor: ach.unlocked ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-surface-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                flexShrink: 0,
                boxShadow: ach.unlocked ? '0 4px 14px rgba(245, 158, 11, 0.25)' : 'none',
              }}
            >
              {ach.icon}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <strong style={{ fontSize: 16, color: 'var(--text-main)' }}>{ach.title}</strong>
                {ach.unlocked ? (
                  <CheckCircle2 size={16} color="#10b981" />
                ) : (
                  <Lock size={15} color="var(--text-dim)" />
                )}
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 8 }}>
                {ach.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>+{ach.xpReward} XP Reward</span>
                {ach.unlocked && (
                  <span style={{ color: 'var(--text-dim)' }}>Unlocked {ach.unlockedAt}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
