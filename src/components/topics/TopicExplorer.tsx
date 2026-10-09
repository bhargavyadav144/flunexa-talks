import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TOPICS_DATA, TOPIC_CATEGORIES } from '../../data/topicsData';
import { TopicItem } from '../../types';
import { TeacherAvatar } from '../avatar/TeacherAvatar';
import { AudioWaveform } from '../common/AudioWaveform';
import { speechService } from '../../services/speechService';
import { AIService } from '../../services/aiService';
import { soundService } from '../../services/soundService';
import { triggerConfetti } from '../common/ConfettiTrigger';
import {
  Compass,
  Clock,
  Play,
  RotateCcw,
  Sparkles,
  Filter,
  CheckCircle2,
  Mic,
  ArrowRight,
} from 'lucide-react';

export const TopicExplorer: React.FC = () => {
  const { user, selectedAvatar, openAnalysisModal } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTopic, setActiveTopic] = useState<TopicItem | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<number>(2);
  const [secondsLeft, setSecondsLeft] = useState<number>(120);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [micVolume, setMicVolume] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(false);

  // Filter topics by category and adapt to user level
  const filteredTopics = TOPICS_DATA.filter((t) => {
    if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;
    return true;
  });

  // Countdown timer
  React.useEffect(() => {
    let t: any;
    if (isSpeaking && secondsLeft > 0) {
      t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    } else if (isSpeaking && secondsLeft === 0) {
      handleTimeUp();
    }
    return () => clearInterval(t);
  }, [isSpeaking, secondsLeft]);

  React.useEffect(() => {
    return () => {
      speechService.stopSpeaking();
      speechService.stopListening();
    };
  }, []);

  const selectAndPrepareTopic = (topic: TopicItem) => {
    setActiveTopic(topic);
    setDurationMinutes(topic.recommendedDurationMinutes || 2);
    setSecondsLeft((topic.recommendedDurationMinutes || 2) * 60);
    setIsSpeaking(false);
    setIsDone(false);
    setTranscript('');
    soundService.playTick();
  };

  const startTopicTimer = async () => {
    setIsSpeaking(true);
    soundService.playTick();
    await speechService.initMicrophoneWaveform((vol) => setMicVolume(vol));

    speechService.startListening({
      onInterimResult: (trans) => setTranscript(trans),
      onFinalResult: (trans) => setTranscript(trans),
    });
  };

  const handleTimeUp = () => {
    setIsSpeaking(false);
    setIsDone(true);
    speechService.stopListening();
    triggerConfetti(true);
  };

  const finishAndScore = () => {
    if (!activeTopic) return;
    const elapsed = durationMinutes * 60 - secondsLeft;
    const analysis = AIService.generateSessionAnalysis(
      transcript || `Speaking about ${activeTopic.title} gave me clarity on my personal perspective.`,
      activeTopic.title,
      Math.max(60, elapsed),
      user.nativeLanguage
    );
    openAnalysisModal(analysis);
  };

  const formatMinSec = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 20px 80px' }}>
      {/* Active Speaking Modal / Overlay when a topic is selected */}
      {activeTopic ? (
        <div>
          <button
            onClick={() => {
              setIsSpeaking(false);
              speechService.stopListening();
              setActiveTopic(null);
            }}
            className="btn-secondary"
            style={{ marginBottom: 16, padding: '8px 16px', fontSize: 13 }}
          >
            ← Back to Topic Library
          </button>

          <div
            className="glass-card"
            style={{
              padding: 30,
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span className="badge badge-primary">{activeTopic.category}</span>
              <span className="badge badge-success">Level {activeTopic.level}</span>
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>{activeTopic.title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 640, marginBottom: 20 }}>
              {activeTopic.prompt}
            </p>

            {/* Duration Selector Tabs: 2 MIN, 3 MIN, 5 MIN, 10 MIN */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8 }}>
                CHOOSE SPEAKING DURATION:
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                {[2, 3, 5, 10].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      if (!isSpeaking) {
                        setDurationMinutes(m);
                        setSecondsLeft(m * 60);
                      }
                    }}
                    className="glass-card"
                    style={{
                      padding: '8px 18px',
                      fontWeight: 800,
                      fontSize: 13,
                      borderRadius: 'var(--radius-md)',
                      border: durationMinutes === m ? '2px solid var(--color-primary)' : '1px solid var(--border-glass)',
                      backgroundColor: durationMinutes === m ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-card)',
                      color: durationMinutes === m ? 'var(--color-primary-light)' : 'var(--text-main)',
                    }}
                  >
                    {m} MIN
                  </button>
                ))}
              </div>
            </div>

            {/* Countdown Clock */}
            <div
              style={{
                padding: '16px 36px',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '2px solid var(--border-glass)',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>SPEAKING TIMER</div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 52,
                  fontWeight: 900,
                  color: secondsLeft <= 15 ? '#ef4444' : 'var(--text-main)',
                }}
              >
                {formatMinSec(secondsLeft)}
              </div>
              <AudioWaveform isActive={isSpeaking} volume={micVolume} color="#10b981" />
            </div>

            <div style={{ margin: '10px 0 20px' }}>
              <TeacherAvatar avatarId={selectedAvatar} state={isSpeaking ? 'listening' : 'idle'} size="lg" />
            </div>

            {/* Key sub-questions */}
            <div
              style={{
                width: '100%',
                maxWidth: 600,
                textAlign: 'left',
                padding: 16,
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary-light)', marginBottom: 6 }}>
                POINTS TO COVER IN YOUR SPEECH:
              </div>
              <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {activeTopic.questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>

            {transcript && (
              <div
                style={{
                  maxWidth: 600,
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px dashed #10b981',
                  fontSize: 13,
                  marginBottom: 20,
                }}
              >
                🎙️ "{transcript}"
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 12 }}>
              {!isSpeaking && !isDone ? (
                <button onClick={startTopicTimer} className="btn-primary" style={{ padding: '14px 36px', fontSize: 16 }}>
                  <Play size={18} fill="#ffffff" />
                  <span>Begin Speaking Timer</span>
                </button>
              ) : isSpeaking ? (
                <button onClick={handleTimeUp} className="btn-secondary" style={{ padding: '14px 28px', fontSize: 14 }}>
                  <span>Finish Early</span>
                </button>
              ) : (
                <button
                  onClick={finishAndScore}
                  className="btn-primary"
                  style={{ padding: '14px 36px', fontSize: 15, background: 'var(--gradient-emerald)' }}
                >
                  <CheckCircle2 size={18} />
                  <span>Time's up! Great job 🎉 (Analyze Speech)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Library View */
        <div>
          <div
            className="glass-card"
            style={{
              padding: '28px 32px',
              borderRadius: 'var(--radius-xl)',
              marginBottom: 24,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="badge badge-primary">TOPIC HUB</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Curated Speaking Prompts</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900 }}>Spontaneous Topic Generator</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 6, maxWidth: 640 }}>
              Browse categorized prompts or filter by your target focus. Choose a 2, 3, 5, or 10-minute timer to practice without notes.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
            {TOPIC_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="glass-card"
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: 13,
                  border: selectedCategory === cat ? '2px solid var(--color-primary)' : '1px solid var(--border-glass)',
                  backgroundColor: selectedCategory === cat ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-card)',
                  color: selectedCategory === cat ? 'var(--color-primary-light)' : 'var(--text-muted)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Topics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => selectAndPrepareTopic(topic)}
                className="glass-card glass-card-interactive"
                style={{
                  padding: 22,
                  borderRadius: 'var(--radius-xl)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span className="badge badge-primary">{topic.category}</span>
                    <span className="badge badge-success">Level {topic.level}</span>
                  </div>

                  <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{topic.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
                    {topic.prompt}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                    {topic.vocabularyHints.slice(0, 3).map((vh) => (
                      <span key={vh} style={{ fontSize: 11, color: 'var(--color-primary-light)', backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: 4 }}>
                        #{vh}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-glass)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 600 }}>
                    ⏱️ Rec. {topic.recommendedDurationMinutes} Mins
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Start Speaking <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
