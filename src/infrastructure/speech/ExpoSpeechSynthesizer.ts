import * as Speech from 'expo-speech';
import { SpeechSynthesizer } from '../../core/ports/SpeechSynthesizer';
import { SPEECH_RATE, SPEECH_LANGUAGE } from '../../shared/constants';

export class ExpoSpeechSynthesizer implements SpeechSynthesizer {
  async speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      Speech.speak(text, {
        language: SPEECH_LANGUAGE,
        rate: SPEECH_RATE,
        onDone: resolve,
        onError: () => resolve(),
      });
    });
  }

  stop(): void {
    Speech.stop();
  }
}
