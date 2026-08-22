import type { TranscriptEvent } from '../types/transcript';

export interface SpeechToTextAdapter {
  start(
    sessionId: string,
    senderId: string,
    senderName: string,
    senderType: 'COMMON_USER' | 'ACCESSIBILITY_USER',
    callback: (event: TranscriptEvent) => void
  ): void;
  stop(): void;
}

export class WebSpeechSTTAdapter implements SpeechToTextAdapter {
  private recognition: any = null;
  private isRunning: boolean = false;
  private shouldBeListening: boolean = false;
  private callback: ((event: TranscriptEvent) => void) | null = null;
  private sessionId: string = '';
  private senderId: string = '';
  private senderName: string = '';
  private senderType: 'COMMON_USER' | 'ACCESSIBILITY_USER' = 'COMMON_USER';
  private restartTimeout: any = null;

  start(
    sessionId: string,
    senderId: string,
    senderName: string,
    senderType: 'COMMON_USER' | 'ACCESSIBILITY_USER',
    callback: (event: TranscriptEvent) => void
  ): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[SignBridge Debug] Web Speech API is not supported in this browser.');
      return;
    }

    this.sessionId = sessionId;
    this.senderId = senderId;
    this.senderName = senderName;
    this.senderType = senderType;
    this.callback = callback;
    this.shouldBeListening = true;

    // If recognition is already actively running, just update the metadata and return
    if (this.isRunning && this.recognition) {
      return;
    }

    this.initAndStartRecognition();
  }

  private initAndStartRecognition(): void {
    if (!this.shouldBeListening) return;

    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.abort();
      } catch (e) {
        // Ignore
      }
      this.recognition = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        this.isRunning = true;
      };

      recognition.onerror = (event: any) => {
        const err = event?.error;
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          console.warn('[SignBridge STT] Microphone permission denied.');
          this.shouldBeListening = false;
          this.isRunning = false;
        }
      };

      recognition.onend = () => {
        this.isRunning = false;
        // If user still has mic ON, smoothly resume recognition after browser pause
        if (this.shouldBeListening && this.callback) {
          this.restartTimeout = setTimeout(() => {
            if (this.shouldBeListening && !this.isRunning) {
              this.initAndStartRecognition();
            }
          }, 300);
        }
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item && item[0]) {
            if (item.isFinal) {
              finalTranscript += item[0].transcript;
            } else {
              interimTranscript += item[0].transcript;
            }
          }
        }

        const text = (finalTranscript || interimTranscript).trim();
        if (!text) return;

        const isFinal = Boolean(finalTranscript);
        const confidence = event.results[event.results.length - 1]?.[0]?.confidence || 0.95;
        const eventId = `${this.sessionId}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

        const transcriptEvent: TranscriptEvent = {
          id: eventId,
          sessionId: this.sessionId,
          senderId: this.senderId,
          senderName: this.senderName,
          senderType: this.senderType,
          text,
          isFinal,
          timestamp: Date.now(),
          confidence,
        };

        if (this.callback) {
          this.callback(transcriptEvent);
        }
      };

      this.recognition = recognition;
      recognition.start();
    } catch (e: any) {
      console.warn('[SignBridge STT] Start attempt note:', e?.message || e);
      if (this.shouldBeListening) {
        this.restartTimeout = setTimeout(() => {
          if (this.shouldBeListening && !this.isRunning) {
            this.initAndStartRecognition();
          }
        }, 800);
      }
    }
  }

  stop(): void {
    this.shouldBeListening = false;
    this.isRunning = false;
    this.callback = null;

    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }

    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.stop();
      } catch (e) {
        // Ignore
      }
      this.recognition = null;
    }
  }
}

export class SpeechToTextService {
  private static instance: SpeechToTextService | null = null;
  private adapter: SpeechToTextAdapter;

  private constructor() {
    this.adapter = new WebSpeechSTTAdapter();
  }

  public static getInstance(): SpeechToTextService {
    if (!SpeechToTextService.instance) {
      SpeechToTextService.instance = new SpeechToTextService();
    }
    return SpeechToTextService.instance;
  }

  public isSupported(): boolean {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    return !!SpeechRecognition;
  }

  public startRecording(
    sessionId: string,
    senderId: string,
    senderName: string,
    senderType: 'COMMON_USER' | 'ACCESSIBILITY_USER',
    callback: (event: TranscriptEvent) => void
  ): void {
    this.adapter.start(sessionId, senderId, senderName, senderType, callback);
  }

  public stopRecording(): void {
    this.adapter.stop();
  }
}
export default SpeechToTextService;
