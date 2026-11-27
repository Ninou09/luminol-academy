import {
  AmbientLight,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  Shape,
  TorusGeometry,
  WebGLRenderer,
} from 'three';

export function createFounderGold(canvas: HTMLCanvasElement, ornate: boolean) {
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
    emissive: 0xc88931,
    emissiveIntensity: 0.13,
    metalness: 0.54,
    roughness: 0.27,
  });
  const ringGeometry = new TorusGeometry(1.35, 0.04, 10, 96);
  const shardGeometry = new IcosahedronGeometry(0.23, 0);
  const ring = new Mesh(ringGeometry, gold);
  const orbit = new Mesh(ringGeometry, gold);
  orbit.scale.setScalar(0.8);
  const shards = Array.from({ length: 4 }, () => new Mesh(shardGeometry, gold));
  const coverShape = new Shape();
  coverShape.moveTo(0, -0.7);
  coverShape.quadraticCurveTo(0.52, -0.43, 1.31, -0.58);
  coverShape.lineTo(1.31, 0.66);
  coverShape.quadraticCurveTo(0.56, 0.8, 0, 0.5);
  coverShape.closePath();
  const leafGeometry = new ExtrudeGeometry(coverShape, {
    depth: 0.035,
    bevelSize: 0.035,
    bevelThickness: 0.018,
    bevelSegments: 3,
    curveSegments: 16,
  });
  const brass = new MeshStandardMaterial({
    color: 0xd9a951,
    emissive: 0x84602a,
    emissiveIntensity: 0.18,
    metalness: 0.35,
    roughness: 0.38,
  });
  const paper = new MeshStandardMaterial({
    color: 0xffe5af,
    metalness: 0.12,
    roughness: 0.49,
  });

  if (ornate) {
    for (const side of [-1, 1]) {
      const cover = new Mesh(leafGeometry, brass);
      cover.scale.x = side;
      cover.rotation.y = side * 0.14;
      sculpture.add(cover);
      for (let page = 1; page <= 3; page++) {
        const leaf = new Mesh(leafGeometry, paper);
        leaf.scale.set(side * (0.94 - page * 0.025), 0.9, 0.8);
        leaf.rotation.y = side * (0.13 + page * 0.085);
        leaf.position.z = page * 0.04;
        sculpture.add(leaf);
      }
    }
  } else {
    sculpture.add(ring, orbit, ...shards);
  }
  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    if (ornate) camera.position.z = Math.max(3.2, 4.25 / camera.aspect);
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();
  canvas.dataset.webgl = 'ready';

  const draw = (time: number) => {
    const t = time * 0.001;
    if (ornate) {
      sculpture.rotation.set(
        -0.28 + Math.sin(t * 0.86) * 0.08,
        Math.sin(t * 0.9) * 0.26,
        -0.16 + Math.sin(t * 0.64) * 0.09,
      );
      key.position.x = 3 + Math.sin(t * 1.05) * 1.6;
    } else {
      sculpture.rotation.z = Math.sin(t * 0.21) * 0.14;
      ring.rotation.set(0.42 + Math.sin(t * 0.48) * 0.22, t * 0.28, -0.3);
      orbit.rotation.set(1.15, -t * 0.24, 0.35);
      for (const [index, shard] of shards.entries()) {
        const angle = index * ((Math.PI * 2) / shards.length) + t * 0.44;
        shard.position.set(
          Math.cos(angle) * 1.95,
          Math.sin(angle) * 1.65,
          Math.sin(angle) * 0.35,
        );
        shard.rotation.set(t * 0.42, angle, t * 0.25);
      }
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
      leafGeometry.dispose();
      brass.dispose();
      paper.dispose();
      renderer.dispose();
      delete canvas.dataset.webgl;
    },
  };
}
