import React from 'react';
import { useApp } from '../../context/AppContext';
import { TeacherAvatar } from '../avatar/TeacherAvatar';
import { AvatarSelector } from '../avatar/AvatarSelector';
import {
  BrainCircuit,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  Play,
  RotateCcw,
} from 'lucide-react';

export const AICoachView: React.FC = () => {
  const { user, selectedAvatar, setSelectedAvatar, setCurrentView, addXp } = useApp();

  const coachInsights = [
    {
      type: 'recurring_mistake',
      badge: 'GRAMMAR TENSE FOCUS',
      color: '#ef4444',
      title: 'Past Tense Regularization',
      observation: 'You frequently use present base verbs ("I go") when referring to completed yesterday events instead of past forms ("I went").',
      remedy: 'Practice 5 rapid storytelling drills focusing exclusively on irregular past forms (went, bought, spoke, chose).',
      actionText: 'Launch Past Tense Drill',
    },
    {
      type: 'vocabulary_habit',
      badge: 'VOCABULARY VARIETY',
      color: '#f59e0b',
      title: 'Frequent Usage of "Very"',
      observation: 'You used the word "very" 14 times this week ("very good", "very big", "very hard").',
      remedy: 'Swap "very" with high-impact single adjectives: "exceptional", "colossal", "demanding".',
      actionText: 'Review Expressive Vocabulary',
    },
    {
      type: 'fluency_rhythm',
      badge: 'SENTENCE TRANSITION PAUSES',
      color: '#8b5cf6',
      title: 'Pause Before Multi-Clause Sentences',
      observation: 'You maintain a brisk 125 WPM in short answers, but experience 2.5s pauses before connecting thoughts with "however" or "because".',
      remedy: 'Use thought-group chunking drills to smoothly link compound ideas.',
      actionText: 'Start Linking Words Practice',
    },
    {
      type: 'achievement',
      badge: 'STRONG IMPROVEMENT',
      color: '#10b981',
      title: 'Pronunciation Accuracy Gained +9%',
      observation: 'Your clarity on phonetic consonant clusters (/th/, /pl/, /sk/) is significantly crisper than last week.',
      remedy: 'Maintain this momentum by attempting the C1 Advanced Read Aloud passages.',
      actionText: 'Attempt Advanced Test',
    },
  ];

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 20px 80px' }}>
      {/* Top Banner with AI Teacher Persona */}
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
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(236, 72, 153, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
        }}
      >
        <div style={{ maxWidth: 580 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="badge badge-primary">PERSONALIZED AI COACH</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Memory & Habit Tracker</span>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 900 }}>Meet Your Speaking Coach</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 6, lineHeight: 1.5 }}>
            I continuously analyze your speaking rhythm, recurring grammatical slips, and vocabulary repertoire to build custom workouts designed around your blind spots.
          </p>

          <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
            <button
              onClick={() => setCurrentView('practice')}
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: 14 }}
            >
              <Play size={16} fill="#ffffff" />
              <span>Talk With Your Coach Now</span>
            </button>
          </div>
        </div>

        <TeacherAvatar avatarId={selectedAvatar} state="idle" size="xl" />
      </div>

      {/* Switch Avatar Character */}
      <div style={{ marginBottom: 30 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Choose Your AI Teacher Character</h2>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tap to switch active persona</span>
        </div>
        <AvatarSelector currentAvatar={selectedAvatar} onSelect={(id) => setSelectedAvatar(id)} />
      </div>

      {/* Personalized Learning Patterns & Weakness Diagnostics */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <BrainCircuit size={22} color="var(--color-primary-light)" />
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Linguistic Memory & Insights for {user.name}</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {coachInsights.map((insight, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: 22,
                borderRadius: 'var(--radius-xl)',
                borderLeft: `5px solid ${insight.color}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: insight.color,
                    letterSpacing: '0.05em',
                  }}
                >
                  {insight.badge}
                </span>

                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '6px 0 8px' }}>
                  {insight.title}
                </h3>

                <p style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.5, marginBottom: 12 }}>
                  <strong>Diagnostic:</strong> {insight.observation}
                </p>

                <div
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: 'var(--bg-surface-elevated)',
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    lineHeight: 1.4,
                    marginBottom: 16,
                  }}
                >
                  <strong style={{ color: 'var(--color-primary-light)' }}>Recommended Remedy: </strong>
                  {insight.remedy}
                </div>
              </div>

              <button
                onClick={() => {
                  addXp(15, `Started ${insight.title}`);
                  setCurrentView('daily10');
                }}
                className="btn-secondary"
                style={{ width: '100%', padding: '10px 16px', fontSize: 13 }}
              >
                <span>{insight.actionText}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
