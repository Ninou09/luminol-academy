export type EnquiryContactShortcutKind = 'email' | 'phone' | 'whatsapp';

export type EnquiryPreferredContact = 'EMAIL' | 'PHONE' | 'WHATSAPP' | null;

export type EnquiryContactShortcut = {
  kind: EnquiryContactShortcutKind;
  href: string;
  preferred: boolean;
};

type EnquiryContactShortcutInput = {
  email: string;
  phone: string | null;
  preferredContact: EnquiryPreferredContact;
};

const SAFE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAFE_TEL_PATTERN = /^\+?\d{6,15}$/;
const SAFE_WHATSAPP_PATTERN = /^\+[1-9]\d{7,14}$/;

function normalizePhone(phone: string | null): string | null {
  if (!phone) return null;

  const normalized = phone.trim().replace(/[()\s.-]/g, '');
  return SAFE_TEL_PATTERN.test(normalized) ? normalized : null;
}

function buildEmailHref(email: string): string | null {
  const normalized = email.trim();
  if (
    normalized.length === 0 ||
    normalized.length > 254 ||
    !SAFE_EMAIL_PATTERN.test(normalized)
  ) {
    return null;
  }

  return `mailto:${encodeURIComponent(normalized)}`;
}

function buildPhoneHref(phone: string | null): string | null {
  const normalized = normalizePhone(phone);
  return normalized ? `tel:${normalized}` : null;
}

function buildWhatsAppHref(phone: string | null): string | null {
  const normalized = normalizePhone(phone);
  if (!normalized || !SAFE_WHATSAPP_PATTERN.test(normalized)) return null;

  return `https://wa.me/${normalized.slice(1)}`;
}

export function buildEnquiryContactShortcuts(
  input: EnquiryContactShortcutInput,
): EnquiryContactShortcut[] {
  const shortcuts: EnquiryContactShortcut[] = [];
  const emailHref = buildEmailHref(input.email);
  const phoneHref = buildPhoneHref(input.phone);
  const whatsappHref = buildWhatsAppHref(input.phone);

  if (emailHref) {
    shortcuts.push({
      kind: 'email',
      href: emailHref,
      preferred: input.preferredContact === 'EMAIL',
    });
  }

  if (phoneHref) {
    shortcuts.push({
      kind: 'phone',
      href: phoneHref,
      preferred: input.preferredContact === 'PHONE',
    });
  }

  if (whatsappHref) {
    shortcuts.push({
      kind: 'whatsapp',
      href: whatsappHref,
      preferred: input.preferredContact === 'WHATSAPP',
    });
  }

  return shortcuts;
}
