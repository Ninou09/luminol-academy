import { File, Paths } from 'expo-file-system';
import { printToFileAsync } from 'expo-print';
import { isAvailableAsync, shareAsync } from 'expo-sharing';

import type { ShareResult, ShareService } from './share';

/** Child data never stays in the cache after the share sheet closes. */
function removeQuietly(file: File) {
  try {
    if (file.exists) file.delete();
  } catch (error: unknown) {
    console.warn('Could not remove a shared file', error);
  }
}

export class DeviceShareService implements ShareService {
  async sharePdf(html: string, fileName: string): Promise<ShareResult> {
    if (!(await isAvailableAsync())) return 'unavailable';
    const printed = new File((await printToFileAsync({ html })).uri);
    const named = new File(Paths.cache, fileName);
    removeQuietly(named);
    await printed.move(named);
    try {
      await shareAsync(named.uri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
      });
      return 'shared';
    } finally {
      removeQuietly(named);
    }
  }

  async shareText(
    contents: string,
    fileName: string,
    mimeType: string,
  ): Promise<ShareResult> {
    if (!(await isAvailableAsync())) return 'unavailable';
    const file = new File(Paths.cache, fileName);
    removeQuietly(file);
    file.create();
    file.write(contents);
    try {
      await shareAsync(file.uri, { mimeType });
      return 'shared';
    } finally {
      removeQuietly(file);
    }
  }
}
