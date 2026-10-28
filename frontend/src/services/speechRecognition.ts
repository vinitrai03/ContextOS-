// Fallback/typings for SpeechRecognition
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;
  private onSegmentCallback: ((segment: string, isFinal: boolean) => void) | null = null;
  private lastStartTime: number = 0;

  constructor() {
    if (SpeechRecognitionAPI) {
      this.recognition = new SpeechRecognitionAPI();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

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

        if (this.onSegmentCallback) {
          if (finalTranscript) {
            this.onSegmentCallback(finalTranscript, true);
          }
          if (interimTranscript) {
            this.onSegmentCallback(interimTranscript, false);
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          this.stop();
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          // Restart if it stopped unexpectedly while it should be listening
          try {
            this.recognition.start();
          } catch (e) {
             console.error("Failed to restart speech recognition", e);
          }
        }
      };
    } else {
      console.warn('SpeechRecognition API not supported in this browser.');
    }
  }

  setLanguage(lang: string) {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  start(onSegment: (segment: string, isFinal: boolean) => void) {
    if (!this.recognition) return false;
    this.onSegmentCallback = onSegment;
    if (!this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
        this.lastStartTime = Date.now();
        return true;
      } catch (e) {
        console.error('Failed to start speech recognition', e);
        return false;
      }
    }
    return true;
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
    }
  }
}

export const speechService = new SpeechRecognitionService();
