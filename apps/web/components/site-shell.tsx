import Image from 'next/image';
import Link from 'next/link';
import { ButtonLink } from '@luminol/ui';

const navigation = [
  { href: '/', label: 'الرئيسية' },
  { href: '/schools/psychology', label: 'علم النفس' },
  { href: '/schools/languages', label: 'اللغات' },
  { href: '/schools/training', label: 'التكوين المهني' },
  { href: '/about', label: 'من نحن' },
] as const;

function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <span className={footer ? 'brand-lockup brand-lockup-footer' : 'brand-lockup'}>
      <Image
        className="brand-logo"
        src="/brand/luminol-mark.svg"
        alt=""
        aria-hidden="true"
        width={74}
        height={82}
        priority={!footer}
      />
      <span className="brand-copy">
        <strong>أكاديمية لومينول</strong>
        <small>LUMINOL ACADEMY</small>
      </span>
    </span>
  );
}

export function SiteHeader() {
  return (
    <>
      <div className="utility-bar">
        <p>تعليم إنساني يجمع بين الوعي واللغة والمهارة</p>
        <div>
          <span>البليدة، الجزائر</span>
          <Link href="/contact">تواصل معنا</Link>
        </div>
      </div>

      <header className="site-header premium-header">
        <Link className="brand-link" href="/" aria-label="الصفحة الرئيسية لأكاديمية لومينول">
          <Brand />
        </Link>

        <nav className="desktop-nav" aria-label="التنقل الرئيسي">
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <ButtonLink className="header-cta" href="/contact" size="sm">
            سجّل اهتمامك
          </ButtonLink>
        </div>

        <details className="mobile-menu">
          <summary aria-label="فتح قائمة التنقل">القائمة</summary>
          <nav aria-label="التنقل عبر الهاتف">
            {navigation.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label} <span aria-hidden="true">←</span>
              </Link>
            ))}
            <Link href="/contact">
              تحدّث مع الفريق <span aria-hidden="true">←</span>
            </Link>
          </nav>
        </details>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-lead">
        <p>العقل · اللغة · المستقبل</p>
        <h2>أكاديمية واحدة لمسارات تعليمية مترابطة تصنع تقدّمًا حقيقيًا.</h2>
        <Link href="/contact">
          ابدأ محادثتك <span aria-hidden="true">←</span>
        </Link>
      </div>

      <div className="footer-main">
        <div className="footer-intro">
          <Link
            className="footer-brand"
            href="/"
            aria-label="الصفحة الرئيسية لأكاديمية لومينول"
          >
            <Brand footer />
          </Link>
          <p>
            علم النفس، تعلّم اللغات والتكوين المهني ضمن تجربة تعليمية واضحة،
            إنسانية وعملية.
          </p>
          <span className="footer-location">البليدة، الجزائر</span>
        </div>

        <div className="footer-column">
          <h2>فروع الأكاديمية</h2>
          <Link href="/schools/psychology">علم النفس</Link>
          <Link href="/schools/languages">اللغات</Link>
          <Link href="/schools/training">التكوين المهني</Link>
        </div>

        <div className="footer-column">
          <h2>الأكاديمية</h2>
          <Link href="/about">من نحن</Link>
          <Link href="/contact">تواصل مع الفريق</Link>
          <Link href="/contact">سجّل اهتمامك</Link>
        </div>

        <div className="footer-column">
          <h2>ابدأ من هنا</h2>
          <Link href="/schools/psychology">اكتشف برامج علم النفس</Link>
          <Link href="/schools/languages">اختر مسارك اللغوي</Link>
          <Link href="/schools/training">طوّر مهاراتك المهنية</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} أكاديمية لومينول</p>
        <p className="footer-note">
          محتوى علم النفس تعليمي وداعم ولا يعوّض خدمات الطوارئ أو الرعاية الطبية.
        </p>
        <div className="footer-bottom-links">
          <Link href="/privacy">الخصوصية</Link>
          <Link href="/terms">الشروط</Link>
          <Link href="/cookies">ملفات الارتباط</Link>
        </div>
      </div>
    </footer>
  );
}
