import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Level } from '../../core/entities/Level';
import { useSpeech } from '../hooks/useSpeech';
import { normalizeText } from '../../shared/utils/textNormalizer';
import AudioButton from './AudioButton';

interface Props {
  level: Level;
  onComplete: () => void;
}

const DECOY_POOL = ['TA', 'LO', 'BI', 'FE', 'RU', 'GU', 'TI', 'PE', 'DA', 'FO'];

export default function SelectionGame({ level, onComplete }: Props) {
  const { speak } = useSpeech();
  const target = level.syllables[0];

  // Fix: stable options — computed once on mount via useState initializer
  const [options] = useState<string[]>(() => {
    const decoys = DECOY_POOL.filter((d) => normalizeText(d) !== normalizeText(target.text));
    return [target.text, decoys[0], decoys[1]].sort(() => Math.random() - 0.5);
  });

  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    speak(`Seleccione la sílaba ${target.text}`);
  }, []);

  const handleSelect = async (option: string) => {
    if (done) return;
    setSelectedOption(option);

    if (normalizeText(option) === normalizeText(target.text)) {
      setFeedback('correct');
      setDone(true);
      await speak('Correcto');
      setTimeout(onComplete, 1000);
    } else {
      setFeedback('wrong');
      await speak('Intente nuevamente');
      setTimeout(() => {
        setFeedback(null);
        setSelectedOption(null);
      }, 1200);
    }
  };

  const getButtonStyle = (opt: string) => {
    if (feedback === 'correct' && normalizeText(opt) === normalizeText(target.text)) {
      return styles.optCorrect;
    }
    // Fix: only highlight the SELECTED wrong option, not all others
    if (feedback === 'wrong' && opt === selectedOption) {
      return styles.optWrong;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seleccione la sílaba</Text>

      <AudioButton text={`Seleccione la sílaba ${target.text}`} size="md" />

      <View style={styles.options}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.optBtn, getButtonStyle(opt)]}
            onPress={() => handleSelect(opt)}
            disabled={done}
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
  options: { flexDirection: 'row', gap: 16, marginTop: 32 },
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
