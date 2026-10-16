/**
 * Browser Speech Recognition and Speech Synthesis Service
 * Supports Marathi (mr-IN) and English (en-IN) for Indian farmers.
 */

class VoiceService {
  private recognition: any = null;
  private isRecognitionSupported: boolean = false;
  private isSpeaking: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.isRecognitionSupported = true;
      }
    }
  }

  public isSupported(): boolean {
    return this.isRecognitionSupported;
  }

  private initAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
  }

  /**
   * Gentle audio chime for button tap / start listening
   */
  public playChime(type: 'start' | 'stop' | 'success') {
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      if (type === 'start') {
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'stop') {
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else {
        // Success chime
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {
      // AudioContext not allowed before interaction
    }
  }

  /**
   * Listen for user speech in Marathi or English
   */
  public startListening(
    lang: 'mr' | 'en',
    onResult: (text: string, isFinal: boolean) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser.');
      return false;
    }

    try {
      this.stopSpeaking();
      this.playChime('start');

      this.recognition.lang = lang === 'mr' ? 'mr-IN' : 'en-IN';

      this.recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          onResult(final.trim(), true);
        } else if (interim) {
          onResult(interim.trim(), false);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          onError(event.error);
        }
      };

      this.recognition.onend = () => {
        this.playChime('stop');
        onEnd();
      };

      this.recognition.start();
      return true;
    } catch (e: any) {
      onError(e.message || 'Failed to start microphone');
      return false;
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Already stopped
      }
    }
  }

  /**
   * Read aloud assistant response using browser speech synthesis
   */
  public speak(
    text: string,
    lang: 'mr' | 'en',
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    this.stopSpeaking();

    // Clean any markdown formatting for smooth speech
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#+\s*/g, '')
      .replace(/[•\-\*]\s+/g, '')
      .replace(/₹\s*([0-9,]+)/g, '$1 रुपये')
      .replace(/₹/g, ' रुपये ')
      .replace(/APMC/gi, 'बाजार समिती')
      .replace(/[\n\r]+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'mr' ? 'mr-IN' : 'en-IN';
    utterance.rate = lang === 'mr' ? 0.95 : 1.0; // Slightly slower for clarity
    utterance.pitch = 1.0;

    // Pick best available voice
    const voices = window.speechSynthesis.getVoices();
    if (lang === 'mr') {
      const marathiVoice = voices.find(v => v.lang.includes('mr') || v.name.toLowerCase().includes('marathi'));
      const hindiVoice = voices.find(v => v.lang.includes('hi') || v.name.toLowerCase().includes('hindi'));
      const indianVoice = voices.find(v => v.lang.includes('IN'));
      if (marathiVoice) {
        utterance.voice = marathiVoice;
      } else if (hindiVoice) {
        // Hindi TTS has excellent Devanagari pronunciation fallback
        utterance.voice = hindiVoice;
      } else if (indianVoice) {
        utterance.voice = indianVoice;
      }
    } else {
      const indianEnVoice = voices.find(v => v.lang === 'en-IN' || v.name.includes('India'));
      if (indianEnVoice) {
        utterance.voice = indianEnVoice;
      }
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const voiceService = new VoiceService();
