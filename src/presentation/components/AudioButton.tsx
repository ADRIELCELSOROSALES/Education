import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useSpeech } from '../hooks/useSpeech';

interface Props {
  text: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function AudioButton({ text, label = '🔊 Escuchar', size = 'md' }: Props) {
  const { speak } = useSpeech();
  const [speaking, setSpeaking] = useState(false);

  const handlePress = async () => {
    if (speaking) return;
    setSpeaking(true);
    await speak(text);
    setSpeaking(false);
  };

  return (
    <TouchableOpacity
      style={[styles.btn, styles[size]]}
      onPress={handlePress}
      disabled={speaking}
    >
      {speaking
        ? <ActivityIndicator color="#fff" size="small" />
        : <Text style={[styles.label, size === 'sm' && styles.labelSm]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: '#3498DB', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sm: { paddingHorizontal: 12, paddingVertical: 8 },
  md: { paddingHorizontal: 20, paddingVertical: 14 },
  lg: { paddingHorizontal: 28, paddingVertical: 18 },
  label: { color: '#fff', fontSize: 20, fontWeight: '600' },
  labelSm: { fontSize: 15 },
});
