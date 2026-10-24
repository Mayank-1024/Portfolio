/**
 * mayankbhadrasen.com · fence.js
 * Everything drawn with Three.js: the hero block chain and the self-drawing wire scenes
 * for each experience, education and publication block.
 * ES module; needs gsap (global) and main.js (window.Portfolio).
 */
import * as THREE from './vendor/three.module.min.js';

/* ════ Ink: collects edge segments so a drawing can be "inked" in order ═══ */
/** Collects edge segments from many meshes into one buffer so the whole drawing can be "inked" in order. */
class Ink {
  constructor() {
    this.pts = [];
    this.m = new THREE.Matrix4();
    this.v = new THREE.Vector3();
  }
  geo(g, pos, rot = [0, 0, 0], threshold = 20) {
    const e = new THREE.EdgesGeometry(g, threshold);
    this.m.compose(new THREE.Vector3(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), new THREE.Vector3(1, 1, 1));
    const a = e.attributes.position;
    for (let i = 0; i < a.count; i++) {
      this.v.fromBufferAttribute(a, i).applyMatrix4(this.m);
      this.pts.push(this.v.x, this.v.y, this.v.z);
    }
    e.dispose();
    g.dispose();
  }
  box(w, h, d, x, y, z) {
    this.geo(new THREE.BoxGeometry(w, h, d), [x, y + h / 2, z]);
  }
  line(a, b) {
    this.pts.push(...a, ...b);
  }
  rect(x0, y0, x1, y1, z) {
    this.line([x0, y0, z], [x1, y0, z]);
    this.line([x1, y0, z], [x1, y1, z]);
    this.line([x1, y1, z], [x0, y1, z]);
    this.line([x0, y1, z], [x0, y0, z]);
  }
  /** Polyline through points (consecutive segments). */
  path(points) {
    for (let i = 0; i < points.length - 1; i++) this.line(points[i], points[i + 1]);
  }
  /** Flat rectangle lying on the floor plane (y fixed). */
  floorRect(x0, z0, x1, z1, y = 0) {
    this.path([
      [x0, y, z0],
      [x1, y, z0],
      [x1, y, z1],
      [x0, y, z1],
      [x0, y, z0],
    ]);
  }
  /** Circle in the XZ plane. */
  ring(x, y, z, r, seg = 24) {
    const pts = [];
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      pts.push([x + Math.cos(a) * r, y, z + Math.sin(a) * r]);
    }
    this.path(pts);
  }
  build(color, opacity = 1) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pts, 3));
    const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    const l = new THREE.LineSegments(g, m);
    l.geometry.setDrawRange(0, 0);
    return { l, count: this.pts.length / 3, dispose: () => (g.dispose(), m.dispose()) };
  }
}

/* ════ Lettering: single-stroke wire capitals for the wordmarks ══════════ */
/** Points along an elliptical arc, angles in degrees (a1 < a0 runs clockwise). */
function arc(cx, cy, rx, ry, a0, a1, n = 14) {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
  });
}
// Single-stroke capitals on a 1 × 1.4 cell, drawn like a plotter pen. Only the letters the scenes need.
const GLYPHS = {
  A: {
    w: 1,
    strokes: [
      [
        [0, 0],
        [0.5, 1.4],
        [1, 0],
      ],
      [
        [0.2, 0.55],
        [0.8, 0.55],
      ],
    ],
  },
  E: {
    w: 0.9,
    strokes: [
      [
        [0.9, 1.4],
        [0, 1.4],
        [0, 0],
        [0.9, 0],
      ],
      [
        [0, 0.7],
        [0.7, 0.7],
      ],
    ],
  },
  G: { w: 1, strokes: [[...arc(0.5, 0.7, 0.5, 0.7, 40, 360, 20), [0.55, 0.7]]] },
  H: {
    w: 1,
    strokes: [
      [
        [0, 0],
        [0, 1.4],
      ],
      [
        [1, 0],
        [1, 1.4],
      ],
      [
        [0, 0.7],
        [1, 0.7],
      ],
    ],
  },
  I: {
    w: 0.5,
    strokes: [
      [
        [0.25, 0],
        [0.25, 1.4],
      ],
      [
        [0, 1.4],
        [0.5, 1.4],
      ],
      [
        [0, 0],
        [0.5, 0],
      ],
    ],
  },
  J: { w: 0.9, strokes: [[[0.85, 1.4], [0.85, 0.4], ...arc(0.45, 0.4, 0.4, 0.4, 0, -180, 10)]] },
  N: {
    w: 1,
    strokes: [
      [
        [0, 0],
        [0, 1.4],
        [1, 0],
        [1, 1.4],
      ],
    ],
  },
  O: { w: 1, strokes: [arc(0.5, 0.7, 0.5, 0.7, 90, 450, 24)] },
  R: {
    w: 1,
    strokes: [
      [[0, 0], [0, 1.4], [0.6, 1.4], ...arc(0.6, 1.05, 0.35, 0.35, 90, -90, 10), [0, 0.7]],
      [
        [0.45, 0.7],
        [1, 0],
      ],
    ],
  },
  S: { w: 0.95, strokes: [[...arc(0.48, 1.05, 0.45, 0.35, 15, 270, 12), ...arc(0.48, 0.35, 0.45, 0.35, 90, -165, 12)]] },
  T: {
    w: 1,
    strokes: [
      [
        [0, 1.4],
        [1, 1.4],
      ],
      [
        [0.5, 1.4],
        [0.5, 0],
      ],
    ],
  },
};
const GAP = 0.32;
function textWidth(text, size) {
  const units = [...text].reduce((w, c, i) => w + (GLYPHS[c]?.w ?? 0.6) + (i ? GAP : 0), 0);
  return units * size;
}
/**
 * Inks `text` as wire lettering standing on the floor, centred on `at` and turned `rotY` radians
 * (π/4 faces the isometric camera, so the word reads straight). Two outlines a little apart give it depth.
 */
function letter(ink, text, { at, size, rotY = Math.PI / 4, depth = 0.12 }) {
  const dir = [Math.cos(rotY), 0, -Math.sin(rotY)];
  const nrm = [Math.sin(rotY), 0, Math.cos(rotY)];
  const start = -textWidth(text, size) / 2;
  const to3 = (u, v, w) => [at[0] + dir[0] * u + nrm[0] * w, at[1] + v, at[2] + dir[2] * u + nrm[2] * w];
  let x = start;
  for (const ch of text) {
    const g = GLYPHS[ch];
    if (g) {
      for (const stroke of g.strokes) {
        const front = stroke.map(([u, v]) => to3(x + u * size, v * size, 0));
        const back = stroke.map(([u, v]) => to3(x + u * size, v * size, -depth));
        ink.path(front);
        ink.path(back);
        // Join front and back at the stroke ends and every few points, so letters read as solid.
        stroke.forEach((_, i) => {
          if (i === 0 || i === stroke.length - 1 || i % 4 === 0) ink.line(front[i], back[i]);
        });
      }
    }
    x += ((g?.w ?? 0.6) + GAP) * size;
  }
}

