# Releasing Luminol Noor on Google Play

Everything the app needs is in the code. This is what the product owner sets
up in RevenueCat, EAS and Play Console, in order. Answers below describe the
app as built; re-check them whenever a dependency or feature changes.

## 1. Plans

| Free (one child)                                                                                                          | Plus (subscription)                            |
| ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Communication board with parent photos and voice                                                                          | Every activity in the schedule                 |
| Calm corner                                                                                                               | Every interest theme                           |
| 8 activities: touch and see, matching, colour sorting, memory, counting, letter matching, faces and feelings, turn-taking | Up to 6 child profiles                         |
| Built-in routines and social stories, religious pack                                                                      | Routines and social stories made by the parent |
| Dashboard, goals, JSON export, clearing history, deleting profiles                                                        | PDF progress report                            |

The rules live in `packages/kids-learning/src/plans.ts`. When a
subscription ends, nothing a child already has is taken away: existing
profiles, routines and stories stay. Only new ones need Plus again.

## 2. RevenueCat

1. Create a RevenueCat project and add an Android app with the package
   `com.luminolacademy.noor`.
2. Connect Play Console with a service account, as RevenueCat's setup guide
   describes.
3. In Play Console create two auto-renewing subscriptions, for example
   `noor_plus_monthly` and `noor_plus_annual`, each with one base plan. A free
   trial is optional; the paywall shows the store's own price either way.
4. In RevenueCat create the entitlement **`plus`** (the app checks exactly this
   identifier) and attach both products.
5. Create the offering `default`, mark it current, and add the packages
   `$rc_monthly` and `$rc_annual`.
6. Copy the public Google Play SDK key (it starts with `goog_`). It identifies
   the app and is not a secret, but it is kept out of the repository anyway.

The app never calls `collectDeviceIdentifiers` or sets attributes, so
RevenueCat only receives its own anonymous app user id and purchase data.

## 3. EAS build

1. Create the Expo project and link it: `npx eas init` in `apps/kids`.
2. In the EAS dashboard, add the environment variable
   `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` with the `goog_` key to the
   `production` and `preview` environments (the build profiles in
   `eas.json` use those environments).
3. `npx eas build --platform android --profile production` makes the app
   bundle for Play. `--profile preview` makes an APK for a tablet.

A build without the key still runs, on Free only, and the Plus screen says
that subscriptions are not available in this build.

## 4. Play Console: app content

| Section                  | Answer                                                                                                                                                                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Privacy policy           | `https://<website domain>/ar/noor/privacy`, the website page made from [PRIVACY_POLICY.md](./PRIVACY_POLICY.md)                                                                                                                                     |
| Ads                      | No, the app contains no ads                                                                                                                                                                                                                         |
| App access               | All functions are available without an account. Give reviewers these instructions: "The parent area asks a multiplication question written in Arabic words and offers four numbers; choose the product. Example: ما ناتج ضرب ثلاثة في أربعة؟ → 12." |
| Target audience          | Ages 5 and under, 6–8 and 9–12 (the app is for ages 3–10). Opt in to Designed for Families                                                                                                                                                          |
| Content rating (IARC)    | Reference / educational app; no violence, fear, sexuality, gambling, drugs or bad language; no user interaction or sharing between users; no location sharing; digital purchases: yes. Expected rating: Everyone / PEGI 3                           |
| News app                 | No                                                                                                                                                                                                                                                  |
| Health / government apps | No. The app supports therapy and does not diagnose or treat                                                                                                                                                                                         |
| Financial features       | None                                                                                                                                                                                                                                                |
| Data safety              | See section 5                                                                                                                                                                                                                                       |

## 5. Data safety form

"Collected" in Play's sense means sent off the device. Everything the child
does, every photo and every recording stays on the device, so none of it is
declared. Only the subscription check leaves the device.

| Question                                                                                                    | Answer                                                                                                    |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Does the app collect or share user data?                                                                    | Yes (collected only, for the subscription check)                                                          |
| Is all collected data encrypted in transit?                                                                 | Yes                                                                                                       |
| Can users request that data be deleted?                                                                     | Yes: everything on the device is deleted with the profile or the app; RevenueCat data on request by email |
| Device or other IDs                                                                                         | Collected, not shared. RevenueCat's random app user id. Purpose: app functionality. Required              |
| Financial info → Purchase history                                                                           | Collected, not shared. Purpose: app functionality (unlocking Plus). Optional (only when a parent buys)    |
| App info and performance, location, contacts, messages, photos, audio, files, calendar, web history, health | Not collected                                                                                             |

Compare these answers with RevenueCat's current Play data-safety guidance
before submitting, as it describes exactly what its SDK sends.

## 6. Designed for Families checklist

- [x] No ads and no ads SDKs.
- [x] The advertising id permission is blocked in `app.json` and the app
      sends no device identifiers.
- [x] No location, contacts or account sign-in.
- [x] Camera, microphone and photos are only requested when a parent adds a
      photo or a recording, with Arabic explanations.
- [x] Purchases, external links and settings are behind the parental gate.
- [x] No chat, sharing between users or user-generated content visible to
      others.
- [x] Data is encrypted on the device (SQLCipher); Android backup is off.
- [ ] Every child-facing line, image and recording approved by the Luminol
      Psy specialist (see the open items in [ROADMAP.md](./ROADMAP.md)).

## 7. Store listing

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

مجاني مع طفل واحد. نور بلس يضيف كل الألعاب والمواضيع وحتى 6 أطفال والروتين
الخاص وتقرير PDF.

**English (for the default listing translation):**
Luminol Noor is a calm Arabic learning app for children aged 3 to 10,
including autistic children: a picture communication board with voice,
adaptive games with no failure states, a first-then schedule, a calm corner,
routines and social stories, an optional religious pack, and a parent
dashboard with a shareable report. No ads, no account, data encrypted on the
device. Free with one child; Noor Plus adds every activity and theme, up to 6
children, your own routines and the PDF report.

**Graphics still needed:** a 512 × 512 icon (export `assets/brand/icon.png`
at 512), a 1024 × 500 feature graphic, and tablet screenshots (7" and 10")
taken from a preview build.

## 8. Testing purchases

1. Upload the first production build to the internal testing track.
2. Add the testers' Google accounts as license testers in Play Console, so
   purchases are free and renew quickly.
3. On a tablet: buy monthly, restore after reinstalling, cancel from
   "إدارة الاشتراك" and check that Plus ends and nothing a child had is lost.
