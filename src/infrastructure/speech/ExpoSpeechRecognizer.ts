import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { SpeechRecognizer } from '../../core/ports/SpeechRecognizer';

export class ExpoSpeechRecognizer implements SpeechRecognizer {
  private resultCallback: ((text: string) => void) | null = null;
  private errorCallback: ((error: string) => void) | null = null;

  async startListening(): Promise<void> {
    await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    ExpoSpeechRecognitionModule.start({ lang: 'es-ES', interimResults: false });
  }

  async stopListening(): Promise<void> {
    ExpoSpeechRecognitionModule.stop();
  }

  onResult(callback: (text: string) => void): void {
    this.resultCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.errorCallback = callback;
  }
}
