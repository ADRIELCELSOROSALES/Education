import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Level } from '../../core/entities/Level';
import { Syllable } from '../../core/entities/Syllable';
import { useSpeech } from '../hooks/useSpeech';
import { normalizeText } from '../../shared/utils/textNormalizer';

interface Props {
  level: Level;
  onComplete: () => void;
}

export default function SelectionGame({ level, onComplete }: Props) {
  const { speak } = useSpeech();
  const target = level.syllables[0];
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Build options: target + decoys from other syllables or static list
  const decoys = ['TA', 'LO', 'BI', 'FE', 'RU', 'GU'].filter(
    (d) => normalizeText(d) !== normalizeText(target.text)
  );
  const options: string[] = [target.text, decoys[0], decoys[1]]
    .sort(() => Math.random() - 0.5);

  useEffect(() => {
    const ask = async () => {
      await speak(`Seleccione la sílaba ${target.text}`);
    };
    ask();
  }, []);

  const handleSelect = async (option: string) => {
    if (normalizeText(option) === normalizeText(target.text)) {
      setFeedback('correct');
      await speak('Correcto');
      setTimeout(onComplete, 1000);
    } else {
      setFeedback('wrong');
      await speak('Intente nuevamente');
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seleccione la sílaba</Text>
      <TouchableOpacity style={styles.playBtn} onPress={() => speak(`Seleccione la sílaba ${target.text}`)}>
        <Text style={styles.playTxt}>🔊 Escuchar</Text>
      </TouchableOpacity>

      <View style={styles.options}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.optBtn,
              feedback === 'correct' && normalizeText(opt) === normalizeText(target.text) && styles.optCorrect,
              feedback === 'wrong' && normalizeText(opt) !== normalizeText(target.text) && styles.optWrong,
            ]}
            onPress={() => handleSelect(opt)}
          >
            <Text style={styles.optText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {feedback === 'correct' && <Text style={styles.correct}>✓ Correcto</Text>}
      {feedback === 'wrong' && <Text style={styles.wrong}>✗ Intente nuevamente</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F8FF', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50', marginBottom: 24 },
  playBtn: { backgroundColor: '#3498DB', padding: 14, borderRadius: 12, marginBottom: 32 },
  playTxt: { color: '#fff', fontSize: 20 },
  options: { flexDirection: 'row', gap: 16 },
  optBtn: {
    width: 90, height: 90, borderRadius: 16,
    backgroundColor: '#4A90D9', justifyContent: 'center', alignItems: 'center',
  },
  optCorrect: { backgroundColor: '#27AE60' },
  optWrong: { backgroundColor: '#E74C3C' },
  optText: { fontSize: 30, fontWeight: 'bold', color: '#fff' },
  correct: { fontSize: 24, color: '#27AE60', marginTop: 24, fontWeight: 'bold' },
  wrong: { fontSize: 24, color: '#E74C3C', marginTop: 24, fontWeight: 'bold' },
});
