import React from 'react';
import { useApp } from '../../context/AppContext';
import { AppView } from '../../types';
import { Home, Mic, Sparkles, User, Clock } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { currentView, setCurrentView, currentAccount, openAuthModal } = useApp();

  const handleNavClick = (id: AppView) => {
    // If user is not logged in and clicks speaking or tests, prompt login/signup
    if (!currentAccount && (id === 'practice' || id === 'daily10' || id === 'tests')) {
      openAuthModal('signup');
      return;
    }
    setCurrentView(id);
  };

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 68,
        backgroundColor: 'rgba(11, 15, 25, 0.96)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 50,
        padding: '0 12px',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
      }}
      className="flex md:hidden"
    >
      {/* 1. Corner Left: Home */}
      <button
        onClick={() => handleNavClick('dashboard')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          color: currentView === 'dashboard' ? 'var(--color-primary-light)' : 'var(--text-muted)',
          fontSize: 11,
          fontWeight: currentView === 'dashboard' ? 700 : 500,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '6px 4px',
        }}
      >
        <Home size={20} />
        <span>Home</span>
      </button>

      {/* 2. Daily 10 */}
      <button
        onClick={() => handleNavClick('daily10')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          color: currentView === 'daily10' ? 'var(--color-primary-light)' : 'var(--text-muted)',
          fontSize: 11,
          fontWeight: currentView === 'daily10' ? 700 : 500,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '6px 4px',
        }}
      >
        <Clock size={20} />
        <span>Daily 10</span>
      </button>

      {/* 3. CENTER: AI Talk Button (Elevated, Glowing) */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <button
          onClick={() => handleNavClick('practice')}
          style={{
            position: 'absolute',
            bottom: -6,
            width: 58,
            height: 58,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
            border: '3px solid #0b0f19',
            boxShadow: '0 6px 20px rgba(99, 102, 241, 0.6), 0 0 15px rgba(168, 85, 247, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            cursor: 'pointer',
            transform: currentView === 'practice' ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 0.2s ease',
          }}
          title="AI Talk with Nexa"
        >
          <Mic size={24} />
          <span style={{ fontSize: 9, fontWeight: 900, marginTop: 1, letterSpacing: -0.2 }}>AI TALK</span>
        </button>
      </div>

      {/* 4. Tests */}
      <button
        onClick={() => handleNavClick('tests')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          color: currentView === 'tests' ? 'var(--color-primary-light)' : 'var(--text-muted)',
          fontSize: 11,
          fontWeight: currentView === 'tests' ? 700 : 500,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '6px 4px',
        }}
      >
        <Sparkles size={20} />
        <span>Tests</span>
      </button>

      {/* 5. Corner Right: Profile */}
      <button
        onClick={() => handleNavClick('profile')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          color: currentView === 'profile' ? 'var(--color-primary-light)' : 'var(--text-muted)',
          fontSize: 11,
          fontWeight: currentView === 'profile' ? 700 : 500,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '6px 4px',
        }}
      >
        <User size={20} />
        <span>Profile</span>
      </button>
    </nav>
  );
};
