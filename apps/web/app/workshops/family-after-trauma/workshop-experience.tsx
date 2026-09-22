'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, type KeyboardEvent } from 'react';

import { AcademyLogo } from '../../../components/academy-logo';
import styles from './page.module.css';

const topics = [
  {
    id: 'understand',
    label: 'فهم الصدمة',
    number: '01',
    title: 'ماذا يحدث للإنسان بعد حدث صادم؟',
    body: 'نبدأ بفهم مبسّط لاستجابة الجسم والعقل للخطر، ولماذا قد تستمر بعض ردود الفعل حتى بعد انتهاء الحدث.',
    points: [
      'الفرق بين الضغط النفسي والحدث الصادم',
      'ردود الفعل الجسدية والانفعالية والسلوكية الشائعة',
      'لماذا تختلف الاستجابة من شخص إلى آخر',
    ],
  },
  {
    id: 'family',
    label: 'داخل الأسرة',
    number: '02',
    title: 'كيف تمتد آثار الصدمة إلى العلاقات الأسرية؟',
    body: 'قد يتغيّر التواصل والأدوار اليومية من دون أن يفهم أفراد الأسرة سبب ما يحدث. سنقرأ هذه التغيّرات بلغة إنسانية غير لومِيّة.',
    points: [
      'الانسحاب أو الغضب أو فرط الحذر',
      'تغيّر النوم والروتين وتقاسم المسؤوليات',
      'دوائر سوء الفهم التي تزيد التوتر داخل البيت',
    ],
  },
  {
    id: 'support',
    label: 'مساندة عملية',
    number: '03',
    title: 'كيف نساند من دون ضغط أو إلغاء؟',
    body: 'المساندة الفعّالة لا تعني إجبار الشخص على الكلام. نتعلّم خطوات صغيرة تعيد الأمان والاختيار إلى الحياة اليومية.',
    points: [
      'الاستماع من دون استجواب أو وعود غير واقعية',
      'دعم الروتين والراحة والاختيارات البسيطة',
      'عبارات عملية بديلة عن اللوم والتقليل',
    ],
  },
  {
    id: 'help',
    label: 'طلب المساعدة',
    number: '04',
    title: 'متى يصبح التقييم المتخصص خطوة مهمة؟',
    body: 'نوضّح حدود الدعم الأسري، والإشارات التي تستحق استشارة مختص، وكيف نعرض المساعدة بطريقة تحترم كرامة الشخص.',
    points: [
      'استمرار المعاناة أو تدهور الأداء اليومي',
      'علامات الخطر التي تتطلب مساعدة عاجلة',
      'كيف نقترح الدعم المهني من دون وصم',
    ],
  },
] as const;

const faqs = [
  {
    question: 'هل اللقاء مجاني؟',
    answer:
      'نعم. المشاركة مجانية، لكن التسجيل المسبق عبر استمارة Tally المعتمدة ضروري حتى تصلك معلومات الانضمام.',
  },
  {
    question: 'لمن صُمّم هذا اللقاء؟',
    answer:
      'لأفراد الأسرة والمهتمين بالتثقيف النفسي، وكذلك للطلبة والممارسين في مجالات المساعدة الذين يريدون مدخلًا واضحًا وداعمًا للموضوع.',
  },
  {
    question: 'كيف أحصل على رابط الحضور؟',
    answer:
      'بعد إتمام التسجيل، تُرسل معلومات الانضمام والتذكيرات بصورة خاصة عبر بيانات الاتصال التي أدخلتها في الاستمارة.',
  },
  {
    question: 'هل اللقاء بديل عن العلاج أو التقييم النفسي؟',
    answer:
      'لا. اللقاء توعوي عام، ولا يقدّم تشخيصًا فرديًا أو علاجًا، ولا يطلب من المشاركين مشاركة تجارب شخصية مؤلمة.',
  },
  {
    question: 'هل ستكون هناك إعادة أو تسجيل؟',
    answer:
      'لا نعد بتسجيل أو إعادة في هذه الصفحة. أي مادة لاحقة ستُعلن فقط إذا اعتمدتها الأكاديمية بعد اللقاء.',
  },
] as const;

const calendarHref = '/ar/workshops/family-after-trauma/calendar';

