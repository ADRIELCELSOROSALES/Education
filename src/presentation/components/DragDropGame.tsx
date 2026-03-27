import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Level } from '../../core/entities/Level';
import { Syllable } from '../../core/entities/Syllable';
import { useSpeech } from '../hooks/useSpeech';
import { normalizeText } from '../../shared/utils/textNormalizer';
import AudioButton from './AudioButton';

interface Props {
  level: Level;
  onComplete: () => void;
}

export default function DragDropGame({ level, onComplete }: Props) {
  const { speak } = useSpeech();
  const [slots, setSlots] = useState<(Syllable | null)[]>(Array(level.syllables.length).fill(null));
  const [bank, setBank] = useState<Syllable[]>([...level.syllables].sort(() => Math.random() - 0.5));
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedFromBank, setSelectedFromBank] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    speak('Forme la palabra. Toque una sílaba y luego el lugar donde va.');
  }, []);

  const handleBankPress = (syl: Syllable) => {
    setSelectedFromBank((prev) => prev === syl.id ? null : syl.id);
  };

  const handleSlotPress = async (slotIndex: number) => {
    if (done) return;

    // Tap on a filled slot → return syllable to bank
    if (slots[slotIndex] !== null && !selectedFromBank) {
      const removed = slots[slotIndex]!;
      const newSlots = [...slots];
      newSlots[slotIndex] = null;
      setSlots(newSlots);
      setBank((prev) => [...prev, removed]);
      return;
    }

    if (!selectedFromBank) return;
    const syl = bank.find((s) => s.id === selectedFromBank);
    if (!syl) return;

    const newSlots = [...slots];
    // If slot is already filled, swap: return old syllable to bank
    if (newSlots[slotIndex] !== null) {
      setBank((prev) => [...prev, newSlots[slotIndex]!]);
    }
    newSlots[slotIndex] = syl;
    setSlots(newSlots);
    setBank((prev) => prev.filter((s) => s.id !== selectedFromBank));
    setSelectedFromBank(null);

    const allFilled = newSlots.every((s) => s !== null);
    if (allFilled) {
      const formed = newSlots.map((s) => s!.text).join('');
      if (normalizeText(formed) === normalizeText(level.targetWord)) {
        setFeedback('correct');
        setDone(true);
        await speak('Correcto');
        setTimeout(onComplete, 1000);
      } else {
        setFeedback('wrong');
        await speak('Intente nuevamente');
        setTimeout(() => {
          setSlots(Array(level.syllables.length).fill(null));
          setBank([...level.syllables].sort(() => Math.random() - 0.5));
          setFeedback(null);
          setSelectedFromBank(null);
        }, 1200);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forme la palabra</Text>

      <AudioButton text="Forme la palabra. Toque una sílaba y luego el lugar donde va." size="sm" label="🔊 Instrucción" />

      {/* Slots */}
      <View style={styles.slots}>
        {slots.map((slot, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.slot, slot !== null && styles.slotFilled]}
            onPress={() => handleSlotPress(i)}
          >
            <Text style={styles.slotText}>{slot?.text ?? '?'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.hint}>
        {selectedFromBank ? 'Ahora toque el lugar donde va' : 'Toque una sílaba'}
      </Text>

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
  title: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50', marginBottom: 16 },
  slots: { flexDirection: 'row', gap: 12, marginVertical: 28 },
  slot: {
    width: 84, height: 84, borderRadius: 12, borderWidth: 2,
    borderColor: '#4A90D9', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff',
  },
  slotFilled: { borderStyle: 'solid', borderColor: '#27AE60', backgroundColor: '#EAFAF1' },
  slotText: { fontSize: 28, fontWeight: 'bold', color: '#2C3E50' },
  hint: { fontSize: 14, color: '#95A5A6', marginBottom: 20, fontStyle: 'italic' },
  bank: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center' },
  bankCard: {
    width: 84, height: 84, borderRadius: 12,
    backgroundColor: '#4A90D9', justifyContent: 'center', alignItems: 'center',
    elevation: 3,
  },
  selected: { backgroundColor: '#E67E22', transform: [{ scale: 1.08 }] },
  bankText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  correct: { fontSize: 24, color: '#27AE60', marginTop: 20, fontWeight: 'bold' },
  wrong: { fontSize: 24, color: '#E74C3C', marginTop: 20, fontWeight: 'bold' },
});
