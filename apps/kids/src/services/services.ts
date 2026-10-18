import type { CalmSoundService } from '../audio/calmSound';
import type { SpeechService } from '../audio/speech';
import type { KidsRepository } from '../data/repository';

/** Everything with side effects, injected so screens can be tested. */
export type KidsServices = {
  repository: KidsRepository;
  speech: SpeechService;
  calmSound: CalmSoundService;
  newId: () => string;
  now: () => Date;
  /** Seed for a game's round generator. */
  seed: () => number;
};
