import { Syllable } from './Syllable';

export interface Level {
  id: number;
  syllables: Syllable[];
  targetWord: string;
  instruction: string;
}
