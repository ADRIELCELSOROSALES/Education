# LecturaFácil — Contexto completo del proyecto

## Objetivo
App móvil multiplataforma para enseñar lectura básica (sílabas → palabras), completamente guiada por voz, sin login, 100% offline. Orientada a usuarios con bajo nivel de alfabetización.

---

## Stack técnico
| Tecnología | Uso |
|---|---|
| React Native + Expo SDK 55 | Framework principal |
| Expo Router | Navegación file-based |
| expo-speech | TTS (texto a voz) |
| expo-speech-recognition | STT (voz a texto) |
| @react-native-async-storage/async-storage | Persistencia local |
| react-native-gesture-handler | Soporte drag & drop |
| react-native-reanimated | Animaciones |
| Zustand | Estado global |
| TypeScript | Lenguaje |

---

## Arquitectura: Clean Architecture

```
app/                          # Expo Router (screens)
  _layout.tsx                 # Root layout con GestureHandlerRootView
  index.tsx                   # Home — lista de niveles + audio bienvenida
  level/[id].tsx              # Pantalla de nivel: instrucción + sílabas tocables
  game/[type].tsx             # Router de juegos (drag-drop / selection / repeat)

src/
├── core/                     # Dominio puro (sin dependencias de RN)
│   ├── entities/
│   │   ├── Level.ts          # { id, syllables, targetWord, instruction }
│   │   ├── Syllable.ts       # { id, text }
│   │   ├── UserProgress.ts   # { name, currentLevel, completedLevels, totalErrors }
│   │   └── GameResult.ts     # { levelId, gameType, passed, errors }
│   ├── usecases/
│   │   ├── StartLevel.ts         # canStartLevel(), startLevel()
│   │   ├── CompleteGame.ts       # recordGameResult()
│   │   ├── UnlockNextLevel.ts    # unlockNextLevel()
│   │   └── ValidatePronunciation.ts  # validatePronunciation() con normalización
│   └── ports/                # Interfaces (contratos)
│       ├── ProgressRepository.ts
│       ├── SpeechSynthesizer.ts
│       └── SpeechRecognizer.ts
│
├── infrastructure/           # Implementaciones concretas
│   ├── storage/
│   │   └── AsyncStorageProgressRepository.ts
│   ├── speech/
│   │   ├── ExpoSpeechSynthesizer.ts   # Usa expo-speech
│   │   └── ExpoSpeechRecognizer.ts    # Usa expo-speech-recognition
│   └── content/
│       └── levels.json       # 15 niveles con sílabas y palabras objetivo
│
├── presentation/
│   ├── components/
│   │   ├── DragDropGame.tsx   # Juego 1: tocar sílaba del banco → colocar en slot
│   │   ├── SelectionGame.tsx  # Juego 2: escuchar y seleccionar sílaba correcta
│   │   └── RepeatGame.tsx     # Juego 3: escuchar palabra y repetirla en voz alta
│   ├── hooks/
│   │   ├── useSpeech.ts       # Wrapper de ExpoSpeechSynthesizer
│   │   ├── useProgress.ts     # Carga progreso al montar + expone saveProgress
│   │   └── useLevel.ts        # Busca nivel por id en levels.json
│   └── stores/
│       └── gameStore.ts       # Zustand: progress, currentLevel, isLoading
│
└── shared/
    ├── constants.ts           # STORAGE_KEY, TOTAL_LEVELS, SPEECH_RATE, SPEECH_LANGUAGE
    └── utils/
        └── textNormalizer.ts  # Normaliza texto: minúsculas, sin tildes, solo letras
```

---

## Flujo de la app

```
Inicio automático (carga perfil local)
↓
Home — lista niveles bloqueados/desbloqueados + audio bienvenida
↓
Pantalla Nivel — instrucción en audio + sílabas tocables
↓
Juego 1: Drag & Drop — formar palabra tocando sílabas en orden
↓
Juego 2: Selección — escuchar audio y tocar la sílaba correcta
↓
Juego 3: Repetir — escuchar palabra y repetirla en voz alta (STT)
↓
Guardar progreso + desbloquear siguiente nivel
↓
Home
```

