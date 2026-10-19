import { useState } from 'react';

export const MAX_RECORDING_MS = 10_000;

/** Stands in for expo-audio's recorder, which needs a device microphone. */
export function useVoiceRecorder(onRecorded: (uri: string) => void) {
  const [recording, setRecording] = useState(false);
  return {
    recording,
    start: async (): Promise<'recording' | 'denied'> => {
      setRecording(true);
      return 'recording';
    },
    stop: async () => {
      setRecording(false);
      onRecorded('file:///tmp/recording.m4a');
    },
  };
}
