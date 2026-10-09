import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_LEADERBOARD } from '../../data/initialData';
import { LeaderboardUser } from '../../types';
import { Trophy, Flame, Star, Shield, Lock, Globe, Award } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { user, updateUser } = useApp();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>(INITIAL_LEADERBOARD);

  const togglePrivacy = () => {
    updateUser({ isPublicProfile: !user.isPublicProfile });
  };

  return (
    <div style={{ maxWidth: 940, margin: '0 auto', padding: '20px 20px 80px' }}>
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
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(99, 102, 241, 0.12) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="badge badge-warning">WEEKLY ARENA</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Resets Sunday midnight</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900 }}>Global Speaking Leaderboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 6, maxWidth: 580 }}>
            Compete with fellow English learners across the globe. Practice speaking daily to accumulate XP and reach the top 3 podium!
          </p>
        </div>

        {/* Public / Private Profile Toggle Button */}
        <div className="glass-card" style={{ padding: '14px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
            Profile Visibility: <strong>{user.isPublicProfile ? 'Public' : 'Private'}</strong>
          </div>
          <button
            onClick={togglePrivacy}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: 12 }}
          >
            {user.isPublicProfile ? <Globe size={14} color="#10b981" /> : <Lock size={14} color="#ef4444" />}
            <span>{user.isPublicProfile ? 'Make Private' : 'Make Public'}</span>
          </button>
        </div>
      </div>

      {/* Podium Top 3 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 14,
          alignItems: 'flex-end',
          marginBottom: 28,
        }}
      >
        {/* Rank 2: Bhargav */}
        <div
          className="glass-card"
          style={{
            padding: 20,
            borderRadius: 'var(--radius-xl)',
            textAlign: 'center',
            height: 190,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px solid rgba(148, 163, 184, 0.4)',
          }}
        >
          <div style={{ fontSize: 24 }}>🥈</div>
          <strong style={{ fontSize: 16, marginTop: 4 }}>Bhargav (You)</strong>
          <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>{user.totalXp.toLocaleString()} XP</span>
          <span className="badge badge-primary" style={{ marginTop: 6, fontSize: 11 }}>Level {user.level}</span>
        </div>

        {/* Rank 1: Rahul */}
        <div
          className="glass-card"
          style={{
            padding: 24,
            borderRadius: 'var(--radius-xl)',
            textAlign: 'center',
            height: 220,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px solid #f59e0b',
            background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.15) 0%, rgba(18, 24, 38, 0.75) 100%)',
          }}
        >
          <div style={{ fontSize: 32 }}>👑 🥇</div>
          <strong style={{ fontSize: 18, marginTop: 4 }}>Rahul Sharma</strong>
          <span style={{ fontSize: 14, color: '#fbbf24', fontWeight: 800 }}>1,420 XP</span>
          <span className="badge badge-warning" style={{ marginTop: 6, fontSize: 11 }}>18 Day Streak 🔥</span>
        </div>

        {/* Rank 3: Priya */}
        <div
          className="glass-card"
          style={{
            padding: 20,
            borderRadius: 'var(--radius-xl)',
            textAlign: 'center',
            height: 175,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px solid rgba(217, 119, 6, 0.4)',
          }}
        >
          <div style={{ fontSize: 24 }}>🥉</div>
          <strong style={{ fontSize: 16, marginTop: 4 }}>Priya Patel</strong>
          <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>1,240 XP</span>
          <span className="badge badge-primary" style={{ marginTop: 6, fontSize: 11 }}>Level B2</span>
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-xl)' }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Weekly Standings</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {leaderboardData.map((u) => {
            const isMe = u.isCurrentUser || u.name === user.name;
            return (
              <div
                key={u.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isMe ? 'rgba(99, 102, 241, 0.18)' : 'var(--bg-surface-elevated)',
                  border: isMe ? '1px solid var(--color-primary)' : '1px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 16,
                      fontWeight: 900,
                      width: 24,
                      color: u.rank <= 3 ? '#f59e0b' : 'var(--text-dim)',
                    }}
                  >
                    #{u.rank}
                  </span>

                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      backgroundColor: isMe ? 'var(--color-primary)' : '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 14,
                      color: '#ffffff',
                    }}
                  >
                    {u.name.charAt(0)}
                  </div>

                  <div>
                    <div style={{ fontSize: 14, fontWeight: isMe ? 800 : 600 }}>
                      {u.name} {isMe && '(You)'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Level {u.level} • {u.streak} day streak
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#f59e0b' }}>
                    {isMe ? user.totalXp.toLocaleString() : u.xp.toLocaleString()} XP
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
