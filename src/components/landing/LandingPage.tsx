import React from 'react';
import { useApp } from '../../context/AppContext';
import { TeacherAvatar } from '../avatar/TeacherAvatar';
import {
  Mic,
  Sparkles,
  Flame,
  Award,
  Globe,
  Clock,
  ArrowRight,
  Volume2,
  CheckCircle2,
  Smile,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentView, setIsOnboardingOpen, selectedAvatar, currentAccount, openAuthModal } = useApp();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '60px 24px 80px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, rgba(11, 15, 25, 0) 100%)',
        }}
      >
        {/* Glow ambient spots */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 350,
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, rgba(236, 72, 153, 0.08) 60%, transparent 80%)',
            filter: 'blur(70px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 18px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(129, 140, 248, 0.35)',
              marginBottom: 20,
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)',
            }}
          >
            <img
              src="/assets/flunexa-logo.png"
              alt="Flunexa Talk"
              style={{ width: 28, height: 28, objectFit: 'contain' }}
            />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary-light)' }}>
              Flunexa Talk • Full-Screen AI Speaking Robot
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.2rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: 20,
            }}
          >
            Talk With{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Nexa Robot
            </span>
            <br />
            Speak. Improve. Become Fluent.
          </h1>

          <p
            style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
              color: 'var(--text-muted)',
              maxWidth: 680,
              margin: '0 auto 36px',
              lineHeight: 1.6,
            }}
          >
            Full-screen interactive conversational partner with real-time feedback, witty reactions, and auto-saved smart chats. Native-language support in Telugu, Hindi, Tamil & more.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              justifyContent: 'center',
              marginBottom: 50,
            }}
          >
            <button
              onClick={() => {
                if (!currentAccount) {
                  openAuthModal('signup');
                  return;
                }
                setIsOnboardingOpen(true);
              }}
              className="btn-primary"
              style={{ padding: '16px 36px', fontSize: 17, fontWeight: 700 }}
            >
              <Mic size={20} />
              <span>Start Speaking Free</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => {
                if (!currentAccount) {
                  openAuthModal('signup');
                  return;
                }
                setCurrentView('tests');
              }}
              className="btn-secondary"
              style={{ padding: '16px 30px', fontSize: 16, fontWeight: 600 }}
            >
              <Sparkles size={18} color="var(--color-primary-light)" />
              <span>Take English Level Test</span>
            </button>
          </div>

          {/* Interactive Hero Visual with Animated Teacher & Live Speech Bubbles */}
          <div
            style={{
              position: 'relative',
              maxWidth: 720,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Conversation Bubble: User Mistake */}
            <div
              className="glass-card hide-on-mobile sm:block"
              style={{
                position: 'absolute',
                top: 0,
                left: -20,
                padding: '14px 18px',
                borderRadius: 'var(--radius-lg)',
                maxWidth: 240,
                textAlign: 'left',
                borderLeft: '4px solid #ef4444',
                boxShadow: 'var(--shadow-md)',
                animation: 'floatGentle 5s ease-in-out infinite',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444' }}>❌ You said:</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>"Yesterday I go to college."</div>
            </div>

            {/* Conversation Bubble: AI Correction with Native Language Rationale */}
            <div
              className="glass-card hide-on-mobile sm:block"
              style={{
                position: 'absolute',
                bottom: 10,
                right: -30,
                padding: '14px 18px',
                borderRadius: 'var(--radius-lg)',
                maxWidth: 280,
                textAlign: 'left',
                borderLeft: '4px solid #10b981',
                boxShadow: 'var(--shadow-md)',
                animation: 'floatGentle 4.5s ease-in-out infinite reverse',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>✅ Better:</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>"Yesterday I went to college."</div>
              <div style={{ fontSize: 11, color: 'var(--color-primary-light)', marginTop: 4, fontStyle: 'italic' }}>
                "‘Yesterday’ past time కాబట్టి ‘went’ వాడాలి."
              </div>
            </div>

            {/* Center Animated Avatar */}
            <div
              style={{
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
                padding: 24,
                borderRadius: '50%',
              }}
            >
              <TeacherAvatar avatarId={selectedAvatar} state="speaking" size="xl" />
            </div>

            {/* Speaking Live waveform simulation */}
            <div
              className="glass-card"
              style={{
                marginTop: 18,
                padding: '8px 24px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span className="badge badge-success">🟢 Voice Detection Active</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>"Speak freely. AI listens and replies automatically."</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars: Duolingo + AI Tutor + Speaking Test */}
      <section style={{ maxWidth: 1140, margin: '0 auto', padding: '40px 24px 60px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800 }}>Engineered Like Commercial EdTech Leaders</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, marginTop: 8 }}>
            A proven methodology uniting gamification, natural speech ergonomics, and personalized linguistics.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          <div className="glass-card" style={{ padding: 26, borderRadius: 'var(--radius-xl)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Clock size={24} color="var(--color-primary-light)" />
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 700 }}>Daily 10 Speaking Workout</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
              4 timed phases every day: Warm-up (0-2m), Topic Speaking (2-5m), Opinion Discussion (5-8m), and Rapid Fire (8-10m).
            </p>
          </div>

          <div className="glass-card" style={{ padding: 26, borderRadius: 'var(--radius-xl)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Globe size={24} color="#10b981" />
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 700 }}>9 Native Explanation Languages</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
              Understand grammar rationale clearly in Telugu, Hindi, Tamil, Kannada, Malayalam, Bengali, Marathi, or Gujarati.
            </p>
          </div>

          <div className="glass-card" style={{ padding: 26, borderRadius: 'var(--radius-xl)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Sparkles size={24} color="#f59e0b" />
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 700 }}>5 Rigorous Speaking Tests</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
              Read Aloud, Repeat After AI, Read & Speak (prep timer), Picture Description, and the Animated 18-Topic Wheel.
            </p>
          </div>

          <div className="glass-card" style={{ padding: 26, borderRadius: 'var(--radius-xl)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <TrendingUp size={24} color="#ec4899" />
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 700 }}>Smart Fluency Scoring</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
              Instant metric breakdown for Grammar, Vocabulary, Pronunciation, Filler Words, and Confidence with weekly trajectory tracking.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section
        style={{
          margin: '20px auto 60px',
          maxWidth: 960,
          width: 'calc(100% - 48px)',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(236, 72, 153, 0.15) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: 'var(--radius-xl)',
          padding: '48px 32px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 12 }}>
          Ready to sound confident in your next conversation?
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 600, margin: '0 auto 28px' }}>
          Join thousands of learners overcoming hesitation through daily interactive speaking sessions with Flunexa Talk.
        </p>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="btn-primary"
          style={{ padding: '15px 36px', fontSize: 16, fontWeight: 700 }}
        >
          <span>Open My Learning Dashboard</span>
          <ArrowRight size={18} />
        </button>
      </section>
    </div>
  );
};
