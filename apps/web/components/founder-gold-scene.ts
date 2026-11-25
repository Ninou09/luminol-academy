import {
  AmbientLight,
  Color,
  DirectionalLight,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  TorusGeometry,
  WebGLRenderer,
} from 'three';

export function createFounderGold(canvas: HTMLCanvasElement) {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
  } catch {
    return undefined;
  }

  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.1, 25);
  camera.position.z = 7;
  const sculpture = new Group();
  scene.add(sculpture, new AmbientLight(0xffedcf, 2.1));
  const key = new DirectionalLight(0xffe6ad, 4);
  key.position.set(3, 4, 6);
  scene.add(key);
  const rim = new DirectionalLight(0xd9b8ff, 3);
  rim.position.set(-4, -2, 1);
  scene.add(rim);

  const gold = new MeshStandardMaterial({
    color: new Color(0xe6ad55),
    metalness: 0.62,
    roughness: 0.27,
  });
  const ringGeometry = new TorusGeometry(1.35, 0.04, 10, 96);
  const shardGeometry = new IcosahedronGeometry(0.23, 0);
  const ring = new Mesh(ringGeometry, gold);
  const orbit = new Mesh(ringGeometry, gold);
  orbit.scale.setScalar(0.8);
  const shards = Array.from({ length: 4 }, () => new Mesh(shardGeometry, gold));
  sculpture.add(ring, orbit, ...shards);
  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();
  canvas.dataset.webgl = 'ready';

  const draw = (time: number) => {
    const t = time * 0.001;
    ring.rotation.set(0.42 + Math.sin(t * 0.48) * 0.22, t * 0.28, -0.3);
    orbit.rotation.set(1.15, -t * 0.24, 0.35);
    for (const [index, shard] of shards.entries()) {
      const angle = index * Math.PI * 0.5 + t * 0.44;
      shard.position.set(
        Math.cos(angle) * 1.95,
        Math.sin(angle) * 1.65,
        Math.sin(angle) * 0.35,
      );
      shard.rotation.set(t * 0.42, angle, t * 0.25);
    }
    renderer.render(scene, camera);
  };

  return {
    play(visible: boolean) {
      renderer.setAnimationLoop(visible ? draw : null);
    },
    dispose() {
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      ringGeometry.dispose();
      shardGeometry.dispose();
      gold.dispose();
      renderer.dispose();
      delete canvas.dataset.webgl;
    },
  };
}
