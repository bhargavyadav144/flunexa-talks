import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PICTURE_DESCRIPTION_PROMPTS, PictureDescriptionPrompt } from '../../data/testsData';
import { TeacherAvatar } from '../avatar/TeacherAvatar';
import { AudioWaveform } from '../common/AudioWaveform';
import { speechService } from '../../services/speechService';
import { AIService } from '../../services/aiService';
import { soundService } from '../../services/soundService';
import {
  Image,
  Clock,
  Mic,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const PictureDescriptionTest: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user, selectedAvatar, openAnalysisModal } = useApp();

  const [promptIdx, setPromptIdx] = useState(0);
  const prompt: PictureDescriptionPrompt = PICTURE_DESCRIPTION_PROMPTS[promptIdx];

  const [prepSeconds, setPrepSeconds] = useState(prompt.prepTimeSeconds);
  const [isPrepping, setIsPrepping] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingSeconds, setSpeakingSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [micVolume, setMicVolume] = useState(0);

  // Prep timer
  useEffect(() => {
    let t: any;
    if (isPrepping && prepSeconds > 0) {
      t = setInterval(() => setPrepSeconds((p) => p - 1), 1000);
    } else if (isPrepping && prepSeconds === 0) {
      startSpeaking();
    }
    return () => clearInterval(t);
  }, [isPrepping, prepSeconds]);

  // Speaking timer
  useEffect(() => {
    let t: any;
    if (isSpeaking) {
      t = setInterval(() => setSpeakingSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(t);
  }, [isSpeaking]);

  const startSpeaking = async () => {
    setIsPrepping(false);
    setIsSpeaking(true);
    soundService.playTick();

    await speechService.initMicrophoneWaveform((vol) => setMicVolume(vol));

    speechService.startListening({
      onInterimResult: (trans) => setTranscript(trans),
      onFinalResult: (trans) => setTranscript(trans),
    });
  };

  const handleFinish = () => {
    setIsSpeaking(false);
    speechService.stopListening();
    soundService.playCompleteDing();

    const analysis = AIService.generateSessionAnalysis(
      transcript || 'In this picture I see people working enthusiastically in a modern collaborative setting with notebooks and sticky notes.',
      `Picture Description: ${prompt.title}`,
      Math.max(60, speakingSeconds),
      user.nativeLanguage
    );
    openAnalysisModal(analysis);
  };

  // Render SVG illustration for scene
  const renderSceneIllustration = () => {
    if (prompt.svgScene === 'cafe') {
      return (
        <svg viewBox="0 0 600 320" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-lg)' }}>
          <rect width="600" height="320" fill="#1e293b" />
          {/* Cafe window overlooking skyline */}
          <rect x="50" y="30" width="220" height="180" rx="8" fill="#0f172a" stroke="#334155" strokeWidth="3" />
          <line x1="160" y1="30" x2="160" y2="210" stroke="#334155" strokeWidth="3" />
          <circle cx="90" cy="70" r="16" fill="#f59e0b" opacity="0.6" />
          {/* Plants */}
          <ellipse cx="60" cy="230" rx="20" ry="14" fill="#065f46" />
          <ellipse cx="80" cy="220" rx="14" ry="22" fill="#10b981" />
          {/* Wooden tables & chairs */}
          <rect x="240" y="190" width="180" height="18" rx="6" fill="#78350f" />
          <rect x="310" y="208" width="16" height="80" fill="#451a03" />
          {/* Laptop on table with coffee mug */}
          <polygon points="270,188 320,188 330,165 280,165" fill="#94a3b8" />
          <rect x="350" y="172" width="14" height="18" rx="3" fill="#ffffff" />
          <ellipse cx="357" cy="172" rx="7" ry="2" fill="#92400e" />
          {/* Barista Counter */}
          <rect x="440" y="130" width="140" height="160" fill="#334155" />
          <text x="465" y="160" fill="#f8fafc" fontSize="14" fontWeight="bold">COFFEE BAR</text>
          {/* Steam puffs */}
          <circle cx="357" cy="155" r="3" fill="#ffffff" opacity="0.4" />
          <circle cx="360" cy="145" r="4" fill="#ffffff" opacity="0.3" />
        </svg>
      );
    }

    if (prompt.svgScene === 'workplace') {
      return (
        <svg viewBox="0 0 600 320" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-lg)' }}>
          <rect width="600" height="320" fill="#0f172a" />
          {/* Glass Whiteboard */}
          <rect x="120" y="40" width="360" height="200" rx="10" fill="rgba(99, 102, 241, 0.15)" stroke="#6366f1" strokeWidth="3" />
          {/* Sticky Notes */}
          <rect x="150" y="60" width="40" height="40" fill="#fef08a" />
          <rect x="210" y="70" width="40" height="40" fill="#fda4af" />
          <rect x="270" y="60" width="40" height="40" fill="#93c5fd" />
          <rect x="340" y="80" width="40" height="40" fill="#a7f3d0" />
          {/* Flowchart lines */}
          <line x1="170" y1="120" x2="290" y2="150" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" />
          <rect x="290" y="140" width="70" height="30" rx="4" fill="#475569" />
          <text x="305" y="160" fill="#ffffff" fontSize="10">API Core</text>
          {/* Floor & avatars silhouettes */}
          <ellipse cx="200" cy="270" rx="24" ry="30" fill="#64748b" />
          <circle cx="200" cy="225" r="14" fill="#cbd5e1" />
          <ellipse cx="400" cy="270" rx="24" ry="30" fill="#64748b" />
          <circle cx="400" cy="225" r="14" fill="#cbd5e1" />
        </svg>
      );
    }

    // Mountain Trek Sunset
    return (
      <svg viewBox="0 0 600 320" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-lg)' }}>
        {/* Gradient sky */}
        <defs>
          <linearGradient id="sunset" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="85%" stopColor="#1e1b4b" />
          </linearGradient>
        </defs>
        <rect width="600" height="320" fill="url(#sunset)" />
        {/* Sun */}
        <circle cx="300" cy="160" r="45" fill="#fef08a" opacity="0.9" />
        {/* Mountains layers */}
        <polygon points="-50,320 180,140 380,320" fill="#312e81" opacity="0.8" />
        <polygon points="120,320 400,110 650,320" fill="#1e1b4b" />
        <polygon points="260,320 490,190 620,320" fill="#0f172a" />
        {/* Hikers atop ridge */}
        <ellipse cx="488" cy="184" rx="4" ry="7" fill="#ffffff" />
        <circle cx="488" cy="173" r="3.5" fill="#ffffff" />
        <rect x="483" y="177" width="4" height="6" fill="#f59e0b" />
      </svg>
    );
  };

  return (
    <div style={{ maxWidth: 940, margin: '0 auto', padding: '16px 20px 80px' }}>
      <button onClick={onBack} className="btn-secondary" style={{ marginBottom: 16, padding: '8px 16px', fontSize: 13 }}>
        ← Back to Test Center
      </button>

      <div className="glass-card" style={{ padding: 24, borderRadius: 'var(--radius-xl)', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="badge badge-primary">TEST 4</span>
            <span className="badge badge-success">{prompt.category}</span>
          </div>
          {isPrepping && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: '#f59e0b', fontWeight: 800 }}>
              ⏳ Prep: {prepSeconds}s
            </div>
          )}
          {isSpeaking && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: '#10b981', fontWeight: 800 }}>
              🎙️ Speaking: {speakingSeconds}s
            </div>
          )}
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Picture Description Test</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Observe the scene carefully. Describe what is happening, the mood, specific elements, and what could occur next.
        </p>
      </div>

      {/* Picture Canvas Visual */}
      <div
        className="glass-card"
        style={{
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          marginBottom: 20,
          maxHeight: 340,
          border: '2px solid var(--border-glass)',
        }}
      >
        {renderSceneIllustration()}
      </div>

      {/* Vocabulary hints & description cues */}
      <div
        className="glass-card"
        style={{
          padding: 20,
          borderRadius: 'var(--radius-xl)',
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary-light)', marginBottom: 6 }}>
          RECOMMENDED VOCABULARY TO INTEGRATE:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {prompt.vocabularyToUse.map((v) => (
            <span key={v} className="badge badge-primary" style={{ fontSize: 12 }}>
              {v}
            </span>
          ))}
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          <strong>Think about:</strong> {prompt.sceneDescription}
        </div>
      </div>

      {/* Live Speaking / Audio Tray */}
      <div
        className="glass-card"
        style={{
          padding: 26,
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <TeacherAvatar avatarId={selectedAvatar} state={isSpeaking ? 'listening' : 'idle'} size="lg" />

        <div style={{ width: '100%', maxWidth: 360, margin: '14px 0' }}>
          <AudioWaveform isActive={isSpeaking} volume={micVolume} color="#10b981" />
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
              marginBottom: 16,
            }}
          >
            🎙️ "{transcript}"
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          {isPrepping ? (
            <button onClick={startSpeaking} className="btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>
              <Mic size={18} />
              <span>Skip Prep & Speak Now</span>
            </button>
          ) : isSpeaking ? (
            <button onClick={handleFinish} className="btn-primary" style={{ padding: '12px 30px', fontSize: 15, background: 'var(--gradient-emerald)' }}>
              <CheckCircle2 size={18} />
              <span>Finish & Analyze Description</span>
            </button>
          ) : (
            <button onClick={startSpeaking} className="btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>
              <Mic size={18} />
              <span>Record Description</span>
            </button>
          )}

          <button
            onClick={() => {
              setPromptIdx((p) => (p + 1) % PICTURE_DESCRIPTION_PROMPTS.length);
              setPrepSeconds(30);
              setIsPrepping(true);
              setIsSpeaking(false);
              setTranscript('');
            }}
            className="btn-secondary"
            style={{ padding: '12px 18px' }}
          >
            Next Picture
          </button>
        </div>
      </div>
    </div>
  );
};
