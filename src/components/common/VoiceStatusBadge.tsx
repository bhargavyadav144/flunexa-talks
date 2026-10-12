import React from 'react';
import { AvatarState } from '../../types';

interface VoiceStatusBadgeProps {
  state: AvatarState;
}

export const VoiceStatusBadge: React.FC<VoiceStatusBadgeProps> = ({ state }) => {
  const getDetails = () => {
    switch (state) {
      case 'listening':
        return {
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.35)',
          emoji: '🟢',
          text: 'Listening to you',
          pulse: true,
        };
      case 'user_speaking':
        return {
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.25)',
          border: 'rgba(16, 185, 129, 0.5)',
          emoji: '🎙️',
          text: 'You are speaking...',
          pulse: true,
        };
      case 'speaking':
        return {
          color: '#6366f1',
          bg: 'rgba(99, 102, 241, 0.15)',
          border: 'rgba(99, 102, 241, 0.35)',
          emoji: '🔵',
          text: 'AI Tutor Speaking',
          pulse: false,
        };
      case 'interrupted':
        return {
          color: '#f97316',
          bg: 'rgba(249, 115, 22, 0.2)',
          border: 'rgba(249, 115, 22, 0.5)',
          emoji: '⚡',
          text: 'Interrupted • Listening...',
          pulse: true,
        };
      case 'thinking':
        return {
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.15)',
          border: 'rgba(245, 158, 11, 0.35)',
          emoji: '🟡',
          text: 'Thinking & analyzing',
          pulse: false,
        };
      case 'correcting':
        return {
          color: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.15)',
          border: 'rgba(239, 68, 68, 0.35)',
          emoji: '💡',
          text: 'Sharing feedback',
          pulse: false,
        };
      case 'celebrating':
        return {
          color: '#ec4899',
          bg: 'rgba(236, 72, 153, 0.15)',
          border: 'rgba(236, 72, 153, 0.35)',
          emoji: '🎉',
          text: 'Great effort!',
          pulse: false,
        };
      case 'paused':
        return {
          color: '#94a3b8',
          bg: 'rgba(148, 163, 184, 0.15)',
          border: 'rgba(148, 163, 184, 0.35)',
          emoji: '⏸',
          text: 'Session Paused',
          pulse: false,
        };
      default:
        return {
          color: '#64748b',
          bg: 'rgba(100, 116, 139, 0.15)',
          border: 'rgba(100, 116, 139, 0.35)',
          emoji: '✨',
          text: 'Ready to speak',
          pulse: false,
        };
    }
  };

  const current = getDetails();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: current.bg,
        border: `1px solid ${current.border}`,
        color: current.color,
        fontWeight: 600,
        fontSize: 13,
      }}
    >
      <span style={{ fontSize: 13 }}>{current.emoji}</span>
      <span>{current.text}</span>
      {current.pulse && (
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: current.color,
            animation: 'listeningPulse 1.5s infinite',
          }}
        />
      )}
    </div>
  );
};
