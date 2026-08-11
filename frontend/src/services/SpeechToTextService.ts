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
  private callback: ((event: TranscriptEvent) => void) | null = null;
  private sessionId: string = '';
  private senderId: string = '';
  private senderName: string = '';
  private senderType: 'COMMON_USER' | 'ACCESSIBILITY_USER' = 'COMMON_USER';

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

    if (this.isRunning) {
      this.stop();
    }

    this.sessionId = sessionId;
    this.senderId = senderId;
    this.senderName = senderName;
    this.senderType = senderType;
    this.callback = callback;

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isRunning = true;
        if (import.meta.env.DEV) {
          console.log('[SignBridge Debug] STT started');
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('[SignBridge Debug] Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          console.warn('[SignBridge Debug] Microphone permission denied for speech recognition.');
        }
      };

      this.recognition.onend = () => {
        this.isRunning = false;
        if (import.meta.env.DEV) {
          console.log('[SignBridge Debug] STT stopped');
        }
        // Auto-restart only if we were not intentionally stopped
        if (this.callback) {
          if (import.meta.env.DEV) {
            console.log('[SignBridge Debug] STT ended unexpectedly. Restarting...');
          }
          this.restart();
        }
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        if (!text.trim()) return;

        const isFinal = !!finalTranscript;
        const confidence = event.results[event.results.length - 1][0].confidence || 1.0;
        const eventId = `${this.sessionId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const transcriptEvent: TranscriptEvent = {
          id: eventId,
          sessionId: this.sessionId,
          senderId: this.senderId,
          senderName: this.senderName,
          senderType: this.senderType,
          text: text.trim(),
          isFinal,
          timestamp: Date.now(),
          confidence,
        };

        if (this.callback) {
          this.callback(transcriptEvent);
        }
      };

      this.recognition.start();
    } catch (e) {
      console.error('[SignBridge Debug] Failed to start speech recognition:', e);
    }
  }

  private restart(): void {
    if (this.callback && !this.isRunning) {
      setTimeout(() => {
        if (this.callback && !this.isRunning) {
          this.start(this.sessionId, this.senderId, this.senderName, this.senderType, this.callback);
        }
      }, 1000);
    }
  }

  stop(): void {
    this.callback = null;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore
      }
      this.recognition = null;
    }
    this.isRunning = false;
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
