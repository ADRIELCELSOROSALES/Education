import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSpeech } from '../src/presentation/hooks/useSpeech';

export default function LevelCompleteScreen() {
  const { levelId } = useLocalSearchParams<{ levelId: string }>();
  const router = useRouter();
  const { speak } = useSpeech();
  const id = parseInt(levelId, 10);

  useEffect(() => {
    speak(`¡Muy bien! Completaste el nivel ${id}. Sigue así.`);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.star}>⭐</Text>
      <Text style={styles.title}>¡Nivel {id} completado!</Text>
      <Text style={styles.subtitle}>Excelente trabajo</Text>

      <TouchableOpacity style={styles.btn} onPress={() => router.replace('/')}>
        <Text style={styles.btnTxt}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#FFF9E6',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  star: { fontSize: 80, marginBottom: 16 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#2C3E50', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 20, color: '#7F8C8D', marginBottom: 48 },
  btn: {
    backgroundColor: '#27AE60', paddingHorizontal: 48, paddingVertical: 18,
    borderRadius: 16, elevation: 4,
  },
  btnTxt: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
});
