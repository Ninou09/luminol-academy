import type {
  GameOnlyPicture,
  RoutinePicture,
  StoryScene,
} from '@luminol/kids-learning';

import dressShirtPicture from '../../assets/routines/dress-shirt.png';
import dressShoesPicture from '../../assets/routines/dress-shoes.png';
import dressSocksPicture from '../../assets/routines/dress-socks.png';
import dressTrousersPicture from '../../assets/routines/dress-trousers.png';
import prayerBoyBowPicture from '../../assets/routines/prayer-boy-bow.png';
import prayerBoyProstratePicture from '../../assets/routines/prayer-boy-prostrate.png';
import prayerBoyRisePicture from '../../assets/routines/prayer-boy-rise.png';
import prayerBoySalamPicture from '../../assets/routines/prayer-boy-salam.png';
import prayerBoySitPicture from '../../assets/routines/prayer-boy-sit.png';
import prayerBoyStandPicture from '../../assets/routines/prayer-boy-stand.png';
import prayerGirlBowPicture from '../../assets/routines/prayer-girl-bow.png';
import prayerGirlProstratePicture from '../../assets/routines/prayer-girl-prostrate.png';
import prayerGirlRisePicture from '../../assets/routines/prayer-girl-rise.png';
import prayerGirlSalamPicture from '../../assets/routines/prayer-girl-salam.png';
import prayerGirlSitPicture from '../../assets/routines/prayer-girl-sit.png';
import prayerGirlStandPicture from '../../assets/routines/prayer-girl-stand.png';
import teethBrushPicture from '../../assets/routines/teeth-brush.png';
import teethCupPicture from '../../assets/routines/teeth-cup.png';
import teethPastePicture from '../../assets/routines/teeth-paste.png';
import teethRinsePicture from '../../assets/routines/teeth-rinse.png';
import washDryPicture from '../../assets/routines/wash-dry.png';
import washRinsePicture from '../../assets/routines/wash-rinse.png';
import washSoapPicture from '../../assets/routines/wash-soap.png';
import washWetPicture from '../../assets/routines/wash-wet.png';
import wuduArmsPicture from '../../assets/routines/wudu-arms.png';
import wuduEarsPicture from '../../assets/routines/wudu-ears.png';
import wuduFacePicture from '../../assets/routines/wudu-face.png';
import wuduFeetPicture from '../../assets/routines/wudu-feet.png';
import wuduHandsPicture from '../../assets/routines/wudu-hands.png';
import wuduHeadPicture from '../../assets/routines/wudu-head.png';
import wuduMouthPicture from '../../assets/routines/wudu-mouth.png';
import wuduNosePicture from '../../assets/routines/wudu-nose.png';
import samiBarkingDogScene from '../../assets/scenes/sami-barking-dog.png';
import samiBrokenCarScene from '../../assets/scenes/sami-broken-car.png';
import samiEveningSofaScene from '../../assets/scenes/sami-evening-sofa.png';
import samiGiftScene from '../../assets/scenes/sami-gift.png';
import samiGoodbyeDoorScene from '../../assets/scenes/sami-goodbye-door.png';
import samiLongPathScene from '../../assets/scenes/sami-long-path.png';
import samiParkSlideScene from '../../assets/scenes/sami-park-slide.png';
import samiStormWindowScene from '../../assets/scenes/sami-storm-window.png';
import samiTowerFallingScene from '../../assets/scenes/sami-tower-falling.png';
import samiToyTakenScene from '../../assets/scenes/sami-toy-taken.png';
import astronautPicture from '../../assets/themes/astronaut.png';
import bikePicture from '../../assets/themes/bike.png';
import birdPicture from '../../assets/themes/bird.png';
import boatPicture from '../../assets/themes/boat.png';
import busPicture from '../../assets/themes/bus.png';
import camelPicture from '../../assets/themes/camel.png';
import catPicture from '../../assets/themes/cat.png';
import crescentPicture from '../../assets/themes/crescent.png';
import dogPicture from '../../assets/themes/dog.png';
import fishPicture from '../../assets/themes/fish.png';
import helicopterPicture from '../../assets/themes/helicopter.png';
import horsePicture from '../../assets/themes/horse.png';
import planePicture from '../../assets/themes/plane.png';
import planetPicture from '../../assets/themes/planet.png';
import rabbitPicture from '../../assets/themes/rabbit.png';
import rocketPicture from '../../assets/themes/rocket.png';
import sheepPicture from '../../assets/themes/sheep.png';
import starPicture from '../../assets/themes/star.png';
import sunPicture from '../../assets/themes/sun.png';
import tractorPicture from '../../assets/themes/tractor.png';
import trainPicture from '../../assets/themes/train.png';
import truckPicture from '../../assets/themes/truck.png';

