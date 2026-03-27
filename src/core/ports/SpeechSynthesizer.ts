export interface SpeechSynthesizer {
  speak(text: string): Promise<void>;
  stop(): void;
}
