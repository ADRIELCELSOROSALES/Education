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

export default function DragDropGame({ level, onComplete }: Props) {
  const { speak } = useSpeech();
  const [slots, setSlots] = useState<(Syllable | null)[]>(Array(level.syllables.length).fill(null));
  const [bank, setBank] = useState<Syllable[]>([...level.syllables].sort(() => Math.random() - 0.5));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedFromBank, setSelectedFromBank] = useState<string | null>(null);

  useEffect(() => {
    speak('Forme la palabra. Toque las sílabas en orden.');
  }, []);

  const handleBankPress = (syl: Syllable) => {
    setSelectedFromBank(syl.id);
  };

  const handleSlotPress = async (slotIndex: number) => {
    if (!selectedFromBank) return;
    const syl = bank.find((s) => s.id === selectedFromBank);
    if (!syl) return;

    const newSlots = [...slots];
    newSlots[slotIndex] = syl;
    setSlots(newSlots);
    setBank(bank.filter((s) => s.id !== selectedFromBank));
    setSelectedFromBank(null);

    // Check if all slots filled
    const allFilled = newSlots.every((s) => s !== null);
    if (allFilled) {
      const formed = newSlots.map((s) => s!.text).join('');
      if (normalizeText(formed) === normalizeText(level.targetWord)) {
        setFeedback('correct');
        await speak('Correcto');
        setTimeout(onComplete, 1000);
      } else {
        setFeedback('wrong');
        await speak('Intente nuevamente');
        setSlots(Array(level.syllables.length).fill(null));
        setBank([...level.syllables].sort(() => Math.random() - 0.5));
        setFeedback(null);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forme la palabra</Text>
      <Text style={styles.hint}>{level.targetWord}</Text>

      {/* Slots */}
      <View style={styles.slots}>
        {slots.map((slot, i) => (
          <TouchableOpacity key={i} style={styles.slot} onPress={() => handleSlotPress(i)}>
            <Text style={styles.slotText}>{slot?.text ?? '_'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bank */}
      <View style={styles.bank}>
        {bank.map((syl) => (
          <TouchableOpacity
            key={syl.id}
            style={[styles.bankCard, selectedFromBank === syl.id && styles.selected]}
            onPress={() => handleBankPress(syl)}
          >
            <Text style={styles.bankText}>{syl.text}</Text>
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
  title: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50', marginBottom: 8 },
  hint: { fontSize: 14, color: '#95A5A6', marginBottom: 32 },
  slots: { flexDirection: 'row', gap: 12, marginBottom: 40 },
  slot: {
    width: 80, height: 80, borderRadius: 12, borderWidth: 2,
    borderColor: '#4A90D9', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff',
  },
  slotText: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50' },
  bank: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  bankCard: {
    width: 80, height: 80, borderRadius: 12,
    backgroundColor: '#4A90D9', justifyContent: 'center', alignItems: 'center',
  },
  selected: { backgroundColor: '#E67E22', transform: [{ scale: 1.1 }] },
  bankText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  correct: { fontSize: 24, color: '#27AE60', marginTop: 20, fontWeight: 'bold' },
  wrong: { fontSize: 24, color: '#E74C3C', marginTop: 20, fontWeight: 'bold' },
});
