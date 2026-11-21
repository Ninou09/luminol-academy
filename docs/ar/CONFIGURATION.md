<div dir="rtl">

# الإعداد والنشر

[English](../CONFIGURATION.md) · **العربية**

هذا هو المرجع لكل متغيّر بيئة تقرؤه المنصّة، ومكان ضبطه، وطريقة وصول التغييرات إلى الإنتاج.

## المبادئ

- الملف `.env.example` هو قالب التطوير المحلي. يحتوي على قيم شكلية فقط، ويمكن إضافته إلى المستودع بأمان.
- تُحفظ قيم الاستضافة في **Vercel ← Project ← Settings ← Environment Variables** للتطبيقات، وفي **GitHub ← Settings ← Secrets and variables ← Actions** للعمّال المجدولين.
- تُدمج المتغيّرات التي تبدأ بالبادئة `NEXT_PUBLIC_` في حزمة المتصفح وقت البناء. لا تمنح أي سرّ هذه البادئة أبدًا.
- يتطلّب تغيير متغيّر يبدأ بـ `NEXT_PUBLIC_` نشرًا جديدًا، وكذلك تُطبَّق متغيّرات الخادم مع النشر التالي.
- اضبط المتغيّرات المزدوجة معًا. تبقى تنبيهات Telegram معطّلة حتى تتوفّر القيمتان، أما تحقّق Turnstile فيبدأ بمجرّد وجود `TURNSTILE_SECRET_KEY`، لذا اضبط مفتاح الموقع في التغيير نفسه.

## المتغيّرات المشتركة

| المتغيّر                                             | النطاق                     | إلزامي               | الغرض                                                             |
| ---------------------------------------------------- | -------------------------- | -------------------- | ----------------------------------------------------------------- |
| `DATABASE_URL`                                       | web وportal وadmin وworker | نعم                  | سلسلة الاتصال بـ PostgreSQL التي يستخدمها Prisma                  |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`                  | portal وadmin وweb         | نعم للبوابة والإدارة | مفتاح Clerk العام (`pk_live_…` في الإنتاج)                        |
| `CLERK_SECRET_KEY`                                   | portal وadmin وweb         | نعم للبوابة والإدارة | مفتاح Clerk السرّي (`sk_live_…` في الإنتاج)                       |
| `CLERK_WEBHOOK_SECRET`                               | web وadmin                 | لمزامنة المستخدمين   | التحقق من توقيعات خطافات Clerk                                    |
| `NEXT_PUBLIC_APP_URL`                                | الكل                       | يُنصح به             | الأصل المعتمد للروابط المطلقة، وتستخدمه البوابة للعودة إلى الموقع |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`                      | web                        | لإدارة المحتوى       | معرّف مشروع Sanity                                                |
| `NEXT_PUBLIC_SANITY_DATASET`                         | web                        | لإدارة المحتوى       | مجموعة بيانات Sanity، وعادةً `production`                         |
| `SANITY_API_TOKEN`                                   | web                        | للكتابة في المحتوى   | رمز Sanity على جهة الخادم                                         |
| `SANITY_STUDIO_PROJECT_ID` / `SANITY_STUDIO_DATASET` | studio                     | نعم للاستوديو        | المقابلان في الاستوديو لمتغيّرات Sanity                           |

## الموقع العام (`apps/web`)

