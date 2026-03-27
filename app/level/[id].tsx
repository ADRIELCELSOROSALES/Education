import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLevel } from '../../src/presentation/hooks/useLevel';
import { useSpeech } from '../../src/presentation/hooks/useSpeech';
import { Syllable } from '../../src/core/entities/Syllable';
import AudioButton from '../../src/presentation/components/AudioButton';

export default function LevelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const levelId = parseInt(id, 10);
  const level = useLevel(levelId);
  const { speak, stop } = useSpeech();
  const router = useRouter();
  const [phase, setPhase] = useState<'instruction' | 'syllables' | 'ready'>('instruction');

  useEffect(() => {
    if (!level) return;
    let cancelled = false;
    const init = async () => {
      await speak(level.instruction);
      if (cancelled) return;
      setPhase('syllables');
      for (const syl of level.syllables) {
        if (cancelled) return;
        await speak(syl.text);
      }
      if (!cancelled) setPhase('ready');
    };
    init();
    return () => { cancelled = true; stop(); };
  }, [level?.id]);

  if (!level) {
    return (
      <View style={styles.center}>
        <Text>Nivel no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { stop(); router.replace('/'); }}>
          <Text style={styles.back}>← Inicio</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nivel {level.id}</Text>
        <View style={{ width: 60 }} />
      </View>

      <Text style={styles.word}>{level.targetWord}</Text>

      {/* Syllable cards — tap to hear */}
      <View style={styles.syllablesRow}>
        {level.syllables.map((syl: Syllable) => (
          <TouchableOpacity
            key={syl.id}
            style={styles.sylCard}
            onPress={() => speak(syl.text)}
          >
            <Text style={styles.sylText}>{syl.text}</Text>
            <Text style={styles.sylHint}>toca para escuchar</Text>
          </TouchableOpacity>
        ))}
      </View>

      <AudioButton
        text={level.instruction}
        label="🔊 Repetir instrucción"
        size="sm"
      />

      {phase === 'instruction' && (
        <Text style={styles.status}>Escuchando instrucciones...</Text>
      )}
      {phase === 'syllables' && (
        <Text style={styles.status}>Escucha las sílabas...</Text>
      )}
      {phase === 'ready' && (
        <TouchableOpacity style={styles.startBtn} onPress={() => router.push(`/game/drag-drop?levelId=${levelId}`)}>
          <Text style={styles.startTxt}>¡Comenzar juegos!</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F0F8FF', alignItems: 'center', padding: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', paddingTop: 48, paddingBottom: 16,
  },
  back: { fontSize: 16, color: '#4A90D9', fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#2C3E50' },
  word: { fontSize: 52, fontWeight: 'bold', color: '#2C3E50', letterSpacing: 6, marginVertical: 24 },
  syllablesRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  sylCard: {
    width: 100, borderRadius: 16,
    backgroundColor: '#4A90D9', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 18, elevation: 4,
  },
  sylText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  sylHint: { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  status: { fontSize: 16, color: '#95A5A6', fontStyle: 'italic', marginTop: 20 },
  startBtn: {
    backgroundColor: '#27AE60', padding: 20, borderRadius: 14,
    alignItems: 'center', width: '80%', marginTop: 32, elevation: 4,
  },
  startTxt: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
});
