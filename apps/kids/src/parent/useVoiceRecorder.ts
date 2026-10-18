import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';

/** A board word is short; recording stops on its own after this long. */
export const MAX_RECORDING_MS = 10_000;

/**
 * Records a parent saying a card's word. `onRecorded` receives the temporary
 * file URI when recording stops, by hand or after the time limit.
 */
export function useVoiceRecorder(onRecorded: (uri: string) => void) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [recording, setRecording] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(onRecorded);
  latest.current = onRecorded;

  const stop = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false });
    setRecording(false);
    if (recorder.uri) latest.current(recorder.uri);
  }, [recorder]);

  const start = useCallback(async (): Promise<'recording' | 'denied'> => {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) return 'denied';
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setRecording(true);
    timer.current = setTimeout(() => void stop(), MAX_RECORDING_MS);
    return 'recording';
  }, [recorder, stop]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { recording, start, stop };
}
