import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SavedChat } from '../../types';
import {
  MessageSquare,
  Clock,
  TrendingUp,
  Trash2,
  Play,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const SavedChatsView: React.FC = () => {
  const { savedChats, deleteSavedChat, setCurrentView } = useApp();

  const [selectedChat, setSelectedChat] = useState<SavedChat | null>(
    savedChats.length > 0 ? savedChats[0] : null
  );

  React.useEffect(() => {
    if (selectedChat && !savedChats.some((c) => c.id === selectedChat.id)) {
      setSelectedChat(savedChats.length > 0 ? savedChats[0] : null);
    } else if (!selectedChat && savedChats.length > 0) {
      setSelectedChat(savedChats[0]);
    }
  }, [savedChats]);

  const handleDeleteChat = async (chatToDelete: SavedChat) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${chatToDelete.title}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    deleteSavedChat(chatToDelete.id);
    const remaining = savedChats.filter((c) => c.id !== chatToDelete.id);
    setSelectedChat(remaining.length > 0 ? remaining[0] : null);

    try {
      await fetch(`/api/chats/${chatToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('flunexa_auth_token') || ''}`,
        },
      });
    } catch (err) {
      console.warn('[Chats] Backend deletion notice:', err);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 20px 80px' }}>
      {/* Top Banner */}
      <div
        className="glass-card"
        style={{
          padding: '28px 32px',
          borderRadius: 'var(--radius-xl)',
          marginBottom: 24,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="badge badge-primary">CONVERSATION ARCHIVE</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>AI-Analyzed Chat Sessions</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900 }}>Saved Chats & History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, marginTop: 6, maxWidth: 640 }}>
            Every conversation with Nexa is automatically analyzed, named by topic, and stored here. Review corrections and track fluency growth over time.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('practice')}
          className="btn-primary"
          style={{ padding: '12px 24px', fontSize: 14 }}
        >
          <Play size={16} fill="#ffffff" />
          <span>New Voice Call With Nexa</span>
        </button>
      </div>

      {savedChats.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: 60,
            borderRadius: 'var(--radius-xl)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 44, marginBottom: 12 }}>🤖💬</div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>No Saved Chats Yet!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 420, margin: '8px auto 20px' }}>
            Start your first real-time speaking conversation with Nexa. When you finish, the chat will be automatically titled and saved here!
          </p>
          <button
            onClick={() => setCurrentView('practice')}
            className="btn-primary"
            style={{ padding: '12px 28px' }}
          >
            Start Conversation Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }} className="lg:grid-cols-3">
          {/* Left Column: List of Saved Chats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              All Saved Sessions ({savedChats.length})
            </div>

            {savedChats.map((chat) => {
              const isSelected = selectedChat?.id === chat.id;
              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className="glass-card glass-card-interactive"
                  style={{
                    padding: 16,
                    borderRadius: 'var(--radius-lg)',
                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-glass)',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.16)' : 'var(--bg-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-success" style={{ fontSize: 11 }}>
                      Fluency: {chat.fluencyScore}%
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {chat.timestamp}
                    </span>
                  </div>

                  <strong style={{ fontSize: 15, color: 'var(--text-main)', lineHeight: 1.3 }}>
                    {chat.title}
                  </strong>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-dim)' }}>
                    <span>⏱️ {Math.round(chat.durationSeconds / 60)} mins • {chat.messagesCount} msgs</span>
                    <ChevronRight size={14} color={isSelected ? 'var(--color-primary-light)' : 'var(--text-dim)'} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Active Selected Chat Details */}
          {selectedChat && (
            <div
              className="glass-card lg:col-span-2"
              style={{
                padding: 24,
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                flexDirection: 'column',
                height: 640,
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  paddingBottom: 16,
                  borderBottom: '1px solid var(--border-glass)',
                  marginBottom: 16,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="badge badge-primary">AI-ANALYZED TOPIC</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedChat.timestamp}</span>
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 800 }}>{selectedChat.title}</h2>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                    Base prompt: {selectedChat.topic} • Native explanation: {selectedChat.nativeLanguage}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteChat(selectedChat)}
                  className="btn-icon"
                  title="Delete this saved chat"
                  style={{ color: '#ef4444' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Chat Messages Stream */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  paddingRight: 6,
                  marginBottom: 16,
                }}
              >
                {selectedChat.messages.map((m) => {
                  const isAi = m.sender === 'ai';
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isAi ? 'flex-start' : 'flex-end',
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '85%',
                          padding: '10px 16px',
                          borderRadius: isAi ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                          backgroundColor: isAi ? 'var(--bg-surface-elevated)' : 'var(--color-primary)',
                          color: isAi ? 'var(--text-main)' : '#ffffff',
                          fontSize: 13,
                          lineHeight: 1.5,
                        }}
                      >
                        <div>{m.text}</div>
                        {!isAi && m.mistakesDetected && m.mistakesDetected.length > 0 && (
                          <div
                            style={{
                              marginTop: 6,
                              padding: '4px 8px',
                              borderRadius: 6,
                              backgroundColor: 'rgba(0,0,0,0.25)',
                              fontSize: 11,
                              color: '#fef08a',
                            }}
                          >
                            💡 Correction: {m.mistakesDetected[0].corrected}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 3 }}>
                        {isAi ? 'Nexa 🤖' : 'You'} • {m.timestamp}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chat Mistakes Summary Bar */}
              {selectedChat.mistakes.length > 0 && (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderLeft: '4px solid #ef4444',
                    fontSize: 12,
                  }}
                >
                  <strong style={{ color: '#ef4444' }}>Key Correction in this session: </strong>
                  <span>"{selectedChat.mistakes[0].original}" ➔ </span>
                  <strong style={{ color: '#10b981' }}>"{selectedChat.mistakes[0].corrected}" </strong>
                  <span style={{ color: 'var(--text-muted)' }}>({selectedChat.mistakes[0].nativeExplanation})</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
