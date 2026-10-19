# Releasing Luminol Noor on Google Play

Everything the app needs is in the code. Luminol Noor is **completely free**:
no account, no subscription, no in-app purchases, no ads. This is what the
product owner sets up in EAS and Play Console, in order. Answers below
describe the app as built; re-check them whenever a dependency or feature
changes.

## 1. What the app includes

Every feature is open to everyone, with no plan and no paywall:

- Communication board with parent photos and voice
- Calm corner and the first-then visual schedule
- All learning activities and all interest themes
- Up to 6 child profiles
- Built-in routines and social stories, the optional religious pack
- Routines and social stories made by the parent
- Parent dashboard, weekly report card, goals, PDF progress report, JSON
  export, clearing history, deleting profiles

There is no purchase code in the app: nothing connects to a store or a
server, and no data leaves the device.

## 2. EAS build

1. Create the Expo project and link it: `npx eas init` in `apps/kids`.
2. `npx eas build --platform android --profile production` makes the app
   bundle for Play. `--profile preview` makes an APK for a tablet.

No store keys or environment variables are needed, because the app sells
nothing.

## 3. Play Console: app content

| Section                  | Answer                                                                                                                                                                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Privacy policy           | `https://<website domain>/ar/noor/privacy`, the website page made from [PRIVACY_POLICY.md](./PRIVACY_POLICY.md)                                                                                                                                     |
| Ads                      | No, the app contains no ads                                                                                                                                                                                                                         |
| App access               | All functions are available without an account. Give reviewers these instructions: "The parent area asks a multiplication question written in Arabic words and offers four numbers; choose the product. Example: ما ناتج ضرب ثلاثة في أربعة؟ → 12." |
| Target audience          | Ages 5 and under, 6–8 and 9–12 (the app is for ages 3–10). Opt in to Designed for Families                                                                                                                                                          |
| Content rating (IARC)    | Reference / educational app; no violence, fear, sexuality, gambling, drugs or bad language; no user interaction or sharing between users; no location sharing; no digital purchases. Expected rating: Everyone / PEGI 3                             |
| News app                 | No                                                                                                                                                                                                                                                  |
| Health / government apps | No. The app supports therapy and does not diagnose or treat                                                                                                                                                                                         |
| Financial features       | None                                                                                                                                                                                                                                                |
| Data safety              | See section 4                                                                                                                                                                                                                                       |

## 4. Data safety form

"Collected" in Play's sense means sent off the device. Everything the child
does, every photo and every recording stays on the device, and the app
connects to no server, so nothing is collected or shared.

| Question                                                                                                     | Answer                                                               |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Does the app collect or share user data?                                                                     | No                                                                   |
| Can users request that data be deleted?                                                                      | Yes: everything on the device is deleted with the profile or the app |
| Device or other IDs, financial info, location, contacts, messages, photos, audio, files, web history, health | Not collected                                                        |

## 5. Designed for Families checklist

- [x] No ads and no ads SDKs.
- [x] The advertising id permission is blocked in `app.json` and the app
      sends no device identifiers. Unused biometric permissions that
      libraries add are blocked too.
- [x] No location, contacts or account sign-in.
- [x] Camera, microphone and photos are only requested when a parent adds a
      photo or a recording, with Arabic explanations.
- [x] External links and settings are behind the parental gate.
- [x] No chat, sharing between users or user-generated content visible to
      others.
- [x] Data is encrypted on the device (SQLCipher); Android backup is off.
- [ ] Every child-facing line, image and recording approved by the Luminol
      Psy specialist (see the open items in [ROADMAP.md](./ROADMAP.md)).

## 6. Store listing

**App name (30 characters max):** لومينول نور: تعلّم وتواصل

**Short description (80 max):**
ألعاب تعلّم هادئة ولوحة كلام بالعربية للأطفال من 3 إلى 10 سنوات.

**Full description:**

لومينول نور تطبيق عربي هادئ للأطفال من 3 إلى 10 سنوات، ومنهم الأطفال ذوو طيف
التوحّد. صمّمه فريق لومينول أكاديمي مع أخصائيين، ليساعد الطفل على التعلّم
والتواصل بلا ضغط.

• لوحة كلام بالصور مع صوت، ويمكنك إضافة صورك وصوتك.
• ألعاب تتكيّف مع طفلك: المطابقة والفرز والذاكرة والأنماط والحروف والأرقام
والمشاعر وتبادل الأدوار.
• لا أخطاء محبطة: الإجابة الخاطئة تضيف مساعدة فقط.
• جدول بصري «أوّلًا ثمّ» وركن هدوء للتنفّس.
• روتين يومي وقصص اجتماعية، وحزمة دينية اختيارية للوضوء والصلاة ورمضان والعيد.
• لوحة متابعة للوالدين وتقرير يمكن مشاركته مع الأخصائي.
• بلا إعلانات وبلا حساب، والبيانات مشفّرة على الجهاز.

مجاني بالكامل: كل الألعاب والمواضيع وحتى 6 أطفال والروتين الخاص وتقرير PDF،
بلا اشتراك ولا مشتريات.

**English (for the default listing translation):**
Luminol Noor is a calm Arabic learning app for children aged 3 to 10,
including autistic children: a picture communication board with voice,
adaptive games with no failure states, a first-then schedule, a calm corner,
routines and social stories, an optional religious pack, and a parent
dashboard with a shareable report. No ads, no account, data encrypted on the
device. Completely free: every activity and theme, up to 6 children, your own
routines and the PDF report, with no subscription and no purchases.

**Graphics still needed:** a 512 × 512 icon (export `assets/brand/icon.png`
at 512), a 1024 × 500 feature graphic, and tablet screenshots (7" and 10")
taken from a preview build.
