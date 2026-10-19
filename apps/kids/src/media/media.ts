export type PhotoSource = 'camera' | 'library';

export type PhotoResult =
  | { status: 'saved'; path: string }
  | { status: 'cancelled' }
  | { status: 'denied' };

/**
 * Parent photos and recordings for a child's board. Files live in the app's
 * private documents folder and are addressed by relative paths, so they
 * survive app updates and never leave the device.
 */
export interface MediaService {
  /** Lets the parent take or choose a photo, re-encoded without location data. */
  pickPhoto(childId: string, source: PhotoSource): Promise<PhotoResult>;
  /** Moves a finished recording into the child's folder. */
  saveRecording(childId: string, temporaryUri: string): Promise<string>;
  /** The file URI for a stored relative path. */
  uri(path: string): string;
  remove(path: string): void;
  /** Deletes every photo and recording kept for a child. */
  removeChild(childId: string): void;
}
