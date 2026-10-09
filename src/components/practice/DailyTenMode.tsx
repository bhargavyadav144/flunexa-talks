import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { TeacherAvatar } from '../avatar/TeacherAvatar';
import { VoiceStatusBadge } from '../common/VoiceStatusBadge';
import { AudioWaveform } from '../common/AudioWaveform';
import { speechService } from '../../services/speechService';
import { AIService } from '../../services/aiService';
import { soundService } from '../../services/soundService';
import {
  Clock,
  Play,
  Pause,
  ChevronRight,
  Flame,
  Sparkles,
  Zap,
  BarChart2,
  CheckCircle2,
  Mic,
  Send,
} from 'lucide-react';

interface StageConfig {
  id: number;
  title: string;
  minStart: number;
  minEnd: number;
  description: string;
  icon: string;
  prompts: string[];
}

export const DailyTenMode: React.FC = () => {
  const { user, selectedAvatar, openAnalysisModal, completeChallenge, currentAccount, openAuthModal } = useApp();

  const STAGES: StageConfig[] = [
    {
      id: 1,
      title: 'Warm-up Conversation',
      minStart: 0,
      minEnd: 2,
      description: 'Simple day-to-day questions to get your vocal cords and confidence ready.',
      icon: '☕',
      prompts: [
        'How was your day so far, and what is one interesting thing you did today?',
        'What are you planning for tomorrow or this upcoming weekend?',
        'How do you usually like to unwind after a busy day?',
      ],
    },
    {
      id: 2,
      title: 'Topic Speaking',
      minStart: 2,
      minEnd: 5,
      description: 'Speak in depth about a structured topic. Focus on detail and vivid adjectives.',
      icon: '🎙️',
      prompts: [
        'Describe your favorite food or cuisine in detail. What makes it special and how is it prepared?',
        'Tell me about a memorable trip you took with family or friends.',
        'What is a skill or hobby you have always wanted to master?',
      ],
    },
    {
      id: 3,
      title: 'Opinion Discussion',
      minStart: 5,
      minEnd: 8,
      description: 'Defend a stance and organize your arguments using transitional words.',
      icon: '💡',
      prompts: [
        'Do you think social media brings more benefits or mental health harm to students today?',
        'Will Artificial Intelligence replace teachers or improve education?',
        'Is working from home better than working together in a traditional office?',
      ],
    },
    {
      id: 4,
      title: 'Rapid Speaking Challenge',
      minStart: 8,
      minEnd: 10,
      description: 'Quick-fire questions! Answer spontaneously without over-thinking grammar.',
      icon: '⚡',
      prompts: [
        'Quick question: If you could have any superpower for 24 hours, what would it be and why?',
        'Early mornings or late nights? Give your top three reasons in 30 seconds!',
        'What is the best piece of advice anyone ever gave you?',
      ],
    },
  ];

  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0); // 0 to 600
  const [isActive, setIsActive] = useState(false);
  const [avatarState, setAvatarState] = useState<'idle' | 'speaking' | 'listening' | 'thinking' | 'celebrating'>('idle');
  const [mouthVolume, setMouthVolume] = useState(0);
  const [micVolume, setMicVolume] = useState(0);
  const [userTranscriptHistory, setUserTranscriptHistory] = useState<string[]>([]);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [aiMessage, setAiMessage] = useState<string>('');
  const [textInput, setTextInput] = useState('');
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);

  const stage = STAGES[currentStageIdx];
  const timerRef = useRef<any>(null);

  // 10 minute timer ticker
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSessionSeconds((prev) => {
          const next = prev + 1;
          // Stage transitions
          if (next >= 120 && next < 300 && currentStageIdx === 0) {
            handleTransitionToStage(1);
          } else if (next >= 300 && next < 480 && currentStageIdx === 1) {
            handleTransitionToStage(2);
          } else if (next >= 480 && next < 600 && currentStageIdx === 2) {
            handleTransitionToStage(3);
          } else if (next >= 600) {
            handleSessionCompleted();
            return 600;
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, currentStageIdx]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      speechService.stopSpeaking();
      speechService.stopListening();
    };
  }, []);

  const handleTransitionToStage = (newIdx: number) => {
    setCurrentStageIdx(newIdx);
    setCurrentPromptIdx(0);
    soundService.playTick();
    const newStage = STAGES[newIdx];
    const promptText = `Welcome to Stage ${newStage.id}: ${newStage.title}! ${newStage.prompts[0]}`;
    setAiMessage(promptText);
    speakAI(promptText);
  };

  const speakAI = (text: string) => {
    setAvatarState('speaking');
    speechService.speak(
      text,
      selectedAvatar,
      user.level,
      () => setAvatarState('speaking'),
      () => setAvatarState('listening'),
      (vol) => setMouthVolume(vol)
    );
  };

  const startDailyWorkout = async () => {
    if (!currentAccount) {
      openAuthModal('signup');
      return;
    }

    setIsActive(true);
    soundService.playTick();

    await speechService.initMicrophoneWaveform((vol) => setMicVolume(vol));

    const initialText = `Welcome to today's Daily 10 speaking workout, ${user.name}! Let's start with warm-up. ${stage.prompts[0]}`;
    setAiMessage(initialText);
    speakAI(initialText);

    // Start recognition
    speechService.startListening({
      onUserSpeakingDetected: () => {
        speechService.stopSpeaking();
        setAvatarState('listening');
      },
      onInterimResult: (trans) => {
        if (speechService.isSpeaking()) speechService.stopSpeaking();
        setAvatarState('listening');
        setLiveTranscript(trans);
      },
      onFinalResult: (trans) => {
        handleUserSpoke(trans);
      },
    });
  };

  const handleUserSpoke = (transcript: string) => {
    if (!transcript.trim()) return;

    setUserTranscriptHistory((prev) => [...prev, transcript]);
    setLiveTranscript('');
    setAvatarState('thinking');

    // After user responds, congratulate & proceed to next prompt or ask elaboration
    setTimeout(() => {
      const nextPrompt = stage.prompts[(currentPromptIdx + 1) % stage.prompts.length];
      setCurrentPromptIdx((prev) => (prev + 1) % stage.prompts.length);

      const reply = `Great thought! You articulated that well. Moving forward: ${nextPrompt}`;
      setAiMessage(reply);
      speakAI(reply);
    }, 800);
  };

  const handleSessionCompleted = () => {
    setIsActive(false);
    speechService.stopSpeaking();
    speechService.stopListening();
    completeChallenge('dc-5');

    const totalText = userTranscriptHistory.join('. ') || 'Today was a productive day. I enjoyed practicing English with my AI coach.';
    const analysis = AIService.generateSessionAnalysis(
      totalText,
      'Daily 10 Complete Speaking Workout',
      sessionSeconds || 600,
      user.nativeLanguage
    );
    openAnalysisModal(analysis);
  };

  const formatMinSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '16px 20px 80px' }}>
      {/* Top Banner */}
      <div
        className="glass-card"
        style={{
          padding: '20px 28px',
          borderRadius: 'var(--radius-xl)',
          marginBottom: 20,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.14) 0%, rgba(245, 158, 11, 0.09) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="badge badge-primary">SIGNATURE WORKOUT</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Daily Habit Builder</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, marginTop: 4 }}>Daily 10 Speaking Session</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            10 minutes divided into 4 scientific phases for maximum spontaneous reflex.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Big Digital Clock */}
          <div
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-card-solid)',
              border: '2px solid var(--color-primary)',
              boxShadow: 'var(--shadow-glow)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700 }}>SESSION CLOCK</div>
            <div style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
              {formatMinSec(sessionSeconds)} <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/ 10:00</span>
            </div>
          </div>

          <button
            onClick={handleSessionCompleted}
            className="btn-primary"
            style={{ padding: '12px 22px', fontSize: 14, background: 'var(--gradient-emerald)' }}
          >
            <BarChart2 size={16} />
            <span>Finish Early & Score</span>
          </button>
        </div>
      </div>

      {/* 4 Stages Timeline Tracker */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          marginBottom: 24,
        }}
      >
        {STAGES.map((s, idx) => {
          const isPassed = currentStageIdx > idx;
          const isCurrent = currentStageIdx === idx;

          return (
            <div
              key={s.id}
              onClick={() => {
                if (isActive) handleTransitionToStage(idx);
              }}
              className="glass-card"
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: isCurrent
                  ? '2px solid var(--color-primary)'
                  : isPassed
                  ? '1px solid #10b981'
                  : '1px solid var(--border-glass)',
                backgroundColor: isCurrent
                  ? 'rgba(99, 102, 241, 0.16)'
                  : isPassed
                  ? 'rgba(16, 185, 129, 0.08)'
                  : 'var(--bg-card)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 16 }}>{s.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: isCurrent ? 'var(--color-primary-light)' : 'var(--text-dim)' }}>
                  Min {s.minStart}–{s.minEnd}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
                {s.title}
              </div>
              {isPassed && (
                <div style={{ fontSize: 10, color: '#10b981', fontWeight: 600, marginTop: 4 }}>
                  ✓ Completed
                </div>
              )}
              {isCurrent && (
                <div style={{ fontSize: 10, color: 'var(--color-primary-light)', fontWeight: 700, marginTop: 4 }}>
                  ● Active Stage
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Active Stage Stage */}
      <div
        className="glass-card"
        style={{
          padding: 30,
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <VoiceStatusBadge state={avatarState} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Stage {stage.id}: {stage.description}
          </span>
        </div>

        {/* Big Avatar */}
        <div style={{ margin: '14px 0 20px' }}>
          <TeacherAvatar
            avatarId={selectedAvatar}
            state={avatarState}
            mouthVolume={mouthVolume}
            size="xl"
          />
        </div>

        {/* Current Prompt Banner */}
        <div
          className="glass-card"
          style={{
            maxWidth: 720,
            width: '100%',
            padding: '20px 26px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderLeft: '5px solid var(--color-primary)',
            textAlign: 'left',
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary-light)', textTransform: 'uppercase' }}>
            Current Speaking Prompt:
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6, lineHeight: 1.4 }}>
            {aiMessage || stage.prompts[currentPromptIdx]}
          </div>
        </div>

        {/* Audio Waveform */}
        <div style={{ width: '100%', maxWidth: 400, marginBottom: 20 }}>
          <AudioWaveform
            isActive={isActive}
            volume={avatarState === 'speaking' ? mouthVolume : micVolume}
            color={avatarState === 'speaking' ? '#6366f1' : '#10b981'}
          />
        </div>

        {/* Real-time stream indicator */}
        {liveTranscript && (
          <div
            style={{
              maxWidth: 600,
              padding: '10px 18px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px dashed #10b981',
              color: '#10b981',
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            🎙️ You: {liveTranscript}
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          {!isActive ? (
            <button
              onClick={startDailyWorkout}
              className="btn-primary"
              style={{ padding: '14px 36px', fontSize: 16 }}
            >
              <Play size={18} fill="#ffffff" />
              <span>Begin 10-Minute Workout</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setIsActive(false);
                speechService.stopSpeaking();
                speechService.stopListening();
                setAvatarState('idle');
              }}
              className="btn-secondary"
              style={{ padding: '14px 28px', fontSize: 15 }}
            >
              <Pause size={18} />
              <span>Pause Workout</span>
            </button>
          )}

          {isActive && (
            <button
              onClick={() => {
                const nextIdx = (currentPromptIdx + 1) % stage.prompts.length;
                setCurrentPromptIdx(nextIdx);
                const nextText = stage.prompts[nextIdx];
                setAiMessage(nextText);
                speakAI(nextText);
              }}
              className="btn-secondary"
              style={{ padding: '14px 24px', fontSize: 14 }}
            >
              <span>Next Prompt</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Manual text alternative */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (textInput.trim()) {
              handleUserSpoke(textInput);
              setTextInput('');
            }
          }}
          style={{ display: 'flex', gap: 8, maxWidth: 540, width: '100%', marginTop: 24 }}
        >
          <input
            type="text"
            placeholder="Type your response here if microphone is noisy..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            style={{ flex: 1, padding: '10px 14px', fontSize: 13 }}
          />
          <button type="submit" className="btn-secondary" style={{ padding: '0 18px' }} disabled={!textInput.trim()}>
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