/** Bundled game-only pictures; see assets/media.json for their provenance. */
export const GAME_PICTURE_ASSETS: Record<GameOnlyPicture, number> = {
  cat: catPicture,
  dog: dogPicture,
  bird: birdPicture,
  fish: fishPicture,
  camel: camelPicture,
  horse: horsePicture,
  sheep: sheepPicture,
  rabbit: rabbitPicture,
  bus: busPicture,
  train: trainPicture,
  plane: planePicture,
  boat: boatPicture,
  bike: bikePicture,
  truck: truckPicture,
  helicopter: helicopterPicture,
  tractor: tractorPicture,
  sun: sunPicture,
  crescent: crescentPicture,
  star: starPicture,
  rocket: rocketPicture,
  planet: planetPicture,
  astronaut: astronautPicture,
};

/** Bundled story scenes; see assets/media.json for their provenance. */
export const STORY_SCENE_ASSETS: Record<StoryScene, number> = {
  'sami-goodbye-door': samiGoodbyeDoorScene,
  'sami-park-slide': samiParkSlideScene,
  'sami-evening-sofa': samiEveningSofaScene,
  'sami-gift': samiGiftScene,
  'sami-broken-car': samiBrokenCarScene,
  'sami-toy-taken': samiToyTakenScene,
  'sami-tower-falling': samiTowerFallingScene,
  'sami-storm-window': samiStormWindowScene,
  'sami-barking-dog': samiBarkingDogScene,
  'sami-long-path': samiLongPathScene,
};

/** Bundled routine step pictures; see assets/media.json for their provenance. */
export const ROUTINE_PICTURE_ASSETS: Record<RoutinePicture, number> = {
  'wash-wet': washWetPicture,
  'wash-soap': washSoapPicture,
  'wash-rinse': washRinsePicture,
  'wash-dry': washDryPicture,
  'teeth-paste': teethPastePicture,
  'teeth-brush': teethBrushPicture,
  'teeth-rinse': teethRinsePicture,
  'teeth-cup': teethCupPicture,
  'dress-shirt': dressShirtPicture,
  'dress-trousers': dressTrousersPicture,
  'dress-socks': dressSocksPicture,
  'dress-shoes': dressShoesPicture,
  'wudu-hands': wuduHandsPicture,
  'wudu-mouth': wuduMouthPicture,
  'wudu-nose': wuduNosePicture,
  'wudu-face': wuduFacePicture,
  'wudu-arms': wuduArmsPicture,
  'wudu-head': wuduHeadPicture,
  'wudu-ears': wuduEarsPicture,
  'wudu-feet': wuduFeetPicture,
  'prayer-boy-stand': prayerBoyStandPicture,
  'prayer-boy-bow': prayerBoyBowPicture,
  'prayer-boy-rise': prayerBoyRisePicture,
  'prayer-boy-prostrate': prayerBoyProstratePicture,
  'prayer-boy-sit': prayerBoySitPicture,
  'prayer-boy-salam': prayerBoySalamPicture,
  'prayer-girl-stand': prayerGirlStandPicture,
  'prayer-girl-bow': prayerGirlBowPicture,
  'prayer-girl-rise': prayerGirlRisePicture,
  'prayer-girl-prostrate': prayerGirlProstratePicture,
  'prayer-girl-sit': prayerGirlSitPicture,
  'prayer-girl-salam': prayerGirlSalamPicture,
};
