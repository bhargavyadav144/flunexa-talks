import React, { useEffect, useState } from 'react';
import { AvatarId, AvatarState } from '../../types';

interface TeacherAvatarProps {
  avatarId: AvatarId;
  state: AvatarState;
  mouthVolume?: number; // 0 to 1
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'fullscreen';
  showBadge?: boolean;
  funnyMood?: string; // e.g. "giggle", "wink", "starry", "confused", "robot_dance"
}

export const TeacherAvatar: React.FC<TeacherAvatarProps> = ({
  avatarId,
  state,
  mouthVolume = 0,
  size = 'lg',
  showBadge = true,
  funnyMood,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouthFrame, setMouthFrame] = useState(0);
  const [antennaPulse, setAntennaPulse] = useState(false);

  // Periodic natural eye blinking & antenna flashing
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setAntennaPulse(true);
      setTimeout(() => {
        setIsBlinking(false);
        setAntennaPulse(false);
      }, 160);
    }, 3800 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Mouth animation during speaking
  useEffect(() => {
    if (state === 'speaking') {
      const interval = setInterval(() => {
        setMouthFrame((prev) => (prev + 1) % 4);
      }, 110);
      return () => clearInterval(interval);
    } else {
      setMouthFrame(0);
    }
  }, [state]);

  // Dimension mapping
  const sizeMap = {
    sm: { width: 64, height: 64, radius: 12 },
    md: { width: 110, height: 110, radius: 20 },
    lg: { width: 170, height: 170, radius: 28 },
    xl: { width: 230, height: 230, radius: 36 },
    hero: { width: 320, height: 380, radius: 44 },
    fullscreen: { width: 420, height: 500, radius: 52 },
  };

  const dim = sizeMap[size];

  // Avatar persona details
  const AVATAR_PROFILES: Record<AvatarId, { name: string; title: string; skin: string; hair: string; shirt: string }> = {
    nexa: { name: 'Nexa', title: 'Funny AI Robot Tutor', skin: '#ffffff', hair: '#06b6d4', shirt: '#4f46e5' },
    alex: { name: 'Alex', title: 'Friendly Male Coach', skin: '#fcd34d', hair: '#374151', shirt: '#4f46e5' },
    mia: { name: 'Mia', title: 'Cheerful Female Tutor', skin: '#fed7aa', hair: '#b45309', shirt: '#ec4899' },
    aria: { name: 'Aria', title: 'Professional English Mentor', skin: '#fde68a', hair: '#1f2937', shirt: '#0284c7' },
    leo: { name: 'Leo', title: 'Casual Speaking Partner', skin: '#fbcfe8', hair: '#92400e', shirt: '#10b981' },
  };

  const profile = AVATAR_PROFILES[avatarId] || AVATAR_PROFILES.nexa;

  // Aura colors
  const getAuraColor = () => {
    switch (state) {
      case 'speaking':
        return 'rgba(6, 182, 212, 0.6)';
      case 'listening':
        return 'rgba(16, 185, 129, 0.65)';
      case 'thinking':
        return 'rgba(245, 158, 11, 0.6)';
      case 'celebrating':
        return 'rgba(236, 72, 153, 0.85)';
      case 'correcting':
        return 'rgba(245, 158, 11, 0.75)';
      case 'sleepy':
        return 'rgba(139, 92, 246, 0.7)';
      default:
        return 'rgba(99, 102, 241, 0.25)';
    }
  };

  // If Nexa (the cute neon 3D robot mascot)
  if (avatarId === 'nexa') {
    const isSpecialLarge = size === 'hero' || size === 'fullscreen' || size === 'xl';
    const bounceHeight = state === 'speaking' ? -8 : state === 'celebrating' ? -18 : state === 'correcting' ? -4 : 0;
    const currentScale = state === 'speaking' ? 1 + mouthVolume * 0.05 : state === 'celebrating' ? 1.08 : 1;

    // Animation class depending on dynamic reaction
    const animationClass =
      state === 'celebrating'
        ? 'avatar-celebrating'
        : state === 'correcting'
        ? 'avatar-correcting'
        : state === 'sleepy'
        ? 'avatar-sleepy'
        : state === 'listening'
        ? 'listening-pulse'
        : state === 'idle'
        ? 'avatar-float'
        : '';

    return (
      <div className="flex flex-col items-center select-none" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <div
          className={animationClass}
          style={{
            width: dim.width,
            height: isSpecialLarge ? dim.height : dim.height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            filter: `drop-shadow(0 14px 32px ${getAuraColor()})`,
            transition: 'transform 0.25s ease, filter 0.3s ease',
            transform: `translateY(${bounceHeight}px) scale(${currentScale})`,
          }}
        >
          {/* Neon Halo Background Ring */}
          <div
            style={{
              position: 'absolute',
              width: '90%',
              height: '90%',
              borderRadius: '50%',
              background:
                state === 'celebrating'
                  ? 'radial-gradient(circle, rgba(236, 72, 153, 0.45) 0%, rgba(245, 158, 11, 0.25) 50%, transparent 75%)'
                  : state === 'correcting'
                  ? 'radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, rgba(239, 68, 68, 0.2) 50%, transparent 75%)'
                  : state === 'sleepy'
                  ? 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 75%)'
                  : 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, rgba(139, 92, 246, 0.15) 50%, transparent 75%)',
              filter: 'blur(22px)',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />

          {/* Transparent 3D Mascot Image */}
          <img
            src="/assets/flunexa-mascot.png"
            alt="Flunexa Talk 3D Robot Mascot"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              position: 'relative',
              zIndex: 1,
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />

          {/* Funny Expression Bubble / Screen Mood Badge */}
          {state === 'speaking' && (
            <div
              style={{
                position: 'absolute',
                top: isSpecialLarge ? '12%' : '4%',
                right: isSpecialLarge ? '4%' : '-6%',
                zIndex: 10,
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                border: '2px solid #06b6d4',
                color: '#38bdf8',
                borderRadius: 'var(--radius-full)',
                padding: '4px 10px',
                fontSize: isSpecialLarge ? 16 : 12,
                fontWeight: 800,
                boxShadow: '0 4px 16px rgba(6, 182, 212, 0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                animation: 'floatGentle 2s infinite',
              }}
            >
              <span>🗣️</span>
              <span>{mouthFrame % 2 === 0 ? 'Beep!' : 'Talking~'}</span>
            </div>
          )}

          {state === 'celebrating' && (
            <div
              style={{
                position: 'absolute',
                top: isSpecialLarge ? '8%' : '4%',
                right: isSpecialLarge ? '0%' : '-4%',
                zIndex: 10,
                backgroundColor: '#ec4899',
                color: '#ffffff',
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                fontSize: isSpecialLarge ? 15 : 13,
                fontWeight: 900,
                boxShadow: '0 4px 22px rgba(236, 72, 153, 0.7)',
                animation: 'pulseGlow 1.2s infinite',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>🎉</span>
              <span>Bale Cheppavu! Perfect!</span>
            </div>
          )}

          {state === 'correcting' && (
            <div
              style={{
                position: 'absolute',
                top: isSpecialLarge ? '8%' : '4%',
                left: isSpecialLarge ? '0%' : '-4%',
                zIndex: 10,
                backgroundColor: '#f59e0b',
                color: '#0f172a',
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                fontSize: isSpecialLarge ? 15 : 13,
                fontWeight: 900,
                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>💡</span>
              <span>Arere! Ala kaadhu ila...</span>
            </div>
          )}

          {state === 'sleepy' && (
            <div
              style={{
                position: 'absolute',
                top: isSpecialLarge ? '8%' : '4%',
                right: isSpecialLarge ? '0%' : '-4%',
                zIndex: 10,
                backgroundColor: '#8b5cf6',
                color: '#ffffff',
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                fontSize: isSpecialLarge ? 15 : 13,
                fontWeight: 900,
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>😴</span>
              <span>Good Night! Sweet Dreams ✨</span>
            </div>
          )}

          {state === 'thinking' && (
            <div
              style={{
                position: 'absolute',
                top: '8%',
                left: '2%',
                zIndex: 10,
                backgroundColor: 'rgba(245, 158, 11, 0.95)',
                color: '#ffffff',
                borderRadius: 'var(--radius-full)',
                padding: '4px 12px',
                fontSize: 13,
                fontWeight: 800,
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.5)',
              }}
            >
              💡 Analyzing Circuits...
            </div>
          )}

          {/* Status Badge Icon Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: isSpecialLarge ? 14 : 4,
              right: isSpecialLarge ? 20 : 6,
              width: isSpecialLarge ? 38 : 28,
              height: isSpecialLarge ? 38 : 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isSpecialLarge ? 18 : 14,
              border: '2px solid #0f172a',
              backgroundColor:
                state === 'speaking'
                  ? '#06b6d4'
                  : state === 'listening'
                  ? '#10b981'
                  : state === 'thinking'
                  ? '#f59e0b'
                  : state === 'celebrating'
                  ? '#ec4899'
                  : state === 'correcting'
                  ? '#f59e0b'
                  : state === 'sleepy'
                  ? '#8b5cf6'
                  : '#64748b',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              zIndex: 5,
            }}
            title={`Status: ${state.toUpperCase()}`}
          >
            {state === 'speaking' && '🔵'}
            {state === 'listening' && '🟢'}
            {state === 'thinking' && '🟡'}
            {state === 'celebrating' && '🎉'}
            {state === 'correcting' && '💡'}
            {state === 'sleepy' && '🌙'}
            {state === 'idle' && '✨'}
            {state === 'paused' && '⏸'}
          </div>
        </div>

        {showBadge && (
          <div style={{ marginTop: 8, textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: isSpecialLarge ? 18 : 15, color: 'var(--text-main)' }}>
              {profile.name}
            </div>
            <div style={{ fontSize: isSpecialLarge ? 13 : 11, color: 'var(--color-primary-light)', fontWeight: 600 }}>
              {profile.title}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vector avatars fallback for Alex, Mia, Aria, Leo
  return (
    <div className="flex flex-col items-center select-none" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        className={`relative ${state === 'idle' ? 'avatar-float' : ''} ${state === 'listening' ? 'listening-pulse' : ''}`}
        style={{
          width: dim.width,
          height: dim.height,
          borderRadius: '50%',
          boxShadow: `0 8px 30px ${getAuraColor()}`,
          transition: 'all 0.35s ease',
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95))',
          padding: 4,
          position: 'relative',
        }}
      >
        <svg
          viewBox="0 0 200 200"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            overflow: 'hidden',
          }}
        >
          <circle cx="100" cy="100" r="98" fill="#1e293b" />
          <circle cx="100" cy="100" r="92" fill="#0f172a" />
          <path d="M 45 200 C 45 160, 68 152, 100 152 C 132 152, 155 160, 155 200 Z" fill={profile.shirt} />
          <rect x="88" y="132" width="24" height="24" rx="6" fill={profile.skin} />
          <circle cx="68" cy="104" r="8" fill={profile.skin} />
          <circle cx="132" cy="104" r="8" fill={profile.skin} />
          <ellipse cx="100" cy="102" rx="33" ry="38" fill={profile.skin} />
          <ellipse cx="76" cy="112" rx="6" ry="3.5" fill="rgba(244, 63, 94, 0.22)" />
          <ellipse cx="124" cy="112" rx="6" ry="3.5" fill="rgba(244, 63, 94, 0.22)" />
          <circle cx="84" cy="96" r="6.5" fill="#1f2937" />
          <circle cx="116" cy="96" r="6.5" fill="#1f2937" />
          <path d="M 88 123 Q 100 131 112 123" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>

        <div
          style={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            width: 28,
            height: 28,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            border: '2px solid #0f172a',
            backgroundColor: state === 'speaking' ? '#6366f1' : state === 'listening' ? '#10b981' : '#64748b',
          }}
        >
          {state === 'speaking' && '🔵'}
          {state === 'listening' && '🟢'}
          {state === 'thinking' && '🟡'}
          {state === 'celebrating' && '🎉'}
          {state === 'idle' && '✨'}
        </div>
      </div>

      {showBadge && (
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-main)' }}>{profile.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{profile.title}</div>
        </div>
      )}
    </div>
  );
};
