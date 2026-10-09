import React from 'react';
import { AvatarId } from '../../types';
import { TeacherAvatar } from './TeacherAvatar';

interface AvatarSelectorProps {
  currentAvatar: AvatarId;
  onSelect: (id: AvatarId) => void;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({ currentAvatar, onSelect }) => {
  const avatars: { id: AvatarId; name: string; trait: string; desc: string }[] = [
    { id: 'nexa', name: 'Nexa (Flunexa Bot)', trait: 'Funny AI Robot', desc: 'Witty, hilarious, super interactive robot with glowing circuits and funny reactions.' },
    { id: 'alex', name: 'Alex', trait: 'Friendly Male', desc: 'Encouraging, patient and great for day-to-day conversational ease.' },
    { id: 'mia', name: 'Mia', trait: 'Cheerful Female', desc: 'High energy, warm, ideal for vocabulary and creative topics.' },
    { id: 'aria', name: 'Aria', trait: 'Professional Female', desc: 'Structured, articulate, tailored for interview & workplace fluency.' },
    { id: 'leo', name: 'Leo', trait: 'Casual Male', desc: 'Relaxed, conversational, perfect for debate and spontaneous ideas.' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
      {avatars.map((av) => {
        const isSelected = av.id === currentAvatar;
        return (
          <div
            key={av.id}
            onClick={() => onSelect(av.id)}
            className={`glass-card glass-card-interactive`}
            style={{
              padding: 16,
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-glass)',
              background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
            }}
          >
            <TeacherAvatar avatarId={av.id} state={isSelected ? 'celebrating' : 'idle'} size="md" showBadge={false} />
            <div style={{ marginTop: 10, fontWeight: 700, fontSize: 16 }}>{av.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-primary-light)', fontWeight: 600 }}>{av.trait}</div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.4 }}>
              {av.desc}
            </p>
            {isSelected && (
              <span className="badge badge-primary" style={{ marginTop: 10 }}>
                Selected Tutor
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
