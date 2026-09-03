import { ButtonLink } from '@luminol/ui';
import { SiteFooter, SiteHeader } from '../../components/site-shell';
import styles from '../home.module.css';

export default function ConsultationsPage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="consultation-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Psychology & Mental Wellness</p>
            <h1 id="consultation-title" className={styles.heroTitle}>
              A guided space to understand yourself and move forward
            </h1>
            <p className={styles.heroLede}>
              Luminol Academy offers psychology support pathways focused on
              listening, understanding and personalised guidance.
            </p>
            <ButtonLink href="/contact" size="lg">
              Start a conversation →
            </ButtonLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
