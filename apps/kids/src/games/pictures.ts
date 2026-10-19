import type { GameOnlyPicture, StoryScene } from '@luminol/kids-learning';

import samiBarkingDogScene from '../../assets/scenes/sami-barking-dog.png';
import samiBrokenCarScene from '../../assets/scenes/sami-broken-car.png';
import samiGiftScene from '../../assets/scenes/sami-gift.png';
import samiLongPathScene from '../../assets/scenes/sami-long-path.png';
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
  'sami-gift': samiGiftScene,
  'sami-broken-car': samiBrokenCarScene,
  'sami-toy-taken': samiToyTakenScene,
  'sami-tower-falling': samiTowerFallingScene,
  'sami-storm-window': samiStormWindowScene,
  'sami-barking-dog': samiBarkingDogScene,
  'sami-long-path': samiLongPathScene,
};
