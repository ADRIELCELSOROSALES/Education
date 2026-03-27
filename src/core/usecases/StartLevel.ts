import { Level } from '../entities/Level';
import { UserProgress } from '../entities/UserProgress';

export function canStartLevel(levelId: number, progress: UserProgress): boolean {
  if (levelId === 1) return true;
  return progress.completedLevels.includes(levelId - 1);
}

export function startLevel(level: Level, progress: UserProgress): UserProgress {
  return { ...progress, currentLevel: level.id };
}
