import { socialLinks } from '../lib/contact-channels';

const paths: Record<(typeof socialLinks)[number]['id'], string> = {
  instagram:
    'M12 7.3A4.7 4.7 0 1 0 16.7 12 4.7 4.7 0 0 0 12 7.3Zm0 7.7a3 3 0 1 1 3-3 3 3 0 0 1-3 3Zm6-7.9a1.1 1.1 0 1 1-1.1-1.1A1.1 1.1 0 0 1 18 7.1ZM21.1 8a5.4 5.4 0 0 0-1.5-3.8A5.4 5.4 0 0 0 15.8 2.7C14.3 2.6 9.7 2.6 8.2 2.7A5.4 5.4 0 0 0 4.4 4.2 5.4 5.4 0 0 0 2.9 8C2.8 9.5 2.8 14.1 2.9 15.6a5.4 5.4 0 0 0 1.5 3.8 5.4 5.4 0 0 0 3.8 1.5c1.5.1 6.1.1 7.6 0a5.4 5.4 0 0 0 3.8-1.5 5.4 5.4 0 0 0 1.5-3.8c.1-1.5.1-6.1 0-7.6Zm-2 9.3a3 3 0 0 1-1.7 1.7c-1.2.5-4 .4-5.4.4s-4.2.1-5.4-.4a3 3 0 0 1-1.7-1.7c-.5-1.2-.4-4-.4-5.3s-.1-4.2.4-5.4a3 3 0 0 1 1.7-1.7c1.2-.5 4-.4 5.4-.4s4.2-.1 5.4.4a3 3 0 0 1 1.7 1.7c.5 1.2.4 4 .4 5.4s.1 4.1-.4 5.3Z',
  facebook:
    'M13.5 21v-7.4H16l.4-2.9h-2.9V8.9c0-.8.3-1.4 1.4-1.4h1.6V4.9a20 20 0 0 0-2.3-.1c-2.3 0-3.8 1.4-3.8 3.9v2.1H8v2.9h2.5V21Z',
};

/** Round glass buttons for Luminol's official social profiles. */
export function SocialIcons({
  className,
  label,
}: {
  className?: string | undefined;
  label: string;
}) {
  return (
    <ul className={className} aria-label={label}>
      {socialLinks.map((link) => (
        <li key={link.id}>
          <a href={link.href} target="_blank" rel="noopener" aria-label={link.label}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d={paths[link.id]} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
