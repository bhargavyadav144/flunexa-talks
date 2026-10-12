import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { AvatarId, AvatarState, ConversationMessage, Mistake, NativeLanguage } from '../../types';
import { Avatar3D } from '../avatar/Avatar3D';
import { VoiceStatusBadge } from '../common/VoiceStatusBadge';
import { AudioWaveform } from '../common/AudioWaveform';
import { speechService } from '../../services/speechService';
import { AIService } from '../../services/aiService';
import { soundService } from '../../services/soundService';
import { TTSService } from '../../services/ttsService';
import { TranslationService } from '../../services/translationService';
import { EchoCancellationService } from '../../services/echoCancellationService';

import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Play,
  Pause,
  MessageSquare,
  X,
  Sparkles,
  BarChart2,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Minimize2,
  Maximize2,
  RotateCcw,
} from 'lucide-react';

interface RealtimeConversationProps {
  initialTopic?: string;
  onFinishSession?: (fullTranscript: string, durationSeconds: number) => void;
}

export const RealtimeConversation: React.FC<RealtimeConversationProps> = ({
  initialTopic = 'Talking About Yourself & Everyday Habits',
  onFinishSession,
}) => {
  const { user, selectedAvatar, openAnalysisModal, saveChat, setCurrentView, currentAccount, openAuthModal, updateUser, setSelectedAvatar } = useApp();

  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [mouthVolume, setMouthVolume] = useState<number>(0);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [textInput, setTextInput] = useState<string>('');
  const [highlightedMistakes, setHighlightedMistakes] = useState<Mistake[]>([]);
  const [micWaveVolume, setMicWaveVolume] = useState<number>(0);

  // Full Screen / Drawer Controls
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);
  const [currentFunnyMood, setCurrentFunnyMood] = useState<string>('idle');
  const [latestCorrection, setLatestCorrection] = useState<Mistake | null>(null);
  const [savedNotification, setSavedNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);
  const activeAbortControllerRef = useRef<AbortController | null>(null);
  const generationIdRef = useRef<number>(0);

  useEffect(() => {
    if (isChatDrawerOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, liveTranscript, isChatDrawerOpen]);

  // Session duration timer
  useEffect(() => {
    if (isSessionActive) {
      timerRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isSessionActive]);

  // Instant AI Interruption (Barge-in): immediately halts audio and in-flight API request
  const handleBargeIn = (reason: string = 'user_speech') => {
    const isSpeaking = TTSService.isCurrentlySpeaking() || speechService.isSpeaking();
    const isThinking = avatarState === 'thinking';

    if (isSpeaking || isThinking) {
      console.log(`[Barge-in] Interrupted by ${reason}! Halting AI speech & cancelling stale request.`);
      generationIdRef.current += 1;
      if (activeAbortControllerRef.current) {
        activeAbortControllerRef.current.abort();
        activeAbortControllerRef.current = null;
      }
      TTSService.stop();
      speechService.stopSpeaking();
      setMouthVolume(0);
      setAvatarState('interrupted');
      soundService.playTick();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    // Auto-start conversation as soon as user opens AI Talk
    startConversationSession();

    return () => {
      handleBargeIn('unmount');
      speechService.stopSpeaking();
      speechService.stopListening();
      speechService.cleanupAudioStream();
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // AI speaks response with funny robot personality & human voice
  const speakAIResponse = (
    text: string,
    funnyReaction?: string,
    hasMistake: boolean = false,
    overrideAvatar?: AvatarId,
    overrideLang?: NativeLanguage,
    expectedGenId?: number
  ) => {
    if (expectedGenId !== undefined && expectedGenId !== generationIdRef.current) {
      console.log('[TTS] Discarding outdated speech playback after interruption.');
      return;
    }

    if (isAudioMuted) {
      setAvatarState('listening');
      return;
    }

    const nextState: AvatarState = hasMistake
      ? 'correcting'
      : funnyReaction === 'sleepy'
      ? 'sleepy'
      : funnyReaction === 'celebrate'
      ? 'celebrating'
      : 'speaking';

    setAvatarState(nextState);
    if (funnyReaction) setCurrentFunnyMood(funnyReaction);

    const activeAvatar = overrideAvatar || selectedAvatar;
    const gender = (activeAvatar === 'leo' || activeAvatar === 'alex') ? 'MALE' : 'FEMALE';
    const activeLang = overrideLang || user.nativeLanguage;

    TTSService.speak(
      text,
      activeLang,
      gender,
      () => {
        if (expectedGenId !== undefined && expectedGenId !== generationIdRef.current) {
          TTSService.stop();
          return;
        }
        setAvatarState(nextState);
        setMouthVolume(0.8);
      },
      () => {
        if (expectedGenId !== undefined && expectedGenId !== generationIdRef.current) return;
        setAvatarState(nextState === 'sleepy' ? 'sleepy' : 'listening');
        setMouthVolume(0);
      }
    );
  };

  // Process user speech when user pauses or submits
  const handleUserMessageReceived = async (userText: string) => {
    if (!userText || !userText.trim()) return;

    // Safety guard: reject if userText matches active or recently spoken AI message (Acoustic Echo Prevention)
    const activeAiSpeech = TTSService.getActiveSpeakingText();
    const recentAiTexts = messages
      .filter((m) => m.sender === 'ai')
      .slice(-4)
      .map((m) => m.text);
    const lastSpoken = TTSService.getLastSpokenTimestamp();

    const echoCheck = EchoCancellationService.isEchoOfAI(userText, activeAiSpeech, recentAiTexts, lastSpoken);
    if (echoCheck.isEcho) {
      console.warn(`[AEC] Blocked self-voice loop in handleUserMessageReceived: "${userText}" (${echoCheck.reason})`);
      return;
    }

    console.log(`[CHAT] Submitting verified user message: "${userText}"`);

    // Instant interruption of any previous speaking/thinking
    handleBargeIn('new_message');
    const currentGenId = ++generationIdRef.current;

    // Analyze grammar
    const detectedMistakes = AIService.analyzeGrammarAndMistakes(userText, user.nativeLanguage);
    if (detectedMistakes.length > 0) {
      setHighlightedMistakes((prev) => [...detectedMistakes, ...prev].slice(0, 5));
      setLatestCorrection(detectedMistakes[0]);
    } else {
      setLatestCorrection(null);
    }

    const newUserMsg: ConversationMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: userText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mistakesDetected: detectedMistakes,
    };

    if (!currentAccount) {
      openAuthModal('signup');
      return;
    }

    setMessages((prev) => [...prev, newUserMsg]);
    setLiveTranscript('');
    setAvatarState('thinking');
    setErrorMessage(null);

    const controller = new AbortController();
    activeAbortControllerRef.current = controller;

    try {
      const history = [...messages, newUserMsg].map((m) => ({ sender: m.sender, text: m.text }));
      const aiResult = await AIService.generateTeacherResponseAsync(
        userText,
        initialTopic,
        history,
        selectedAvatar === 'leo' ? 'Leo' : 'Nexa',
        user.nativeLanguage,
        controller.signal
      );

      // Verify request wasn't interrupted in-flight
      if (currentGenId !== generationIdRef.current) {
        console.log('[AI] Stale response safely discarded.');
        return;
      }

      if (aiResult.detectedLanguage) {
        updateUser({ nativeLanguage: aiResult.detectedLanguage });
      }
      if (aiResult.detectedAvatar) {
        setSelectedAvatar(aiResult.detectedAvatar);
      }

      if (aiResult.mistakes.length > 0) {
        soundService.playCorrectionSoft();
      } else if (aiResult.funnyReaction === 'celebrate' || aiResult.funnyReaction === 'starry') {
        soundService.playSuccessBeep();
      }

      const newAiMsg: ConversationMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'ai',
        text: aiResult.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mistakesDetected: aiResult.mistakes,
        funnyReaction: aiResult.funnyReaction,
      };

      setMessages((prev) => [...prev, newAiMsg]);
      speakAIResponse(
        aiResult.text,
        aiResult.funnyReaction,
        aiResult.mistakes.length > 0,
        aiResult.detectedAvatar,
        aiResult.detectedLanguage,
        currentGenId
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('[AI] Previous request aborted cleanly on user barge-in.');
        return;
      }
      console.error('[AI] Generation error:', err);
      setErrorMessage('Could not connect to AI Coach. Please try speaking again.');
      setAvatarState('listening');
    } finally {
      if (activeAbortControllerRef.current === controller) {
        activeAbortControllerRef.current = null;
      }
    }
  };

  // Restart / Reset conversation state
  const handleRestartConversation = () => {
    handleBargeIn('restart');
    setMessages([]);
    setLiveTranscript('');
    setHighlightedMistakes([]);
    setLatestCorrection(null);
    setDurationSeconds(0);
    setErrorMessage(null);

    let initialGreeting = '';
    if (user.nativeLanguage === 'Telugu') {
      initialGreeting = `Namaskaram ${user.name}! 🚀 Fresh conversation start chesa. Eeroju enti matladadham?`;
    } else if (user.nativeLanguage === 'Hindi') {
      initialGreeting = `Namaste ${user.name}! 🚀 Nayi conversation shuru karte hain. Aaj kis topic par baat karein?`;
    } else {
      initialGreeting = `Hello ${user.name}! 🚀 I've started a fresh conversation. What topic would you like to practice today?`;
    }

    const welcomeMsg: ConversationMessage = {
      id: 'msg-start-' + Date.now(),
      sender: 'ai',
      text: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      funnyReaction: 'wave',
    };
    setMessages([welcomeMsg]);
    speakAIResponse(initialGreeting, 'wave', false, undefined, undefined, generationIdRef.current);
  };

  // Start Voice Activity Detection & continuous recognition loop
  const startConversationSession = async () => {
    if (!currentAccount) {
      openAuthModal('signup');
      return;
    }

    setIsSessionActive(true);
    soundService.playTick();

    const micGranted = await speechService.initMicrophoneWaveform((vol) => {
      setMicWaveVolume(vol);
    });

    if (!micGranted) {
      console.warn('[MIC] Microphone permission not available.');
      setErrorMessage('Microphone access is unavailable. Please allow microphone permission in your browser settings.');
      setAvatarState('idle');
      return;
    }

    // Quick initial warm greeting only on first empty session
    if (messages.length === 0) {
      let initialGreeting = '';
      if (user.nativeLanguage === 'Telugu') {
        initialGreeting = `Namaskaram ${user.name}! 🚀 Nenu Nexa, ready ga unnanu. Eeroju enti sangathulu? Koncham English lo cheppu chooddam!`;
      } else if (user.nativeLanguage === 'Hindi') {
        initialGreeting = `Namaste ${user.name}! 🚀 Main ready hoon. Batao aaj ka din kaisa raha, bindass English mein bolo!`;
      } else {
        initialGreeting = `Hello ${user.name}! 🚀 I'm ready. Tell me about your day in English!`;
      }

      const welcomeMsg: ConversationMessage = {
        id: 'msg-start',
        sender: 'ai',
        text: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        funnyReaction: 'wave',
      };
      setMessages([welcomeMsg]);
      speakAIResponse(initialGreeting, 'wave', false, undefined, undefined, generationIdRef.current);
    }

    // Start continuous speech recognition loop with Acoustic Echo Cancellation & Barge-In
    const activateListeningLoop = () => {
      speechService.startListening(
        {
          onStart: () => {
            console.log('[MIC] Speech recognition loop started.');
          },
          onUserSpeakingDetected: () => {
            // Only switch to user_speaking if AI is not currently speaking audio
            if (!TTSService.isCurrentlySpeaking() && !speechService.isSpeaking()) {
              setAvatarState('user_speaking');
            }
          },
          onInterimResult: (transcript) => {
            const activeAiSpeech = TTSService.getActiveSpeakingText();
            const recentAiTexts = messages
              .filter((m) => m.sender === 'ai')
              .slice(-3)
              .map((m) => m.text);
            const lastSpoken = TTSService.getLastSpokenTimestamp();

            // Check if interim transcript is an echo of AI's own voice
            const echoCheck = EchoCancellationService.isEchoOfAI(
              transcript,
              activeAiSpeech,
              recentAiTexts,
              lastSpoken
            );

            if (echoCheck.isEcho) {
              console.log(`[AEC] Filtered interim speaker audio: "${transcript}" (${echoCheck.reason})`);
              return;
            }

            // Genuine human speech detected! If AI is currently speaking, barge-in immediately!
            if (TTSService.isCurrentlySpeaking() || speechService.isSpeaking()) {
              console.log(`[BARGE_IN] Genuine human interruption detected during AI playback: "${transcript}". Halting AI.`);
              handleBargeIn('human_speech_detected');
            }

            setAvatarState('user_speaking');
            setLiveTranscript(transcript);
          },
          onFinalResult: (transcript) => {
            if (!transcript || !transcript.trim()) return;

            const activeAiSpeech = TTSService.getActiveSpeakingText();
            const recentAiTexts = messages
              .filter((m) => m.sender === 'ai')
              .slice(-3)
              .map((m) => m.text);
            const lastSpoken = TTSService.getLastSpokenTimestamp();

            // Check if final transcript is an echo of AI speech
            const echoCheck = EchoCancellationService.isEchoOfAI(
              transcript,
              activeAiSpeech,
              recentAiTexts,
              lastSpoken
            );

            if (echoCheck.isEcho) {
              console.warn(`[AEC] Filtered final transcript (AI self-voice echo): "${transcript}" (${echoCheck.reason})`);
              setLiveTranscript('');
              if (!TTSService.isCurrentlySpeaking() && !speechService.isSpeaking()) {
                setAvatarState('listening');
              }
              return;
            }

            console.log(`[STT] Captured verified human speech utterance: "${transcript}"`);
            setLiveTranscript('');
            handleUserMessageReceived(transcript);
          },
          onError: (err) => {
            console.warn('[MIC] Speech recognition notice:', err);
            if (typeof err === 'string' && (err.includes('not-allowed') || err.includes('denied'))) {
              setErrorMessage('Microphone access was denied. Please allow microphone permission in your browser.');
              setAvatarState('idle');
            }
          },
          onEnd: () => {
            // Auto-restart recognition if session is active
            if (isSessionActive) {
              setTimeout(() => {
                if (isSessionActive) {
                  activateListeningLoop();
                }
              }, 300);
            }
          },
        },
        'en-IN'
      );
    };

    activateListeningLoop();
  };


  const pauseSession = () => {
    setIsSessionActive(false);
    setAvatarState('paused');
    TTSService.stop();
    speechService.stopSpeaking();
    speechService.stopListening();
  };


  // Finish conversation, analyze name, save to Saved Chats, and open analysis
  const handleFinishAndAnalyze = () => {
    pauseSession();

    const allUserText = messages
      .filter((m) => m.sender === 'user')
      .map((m) => m.text)
      .join('. ');

    const sampleText = allUserText || 'Today I practiced speaking English with Nexa robot and discussed daily plans.';

    // 1. Analyze and generate intelligent descriptive chat title
    const analyzedTitle = AIService.generateChatTitle(messages, initialTopic);

    // 2. Generate full session analysis
    const analysis = AIService.generateSessionAnalysis(
      sampleText,
      analyzedTitle,
      Math.max(60, durationSeconds),
      user.nativeLanguage
    );

    // 3. Save into persistent Saved Chats
    const savedChatEntry = saveChat({
      title: analyzedTitle,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationSeconds: Math.max(60, durationSeconds),
      messagesCount: messages.length,
      fluencyScore: analysis.scores.fluency,
      topic: initialTopic,
      messages: [...messages],
      mistakes: [...analysis.mistakes],
      aiSummary: analysis.aiFeedback,
      nativeLanguage: user.nativeLanguage,
    });

    setSavedNotification(`Chat saved as "${analyzedTitle}"!`);
    soundService.playAchievementFanfare();

    if (onFinishSession) {
      onFinishSession(sampleText, durationSeconds);
    }

    // Open detailed score report
    openAnalysisModal(analysis);
  };

  // Get the latest message for the bottom small chat bar
  const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'calc(100vh - 70px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 20px 24px',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 30%, rgba(6, 182, 212, 0.12) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 80%)',
      }}
    >
      {/* Top Floating Control Bar */}
      <div
        className="glass-card"
        style={{
          padding: '12px 20px',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          zIndex: 20,
          backdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Logo Brand Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img
              src="/assets/flunexa-logo.png"
              alt="Flunexa Talk Logo"
              style={{ width: 32, height: 32, objectFit: 'contain' }}
            />
            <span style={{ fontWeight: 800, fontSize: 16, background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Flunexa Talk
            </span>
          </div>

          <div
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 800,
              color: '#38bdf8',
            }}
          >
            ⏱️ {formatTime(durationSeconds)}
          </div>

          <span style={{ fontSize: 13, color: 'var(--text-muted)' }} className="hidden sm:inline">
            Topic: <strong>{initialTopic}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <VoiceStatusBadge state={avatarState} />

          {/* Audio Mute toggle */}
          <button
            onClick={() => {
              if (!isAudioMuted) speechService.stopSpeaking();
              setIsAudioMuted(!isAudioMuted);
            }}
            className="btn-icon"
            title={isAudioMuted ? 'Unmute Robot Voice' : 'Mute Robot Voice'}
          >
            {isAudioMuted ? <VolumeX size={17} color="#ef4444" /> : <Volume2 size={17} />}
          </button>

          {/* Pause / Resume Voice Call Button */}
          <button
            onClick={() => {
              if (isSessionActive) {
                pauseSession();
              } else {
                startConversationSession();
              }
            }}
            className="btn-secondary"
            style={{
              padding: '8px 14px',
              fontSize: 13,
              backgroundColor: isSessionActive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              borderColor: isSessionActive ? '#ef4444' : '#10b981',
              color: isSessionActive ? '#f87171' : '#34d399',
            }}
            title={isSessionActive ? 'Pause Voice Call' : 'Resume Voice Call'}
          >
            {isSessionActive ? <Pause size={15} /> : <Play size={15} />}
            <span>{isSessionActive ? 'Pause' : 'Resume'}</span>
          </button>

          {/* Toggle Full Chat History Drawer Button */}
          <button
            onClick={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
            className="btn-secondary"
            style={{
              padding: '8px 14px',
              fontSize: 13,
              backgroundColor: isChatDrawerOpen ? 'rgba(99, 102, 241, 0.25)' : 'var(--bg-surface-elevated)',
              borderColor: isChatDrawerOpen ? 'var(--color-primary)' : 'var(--border-glass)',
            }}
            title="Open Chat Transcript History"
          >
            <MessageSquare size={15} color="var(--color-primary-light)" />
            <span>Chat ({messages.length})</span>
          </button>

          {/* Restart & Clear Context Button */}
          <button
            onClick={handleRestartConversation}
            className="btn-icon"
            style={{ width: 36, height: 36 }}
            title="Restart Conversation & Clear Active Context"
          >
            <RotateCcw size={15} color="var(--text-dim)" />
          </button>

          {/* Finish & Save Session Button */}
          <button
            onClick={handleFinishAndAnalyze}
            className="btn-primary"
            style={{
              padding: '8px 18px',
              fontSize: 13,
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            }}
          >
            <CheckCircle2 size={15} />
            <span>Finish & Save Chat</span>
          </button>
        </div>
      </div>

      {/* Error / Permission Alert Banner if any */}
      {errorMessage && (
        <div
          style={{
            margin: '8px 24px',
            padding: '10px 16px',
            borderRadius: 12,
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#fca5a5',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: 4 }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* CENTER: THE PROMINENT FULL-SCREEN ANIMATED ROBOT */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '20px 0',
        }}
      >

        {/* Big Animated 3D Mascot Character Canvas */}
        <div style={{ width: '100%', maxWidth: 420, height: 320, margin: '0 auto' }}>
          <Avatar3D
            isSpeaking={avatarState === 'speaking' || avatarState === 'celebrating' || avatarState === 'correcting'}
            avatarState={avatarState}
          />
        </div>


        {/* Audio Waveform under Robot */}
        <div style={{ width: '100%', maxWidth: 360, margin: '8px 0 16px' }}>
          <AudioWaveform
            isActive={avatarState === 'speaking' || avatarState === 'listening'}
            volume={avatarState === 'speaking' ? mouthVolume : micWaveVolume}
            color={avatarState === 'speaking' ? '#06b6d4' : '#10b981'}
          />
        </div>

        {/* Live Formatted Speech Recording Display Box (Visible while user is talking) */}
        {liveTranscript && (
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              padding: '12px 18px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              animation: 'pulse 1.5s infinite alternate',
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 10px #10b981',
              }}
            />
            <div style={{ flex: 1, fontSize: 13, color: '#ecfdf5', fontStyle: 'italic', wordBreak: 'break-word' }}>
              <strong style={{ color: '#34d399', fontStyle: 'normal' }}>Listening:</strong> "{liveTranscript}"
            </div>
          </div>
        )}
      </div>

      {/* SLIDE-OUT CHAT DRAWER: OPENS WHEN USER CLICKS "CHAT" BUTTON */}
      {isChatDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            top: 70,
            right: 0,
            bottom: 0,
            width: '100%',
            maxWidth: 420,
            backgroundColor: 'var(--bg-card-solid)',
            backdropFilter: 'blur(24px)',
            borderLeft: '1px solid var(--border-glass)',
            boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.5)',
            zIndex: 60,
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease',
          }}
        >
          {/* Drawer Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MessageSquare size={18} color="var(--color-primary-light)" />
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Conversation Transcript</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{messages.length} messages exchanged</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={handleRestartConversation}
                className="btn-secondary"
                style={{ padding: '6px 10px', fontSize: 11 }}
                title="Restart Conversation & Clear Context"
              >
                <RotateCcw size={12} />
                <span>Restart</span>
              </button>
              <button onClick={() => setIsChatDrawerOpen(false)} className="btn-icon">
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Drawer Message Stream */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {messages.map((m) => {
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
                      maxWidth: '88%',
                      padding: '10px 14px',
                      borderRadius: isAi ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                      backgroundColor: isAi ? 'var(--bg-surface-elevated)' : 'var(--color-primary)',
                      color: isAi ? 'var(--text-main)' : '#ffffff',
                      fontSize: 13,
                      lineHeight: 1.5,
                      border: isAi ? '1px solid var(--border-glass)' : 'none',
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
                        💡 {m.mistakesDetected[0].corrected}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>
                    {isAi ? 'Nexa 🤖' : 'You'} • {m.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Live interim speech recording bubble inside drawer */}
            {liveTranscript && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <div
                  style={{
                    maxWidth: '88%',
                    padding: '10px 14px',
                    borderRadius: '16px 16px 4px 16px',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#a7f3d0',
                    fontSize: 13,
                    fontStyle: 'italic',
                  }}
                >
                  🎙️ {liveTranscript}...
                </div>
                <span style={{ fontSize: 10, color: '#34d399', marginTop: 2 }}>Recording live speech...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Drawer Footer with Direct Chat Input */}
          <div style={{ padding: 14, borderTop: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Direct Text Chat Form inside Drawer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (textInput.trim()) {
                  handleUserMessageReceived(textInput);
                  setTextInput('');
                }
              }}
              style={{ display: 'flex', gap: 8 }}
            >
              <input
                type="text"
                placeholder="Type your message to Nexa..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 12,
                  fontSize: 13,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  border: '1px solid var(--border-glass)',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '0 16px', borderRadius: 12 }}
                disabled={!textInput.trim()}
              >
                <Send size={15} />
              </button>
            </form>

            <button
              onClick={() => {
                setIsChatDrawerOpen(false);
                setCurrentView('saved-chats');
              }}
              className="btn-secondary"
              style={{ width: '100%', fontSize: 12, padding: '8px', justifyContent: 'center' }}
            >
              <Bookmark size={14} />
              <span>View All Saved Chats</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
