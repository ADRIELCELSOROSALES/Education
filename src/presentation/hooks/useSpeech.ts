import { useRef, useCallback } from 'react';
import { ExpoSpeechSynthesizer } from '../../infrastructure/speech/ExpoSpeechSynthesizer';

const synthesizer = new ExpoSpeechSynthesizer();

export function useSpeech() {
  const speak = useCallback(async (text: string) => {
    await synthesizer.speak(text);
  }, []);

  const stop = useCallback(() => {
    synthesizer.stop();
  }, []);

  return { speak, stop };
}
