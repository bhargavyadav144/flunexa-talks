import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Mistake, PronunciationWord, SessionAnalysis } from '../../types';
import { TeacherAvatar } from '../avatar/TeacherAvatar';
import { speechService } from '../../services/speechService';
import { soundService } from '../../services/soundService';
import {
  X,
  Volume2,
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Award,
} from 'lucide-react';

export const SpeakingResultModal: React.FC = () => {
  const { recentAnalysis, isResultModalOpen, closeAnalysisModal, setCurrentView, user, selectedAvatar } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'mistakes' | 'pronunciation' | 'vocabulary'>('overview');
  const [testingWord, setTestingWord] = useState<string | null>(null);

  if (!isResultModalOpen || !recentAnalysis) return null;

  const analysis: SessionAnalysis = recentAnalysis;

  const handleDoneAndExit = () => {
    closeAnalysisModal();
    setCurrentView('dashboard');
  };

  const playWordAudio = (word: string) => {
    speechService.speak(word, selectedAvatar, user.level);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)',
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
          maxWidth: 820,
          backgroundColor: 'var(--bg-card-solid)',
          borderRadius: 'var(--radius-xl)',
          padding: 28,
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-glass)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleDoneAndExit}
          className="btn-icon"
          style={{ position: 'absolute', top: 20, right: 20 }}
          title="Close and return to Dashboard"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <TeacherAvatar avatarId={selectedAvatar} state="celebrating" size="md" showBadge={false} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-success">SESSION COMPLETE</span>
              <span className="badge badge-warning">+{analysis.xpEarned} XP</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>Your Speaking Result</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              {analysis.topicTitle} • {Math.round(analysis.durationSeconds / 60)} min session
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            borderBottom: '1px solid var(--border-glass)',
            paddingBottom: 12,
            marginBottom: 20,
          }}
        >
          {[
            { id: 'overview', label: '📊 Scorecard & Accuracy' },
            { id: 'mistakes', label: `❌ Mistake Analysis (${analysis.mistakes.length})` },
            { id: 'pronunciation', label: '🎙️ Pronunciation & Sounds' },
            { id: 'vocabulary', label: '✨ Vocabulary Upgrades' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="glass-card"
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 800 : 500,
                color: activeTab === tab.id ? 'var(--color-primary-light)' : 'var(--text-muted)',
                backgroundColor: activeTab === tab.id ? 'rgba(99, 102, 241, 0.16)' : 'transparent',
                border: activeTab === tab.id ? '1px solid var(--color-primary)' : '1px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & SCORECARD */}
        {activeTab === 'overview' && (
          <div>
            {/* Overall Giant Score Card */}
            <div
              className="glass-card"
              style={{
                padding: '22px 28px',
                borderRadius: 'var(--radius-xl)',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(16, 185, 129, 0.12) 100%)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                marginBottom: 20,
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary-light)' }}>
                  OVERALL PROFICIENCY ACCURACY INDEX
                </div>
                <div style={{ fontSize: 48, fontWeight: 900, color: 'var(--text-main)', lineHeight: 1.1 }}>
                  {analysis.overallScore}% <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>Accuracy</span>
                </div>
                <div style={{ fontSize: 13, color: '#10b981', fontWeight: 600, marginTop: 4 }}>
                  Calculated from real speech timing & transcript!
                </div>
              </div>

              {/* Native Language Encouragement Box */}
              <div
                style={{
                  maxWidth: 380,
                  padding: 14,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-glass)',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary-light)', marginBottom: 4 }}>
                  Coach Summary ({user.nativeLanguage}):
                </div>
                <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--text-main)' }}>
                  {analysis.nativeSummary}
                </p>
              </div>
            </div>

            {/* 6 Key Linguistic Scores */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Grammar Accuracy', score: analysis.scores.grammar, color: '#6366f1' },
                { label: 'Fluency', score: analysis.scores.fluency, color: '#10b981' },
                { label: 'Vocabulary Variety', score: analysis.scores.vocabulary, color: '#06b6d4' },
                { label: 'Pronunciation Clarity', score: analysis.scores.pronunciation, color: '#ec4899' },
                { label: 'Confidence', score: analysis.scores.confidence, color: '#f59e0b' },
                { label: 'Sentence Structure', score: analysis.scores.sentenceFormation, color: '#8b5cf6' },
              ].map((item) => (
                <div key={item.label} className="glass-card" style={{ padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{item.label}</span>
                    <strong style={{ color: item.color }}>{item.score}%</strong>
                  </div>
                  <div style={{ width: '100%', height: 6, backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${item.score}%`, height: '100%', backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Filler Word Reduction Card */}
            <div
              className="glass-card"
              style={{
                padding: 18,
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-surface-elevated)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span className="badge badge-warning" style={{ marginBottom: 4 }}>FILLER WORDS DETECTED</span>
                <div style={{ fontSize: 15, fontWeight: 700 }}>
                  Detected: <strong>{analysis.fillerWords.count}</strong> filler words (um, uh, like)
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {analysis.fillerWords.count === 0 ? (
                    <strong style={{ color: '#10b981' }}>🎉 100% Clean speech with zero filler words!</strong>
                  ) : (
                    <span>Filler count tracked accurately from your session audio.</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                {analysis.fillerWords.words.map((fw) => (
                  <span key={fw.word} className="badge badge-warning">
                    "{fw.word}": {fw.count}x
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MISTAKE ANALYSIS & NATIVE EXPLANATION */}
        {activeTab === 'mistakes' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Real Mistake Analysis</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                Corrections retain natural English structures with explicit rationales in <strong>{user.nativeLanguage}</strong>.
              </p>
            </div>

            {analysis.mistakes.length === 0 ? (
              <div
                className="glass-card"
                style={{
                  padding: 32,
                  borderRadius: 'var(--radius-lg)',
                  textAlign: 'center',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: 20, fontWeight: 900, color: '#10b981' }}>100% Flawless Grammar!</h3>
                <p style={{ color: 'var(--text-main)', fontSize: 14, maxWidth: 500, margin: '8px auto 0' }}>
                  No grammatical or tense mistakes were detected in your spoken transcript. You spoke clear and accurate English!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {analysis.mistakes.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="glass-card"
                    style={{
                      padding: 18,
                      borderRadius: 'var(--radius-lg)',
                      borderLeft: `5px solid ${m.severity === 'critical' ? '#ef4444' : m.severity === 'important' ? '#f59e0b' : '#3b82f6'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`badge ${m.severity === 'critical' ? 'badge-danger' : 'badge-warning'}`}>
                          {m.severity.toUpperCase()}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary-light)' }}>
                          Category: {m.category}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Mistake #{idx + 1}</span>
                    </div>

                    {/* Wrong vs Corrected */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10, margin: '10px 0' }}>
                      <div style={{ padding: 12, borderRadius: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: 14, fontWeight: 600 }}>
                        ❌ You said: "{m.original}"
                      </div>
                      <div style={{ padding: 12, borderRadius: 8, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: 14, fontWeight: 700 }}>
                        ✅ Better: "{m.corrected}"
                      </div>
                    </div>

                    {/* Native Language Rationale */}
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        backgroundColor: 'var(--bg-surface-elevated)',
                        fontSize: 13,
                        lineHeight: 1.5,
                        marginTop: 8,
                      }}
                    >
                      <strong style={{ color: 'var(--color-primary-light)' }}>Explanation ({user.nativeLanguage}): </strong>
                      <span>{m.nativeExplanation}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRONUNCIATION WORDS */}
        {activeTab === 'pronunciation' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Word-Level Pronunciation Analysis</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                Listen to the native pronunciation, verify syllable stress, and try saying it again.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {analysis.pronunciationWords.map((pw) => (
                <div
                  key={pw.word}
                  className="glass-card"
                  style={{
                    padding: 16,
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ fontSize: 18 }}>{pw.word}</strong>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
                        {pw.phonetic}
                      </span>
                      <span className={`badge ${pw.status === 'excellent' ? 'badge-success' : pw.status === 'good' ? 'badge-primary' : 'badge-warning'}`}>
                        Score: {pw.score}%
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      💡 {pw.tip}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => playWordAudio(pw.word)}
                      className="btn-secondary"
                      style={{ padding: '8px 14px', fontSize: 12 }}
                    >
                      <Volume2 size={15} />
                      <span>Listen 🔊</span>
                    </button>
                    <button
                      onClick={() => {
                        setTestingWord(pw.word);
                        soundService.playTick();
                      }}
                      className="btn-primary"
                      style={{ padding: '8px 14px', fontSize: 12 }}
                    >
                      <RotateCcw size={15} />
                      <span>Try Again 🔄</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: VOCABULARY UPGRADES */}
        {activeTab === 'vocabulary' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Expressive Vocabulary Recommendations</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                Replace basic repetitive phrases like "very good" with persuasive, professional alternatives.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              {analysis.vocabularySuggestions.map((vs, idx) => (
                <div key={idx} className="glass-card" style={{ padding: 18, borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Instead of saying: <strong style={{ color: '#ef4444' }}>"{vs.original}"</strong>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0' }}>
                    {vs.alternatives.map((alt) => (
                      <span key={alt} className="badge badge-success" style={{ fontSize: 13, padding: '6px 12px' }}>
                        ✦ {alt}
                      </span>
                    ))}
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    Context: {vs.context}
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>New Daily Words to Remember:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
              {analysis.newWords.map((nw) => (
                <div key={nw.word} style={{ padding: 12, backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 8 }}>
                  <strong style={{ color: 'var(--color-primary-light)', fontSize: 14 }}>{nw.word}</strong>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0' }}>{nw.definition}</div>
                  <div style={{ fontSize: 11, fontStyle: 'italic', color: 'var(--text-dim)' }}>"{nw.example}"</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Done CTA - Returns user to main Dashboard */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleDoneAndExit}
            className="btn-primary"
            style={{ padding: '12px 28px', fontSize: 14 }}
          >
            Done & Save to Progress 🚀
          </button>
        </div>
      </div>
    </div>
  );
};
