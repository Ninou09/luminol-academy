import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from 'react';

function classes(
  ...values: Array<string | false | null | undefined>
): string {
  return values.filter(Boolean).join(' ');
}

type ButtonVariant = 'primary' | 'secondary' | 'quiet';
type ButtonSize = 'sm' | 'md' | 'lg';

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 disabled:cursor-not-allowed disabled:opacity-50';
const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-ink text-brand-canvas hover:bg-brand-gold hover:text-brand-ink',
  secondary:
    'border border-brand-ink bg-transparent text-brand-ink hover:bg-brand-ink hover:text-brand-canvas',
  quiet: 'bg-transparent text-brand-ink hover:bg-brand-line/50',
};
const buttonSizes: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-4 py-2 text-sm',
  md: 'min-h-11 px-5 py-2.5 text-sm',
  lg: 'min-h-12 px-6 py-3 text-base',
};

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleProps & { children: ReactNode }) {
  return (
    <button
      className={classes(
        buttonBase,
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonStyleProps & { children: ReactNode }) {
  return (
    <a
      className={classes(
        buttonBase,
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export function Container({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classes(
        'mx-auto w-full max-w-[var(--luminol-content-width)] px-[var(--luminol-page-gutter)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Section({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={classes(
        'py-[var(--luminol-section-space)]',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export function Stack({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={classes('flex flex-col gap-6', className)} {...props}>
      {children}
    </div>
  );
}

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <article
      className={classes(
        'rounded-card border border-brand-line bg-brand-surface p-6 text-start shadow-elevated',
        className,
      )}
      {...props}
    >
      {children}
    </article>
  );
}

export function Badge({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={classes(
        'inline-flex rounded-pill border border-brand-gold px-3 py-1 text-xs font-semibold tracking-wide text-brand-gold-strong',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={classes(
        'font-display text-2xl tracking-wide text-brand-ink',
        className,
      )}
    >
      Luminol <span className="text-brand-gold-strong">Academy</span>
    </span>
  );
}
