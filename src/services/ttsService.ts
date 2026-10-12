import { NativeLanguage } from '../types';

export interface TTSOptions {
  text: string;
  languageCode?: string;
  gender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
  speakingRate?: number;
  pitch?: number;
}

// Google Cloud Language Voice mapping for realistic human speech (Male & Female)
const LANGUAGE_VOICE_MAP: Record<string, { female: { code: string; name: string; ssmlGender: string }; male: { code: string; name: string; ssmlGender: string } }> = {
  Telugu: {
    female: { code: 'te-IN', name: 'te-IN-Standard-A', ssmlGender: 'FEMALE' },
    male: { code: 'te-IN', name: 'te-IN-Standard-B', ssmlGender: 'MALE' },
  },
  Hindi: {
    female: { code: 'hi-IN', name: 'hi-IN-Wavenet-A', ssmlGender: 'FEMALE' },
    male: { code: 'hi-IN', name: 'hi-IN-Wavenet-B', ssmlGender: 'MALE' },
  },
  Tamil: {
    female: { code: 'ta-IN', name: 'ta-IN-Wavenet-A', ssmlGender: 'FEMALE' },
    male: { code: 'ta-IN', name: 'ta-IN-Wavenet-B', ssmlGender: 'MALE' },
  },
  Kannada: {
    female: { code: 'kn-IN', name: 'kn-IN-Standard-A', ssmlGender: 'FEMALE' },
    male: { code: 'kn-IN', name: 'kn-IN-Standard-B', ssmlGender: 'MALE' },
  },
  Malayalam: {
    female: { code: 'ml-IN', name: 'ml-IN-Standard-A', ssmlGender: 'FEMALE' },
    male: { code: 'ml-IN', name: 'ml-IN-Standard-B', ssmlGender: 'MALE' },
  },
  Bengali: {
    female: { code: 'bn-IN', name: 'bn-IN-Wavenet-A', ssmlGender: 'FEMALE' },
    male: { code: 'bn-IN', name: 'bn-IN-Wavenet-B', ssmlGender: 'MALE' },
  },
  Marathi: {
    female: { code: 'mr-IN', name: 'mr-IN-Wavenet-A', ssmlGender: 'FEMALE' },
    male: { code: 'mr-IN', name: 'mr-IN-Wavenet-B', ssmlGender: 'MALE' },
  },
  Gujarati: {
    female: { code: 'gu-IN', name: 'gu-IN-Standard-A', ssmlGender: 'FEMALE' },
    male: { code: 'gu-IN', name: 'gu-IN-Standard-B', ssmlGender: 'MALE' },
  },
  English: {
    female: { code: 'en-US', name: 'en-US-Neural2-F', ssmlGender: 'FEMALE' },
    male: { code: 'en-US', name: 'en-US-Neural2-D', ssmlGender: 'MALE' },
  },
};

export class TTSService {
  private static currentAudio: HTMLAudioElement | null = null;
  private static isSpeakingAudio = false;
  private static activeText: string = '';
  private static lastSpokenTimestamp: number = 0;

