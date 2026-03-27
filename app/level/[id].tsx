import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLevel } from '../../src/presentation/hooks/useLevel';
import { useSpeech } from '../../src/presentation/hooks/useSpeech';
import { Syllable } from '../../src/core/entities/Syllable';

export default function LevelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const levelId = parseInt(id, 10);
  const level = useLevel(levelId);
  const { speak } = useSpeech();
  const router = useRouter();
  const [phase, setPhase] = useState<'instruction' | 'syllables' | 'ready'>('instruction');

  useEffect(() => {
    if (!level) return;
    const init = async () => {
      await speak(level.instruction);
      setPhase('syllables');
      for (const syl of level.syllables) {
        await speak(syl.text);
      }
      setPhase('ready');
    };
    init();
  }, [level?.id]);

  if (!level) {
    return (
      <View style={styles.center}>
        <Text>Nivel no encontrado</Text>
      </View>
    );
  }

  const handleSyllablePress = async (syl: Syllable) => {
    await speak(syl.text);
  };

  const startGames = () => {
    router.push(`/game/drag-drop?levelId=${levelId}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.levelLabel}>Nivel {level.id}</Text>
      <Text style={styles.word}>{level.targetWord}</Text>

      <View style={styles.syllablesRow}>
        {level.syllables.map((syl) => (
          <TouchableOpacity
            key={syl.id}
            style={styles.sylCard}
            onPress={() => handleSyllablePress(syl)}
          >
            <Text style={styles.sylText}>{syl.text}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {phase === 'instruction' && (
        <Text style={styles.status}>Escuchando instrucciones...</Text>
      )}
      {phase === 'syllables' && (
        <Text style={styles.status}>Escucha las sílabas...</Text>
      )}
      {phase === 'ready' && (
        <TouchableOpacity style={styles.startBtn} onPress={startGames}>
          <Text style={styles.startTxt}>Comenzar juegos</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F0F8FF', alignItems: 'center', padding: 24, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  levelLabel: { fontSize: 18, color: '#7F8C8D', marginBottom: 8 },
  word: { fontSize: 48, fontWeight: 'bold', color: '#2C3E50', marginBottom: 32, letterSpacing: 4 },
  syllablesRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  sylCard: {
    width: 90, height: 90, borderRadius: 16,
    backgroundColor: '#4A90D9', justifyContent: 'center', alignItems: 'center',
    elevation: 4,
  },
  sylText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  status: { fontSize: 16, color: '#95A5A6', fontStyle: 'italic', marginTop: 16 },
  startBtn: {
    backgroundColor: '#27AE60', padding: 18, borderRadius: 14,
    alignItems: 'center', width: '80%', marginTop: 16,
  },
  startTxt: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
});
