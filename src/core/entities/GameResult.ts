export type GameType = 'drag-drop' | 'selection' | 'repeat';

export interface GameResult {
  levelId: number;
  gameType: GameType;
  passed: boolean;
  errors: number;
}
