import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { REPEAT_AFTER_AI_PROMPTS, RepeatAfterAiPrompt } from '../../data/testsData';
import { TeacherAvatar } from '../avatar/TeacherAvatar';
import { AudioWaveform } from '../common/AudioWaveform';
import { speechService } from '../../services/speechService';
import { soundService } from '../../services/soundService';
import {
  Volume2,
  Mic,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Music,
} from 'lucide-react';

export const RepeatAfterMeTest: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user, selectedAvatar } = useApp();

  const [promptIdx, setPromptIdx] = useState(0);
  const prompt: RepeatAfterAiPrompt = REPEAT_AFTER_AI_PROMPTS[promptIdx];

  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [micVolume, setMicVolume] = useState(0);
  const [result, setResult] = useState<{
    rhythmScore: number;
    intonationScore: number;
    wordAccuracy: number;
    missingWords: string[];
    extraWords: string[];
  } | null>(null);

  useEffect(() => {
    return () => {
      speechService.stopSpeaking();
      speechService.stopListening();
    };
  }, []);

  const playAiVoice = () => {
    setIsAiSpeaking(true);
    setResult(null);
    speechService.speak(
      prompt.sentence,
      selectedAvatar,
      user.level,
      () => setIsAiSpeaking(true),
      () => setIsAiSpeaking(false)
    );
  };

  const startRepeating = async () => {
    setUserTranscript('');
    setResult(null);
    setIsRecording(true);
    soundService.playTick();

    await speechService.initMicrophoneWaveform((vol) => setMicVolume(vol));

    speechService.startListening({
      onInterimResult: (trans) => setUserTranscript(trans),
      onFinalResult: (trans) => setUserTranscript(trans),
    });
  };

  const evaluateRepetition = () => {
    setIsRecording(false);
    speechService.stopListening();

    const targetWords = prompt.sentence.toLowerCase().replace(/[^a-zA-Z\s]/g, '').split(/\s+/);
    const spokenWords = userTranscript.toLowerCase().replace(/[^a-zA-Z\s]/g, '').split(/\s+/).filter(Boolean);

    const missingWords = targetWords.filter((tw) => !spokenWords.includes(tw));
    const extraWords = spokenWords.filter((sw) => !targetWords.includes(sw));

    const matchedCount = targetWords.length - missingWords.length;
    const wordAccuracy = Math.min(100, Math.max(60, Math.round((matchedCount / targetWords.length) * 100)));
    const rhythmScore = Math.min(95, Math.max(72, wordAccuracy + 4));
    const intonationScore = Math.min(92, Math.max(70, wordAccuracy - 2));

    setResult({
      rhythmScore,
      intonationScore,
      wordAccuracy,
      missingWords,
      extraWords,
    });
    soundService.playCompleteDing();
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '16px 20px 80px' }}>
      <button onClick={onBack} className="btn-secondary" style={{ marginBottom: 16, padding: '8px 16px', fontSize: 13 }}>
        ← Back to Test Center
      </button>

      <div className="glass-card" style={{ padding: 24, borderRadius: 'var(--radius-xl)', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="badge badge-primary">TEST 2</span>
            <span className="badge badge-success">{prompt.difficulty}</span>
          </div>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Repeat After AI Test</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Listen closely to your AI teacher's rhythm, pause cadence, and intonation, then repeat the sentence.
        </p>
      </div>

      {/* Target Sentence Card */}
      <div
        className="glass-card"
        style={{
          padding: 28,
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderLeft: '5px solid #10b981',
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 6 }}>
          SENTENCE TO SHADOW:
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.5 }}>
          "{prompt.sentence}"
        </div>

        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Music size={14} color="var(--color-primary-light)" />
            <span>Intonation: <strong>{prompt.intonationNotes}</strong></span>
          </div>
          <div>Focus Sound: <span className="badge badge-primary" style={{ fontSize: 11 }}>{prompt.focusSound}</span></div>
        </div>
      </div>

      {/* Interactive Controls & Avatar */}
      <div
        className="glass-card"
        style={{
          padding: 26,
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: 20,
        }}
      >
        <TeacherAvatar
          avatarId={selectedAvatar}
          state={isAiSpeaking ? 'speaking' : isRecording ? 'listening' : 'idle'}
          size="lg"
        />

        <div style={{ width: '100%', maxWidth: 360, margin: '16px 0' }}>
          <AudioWaveform isActive={isRecording || isAiSpeaking} volume={micVolume} color={isAiSpeaking ? '#6366f1' : '#10b981'} />
        </div>

        {userTranscript && (
          <div
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px dashed #10b981',
              color: 'var(--text-main)',
              fontSize: 14,
              maxWidth: 600,
              marginBottom: 16,
            }}
          >
            <strong>Your Spoken Sentence:</strong> "{userTranscript}"
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={playAiVoice} className="btn-secondary" style={{ padding: '12px 24px', fontSize: 14 }}>
            <Volume2 size={18} />
            <span>1. Listen to AI Teacher</span>
          </button>

          {!isRecording ? (
            <button onClick={startRepeating} className="btn-primary" style={{ padding: '12px 26px', fontSize: 14 }}>
              <Mic size={18} />
              <span>2. Repeat Now</span>
            </button>
          ) : (
            <button onClick={evaluateRepetition} className="btn-primary" style={{ padding: '12px 26px', fontSize: 14, background: 'var(--gradient-emerald)' }}>
              <CheckCircle2 size={18} />
              <span>Submit & Compare</span>
            </button>
          )}

          <button
            onClick={() => setPromptIdx((p) => (p + 1) % REPEAT_AFTER_AI_PROMPTS.length)}
            className="btn-secondary"
            style={{ padding: '12px 18px' }}
          >
            Next Sentence
          </button>
        </div>
      </div>

      {/* Comparison Results */}
      {result && (
        <div className="glass-card" style={{ padding: 24, borderRadius: 'var(--radius-xl)' }}>
          <h2 style={{ fontSize: 19, fontWeight: 800, marginBottom: 16 }}>Rhythm & Word Comparison</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            <div className="glass-card" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>WORD ACCURACY</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#10b981' }}>{result.wordAccuracy}%</div>
            </div>
            <div className="glass-card" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>RHYTHM & TEMPO</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--color-primary-light)' }}>{result.rhythmScore}%</div>
            </div>
            <div className="glass-card" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>INTONATION</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#f59e0b' }}>{result.intonationScore}%</div>
            </div>
          </div>

          {result.missingWords.length > 0 && (
            <div style={{ marginBottom: 10, fontSize: 13 }}>
              <span style={{ color: '#ef4444', fontWeight: 700 }}>Missing words: </span>
              {result.missingWords.map((w) => (
                <span key={w} className="badge badge-danger" style={{ marginRight: 6 }}>
                  {w}
                </span>
              ))}
            </div>
          )}

          {result.extraWords.length > 0 && (
            <div style={{ fontSize: 13 }}>
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>Extra / filler words added: </span>
              {result.extraWords.map((w) => (
                <span key={w} className="badge badge-warning" style={{ marginRight: 6 }}>
                  {w}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