---

## Los 3 juegos (siempre iguales por nivel)

### Juego 1: Drag & Drop (DragDropGame)
- Muestra sílabas desordenadas en un "banco"
- El usuario toca una sílaba del banco (se resalta) y luego toca el slot donde colocarla
- Al completar todos los slots valida contra `targetWord`
- Feedback: "Correcto" / "Intente nuevamente" (resetea)

### Juego 2: Selección (SelectionGame)
- Reproduce audio: "Seleccione la sílaba X"
- Muestra 3 opciones (target + 2 decoys)
- Feedback inmediato con color + voz

### Juego 3: Repetir (RepeatGame)
- Reproduce la palabra objetivo en voz alta
- Activa micrófono → captura voz → convierte a texto → compara
- Validación flexible via `textNormalizer` (sin tildes, minúsculas)
- Después de 3 intentos fallidos deja pasar igual (no frustrar al usuario)

---

## Persistencia de datos

```json
{
  "nombre": "Usuario",
  "nivel_actual": 2,
  "niveles_completados": [1],
  "errores_totales": 3
}
```

- Storage key: `@lectura_facil_progress`
- Sin backend, sin internet, todo en AsyncStorage
- Al abrir la app se carga automáticamente

---

## Niveles (levels.json)

15 niveles progresivos:

| Nivel | Sílabas | Palabra |
|---|---|---|
| 1 | MA + MA | MAMA |
| 2 | PA + PA | PAPA |
| 3 | SA + LA | SALA |
| 4 | ME + SA | MESA |
| 5 | CA + SA | CASA |
| 6 | PE + LO | PELO |
| 7 | PI + SO | PISO |
| 8 | GA + TO | GATO |
| 9 | PA + TO | PATO |
| 10 | NI + NO | NIÑO |
| 11 | LU + NA | LUNA |
| 12 | SO + FA | SOFÁ |
| 13 | RO + SA | ROSA |
| 14 | BO + CA | BOCA |
| 15 | MA + NO | MANO |

---

## Diseño pedagógico

- **Repetición constante**: mismos 3 juegos en todos los niveles
- **Sin sobrecarga cognitiva**: estructura predecible, sin sorpresas
- **Feedback inmediato**: audio + visual en cada respuesta
- **Escuchar + repetir**: el usuario no solo reconoce, también produce
- **Tolerancia al error**: validación flexible en STT, 3 intentos antes de continuar
- **Sin login, sin texto**: todo se escucha, nada se lee

---

## Comandos útiles

```bash
# Iniciar en modo desarrollo
npx expo start

# Con tunnel (redes distintas) — requiere NGROK_AUTHTOKEN
$env:NGROK_AUTHTOKEN="tu_token"
npx expo start --tunnel

# Build nativo Android (requiere Android Studio)
npx expo run:android

# TypeScript check
npx tsc --noEmit
```

---

## Notas importantes

- `expo-speech` y `expo-speech-recognition` **no funcionan en Expo Go** — requieren build nativa
- Para probar TTS/STT usar `npx expo run:android` con dispositivo conectado por USB
- El branch principal es `master`
- Repo: https://github.com/ADRIELCELSOROSALES/Education.git
- `@react-native-voice/voice` está deprecado — se usa `expo-speech-recognition` en su lugar
- Al instalar paquetes con conflictos de peer deps usar `--legacy-peer-deps`

---

## Estado del desarrollo

- [x] Setup Expo SDK 55 + TypeScript + Expo Router
- [x] Entidades del dominio
- [x] Persistencia local (AsyncStorage)
- [x] 15 niveles en levels.json
- [x] TTS con expo-speech + hook useSpeech()
- [x] Pantalla Home
- [x] Pantalla de Nivel
- [x] Juego 1: DragDropGame
- [x] Juego 2: SelectionGame
- [x] Juego 3: RepeatGame (STT)
- [ ] Pruebas en dispositivo físico
- [ ] Pulir UX/animaciones
- [ ] AudioButton component reutilizable
- [ ] Tests unitarios en usecases
