export interface SpeechRecognizer {
  startListening(): Promise<void>;
  stopListening(): Promise<void>;
  onResult(callback: (text: string) => void): void;
  onError(callback: (error: string) => void): void;
}
