import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ReadAloudTest } from './ReadAloudTest';
import { RepeatAfterMeTest } from './RepeatAfterMeTest';
import { ReadAndSpeakTest } from './ReadAndSpeakTest';
import { PictureDescriptionTest } from './PictureDescriptionTest';
import { SpinningWheelTest } from './SpinningWheelTest';
import {
  Mic,
  RotateCw,
  Image,
  BookOpen,
  Volume2,
  Sparkles,
  ArrowRight,
  Award,
} from 'lucide-react';

export const TestCenter: React.FC = () => {
  const { currentAccount, openAuthModal } = useApp();
  const [activeTest, setActiveTest] = useState<number | null>(null);

  if (activeTest === 1) return <ReadAloudTest onBack={() => setActiveTest(null)} />;
  if (activeTest === 2) return <RepeatAfterMeTest onBack={() => setActiveTest(null)} />;
  if (activeTest === 3) return <ReadAndSpeakTest onBack={() => setActiveTest(null)} />;
  if (activeTest === 4) return <PictureDescriptionTest onBack={() => setActiveTest(null)} />;
  if (activeTest === 5) return <SpinningWheelTest onBack={() => setActiveTest(null)} />;

  const testList = [
    {
      id: 1,
      badge: 'TEST 1',
      title: 'Read Aloud',
      subtitle: 'Pronunciation & Pace Benchmark',
      desc: 'Read curated passages to benchmark your speech speed (WPM), pause points, and articulatory precision.',
      icon: <BookOpen size={24} color="#6366f1" />,
      color: '#6366f1',
      duration: '1–2 mins',
    },
    {
      id: 2,
      badge: 'TEST 2',
      title: 'Repeat After AI',
      subtitle: 'Speech Shadowing & Intonation',
      desc: 'Listen to AI-synthesized sentences and shadow them to match native cadence, rhythmic stress, and phonetic accuracy.',
      icon: <Volume2 size={24} color="#10b981" />,
      color: '#10b981',
      duration: '1–2 mins',
    },
    {
      id: 3,
      badge: 'TEST 3',
      title: 'Read and Speak',
      subtitle: 'Cognitive Recall & Synthesis',
      desc: 'Read a short passage under a 30s prep timer. Once the text disappears, explain the key points in your own words.',
      icon: <Mic size={24} color="#f59e0b" />,
      color: '#f59e0b',
      duration: '2–3 mins',
    },
    {
      id: 4,
      badge: 'TEST 4',
      title: 'Picture Description',
      subtitle: 'Descriptive Vocabulary & Grammar',
      desc: 'Look at illustrated scenes, take 30s to gather your thoughts, and speak for 1–3 minutes describing the action.',
      icon: <Image size={24} color="#ec4899" />,
      color: '#ec4899',
      duration: '2–3 mins',
    },
    {
      id: 5,
      badge: 'TEST 5',
      title: 'Random Topic Challenge',
      subtitle: 'Spinning Wheel & Timer',
      desc: 'Spin the 18-slice animated topic wheel and speak for 2, 3, 5, or 10 minutes without pause or script.',
      icon: <RotateCw size={24} color="#8b5cf6" />,
      color: '#8b5cf6',
      duration: '2–10 mins',
      hot: true,
    },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 20px 80px' }}>
      <div
        className="glass-card"
        style={{
          padding: '28px 32px',
          borderRadius: 'var(--radius-xl)',
          marginBottom: 26,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span className="badge badge-primary">TEST CENTER</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Rigorous Diagnostic Assessment</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900 }}>Spoken English Speaking Tests</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 6, maxWidth: 640 }}>
          Structured diagnostic evaluations replicating standard spoken English assessments like IELTS, TOEFL, and campus recruitment interviews.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {testList.map((test) => (
          <div
            key={test.id}
            onClick={() => setActiveTest(test.id)}
            className="glass-card glass-card-interactive"
            style={{
              padding: 24,
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span className="badge badge-primary">{test.badge}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>⏱️ {test.duration}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: `${test.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {test.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>{test.title}</h3>
                  <div style={{ fontSize: 12, color: 'var(--color-primary-light)', fontWeight: 600 }}>{test.subtitle}</div>
                </div>
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 20 }}>
                {test.desc}
              </p>
            </div>

            <button
              onClick={() => {
                if (!currentAccount) {
                  openAuthModal('signup');
                  return;
                }
                setActiveTest(test.id);
              }}
              className="btn-secondary"
              style={{
                width: '100%',
                padding: '10px 18px',
                fontSize: 13,
                justifyContent: 'space-between',
              }}
            >
              <span>Launch Test</span>
              <ArrowRight size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
