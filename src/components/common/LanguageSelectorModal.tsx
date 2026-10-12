import React, { useState, useMemo } from 'react';
import { NativeLanguage } from '../../types';
import { Search, X, Check, Volume2, Mic, Sparkles } from 'lucide-react';

export interface LanguageInfo {
  id: NativeLanguage;
  name: string;
  nativeName: string;
  speechCode: string;
  tier: 'tier1' | 'tier2' | 'tier3';
  tierLabel: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { id: 'Telugu', name: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN', tier: 'tier1', tierLabel: 'Full Voice & Speech', flag: '🇮🇳' },
  { id: 'English', name: 'English', nativeName: 'English', speechCode: 'en-IN', tier: 'tier1', tierLabel: 'Full Voice & Speech', flag: '🇬🇧' },
  { id: 'Hindi', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN', tier: 'tier1', tierLabel: 'Full Voice & Speech', flag: '🇮🇳' },
  { id: 'Tamil', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN', tier: 'tier1', tierLabel: 'Full Voice & Speech', flag: '🇮🇳' },
  { id: 'Kannada', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN', tier: 'tier1', tierLabel: 'Full Voice & Speech', flag: '🇮🇳' },
  { id: 'Malayalam', name: 'Malayalam', nativeName: 'മലയാളം', speechCode: 'ml-IN', tier: 'tier1', tierLabel: 'Full Voice & Speech', flag: '🇮🇳' },
  { id: 'Bengali', name: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN', tier: 'tier1', tierLabel: 'Full Voice & Speech', flag: '🇮🇳' },
  { id: 'Marathi', name: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN', tier: 'tier1', tierLabel: 'Full Voice & Speech', flag: '🇮🇳' },
  { id: 'Gujarati', name: 'Gujarati', nativeName: 'ગુજરાતી', speechCode: 'gu-IN', tier: 'tier1', tierLabel: 'Full Voice & Speech', flag: '🇮🇳' },
  { id: 'Punjabi', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechCode: 'pa-IN', tier: 'tier2', tierLabel: 'Speech & AI', flag: '🇮🇳' },
  { id: 'Odia', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', speechCode: 'or-IN', tier: 'tier2', tierLabel: 'Speech & AI', flag: '🇮🇳' },
  { id: 'Urdu', name: 'Urdu', nativeName: 'اردو', speechCode: 'ur-IN', tier: 'tier2', tierLabel: 'Speech & AI', flag: '🇮🇳' },
  { id: 'Assamese', name: 'Assamese', nativeName: 'অসমীয়া', speechCode: 'as-IN', tier: 'tier2', tierLabel: 'Speech & AI', flag: '🇮🇳' },
  { id: 'Sanskrit', name: 'Sanskrit', nativeName: 'संस्कृतम्', speechCode: 'sa-IN', tier: 'tier2', tierLabel: 'Speech & AI', flag: '🇮🇳' },
  { id: 'Nepali', name: 'Nepali', nativeName: 'नेपाली', speechCode: 'ne-NP', tier: 'tier2', tierLabel: 'Speech & AI', flag: '🇳🇵' },
  { id: 'Konkani', name: 'Konkani', nativeName: 'कोंकणी', speechCode: 'kok-IN', tier: 'tier3', tierLabel: 'Multilingual AI', flag: '🇮🇳' },
  { id: 'Kashmiri', name: 'Kashmiri', nativeName: 'كٲشُر', speechCode: 'ks-IN', tier: 'tier3', tierLabel: 'Multilingual AI', flag: '🇮🇳' },
  { id: 'Sindhi', name: 'Sindhi', nativeName: 'سنڌي', speechCode: 'sd-IN', tier: 'tier3', tierLabel: 'Multilingual AI', flag: '🇮🇳' },
  { id: 'Manipuri', name: 'Manipuri (Meitei)', nativeName: 'মৈতৈলোন্', speechCode: 'mni-IN', tier: 'tier3', tierLabel: 'Multilingual AI', flag: '🇮🇳' },
  { id: 'Bodo', name: 'Bodo', nativeName: 'बड़ो', speechCode: 'brx-IN', tier: 'tier3', tierLabel: 'Multilingual AI', flag: '🇮🇳' },
  { id: 'Dogri', name: 'Dogri', nativeName: 'डोगरी', speechCode: 'doi-IN', tier: 'tier3', tierLabel: 'Multilingual AI', flag: '🇮🇳' },
  { id: 'Maithili', name: 'Maithili', nativeName: 'मैथिली', speechCode: 'mai-IN', tier: 'tier3', tierLabel: 'Multilingual AI', flag: '🇮🇳' },
  { id: 'Santali', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', speechCode: 'sat-IN', tier: 'tier3', tierLabel: 'Multilingual AI', flag: '🇮🇳' },
];

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: NativeLanguage;
  onSelectLanguage: (language: NativeLanguage, speechCode: string) => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  onSelectLanguage,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return SUPPORTED_LANGUAGES;
    return SUPPORTED_LANGUAGES.filter(
      (lang) =>
        lang.name.toLowerCase().includes(q) ||
        lang.nativeName.toLowerCase().includes(q) ||
        lang.speechCode.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 20, 0.75)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 580,
          maxHeight: '85vh',
          backgroundColor: 'rgba(15, 23, 42, 0.96)',
          border: '1px solid var(--border-glass)',
          borderRadius: 20,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6), 0 0 32px rgba(6, 182, 212, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🌐</span>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Select Multilingual Speech & Conversation Language
              </h2>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
              Nexa recognizes spoken speech, understands intent, and replies in your chosen tongue.
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-icon"
            style={{ width: 34, height: 34, borderRadius: '50%' }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-glass)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-glass)',
              borderRadius: 12,
              padding: '10px 14px',
            }}
          >
            <Search size={16} color="var(--text-dim)" />
            <input
              type="text"
              placeholder="Search by language (e.g., Telugu, తెలుగు, Hindi, தமிழ்)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: 13,
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 0 }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Language Grid */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 10,
          }}
        >
          {filteredLanguages.map((lang) => {
            const isSelected = selectedLanguage === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => {
                  onSelectLanguage(lang.id, lang.speechCode);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: isSelected
                    ? '2px solid #06b6d4'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: isSelected
                    ? 'rgba(6, 182, 212, 0.18)'
                    : 'rgba(255, 255, 255, 0.03)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? '0 0 16px rgba(6, 182, 212, 0.25)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{lang.flag}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: isSelected ? '#38bdf8' : '#ffffff' }}>
                        {lang.name}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        ({lang.nativeName})
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4,
                          backgroundColor:
                            lang.tier === 'tier1'
                              ? 'rgba(16, 185, 129, 0.2)'
                              : lang.tier === 'tier2'
                              ? 'rgba(56, 189, 248, 0.2)'
                              : 'rgba(168, 85, 247, 0.2)',
                          color:
                            lang.tier === 'tier1'
                              ? '#34d399'
                              : lang.tier === 'tier2'
                              ? '#38bdf8'
                              : '#c084fc',
                        }}
                      >
                        {lang.tierLabel}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                        {lang.speechCode}
                      </span>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      backgroundColor: '#06b6d4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                    }}
                  >
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info note */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            borderTop: '1px solid var(--border-glass)',
            fontSize: 11,
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Sparkles size={14} color="#38bdf8" />
          <span>
            <strong>Learning Rule:</strong> When you speak in your regional language, Nexa converses in that language. If you practice English and make a grammar error, Nexa explains it in English only.
          </span>
        </div>
      </div>
    </div>
  );
};
