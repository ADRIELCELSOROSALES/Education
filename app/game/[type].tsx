import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLevel } from '../../src/presentation/hooks/useLevel';
import DragDropGame from '../../src/presentation/components/DragDropGame';
import SelectionGame from '../../src/presentation/components/SelectionGame';
import RepeatGame from '../../src/presentation/components/RepeatGame';
import { useGameStore } from '../../src/presentation/stores/gameStore';
import { unlockNextLevel } from '../../src/core/usecases/UnlockNextLevel';

const GAME_ORDER = ['drag-drop', 'selection', 'repeat'] as const;
type GameType = typeof GAME_ORDER[number];

const GAME_LABELS: Record<GameType, string> = {
  'drag-drop': 'Formar palabra',
  'selection': 'Reconocer sílaba',
  'repeat': 'Repetir en voz alta',
};

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

  const currentIndex = GAME_ORDER.indexOf(type as GameType);

  const handleGameComplete = async () => {
    const nextGame = GAME_ORDER[currentIndex + 1];
    if (nextGame) {
      router.replace(`/game/${nextGame}?levelId=${id}`);
    } else {
      const updated = unlockNextLevel(id, progress);
      await saveProgress(updated);
      router.replace(`/level-complete?levelId=${id}`);
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/')}>
          <Text style={styles.backTxt}>← Inicio</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.levelLabel}>Nivel {id}</Text>
          <Text style={styles.gameLabel}>{GAME_LABELS[type as GameType] ?? type}</Text>
        </View>
        <View style={styles.dots}>
          {GAME_ORDER.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentIndex && styles.dotActive, i < currentIndex && styles.dotDone]}
            />
          ))}
        </View>
      </View>

      {/* Game content */}
      {type === 'drag-drop' && <DragDropGame level={level} onComplete={handleGameComplete} />}
      {type === 'selection' && <SelectionGame level={level} onComplete={handleGameComplete} />}
      {type === 'repeat' && <RepeatGame level={level} onComplete={handleGameComplete} />}
      {!['drag-drop', 'selection', 'repeat'].includes(type) && (
        <View style={styles.center}><Text>Juego desconocido</Text></View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F0F8FF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8ECF0',
  },
  backBtn: { padding: 8 },
  backTxt: { fontSize: 16, color: '#4A90D9', fontWeight: '600' },
  headerCenter: { alignItems: 'center' },
  levelLabel: { fontSize: 12, color: '#95A5A6', textTransform: 'uppercase', letterSpacing: 1 },
  gameLabel: { fontSize: 16, fontWeight: 'bold', color: '#2C3E50' },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#D5DBDB' },
  dotActive: { backgroundColor: '#4A90D9', width: 14 },
  dotDone: { backgroundColor: '#27AE60' },
});
