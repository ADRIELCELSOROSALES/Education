import { GameResult } from '../entities/GameResult';
import { UserProgress } from '../entities/UserProgress';

export function recordGameResult(result: GameResult, progress: UserProgress): UserProgress {
  if (!result.passed) {
    return { ...progress, totalErrors: progress.totalErrors + result.errors };
  }
  return progress;
}
