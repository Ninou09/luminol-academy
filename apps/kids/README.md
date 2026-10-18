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

- `app/` — routes. Child routes (`session`, `activity`, `talk`, `calm`) share
  the fixed `ChildScreen` frame; `parent/*` sits behind the `gate` route.
- `src/aac/` and `app/talk.tsx` — the communication board; `app/parent/board/`
  and `src/parent/CardEditor.tsx` let parents customise it.
- `src/media/` — parent photos and recordings, kept in the app's private
  folder per child and deleted with the card or the profile.
- `src/games/` — the three games and `useTrialFlow`, which runs the adaptive
  engine, the hint ladder and trial recording.
- `src/data/` — SQL schema, migrations and the validated repository.
- `src/audio/` — recorded-clip manifest, speech queue with fallback and the
  generated calm sound.
- `assets/` — bundled images; `assets/media.json` keeps each file's source,
  alt text, crop intent and approval.

## Audio

Speech resolves in this order: recorded clip in the child's dialect →
recorded MSA clip → device text-to-speech in MSA. Device voices do not offer
dialects, so the dialect setting only changes what you hear once recordings
are added to `src/audio/recordedAudio.ts`.