/* ════ Scenes: one line drawing per experience, education and publication ═ */
// Line colours, matched to the On-Chain palette in onchain.css.
const BONE = '#e6e7eb';
const ACCENT = '#e2b867';
const SIGNAL = '#f3dcaa';
function floorGrid(w, d, step = 0.5) {
  const g = new Ink();
  for (let x = -w; x <= w + 1e-6; x += step) g.line([x, 0, -d], [x, 0, d]);
  for (let z = -d; z <= d + 1e-6; z += step) g.line([-w, 0, z], [w, 0, z]);
  return g;
}
/** Circle in the plane facing +z (a wall) centred at c. */
function wallCircle(ink, c, r, seg = 18) {
  const pts = [];
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    pts.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, c[2]]);
  }
  ink.path(pts);
}
/** Cubic bezier on the floor between two points, bulging along x. */
function curve(a, b, seg = 18) {
  const mx = (a[0] + b[0]) / 2;
  const c1 = new THREE.Vector3(mx, a[1], a[2]);
  const c2 = new THREE.Vector3(mx, b[1], b[2]);
  const bez = new THREE.CubicBezierCurve3(new THREE.Vector3(...a), c1, c2, new THREE.Vector3(...b));
  return bez.getPoints(seg).map((p) => [p.x, p.y, p.z]);
}
function dashed(ink, a, b, dashes = 8) {
  for (let i = 0; i < dashes; i++) {
    const t0 = i / dashes;
    const t1 = t0 + 0.5 / dashes;
    ink.line(
      [a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0, a[2] + (b[2] - a[2]) * t0],
      [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1, a[2] + (b[2] - a[2]) * t1],
    );
  }
}
/* ── VeraAI: the room shell inks in, then furniture is placed into it ── */
function interiorScene() {
  const W = 4,
    D = 3,
    H = 3.2;
  const grid = floorGrid(W, D);
  const shell = new Ink();
  shell.line([-W, 0, D], [W, 0, D]);
  shell.line([W, 0, D], [W, 0, -D]);
  shell.line([-W, 0, D], [-W, 0, -D]);
  shell.rect(-W, 0, W, H, -D);
  shell.line([-W, 0, -D], [-W, H, -D]);
  shell.line([-W, H, -D], [-W, H, D]);
  shell.line([-W, H, D], [-W, 0, D]);
  shell.rect(-1.6, 1.0, 0.8, 2.6, -D + 0.01);
  shell.line([-0.4, 1.0, -D + 0.01], [-0.4, 2.6, -D + 0.01]);
  shell.line([-1.6, 1.8, -D + 0.01], [0.8, 1.8, -D + 0.01]);
  shell.line([-W + 0.01, 0, 0.6], [-W + 0.01, 2.2, 0.6]);
  shell.line([-W + 0.01, 2.2, 0.6], [-W + 0.01, 2.2, 1.6]);
  shell.line([-W + 0.01, 2.2, 1.6], [-W + 0.01, 0, 1.6]);
  // Photo → 2D layout: a frame on the wall with a floor plan sketched inside.
  const plan = new Ink();
  plan.rect(1.6, 1.95, 3.5, 2.95, -D + 0.01);
  plan.rect(1.75, 2.08, 3.35, 2.82, -D + 0.01);
  plan.line([2.4, 2.08, -D + 0.01], [2.4, 2.55, -D + 0.01]);
  plan.line([2.4, 2.55, -D + 0.01], [3.35, 2.55, -D + 0.01]);
  plan.line([2.9, 2.55, -D + 0.01], [2.9, 2.82, -D + 0.01]);
  const rug = new Ink();
  rug.floorRect(-2.2, -1.0, 1.0, 0.2, 0.01);
  const sofa = new Ink();
  sofa.box(2.6, 0.42, 0.95, -0.6, 0, 1.6);
  sofa.box(2.6, 0.5, 0.22, -0.6, 0.42, 2.0);
  sofa.box(0.22, 0.32, 0.95, -1.8, 0.42, 1.6);
  sofa.box(0.22, 0.32, 0.95, 0.6, 0.42, 1.6);
  const table = new Ink();
  table.box(1.3, 0.06, 0.7, -0.6, 0.4, 0.2);
  for (const [x, z] of [
    [-1.15, -0.05],
    [-0.05, -0.05],
    [-1.15, 0.45],
    [-0.05, 0.45],
  ])
    table.line([x, 0, z], [x, 0.4, z]);
  const desk = new Ink();
  desk.box(2.0, 0.05, 0.8, 2.6, 0.75, -2.45);
  for (const [x, z] of [
    [1.65, -2.8],
    [3.55, -2.8],
    [1.65, -2.1],
    [3.55, -2.1],
  ])
    desk.line([x, 0, z], [x, 0.75, z]);
  desk.box(1.0, 0.62, 0.05, 2.6, 1.0, -2.65);
  desk.box(0.12, 0.2, 0.12, 2.6, 0.8, -2.65);
  const chair = new Ink();
  chair.box(0.55, 0.06, 0.55, 2.4, 0.45, -1.6);
  chair.box(0.55, 0.6, 0.06, 2.4, 0.51, -1.35);
  chair.line([2.4, 0, -1.6], [2.4, 0.45, -1.6]);
  const shelf = new Ink();
  shelf.box(0.42, 2.2, 1.5, -3.75, 0, -1.4);
  for (const y of [0.55, 1.1, 1.65]) shelf.line([-3.54, y, -2.15], [-3.54, y, -0.65]);
  const plant = new Ink();
  plant.geo(new THREE.CylinderGeometry(0.22, 0.17, 0.45, 10, 1, true), [3.3, 0.225, 1.9], [0, 0, 0], 1);
  plant.geo(new THREE.IcosahedronGeometry(0.42, 0), [3.3, 0.85, 1.9]);
  const lamp = new Ink();
  lamp.line([-2.6, 0, 1.6], [-2.6, 2.2, 1.6]);
  lamp.geo(new THREE.CylinderGeometry(0.18, 0.4, 0.42, 12, 1, true), [-2.6, 2.35, 1.6], [0, 0, 0], 1);
  lamp.geo(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 12), [-2.6, 0.02, 1.6], [0, 0, 0], 1);
  return {
    view: 4.8,
    target: [0, 1.25, 0],
    layers: [
      { ink: grid, color: BONE, opacity: 0.08, at: [0, 0.22] },
      { ink: shell, color: BONE, opacity: 0.85, at: [0.04, 0.4] },
      { ink: plan, color: ACCENT, opacity: 1, at: [0.3, 0.5] },
      { ink: rug, color: BONE, opacity: 0.5, at: [0.42, 0.52] },
      { ink: sofa, color: BONE, mode: 'drop', at: [0.48, 0.64] },
      { ink: table, color: BONE, mode: 'drop', at: [0.55, 0.7] },
      { ink: desk, color: BONE, mode: 'drop', at: [0.6, 0.76] },
      { ink: chair, color: BONE, mode: 'drop', at: [0.66, 0.8] },
      { ink: shelf, color: BONE, mode: 'drop', at: [0.7, 0.86] },
      { ink: plant, color: BONE, mode: 'drop', at: [0.76, 0.9] },
      { ink: lamp, color: SIGNAL, mode: 'drop', opacity: 1, at: [0.82, 0.98] },
    ],
    notes: [
      { anchor: [2.55, 2.95, -3], title: 'Photo → 2D layout', body: 'Image-to-layout pipeline' },
      { anchor: [-0.6, 0.92, 2.0], title: '3D placement', body: 'Drag-and-place sandbox' },
      { anchor: [-3.75, 2.2, -1.4], title: 'Live catalogs', body: 'IKEA · Home Depot via Firestore' },
      { anchor: [2.6, 1.62, -2.65], title: 'Checkout + assistant', body: 'Stripe tiers · AI chatbot' },
    ],
  };
}
/* ── AESS: an org hierarchy on a board, a scheduling calendar, an access-control lock ── */
function orgScene() {
  const Z = -1.6;
  const node = (ink, x, y, w = 1.0) => {
    ink.box(w, 0.5, 0.12, x, y - 0.25, Z);
    wallCircle(ink, [x - w / 2 + 0.2, y, Z + 0.07], 0.11, 12);
    ink.line([x - w / 2 + 0.4, y + 0.06, Z + 0.07], [x + w / 2 - 0.12, y + 0.06, Z + 0.07]);
    ink.line([x - w / 2 + 0.4, y - 0.08, Z + 0.07], [x + w / 2 - 0.3, y - 0.08, Z + 0.07]);
  };
  const elbow = (ink, x0, y0, x1, y1) => {
    const my = (y0 + y1) / 2;
    ink.path([
      [x0, y0, Z],
      [x0, my, Z],
      [x1, my, Z],
      [x1, y1, Z],
    ]);
  };
  const root = new Ink();
  node(root, 0, 3.5, 1.2);
  const l1 = new Ink();
  const lvl2 = new Ink();
  const l2 = new Ink();
  const lvl3 = new Ink();
  const mids = [-2.6, 0, 2.6];
  mids.forEach((x) => {
    elbow(l1, 0, 3.25, x, 2.55);
    node(lvl2, x, 2.3);
    [-0.6, 0.6].forEach((dx) => {
      elbow(l2, x, 2.05, x + dx, 1.35);
      node(lvl3, x + dx, 1.1, 0.95);
    });
  });
  const cal = new Ink();
  const cols = 7,
    rows = 4,
    cell = 0.62;
  const x0 = -(cols * cell) / 2,
    z0 = 0.2;
  for (let c = 0; c <= cols; c++) cal.line([x0 + c * cell, 0, z0], [x0 + c * cell, 0, z0 + rows * cell]);
  for (let r = 0; r <= rows; r++) cal.line([x0, 0, z0 + r * cell], [x0 + cols * cell, 0, z0 + r * cell]);
  const events = new Ink();
  [
    [1, 0],
    [3, 1],
    [4, 1],
    [0, 2],
    [5, 2],
    [2, 3],
    [6, 3],
  ].forEach(([c, r]) => events.box(cell - 0.16, 0.08, cell - 0.16, x0 + c * cell + cell / 2, 0, z0 + r * cell + cell / 2));
  const lock = new Ink();
  lock.box(0.9, 0.75, 0.32, 3.7, 0.2, 1.2);
  lock.geo(new THREE.TorusGeometry(0.28, 0.035, 6, 16, Math.PI), [3.7, 0.95, 1.2], [0, 0, 0], 1);
  lock.line([3.42, 0.95, 1.2], [3.42, 0.8, 1.2]);
  lock.line([3.98, 0.95, 1.2], [3.98, 0.8, 1.2]);
  wallCircle(lock, [3.7, 0.62, 1.37], 0.08, 10);
  lock.line([3.7, 0.54, 1.37], [3.7, 0.38, 1.37]);
  const board = new Ink();
  board.rect(-4.2, 0.4, 4.2, 4.2, Z - 0.08);
  return {
    view: 4.0,
    target: [0, 1.6, 0],
    yaw: 0.12,
    layers: [
      { ink: board, color: BONE, opacity: 0.15, at: [0, 0.2] },
      { ink: root, color: ACCENT, opacity: 1, at: [0.04, 0.2] },
      { ink: l1, color: BONE, opacity: 0.6, at: [0.16, 0.32] },
      { ink: lvl2, color: BONE, at: [0.26, 0.46] },
      { ink: l2, color: BONE, opacity: 0.6, at: [0.4, 0.56] },
      { ink: lvl3, color: BONE, opacity: 0.85, at: [0.5, 0.72] },
      { ink: cal, color: BONE, opacity: 0.35, at: [0.55, 0.82] },
      { ink: events, color: SIGNAL, mode: 'drop', opacity: 0.95, at: [0.78, 0.95] },
      { ink: lock, color: ACCENT, opacity: 1, at: [0.72, 0.98] },
    ],
    flows: [
      {
        points: [
          [0, 3.25, Z + 0.1],
          [0, 2.9, Z + 0.1],
          [-2.6, 2.9, Z + 0.1],
          [-2.6, 2.05, Z + 0.1],
          [-2.6, 1.7, Z + 0.1],
          [-3.2, 1.7, Z + 0.1],
          [-3.2, 1.35, Z + 0.1],
        ],
        color: SIGNAL,
        count: 1,
        speed: 0.22,
      },
      {
        points: [
          [0, 3.25, Z + 0.1],
          [0, 2.9, Z + 0.1],
          [2.6, 2.9, Z + 0.1],
          [2.6, 2.05, Z + 0.1],
          [2.6, 1.7, Z + 0.1],
          [3.2, 1.7, Z + 0.1],
          [3.2, 1.35, Z + 0.1],
        ],
        color: SIGNAL,
        count: 1,
        speed: 0.22,
      },
    ],
    notes: [
      { anchor: [0, 3.75, Z], title: 'Org hierarchy', body: 'Real-time D3 org charts' },
      { anchor: [-3.2, 0.85, Z], title: '.NET → React', body: 'Phased HRMS migration' },
      { anchor: [0.6, 0.05, 1.4], title: 'Scheduling', body: 'API-integrated calendars' },
      { anchor: [3.7, 1.25, 1.2], title: 'Access control', body: 'Scoped roles · 20+ admins' },
    ],
  };
}
/* ── Appright: a server rack wired to a door controller, a CCTV camera and a sensor ── */
function hardwareScene() {
  const grid = floorGrid(4.5, 3.2);
  const rack = new Ink();
  rack.box(1.2, 2.7, 1.0, -2.8, 0, -1.4);
  const units = new Ink();
  for (let i = 1; i < 6; i++) units.rect(-3.35, i * 0.44, -2.25, i * 0.44 + 0.3, -0.89);
  const leds = new Ink();
  for (let i = 1; i < 6; i++) leds.box(0.07, 0.07, 0.04, -2.38, i * 0.44 + 0.12, -0.88);
  const door = new Ink();
  door.rect(1.3, 0, 2.7, 2.4, -2.6);
  door.rect(1.42, 0, 2.58, 2.28, -2.58);
  door.line([2.45, 1.1, -2.56], [2.45, 1.3, -2.56]);
  const reader = new Ink();
  reader.box(0.28, 0.42, 0.1, 3.05, 1.0, -2.55);
  wallCircle(reader, [3.05, 1.28, -2.49], 0.07, 10);
  const camera = new Ink();
  camera.line([3.0, 0, 1.4], [3.0, 2.3, 1.4]);
  camera.box(0.8, 0.32, 0.36, 2.85, 2.3, 1.4);
  camera.geo(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 10, 1, true), [2.4, 2.46, 1.4], [0, 0, Math.PI / 2], 1);
  const sensor = new Ink();
  sensor.box(0.6, 0.28, 0.6, -0.3, 0, 2.3);
  sensor.line([-0.3, 0.28, 2.3], [-0.3, 0.75, 2.3]);
  sensor.ring(-0.3, 0.75, 2.3, 0.14, 12);
  sensor.ring(-0.3, 0.75, 2.3, 0.28, 16);
  const p = {
    door: [
      [-2.2, 0.02, -1.0],
      [-1.2, 0.02, -1.0],
      [-1.2, 0.02, -2.3],
      [2.0, 0.02, -2.3],
      [2.0, 0.02, -2.6],
    ],
    cam: [
      [-2.2, 0.02, -0.9],
      [0.6, 0.02, -0.9],
      [0.6, 0.02, 1.4],
      [3.0, 0.02, 1.4],
    ],
    sensor: [
      [-2.4, 0.02, -0.9],
      [-2.4, 0.02, 2.3],
      [-0.6, 0.02, 2.3],
    ],
  };
  const cables = new Ink();
  Object.values(p).forEach((path) => cables.path(path));
  return {
    view: 4.3,
    target: [0.2, 1.35, 0],
    yaw: 0.05,
    layers: [
      { ink: grid, color: BONE, opacity: 0.08, at: [0, 0.22] },
      { ink: rack, color: BONE, at: [0.08, 0.35] },
      { ink: units, color: BONE, opacity: 0.6, at: [0.28, 0.48] },
      { ink: cables, color: BONE, opacity: 0.5, at: [0.42, 0.66] },
      { ink: door, color: BONE, at: [0.54, 0.76] },
      { ink: camera, color: BONE, at: [0.6, 0.82] },
      { ink: sensor, color: BONE, at: [0.68, 0.88] },
      { ink: reader, color: ACCENT, opacity: 1, at: [0.78, 0.96] },
      { ink: leds, color: SIGNAL, opacity: 1, at: [0.85, 1] },
    ],
    flows: [
      { points: [...p.door].reverse(), color: SIGNAL, count: 2, speed: 0.18 },
      { points: [...p.cam].reverse(), color: ACCENT, count: 1, speed: 0.2 },
      { points: p.sensor, color: SIGNAL, count: 1, speed: 0.2 },
    ],
    notes: [
      { anchor: [-2.8, 2.7, -1.4], title: 'Django REST', body: 'OAuth 2.0 · JWT auth' },
      { anchor: [3.05, 1.42, -2.55], title: 'Hardware control', body: 'Secured device endpoints' },
      { anchor: [2.85, 2.62, 1.4], title: 'Visitor alerts', body: 'Visitor Alert Management' },
      { anchor: [-0.3, 0.9, 2.3], title: 'Service mgmt', body: '−30% template render time' },
    ],
  };
}
const EXPERIENCE_SCENES = {
  interior: interiorScene,
  org: orgScene,
  hardware: hardwareScene,
};
/* ════ Education & publication ═══════════════════════════════════════════ */
/* ── Northeastern: campus hall with a cupola, the wordmark on the lawn, and an AI automation corner ── */
function northeasternScene() {
  const grid = floorGrid(4.6, 3.4);
  const hall = new Ink();
  hall.box(5.6, 1.9, 1.4, 0, 0, -2.0);
  for (const y of [0.35, 1.15]) for (let x = -2.5; x <= 2.5; x += 0.55) if (Math.abs(x) > 1.05) hall.rect(x - 0.14, y, x + 0.14, y + 0.45, -1.29);
  const portico = new Ink();
  for (const x of [-0.75, -0.25, 0.25, 0.75]) portico.line([x, 0.15, -1.0], [x, 1.6, -1.0]);
  portico.box(2.1, 0.15, 0.45, 0, 1.6, -1.12);
  portico.path([
    [-1.05, 1.75, -0.9],
    [0, 2.35, -0.9],
    [1.05, 1.75, -0.9],
    [-1.05, 1.75, -0.9],
  ]);
  portico.box(2.4, 0.08, 0.7, 0, 0, -0.95);
  portico.box(2.2, 0.08, 0.5, 0, 0.08, -1.0);
  const cupola = new Ink();
  cupola.box(0.8, 0.85, 0.8, 0, 1.9, -2.0);
  cupola.rect(-0.18, 2.1, 0.18, 2.55, -1.59);
  cupola.geo(new THREE.ConeGeometry(0.62, 0.7, 4), [0, 3.1, -2.0], [0, Math.PI / 4, 0], 1);
  const word = new Ink();
  letter(word, 'NORTHEASTERN', { at: [1.2, 0.05, 1.3], size: 0.36 });
  // AI automation corner: a trigger feeds an agent node, which drives an output; a model floats above.
  const flow = new Ink();
  flow.box(0.6, 0.24, 0.5, -3.7, 0, 2.6);
  flow.box(0.6, 0.24, 0.5, -1.7, 0, 0.6);
  const agent = new Ink();
  agent.box(0.9, 0.32, 0.7, -3.6, 0, 0.5);
  agent.geo(new THREE.IcosahedronGeometry(0.36, 0), [-3.6, 1.15, 0.5]);
  dashed(agent, [-3.6, 0.33, 0.5], [-3.6, 0.8, 0.5], 5);
  const wires = new Ink();
  const pIn = [
    [-3.7, 0.12, 2.35],
    [-3.7, 0.12, 1.5],
    [-3.6, 0.12, 0.85],
  ];
  const pOut = [
    [-3.15, 0.16, 0.5],
    [-2.4, 0.16, 0.55],
    [-2.0, 0.12, 0.6],
  ];
  wires.path(pIn);
  wires.path(pOut);
  return {
    view: 3.9,
    target: [-0.2, 0.9, 0.2],
    layers: [
      { ink: grid, color: BONE, opacity: 0.08, at: [0, 0.2] },
      { ink: hall, color: BONE, opacity: 0.85, at: [0.04, 0.38] },
      { ink: portico, color: BONE, at: [0.25, 0.48] },
      { ink: cupola, color: ACCENT, opacity: 1, at: [0.38, 0.56] },
      { ink: word, color: ACCENT, opacity: 1, at: [0.48, 0.86] },
      { ink: flow, color: BONE, at: [0.6, 0.76] },
      { ink: wires, color: BONE, opacity: 0.6, at: [0.68, 0.84] },
      { ink: agent, color: SIGNAL, opacity: 1, at: [0.74, 0.96] },
    ],
    flows: [{ points: [...pIn, ...pOut], color: SIGNAL, count: 2, speed: 0.2 }],
    notes: [
      { anchor: [0, 3.45, -2.0], title: 'Northeastern University', body: 'M.S. Information Systems, Boston' },
      { anchor: [-3.6, 1.5, 0.5], title: 'AI automation', body: 'Agentic workflows · LLM agents' },
      { anchor: [-1.7, 0.24, 0.6], title: 'Automation in practice', body: 'n8n pipelines and integrations' },
    ],
  };
}
/* ── SGSITS: a domed campus block, the wordmark, and an IT workstation ── */
function sgsitsScene() {
  const grid = floorGrid(4.6, 3.4);
  const block = new Ink();
  block.box(6.2, 1.5, 1.3, 0, 0, -2.1);
  for (let x = -2.7; x <= 2.7; x += 0.6) {
    if (Math.abs(x) < 0.75) continue;
    for (const y of [0.25, 0.9]) {
      block.line([x - 0.15, y, -1.44], [x - 0.15, y + 0.3, -1.44]);
      block.line([x + 0.15, y, -1.44], [x + 0.15, y + 0.3, -1.44]);
      wallCircleHalf(block, [x, y + 0.3, -1.44], 0.15);
    }
  }
  const tower = new Ink();
  tower.box(1.2, 2.5, 1.2, 0, 0, -2.0);
  tower.rect(-0.25, 0, 0.25, 0.8, -1.39);
  wallCircleHalf(tower, [0, 0.8, -1.39], 0.25);
  tower.geo(new THREE.SphereGeometry(0.62, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2), [0, 2.5, -2.0], [0, 0, 0], 1);
  const word = new Ink();
  letter(word, 'SGSITS', { at: [1.3, 0.05, 1.4], size: 0.5 });
  const desk = new Ink();
  desk.box(1.5, 0.05, 0.75, -3.0, 0.7, 1.0);
  for (const [x, z] of [
    [-3.7, 0.68],
    [-2.3, 0.68],
    [-3.7, 1.32],
    [-2.3, 1.32],
  ])
    desk.line([x, 0, z], [x, 0.7, z]);
  desk.box(1.0, 0.6, 0.05, -3.0, 0.82, 0.75);
  desk.box(0.6, 0.03, 0.22, -3.0, 0.76, 1.15);
  const code = new Ink();
  [0.5, 0.75, 0.62, 0.4].forEach((w, i) => code.line([-3.38, 1.3 - i * 0.12, 0.79], [-3.38 + w, 1.3 - i * 0.12, 0.79]));
  return {
    view: 5.0,
    target: [0, 1.45, 0],
    layers: [
      { ink: grid, color: BONE, opacity: 0.08, at: [0, 0.2] },
      { ink: block, color: BONE, opacity: 0.85, at: [0.04, 0.42] },
      { ink: tower, color: ACCENT, opacity: 1, at: [0.3, 0.55] },
      { ink: word, color: ACCENT, opacity: 1, at: [0.48, 0.84] },
      { ink: desk, color: BONE, mode: 'drop', at: [0.7, 0.86] },
      { ink: code, color: SIGNAL, opacity: 1, at: [0.84, 1] },
    ],
    notes: [
      { anchor: [0, 3.15, -2.0], title: 'SGSITS, Indore', body: 'B.E. Information Technology' },
      { anchor: [-3.0, 1.42, 0.75], title: 'Coursework', body: 'Web engineering · DSA · AI' },
    ],
  };
}
/* ── IJISRT: an open journal, a shield for AI-driven data protection, and the journal's wordmark ── */
function journalScene() {
  const grid = floorGrid(4.6, 3.4);
  const book = new Ink();
  const Z0 = -1.8,
    Z1 = 0.6;
  for (const side of [-1, 1]) {
    const edge = 2.2 * side;
    book.path([
      [0, 0.32, Z0],
      [edge * 0.5, 0.26, Z0],
      [edge, 0.12, Z0],
      [edge, 0.12, Z1],
      [edge * 0.5, 0.26, Z1],
      [0, 0.32, Z1],
    ]);
    book.line([edge, 0, Z0], [edge, 0.12, Z0]);
    book.line([edge, 0, Z1], [edge, 0.12, Z1]);
  }
  book.line([0, 0.32, Z0], [0, 0.32, Z1]);
  book.floorRect(-2.3, Z0 - 0.08, 2.3, Z1 + 0.08, 0);
  const lines = new Ink();
  for (let z = Z0 + 0.3; z < Z1 - 0.2; z += 0.28) for (const side of [-1, 1]) lines.line([0.25 * side, 0.3, z], [(z > Z1 - 0.7 ? 1.3 : 1.9) * side, 0.17, z]);
  // Shield with a lock, standing above the right page and facing the camera.
  const shield = new Ink();
  const r = Math.PI / 4;
  const dir = [Math.cos(r), 0, -Math.sin(r)];
  const at = [1.6, 1.0, 0.2];
  const P = (u, v) => [at[0] + dir[0] * u, at[1] + v, at[2] + dir[2] * u];
  const outline = [
    [-0.75, 1.9],
    [0, 2.15],
    [0.75, 1.9],
    [0.75, 1.0],
    [0.45, 0.45],
    [0, 0.15],
    [-0.45, 0.45],
    [-0.75, 1.0],
    [-0.75, 1.9],
  ];
  shield.path(outline.map(([u, v]) => P(u, v)));
  shield.path(outline.map(([u, v]) => P(u * 0.82, 0.18 + v * 0.86)));
  shield.path(
    [
      [-0.28, 0.7],
      [0.28, 0.7],
      [0.28, 1.15],
      [-0.28, 1.15],
      [-0.28, 0.7],
    ].map(([u, v]) => P(u, v)),
  );
  shield.path(arcUV(0, 1.15, 0.2, 0.25).map(([u, v]) => P(u, v)));
  // A small neural mesh around the shield: "AI" in "AI for data protection".
  const mesh = new Ink();
  const nodes = [P(-1.3, 2.4), P(-1.5, 1.4), P(-1.2, 0.6), P(1.3, 2.4), P(1.5, 1.5), P(1.2, 0.6)];
  nodes.forEach(([x, y, z]) => mesh.geo(new THREE.OctahedronGeometry(0.09, 0), [x, y, z]));
  [
    [0, 1],
    [1, 2],
    [3, 4],
    [4, 5],
    [0, 4],
    [1, 3],
    [2, 4],
    [1, 5],
  ].forEach(([a, b]) => mesh.line(nodes[a], nodes[b]));
  const word = new Ink();
  letter(word, 'IJISRT', { at: [-0.4, 0.05, 3.2], size: 0.5 });
  const orbit = Array.from({ length: 33 }, (_, i) => {
    const a = (i / 32) * Math.PI * 2;
    return [at[0] + Math.cos(a) * 1.15, at[1] + 1.15 + Math.sin(a) * 0.15, at[2] + Math.sin(a) * 1.15];
  });
  return {
    view: 4.8,
    target: [0, 1.2, 0.6],
    layers: [
      { ink: grid, color: BONE, opacity: 0.08, at: [0, 0.2] },
      { ink: book, color: BONE, at: [0.04, 0.36] },
      { ink: lines, color: BONE, opacity: 0.45, at: [0.28, 0.5] },
      { ink: word, color: ACCENT, opacity: 1, at: [0.42, 0.76] },
      { ink: mesh, color: BONE, opacity: 0.6, at: [0.62, 0.84] },
      { ink: shield, color: SIGNAL, mode: 'drop', opacity: 1, at: [0.72, 0.94] },
    ],
    flows: [{ points: orbit, color: SIGNAL, count: 3, speed: 0.1 }],
    notes: [
      { anchor: [-1.1, 0.27, -0.6], title: 'IJISRT · Vol. 8 Issue 12', body: 'International Journal of Innovative Science and Research Technology, Dec 2023' },
      { anchor: [1.6, 3.2, 0.2], title: 'AI for data protection', body: 'Safeguarding digital assets' },
    ],
  };
}
/** Upper half-circle in a wall plane (facing +z), for arches. */
function wallCircleHalf(ink, c, r, seg = 10) {
  const pts = [];
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI;
    pts.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, c[2]]);
  }
  ink.path(pts);
}
/** Upper half-ellipse in (u, v) plane coordinates, for the lock shackle. */
function arcUV(cu, cv, ru, rv, seg = 10) {
  return Array.from({ length: seg + 1 }, (_, i) => {
    const a = (i / seg) * Math.PI;
    return [cu + Math.cos(a) * ru, cv + Math.sin(a) * rv];
  });
}
const EDUCATION_SCENES = { northeastern: northeasternScene, sgsits: sgsitsScene, journal: journalScene };

