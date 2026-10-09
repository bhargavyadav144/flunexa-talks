import React from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Star, Moon, Sun, Globe, Mic, Crown, LogIn, UserPlus, LogOut, Menu } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    user,
    theme,
    toggleTheme,
    setCurrentView,
    setIsOnboardingOpen,
    currentAccount,
    userPlan,
    openAuthModal,
    logout,
    isSidebarOpen,
    toggleSidebar,
  } = useApp();

  return (
    <header
      style={{
        height: 70,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        backgroundColor: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
      }}
    >
      {/* Brand Logo & Sidebar Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Toggle Sidebar Button */}
        <button
          onClick={toggleSidebar}
          className="btn-icon"
          title={isSidebarOpen ? 'Collapse Sidebar' : 'Open Sidebar'}
          aria-label="Toggle navigation sidebar"
          style={{
            color: isSidebarOpen ? 'var(--color-primary-light)' : 'var(--text-muted)',
            background: isSidebarOpen ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-glass)',
            borderRadius: 10,
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Menu size={20} />
        </button>

        <div
          onClick={() => setCurrentView('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src="/assets/flunexa-logo.png"
            alt="Flunexa Talk Emblem Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 21,
                fontWeight: 900,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Flunexa Talk
            </span>
            <span className="badge badge-primary" style={{ fontSize: 10, padding: '2px 6px' }}>
              AI BOT
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 500 }}>
            Speak. Improve. Become Fluent.
          </div>
        </div>
      </div>
      </div>

      {/* Gamification Stats & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Streak Pill */}
        <div
          title={`${user.streak} Day Speaking Streak! Keep practicing daily.`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            color: '#f87171',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          <Flame size={16} fill="#ef4444" color="#ef4444" />
          <span>{user.streak} Days</span>
        </div>

        {/* XP Pill */}
        <div
          title={`${user.totalXp} XP points earned!`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            color: '#fbbf24',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          <Star size={16} fill="#f59e0b" color="#f59e0b" />
          <span>{user.totalXp.toLocaleString()} XP</span>
        </div>

        {/* Language & Level indicator */}
        <div
          onClick={() => setIsOnboardingOpen(true)}
          title="Click to change your English Level or native explanation language"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: 6,
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-glass)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-main)',
            cursor: 'pointer',
          }}
          className="hide-on-mobile md:flex"
        >
          <Globe size={15} color="var(--color-primary-light)" />
          <span>{user.nativeLanguage}</span>
          <span style={{ color: 'var(--text-dim)' }}>•</span>
          <span style={{ color: 'var(--color-primary-light)' }}>Level {user.level}</span>
        </div>

        {/* Plans & Pricing Button */}
        <button
          onClick={() => setCurrentView('plans')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '7px 13px',
            borderRadius: 'var(--radius-full)',
            color: '#fbbf24',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Crown size={15} />
          <span>Plans</span>
          {userPlan !== 'free' && (
            <span
              style={{
                background: '#8b5cf6',
                color: '#fff',
                fontSize: 9,
                fontWeight: 900,
                padding: '1px 5px',
                borderRadius: 8,
              }}
            >
              {userPlan.toUpperCase()}
            </span>
          )}
        </button>

        {/* Quick Launch Daily 10 */}
        <button
          onClick={() => setCurrentView('daily10')}
          className="btn-primary hide-on-mobile sm:inline-flex"
          style={{
            padding: '7px 14px',
            fontSize: 13,
          }}
        >
          <Mic size={15} />
          <span>Daily 10</span>
        </button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="btn-icon"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Authentication Controls */}
        {currentAccount ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* User Avatar with Profile trigger */}
            <div
              onClick={() => setCurrentView('profile')}
              title={`Logged in as ${currentAccount.name} (${currentAccount.email})`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                padding: '4px 8px 4px 4px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-glass)',
                background: 'rgba(255, 255, 255, 0.04)',
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  backgroundColor: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                {currentAccount.name ? currentAccount.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="hide-on-mobile sm:inline" style={{ fontSize: 13, fontWeight: 600 }}>
                {currentAccount.name}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              className="btn-icon"
              title="Log Out"
              aria-label="Log Out"
              style={{ color: '#f87171' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => openAuthModal('login')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'transparent',
                border: '1px solid var(--border-glass)',
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                color: '#e2e8f0',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <LogIn size={14} />
              <span>Log In</span>
            </button>

            <button
              onClick={() => openAuthModal('signup')}
              className="btn-primary"
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
                fontWeight: 700,
                gap: 5,
              }}
            >
              <UserPlus size={14} />
              <span>Sign Up</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