| المتغيّر                                                  | إلزامي        | الغرض                                                                                                                      |
| --------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                    | يُنصح به      | أصل الموقع المعتمد للبيانات الوصفية وخريطة الموقع وروابط Open Graph                                                        |
| `NEXT_PUBLIC_PORTAL_URL`                                  | اختياري       | أصل بوابة المتعلّمين لرابط **حسابي**، وقيمته الافتراضية بوابة الإنتاج                                                      |
| `ANTHROPIC_API_KEY`                                       | للمساعد       | يفعّل إجابات الذكاء الاصطناعي في المساعد العام؛ ومن دونه يعرض المساعد قنوات التواصل                                        |
| `LUMINOL_ASSISTANT_MODEL`                                 | اختياري       | نموذج Claude للمساعد، والافتراضي `claude-haiku-5-5`                                                                        |
| `LUMINOL_ASSISTANT_DISABLED`                              | اختياري       | اضبطه على `1` لإخفاء المساعد كليًا                                                                                         |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | اختياري، كزوج | حماية نماذج الطلبات من الرسائل المزعجة عبر Cloudflare Turnstile؛ ومن دونها يحمي النماذجَ حقلٌ مخفي وحدٌّ للطلبات لكل عنوان |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID`                 | اختياري، كزوج | تنبيه فوري للفريق عبر Telegram لكل طلب جديد                                                                                |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`                             | اختياري       | رقم واتساب بالأرقام الدولية، والافتراضي الرقم الرسمي للأكاديمية                                                            |
| `NEXT_PUBLIC_BOOKING_URL`                                 | اختياري       | رابط حجز HTTPS (مثل Cal.com) يظهر بجانب نموذج الاستشارة                                                                    |
| `NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS`                     | اختياري       | اضبطه على `1` بعد تفعيل Vercel Web Analytics في المشروع                                                                    |
| `RESEND_API_KEY` / `NOTIFICATION_FROM_EMAIL`              | اختياري، كزوج | إرسال بريد إقرار لأصحاب الطلبات المرسلة بالبريد                                                                            |

## الإدارة (`apps/admin`)

| المتغيّر                                                                 | الافتراضي       | الغرض                                                          |
| ------------------------------------------------------------------------ | --------------- | -------------------------------------------------------------- |
| `LUMINOL_AI_PROVIDER_MODE`                                               | `OFF`           | اضبطه على `OPENAI` لتفعيل مشغّل الذكاء الاصطناعي               |
| `OPENAI_API_KEY`                                                         | –               | إلزامي عند تفعيل مشغّل الذكاء الاصطناعي                        |
| `LUMINOL_AI_MODEL`                                                       | افتراضي المزوّد | النموذج الذي يستخدمه المشغّل                                   |
| `LUMINOL_AI_MONTHLY_BUDGET_USD`                                          | –               | حدّ الإنفاق الشهري الصارم                                      |
| `LUMINOL_AI_INPUT_USD_PER_MILLION` / `LUMINOL_AI_OUTPUT_USD_PER_MILLION` | –               | أسعار الرموز المستخدمة في احتساب الميزانية                     |
| `LUMINOL_AI_TIMEOUT_MS`                                                  | –               | مهلة طلبات المزوّد                                             |
| `CRON_SECRET`                                                            | –               | سرّ مصادقة (32 محرفًا على الأقل) لنقطة النشر الاجتماعي المجدول |

## العمّال (`packages/worker`)

تعمل من GitHub Actions وفق جدول، لذا تُحفظ قيمها في أسرار Actions.

| المتغيّر                                                   | الافتراضي | الغرض                                                                     |
| ---------------------------------------------------------- | --------- | ------------------------------------------------------------------------- |
| `RESEND_API_KEY` / `NOTIFICATION_FROM_EMAIL`               | –         | إرسال الإشعارات المنتظرة بالبريد                                          |
| `NOTIFICATION_PROVIDER_TIMEOUT_MS`                         | `30000`   | مهلة مزوّد البريد                                                         |
| `NOTIFICATION_WORKER_BATCH_SIZE`                           | `25`      | عدد الإشعارات في كل تشغيل                                                 |
| `NOTIFICATION_WORKER_INTERVAL_MS`                          | `5000`    | فاصل الاستطلاع لعامل مستضاف بشكل مستمر                                    |
| `LUMINOL_SOCIAL_PUBLISHING_WORKER_MODE`                    | `OFF`     | اضبطه على `INSTAGRAM_REELS_DUE` لنشر مقاطع Reels الموافق عليها والمستحقّة |
| `LUMINOL_SOCIAL_PUBLISHING_WORKER_BATCH_SIZE`              | `10`      | عدد المقاطع في كل تشغيل                                                   |
| `LUMINOL_SOCIAL_PUBLISHING_WORKER_INTERVAL_MS`             | `15000`   | فاصل الاستطلاع لعامل مستضاف بشكل مستمر                                    |
| `LUMINOL_META_PUBLISHING_MODE`                             | `OFF`     | اضبطه على `INSTAGRAM_REELS` للسماح بالإرسال إلى Meta                      |
| `LUMINOL_META_GRAPH_VERSION` / `LUMINOL_META_ACCESS_TOKEN` | –         | إصدار Meta Graph API ورمز الوصول على جهة الخادم                           |
| `LUMINOL_META_REQUEST_TIMEOUT_MS`                          | `10000`   | مهلة طلبات Meta                                                           |

