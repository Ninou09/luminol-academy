# Luminol Noor (لومينول نور) — kids app

Arabic-first learning games for autistic children. See
[`docs/kids/ROADMAP.md`](../../docs/kids/ROADMAP.md) for the product rules and
milestones.

## Run it

From the repository root:

```sh
pnpm install
pnpm --filter @luminol/kids dev
```

- **Development build (recommended):** SQLCipher encryption and native RTL
  only work in a development build (`npx expo run:ios` or `npx expo run:android`
  from `apps/kids`, or an EAS development build).
- **Expo Go:** it runs, but the database is unencrypted (a warning is logged)
  and RTL takes effect after the first restart. Release builds refuse to start
  without encryption.

## Checks

```sh
pnpm --filter @luminol/kids typecheck
pnpm --filter @luminol/kids lint
pnpm --filter @luminol/kids test   # jest-expo, runs the real SQL through sql.js
pnpm --filter @luminol/kids build  # typecheck + Metro bundles for iOS and Android
```

The root `pnpm test` runs these jest tests after the Vitest suite.

## Layout

- `app/` — routes. Child routes (`session`, `activity`, `talk`, `stories`,
  `story/*`, `routine/*`, `calm`) share the fixed `ChildScreen` frame;
  `parent/*` sits behind the `gate` route.
- `src/aac/` and `app/talk.tsx` — the communication board; `app/parent/board/`
  and `src/parent/CardEditor.tsx` let parents customise it.
- `src/sequences/` and `src/parent/SequenceEditor.tsx` — routines and social
  stories: built-in stories, the child's own, and the parent editor.
- `src/reports/` and `app/parent/progress/` — the parent dashboard, goals,
  the PDF report and the JSON export; files go only to the system share
  sheet and are deleted from the cache afterwards.
- `src/media/` — parent photos and recordings, kept in the app's private
  folder per child and deleted with the card or the profile.
- `src/games/` — matching, sorting, cause-and-effect, patterns, memory,
  puzzle, letter, tracing, counting, feelings, turn-taking and greetings
  games, `TokenView` for themed pictures, and `useTrialFlow`, which runs the
  adaptive engine, the hint ladder and trial recording.
- `src/data/` — SQL schema, migrations and the validated repository.
- `src/audio/` — recorded-clip manifest, speech queue with fallback and the
  generated calm sound.
- `assets/` — bundled images: board pictures in `aac/`, game-only theme
  pictures in `themes/` and story scenes in `scenes/`; `assets/media.json`
  keeps each file's source, alt text, crop intent and approval.

## Free, no purchases

The app is completely free: every feature is open, with no account, no
subscription and no in-app purchases. It connects to no server, so no data
leaves the device. Release steps are in
[`docs/kids/PLAY_RELEASE.md`](../../docs/kids/PLAY_RELEASE.md).

## Audio

Speech resolves in this order: recorded clip in the child's dialect →
recorded MSA clip → device text-to-speech in MSA. Device voices do not offer
dialects, so the dialect setting only changes what you hear once recordings
are added to `src/audio/recordedAudio.ts`.
