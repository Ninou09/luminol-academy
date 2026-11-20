import { motionAllowed } from './calm-mode';

type Scene = { start(): void; stop(): void; destroy(): void };

/** Import on first intersection. Recheck eligibility after the chunk arrives. */
export function observeScene<T extends Scene>(
  element: HTMLElement,
  load: () => Promise<() => T | null>,
  update?: (scene: T) => void,
) {
  let scene: T | null = null;
  let active = false;
  let disposed = false;
  let factory: Promise<() => T | null> | undefined;
  let frame = 0;
  const paint = () => {
    if (!scene || !active || !update) return;
    update(scene);
    frame = requestAnimationFrame(paint);
  };
  const observer = new IntersectionObserver(async ([entry]) => {
    active = Boolean(entry?.isIntersecting);
    cancelAnimationFrame(frame);
    if (!active || !motionAllowed()) {
      scene?.stop();
      return;
    }
    if (!scene) {
      factory ??= load();
      const create = await factory;
      if (disposed || !active || !motionAllowed() || scene) return;
      scene = create();
      if (!scene) {
        observer.disconnect();
        return;
      }
      element.dataset.scene = 'live';
    }
    scene.start();
    paint();
  });
  observer.observe(element);
  return () => {
    disposed = true;
    observer.disconnect();
    cancelAnimationFrame(frame);
    scene?.destroy();
    delete element.dataset.scene;
  };
}
