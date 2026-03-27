import levels from '../../infrastructure/content/levels.json';
import { Level } from '../../core/entities/Level';

export function useLevel(id: number): Level | null {
  return (levels as Level[]).find((l) => l.id === id) ?? null;
}

export function getAllLevels(): Level[] {
  return levels as Level[];
}
