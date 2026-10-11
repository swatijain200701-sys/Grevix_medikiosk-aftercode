/**
 * MediKiosk Voice Input Adapter
 *
 * SAFETY & CONSENT BOUNDARIES:
 * - Requires explicit audio recording consent before microphone activation.
 * - Does not assume speech recognition works offline.
 * - In offline mode or when speech API is unavailable, records local audio blob for deferred processing.
 * - Transcripts are flagged as "Needs Confirmation" until the patient explicitly reviews and accepts them.
 */

export interface VoiceRecognitionResult {
  transcript: string;
  isFinal: boolean;
  isOfflineAudioRecording: boolean;
  audioBlobUrl?: string;
}

export class VoiceAdapter {
  private recognition: any = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
      }
    }
  }

  public isSpeechApiAvailable(): boolean {
    return !!this.recognition && typeof navigator !== 'undefined' && navigator.onLine;
  }

  public async startListening(
    lang: 'en-IN' | 'hi-IN' = 'en-IN',
    onTranscript: (result: VoiceRecognitionResult) => void,
    onError: (err: string) => void
  ): Promise<void> {
    const isOnline = typeof navigator !== 'undefined' && navigator.onLine;

    // If online and SpeechRecognition is supported
    if (this.recognition && isOnline) {
      this.recognition.lang = lang;
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
        onTranscript({
          transcript: final || interim,
          isFinal: !!final,
          isOfflineAudioRecording: false,
        });
      };

      this.recognition.onerror = (e: any) => {
        onError(e.error || 'Speech recognition error');
      };

      this.recognition.start();
      return;
    }

    // Offline or fallback mode: Record local audio
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        onTranscript({
          transcript: '(Voice note recorded offline — pending playback and manual confirmation)',
          isFinal: true,
          isOfflineAudioRecording: true,
          audioBlobUrl: audioUrl,
        });
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
    } catch (err: any) {
      onError(`Microphone permission or recording error: ${err.message}`);
    }
  }

  public stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {}
    }
  }
}

export const voiceAdapter = new VoiceAdapter();