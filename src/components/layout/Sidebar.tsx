import React from 'react';
import { useApp } from '../../context/AppContext';
import { AppView } from '../../types';
import {
  LayoutDashboard,
  Mic,
  Clock,
  Sparkles,
  Award,
  BarChart3,
  Trophy,
  BrainCircuit,
  Compass,
  User,
  Layers,
  Bookmark,
  Crown,
  ChevronLeft,
} from 'lucide-react';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  requiresAuth?: boolean;
}

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, userPlan, isSidebarOpen, toggleSidebar, currentAccount, openAuthModal } = useApp();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
    { id: 'daily10', label: 'Daily 10', icon: <Clock size={19} />, badge: 'HOT', requiresAuth: true },
    { id: 'practice', label: 'Nexa Voice Call', icon: <Mic size={19} />, requiresAuth: true },
    { id: 'saved-chats', label: 'Saved Chats', icon: <Bookmark size={19} />, requiresAuth: true },
    { id: 'plans', label: 'Plans & Pricing', icon: <Crown size={19} color="#f59e0b" />, badge: userPlan === 'free' ? 'UPGRADE' : userPlan.toUpperCase() },
    { id: 'tests', label: 'Test Center', icon: <Sparkles size={19} />, requiresAuth: true },
    { id: 'topics', label: 'Topic Hub', icon: <Compass size={19} /> },
    { id: 'coach', label: 'My AI Coach', icon: <BrainCircuit size={19} /> },
    { id: 'special-modes', label: 'Special Modes', icon: <Layers size={19} /> },
    { id: 'progress', label: 'Progress & Stats', icon: <BarChart3 size={19} /> },
    { id: 'achievements', label: 'Achievements', icon: <Award size={19} /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={19} /> },
    { id: 'profile', label: 'Profile & Settings', icon: <User size={19} /> },
  ];

  const handleItemClick = (item: NavItem) => {
    if (item.requiresAuth && !currentAccount) {
      openAuthModal('signup');
      return;
    }
    setCurrentView(item.id);
  };

  if (!isSidebarOpen) {
    return (
      <aside
        style={{
          width: 0,
          padding: 0,
          opacity: 0,
          overflow: 'hidden',
          transition: 'all 0.25s ease',
          borderRight: 'none',
        }}
        className="hidden md:flex"
      />
    );
  }

  return (
    <aside
      style={{
        width: 240,
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-glass)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 14px 20px',
        flexShrink: 0,
        height: 'calc(100vh - 70px)',
        position: 'sticky',
        top: 70,
        overflowY: 'auto',
        transition: 'all 0.25s ease',
      }}
      className="hidden md:flex"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Header row with collapse button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 8px 8px',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Learning Menu
          </div>
          <button
            onClick={toggleSidebar}
            title="Collapse Sidebar"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 4,
              borderRadius: 6,
            }}
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--color-primary-glow)' : 'transparent',
                color: isActive ? 'var(--color-primary-light)' : 'var(--text-muted)',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: 14,
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                  e.currentTarget.style.color = 'var(--text-main)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: isActive ? 'var(--color-primary)' : 'inherit' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    backgroundColor: item.badge === 'HOT' ? '#ef4444' : '#8b5cf6',
                    color: '#ffffff',
                    fontSize: 9,
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Daily Motivation Box */}
      <div
        className="glass-card"
        style={{
          marginTop: 20,
          padding: 14,
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.12), rgba(16, 185, 129, 0.08))',
          border: '1px solid rgba(99, 102, 241, 0.2)',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary-light)' }}>
          💡 Daily Fluency Tip
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>
          "Focus on rhythm and thought groups rather than pronouncing every single syllable with equal force."
        </p>
      </div>
    </aside>
  );
};
