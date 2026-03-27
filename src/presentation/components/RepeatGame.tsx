import { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { Level } from '../../core/entities/Level';
import { useSpeech } from '../hooks/useSpeech';
import { validatePronunciation } from '../../core/usecases/ValidatePronunciation';
import AudioButton from './AudioButton';

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
  const doneRef = useRef(false);

  // Fix: use ref to avoid stale closure inside the event handler
  const handleResult = useCallback(async (text: string) => {
    if (doneRef.current) return;

    if (validatePronunciation(text, target)) {
      doneRef.current = true;
      setFeedback('correct');
      await speak('Correcto');
      setTimeout(onComplete, 1000);
    } else {
      attemptsRef.current += 1;
      setFeedback('wrong');
      await speak('Intente nuevamente');
      if (attemptsRef.current >= 3) {
        doneRef.current = true;
        setTimeout(onComplete, 1500);
        return;
      }
      setTimeout(() => setFeedback(null), 1200);
    }
  }, [target, speak, onComplete]);

  const handleResultRef = useRef(handleResult);
  useEffect(() => { handleResultRef.current = handleResult; }, [handleResult]);

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript ?? '';
    setTranscript(text);
    setListening(false);
    handleResultRef.current(text);
  });

  useSpeechRecognitionEvent('error', () => {
    setListening(false);
    setFeedback('wrong');
    speak('No escuché bien. Intente nuevamente.');
    setTimeout(() => setFeedback(null), 1500);
  });

  useEffect(() => {
    speak(`Repita la palabra: ${target}`);
  }, []);

  const startListening = async () => {
    if (doneRef.current) return;
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

      <AudioButton text={`Repita: ${target}`} size="md" />

      <TouchableOpacity
        style={[styles.micBtn, listening && styles.micActive]}
        onPress={startListening}
        disabled={listening}
      >
        {listening
          ? <ActivityIndicator color="#fff" size="large" />
          : <Text style={styles.micTxt}>🎤 Hablar</Text>
        }
      </TouchableOpacity>

      {transcript.length > 0 && (
        <Text style={styles.transcript}>Escuché: "{transcript}"</Text>
      )}
      {attemptsRef.current > 0 && feedback !== 'correct' && (
        <Text style={styles.attempts}>Intentos: {attemptsRef.current}/3</Text>
      )}

      {feedback === 'correct' && <Text style={styles.correct}>✓ Correcto</Text>}
      {feedback === 'wrong' && <Text style={styles.wrong}>✗ Intente nuevamente</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F8FF', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2C3E50', marginBottom: 12 },
  word: { fontSize: 52, fontWeight: 'bold', color: '#4A90D9', letterSpacing: 4, marginBottom: 24 },
  micBtn: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#E74C3C', justifyContent: 'center', alignItems: 'center',
    marginTop: 24, marginBottom: 20, elevation: 6,
  },
  micActive: { backgroundColor: '#C0392B' },
  micTxt: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  transcript: { fontSize: 16, color: '#7F8C8D', fontStyle: 'italic', marginBottom: 4 },
  attempts: { fontSize: 14, color: '#BDC3C7', marginBottom: 8 },
  correct: { fontSize: 24, color: '#27AE60', fontWeight: 'bold' },
  wrong: { fontSize: 24, color: '#E74C3C', fontWeight: 'bold' },
});
