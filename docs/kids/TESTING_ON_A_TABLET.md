# Trying Luminol Noor on an Android tablet

## Install the test APK

1. Copy `luminol-noor-test.apk` to the tablet (download it, or send it to
   yourself by email or a drive).
2. Open it. Android asks to allow installing apps from this source (the
   browser or the files app); allow it once, then tap **Install**.
3. Play Protect may warn that the app is unknown, because it was not installed
   from Google Play. Choose **Install anyway**.

The test build is signed with a development key, so it cannot be updated
from Google Play later; uninstall it before installing the store version.
It needs a 64-bit (arm64) device, which covers almost every Android tablet
sold in recent years.

## What is different in the test build

- Every feature is open: every activity, theme, up to 6 profiles, your own
  routines and the PDF report. The app is free, with nothing to buy.
- The database is encrypted with SQLCipher, as in the store version.
- Speech uses the tablet's Arabic text-to-speech voice until recordings are
  added. If nothing is heard, install an Arabic voice in Android settings
  (System → Languages → Text-to-speech → Google speech services → Install
  voice data → Arabic). The parent area says when no Arabic voice is found.

## A first walk through

1. **Parent area:** tap the parent button, answer the multiplication
   question, add a child (nickname, age, dialect, interests).
2. **Schedule:** choose the child; the first–then board shows two activities
   and reads them aloud. Play an activity to the end.
3. **Help without failure:** answer wrongly on purpose and watch the help
   grow: a spoken hint, then a highlight, then only the right answer left.
4. **Calm corner and board:** try the breathing circle, then build a
   sentence on the communication board and hear it.
5. **Stories and routines:** open "قصص وروتين", follow hand washing, read
   "عندما أغضب". In the profile, switch the religious pack on and check wudu
   and prayer (boy or girl pictures).
6. **Parent tools:** in the child's profile, try the board editor (add a
   photo and record your voice), a routine of your own, the progress screen,
   a goal, the PDF report and the JSON export.
7. **Privacy:** check "الخصوصية" in the parent area, then delete a test
   profile and see that it is gone.

Note anything that feels too fast, too busy, unclear in Arabic or hard to
reach, along with the tablet model and Android version.
