import React, { useEffect, useState } from 'react';

interface Avatar3DProps {
  isSpeaking: boolean;
  avatarState?: 'idle' | 'speaking' | 'celebrating' | 'correcting' | 'sleepy' | 'wave' | 'listening' | 'user_speaking' | 'thinking' | 'interrupted' | 'paused';
  onClick?: () => void;
}

export const Avatar3D: React.FC<Avatar3DProps> = ({
  isSpeaking,
  avatarState = 'idle',
  onClick,
}) => {
  const [pulseFrame, setPulseFrame] = useState(0);
  const [headTilt, setHeadTilt] = useState(0);

  // Dynamic animation frame timer for vivid expressive robot motion
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseFrame((prev) => (prev + 1) % 12);
      setHeadTilt(Math.sin(Date.now() / 300) * 4);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Compute dynamic glow color based on human speech state
  const getGlowColor = () => {
    switch (avatarState) {
      case 'speaking':
        return 'rgba(6, 182, 212, 0.75)';
      case 'listening':
      case 'user_speaking':
        return 'rgba(16, 185, 129, 0.85)';
      case 'celebrating':
        return 'rgba(236, 72, 153, 0.9)';
      case 'correcting':
        return 'rgba(245, 158, 11, 0.85)';
      case 'interrupted':
        return 'rgba(249, 115, 22, 0.9)';
      case 'sleepy':
        return 'rgba(139, 92, 246, 0.8)';
      case 'thinking':
        return 'rgba(245, 158, 11, 0.75)';
      default:
        return 'rgba(99, 102, 241, 0.4)';
    }
  };

  // Full-body reactive expressions based on human interaction
  const getTransformStyle = () => {
    const bob = Math.sin(pulseFrame * 0.8) * 6;

    if (avatarState === 'celebrating') {
      // Energetic victory jump & dance
      const danceY = -16 + Math.sin(pulseFrame * 1.5) * 12;
      const danceRot = Math.sin(pulseFrame * 1.2) * 6;
      return `scale(1.1) translateY(${danceY}px) rotate(${danceRot}deg)`;
    }

    if (avatarState === 'correcting') {
      // Attentive forward lean & caring head tilt
      return `scale(1.03) translateY(${bob - 4}px) rotate(-4deg)`;
    }

    if (avatarState === 'sleepy') {
      // Relaxed downward posture
      return `scale(0.95) translateY(10px) rotate(5deg)`;
    }

    if (avatarState === 'listening') {
      // Leaning forward eagerly listening to user
      const listenPulse = 1 + (pulseFrame % 2 === 0 ? 0.03 : 0);
      return `scale(${listenPulse}) translateY(${bob - 6}px) rotate(${headTilt * 0.4}deg)`;
    }

    if (isSpeaking || avatarState === 'speaking') {
      // Continuous expressive talk bounce & head tilt
      const talkY = pulseFrame % 2 === 0 ? -10 : -2;
      const talkRot = Math.sin(pulseFrame * 0.6) * 3;
      return `scale(${1.02 + (pulseFrame % 2) * 0.03}) translateY(${talkY}px) rotate(${talkRot}deg)`;
    }

    // Natural idle float
    return `scale(1) translateY(${bob}px) rotate(${headTilt * 0.3}deg)`;
  };

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
      }}
    >
      {/* Outer Glowing Energy Aura */}
      <div
        style={{
          position: 'absolute',
          width: '88%',
          height: '88%',
          borderRadius: '50%',
          background:
            avatarState === 'celebrating'
              ? 'radial-gradient(circle, rgba(236, 72, 153, 0.55) 0%, rgba(245, 158, 11, 0.35) 50%, transparent 75%)'
              : avatarState === 'correcting'
              ? 'radial-gradient(circle, rgba(245, 158, 11, 0.5) 0%, rgba(239, 68, 68, 0.25) 50%, transparent 75%)'
              : avatarState === 'sleepy'
              ? 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, rgba(59, 130, 246, 0.25) 50%, transparent 75%)'
              : avatarState === 'listening'
              ? 'radial-gradient(circle, rgba(16, 185, 129, 0.5) 0%, rgba(6, 182, 212, 0.3) 50%, transparent 75%)'
              : 'radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(139, 92, 246, 0.25) 50%, transparent 75%)',
          filter: 'blur(30px)',
          zIndex: 0,
          transition: 'all 0.35s ease',
        }}
      />

      {/* Main Expressive 3D Robot Mascot (Reference Character) */}
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
          transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease',
          transform: getTransformStyle(),
          filter: `drop-shadow(0 18px 40px ${getGlowColor()})`,
        }}
      >
        <img
          src="/assets/flunexa-mascot.png"
          alt="Flunexa Talk Expressive 3D Mascot"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
};
