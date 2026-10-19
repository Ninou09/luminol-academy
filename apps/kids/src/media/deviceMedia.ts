import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import type { MediaService, PhotoResult, PhotoSource } from './media';

/** Large enough for a board card on a tablet, small enough to stay light. */
const PHOTO_WIDTH = 768;

export class DeviceMediaService implements MediaService {
  constructor(private readonly newId: () => string) {}

  private folder(childId: string): Directory {
    const folder = new Directory(Paths.document, 'children', childId, 'aac');
    folder.create({ intermediates: true, idempotent: true });
    return folder;
  }

  async pickPhoto(childId: string, source: PhotoSource): Promise<PhotoResult> {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return { status: 'denied' };
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      exif: false,
    };
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
    const asset = result.canceled ? undefined : result.assets[0];
    if (!asset) return { status: 'cancelled' };

    // Re-encoding drops EXIF metadata such as where the photo was taken.
    const rendered = await ImageManipulator.manipulate(asset.uri)
      .resize({ width: PHOTO_WIDTH })
      .renderAsync();
    const saved = await rendered.saveAsync({
      format: SaveFormat.JPEG,
      compress: 0.85,
    });
    const name = `${this.newId()}.jpg`;
    await new File(saved.uri).move(new File(this.folder(childId), name));
    return { status: 'saved', path: `children/${childId}/aac/${name}` };
  }

  async saveRecording(childId: string, temporaryUri: string): Promise<string> {
    const name = `${this.newId()}.m4a`;
    await new File(temporaryUri).move(new File(this.folder(childId), name));
    return `children/${childId}/aac/${name}`;
  }

  uri(path: string): string {
    return new File(Paths.document, path).uri;
  }

  remove(path: string): void {
    const file = new File(Paths.document, path);
    if (file.exists) file.delete();
  }

  removeChild(childId: string): void {
    const folder = new Directory(Paths.document, 'children', childId);
    if (folder.exists) folder.delete();
  }
}
