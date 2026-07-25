import type { ButtonHTMLAttributes, ReactNode } from 'react';
export function Button({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`bg-brand-navy hover:bg-brand-gold focus-visible:outline-brand-gold rounded-sm px-5 py-3 font-semibold text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
export function Wordmark() {
  return (
    <span className="font-serif text-2xl tracking-wide">
      Luminol <span className="text-brand-gold">Academy</span>
    </span>
  );
}
