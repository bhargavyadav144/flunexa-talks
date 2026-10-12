import React, { useEffect, useState, useRef, useMemo } from 'react';
import { AvatarState, NexaEmotion } from '../../types';

export interface Avatar3DProps {
  isSpeaking: boolean;
  avatarState?: AvatarState;
  emotion?: NexaEmotion;
  mouthVolume?: number; // 0 to 1, live audio-driven
  onClick?: () => void;
}

export const Avatar3D: React.FC<Avatar3DProps> = ({
  isSpeaking,
  avatarState = 'idle',
  emotion,
  mouthVolume = 0,
  onClick,
}) => {
  // Living animation state clocks
  const [pulseTick, setPulseTick] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [gazeShift, setGazeShift] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [antennaGlow, setAntennaGlow] = useState(false);

  const blinkTimerRef = useRef<any>(null);
  const saccadeTimerRef = useRef<any>(null);

  // High-frequency smooth animation tick for organic living motion (~60fps)
  useEffect(() => {
    let animId: number;
    let start = performance.now();

    const loop = (time: number) => {
      const elapsed = time - start;
      setPulseTick(elapsed / 1000); // Time in seconds
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Natural Human-Like Eye Blinking Controller (Randomized 3.5s - 5.5s with occasional double-blinks)
  useEffect(() => {
    const triggerBlink = () => {
      // Pause blinks during interrupted/surprised or sleepy states
      if (avatarState === 'interrupted' || avatarState === 'sleepy') {
        scheduleNextBlink();
        return;
      }

      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);

        // 25% chance of an authentic living double-blink
        if (Math.random() < 0.25) {
          setTimeout(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 110);
          }, 120);
        }
      }, 130);

      scheduleNextBlink();
    };

    const scheduleNextBlink = () => {
      const delay = 3200 + Math.random() * 2400;
      blinkTimerRef.current = setTimeout(triggerBlink, delay);
    };

    scheduleNextBlink();
    return () => clearTimeout(blinkTimerRef.current);
  }, [avatarState]);

  // Micro-Saccade Living Gaze Controller: periodic micro gaze shifts so Nexa doesn't stare blankly
  useEffect(() => {
    const triggerSaccade = () => {
      if (avatarState === 'thinking') {
        // Look upward and to the right when thinking
        setGazeShift({ x: 5, y: -4 });
      } else if (avatarState === 'listening' || avatarState === 'user_speaking') {
        // Direct focused eye contact with user
        setGazeShift({ x: 0, y: 0 });
      } else if (avatarState === 'correcting') {
        // Attentive focus slightly lowered
        setGazeShift({ x: -1, y: 1 });
      } else {
        // Subtle living wandering gaze within ±3px
        const rx = (Math.random() - 0.5) * 4;
        const ry = (Math.random() - 0.5) * 3;
        setGazeShift({ x: rx, y: ry });
      }
      scheduleNextSaccade();
    };

    const scheduleNextSaccade = () => {
      const delay = 1800 + Math.random() * 2200;
      saccadeTimerRef.current = setTimeout(triggerSaccade, delay);
    };

    scheduleNextSaccade();
    return () => clearTimeout(saccadeTimerRef.current);
  }, [avatarState]);

  // Periodic subtle antenna flash
  useEffect(() => {
    const interval = setInterval(() => {
      setAntennaGlow(true);
      setTimeout(() => setAntennaGlow(false), 400);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Resolved Emotion: derive effective emotion from explicit prop or active state
  const effectiveEmotion: NexaEmotion = useMemo(() => {
    if (emotion) return emotion;
    switch (avatarState) {
      case 'celebrating': return 'celebrating';
      case 'correcting': return 'correcting';
      case 'thinking': return 'thinking';
      case 'listening':
      case 'user_speaking': return 'listening';
      case 'sleepy': return 'sleepy';
      case 'interrupted': return 'surprised';
      case 'wave': return 'happy';
      case 'speaking': return isSpeaking ? 'explaining' : 'neutral';
      default: return 'neutral';
    }
  }, [emotion, avatarState, isSpeaking]);

  // Dynamic Aura Energy Glow
  const auraColor = useMemo(() => {
    switch (effectiveEmotion) {
      case 'celebrating':
        return 'radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, rgba(245, 158, 11, 0.35) 50%, transparent 75%)';
      case 'correcting':
        return 'radial-gradient(circle, rgba(245, 158, 11, 0.55) 0%, rgba(239, 68, 68, 0.25) 50%, transparent 75%)';
      case 'listening':
        return 'radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, rgba(6, 182, 212, 0.3) 50%, transparent 75%)';
      case 'thinking':
      case 'curious':
        return 'radial-gradient(circle, rgba(245, 158, 11, 0.5) 0%, rgba(99, 102, 241, 0.25) 50%, transparent 75%)';
      case 'empathetic':
        return 'radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, rgba(59, 130, 246, 0.3) 50%, transparent 75%)';
      case 'sleepy':
        return 'radial-gradient(circle, rgba(139, 92, 246, 0.45) 0%, rgba(30, 27, 75, 0.3) 50%, transparent 75%)';
      case 'happy':
      case 'playful':
      case 'encouraging':
        return 'radial-gradient(circle, rgba(6, 182, 212, 0.55) 0%, rgba(236, 72, 153, 0.25) 50%, transparent 75%)';
      default:
        return 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(99, 102, 241, 0.2) 50%, transparent 75%)';
    }
  }, [effectiveEmotion]);

  // Full-body Kinematic Living Motion Controller
  const getBodyMotionTransform = () => {
    const t = pulseTick;
    // Harmonic organic breathing (subtle chest rise & fall)
    const breathY = Math.sin(t * 1.8) * 4;
    const breathScale = 1 + Math.sin(t * 1.8) * 0.012;

    switch (avatarState) {
      case 'wave': {
        const waveY = -14 + Math.sin(t * 6) * 8;
        const waveRot = Math.sin(t * 5) * 6;
        return `scale(1.05) translateY(${waveY}px) rotate(${waveRot}deg)`;
      }
      case 'celebrating': {
        // High-energy celebratory victory bounce
        const danceY = -18 + Math.sin(t * 5.5) * 12;
        const danceRot = Math.sin(t * 4) * 6;
        return `scale(1.08) translateY(${danceY}px) rotate(${danceRot}deg)`;
      }
      case 'interrupted': {
        // Sudden upright alert snap
        return `scale(1.03) translateY(-6px) rotate(1.5deg)`;
      }
      case 'thinking': {
        // Inquisitive pensive head tilt (+6 deg) with slow float
        const thinkFloat = Math.sin(t * 1.2) * 5;
        return `scale(1.02) translateY(${thinkFloat - 6}px) rotate(6deg)`;
      }
      case 'correcting': {
        // Supportive caring forward lean (-4 deg head tilt)
        return `scale(1.03) translateY(${breathY - 4}px) rotate(-4deg)`;
      }
      case 'listening':
      case 'user_speaking': {
        // Leaning in attentively towards user
        const nodMotion = avatarState === 'user_speaking' ? Math.sin(t * 3.5) * 3 : 0;
        return `scale(1.04) translateY(${breathY - 6 + nodMotion}px) rotate(2deg)`;
      }
      case 'sleepy': {
        return `scale(0.96) translateY(12px) rotate(4deg)`;
      }
      case 'speaking': {
        // Real-time voice bounce scaled to live mouthVolume
        const bounceAmount = mouthVolume > 0.05 ? mouthVolume * 10 : 3;
        const talkY = Math.sin(t * 8) * bounceAmount;
        const talkRot = Math.sin(t * 3) * 2.5;
        const talkScale = 1.02 + mouthVolume * 0.04;
        return `scale(${talkScale}) translateY(${breathY - 4 - talkY}px) rotate(${talkRot}deg)`;
      }
      default: {
        // Natural living idle float with subtle breathing
        const idleRot = Math.sin(t * 1.1) * 2.5;
        return `scale(${breathScale}) translateY(${breathY}px) rotate(${idleRot}deg)`;
      }
    }
  };

  // Viseme mouth geometry based on live audio mouthVolume
  const renderLipSyncMouth = () => {
    // When NOT speaking or volume is silent, return relaxed smiling rest curve
    if (!isSpeaking || mouthVolume < 0.08) {
      return (
        <path
          d="M 88 84 Q 100 90 112 84"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3.5"
          strokeLinecap="round"
          style={{ transition: 'all 0.08s ease-out' }}
        />
      );
    }

    // Viseme AA: Wide open vowel (high volume)
    if (mouthVolume > 0.6) {
      return (
        <g style={{ transition: 'all 0.05s ease-out' }}>
          <path
            d="M 82 81 Q 100 68 118 81 Q 100 102 82 81 Z"
            fill="#0891b2"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Glowing oral aperture */}
          <ellipse cx="100" cy="85" rx="10" ry="6" fill="#06b6d4" />
          <ellipse cx="100" cy="89" rx="6" ry="3" fill="#f472b6" opacity="0.85" />
        </g>
      );
    }

    // Viseme OH: Rounded vowel (medium volume)
    if (mouthVolume > 0.35) {
      return (
        <ellipse
          cx="100"
          cy="85"
          rx="11"
          ry="8"
          fill="#0891b2"
          stroke="#38bdf8"
          strokeWidth="3"
          style={{ transition: 'all 0.05s ease-out' }}
        />
      );
    }

    // Viseme EE: Spoken consonant / smile slit (low-medium volume)
    return (
      <path
        d="M 84 83 Q 100 78 116 83 Q 100 92 84 83 Z"
        fill="#0e7490"
        stroke="#38bdf8"
        strokeWidth="3"
        style={{ transition: 'all 0.05s ease-out' }}
      />
    );
  };

  // Render LED Eyes matching emotion & blink
  const renderEyes = () => {
    // Blinking: eyelids closed
    if (isBlinking) {
      return (
        <g stroke="#38bdf8" strokeWidth="4" strokeLinecap="round">
          <line x1="44" y1="48" x2="76" y2="48" />
          <line x1="124" y1="48" x2="156" y2="48" />
        </g>
      );
    }

    // Celebrating: 5-pointed glowing stars!
    if (effectiveEmotion === 'celebrating') {
      return (
        <g fill="#38bdf8" filter="url(#cyanGlow)">
          {/* Left Star Eye */}
          <path d="M 60 34 L 64 44 L 74 44 L 66 50 L 69 60 L 60 54 L 51 60 L 54 50 L 46 44 L 56 44 Z" />
          {/* Right Star Eye */}
          <path d="M 140 34 L 144 44 L 154 44 L 146 50 L 149 60 L 140 54 L 131 60 L 134 50 L 126 44 L 136 44 Z" />
        </g>
      );
    }

    // Happy / Encouraging: Cheerful curved arcs (^ ^)
    if (effectiveEmotion === 'happy' || effectiveEmotion === 'encouraging') {
      return (
        <g stroke="#38bdf8" strokeWidth="5.5" strokeLinecap="round" fill="none" filter="url(#cyanGlow)">
          <path d="M 44 54 Q 60 32 76 54" />
          <path d="M 124 54 Q 140 32 156 54" />
        </g>
      );
    }

    // Playful: Wink right eye, happy left eye (^ •)
    if (effectiveEmotion === 'playful') {
      return (
        <g filter="url(#cyanGlow)">
          <path d="M 44 54 Q 60 32 76 54" stroke="#38bdf8" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          <line x1="124" y1="48" x2="156" y2="48" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    }

    // Sleepy: Relaxed closed slits (- -)
    if (effectiveEmotion === 'sleepy') {
      return (
        <g stroke="#818cf8" strokeWidth="4" strokeLinecap="round">
          <line x1="44" y1="50" x2="76" y2="50" />
          <line x1="124" y1="50" x2="156" y2="50" />
        </g>
      );
    }

    // Surprised / Interrupted: Wide circular rings (O O)
    if (effectiveEmotion === 'surprised') {
      return (
        <g stroke="#38bdf8" strokeWidth="4.5" fill="none" filter="url(#cyanGlow)">
          <circle cx="60" cy="48" r="17" />
          <circle cx="140" cy="48" r="17" />
          <circle cx="60" cy="48" r="7" fill="#38bdf8" />
          <circle cx="140" cy="48" r="7" fill="#38bdf8" />
        </g>
      );
    }

    // Thinking / Curious: Gaze shifted up-right
    if (effectiveEmotion === 'thinking' || effectiveEmotion === 'curious') {
      return (
        <g filter="url(#cyanGlow)">
          <ellipse cx={60 + gazeShift.x} cy={48 + gazeShift.y} rx="13" ry="15" fill="#38bdf8" />
          <ellipse cx={140 + gazeShift.x} cy={48 + gazeShift.y} rx="13" ry="15" fill="#38bdf8" />
          <circle cx={58 + gazeShift.x} cy={45 + gazeShift.y} r="4" fill="#ffffff" />
          <circle cx={138 + gazeShift.x} cy={45 + gazeShift.y} r="4" fill="#ffffff" />
        </g>
      );
    }

    // Empathetic: Downward caring tilt
    if (effectiveEmotion === 'empathetic') {
      return (
        <g stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" fill="none" filter="url(#cyanGlow)">
          <path d="M 44 44 Q 60 52 76 46" />
          <path d="M 124 46 Q 140 52 156 44" />
        </g>
      );
    }

    // Correcting: Focused attentive oval eyes with caring brow
    if (effectiveEmotion === 'correcting') {
      return (
        <g filter="url(#cyanGlow)">
          <ellipse cx="60" cy="48" rx="14" ry="16" fill="#38bdf8" />
          <ellipse cx="140" cy="48" rx="14" ry="16" fill="#38bdf8" />
          <circle cx="58" cy="45" r="4.5" fill="#ffffff" />
          <circle cx="138" cy="45" r="4.5" fill="#ffffff" />
        </g>
      );
    }

    // Standard Attentive Living Eyes (Listening / Idle / Explaining)
    const eyeRadius = effectiveEmotion === 'listening' ? 17 : 15;
    return (
      <g filter="url(#cyanGlow)">
        <ellipse cx={60 + gazeShift.x} cy={48 + gazeShift.y} rx={eyeRadius - 2} ry={eyeRadius} fill="#38bdf8" />
        <ellipse cx={140 + gazeShift.x} cy={48 + gazeShift.y} rx={eyeRadius - 2} ry={eyeRadius} fill="#38bdf8" />
        <circle cx={58 + gazeShift.x} cy={45 + gazeShift.y} r="4.5" fill="#ffffff" />
        <circle cx={138 + gazeShift.x} cy={45 + gazeShift.y} r="4.5" fill="#ffffff" />
      </g>
    );
  };

  // Render LED Eyebrows
  const renderEyebrows = () => {
    if (effectiveEmotion === 'thinking') {
      // Raised right brow, curious left brow
      return (
        <g stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M 46 28 Q 60 26 74 30" />
          <path d="M 126 24 Q 140 18 154 22" />
        </g>
      );
    }
    if (effectiveEmotion === 'correcting') {
      // Warm caring tilted eyebrows
      return (
        <g stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M 46 26 Q 60 22 74 27" />
          <path d="M 126 27 Q 140 22 154 26" />
        </g>
      );
    }
    if (effectiveEmotion === 'surprised') {
      // High raised brows
      return (
        <g stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d="M 46 22 Q 60 16 74 22" />
          <path d="M 126 22 Q 140 16 154 22" />
        </g>
      );
    }
    // Neutral subtle brow
    return (
      <g stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8">
        <path d="M 46 26 Q 60 23 74 26" />
        <path d="M 126 26 Q 140 23 154 26" />
      </g>
    );
  };

  // Pink LED Blushing Cheeks
  const showBlush =
    effectiveEmotion === 'celebrating' ||
    effectiveEmotion === 'happy' ||
    effectiveEmotion === 'encouraging' ||
    effectiveEmotion === 'playful';

  return (
    <div
      onClick={onClick}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none',
        cursor: onClick ? 'pointer' : 'default',
        perspective: 1200,
      }}
    >
      {/* 1. Dynamic Energy Aura */}
      <div
        style={{
          position: 'absolute',
          width: '92%',
          height: '92%',
          borderRadius: '50%',
          background: auraColor,
          filter: 'blur(36px)',
          zIndex: 0,
          transition: 'background 0.5s ease',
          pointerEvents: 'none',
        }}
      />

      {/* 2. Kinematic Robot Assembly Container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          maxHeight: 380,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          transition: 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: getBodyMotionTransform(),
        }}
      >
        {/* The 3D Robot Mascot (Base Model) */}
        <img
          src="/assets/flunexa-mascot.png"
          alt="Flunexa Talk Living AI Character"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            filter: `drop-shadow(0 16px 36px ${
              effectiveEmotion === 'celebrating'
                ? 'rgba(236, 72, 153, 0.6)'
                : effectiveEmotion === 'listening'
                ? 'rgba(16, 185, 129, 0.6)'
                : 'rgba(6, 182, 212, 0.5)'
            })`,
          }}
        />

        {/* 3. High-Tech Dynamic Visor Screen Rig */}
        <div
          style={{
            position: 'absolute',
            top: '12.2%',
            left: '25.1%',
            width: '52.9%',
            height: '20.3%',
            borderRadius: '45% 45% 48% 48% / 50% 50% 45% 45%',
            background: 'radial-gradient(ellipse at 50% 35%, rgba(20, 28, 48, 0.99) 0%, rgba(9, 13, 23, 0.99) 70%, #060913 100%)',
            boxShadow:
              'inset 0 2px 6px rgba(255,255,255,0.18), inset 0 -6px 14px rgba(0,0,0,0.85), 0 0 24px rgba(6, 182, 212, 0.25)',
            transform: 'rotate(-2deg)',
            overflow: 'hidden',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          {/* Subtle Curved Glass Specular Highlight */}
          <div
            style={{
              position: 'absolute',
              top: '4%',
              left: '12%',
              width: '76%',
              height: '18%',
              borderRadius: '50%',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, transparent 100%)',
              filter: 'blur(1px)',
              pointerEvents: 'none',
            }}
          />

          {/* SVG Electronic Face Visor Engine */}
          <svg
            viewBox="0 0 200 120"
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
            }}
          >
            <defs>
              {/* Cyan Neon Glow Filter for Eyes */}
              <filter id="cyanGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Pink Neon Glow Filter for Cheeks */}
              <filter id="pinkGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* A. Eyebrows */}
            {renderEyebrows()}

            {/* B. LED Eyes */}
            {renderEyes()}

            {/* C. Lip-Syncing Audio-Driven Mouth */}
            {renderLipSyncMouth()}

            {/* D. Glowing Blush Cheeks */}
            {showBlush && (
              <g stroke="#f472b6" strokeWidth="2.5" strokeLinecap="round" filter="url(#pinkGlow)">
                {/* Left Cheek */}
                <line x1="26" y1="64" x2="22" y2="72" />
                <line x1="32" y1="64" x2="28" y2="72" />
                <line x1="38" y1="64" x2="34" y2="72" />

                {/* Right Cheek */}
                <line x1="162" y1="64" x2="166" y2="72" />
                <line x1="168" y1="64" x2="172" y2="72" />
                <line x1="174" y1="64" x2="178" y2="72" />
              </g>
            )}
          </svg>
        </div>

        {/* 4. Antenna Glow Pulse Effect */}
        {antennaGlow && (
          <div
            style={{
              position: 'absolute',
              top: '2%',
              left: '68%',
              width: 18,
              height: 18,
              borderRadius: '50%',
              backgroundColor: '#38bdf8',
              boxShadow: '0 0 20px #38bdf8, 0 0 40px #818cf8',
              filter: 'blur(3px)',
              zIndex: 6,
              pointerEvents: 'none',
              animation: 'pulse 0.4s ease-out',
            }}
          />
        )}
      </div>
    </div>
  );
};
