# Luminol Noor voice recording guide

Luminol Noor speaks every child-facing word. Until a clip is recorded, the
device voice reads the Modern Standard Arabic (MSA) text. Each recorded clip
replaces that fallback for one line only, so recordings can arrive in batches.

## What to record

[`voice-recording-list.csv`](./voice-recording-list.csv) lists every line,
with its key, MSA text, where the child hears it, and the file name to use.
It opens in Google Sheets or Excel. It is generated from the app's own
content and checked by tests, so it always matches the app. After content
changes, regenerate it with:

```sh
UPDATE_RECORDING_LIST=1 pnpm vitest run packages/kids-content
```

Children's nicknames are always read by the device voice and are not on the
list.

## Order of work

1. **Specialist review first.** The Luminol Psy specialist reviews every line
   and fills in `specialist_approved` before recording starts.
2. **MSA.** Record MSA first: it is also the fallback for every dialect.
3. **Maghrebi.** The default dialect for new profiles.
4. Gulf, Egyptian and Levantine when there is demand.

For dialect recordings, the speaker says the natural dialect equivalent of the
MSA line, keeping its meaning and its calm, first-person-plural ("let's …")
style. The specialist approves the dialect wording too.

## Voice direction

- One warm, calm, unhurried adult voice for the whole app (per dialect).
- Friendly and even. Praise is gentle, not excited; nothing is shouted.
- Clear articulation with natural pauses. Leave about 0.2 s of silence at the
  start and end of each clip and trim the rest.

## Technical format

- AAC in an `.m4a` file, mono, 44.1 kHz, 128 kbps or higher.
- Consistent loudness across every clip: about −16 LUFS integrated, peaks
  below −1 dBTP. Uneven volume between clips is a sudden sound for a child.
- Quiet room, no music, no effects, no reverb.

## Delivering clips

Name each file exactly as in the `file_name` column and sort the files into
one folder per dialect: `msa/`, `maghrebi/`, `gulf/`, `egyptian/`,
`levantine/`. They go in `apps/kids/assets/audio/<dialect>/` and are listed
in `apps/kids/src/audio/recordedAudio.ts`.
