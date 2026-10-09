import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { READ_AND_SPEAK_PROMPTS, ReadAndSpeakPrompt } from '../../data/testsData';
import { TeacherAvatar } from '../avatar/TeacherAvatar';
import { AudioWaveform } from '../common/AudioWaveform';
import { speechService } from '../../services/speechService';
import { AIService } from '../../services/aiService';
import { soundService } from '../../services/soundService';
import {
  Clock,
  Eye,
  EyeOff,
  Mic,
  CheckCircle2,
  Sparkles,
  BarChart2,
} from 'lucide-react';

export const ReadAndSpeakTest: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user, selectedAvatar, openAnalysisModal } = useApp();

  const [promptIdx, setPromptIdx] = useState(0);
  const prompt: ReadAndSpeakPrompt = READ_AND_SPEAK_PROMPTS[promptIdx];

  const [phase, setPhase] = useState<'prep' | 'speaking' | 'evaluated'>('prep');
  const [prepSecondsLeft, setPrepSecondsLeft] = useState(prompt.prepTimeSeconds);
  const [speakSecondsLeft, setSpeakSecondsLeft] = useState(prompt.speakTimeSeconds);
  const [transcript, setTranscript] = useState('');
  const [isPrepRunning, setIsPrepRunning] = useState(false);
  const [micVolume, setMicVolume] = useState(0);

  // Prep Countdown
  useEffect(() => {
    let timer: any;
    if (isPrepRunning && phase === 'prep' && prepSecondsLeft > 0) {
      timer = setInterval(() => {
        setPrepSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (prepSecondsLeft === 0 && phase === 'prep' && isPrepRunning) {
      soundService.playCompleteDing();
      startSpeakingPhase();
    }
    return () => clearInterval(timer);
  }, [isPrepRunning, phase, prepSecondsLeft]);

  // Speaking Countdown
  useEffect(() => {
    let timer: any;
    if (phase === 'speaking' && speakSecondsLeft > 0) {
      timer = setInterval(() => {
        setSpeakSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (speakSecondsLeft === 0 && phase === 'speaking') {
      finishAndScore();
    }
    return () => clearInterval(timer);
  }, [phase, speakSecondsLeft]);

  const startPrep = () => {
    setIsPrepRunning(true);
    soundService.playTick();
  };

  const startSpeakingPhase = async () => {
    setPhase('speaking');
    soundService.playTick();
    await speechService.initMicrophoneWaveform((vol) => setMicVolume(vol));

    speechService.startListening({
      onInterimResult: (t) => setTranscript(t),
      onFinalResult: (t) => setTranscript(t),
    });
  };

  const finishAndScore = () => {
    setPhase('evaluated');
    speechService.stopListening();
    soundService.playCompleteDing();

    const analysis = AIService.generateSessionAnalysis(
      transcript || 'In the passage, bees communicate using a dance to show flowers distance and sun angle.',
      `Read and Speak: ${prompt.title}`,
      prompt.speakTimeSeconds - speakSecondsLeft || 60,
      user.nativeLanguage
    );
    openAnalysisModal(analysis);
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '16px 20px 80px' }}>
      <button onClick={onBack} className="btn-secondary" style={{ marginBottom: 16, padding: '8px 16px', fontSize: 13 }}>
        ← Back to Test Center
      </button>

      <div className="glass-card" style={{ padding: 24, borderRadius: 'var(--radius-xl)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span className="badge badge-primary">TEST 3</span>
          <span className="badge badge-warning">Memory & Spontaneous Recall</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Read and Speak Test</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Read the passage during the <strong>{prompt.prepTimeSeconds}s preparation timer</strong>. Once the timer ends, the text is hidden and you summarize the concepts in your own words.
        </p>
      </div>

      {/* Preparation State: Passage is visible */}
      {phase === 'prep' && (
        <div className="glass-card" style={{ padding: 28, borderRadius: 'var(--radius-xl)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Eye size={18} color="var(--color-primary-light)" />
              <strong style={{ fontSize: 16 }}>{prompt.title}</strong>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 22,
                fontWeight: 900,
                color: prepSecondsLeft <= 5 ? '#ef4444' : '#f59e0b',
                padding: '4px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
              }}
            >
              ⏳ {prepSecondsLeft}s
            </div>
          </div>

          <div
            style={{
              padding: 20,
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 16,
              lineHeight: 1.7,
              borderLeft: '4px solid var(--color-primary)',
            }}
          >
            {prompt.passage}
          </div>

          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Read carefully and identify 3 key facts.
            </span>

            {!isPrepRunning ? (
              <button onClick={startPrep} className="btn-primary" style={{ padding: '12px 28px', fontSize: 14 }}>
                <Clock size={16} />
                <span>Start Preparation Timer</span>
              </button>
            ) : (
              <button onClick={startSpeakingPhase} className="btn-secondary" style={{ padding: '12px 24px', fontSize: 13 }}>
                <span>Ready Now! Hide Text & Speak</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Speaking State: Text is HIDDEN */}
      {phase === 'speaking' && (
        <div
          className="glass-card"
          style={{
            padding: 30,
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <EyeOff size={18} color="#ef4444" />
            <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 14 }}>
              Passage Hidden — Speak Your Explanation
            </span>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 32,
              fontWeight: 900,
              color: 'var(--text-main)',
              marginBottom: 16,
            }}
          >
            ⏱️ {speakSecondsLeft}s remaining
          </div>

          <TeacherAvatar avatarId={selectedAvatar} state="listening" size="lg" />

          <div style={{ width: '100%', maxWidth: 360, margin: '16px 0' }}>
            <AudioWaveform isActive={true} volume={micVolume} color="#10b981" />
          </div>

          {/* Guiding memory prompts */}
          <div
            style={{
              textAlign: 'left',
              width: '100%',
              maxWidth: 580,
              padding: 16,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              marginBottom: 18,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary-light)', marginBottom: 6 }}>
              GUIDING QUESTIONS:
            </div>
            <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {prompt.guidingQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>

          {transcript && (
            <div
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px dashed #10b981',
                fontSize: 14,
                maxWidth: 600,
                marginBottom: 18,
              }}
            >
              🎙️ "{transcript}"
            </div>
          )}

          <button onClick={finishAndScore} className="btn-primary" style={{ padding: '12px 32px', fontSize: 15, background: 'var(--gradient-emerald)' }}>
            <CheckCircle2 size={18} />
            <span>Finish & View Complete Report</span>
          </button>
        </div>
      )}
    </div>
  );
};
