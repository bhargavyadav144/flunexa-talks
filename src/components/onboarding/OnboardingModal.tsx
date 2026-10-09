import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EnglishLevel, NativeLanguage, AvatarId } from '../../types';
import { TeacherAvatar } from '../avatar/TeacherAvatar';
import { triggerConfetti } from '../common/ConfettiTrigger';
import { Check, ChevronRight, ChevronLeft, Sparkles, X } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser, addXp } = useApp();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(user.name);
  const [age, setAge] = useState(user.age || 22);
  const [nativeLanguage, setNativeLanguage] = useState<NativeLanguage>(user.nativeLanguage || 'Telugu');
  const [level, setLevel] = useState<EnglishLevel>(user.level || 'B1');
  const [goal, setGoal] = useState(user.goal || 'Job Interview & Career Fluency');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(user.dailyGoalMinutes || 10);
  const [confidence, setConfidence] = useState(user.confidence || 7);
  const [currentUsage, setCurrentUsage] = useState(user.currentUsage || 'Occasional college and office use');
  const [avatar, setAvatar] = useState<AvatarId>(user.avatar || 'alex');

  if (!isOpen) return null;

  const totalSteps = 8;

  const handleFinish = () => {
    updateUser({
      name: name.trim() || 'Learner',
      age: Number(age) || 22,
      nativeLanguage,
      level,
      goal,
      dailyGoalMinutes,
      confidence,
      currentUsage,
      avatar,
      onboarded: true,
    });
    triggerConfetti(true);
    addXp(50, 'Completed SpeakUp Onboarding');
    onClose();
  };

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

  const LEVELS: { level: EnglishLevel; title: string; desc: string }[] = [
    { level: 'A1', title: 'Beginner', desc: 'Can understand simple English but struggles to speak.' },
    { level: 'A2', title: 'Elementary', desc: 'Can create simple sentences and understand basic phrases.' },
    { level: 'B1', title: 'Intermediate', desc: 'Can hold basic conversations and express routine thoughts.' },
    { level: 'B2', title: 'Upper Intermediate', desc: 'Can discuss different topics but makes grammar/fluency mistakes.' },
    { level: 'C1', title: 'Advanced', desc: 'Can communicate comfortably with occasional minor mistakes.' },
    { level: 'C2', title: 'Fluent', desc: 'Advanced professional and native-like spontaneous communication.' },
  ];

  const GOALS = [
    'Crack Job Interviews & HR Rounds',
    'Professional Workplace Meetings & Client Calls',
    'Campus Placements & College Presentations',
    'Public Speaking, Debates & Group Discussions',
    'Daily Casual Fluency & Speaking Without Fear',
    'IELTS / TOEFL / Study Abroad Preparation',
  ];

  const USAGE_OPTIONS = [
    'Rarely — I hesitate and freeze when speaking',
    'Occasionally — Only when required at college or work',
    'Frequently — With peers and colleagues, but make mistakes',
    'Daily — But I want to eliminate hesitation and sound natural',
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
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
          maxWidth: 680,
          backgroundColor: 'var(--bg-card-solid)',
          borderRadius: 'var(--radius-xl)',
          padding: 30,
          position: 'relative',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-glass)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 20, right: 20, color: 'var(--text-muted)' }}
          className="btn-icon"
        >
          <X size={18} />
        </button>

        {/* Progress bar */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}% Setup</span>
          </div>
          <div style={{ width: '100%', height: 6, backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 3, overflow: 'hidden' }}>
            <div
              style={{
                width: `${(step / totalSteps) * 100}%`,
                height: '100%',
                background: 'var(--gradient-primary)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Step 1: Name & Age */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <TeacherAvatar avatarId={avatar} state="celebrating" size="md" showBadge={false} />
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800 }}>Welcome to Flunexa Talk! 👋</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  Let's personalize your daily 10-minute speaking coaching plan.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                  What is your name?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bhargav"
                  style={{ width: '100%', padding: '12px 16px', fontSize: 15 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                  Your Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  min={10}
                  max={99}
                  style={{ width: '100%', padding: '12px 16px', fontSize: 15 }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Preferred Explanation Language */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <span className="badge badge-primary" style={{ marginBottom: 8 }}>Native Language Support</span>
              <h2 style={{ fontSize: 24, fontWeight: 800 }}>Choose Preferred Explanation Language</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
                When you make a mistake, our AI teacher will explain the exact reason in this language, while keeping your English sentences natural.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setNativeLanguage(lang)}
                  className="glass-card"
                  style={{
                    padding: '14px 10px',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: 14,
                    borderRadius: 'var(--radius-md)',
                    border: nativeLanguage === lang ? '2px solid var(--color-primary)' : '1px solid var(--border-glass)',
                    backgroundColor: nativeLanguage === lang ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface-elevated)',
                    color: nativeLanguage === lang ? 'var(--color-primary-light)' : 'var(--text-main)',
                  }}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: English Level */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800 }}>What is your current English Level?</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                Select the description that best fits you right now (you can adjust this anytime).
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LEVELS.map((item) => (
                <div
                  key={item.level}
                  onClick={() => setLevel(item.level)}
                  className="glass-card glass-card-interactive"
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: level === item.level ? '2px solid var(--color-primary)' : '1px solid var(--border-glass)',
                    backgroundColor: level === item.level ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="badge badge-primary" style={{ fontSize: 11 }}>Level {item.level}</span>
                      <strong style={{ fontSize: 15 }}>{item.title}</strong>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      {item.desc}
                    </div>
                  </div>
                  {level === item.level && <Check size={18} color="var(--color-primary)" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Main Goal */}
        {step === 4 && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800 }}>What is your primary speaking goal?</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                We'll tailor your daily conversation prompts and vocabulary challenges to this target.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {GOALS.map((g) => (
                <div
                  key={g}
                  onClick={() => setGoal(g)}
                  className="glass-card glass-card-interactive"
                  style={{
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: goal === g ? '2px solid var(--color-primary)' : '1px solid var(--border-glass)',
                    backgroundColor: goal === g ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{g}</span>
                  {goal === g && <Check size={18} color="var(--color-primary)" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Daily Practice Time */}
        {step === 5 && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800 }}>How much time will you speak daily?</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                Consistency beats intensity! We strongly recommend our signature 10-minute session.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              {[
                { min: 5, label: '5 Minutes', sub: 'Light habit builder' },
                { min: 10, label: '10 Minutes', sub: 'Recommended (Daily 10 workout)' },
                { min: 15, label: '15 Minutes', sub: 'Rapid acceleration' },
                { min: 20, label: '20 Minutes', sub: 'Intensive immersion' },
              ].map((item) => (
                <div
                  key={item.min}
                  onClick={() => setDailyGoalMinutes(item.min)}
                  className="glass-card glass-card-interactive"
                  style={{
                    padding: 20,
                    textAlign: 'center',
                    borderRadius: 'var(--radius-lg)',
                    border: dailyGoalMinutes === item.min ? '2px solid var(--color-primary)' : '1px solid var(--border-glass)',
                    backgroundColor: dailyGoalMinutes === item.min ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-primary-light)' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    {item.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Confidence Level */}
        {step === 6 && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800 }}>How confident do you feel speaking English?</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                Rate your current confidence on a scale of 1 (anxious/hesitant) to 10 (fearless).
              </p>
            </div>

            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 44, fontWeight: 900, color: 'var(--color-primary-light)', marginBottom: 8 }}>
                {confidence} / 10
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', marginBottom: 24 }}>
                {confidence <= 3
                  ? 'I get nervous and translate word-by-word in my head.'
                  : confidence <= 6
                  ? 'I can express simple ideas but pause often to search for words.'
                  : confidence <= 8
                  ? 'Comfortable in most situations, want to polish grammar and accent.'
                  : 'Very confident, aiming for master-level articulation and spontaneity.'}
              </div>

              <input
                type="range"
                min={1}
                max={10}
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                style={{ width: '80%', accentColor: '#6366f1', height: 8 }}
              />
            </div>
          </div>
        )}

        {/* Step 7: Current Usage */}
        {step === 7 && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800 }}>How often do you currently speak English?</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                Understanding your routine helps our AI simulate relevant conversational contexts.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {USAGE_OPTIONS.map((u) => (
                <div
                  key={u}
                  onClick={() => setCurrentUsage(u)}
                  className="glass-card glass-card-interactive"
                  style={{
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: currentUsage === u ? '2px solid var(--color-primary)' : '1px solid var(--border-glass)',
                    backgroundColor: currentUsage === u ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{u}</span>
                  {currentUsage === u && <Check size={18} color="var(--color-primary)" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 8: Choose AI Tutor Character */}
        {step === 8 && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800 }}>Choose Your Animated AI Tutor Avatar</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                Your personal AI coach has animated facial expressions, mouth lip-sync, and adaptive personality.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              {[
                { id: 'nexa' as AvatarId, name: 'Nexa (Flunexa Bot)', trait: 'Funny AI Robot', desc: 'Hilarious, witty, glowing circuits & animated reactions.' },
                { id: 'alex' as AvatarId, name: 'Alex', trait: 'Friendly Male Coach', desc: 'Encouraging, patient and conversational.' },
                { id: 'mia' as AvatarId, name: 'Mia', trait: 'Cheerful Female Tutor', desc: 'Upbeat, high energy, rich vocabulary.' },
                { id: 'aria' as AvatarId, name: 'Aria', trait: 'Professional Female Mentor', desc: 'Polished, structured, career fluency.' },
                { id: 'leo' as AvatarId, name: 'Leo', trait: 'Casual Male Partner', desc: 'Relaxed, friendly, debate & natural banter.' },
              ].map((av) => (
                <div
                  key={av.id}
                  onClick={() => setAvatar(av.id)}
                  className="glass-card glass-card-interactive"
                  style={{
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    border: avatar === av.id ? '2px solid var(--color-primary)' : '1px solid var(--border-glass)',
                    backgroundColor: avatar === av.id ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                  }}
                >
                  <TeacherAvatar avatarId={av.id} state={avatar === av.id ? 'celebrating' : 'idle'} size="md" showBadge={false} />
                  <strong style={{ marginTop: 8, fontSize: 15 }}>{av.name}</strong>
                  <span style={{ fontSize: 11, color: 'var(--color-primary-light)', fontWeight: 600 }}>{av.trait}</span>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{av.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 16, borderTop: '1px solid var(--border-glass)' }}>
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="btn-secondary"
              style={{ padding: '10px 18px', fontSize: 13 }}
            >
              <ChevronLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              className="btn-primary"
              style={{ padding: '10px 22px', fontSize: 14 }}
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="btn-primary"
              style={{
                padding: '12px 28px',
                fontSize: 15,
                background: 'var(--gradient-emerald)',
                boxShadow: '0 4px 18px var(--color-success-glow)',
              }}
            >
              <Sparkles size={18} /> Start Speaking Now!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
