import { AvatarId, EnglishLevel } from '../types';

export interface SpeechRecognitionHandlers {
  onStart?: () => void;
  onInterimResult?: (transcript: string) => void;
  onFinalResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  onUserSpeakingDetected?: () => void;
}

export class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private silenceTimer: any = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: any = null;
  private animFrameId: number | null = null;

  // Check if speech recognition is actively capturing audio
  public getIsListening(): boolean {
    return this.isListening;
  }

  // Check if browser supports speech recognition
  public static isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  // Synthesize and speak text with human-like voice and native language support
  public speak(
    text: string,
    avatar: AvatarId,
    level: EnglishLevel,
    onStart?: () => void,
    onEnd?: () => void,
    onMouthMove?: (volume: number) => void,
    nativeLanguage?: string
  ) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (onStart) onStart();
      setTimeout(() => onEnd && onEnd(), 2000);
      return;
    }

    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    // Rate adjustment for warm, human pacing (not too fast, natural cadence)
    let rate = 0.96;
    if (level === 'A1') rate = 0.88;
    else if (level === 'A2') rate = 0.92;
    else if (level === 'B1') rate = 0.96;
    else if (level === 'B2') rate = 0.98;
    else if (level === 'C1' || level === 'C2') rate = 1.02;

    utterance.rate = rate;

    // Pitch & avatar personalization (human, conversational warmth)
    if (avatar === 'mia') {
      utterance.pitch = 1.1;
    } else if (avatar === 'aria') {
      utterance.pitch = 1.04;
    } else if (avatar === 'leo') {
      utterance.pitch = 0.95;
    } else if (avatar === 'alex') {
      utterance.pitch = 0.98;
    } else {
      // nexa
      utterance.pitch = 1.02;
    }

    // High Quality Human Voice Selection
    const voices = window.speechSynthesis.getVoices();
    const isFemale = avatar === 'mia' || avatar === 'aria';

    const hasTeluguScript = /[\u0C00-\u0C7F]/.test(text);
    const hasDevanagari = /[\u0900-\u097F]/.test(text);
    const hasTamilScript = /[\u0B80-\u0BFF]/.test(text);
    const hasKannadaScript = /[\u0C80-\u0CFF]/.test(text);

    let chosenVoice: SpeechSynthesisVoice | null = null;

    if (nativeLanguage === 'Telugu' || hasTeluguScript) {
      // Look for Telugu voices (te-IN or te)
      const teluguVoice = voices.find(
        (v) => v.lang.startsWith('te') || v.lang.includes('te-IN') || v.name.toLowerCase().includes('telugu')
      );

      // Look for Indian English voices (en-IN) which pronounce Telugu phrases and English with natural Andhra/Indian rhythm
      const indianVoices = voices.filter(
        (v) => v.lang.startsWith('en-IN') || v.lang === 'en-IN' || v.name.toLowerCase().includes('india')
      );

      const naturalIndianVoice = indianVoices.find((v) =>
        (isFemale ? v.name.toLowerCase().includes('neerja') || v.name.toLowerCase().includes('heera') : v.name.toLowerCase().includes('prabhat') || v.name.toLowerCase().includes('mohan')) ||
        v.name.toLowerCase().includes('natural')
      );

      if (hasTeluguScript && teluguVoice) {
        chosenVoice = teluguVoice;
      } else if (naturalIndianVoice) {
        chosenVoice = naturalIndianVoice;
      } else if (indianVoices.length > 0) {
        chosenVoice = isFemale
          ? indianVoices.find((v) => v.name.toLowerCase().includes('female')) || indianVoices[0]
          : indianVoices[0];
      } else if (teluguVoice) {
        chosenVoice = teluguVoice;
      }
    } else if (nativeLanguage === 'Hindi' || hasDevanagari) {
      const hindiVoice = voices.find((v) => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'));
      const indianVoice = voices.find((v) => v.lang.startsWith('en-IN'));
      if (hasDevanagari && hindiVoice) chosenVoice = hindiVoice;
      else chosenVoice = hindiVoice || indianVoice || null;
    } else if (nativeLanguage === 'Tamil' || hasTamilScript) {
      chosenVoice = voices.find((v) => v.lang.startsWith('ta')) || voices.find((v) => v.lang.startsWith('en-IN')) || null;
    } else if (nativeLanguage === 'Kannada' || hasKannadaScript) {
      chosenVoice = voices.find((v) => v.lang.startsWith('kn')) || voices.find((v) => v.lang.startsWith('en-IN')) || null;
    }

    // Fallback: Natural English voice
    if (!chosenVoice) {
      const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
      const naturalVoice = englishVoices.find((v) => v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('google'));

      if (isFemale) {
        chosenVoice =
          naturalVoice ||
          englishVoices.find(
            (v) =>
              v.name.toLowerCase().includes('female') ||
              v.name.toLowerCase().includes('zira') ||
              v.name.toLowerCase().includes('samantha') ||
              v.name.toLowerCase().includes('karen')
          ) ||
          englishVoices[0];
      } else {
        chosenVoice =
          naturalVoice ||
          englishVoices.find(
            (v) =>
              v.name.toLowerCase().includes('male') ||
              v.name.toLowerCase().includes('david') ||
              v.name.toLowerCase().includes('alex') ||
              v.name.toLowerCase().includes('george')
          ) ||
          englishVoices[0];
      }
    }

    if (chosenVoice) {
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang;
    }

    // Mouth movement simulator interval
    let mouthInterval: any = null;

    utterance.onstart = () => {
      if (onStart) onStart();
      if (onMouthMove) {
        mouthInterval = setInterval(() => {
          // generate natural speech envelope rhythm
          const wave = 0.3 + Math.random() * 0.7;
          onMouthMove(wave);
        }, 120);
      }
    };

    utterance.onend = () => {
      if (mouthInterval) clearInterval(mouthInterval);
      if (onMouthMove) onMouthMove(0);
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      if (mouthInterval) clearInterval(mouthInterval);
      if (onMouthMove) onMouthMove(0);
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  // Instantly cancel any active speech (user interruption handling)
  public stopSpeaking() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    if (typeof window === 'undefined' || !window.speechSynthesis) return false;
    return window.speechSynthesis.speaking;
  }

  private activeHandlers: SpeechRecognitionHandlers | null = null;
  private currentLangCode: string = 'en-IN';
  private shouldKeepListening: boolean = false;
  private restartTimeout: any = null;

  // Start speech recognition with automatic Voice Activity Detection & interruption
  public startListening(handlers: SpeechRecognitionHandlers, langCode: string = 'en-IN') {
    this.shouldKeepListening = true;
    this.activeHandlers = handlers;
    this.currentLangCode = langCode || 'en-IN';

    // Safely cleanup previous recognition instance if active
    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.abort();
      } catch (e) {}
      this.recognition = null;
    }
    this.isListening = false;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      if (handlers.onError) {
        handlers.onError(
          'Web Speech API not supported in this browser. You can type or use the microphone input.'
        );
      }
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.currentLangCode;

      let accumulatedFinal = '';

      this.recognition.onstart = () => {
        this.isListening = true;
        if (handlers.onStart) handlers.onStart();
      };

      this.recognition.onresult = (event: any) => {
        // Automatically stop active AI TTS if user interrupts and speaks
        if (handlers.onUserSpeakingDetected) {
          handlers.onUserSpeakingDetected();
        }

        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            accumulatedFinal += ' ' + event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentStream = (accumulatedFinal + ' ' + interim).trim();
        if (currentStream && handlers.onInterimResult) {
          handlers.onInterimResult(currentStream);
        }

        // Fast silence detection: when user finishes speaking (650ms pause), finalize turn
        if (this.silenceTimer) clearTimeout(this.silenceTimer);
        this.silenceTimer = setTimeout(() => {
          const finalizedText = (accumulatedFinal + ' ' + interim).trim();
          if (finalizedText && handlers.onFinalResult) {
            accumulatedFinal = '';
            handlers.onFinalResult(finalizedText);
          }
        }, 650);
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        this.isListening = false;
        if (event.error !== 'no-speech' && handlers.onError) {
          handlers.onError(event.error);
        }
        // Auto-recover continuous listening loop on transient notices
        if (this.shouldKeepListening) {
          if (this.restartTimeout) clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (this.shouldKeepListening && !this.isListening && this.activeHandlers) {
              this.startListening(this.activeHandlers, this.currentLangCode);
            }
          }, 200);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (handlers.onEnd) handlers.onEnd();
        // Seamless background restart if session remains active
        if (this.shouldKeepListening) {
          if (this.restartTimeout) clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (this.shouldKeepListening && !this.isListening && this.activeHandlers) {
              this.startListening(this.activeHandlers, this.currentLangCode);
            }
          }, 150);
        }
      };

      this.recognition.start();
    } catch (err: any) {
      console.warn('Failed to start speech recognition:', err);
      this.isListening = false;
      if (handlers.onError) handlers.onError(err.message || 'Microphone error');
    }
  }

  // Update recognition language dynamically
  public setLanguage(langCode: string) {
    if (!langCode) return;
    const isDifferent = this.currentLangCode !== langCode;
    this.currentLangCode = langCode;

    if (isDifferent && this.recognition && this.isListening) {
      console.log(`[MIC] Switching recognition language to: ${langCode}`);
      try {
        this.recognition.lang = langCode;
      } catch (e) {
        // If browser requires restart to change language
        if (this.activeHandlers) {
          this.startListening(this.activeHandlers, langCode);
        }
      }
    }
  }

  public getLanguage(): string {
    return this.currentLangCode;
  }

  // Ensure recognition is actively capturing speech without interruption
  public ensureListening(handlers?: SpeechRecognitionHandlers, langCode?: string) {
    this.shouldKeepListening = true;
    if (handlers) this.activeHandlers = handlers;
    if (langCode && langCode !== this.currentLangCode) {
      this.currentLangCode = langCode;
      if (this.recognition) {
        try {
          this.recognition.lang = langCode;
        } catch (e) {}
      }
    }

    if (!this.isListening && this.activeHandlers) {
      console.log('[MIC] ensureListening: Resuming active listening loop in ' + this.currentLangCode + '...');
      this.startListening(this.activeHandlers, this.currentLangCode);
    }
  }

  // Stop listening permanently (on user pause or end of session)
  public stopListening() {
    this.shouldKeepListening = false;
    if (this.restartTimeout) clearTimeout(this.restartTimeout);
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
    this.isListening = false;
  }

  // Audio waveform visualizer stream with Noise Suppression & Auto Gain Control
  public async initMicrophoneWaveform(
    onVolumeChange: (volume: number, freqData?: any) => void
  ): Promise<boolean> {
    try {
      if (this.mediaStream) return true;
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!this.analyser || !this.dataArray) return;
        this.analyser.getByteFrequencyData(this.dataArray);
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
          sum += this.dataArray[i];
        }
        const avg = sum / this.dataArray.length;
        const normalized = Math.min(1, avg / 128);
        onVolumeChange(normalized, this.dataArray);
        this.animFrameId = requestAnimationFrame(checkVolume);
      };

      checkVolume();
      return true;
    } catch (err) {
      console.warn('Microphone stream access not granted:', err);
      return false;
    }
  }

  public cleanupAudioStream() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const speechService = new SpeechService();
