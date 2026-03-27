import { UserProgress } from '../entities/UserProgress';

export interface ProgressRepository {
  load(): Promise<UserProgress>;
  save(progress: UserProgress): Promise<void>;
}
