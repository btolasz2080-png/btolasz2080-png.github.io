// Realistic 3D chessboard (Three.js).
//  • Gold metal queen with real reflections and soft shadows on a lacquered board
//  • The board turns toward the mouse
//  • Hover the queen → her legal squares glow; click a glowing square → she moves there
//  • Click the queen → she picks a move herself
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { gsap, ScrollTrigger, reduceMotion, finePointer } from './motion';

const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];

/** Smooth lathe (turned-wood style) geometry from a list of [radius, height] points. */
function turned(points: [number, number][], segments = 96) {
  const curve = new THREE.SplineCurve(points.map(([x, y]) => new THREE.Vector2(x, y)));
  const pts = curve.getPoints(points.length * 14).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y));
  const geo = new THREE.LatheGeometry(pts, segments);
  geo.computeVertexNormals();
  return geo;
}

const BASE: [number, number][] = [
  [0, 0], [0.4, 0], [0.42, 0.03], [0.42, 0.09], [0.38, 0.13], [0.34, 0.15], [0.35, 0.19], [0.3, 0.23], [0.25, 0.27],
];

function makeQueen(mat: THREE.Material) {
  const g = new THREE.Group();
  const body = turned([
    ...BASE,
    [0.2, 0.4], [0.155, 0.7], [0.125, 1.0], [0.115, 1.18],
    [0.19, 1.22], [0.2, 1.26], [0.15, 1.3], [0.13, 1.34],
    [0.16, 1.48], [0.22, 1.63], [0.25, 1.7], [0.235, 1.73], [0.17, 1.71], [0.0, 1.69],
  ]);
  g.add(new THREE.Mesh(body, mat));
  // crown points
  const ball = new THREE.SphereGeometry(0.042, 24, 16);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const m = new THREE.Mesh(ball, mat);
    m.position.set(Math.cos(a) * 0.235, 1.765, Math.sin(a) * 0.235);
    g.add(m);
  }
  const cap = turned([[0, 1.68], [0.14, 1.7], [0.12, 1.76], [0.06, 1.82], [0.0, 1.83]], 64);
  g.add(new THREE.Mesh(cap, mat));
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.065, 32, 24), mat);
  top.position.y = 1.88;
  g.add(top);
  return g;
}

function makePawn(mat: THREE.Material) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(turned([
    [0, 0], [0.33, 0], [0.345, 0.03], [0.345, 0.08], [0.3, 0.11], [0.27, 0.13], [0.28, 0.16], [0.22, 0.2],
    [0.15, 0.34], [0.11, 0.52], [0.18, 0.56], [0.18, 0.6], [0.1, 0.63], [0.0, 0.64],
  ]), mat));
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.165, 48, 32), mat);
  head.position.y = 0.77;
  g.add(head);
  return g;
}

function makeKing(mat: THREE.Material) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(turned([
    ...BASE,
    [0.21, 0.42], [0.16, 0.75], [0.13, 1.05], [0.12, 1.25],
    [0.2, 1.29], [0.21, 1.33], [0.15, 1.37], [0.14, 1.41],
    [0.2, 1.62], [0.21, 1.7], [0.1, 1.76], [0.0, 1.77],
  ]), mat));
  const v = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.3, 0.07), mat);
  v.position.y = 1.9;
  const h = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.07), mat);
  h.position.y = 1.93;
  g.add(v, h);
  return g;
}

function makeRook(mat: THREE.Material) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(turned([
    ...BASE, [0.24, 0.4], [0.22, 0.8], [0.24, 0.86], [0.29, 0.9], [0.29, 1.08], [0.0, 1.08],
  ]), mat));
  // battlements
  const b = new THREE.BoxGeometry(0.11, 0.12, 0.09);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const m = new THREE.Mesh(b, mat);
    m.position.set(Math.cos(a) * 0.24, 1.13, Math.sin(a) * 0.24);
    m.rotation.y = -a;
    g.add(m);
  }
  return g;
}

