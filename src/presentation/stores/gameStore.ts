import { create } from 'zustand';
import { UserProgress, DEFAULT_PROGRESS } from '../../core/entities/UserProgress';
import { Level } from '../../core/entities/Level';
import { AsyncStorageProgressRepository } from '../../infrastructure/storage/AsyncStorageProgressRepository';

const repo = new AsyncStorageProgressRepository();

interface GameStore {
  progress: UserProgress;
  currentLevel: Level | null;
  isLoading: boolean;
  loadProgress: () => Promise<void>;
  saveProgress: (progress: UserProgress) => Promise<void>;
  setCurrentLevel: (level: Level) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  progress: DEFAULT_PROGRESS,
  currentLevel: null,
  isLoading: true,

  loadProgress: async () => {
    set({ isLoading: true });
    const progress = await repo.load();
    set({ progress, isLoading: false });
  },

  saveProgress: async (progress: UserProgress) => {
    await repo.save(progress);
    set({ progress });
  },

  setCurrentLevel: (level: Level) => set({ currentLevel: level }),
}));
