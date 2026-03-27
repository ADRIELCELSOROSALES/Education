import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, DEFAULT_PROGRESS } from '../../core/entities/UserProgress';
import { ProgressRepository } from '../../core/ports/ProgressRepository';
import { STORAGE_KEY } from '../../shared/constants';

export class AsyncStorageProgressRepository implements ProgressRepository {
  async load(): Promise<UserProgress> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    return JSON.parse(raw) as UserProgress;
  }

  async save(progress: UserProgress): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }
}
