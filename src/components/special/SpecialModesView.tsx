import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RealtimeConversation } from '../practice/RealtimeConversation';
import {
  Briefcase,
  Users,
  Presentation,
  Swords,
  Plane,
  GraduationCap,
  Building2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const SpecialModesView: React.FC = () => {
  const [activeSimulation, setActiveSimulation] = useState<{
    title: string;
    desc: string;
    role: string;
    prompt: string;
  } | null>(null);

  const SPECIAL_MODES = [
    {
      id: 'job-interview',
      title: 'Job Interview Simulation',
      badge: 'CAREER BOOST',
      icon: <Briefcase size={22} color="#6366f1" />,
      color: '#6366f1',
      desc: 'Simulate behavioral and technical HR interview rounds. Receive analysis on STAR method, professional vocabulary, and confidence.',
      prompt: 'Job Interview for Senior Software Professional',
      role: 'Senior Tech Recruiter',
    },
    {
      id: 'group-discussion',
      title: 'Group Discussion (GD) Arena',
      badge: 'CAMPUS PLACEMENT',
      icon: <Users size={22} color="#10b981" />,
      color: '#10b981',
      desc: 'AI simulates 3 lively student participants debating an editorial topic. Practice interrupting politely and structuring your points.',
      prompt: 'Campus Placement GD: Impact of Automation on Fresh Graduates',
      role: 'GD Moderator & Fellow Debaters',
    },
    {
      id: 'presentation',
      title: 'Presentation & Pitch Mode',
      badge: 'PUBLIC SPEAKING',
      icon: <Presentation size={22} color="#f59e0b" />,
      color: '#f59e0b',
      desc: 'Deliver an elevator pitch or project deck speech. AI benchmarks transitions, voice projection, and pacing.',
      prompt: 'Product Launch Pitch for an EdTech Innovation',
      role: 'Audience & Evaluator',
    },
    {
      id: 'debate',
      title: 'AI Debate Counter-Position',
      badge: 'ARGUMENTATION',
      icon: <Swords size={22} color="#ef4444" />,
      color: '#ef4444',
      desc: 'AI vigorously argues the counter-position on hot topics (e.g. Remote work vs In-office). Sharpen spontaneous rebuttals.',
      prompt: 'Debate: Should Remote Work Replace In-Office Collaboration?',
      role: 'Debate Opponent',
    },
    {
      id: 'travel',
      title: 'Travel & Airport English',
      badge: 'GLOBAL TRAVEL',
      icon: <Plane size={22} color="#06b6d4" />,
      color: '#06b6d4',
      desc: 'Roleplay scenarios: Airport boarding, customs declarations, hotel check-in, ordering at restaurants, and taxi navigation.',
      prompt: 'Airport Check-in & International Hotel Reception Roleplay',
      role: 'Airline & Hotel Concierge',
    },
    {
      id: 'workplace',
      title: 'Workplace & Meeting English',
      badge: 'EXECUTIVE SUITE',
      icon: <Building2 size={22} color="#8b5cf6" />,
      color: '#8b5cf6',
      desc: 'Master professional idioms, negotiating deadlines, sprint retrospectives, and giving constructive team feedback.',
      prompt: 'Quarterly Sprint Planning & Cross-Functional Team Sync',
      role: 'Team Lead & Agile Project Manager',
    },
    {
      id: 'college',
      title: 'Campus & College English',
      badge: 'STUDENT LIFE',
      icon: <GraduationCap size={22} color="#ec4899" />,
      color: '#ec4899',
      desc: 'Practice seminars, talking with professors about thesis deadlines, project collaborations, and college club events.',
      prompt: 'Discussing Academic Research & Project Timeline with Professor',
      role: 'College Faculty Mentor',
    },
  ];

  if (activeSimulation) {
    return (
      <div>
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '16px 20px 0' }}>
          <button
            onClick={() => setActiveSimulation(null)}
            className="btn-secondary"
            style={{ marginBottom: 12, padding: '8px 16px', fontSize: 13 }}
          >
            ← Back to Special Modes Hub
          </button>
        </div>
        <RealtimeConversation initialTopic={`${activeSimulation.title} (${activeSimulation.prompt})`} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 20px 80px' }}>
      <div
        className="glass-card"
        style={{
          padding: '28px 32px',
          borderRadius: 'var(--radius-xl)',
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(236, 72, 153, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span className="badge badge-primary">REAL-WORLD IMMERSION</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Roleplays & Scenarios</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900 }}>Special Practice Scenarios</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 6, maxWidth: 640 }}>
          Go beyond casual conversation. Simulate high-stakes real-world situations with AI roleplayers trained for interviews, debates, and workplaces.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {SPECIAL_MODES.map((mode) => (
          <div
            key={mode.id}
            onClick={() => setActiveSimulation(mode)}
            className="glass-card glass-card-interactive"
            style={{
              padding: 24,
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span className="badge badge-primary">{mode.badge}</span>
                <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>Role: {mode.role}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: `${mode.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {mode.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>{mode.title}</h3>
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 18 }}>
                {mode.desc}
              </p>
            </div>

            <button
              className="btn-secondary"
              style={{
                width: '100%',
                padding: '10px 16px',
                fontSize: 13,
                justifyContent: 'space-between',
              }}
            >
              <span>Launch Simulation</span>
              <ArrowRight size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
