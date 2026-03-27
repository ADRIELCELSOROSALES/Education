import { UserProgress } from '../entities/UserProgress';

export function unlockNextLevel(completedLevelId: number, progress: UserProgress): UserProgress {
  if (progress.completedLevels.includes(completedLevelId)) {
    return progress;
  }
  return {
    ...progress,
    completedLevels: [...progress.completedLevels, completedLevelId],
    currentLevel: completedLevelId + 1,
  };
}
