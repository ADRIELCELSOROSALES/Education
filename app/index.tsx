import { useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useProgress } from '../src/presentation/hooks/useProgress';
import { useSpeech } from '../src/presentation/hooks/useSpeech';
import { getAllLevels } from '../src/presentation/hooks/useLevel';
import { TOTAL_LEVELS } from '../src/shared/constants';

const WELCOME_MESSAGE =
  'Bienvenido a Lectura Fácil. Toca un nivel para comenzar. Los niveles bloqueados se abren al completar el anterior.';

export default function HomeScreen() {
  const router = useRouter();
  const { progress, isLoading } = useProgress();
  const { speak } = useSpeech();
  const levels = getAllLevels();

  useEffect(() => {
    if (!isLoading) {
      speak(WELCOME_MESSAGE);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  const isUnlocked = (levelId: number) =>
    levelId === 1 || progress.completedLevels.includes(levelId - 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lectura Fácil</Text>
      <Text style={styles.subtitle}>Nivel actual: {progress.currentLevel}</Text>

      <FlatList
        data={levels}
        keyExtractor={(item) => String(item.id)}
        numColumns={3}
        renderItem={({ item }) => {
          const unlocked = isUnlocked(item.id);
          const completed = progress.completedLevels.includes(item.id);
          return (
            <TouchableOpacity
              style={[styles.levelBtn, completed && styles.completed, !unlocked && styles.locked]}
              disabled={!unlocked}
              onPress={() => router.push(`/level/${item.id}`)}
            >
              <Text style={styles.levelText}>{item.id}</Text>
              {completed && <Text style={styles.check}>✓</Text>}
              {!unlocked && <Text style={styles.lock}>🔒</Text>}
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        style={styles.continueBtn}
        onPress={() => router.push(`/level/${progress.currentLevel}`)}
      >
        <Text style={styles.continueTxt}>Continuar Nivel {progress.currentLevel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F8FF', padding: 20, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2C3E50', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#7F8C8D', textAlign: 'center', marginBottom: 24 },
  levelBtn: {
    flex: 1, margin: 6, aspectRatio: 1, borderRadius: 12,
    backgroundColor: '#4A90D9', justifyContent: 'center', alignItems: 'center',
    maxWidth: 90,
  },
  completed: { backgroundColor: '#27AE60' },
  locked: { backgroundColor: '#BDC3C7' },
  levelText: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  check: { fontSize: 12, color: '#fff' },
  lock: { fontSize: 14 },
  continueBtn: {
    backgroundColor: '#E67E22', padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 16,
  },
  continueTxt: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