  static isCurrentlySpeaking(): boolean {
    if (this.currentAudio && !this.currentAudio.paused) return true;
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) return true;
    return this.isSpeakingAudio;
  }

  static getActiveSpeakingText(): string {
    return this.activeText;
  }

  static getLastSpokenTimestamp(): number {
    return this.lastSpokenTimestamp;
  }

  // Generate Speech Audio Buffer via Google Cloud API server endpoint or fallback to Browser SpeechSynthesis
  static async speak(
    text: string,
    nativeLang: NativeLanguage = 'Telugu',
    gender: 'MALE' | 'FEMALE' = 'FEMALE',
    onStart?: () => void,
    onEnd?: () => void,
    onAudioBoundary?: (charIndex: number) => void
  ): Promise<void> {
    this.stop(); // Stop previous audio gracefully before starting new AI response

    this.activeText = text;
    this.isSpeakingAudio = true;
    console.log(`[TTS] Speaking initiated (${text.length} chars): "${text.slice(0, 50)}..."`);

    // Detect actual language of response text based on Unicode script
    const hasTelugu = /[\u0C00-\u0C7F]/.test(text);
    const hasHindi = /[\u0900-\u097F]/.test(text);
    const hasTamil = /[\u0B80-\u0BFF]/.test(text);
    const actualLang: NativeLanguage = hasTelugu ? 'Telugu' : hasHindi ? 'Hindi' : hasTamil ? 'Tamil' : 'English';

    const langEntry = LANGUAGE_VOICE_MAP[actualLang] || LANGUAGE_VOICE_MAP['English'];
    const voiceConfig = gender === 'MALE' ? langEntry.male : langEntry.female;

    try {
      // 1. Try server Google Cloud Text-To-Speech API endpoint first
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          languageCode: voiceConfig.code,
          voiceName: voiceConfig.name,
          ssmlGender: voiceConfig.ssmlGender,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioContent) {
          const audioUrl = `data:audio/mp3;base64,${data.audioContent}`;
          const audio = new Audio(audioUrl);
          this.currentAudio = audio;

          if (onStart) onStart();

          audio.onended = () => {
            this.isSpeakingAudio = false;
            this.lastSpokenTimestamp = Date.now();
            this.activeText = '';
            this.currentAudio = null;
            console.log('[TTS] Cloud audio completed playback.');
            if (onEnd) onEnd();
          };

          audio.onerror = () => {
            console.warn('[TTS] Audio playback error, falling back to Web Speech API');
            this.currentAudio = null;
            this.speakWebSpeech(text, voiceConfig.code, onStart, onEnd, onAudioBoundary);
          };

          try {
            await audio.play();
            return;
          } catch (playErr) {
            console.warn('[TTS] Audio play blocked by browser autoplay policy, falling back to Web Speech API:', playErr);
            this.currentAudio = null;
            this.speakWebSpeech(text, voiceConfig.code, onStart, onEnd, onAudioBoundary);
            return;
          }
        }
      }
    } catch (err) {
      console.warn('[TTS] Server Google Cloud TTS unavailable, using Web Speech API fallback:', err);
    }

    // 2. Fallback to browser SpeechSynthesis API with realistic pitch and rate
    this.speakWebSpeech(text, voiceConfig.code, onStart, onEnd, onAudioBoundary);
  }

  // Web Speech API fallback
  private static speakWebSpeech(
    text: string,
    langCode: string,
    onStart?: () => void,
    onEnd?: () => void,
    onAudioBoundary?: (charIndex: number) => void
  ) {
    if (!('speechSynthesis' in window)) {
      this.isSpeakingAudio = false;
      if (onStart) onStart();
      setTimeout(() => { if (onEnd) onEnd(); }, 1500);
      return;
    }

    try {
      window.speechSynthesis.cancel(); // stop existing speech
      window.speechSynthesis.resume();
    } catch (e) {}

    const hasTelugu = /[\u0C00-\u0C7F]/.test(text);
    const hasHindi = /[\u0900-\u097F]/.test(text);
    const resolvedLangCode = hasTelugu ? 'te-IN' : hasHindi ? 'hi-IN' : (langCode || 'en-US');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = resolvedLangCode;
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    // Pick best matching voice
    let voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) {
      // Force loading voices if not cached yet
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
      };
    }

    let matchingVoice: SpeechSynthesisVoice | null = null;

    if (hasTelugu) {
      // Prioritize authentic Telugu voices
      matchingVoice = voices.find(
        (v) => v.lang.startsWith('te') || v.lang.includes('te-IN') || v.name.toLowerCase().includes('telugu')
      ) || null;

      // Fallback: Indian English voice with Indian phonetic support
      if (!matchingVoice) {
        matchingVoice = voices.find(
          (v) => v.lang.startsWith('en-IN') || v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('neerja') || v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('prabhat')
        ) || null;
      }
    } else if (hasHindi) {
      matchingVoice = voices.find(
        (v) => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')
      ) || null;
      if (!matchingVoice) {
        matchingVoice = voices.find(
          (v) => v.lang.startsWith('en-IN') || v.name.toLowerCase().includes('india')
        ) || null;
      }
    } else {
      matchingVoice = voices.find(
        (v) => v.lang.startsWith('en-IN') || v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('google')
      ) || voices.find(
        (v) => v.lang.startsWith('en')
      ) || voices[0] || null;
    }

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      this.isSpeakingAudio = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeakingAudio = false;
      this.lastSpokenTimestamp = Date.now();
      this.activeText = '';
      console.log('[TTS] Browser SpeechSynthesis completed playback.');
      if (onEnd) onEnd();
    };

    utterance.onerror = (err) => {
      console.warn('[TTS] SpeechSynthesis error:', err);
      this.isSpeakingAudio = false;
      this.lastSpokenTimestamp = Date.now();
      this.activeText = '';
      if (onEnd) onEnd();
    };

    if (onAudioBoundary) {
      utterance.onboundary = (e) => {
        onAudioBoundary(e.charIndex);
      };
    }

    // Chrome workaround: 40ms delay after cancel to ensure speech synthesis queue is ready
    setTimeout(() => {
      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[TTS] Synthesis speak error:', err);
        this.isSpeakingAudio = false;
        this.lastSpokenTimestamp = Date.now();
        this.activeText = '';
        if (onStart) onStart();
        setTimeout(() => { if (onEnd) onEnd(); }, 1000);
      }
    }, 40);
  }

  static stop() {
    this.isSpeakingAudio = false;
    this.lastSpokenTimestamp = Date.now();
    this.activeText = '';
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    console.log('[TTS] Playback stopped/halted.');
  }
}