export function initChess3D() {
  const host = document.querySelector<HTMLElement>('[data-chess3d]');
  if (!host) return;
  const canvasWrap = host.querySelector<HTMLElement>('[data-chess3d-canvas]')!;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    host.classList.add('no-webgl');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  canvasWrap.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const camBase = new THREE.Vector3(0, 10.5, 12.5);
  camera.position.copy(camBase);
  const lookAt = new THREE.Vector3(0, 0.35, 0.2);

  // ── lights
  scene.add(new THREE.HemisphereLight(0xfff4e0, 0x2a140c, 0.55));
  const key = new THREE.DirectionalLight(0xffefd6, 2.1);
  key.position.set(-5, 9, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -6; key.shadow.camera.right = 6; key.shadow.camera.top = 6; key.shadow.camera.bottom = -6;
  key.shadow.radius = 6;
  key.shadow.bias = -0.0004;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x94b1c8, 1.1);
  rim.position.set(6, 4, -6);
  scene.add(rim);

  // ── materials
  const gold = new THREE.MeshPhysicalMaterial({ color: 0xd9b064, metalness: 1, roughness: 0.2, clearcoat: 0.4, clearcoatRoughness: 0.15 });
  const ivory = new THREE.MeshPhysicalMaterial({ color: 0xf1eadb, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.18 });
  const ebony = new THREE.MeshPhysicalMaterial({ color: 0x1a0905, roughness: 0.28, clearcoat: 0.9, clearcoatRoughness: 0.12 });
  const wine = new THREE.MeshPhysicalMaterial({ color: 0x5a0a12, roughness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.1 });
  const sqLight = new THREE.MeshPhysicalMaterial({ color: 0x7f9fb8, roughness: 0.55, clearcoat: 0.55, clearcoatRoughness: 0.25 });
  const sqDark = new THREE.MeshPhysicalMaterial({ color: 0x3e0309, roughness: 0.55, clearcoat: 0.55, clearcoatRoughness: 0.25 });
  const frameMat = new THREE.MeshPhysicalMaterial({ color: 0x2b150d, roughness: 0.45, clearcoat: 0.8, clearcoatRoughness: 0.2 });
  const glowMat = new THREE.MeshStandardMaterial({ color: 0xf3e2ae, emissive: 0xd9b064, emissiveIntensity: 1.2, metalness: 0.3, roughness: 0.3, transparent: true, opacity: 0.95 });

  // ── board
  const world = new THREE.Group();
  scene.add(world);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(8.9, 0.32, 8.9), frameMat);
  frame.position.y = -0.17;
  frame.receiveShadow = true;
  frame.castShadow = true;
  world.add(frame);
  const goldInlay = new THREE.Mesh(new THREE.BoxGeometry(8.22, 0.02, 8.22), gold);
  goldInlay.position.y = -0.005;
  world.add(goldInlay);

  const squares: THREE.Mesh[] = [];
  const sqGeo = new THREE.BoxGeometry(1, 0.08, 1);
  const cell = (r: number, c: number) => new THREE.Vector3(c - 3.5, 0, r - 3.5);
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const m = new THREE.Mesh(sqGeo, (r + c) % 2 ? sqDark : sqLight);
      m.position.copy(cell(r, c)).setY(-0.03);
      m.receiveShadow = true;
      m.userData = { r, c };
      world.add(m);
      squares.push(m);
    }
  }

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.22 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.34;
  ground.receiveShadow = true;
  scene.add(ground);

  // ── pieces
  const setShadows = (g: THREE.Object3D) => g.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  const occupied = new Set<string>();
  const place = (g: THREE.Group, r: number, c: number, scale = 1) => {
    g.position.copy(cell(r, c)).setY(0.01);
    g.scale.setScalar(scale);
    setShadows(g);
    world.add(g);
    occupied.add(`${r},${c}`);
    return g;
  };
  place(makeKing(ebony), 0, 4, 0.95);
  place(makeRook(ebony), 0, 7, 0.95);
  place(makePawn(ebony), 1, 2, 0.95);
  place(makePawn(ebony), 1, 5, 0.95);
  place(makePawn(wine), 2, 6, 0.95);
  place(makeRook(ivory), 7, 0, 0.95);
  place(makePawn(ivory), 6, 1, 0.95);
  place(makePawn(ivory), 6, 5, 0.95);
  place(makePawn(ivory), 5, 6, 0.95);

  const queen = makeQueen(gold);
  queen.scale.setScalar(1.22); // the queen is the star of the board
  let qr = 4, qc = 3;
  queen.position.copy(cell(qr, qc)).setY(0.01);
  setShadows(queen);
  world.add(queen);

  // legal-move markers (gold discs)
  const markerGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.03, 48);
  const markers: THREE.Mesh[] = [];
  const legalSquares = () => {
    const out: [number, number][] = [];
    for (const [dr, dc] of DIRS) {
      let r = qr + dr, c = qc + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8 && !occupied.has(`${r},${c}`)) { out.push([r, c]); r += dr; c += dc; }
    }
    return out;
  };
  const hideMarkers = () => {
    markers.splice(0).forEach((m) => {
      gsap.to(m.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.25, onComplete: () => { world.remove(m); } });
    });
  };
  const showMarkers = () => {
    if (markers.length || moving) return;
    legalSquares().forEach(([r, c]) => {
      const m = new THREE.Mesh(markerGeo, glowMat);
      m.position.copy(cell(r, c)).setY(0.03);
      m.userData = { r, c };
      m.scale.setScalar(0.01);
      world.add(m);
      markers.push(m);
      const d = Math.max(Math.abs(r - qr), Math.abs(c - qc));
      gsap.to(m.scale, { x: 1, y: 1, z: 1, duration: 0.45, ease: 'back.out(2.5)', delay: reduceMotion ? 0 : d * 0.05 });
    });
  };

  let moving = false;
  const moveTo = (r: number, c: number) => {
    if (moving) return;
    moving = true;
    hideMarkers();
    const to = cell(r, c);
    const dist = Math.max(Math.abs(r - qr), Math.abs(c - qc));
    const t = reduceMotion ? 0 : 0.45 + dist * 0.08;
    gsap.timeline({ onComplete: () => { qr = r; qc = c; moving = false; if (hovering) showMarkers(); } })
      .to(queen.position, { y: 0.9, duration: t * 0.45, ease: 'power2.out' }, 0)
      .to(queen.position, { x: to.x, z: to.z, duration: t, ease: 'power2.inOut' }, 0)
      .to(queen.position, { y: 0.01, duration: t * 0.55, ease: 'bounce.out' }, t * 0.5)
      .to(queen.rotation, { y: `+=${Math.PI}`, duration: t * 1.1, ease: 'power2.inOut' }, 0);
  };

  // ── pointer interaction
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const mouse = { x: 0, y: 0 };
  let hovering = false;
  const pick = (e: PointerEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
  };
  renderer.domElement.addEventListener('pointermove', (e) => {
    pick(e);
    const overQueen = ray.intersectObject(queen, true).length > 0;
    const overMarker = ray.intersectObjects(markers, false).length > 0;
    renderer.domElement.style.cursor = overQueen || overMarker ? 'pointer' : 'grab';
    if (overQueen && !hovering) { hovering = true; showMarkers(); gsap.to(gold, { roughness: 0.12, duration: 0.4 }); }
    if (!overQueen && !overMarker && hovering) {
      // keep markers while the pointer is on the board so you can click them
      const overBoard = ray.intersectObjects(squares, false).length > 0;
      if (!overBoard) { hovering = false; hideMarkers(); gsap.to(gold, { roughness: 0.2, duration: 0.4 }); }
    }
  });
  renderer.domElement.addEventListener('pointerleave', () => { hovering = false; hideMarkers(); });
  renderer.domElement.addEventListener('click', (e) => {
    pick(e as PointerEvent);
    const m = ray.intersectObjects(markers, false)[0];
    if (m) { moveTo(m.object.userData.r, m.object.userData.c); return; }
    const sq = ray.intersectObjects(squares, false)[0];
    if (sq && markers.some((mk) => mk.userData.r === sq.object.userData.r && mk.userData.c === sq.object.userData.c)) {
      moveTo(sq.object.userData.r, sq.object.userData.c);
      return;
    }
    if (ray.intersectObject(queen, true).length) {
      const opts = legalSquares();
      if (opts.length) { const [r, c] = opts[Math.floor(Math.random() * opts.length)]; moveTo(r, c); }
    }
  });
  if (finePointer) {
    window.addEventListener('pointermove', (e) => {
      mouse.x = e.clientX / window.innerWidth - 0.5;
      mouse.y = e.clientY / window.innerHeight - 0.5;
    });
  }

  // Keyboard: the visible button next to the canvas makes a move
  host.querySelector('[data-chess3d-move]')?.addEventListener('click', () => {
    const opts = legalSquares();
    if (opts.length) { const [r, c] = opts[Math.floor(Math.random() * opts.length)]; moveTo(r, c); }
  });

  // ── scroll: the camera glides lower as the section passes
  const scroll = { p: 0 };
  if (!reduceMotion) {
    ScrollTrigger.create({ trigger: host, start: 'top bottom', end: 'bottom top', onUpdate: (s) => { scroll.p = s.progress; } });
  }

  // ── sizing
  const resize = () => {
    const w = canvasWrap.clientWidth, h = canvasWrap.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // pull back on narrow screens so the whole board fits
    camera.fov = w / h < 1 ? 42 : 33;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvasWrap);
  resize();

  // ── intro + render loop (only while on screen)
  const intro = { t: reduceMotion ? 1 : 0 };
  let visible = false;
  let started = false;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !started) {
      started = true;
      if (!reduceMotion) {
        gsap.to(intro, { t: 1, duration: 2.2, ease: 'power3.out' });
        queen.position.y = 4;
        gsap.to(queen.position, { y: 0.01, duration: 1.4, delay: 0.6, ease: 'bounce.out' });
        gsap.delayedCall(2.4, () => { showMarkers(); gsap.delayedCall(1.8, () => { if (!hovering) hideMarkers(); }); });
      }
    }
  }, { threshold: 0.05 }).observe(host);

  const smooth = { rx: 0, ry: 0 };
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const time = clock.elapsedTime;
    smooth.rx += (mouse.x - smooth.rx) * Math.min(1, dt * 3);
    smooth.ry += (mouse.y - smooth.ry) * Math.min(1, dt * 3);
    const intoView = 1 - intro.t;
    world.rotation.y = smooth.rx * 0.55 + intoView * -0.9 + (reduceMotion ? 0 : Math.sin(time * 0.25) * 0.04);
    camera.position.set(camBase.x, camBase.y - smooth.ry * 1.6 - scroll.p * 1.4 + intoView * 3, camBase.z - intoView * 1.5);
    camera.lookAt(lookAt);
    if (!moving && !reduceMotion) queen.rotation.y += dt * 0.25; // slow turn shows off the reflections
    renderer.render(scene, camera);
  });
}
