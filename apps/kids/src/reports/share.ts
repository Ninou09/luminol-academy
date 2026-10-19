export type ShareResult = 'shared' | 'unavailable';

/**
 * Hands a file to the system share sheet, where the parent decides where it
 * goes. Nothing is uploaded by the app itself.
 */
export interface ShareService {
  /** Renders HTML to a PDF and shares it. */
  sharePdf(html: string, fileName: string): Promise<ShareResult>;
  /** Shares text as a file, such as a JSON export. */
  shareText(
    contents: string,
    fileName: string,
    mimeType: string,
  ): Promise<ShareResult>;
}
