/**
 * Something the app says aloud. `key` identifies the recording; `text` is the
 * Modern Standard Arabic shown on screen and read by text-to-speech.
 */
export type Utterance = {
  key: string;
  text: string;
};
