import React from 'react';

interface AudioWaveformProps {
  isActive: boolean;
  volume?: number; // 0 to 1
  barsCount?: number;
  color?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isActive,
  volume = 0.5,
  barsCount = 18,
  color = 'var(--color-primary)',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        height: 38,
        padding: '0 12px',
      }}
    >
      {Array.from({ length: barsCount }).map((_, i) => {
        // Base sine-wave profile
        const distanceCenter = Math.abs(i - barsCount / 2) / (barsCount / 2);
        const factor = Math.max(0.15, 1 - distanceCenter * 0.7);

        // Height calculation
        let h = 4;
        if (isActive) {
          const jitter = Math.sin((i + Date.now() / 150) * 1.2);
          h = Math.max(6, Math.min(34, (volume * 36 + jitter * 8) * factor));
        }

        return (
          <div
            key={i}
            style={{
              width: 3.5,
              height: `${h}px`,
              borderRadius: 3,
              backgroundColor: isActive ? color : 'var(--border-glass)',
              transition: 'height 0.08s ease, background-color 0.2s',
            }}
          />
        );
      })}
    </div>
  );
};