/* ════ Wire scenes ═══════════════════════════════════════════════════════
   An isometric line drawing that inks itself once it scrolls into view, then idles:
   packets travel along its flows, it sways, and it turns toward the pointer.
   Fires "wire:drawn" (bubbling) on the .oc-wire element when the drawing completes.
   ════════════════════════════════════════════════════════════════════════ */

const DROP = 2.6;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t) => Math.min(1, Math.max(0, t));

/** Polyline sampler for packets: position at 0-1 along the whole path. */
function sampler(points) {
  const v = points.map((p) => new THREE.Vector3(...p));
  const lengths = v.slice(1).map((p, i) => p.distanceTo(v[i]));
  const total = lengths.reduce((a, b) => a + b, 0);
  return (t, out) => {
    let d = t * total;
    for (let i = 0; i < lengths.length; i++) {
      if (d <= lengths[i] || i === lengths.length - 1) return out.lerpVectors(v[i], v[i + 1], Math.min(1, d / lengths[i]));
      d -= lengths[i];
    }
    return out;
  };
}

function mountWire(el, spec, duration = 2800) {
  const reduced = window.Portfolio.reduced();
  const notesEl = el.querySelector('.oc-wire__marks');

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  el.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  const target = new THREE.Vector3(...(spec.target ?? [0, 1, 0]));
  camera.position.set(11, 9, 11).add(target);
  camera.lookAt(target);
  const world = new THREE.Group();
  world.position.copy(target);
  const content = new THREE.Group();
  content.position.copy(target).multiplyScalar(-1);
  world.add(content);
  scene.add(world);

  const layers = spec.layers.map((layer) => {
    const built = layer.ink.build(layer.color, layer.opacity ?? 0.9);
    content.add(built.l);
    if (layer.mode === 'drop') built.l.geometry.setDrawRange(0, built.count);
    return { ...layer, ...built, mat: built.l.material, base: layer.opacity ?? 0.9 };
  });

  const packetGeo = new THREE.SphereGeometry(0.07, 10, 10);
  const packets = (spec.flows ?? []).flatMap((f) => {
    const mat = new THREE.MeshBasicMaterial({ color: f.color, transparent: true, opacity: 0 });
    const at = sampler(f.points);
    return Array.from({ length: f.count ?? 2 }, (_, i) => {
      const m = new THREE.Mesh(packetGeo, mat);
      content.add(m);
      return { m, mat, at, t: i / (f.count ?? 2), speed: f.speed ?? 0.12 };
    });
  });

  const view = spec.view ?? 5;
  const resize = () => {
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    // Keep the full width of the drawing in frame; portrait frames simply gain height.
    const halfW = view * 1.25;
    const halfH = halfW / (w / h);
    camera.left = -halfW;
    camera.right = halfW;
    camera.top = halfH * 0.84;
    camera.bottom = -halfH * 1.16;
    camera.updateProjectionMatrix();
  };
  resize();
  new ResizeObserver(resize).observe(el);

  let px = 0;
  let lx = 0;
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    px = (e.clientX - r.left) / r.width - 0.5;
  });
  el.addEventListener('pointerleave', () => (px = 0));

  // Legend hover highlights its marker in the drawing.
  const marks = Array.from(notesEl.children);
  el.querySelectorAll('.oc-wire__legend li').forEach((li, i) => {
    li.addEventListener('pointerenter', () => marks.forEach((m, j) => m.classList.toggle('is-hot', i === j)));
    li.addEventListener('pointerleave', () => marks.forEach((m) => m.classList.remove('is-hot')));
  });

  const anchors = spec.notes.map((n) => new THREE.Vector3(...n.anchor));
  const v = new THREE.Vector3();

  let start = -1;
  let visible = false;
  let fired = false;
  const finish = () => {
    fired = true;
    el.classList.add('is-drawn');
    el.dispatchEvent(new CustomEvent('wire:drawn', { bubbles: true }));
  };
  new IntersectionObserver(
    ([e]) => {
      visible = e.isIntersecting;
      if (visible && start < 0) start = performance.now();
    },
    { threshold: 0.3 },
  ).observe(el);

  const clock = new THREE.Clock();
  const frame = (now) => {
    const dt = Math.min(0.05, clock.getDelta());
    const p = start < 0 ? 0 : reduced ? 1 : clamp01((now - start) / duration);

    for (const l of layers) {
      const local = clamp01((p - l.at[0]) / (l.at[1] - l.at[0]));
      if (l.mode === 'drop') {
        l.l.position.y = DROP * (1 - easeOut(local));
        l.mat.opacity = l.base * clamp01(local * 3);
      } else {
        l.l.geometry.setDrawRange(0, Math.floor(l.count * ease(local)) & ~1);
      }
    }

    const live = clamp01((p - 0.92) / 0.08);
    for (const k of packets) {
      k.t = (k.t + dt * k.speed) % 1;
      k.at(k.t, k.m.position);
      k.mat.opacity = live;
    }

    if (p >= 1 && !fired) finish();

    const t = clock.elapsedTime;
    lx += (px - lx) * 0.06;
    world.rotation.y = (spec.yaw ?? 0) + Math.sin(t * 0.25) * 0.08 + lx * 0.6;

    world.updateMatrixWorld();
    const w = el.clientWidth;
    const h = el.clientHeight;
    anchors.forEach((a, i) => {
      v.copy(a).applyMatrix4(content.matrixWorld).project(camera);
      marks[i].style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px)`;
    });

    renderer.render(scene, camera);
  };
  const loop = (now) => {
    requestAnimationFrame(loop);
    if (visible) frame(now);
    // Scrolled away mid-drawing: still confirm on time, so status and legend don't stay pending.
    else if (!fired && start >= 0 && (reduced || now - start >= duration)) finish();
  };
  requestAnimationFrame(loop);
}

/* ════ Hero chain ════════════════════════════════════════════════════════
   One glowing block per section, linked by rails with packets riding them.
   The chain assembles on load, follows the pointer, spreads out on scroll,
   and clicking a block scrolls to its section.
   ════════════════════════════════════════════════════════════════════════ */

// Matches the On-Chain palette (style.css): champagne accent, pale gold signal, cool slate rim light.
const CHAIN_ACCENT = new THREE.Color('#e2b867');
const CHAIN_SIGNAL = new THREE.Color('#f3dcaa');
const CHAIN_SLATE = new THREE.Color('#7f95c4');

/** Draws the front face of a block: number, label and a hash, in the mono font the page uses. */
function faceTexture(index, label, font) {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#1b1d24');
  grad.addColorStop(1, '#0b0c0f');
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = 'rgba(228,230,236,.28)';
  g.lineWidth = 2;
  for (let i = 1; i < 8; i++) {
    g.beginPath();
    g.moveTo(0, i * 64);
    g.lineTo(512, i * 64);
    g.globalAlpha = 0.25;
    g.stroke();
  }
  g.globalAlpha = 1;
  g.fillStyle = 'rgba(238,236,232,.55)';
  g.font = `500 30px ${font}`;
  g.fillText('BLOCK', 44, 82);
  g.fillStyle = '#e2b867';
  g.font = `700 112px ${font}`;
  g.fillText(`#${index.toString(16).padStart(2, '0')}`, 40, 220);
  g.fillStyle = '#eeece8';
  g.font = `600 44px ${font}`;
  g.fillText(label.toUpperCase(), 44, 330);
  g.fillStyle = 'rgba(238,236,232,.38)';
  g.font = `400 24px ${font}`;
  let h = (index + 7) * 2654435761;
  let hash = '0x';
  for (let i = 0; i < 18; i++) {
    h = (h ^ (h >>> 13)) * 1274126177;
    hash += ((h >>> 0) % 16).toString(16);
  }
  g.fillText(hash, 44, 410);
  g.fillStyle = '#e2b867';
  g.beginPath();
  g.arc(458, 70, 12, 0, Math.PI * 2);
  g.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function mountChain(el, blocks, onSelect) {
  const reduced = window.Portfolio.reduced();
  const small = window.innerWidth < 768;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#0b0c0f', 12, 30);
  const camera = new THREE.PerspectiveCamera(small ? 50 : 34, 1, 0.1, 100);
  camera.position.set(0, 0.4, 16);

  scene.add(new THREE.AmbientLight('#ffffff', 0.9));
  const key = new THREE.PointLight(CHAIN_ACCENT, 55, 40);
  key.position.set(6, 5, 8);
  scene.add(key);
  const rim = new THREE.PointLight(CHAIN_SLATE, 40, 40);
  rim.position.set(-7, -4, 6);
  scene.add(rim);

  const chain = new THREE.Group();
  chain.position.set(small ? 0 : 1.1, small ? 2.2 : 1.3, 0);
  scene.add(chain);

  const font = getComputedStyle(document.body).getPropertyValue('--font-jetbrains') || 'monospace';
  const size = 1.7;
  const boxGeo = new THREE.BoxGeometry(size, size, size);
  const edgeGeo = new THREE.EdgesGeometry(boxGeo);
  const sideMat = new THREE.MeshStandardMaterial({ color: '#181a21', metalness: 0.5, roughness: 0.4, emissive: '#22252e', emissiveIntensity: 0.4 });

  const spacing = small ? 2.6 : 2.9;
  const items = blocks.map((b, i) => {
    const tex = faceTexture(i + 1, b.label, font);
    const faceMat = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.2, roughness: 0.5, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.7 });
    const mesh = new THREE.Mesh(boxGeo, [faceMat, faceMat, sideMat, sideMat, faceMat, faceMat]);
    const edgeMat = new THREE.LineBasicMaterial({ color: CHAIN_ACCENT, transparent: true, opacity: 0.9 });
    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
    const halo = new THREE.LineSegments(
      edgeGeo,
      new THREE.LineBasicMaterial({ color: CHAIN_ACCENT, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending }),
    );
    halo.scale.setScalar(1.12);
    const g = new THREE.Group();
    g.add(mesh, edges, halo);
    mesh.userData = { id: b.id, index: i };
    chain.add(g);
    const from = new THREE.Vector3((Math.random() - 0.5) * 26, 9 + Math.random() * 8, (Math.random() - 0.5) * 14 - 6);
    const spin = new THREE.Vector3(Math.random() * 6 - 3, Math.random() * 6 - 3, Math.random() * 2 - 1);
    return { g, mesh, edgeMat, phase: i * 0.9, hover: 0, from, spin, lock: reduced ? 1 : 0 };
  });

  // Links: two rails between each pair of neighbours, rebuilt every frame from block positions.
  const railPos = new Float32Array((blocks.length - 1) * 2 * 2 * 3);
  const railGeo = new THREE.BufferGeometry();
  railGeo.setAttribute('position', new THREE.BufferAttribute(railPos, 3));
  const railMat = new THREE.LineBasicMaterial({ color: CHAIN_ACCENT, transparent: true, opacity: 0.45 });
  const rails = new THREE.LineSegments(railGeo, railMat);
  // The rail points are rewritten every frame, so the bounds computed on the first frame are stale; never cull them.
  rails.frustumCulled = false;
  chain.add(rails);

  // Data packets riding the rails.
  const packetGeo = new THREE.SphereGeometry(0.07, 12, 12);
  const packetMat = new THREE.MeshBasicMaterial({ color: CHAIN_SIGNAL });
  const packets = Array.from({ length: blocks.length - 1 }, (_, i) => {
    const m = new THREE.Mesh(packetGeo, packetMat);
    chain.add(m);
    return { m, link: i, t: Math.random() };
  });

  // Ambient dust.
  const dustCount = small ? 350 : 800;
  const dust = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dust[i * 3] = (Math.random() - 0.5) * 40;
    dust[i * 3 + 1] = (Math.random() - 0.5) * 20;
    dust[i * 3 + 2] = (Math.random() - 0.5) * 20 - 4;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dust, 3));
  const dustPts = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: '#d9dbe2', size: 0.03, transparent: true, opacity: 0.6, depthWrite: false }));
  scene.add(dustPts);

  // Pick the largest scale (up to full size) and a horizontal position at which the first and last blocks,
  // at rest, both sit inside the frame. Prefer staying right of centre, clear of the headline.
  const probe = new THREE.Object3D();
  const pv = new THREE.Vector3();
  const baseX = chain.position.x;
  const fit = () => {
    const z = camera.position.z;
    camera.position.z = 16;
    camera.updateMatrixWorld();
    const n = items.length;
    const mid = (n - 1) / 2;
    const inFrame = (scale, x) => {
      probe.position.set(x, chain.position.y, chain.position.z);
      probe.rotation.set(0.12, -0.35, -0.12);
      probe.scale.setScalar(scale);
      probe.updateMatrixWorld();
      return [0, n - 1].every((i) =>
        [-1.25, 1.25].every((dx) => {
          pv.set((i - mid) * spacing + dx, Math.sin(i * 1.1) * 0.6, Math.cos(i * 0.8) * 1.2)
            .applyMatrix4(probe.matrixWorld)
            .project(camera);
          return Math.abs(pv.x) <= 0.95;
        }),
      );
    };
    const offsets = Array.from({ length: 41 }, (_, k) => baseX - 2 + k * 0.1).sort((a, b) => Math.abs(a - baseX) - Math.abs(b - baseX));
    let scale = 1;
    let x = baseX;
    search: for (; scale > 0.5; scale -= 0.02) {
      for (const o of offsets)
        if (inFrame(scale, o)) {
          x = o;
          break search;
        }
    }
    chain.scale.setScalar(scale);
    chain.position.x = x;
    camera.position.z = z;
  };

  const resize = () => {
    const w = el.clientWidth;
    const h = el.clientHeight;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    fit();
  };
  resize();
  window.addEventListener('resize', resize);

  const pointer = new THREE.Vector2(0, 0);
  const target = new THREE.Vector2(0, 0);
  const ray = new THREE.Raycaster();
  let hovered = null;
  const meshes = items.map((it) => it.mesh);

  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    target.copy(pointer);
  });
  el.addEventListener('click', () => {
    if (hovered !== null) onSelect(blocks[hovered].id);
  });

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(el);

  const look = new THREE.Vector2(0, 0);
  const tmp = new THREE.Vector3();
  const tmp2 = new THREE.Vector3();
  const clock = new THREE.Clock();

  const intro = { links: reduced ? 1 : 0 };
  const introTl = gsap.timeline({ delay: 0.15 });
  if (!reduced) {
    items.forEach((it, i) => introTl.to(it, { lock: 1, duration: 1.5, ease: 'expo.out' }, i * 0.12));
    introTl.to(intro, { links: 1, duration: 0.9, ease: 'power2.out' }, '>-0.7');
  }
  const dest = new THREE.Vector3();

  const frame = () => {
    const t = clock.getElapsedTime();
    const scroll = Math.min(1.4, window.scrollY / window.innerHeight);
    look.lerp(target, 0.05);

    chain.rotation.y = -0.35 + look.x * 0.35;
    chain.rotation.x = 0.12 - look.y * 0.18;
    chain.rotation.z = -0.12;

    const spread = spacing * (1 + scroll * 0.6);
    const mid = (items.length - 1) / 2;
    items.forEach((it, i) => {
      dest.set((i - mid) * spread, Math.sin(t * 0.7 + it.phase) * 0.35 + Math.sin(i * 1.1) * 0.6, Math.cos(i * 0.8) * 1.2 - scroll * 3);
      it.g.position.lerpVectors(it.from, dest, it.lock);
      const un = 1 - it.lock;
      it.g.rotation.set(Math.sin(t * 0.4 + it.phase) * 0.25 + 0.35 + it.spin.x * un, t * 0.18 + it.phase + it.spin.y * un, it.spin.z * un);
      it.hover += ((hovered === i ? 1 : 0) - it.hover) * 0.12;
      it.g.scale.setScalar((0.35 + 0.65 * it.lock) * (1 + it.hover * 0.14));
      it.edgeMat.color.copy(CHAIN_ACCENT).lerp(CHAIN_SIGNAL, it.hover);
    });

    for (let i = 0; i < items.length - 1; i++) {
      items[i].g.getWorldPosition(tmp);
      items[i + 1].g.getWorldPosition(tmp2);
      chain.worldToLocal(tmp);
      chain.worldToLocal(tmp2);
      for (let r = 0; r < 2; r++) {
        const off = r === 0 ? 0.18 : -0.18;
        railPos.set([tmp.x, tmp.y + off, tmp.z, tmp2.x, tmp2.y + off, tmp2.z], (i * 2 + r) * 6);
      }
    }
    railGeo.attributes.position.needsUpdate = true;
    railMat.opacity = 0.7 * intro.links;

    packets.forEach((p) => {
      p.t = (p.t + 0.006) % 1;
      items[p.link].g.getWorldPosition(tmp);
      items[p.link + 1].g.getWorldPosition(tmp2);
      chain.worldToLocal(tmp);
      chain.worldToLocal(tmp2);
      p.m.position.lerpVectors(tmp, tmp2, p.t);
      p.m.position.y += 0.18;
      p.m.visible = intro.links > 0.98;
    });

    dustPts.rotation.y = t * 0.01 + look.x * 0.05;
    camera.position.z = 16 + scroll * 4;
    renderer.domElement.style.opacity = String(Math.max(0, 1 - scroll * 0.9));

    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(meshes, false)[0];
    hovered = hit ? hit.object.userData.index : null;
    el.style.cursor = hovered !== null ? 'pointer' : '';

    renderer.render(scene, camera);
  };

  // Repaint the faces once the web font is ready so the canvas text uses it.
  document.fonts?.ready.then(() => {
    const f = getComputedStyle(document.body).getPropertyValue('--font-jetbrains') || 'monospace';
    items.forEach((it, i) => {
      const face = it.mesh.material[4];
      const old = face.map;
      const tex = faceTexture(i + 1, blocks[i].label, f);
      face.map = tex;
      face.emissiveMap = tex;
      face.needsUpdate = true;
      old?.dispose();
    });
    if (reduced) frame();
  });

  if (reduced) {
    frame();
    window.addEventListener('resize', frame);
  } else {
    const loop = () => {
      requestAnimationFrame(loop);
      if (visible) frame();
    };
    loop();
  }
}

/* ════ Mount ═════════════════════════════════════════════════════════════ */

const CHAIN_BLOCKS = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'stack', label: 'Stack' },
  { id: 'education', label: 'Education' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

const SCENES = { ...EXPERIENCE_SCENES, ...EDUCATION_SCENES };

const hero = document.querySelector('.oc-scene');
if (hero) mountChain(hero, CHAIN_BLOCKS, (id) => window.Portfolio.scrollToId(id));

document.querySelectorAll('.oc-wire[data-scene]').forEach((el) => {
  const build = SCENES[el.dataset.scene];
  if (build) mountWire(el, build());
});
