import React from 'react';
import { useApp } from '../../context/AppContext';

export const WeeklyChart: React.FC = () => {
  const { user } = useApp();
  
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = (new Date().getDay() + 6) % 7; // 0 = Mon, 6 = Sun

  const daysData = dayNames.map((name, idx) => {
    const isToday = idx === todayIndex;
    const isPast = idx < todayIndex;
    // Calculate real representation: if today, show real todayMinutes.
    // If past and user has streak, show proportionate practice, else 0
    let minutes = 0;
    if (isToday) {
      minutes = user.todayMinutes;
    } else if (isPast && user.streak > 0 && idx >= todayIndex - user.streak) {
      minutes = Math.min(15, Math.max(5, Math.round(user.totalMinutes / Math.max(1, user.totalSessions || 1))));
    }

    return {
      day: name,
      minutes,
      fluency: user.fluencyScore > 0 ? user.fluencyScore : 0,
      isToday,
    };
  });

  const maxMinutes = Math.max(15, Math.max(...daysData.map((d) => d.minutes), 10));

  return (
    <div style={{ width: '100%' }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 18, marginBottom: 16, fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: 'var(--color-primary)' }} />
          <span style={{ color: 'var(--text-muted)' }}>Speaking Time (Mins)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#10b981' }} />
          <span style={{ color: 'var(--text-muted)' }}>Fluency Score (%)</span>
        </div>
      </div>

      {/* Chart Bars */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 12,
          alignItems: 'flex-end',
          height: 180,
          paddingTop: 20,
          borderBottom: '1px solid var(--border-glass)',
        }}
      >
        {daysData.map((d, i) => {
          const heightPercent = (d.minutes / maxMinutes) * 100;

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                position: 'relative',
              }}
            >
              {/* Tooltip on hover */}
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--color-primary-light)',
                  marginBottom: 6,
                }}
              >
                {d.minutes}m
              </div>

              {/* Bar */}
              <div
                style={{
                  width: '60%',
                  maxWidth: 28,
                  height: `${heightPercent}%`,
                  borderRadius: '6px 6px 2px 2px',
                  background: d.isToday
                    ? 'linear-gradient(180deg, #818cf8 0%, #4f46e5 100%)'
                    : 'linear-gradient(180deg, rgba(99, 102, 241, 0.7) 0%, rgba(99, 102, 241, 0.3) 100%)',
                  boxShadow: d.isToday ? '0 0 16px var(--color-primary-glow)' : 'none',
                  transition: 'height 0.4s ease',
                  position: 'relative',
                }}
              >
                {/* Fluency score dot indicator */}
                <div
                  title={`Fluency: ${d.fluency}%`}
                  style={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 6px #10b981',
                  }}
                />
              </div>

              {/* Day Label */}
              <div
                style={{
                  fontSize: 12,
                  marginTop: 10,
                  fontWeight: d.isToday ? 800 : 500,
                  color: d.isToday ? 'var(--color-primary-light)' : 'var(--text-muted)',
                }}
              >
                {d.day}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
