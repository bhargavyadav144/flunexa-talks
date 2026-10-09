import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EnglishLevel, NativeLanguage } from '../../types';
import { TeacherAvatar } from '../avatar/TeacherAvatar';
import { AvatarSelector } from '../avatar/AvatarSelector';
import { soundService } from '../../services/soundService';
import {
  User,
  Globe,
  Award,
  Clock,
  Shield,
  Trash2,
  CheckCircle2,
  Sparkles,
  Save,
  Crown,
  Zap,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    user,
    updateUser,
    resetProgress,
    selectedAvatar,
    setSelectedAvatar,
    currentAccount,
    userPlan,
    setCurrentView,
    openAuthModal,
  } = useApp();

  const [name, setName] = useState(user.name);
  const [age, setAge] = useState(user.age);
  const [nativeLanguage, setNativeLanguage] = useState<NativeLanguage>(user.nativeLanguage);
  const [level, setLevel] = useState<EnglishLevel>(user.level);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(user.dailyGoalMinutes);
  const [isPublic, setIsPublic] = useState(user.isPublicProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const LANGUAGES: NativeLanguage[] = [
    'Telugu',
    'Hindi',
    'Tamil',
    'Kannada',
    'Malayalam',
    'Bengali',
    'Marathi',
    'Gujarati',
    'English',
  ];

  const LEVELS: EnglishLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const handleSave = () => {
    updateUser({
      name: name.trim() || 'User',
      age: Number(age) || 22,
      nativeLanguage,
      level,
      dailyGoalMinutes,
      isPublicProfile: isPublic,
      avatar: selectedAvatar,
    });
    setSavedSuccess(true);
    soundService.playCompleteDing();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete all practice history and reset your account? This action is permanent.')) {
      resetProgress();
      alert('Your account and local practice data have been wiped clean.');
    }
  };

  return (
    <div style={{ maxWidth: 940, margin: '0 auto', padding: '20px 20px 80px' }}>
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
          <span className="badge badge-primary">PROFILE & PREFERENCES</span>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginTop: 4 }}>Account Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            Update your learning speed, native explanation language, and security preferences.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="btn-primary"
          style={{ padding: '12px 26px', fontSize: 14 }}
        >
          <Save size={16} />
          <span>Save Changes</span>
        </button>
      </div>

      {savedSuccess && (
        <div
          style={{
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            color: '#10b981',
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <CheckCircle2 size={18} />
          <span>Your preferences have been saved successfully!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <div className="glass-card" style={{ padding: 28, borderRadius: 'var(--radius-xl)', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 18 }}>Personal Information</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }} className="md:grid-cols-2">
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '10px 14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              style={{ width: '100%', padding: '10px 14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              Native Explanation Language (Grammar Rationale)
            </label>
            <select
              value={nativeLanguage}
              onChange={(e) => setNativeLanguage(e.target.value as NativeLanguage)}
              style={{ width: '100%', padding: '10px 14px' }}
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l} style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>English CEFR Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as EnglishLevel)}
              style={{ width: '100%', padding: '10px 14px' }}
            >
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl} style={{ backgroundColor: '#1e293b', color: '#ffffff' }}>
                  Level {lvl}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tutor Persona */}
      <div className="glass-card" style={{ padding: 28, borderRadius: 'var(--radius-xl)', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>Default AI Speaking Partner</h2>
        <AvatarSelector currentAvatar={selectedAvatar} onSelect={(id) => setSelectedAvatar(id)} />
      </div>

      {/* Subscription Plan & Account Sync */}
      <div
        className="glass-card"
        style={{
          padding: 28,
          borderRadius: 'var(--radius-xl)',
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(245, 158, 11, 0.08) 100%)',
          border: '1px solid rgba(129, 140, 248, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Crown size={22} color="#fbbf24" />
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Current Subscription Plan</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                {currentAccount ? `Linked Account: ${currentAccount.email}` : 'Local Guest Account — Sign in to sync across devices'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                background: userPlan === 'free' ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 900,
                padding: '6px 14px',
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.2)',
                letterSpacing: 1,
              }}
            >
              {userPlan.toUpperCase()} TIER
            </span>

            <button
              onClick={() => setCurrentView('plans')}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: 13 }}
            >
              <Zap size={14} />
              <span>{userPlan === 'free' ? 'Upgrade Plan' : 'View Plans'}</span>
            </button>
          </div>
        </div>

        {!currentAccount && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 13,
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>
              Sign up with real email OTP to protect your progress and get full multi-device synchronization.
            </span>
            <button
              onClick={() => openAuthModal('signup')}
              style={{
                background: 'rgba(99, 102, 241, 0.2)',
                border: '1px solid #818cf8',
                color: '#fff',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Sign Up Now
            </button>
          </div>
        )}
      </div>

      {/* Privacy, Audio Consent & Data Wipe */}
      <div className="glass-card" style={{ padding: 28, borderRadius: 'var(--radius-xl)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Shield size={20} color="#ef4444" />
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#ef4444' }}>Data Privacy & Security</h2>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 18 }}>
          Flunexa Talk adheres to strict data privacy standards. Raw voice recordings are processed in-memory for speech synthesis and voice activity detection and are <strong>never stored permanently on remote servers</strong>.
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--border-glass)' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Delete Account & Wipe Progress</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Permanently erase speaking history, streaks, and XP points.</div>
          </div>

          <button
            onClick={handleDeleteAccount}
            className="btn-secondary"
            style={{ color: '#ef4444', borderColor: '#ef4444' }}
          >
            <Trash2 size={15} />
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