يتطلّب النشر الاجتماعي المجدول تفعيل **كلٍّ من** `LUMINOL_SOCIAL_PUBLISHING_WORKER_MODE` و`LUMINOL_META_PUBLISHING_MODE`.

## الاختبار

| المتغيّر                    | الغرض                                                                   |
| --------------------------- | ----------------------------------------------------------------------- |
| `TEST_DATABASE_URL`         | قاعدة بيانات اختبارات التكامل؛ ويوفّر التكامل المستمر PostgreSQL مؤقتًا |
| `LUMINOL_PROGRAMME_FIXTURE` | يقدّم فهرس برامج اختباريًا ثابتًا لخادم اختبارات المتصفح                |

## النشر

### مشاريع Vercel

| المشروع                  | المجلد الجذري | رابط الإنتاج                              |
| ------------------------ | ------------- | ----------------------------------------- |
| `luminol-academy-web`    | `apps/web`    | https://luminol-academy-web.vercel.app    |
| `luminol-academy-portal` | `apps/portal` | https://luminol-academy-portal.vercel.app |
| `luminol-academy-admin`  | `apps/admin`  | https://luminol-academy-admin.vercel.app  |

يثبّت كل مشروع الاعتماديات عبر `pnpm install --frozen-lockfile` ويبني عبر `pnpm build`، الذي يولّد عميل Prisma قبل `next build`. يتخطّى أمرُ تجاهل البناء المشاريعَ التي لم تتغيّر شيفرتها، وقواعده موثّقة في [اختيار عمليات النشر على Vercel](../deployments.md) (بالإنجليزية).

يجري النشر التلقائي للفرع `main` (الإنتاج) وللفروع التي تبدأ أسماؤها بـ `preview-*` (المعاينات). لا تُنشر الفروع الأخرى تلقائيًا.

### مسار الإصدار

1. أنشئ فرعًا من `main` وافتح طلب دمج.
2. يجب أن ينجح الفحص الإلزامي `quality`. أصلح الإخفاقات على الفرع، ولا تتجاوز الفحص أبدًا.
3. ادمج الطلب، فيبني Vercel المشاريع المتأثّرة ويرقّيها إلى الإنتاج.
4. تحقّق من روابط الإنتاج. يعمل فحص السلامة المجدول أيضًا كل 6 ساعات.
5. إذا ظهر خلل في إصدار ما، استخدم **Vercel ← Deployments ← Instant Rollback** للمشروع المتأثّر، ثم أصلح المشكلة عبر طلب دمج جديد.

تصل ترحيلات قاعدة البيانات إلى الإنتاج عبر سير العمل المخصّص **production migrations**، ولا تُنفَّذ أبدًا من جهاز محلي.

### قائمة التحقق لبيئة إنتاج جديدة

- [ ] إنشاء نسخة **Production** في Clerk، وضبط مفتاحَي `pk_live_…` و`sk_live_…` في البوابة والإدارة
- [ ] توجيه `DATABASE_URL` إلى قاعدة بيانات الإنتاج وتطبيق الترحيلات
- [ ] ضبط `NEXT_PUBLIC_SITE_URL` و`NEXT_PUBLIC_APP_URL` و`NEXT_PUBLIC_PORTAL_URL` على النطاقات النهائية
- [ ] ضبط `ANTHROPIC_API_KEY` في مشروع الموقع إذا كان المطلوب أن يجيب المساعد
- [ ] ضبط أزواج Turnstile وTelegram وResend إذا كانت هذه الميزات مطلوبة
- [ ] إعادة نشر كل مشروع بعد تغيير متغيّراته

</div>
