import { Resend } from 'resend';
export function createEmailClient(apiKey: string): Resend {
  return new Resend(apiKey);
}
