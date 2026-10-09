import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { READ_ALOUD_PROMPTS, ReadAloudPrompt } from '../../data/testsData';
import { TeacherAvatar } from '../avatar/TeacherAvatar';
import { AudioWaveform } from '../common/AudioWaveform';
import { speechService } from '../../services/speechService';
import { TTSService } from '../../services/ttsService';
import { soundService } from '../../services/soundService';
import {
  Mic,
  Volume2,
  CheckCircle2,
  Play,
  VolumeX,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface EvaluatedWord {
  text: string;
  cleanText: string;
  status: 'correct' | 'mispronounced' | 'skipped';
  spokenAs?: string;
}

export const ReadAloudTest: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user, selectedAvatar, unlockAchievement } = useApp();

  const [promptIdx, setPromptIdx] = useState(0);
  const prompt: ReadAloudPrompt = READ_ALOUD_PROMPTS[promptIdx];

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [micVolume, setMicVolume] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const [testResult, setTestResult] = useState<{
    pronunciationScore: number;
    wpm: number;
    accuracy: number;
    evaluatedWords: EvaluatedWord[];
    mispronouncedList: { word: string; spokenAs: string }[];
    skippedList: string[];
    feedback: string;
  } | null>(null);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      speechService.stopSpeaking();
      speechService.stopListening();
      TTSService.stop();
    };
  }, []);

  const startReading = async () => {
    setTranscript('');
    setTestResult(null);
    setSeconds(0);
    setIsRecording(true);
    soundService.playTick();

    await speechService.initMicrophoneWaveform((vol) => setMicVolume(vol));

    speechService.startListening({
      onInterimResult: (trans) => {
        setTranscript(trans);
      },
      onFinalResult: (trans) => {
        setTranscript(trans);
      },
    });
  };

  // High Precision Word-by-Word Alignment & Passage Highlighting Engine
  const stopAndEvaluate = () => {
    setIsRecording(false);
    speechService.stopListening();

    const targetTokens = prompt.text.split(/\s+/).filter(Boolean);
    const spokenTokens = transcript.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);

    let spokenIdx = 0;
    let correctCount = 0;
    const evaluatedWords: EvaluatedWord[] = [];
    const mispronouncedList: { word: string; spokenAs: string }[] = [];
    const skippedList: string[] = [];

    targetTokens.forEach((word) => {
      const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!clean) {
        evaluatedWords.push({ text: word, cleanText: clean, status: 'correct' });
        return;
      }

      // Lookahead window in spoken tokens (up to 3 words ahead)
      let matchPos = -1;
      for (let i = spokenIdx; i < Math.min(spokenTokens.length, spokenIdx + 4); i++) {
        if (spokenTokens[i] === clean || spokenTokens[i].includes(clean) || clean.includes(spokenTokens[i])) {
          matchPos = i;
          break;
        }
      }

      if (matchPos !== -1) {
        if (matchPos > spokenIdx) {
          const sub = spokenTokens[spokenIdx];
          evaluatedWords.push({ text: word, cleanText: clean, status: 'mispronounced', spokenAs: sub });
          mispronouncedList.push({ word, spokenAs: sub });
        } else {
          evaluatedWords.push({ text: word, cleanText: clean, status: 'correct' });
          correctCount++;
        }
        spokenIdx = matchPos + 1;
      } else {
        if (spokenIdx < spokenTokens.length) {
          const sub = spokenTokens[spokenIdx];
          evaluatedWords.push({ text: word, cleanText: clean, status: 'mispronounced', spokenAs: sub });
          mispronouncedList.push({ word, spokenAs: sub });
          spokenIdx++;
        } else {
          evaluatedWords.push({ text: word, cleanText: clean, status: 'skipped' });
          skippedList.push(word);
        }
      }
    });

    const totalTargetCount = targetTokens.length;
    const accuracy = totalTargetCount > 0 ? Math.round((correctCount / totalTargetCount) * 100) : 0;
    const durationMin = Math.max(0.1, seconds / 60);
    const spokenCount = spokenTokens.length;
    const wpm = spokenCount > 0 ? Math.round(spokenCount / durationMin) : 0;

    // Real Pronunciation Score calculation
    let pronunciationScore = 0;
    if (accuracy > 0) {
      const paceBonus = wpm >= 80 && wpm <= 160 ? 10 : 0;
      pronunciationScore = Math.min(98, Math.max(30, Math.round(accuracy * 0.88 + paceBonus)));
    }

    let feedback = '';
    if (mispronouncedList.length === 0 && skippedList.length === 0) {
      feedback = 'Flawless pronunciation! Every single word matched the target passage with crisp articulatory precision.';
    } else {
      const notes: string[] = [];
      if (mispronouncedList.length > 0) {
        notes.push(`Needs refinement on mispronounced word(s): ${mispronouncedList.map((m) => `"${m.word}" (you said "${m.spokenAs}")`).slice(0, 3).join(', ')}.`);
      }
      if (skippedList.length > 0) {
        notes.push(`Omitted/skipped word(s): ${skippedList.slice(0, 3).map((w) => `"${w}"`).join(', ')}.`);
      }
      feedback = notes.join(' ');
    }

    setTestResult({
      pronunciationScore,
      wpm,
      accuracy,
      evaluatedWords,
      mispronouncedList,
      skippedList,
      feedback,
    });

    if (pronunciationScore >= 90) {
      unlockAchievement('ach-9');
    }
    soundService.playAchievementFanfare();
  };

  const playCorrectPassageAudio = () => {
    TTSService.speak(prompt.text, 'English', 'FEMALE');
  };

  const playSingleWordAudio = (word: string) => {
    const clean = word.replace(/[^a-zA-Z]/g, '');
    if (clean) {
      TTSService.speak(clean, 'English', 'FEMALE');
    }
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '16px 20px 80px' }}>
      <button onClick={onBack} className="btn-secondary" style={{ marginBottom: 16, padding: '8px 16px', fontSize: 13 }}>
        ← Back to Test Center
      </button>

      {/* Test Header */}
      <div className="glass-card" style={{ padding: 24, borderRadius: 'var(--radius-xl)', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="badge badge-primary">READ ALOUD TEST</span>
            <span className="badge badge-success">{prompt.difficulty}</span>
          </div>
          <button onClick={playCorrectPassageAudio} className="btn-secondary" style={{ fontSize: 13, gap: 6 }}>
            <Volume2 size={16} color="#38bdf8" />
            <span>Listen Correct Passage Audio 🔊</span>
          </button>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Read Aloud Test</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Read the paragraph aloud clearly into your microphone. We evaluate your exact spoken words against the reference passage.
        </p>
      </div>

      {/* Target Passage Display with Real-Time / Post-Test Highlighting */}
      <div
        className="glass-card"
        style={{
          padding: 28,
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderLeft: '5px solid var(--color-primary)',
          fontSize: 18,
          lineHeight: 1.8,
          fontWeight: 500,
          marginBottom: 20,
        }}
      >
        {!testResult ? (
          <div>{prompt.text}</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 6px' }}>
            {testResult.evaluatedWords.map((item, idx) => {
              const isCorrect = item.status === 'correct';
              const isMispronounced = item.status === 'mispronounced';
              const isSkipped = item.status === 'skipped';

              return (
                <span
                  key={idx}
                  onClick={() => playSingleWordAudio(item.text)}
                  title={
                    isMispronounced
                      ? `Mispronounced: You said "${item.spokenAs}". Click to hear correct pronunciation.`
                      : isSkipped
                      ? `Skipped word. Click to hear correct pronunciation.`
                      : `Click to hear correct pronunciation of "${item.text}"`
                  }
                  style={{
                    cursor: 'pointer',
                    padding: '2px 6px',
                    borderRadius: 6,
                    fontWeight: 700,
                    transition: 'all 0.2s ease',
                    backgroundColor: isCorrect
                      ? 'rgba(16, 185, 129, 0.2)'
                      : isMispronounced
                      ? 'rgba(239, 68, 68, 0.25)'
                      : 'rgba(245, 158, 11, 0.25)',
                    color: isCorrect
                      ? '#34d399'
                      : isMispronounced
                      ? '#f87171'
                      : '#fbbf24',
                    border: isCorrect
                      ? '1px solid rgba(16, 185, 129, 0.4)'
                      : isMispronounced
                      ? '1px solid rgba(239, 68, 68, 0.5)'
                      : '1px solid rgba(245, 158, 11, 0.5)',
                  }}
                >
                  {item.text}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Color Legend when result is displayed */}
      {testResult && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20, fontSize: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: 'rgba(16, 185, 129, 0.8)' }} />
            <span>🟢 Correct Words ({testResult.evaluatedWords.filter((w) => w.status === 'correct').length})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: 'rgba(239, 68, 68, 0.8)' }} />
            <span>🔴 Mispronounced ({testResult.mispronouncedList.length})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: 'rgba(245, 158, 11, 0.8)' }} />
            <span>🟡 Skipped ({testResult.skippedList.length})</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>💡 Click any word to hear correct audio pronunciation</div>
        </div>
      )}

      {/* Waveform & Recording Controls */}
      <div
        className="glass-card"
        style={{
          padding: 24,
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: 20,
        }}
      >
        <TeacherAvatar avatarId={selectedAvatar} state={isRecording ? 'listening' : 'idle'} size="lg" />

        <div style={{ width: '100%', maxWidth: 360, margin: '14px 0' }}>
          <AudioWaveform isActive={isRecording} volume={micVolume} color="#10b981" />
        </div>

        {transcript && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px dashed #10b981',
              color: 'var(--text-main)',
              fontSize: 14,
              maxWidth: 640,
              marginBottom: 16,
              wordBreak: 'break-word',
            }}
          >
            <strong>Your Spoken Transcript:</strong> "{transcript}"
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {!isRecording ? (
            <button
              onClick={startReading}
              className="btn-primary"
              style={{ padding: '12px 30px', fontSize: 15 }}
            >
              <Mic size={18} />
              <span>Start Reading Aloud</span>
            </button>
          ) : (
            <button
              onClick={stopAndEvaluate}
              className="btn-primary"
              style={{ padding: '12px 30px', fontSize: 15, background: 'var(--gradient-emerald)' }}
            >
              <CheckCircle2 size={18} />
              <span>Submit & Evaluate ({seconds}s)</span>
            </button>
          )}

          <button
            onClick={() => {
              setTestResult(null);
              setTranscript('');
              setPromptIdx((p) => (p + 1) % READ_ALOUD_PROMPTS.length);
            }}
            className="btn-secondary"
            style={{ padding: '12px 18px' }}
          >
            Next Passage
          </button>
        </div>
      </div>

      {/* Real Speaking Evaluation Scorecard */}
      {testResult && (
        <div className="glass-card" style={{ padding: 24, borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>Real Speaking Evaluation Scorecard</h2>
            <button onClick={playCorrectPassageAudio} className="btn-secondary" style={{ fontSize: 12, gap: 6 }}>
              <Play size={14} color="#34d399" />
              <span>Replay Model Correct Speech 🔊</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
            <div className="glass-card" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>PRONUNCIATION SCORE</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: testResult.pronunciationScore >= 80 ? '#10b981' : '#f59e0b' }}>
                {testResult.pronunciationScore} / 100
              </div>
            </div>

            <div className="glass-card" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>EXACT MATCH ACCURACY</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-primary-light)' }}>
                {testResult.accuracy}%
              </div>
            </div>

            <div className="glass-card" style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>SPEAKING PACE</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#f59e0b' }}>
                {testResult.wpm} WPM
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Target: {prompt.targetWpm} WPM</div>
            </div>
          </div>

          {/* Feedback & Detailed Mispronunciation List */}
          <div style={{ padding: 16, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-elevated)', marginBottom: 16 }}>
            <strong style={{ fontSize: 14, color: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} /> Detailed Pronunciation Feedback:
            </strong>
            <p style={{ fontSize: 13, color: 'var(--text-main)', marginTop: 6, lineHeight: 1.6 }}>
              {testResult.feedback}
            </p>
          </div>

          {/* Specific Mispronounced / Substituted Words Section */}
          {testResult.mispronouncedList.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#f87171', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={15} /> Mispronounced Words & Audio Corrections:
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {testResult.mispronouncedList.map((m, idx) => (
                  <button
                    key={idx}
                    onClick={() => playSingleWordAudio(m.word)}
                    className="btn-secondary"
                    style={{
                      fontSize: 12,
                      padding: '6px 12px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      borderColor: 'rgba(239, 68, 68, 0.4)',
                      color: '#f87171',
                      gap: 6,
                    }}
                    title="Click to hear correct audio pronunciation"
                  >
                    <span>"{m.word}" (you said "{m.spokenAs}")</span>
                    <Volume2 size={13} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Skipped Words Section */}
          {testResult.skippedList.length > 0 && (
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', marginBottom: 8 }}>
                Omitted / Skipped Words (Click to practice):
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {testResult.skippedList.map((w, idx) => (
                  <button
                    key={idx}
                    onClick={() => playSingleWordAudio(w)}
                    className="btn-secondary"
                    style={{
                      fontSize: 12,
                      padding: '6px 12px',
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      borderColor: 'rgba(245, 158, 11, 0.4)',
                      color: '#fbbf24',
                      gap: 6,
                    }}
                    title="Click to hear correct audio pronunciation"
                  >
                    <span>"{w}"</span>
                    <Volume2 size={13} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
