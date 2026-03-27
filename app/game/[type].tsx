import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useLevel } from '../../src/presentation/hooks/useLevel';
import DragDropGame from '../../src/presentation/components/DragDropGame';
import SelectionGame from '../../src/presentation/components/SelectionGame';
import RepeatGame from '../../src/presentation/components/RepeatGame';
import { useGameStore } from '../../src/presentation/stores/gameStore';
import { unlockNextLevel } from '../../src/core/usecases/UnlockNextLevel';

const GAME_ORDER = ['drag-drop', 'selection', 'repeat'] as const;
type GameType = typeof GAME_ORDER[number];

export default function GameScreen() {
  const { type, levelId } = useLocalSearchParams<{ type: string; levelId: string }>();
  const router = useRouter();
  const id = parseInt(levelId, 10);
  const level = useLevel(id);
  const { progress, saveProgress } = useGameStore();

  if (!level) {
    return (
      <View style={styles.center}>
        <Text>Nivel no encontrado</Text>
      </View>
    );
  }

  const handleGameComplete = async () => {
    const currentIndex = GAME_ORDER.indexOf(type as GameType);
    const nextGame = GAME_ORDER[currentIndex + 1];

    if (nextGame) {
      router.replace(`/game/${nextGame}?levelId=${id}`);
    } else {
      // All games done — unlock next level
      const updated = unlockNextLevel(id, progress);
      await saveProgress(updated);
      router.replace('/');
    }
  };

  if (type === 'drag-drop') {
    return <DragDropGame level={level} onComplete={handleGameComplete} />;
  }
  if (type === 'selection') {
    return <SelectionGame level={level} onComplete={handleGameComplete} />;
  }
  if (type === 'repeat') {
    return <RepeatGame level={level} onComplete={handleGameComplete} />;
  }

  return (
    <View style={styles.center}>
      <Text>Juego desconocido</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
