import { AuthProvider } from '@luminol/auth';
import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Luminol Academy',
  description: 'Learning with purpose.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
