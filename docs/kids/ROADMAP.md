# Khatwa (خطوة) roadmap

Khatwa is an Arabic-first learning and mini-games app for autistic children
aged 3–10, built as `apps/kids` (Expo, iOS and Android, tablets first). It
supports therapy; it does not replace it.

## Product rules

- Full RTL Arabic. Modern Standard Arabic text, with spoken audio in the
  child's dialect when a recording exists and device text-to-speech in MSA
  otherwise. Every child-facing word can be heard.
- Sensory-friendly: calm palette, no flashing, no sudden sounds, no visible
  timers, one task per screen, touch targets of at least 64 points, and the
  same layout on every child screen.
- No failure states. A wrong answer only adds help (least-to-most: spoken
  cue → highlight → errorless guidance), never a red cross or a buzzer.
- Data stays on the device, encrypted with SQLCipher. No ads, no analytics
  and no third-party tracking anywhere in the app.

## Packages

| Package                  | Contents                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------ |
| `@luminol/kids-learning` | Pure TypeScript: Zod schemas, adaptive engine, skill catalog, round generators       |
| `@luminol/kids-content`  | Arabic phrases with recording keys, gender agreement, parent copy, speech resolution |
| `@luminol/kids-ui`       | React Native components and the calm kids design tokens                              |

The kids packages are separate from `@luminol/ui`, `@luminol/types` and
`@luminol/validation` so kids changes never trigger the web deployments.

## Adaptive engine

- New skills and new levels start with full help (errorless).
- Three first-try successes in a row fade help one step: full → partial →
  independent.
- Independent trials move up a level at 80% success across the last 10.
- Struggle (under 50% across the last 5 independent trials, or three trials in
  a row that needed full guidance) adds help first, and only drops a level
  once help is already full.

## Milestones

| #   | Milestone                    | Status                                                                                                                                                                                                                                                |
| --- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Foundation + first 3 games   | Done: app shell, RTL tokens, parental gate, child profiles, sensory settings, encrypted storage, audio with TTS fallback, visual schedule, calm-down corner, adaptive engine, matching, sorting (color, shape, size) and cause-and-effect, with tests |
| 2   | AAC communication board      | Next                                                                                                                                                                                                                                                  |
| 3   | Interest themes + more games | Planned: theme packs, patterns, memory, puzzles                                                                                                                                                                                                       |
| 4   | Arabic letters and numbers   | Planned: letter forms, stroke-order tracing, sounds, counting, numeral style                                                                                                                                                                          |
| 5   | Emotions + social skills     | Planned: needs commissioned illustrations                                                                                                                                                                                                             |
| 6   | Daily life skills            | Planned: social stories, sequencing, routine editor, optional religious pack                                                                                                                                                                          |
| 7   | Parent dashboard and reports | Planned: progress per skill, history, goals, PDF report, export and delete                                                                                                                                                                            |
| 8   | Store readiness              | Planned: subscriptions, entitlements, privacy labels, kids-category review                                                                                                                                                                            |

Cloud sync and the clinic licence come after launch, because they need a
backend and accounts.

## Open items for the product owner

- Recorded voice-over: no clips yet. Add them to
  `apps/kids/src/audio/recordedAudio.ts`, one utterance key at a time.
- Store identifiers (`ios.bundleIdentifier`, `android.package`) and EAS
  project setup are needed before the first device build is distributed.
- A specialist should review the adaptive thresholds and all child-facing
  phrases.
