export interface UserProgress {
  name: string;
  currentLevel: number;
  completedLevels: number[];
  totalErrors: number;
}

export const DEFAULT_PROGRESS: UserProgress = {
  name: 'Usuario',
  currentLevel: 1,
  completedLevels: [],
  totalErrors: 0,
};
