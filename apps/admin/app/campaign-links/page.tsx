import { requirePermission } from '@luminol/auth';
import { getCommonDictionary, localizeHref } from '@luminol/localization';
import Link from 'next/link';

import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';
import { getCampaignLinkBuilderCopy } from '../../lib/campaign-link-builder-localization';
import { buildCampaignTaggedPath } from '../../lib/campaign-link-builder';
import { getAdminRequestLocale } from '../../lib/request-locale';
import styles from './page.module.css';

type CampaignLinksPageProps = {
  searchParams?: Promise<{
    build?: string | string[] | undefined;
    path?: string | string[] | undefined;
    source?: string | string[] | undefined;
    medium?: string | string[] | undefined;
    campaign?: string | string[] | undefined;
    content?: string | string[] | undefined;
  }>;
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default async function CampaignLinksPage({
  searchParams,
}: CampaignLinksPageProps) {
  await requirePermission('academy:manage');
  const locale = await getAdminRequestLocale();
  const copy = getCampaignLinkBuilderCopy(locale);
  const common = getCommonDictionary(locale);
  const params = searchParams ? await searchParams : undefined;
  const submitted = first(params?.build) === '1';
  const input = {
    pathname: first(params?.path),
    source: first(params?.source),
    medium: first(params?.medium),
    campaign: first(params?.campaign),
    content: first(params?.content),
  };
  const result = submitted ? buildCampaignTaggedPath(input) : null;

  return (
    <main
      className="admin-shell"
      style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}
    >
      <section className="admin-dashboard">
        <div className="admin-content">
          <section className="admin-intro">
            <div>
              <p className="eyebrow">{copy.eyebrow}</p>
              <h1>{copy.title}</h1>
              <p>{copy.intro}</p>
            </div>
            <div className={styles.toolbar}>
              <Link href={localizeHref(locale, '/')}>{copy.back}</Link>
              <AdminLanguageSwitcher
                locale={locale}
                label={common.languageSelectorLabel}
              />
            </div>
          </section>

          <section className="admin-panel">
            <form
              className={styles.builderForm}
              method="get"
              action={localizeHref(locale, '/campaign-links')}
            >
              <input type="hidden" name="build" value="1" />

              <label className={styles.fieldWide}>
                <span>{copy.pathname}</span>
                <input
                  type="text"
                  name="path"
                  defaultValue={input.pathname}
                  placeholder="/programmes"
                  maxLength={240}
                  required
                  dir="ltr"
                />
                <small>{copy.pathnameHint}</small>
              </label>

              <div className={styles.fieldGrid}>
                <label>
                  <span>{copy.source}</span>
                  <input
                    type="text"
                    name="source"
                    defaultValue={input.source}
                    maxLength={160}
                    required
                    dir="auto"
                  />
                </label>
                <label>
                  <span>
                    {copy.medium} <small>{copy.optional}</small>
                  </span>
                  <input
                    type="text"
                    name="medium"
                    defaultValue={input.medium}
                    maxLength={160}
                    dir="auto"
                  />
                </label>
                <label>
                  <span>
                    {copy.campaign} <small>{copy.optional}</small>
                  </span>
                  <input
                    type="text"
                    name="campaign"
                    defaultValue={input.campaign}
                    maxLength={160}
                    dir="auto"
                  />
                </label>
                <label>
                  <span>
                    {copy.content} <small>{copy.optional}</small>
                  </span>
                  <input
                    type="text"
                    name="content"
                    defaultValue={input.content}
                    maxLength={160}
                    dir="auto"
                  />
                </label>
              </div>

              <button type="submit">{copy.build}</button>
            </form>
          </section>

          {result && !result.ok ? (
            <section className="admin-panel" role="alert">
              <p className={styles.error}>{copy.error(result.error)}</p>
            </section>
          ) : null}

          {result?.ok ? (
            <section className="admin-panel">
              <div className={styles.resultBlock}>
                <div>
                  <p className="eyebrow">{copy.result}</p>
                  <p>{copy.resultHint}</p>
                </div>
                <input
                  className={styles.resultInput}
                  type="text"
                  value={result.value}
                  readOnly
                  aria-label={copy.result}
                  dir="ltr"
                />
              </div>
            </section>
          ) : null}

          <section className="admin-panel">
            <p className={styles.boundary}>{copy.boundary}</p>
          </section>
        </div>
      </section>
    </main>
  );
}
