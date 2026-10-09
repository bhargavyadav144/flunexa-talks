import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { SPINNING_WHEEL_TOPICS } from '../../data/topicsData';
import { TeacherAvatar } from '../avatar/TeacherAvatar';
import { AudioWaveform } from '../common/AudioWaveform';
import { speechService } from '../../services/speechService';
import { AIService } from '../../services/aiService';
import { soundService } from '../../services/soundService';
import { triggerConfetti } from '../common/ConfettiTrigger';
import {
  Sparkles,
  Clock,
  Play,
  RotateCw,
  CheckCircle2,
  Mic,
  Award,
} from 'lucide-react';

export const SpinningWheelTest: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user, selectedAvatar, openAnalysisModal, completeChallenge } = useApp();

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topicQuestion, setTopicQuestion] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(2); // 2, 3, 5, 10
  const [isSpeakingActive, setIsSpeakingActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [transcript, setTranscript] = useState('');
  const [micVolume, setMicVolume] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef<any>(null);

  // Countdown timer during speaking
  useEffect(() => {
    if (isSpeakingActive && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (isSpeakingActive && secondsLeft === 0) {
      handleTimeExpired();
    }
    return () => clearInterval(timerRef.current);
  }, [isSpeakingActive, secondsLeft]);

  // Clean up
  useEffect(() => {
    return () => {
      speechService.stopSpeaking();
      speechService.stopListening();
    };
  }, []);

  const spinTheWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedTopic(null);
    setTopicQuestion('');
    setIsFinished(false);

    // Audio tick tick simulation
    const ticksInterval = setInterval(() => {
      soundService.playTick();
    }, 120);

    // Spin 5 to 8 full rotations + random slice
    const totalSlices = SPINNING_WHEEL_TOPICS.length;
    const randomIndex = Math.floor(Math.random() * totalSlices);
    const sliceAngle = 360 / totalSlices;
    const additionalSpins = (5 + Math.floor(Math.random() * 4)) * 360;
    const finalAngle = rotation + additionalSpins + (360 - randomIndex * sliceAngle);

    setRotation(finalAngle);

    setTimeout(() => {
      clearInterval(ticksInterval);
      setIsSpinning(false);
      const chosen = SPINNING_WHEEL_TOPICS[randomIndex];
      setSelectedTopic(chosen);
      setSecondsLeft(durationMinutes * 60);

      // Map question
      const questionsMap: Record<string, string> = {
        'Technology': 'How has technology fundamentally changed your daily habits and communication with friends?',
        'College Life': 'What is the most memorable project or lesson you have experienced in your student life?',
        'Friendship': 'What quality do you value most in a true friend, and how do you support each other?',
        'Travel': 'Describe a place you have explored or dream of visiting. What makes that destination captivating?',
        'Food & Health': 'What is your favorite homemade meal, and how do you balance taste with healthy habits?',
        'Social Media': 'Do you feel social media brings authentic connection or unnecessary peer comparison?',
        'Cinema & Movies': 'Tell me about a film that deeply impacted your thoughts or emotions.',
        'Cricket & Sports': 'How does participating in or watching sports build leadership, teamwork, and resilience?',
        'Artificial Intelligence': 'How can students and professionals use AI productively without losing critical thinking?',
        'Future Careers': 'Where do you envision your career five years from now, and what steps are you taking today?',
        'Family Traditions': 'Share a unique tradition or celebration your family observes that you cherish.',
        'Education System': 'If you could reform one aspect of the education system, what would you prioritize?',
        'Environment': 'What small, actionable habits can individuals adopt to preserve nature and reduce waste?',
        'Money & Success': 'Is financial stability the cornerstone of happiness, or are peace of mind and purpose greater?',
        'Dreams & Ambitions': 'What is one ambitious aspiration you want to achieve before you turn 30?',
        'Festivals & Culture': 'Describe how your favorite cultural festival is celebrated in your hometown.',
        'Creative Hobbies': 'How do creative hobbies like music, writing, or cooking help refresh your mental energy?',
        'Leadership & Confidence': 'What does being an effective and empathetic leader mean to you?',
      };

      const q = questionsMap[chosen] || `Share your candid thoughts and life perspective on ${chosen}.`;
      setTopicQuestion(q);
      soundService.playAchievementFanfare();
      completeChallenge('dc-4'); // Complete spin challenge
    }, 3200);
  };

  const startSpeakingTimer = async () => {
    setIsSpeakingActive(true);
    setTranscript('');
    soundService.playTick();

    await speechService.initMicrophoneWaveform((vol) => setMicVolume(vol));

    speechService.startListening({
      onInterimResult: (t) => setTranscript(t),
      onFinalResult: (t) => setTranscript(t),
    });
  };

  const handleTimeExpired = () => {
    setIsSpeakingActive(false);
    setIsFinished(true);
    speechService.stopListening();
    triggerConfetti(true);
  };

  const submitAndAnalyze = () => {
    const totalDuration = durationMinutes * 60 - secondsLeft;
    const analysis = AIService.generateSessionAnalysis(
      transcript || `Technology has changed my daily life in so many ways. I use my smartphone for education and staying connected.`,
      `Topic Challenge: ${selectedTopic}`,
      Math.max(60, totalDuration),
      user.nativeLanguage
    );
    openAnalysisModal(analysis);
  };

  const formatMinSec = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Wheel colors
  const SLICE_COLORS = [
    '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6',
    '#14b8a6', '#f97316', '#06b6d4', '#e11d48', '#84cc16', '#a855f7',
    '#0ea5e9', '#d946ef', '#10b981', '#f59e0b', '#6366f1', '#ec4899',
  ];

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px 20px 80px' }}>
      <button onClick={onBack} className="btn-secondary" style={{ marginBottom: 16, padding: '8px 16px', fontSize: 13 }}>
        ← Back to Test Center
      </button>

      <div className="glass-card" style={{ padding: 24, borderRadius: 'var(--radius-xl)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span className="badge badge-primary">TEST 5</span>
          <span className="badge badge-warning">Random Topic Challenge</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Topic Challenge & Spinning Wheel 🎡</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Spin the wheel across 18 curated conversational topics, select your target duration, and speak without interruption until the countdown finishes!
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} className="md:grid-cols-2">
        {/* Left: The Spinning Wheel */}
        <div
          className="glass-card"
          style={{
            padding: 30,
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Wheel Pointer Arrow at Top */}
          <div
            style={{
              position: 'absolute',
              top: 18,
              zIndex: 10,
              width: 0,
              height: 0,
              borderLeft: '14px solid transparent',
              borderRight: '14px solid transparent',
              borderTop: '24px solid #ef4444',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
            }}
          />

          {/* Wheel Graphic */}
          <div
            style={{
              width: 280,
              height: 280,
              borderRadius: '50%',
              position: 'relative',
              boxShadow: '0 0 30px rgba(99, 102, 241, 0.35)',
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 3.2s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
              overflow: 'hidden',
              border: '6px solid #1e293b',
            }}
          >
            <svg viewBox="0 0 300 300" style={{ width: '100%', height: '100%' }}>
              {SPINNING_WHEEL_TOPICS.map((topic, i) => {
                const total = SPINNING_WHEEL_TOPICS.length;
                const angle = 360 / total;
                const startAngle = (i * angle * Math.PI) / 180;
                const endAngle = (((i + 1) * angle) * Math.PI) / 180;

                const x1 = 150 + 150 * Math.cos(startAngle);
                const y1 = 150 + 150 * Math.sin(startAngle);
                const x2 = 150 + 150 * Math.cos(endAngle);
                const y2 = 150 + 150 * Math.sin(endAngle);

                const pathData = `M 150 150 L ${x1} ${y1} A 150 150 0 0 1 ${x2} ${y2} Z`;

                return (
                  <g key={i}>
                    <path d={pathData} fill={SLICE_COLORS[i % SLICE_COLORS.length]} />
                  </g>
                );
              })}
              {/* Wheel center pin */}
              <circle cx="150" cy="150" r="32" fill="#0f172a" stroke="#ffffff" strokeWidth="3" />
              <text x="150" y="155" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">
                SPIN
              </text>
            </svg>
          </div>

          {/* Spin Trigger Button */}
          <button
            onClick={spinTheWheel}
            disabled={isSpinning || isSpeakingActive}
            className="btn-primary"
            style={{
              marginTop: 24,
              padding: '14px 40px',
              fontSize: 16,
              background: 'var(--gradient-primary)',
              opacity: isSpinning ? 0.6 : 1,
            }}
          >
            <RotateCw size={18} className={isSpinning ? 'animate-spin' : ''} />
            <span>{isSpinning ? 'Spinning Wheel...' : 'SPIN 🎡'}</span>
          </button>
        </div>

        {/* Right: Topic Result & Speaking Countdown Timer */}
        <div
          className="glass-card"
          style={{
            padding: 28,
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {selectedTopic ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="badge badge-primary">SELECTED TOPIC</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Adaptive Level</span>
              </div>

              <h2 style={{ fontSize: 26, fontWeight: 900, color: 'var(--color-primary-light)', marginBottom: 8 }}>
                "{selectedTopic}"
              </h2>

              <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5, marginBottom: 20 }}>
                {topicQuestion}
              </p>

              {/* Duration Selector Tabs: 2 MIN, 3 MIN, 5 MIN, 10 MIN */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8 }}>
                  CHOOSE SPEAKING DURATION:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[2, 3, 5, 10].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => {
                        if (!isSpeakingActive) {
                          setDurationMinutes(mins);
                          setSecondsLeft(mins * 60);
                        }
                      }}
                      className="glass-card"
                      style={{
                        padding: '10px 0',
                        textAlign: 'center',
                        fontWeight: 800,
                        fontSize: 13,
                        borderRadius: 'var(--radius-md)',
                        border: durationMinutes === mins ? '2px solid var(--color-primary)' : '1px solid var(--border-glass)',
                        backgroundColor: durationMinutes === mins ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-card)',
                        color: durationMinutes === mins ? 'var(--color-primary-light)' : 'var(--text-main)',
                      }}
                    >
                      {mins} MIN
                    </button>
                  ))}
                </div>
              </div>

              {/* Digital Countdown Timer Display */}
              <div
                style={{
                  padding: 20,
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  textAlign: 'center',
                  marginBottom: 18,
                }}
              >
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>COUNTDOWN TIMER</div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 44,
                    fontWeight: 900,
                    color: secondsLeft <= 15 ? '#ef4444' : 'var(--text-main)',
                  }}
                >
                  {formatMinSec(secondsLeft)}
                </div>
                <AudioWaveform isActive={isSpeakingActive} volume={micVolume} color="#10b981" />
              </div>

              {/* Live transcript snippet */}
              {transcript && (
                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px dashed #10b981',
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  🎙️ {transcript}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                {!isSpeakingActive && !isFinished ? (
                  <button
                    onClick={startSpeakingTimer}
                    className="btn-primary"
                    style={{ flex: 1, padding: '14px 20px', fontSize: 15 }}
                  >
                    <Play size={18} fill="#ffffff" />
                    <span>Start Speaking Timer</span>
                  </button>
                ) : isSpeakingActive ? (
                  <button
                    onClick={handleTimeExpired}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '14px 20px', fontSize: 15 }}
                  >
                    <span>Finish Speaking Early</span>
                  </button>
                ) : (
                  <button
                    onClick={submitAndAnalyze}
                    className="btn-primary"
                    style={{ flex: 1, padding: '14px 20px', fontSize: 15, background: 'var(--gradient-emerald)' }}
                  >
                    <CheckCircle2 size={18} />
                    <span>Time's up! View Analysis 🎉</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '40px 20px' }}>
              <TeacherAvatar avatarId={selectedAvatar} state="idle" size="lg" />
              <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 16 }}>Ready for a Surprising Topic?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6, maxWidth: 320 }}>
                Click <strong>SPIN 🎡</strong> on the wheel to draw your surprise speaking subject.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
