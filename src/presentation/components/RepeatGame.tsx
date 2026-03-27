import { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { Level } from '../../core/entities/Level';
import { useSpeech } from '../hooks/useSpeech';
import { validatePronunciation } from '../../core/usecases/ValidatePronunciation';

interface Props {
  level: Level;
  onComplete: () => void;
}

export default function RepeatGame({ level, onComplete }: Props) {
  const { speak } = useSpeech();
  const target = level.targetWord;
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [transcript, setTranscript] = useState('');
  const attemptsRef = useRef(0);

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript ?? '';
    setTranscript(text);
    setListening(false);
    handleResult(text);
  });

  useSpeechRecognitionEvent('error', () => {
    setListening(false);
    setFeedback('wrong');
    speak('No escuché bien. Intente nuevamente.');
    setTimeout(() => setFeedback(null), 1500);
  });

  useEffect(() => {
    const init = async () => {
      await speak(`Repita la palabra: ${target}`);
    };
    init();
  }, []);

  const handleResult = async (text: string) => {
    if (validatePronunciation(text, target)) {
      setFeedback('correct');
      await speak('Correcto');
      setTimeout(onComplete, 1000);
    } else {
      attemptsRef.current += 1;
      setFeedback('wrong');
      await speak('Intente nuevamente');
      if (attemptsRef.current >= 3) {
        // After 3 failed attempts, let them pass anyway
        setTimeout(onComplete, 1500);
        return;
      }
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const startListening = async () => {
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      await speak('Se necesita permiso de micrófono');
      return;
    }
    setListening(true);
    setTranscript('');
    setFeedback(null);
    ExpoSpeechRecognitionModule.start({ lang: 'es-ES', interimResults: false });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Repita la palabra</Text>
      <Text style={styles.word}>{target}</Text>

      <TouchableOpacity style={styles.listenBtn} onPress={() => speak(`Repita: ${target}`)}>
        <Text style={styles.listenTxt}>🔊 Escuchar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.micBtn, listening && styles.micActive]}
        onPress={startListening}
        disabled={listening}
      >
        {listening ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <Text style={styles.micTxt}>🎤 Hablar</Text>
        )}
      </TouchableOpacity>

      {transcript.length > 0 && (
        <Text style={styles.transcript}>Escuché: "{transcript}"</Text>
      )}

      {feedback === 'correct' && <Text style={styles.correct}>✓ Correcto</Text>}
      {feedback === 'wrong' && <Text style={styles.wrong}>✗ Intente nuevamente</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F8FF', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50', marginBottom: 12 },
  word: { fontSize: 52, fontWeight: 'bold', color: '#4A90D9', letterSpacing: 4, marginBottom: 32 },
  listenBtn: { backgroundColor: '#3498DB', padding: 14, borderRadius: 12, marginBottom: 16 },
  listenTxt: { color: '#fff', fontSize: 20 },
  micBtn: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#E74C3C', justifyContent: 'center', alignItems: 'center',
    marginBottom: 24, elevation: 6,
  },
  micActive: { backgroundColor: '#C0392B' },
  micTxt: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  transcript: { fontSize: 16, color: '#7F8C8D', fontStyle: 'italic', marginBottom: 8 },
  correct: { fontSize: 24, color: '#27AE60', fontWeight: 'bold' },
  wrong: { fontSize: 24, color: '#E74C3C', fontWeight: 'bold' },
});
