import { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';

export function useProgress() {
  const { progress, isLoading, loadProgress, saveProgress } = useGameStore();

  useEffect(() => {
    loadProgress();
  }, []);

  return { progress, isLoading, saveProgress };
}
