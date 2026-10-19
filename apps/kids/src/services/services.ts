import type { CalmSoundService } from '../audio/calmSound';
import type { SpeechService } from '../audio/speech';
import type { KidsRepository } from '../data/repository';
import type { MediaService } from '../media/media';
import type { PurchasesService } from '../purchases/purchases';
import type { ShareService } from '../reports/share';

/** Everything with side effects, injected so screens can be tested. */
export type KidsServices = {
  repository: KidsRepository;
  speech: SpeechService;
  calmSound: CalmSoundService;
  media: MediaService;
  share: ShareService;
  purchases: PurchasesService;
  newId: () => string;
  now: () => Date;
  /** Seed for a game's round generator. */
  seed: () => number;
};