export function WorkshopExperience({
  registrationHref,
}: {
  registrationHref: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTopic, setActiveTopic] = useState(0);
  const privacyDialog = useRef<HTMLDialogElement>(null);

  function selectTopic(index: number) {
    setActiveTopic(index);
    document.getElementById(`topic-tab-${topics[index]?.id}`)?.focus();
  }

  function handleTopicKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight') {
      nextIndex = (index - 1 + topics.length) % topics.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index + 1) % topics.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = topics.length - 1;
    }

    if (nextIndex === null) return;
    event.preventDefault();
    selectTopic(nextIndex);
  }

  const topic = topics[activeTopic] ?? topics[0];

  return (
    <div className={styles.page} lang="ar" dir="rtl">
      <a className={styles.skipLink} href="#main-content">
        انتقل إلى المحتوى الرئيسي
      </a>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link
            className={styles.brand}
            href="/ar"
            aria-label="الصفحة الرئيسية لأكاديمية لومينول"
          >
            <AcademyLogo />
          </Link>

          <button
            className={styles.menuButton}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="workshop-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span>{menuOpen ? 'إغلاق' : 'القائمة'}</span>
            <span className={styles.menuIcon} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>

          <nav
            id="workshop-navigation"
            className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}
            aria-label="التنقل في صفحة اللقاء"
            onKeyDown={(event) => {
              if (event.key === 'Escape') setMenuOpen(false);
            }}
          >
            <a href="#about" onClick={() => setMenuOpen(false)}>
              عن اللقاء
            </a>
            <a href="#topics" onClick={() => setMenuOpen(false)}>
              المحاور
            </a>
            <a href="#presenter" onClick={() => setMenuOpen(false)}>
              الأستاذة
            </a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>
              الأسئلة الشائعة
            </a>
          </nav>

          <a
            className={styles.headerCta}
            href={registrationHref}
            rel="noreferrer"
            data-registration-link
          >
            سجّل مجانًا
          </a>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="workshop-title">
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>لقاء توعوي مجاني · أونلاين</p>
            <h1 id="workshop-title">
              الأسرة بعد الصدمة النفسية
              <span>كيف نفهم ونساند؟</span>
            </h1>
            <p className={styles.heroLede}>
              لقاء واضح وعملي يساعد الأسرة على فهم ما قد يتغيّر بعد الصدمة،
              وبناء مساندة أكثر أمانًا وهدوءًا واحترامًا.
            </p>
            <div className={styles.heroActions}>
              <a
                className={styles.primaryCta}
                href={registrationHref}
                rel="noreferrer"
                data-registration-link
              >
                احجز مكانك مجانًا <span aria-hidden="true">↗</span>
              </a>
              <a className={styles.secondaryCta} href={calendarHref} download>
                أضف الموعد إلى التقويم <span aria-hidden="true">↓</span>
              </a>
            </div>
            <p className={styles.registrationNote}>
              التسجيل يتم عبر استمارة Tally المعتمدة. معلومات الانضمام تُرسل
              للمسجلين فقط.
            </p>
          </div>

          <aside className={styles.eventCard} aria-label="تفاصيل اللقاء">
            <div className={styles.eventVisual}>
              <Image
                className={styles.eventImage}
                src="/workshops/family-after-trauma/family-support.webp"
                alt="صورة توضيحية لأسرة تتحاور بهدوء وتقدّم المساندة"
                width={1600}
                height={800}
                sizes="(max-width: 768px) 100vw, (max-width: 1088px) 55vw, 42vw"
                preload
              />
              <div className={styles.eventImageCaption}>
                <span>صورة توضيحية</span>
                <strong>الفهم يبدأ بالإنصات</strong>
              </div>
            </div>
            <dl>
              <div>
                <dt>التاريخ</dt>
                <dd>الجمعة 25 سبتمبر 2026</dd>
              </div>
              <div>
                <dt>الوقت</dt>
                <dd>20:00 بتوقيت الجزائر</dd>
              </div>
              <div>
                <dt>التقديم</dt>
                <dd>الأستاذة خداوي فطومة</dd>
              </div>
              <div>
                <dt>الصيغة</dt>
                <dd>مباشر أونلاين</dd>
              </div>
            </dl>
          </aside>
        </section>

        <section
          id="about"
          className={styles.intro}
          aria-labelledby="about-title"
        >
          <div>
            <p className={styles.sectionLabel}>لماذا هذا اللقاء؟</p>
            <h2 id="about-title">
              حين تتألم الأسرة، لا يتكلم الجميع بالطريقة نفسها.
            </h2>
          </div>
          <div className={styles.introCopy}>
            <p>
              قد يظهر أثر الصدمة في صمت أحد أفراد الأسرة، أو غضبه، أو خوفه، أو
              اضطراب روتينه. ما يبدو عنادًا أو ابتعادًا قد يكون محاولة للحماية.
            </p>
            <p>
              هذا اللقاء يمنحك خريطة أولية لفهم هذه الاستجابات، ويقدّم أدوات
              مساندة يومية من دون تشخيص، ومن دون دفع أي شخص إلى الحديث قبل أن
              يكون مستعدًا.
            </p>
          </div>
        </section>

        <section
          id="topics"
          className={styles.topicsSection}
          aria-labelledby="topics-title"
        >
          <div className={styles.sectionHeading}>
            <p className={styles.sectionLabel}>محاور اللقاء</p>
            <h2 id="topics-title">من الفهم إلى المساندة، خطوة بخطوة.</h2>
            <p>
              اختر أي محور للاطلاع على ما سنناقشه. يمكنك أيضًا التنقل بين
              التبويبات بمفاتيح الأسهم.
            </p>
          </div>

          <div className={styles.topicExperience}>
            <div
              className={styles.tabList}
              role="tablist"
              aria-label="محاور اللقاء"
            >
              {topics.map((item, index) => (
                <button
                  id={`topic-tab-${item.id}`}
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTopic === index}
                  aria-controls={`topic-panel-${item.id}`}
                  tabIndex={activeTopic === index ? 0 : -1}
                  className={activeTopic === index ? styles.activeTab : ''}
                  onClick={() => setActiveTopic(index)}
                  onKeyDown={(event) => handleTopicKeyDown(event, index)}
                >
                  <span>{item.number}</span>
                  {item.label}
                </button>
              ))}
            </div>

            <article
              id={`topic-panel-${topic.id}`}
              className={styles.topicPanel}
              role="tabpanel"
              aria-labelledby={`topic-tab-${topic.id}`}
              tabIndex={0}
            >
              <span>{topic.number}</span>
              <h3>{topic.title}</h3>
              <p>{topic.body}</p>
              <ul>
                {topic.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className={styles.audience} aria-labelledby="audience-title">
          <div className={styles.audienceCopy}>
            <p className={styles.sectionLabel}>لمن هذا اللقاء؟</p>
            <h2 id="audience-title">
              مساحة مفيدة لكل من يريد أن يفهم قبل أن يتصرف.
            </h2>
            <p>
              لا تحتاج إلى مشاركة أي تجربة شخصية. يمكنك الحضور للاستماع والتعلّم
              فقط.
            </p>
          </div>
          <ul>
            <li>
              <span>01</span> أفراد الأسرة ومقدّمو الدعم
            </li>
            <li>
              <span>02</span> المهتمون بالتثقيف النفسي
            </li>
            <li>
              <span>03</span> طلبة علم النفس والتخصصات القريبة
            </li>
            <li>
              <span>04</span> الممارسون في مجالات المساعدة
            </li>
          </ul>
        </section>

        <section
          id="presenter"
          className={styles.presenter}
          aria-labelledby="presenter-title"
        >
          <div className={styles.presenterPortrait}>
            <Image
              className={styles.presenterImage}
              src="/workshops/family-after-trauma/fettouma-professional.webp"
              alt="الأستاذة خداوي فطومة، مقدّمة اللقاء"
              width={1122}
              height={1402}
              sizes="(max-width: 1088px) 100vw, 42vw"
              loading="eager"
            />
            <div className={styles.presenterExperience}>
              <span>خبرة ميدانية</span>
              <strong>+30</strong>
              <small>سنة</small>
            </div>
          </div>
          <div className={styles.presenterCopy}>
            <p className={styles.sectionLabel}>تقديم اللقاء</p>
            <h2 id="presenter-title">الأستاذة خداوي فطومة</h2>
            <p className={styles.presenterRole}>
              مؤسسة أكاديمية لومينول · معالجة وخبيرة في الإرشاد الأسري والزوجي
            </p>
            <p>
              تمتلك أكثر من 30 سنة من الخبرة الميدانية، إلى جانب خبرة في التدريس
              الجامعي والتكوين. تقدّم هذا اللقاء بلغة علمية واضحة تحافظ على
              الدفء الإنساني وحدود التوعية العامة.
            </p>
            <div className={styles.presenterTags} aria-label="مجالات الخبرة">
              <span>الإرشاد الأسري</span>
              <span>العلاج الزوجي</span>
              <span>التدريس الجامعي</span>
            </div>
          </div>
        </section>

        <section className={styles.joining} aria-labelledby="joining-title">
          <div className={styles.sectionHeading}>
            <p className={styles.sectionLabel}>خطوات الانضمام</p>
            <h2 id="joining-title">أربع خطوات بسيطة، بلا حساب جديد.</h2>
          </div>
          <ol>
            <li>
              <span>01</span>
              <div>
                <h3>سجّل عبر Tally</h3>
                <p>استخدم الاستمارة المعتمدة وأدخل بيانات اتصال صحيحة.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>راجع التأكيد</h3>
                <p>ستصلك رسالة تأكيد وتذكيرات مرتبطة بهذا اللقاء.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>احتفظ بالموعد</h3>
                <p>أضف 25 سبتمبر، 20:00 بتوقيت الجزائر إلى تقويمك.</p>
              </div>
            </li>
            <li>
              <span>04</span>
              <div>
                <h3>انضم من الرسالة الخاصة</h3>
                <p>استخدم معلومات الانضمام التي تصلك بعد التسجيل.</p>
              </div>
            </li>
          </ol>
        </section>

        <section id="faq" className={styles.faq} aria-labelledby="faq-title">
          <div className={styles.faqIntro}>
            <p className={styles.sectionLabel}>قبل أن تسجّل</p>
            <h2 id="faq-title">أسئلة شائعة</h2>
            <p>
              إذا كان سؤالك متعلقًا بالتسجيل، ستجد غالبًا الإجابة هنا. لا ترسل
              معلومات صحية أو شديدة الحساسية عبر الاستمارة.
            </p>
          </div>
          <div className={styles.faqList}>
            {faqs.map((item, index) => (
              <details key={item.question}>
                <summary>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {item.question}
                  <i aria-hidden="true">+</i>
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={styles.finalCta} aria-labelledby="final-cta-title">
          <div>
            <p className={styles.sectionLabel}>الجمعة 25 سبتمبر · 20:00</p>
            <h2 id="final-cta-title">
              افهم أكثر. ساند بلطف. وابدأ بخطوة آمنة.
            </h2>
          </div>
          <div className={styles.finalActions}>
            <a
              className={styles.primaryCta}
              href={registrationHref}
              rel="noreferrer"
              data-registration-link
            >
              سجّل مجانًا عبر Tally <span aria-hidden="true">↗</span>
            </a>
            <button
              type="button"
              className={styles.privacyButton}
              onClick={() => privacyDialog.current?.showModal()}
            >
              كيف نحمي خصوصيتك؟
            </button>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <AcademyLogo />
        <p>لقاء توعوي عام · ليس بديلًا عن التقييم أو العلاج النفسي</p>
        <Link href="/ar">العودة إلى موقع الأكاديمية</Link>
      </footer>

      <div className={styles.mobileBar} aria-label="التسجيل السريع">
        <div>
          <strong>لقاء مجاني</strong>
          <span>25 سبتمبر · 20:00</span>
        </div>
        <a href={registrationHref} rel="noreferrer" data-registration-link>
          سجّل الآن
        </a>
      </div>

      <dialog
        ref={privacyDialog}
        className={styles.privacyDialog}
        aria-labelledby="privacy-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div>
          <button
            type="button"
            className={styles.dialogClose}
            aria-label="إغلاق نافذة الخصوصية"
            onClick={() => privacyDialog.current?.close()}
          >
            ×
          </button>
          <p className={styles.sectionLabel}>خصوصيتك أولًا</p>
          <h2 id="privacy-title">ما الذي يحدث عند التسجيل؟</h2>
          <p>
            تنتقل إلى استمارة Tally الحالية التابعة للقاء. تُستخدم بيانات
            الاتصال التي تختار إدخالها لتأكيد التسجيل وإرسال معلومات اللقاء وفق
            الموافقات الظاهرة في الاستمارة.
          </p>
          <ul>
            <li>لا تعرض هذه الصفحة سجلات المشاركين أو أي بيانات داخلية.</li>
            <li>لا نطلب تشخيصًا أو أعراضًا أو تاريخًا علاجيًا.</li>
            <li>معلومات الانضمام الخاصة لا تُنشر على هذه الصفحة.</li>
          </ul>
          <button
            type="button"
            className={styles.dialogAction}
            onClick={() => privacyDialog.current?.close()}
          >
            فهمت
          </button>
        </div>
      </dialog>
    </div>
  );
}
