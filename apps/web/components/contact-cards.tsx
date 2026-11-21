import type { Locale } from '@luminol/localization';

import {
  channelCopy,
  contactLabels,
  getWhatsAppHref,
  officialContacts,
} from '../lib/contact-channels';
import styles from './contact-cards.module.css';

const icons = {
  phone:
    'M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.6 1 1 0 0 1-.25 1Z',
  whatsapp:
    'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3Z',
  email:
    'M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 2v.4l8 5 8-5V7Zm16 2.8-7.5 4.7a1 1 0 0 1-1 0L4 9.8V17h16Z',
} as const;

/** Three direct channels: reception phone, WhatsApp and email. */
export function ContactCards({
  locale,
  className,
}: {
  locale: Locale;
  className?: string | undefined;
}) {
  const labels = contactLabels[locale];
  const cards = [
    {
      id: 'phone' as const,
      hint: labels.callHint,
      action: labels.call,
      value: officialContacts.phoneDisplay,
      href: `tel:${officialContacts.phone}`,
      external: false,
    },
    {
      id: 'whatsapp' as const,
      hint: labels.whatsappHint,
      action: labels.whatsapp,
      value: officialContacts.whatsappDisplay,
      href: getWhatsAppHref(channelCopy[locale].whatsappMessage) ?? '#',
      external: true,
    },
    {
      id: 'email' as const,
      hint: labels.emailHint,
      action: labels.email,
      value: officialContacts.email,
      href: `mailto:${officialContacts.email}`,
      external: false,
    },
  ];
  return (
    <ul className={[styles.cards, className].filter(Boolean).join(' ')}>
      {cards.map((card) => (
        <li key={card.id}>
          <a
            className={`${styles.card} ${styles[card.id] ?? ''}`}
            href={card.href}
            {...(card.external ? { target: '_blank', rel: 'noopener' } : {})}
          >
            <span className={styles.icon} aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d={icons[card.id]} />
              </svg>
            </span>
            <span className={styles.text}>
              <small>{card.hint}</small>
              <strong dir="ltr">{card.value}</strong>
              <em>
                {card.action} <span aria-hidden="true">→</span>
              </em>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
