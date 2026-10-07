import * as THREE from "three"
import { Ink } from "@/lib/ink"
import type { WireSpec } from "./wire-scene"
import { letter } from "./lettering"

// Line colours, matched to the On-Chain palette in onchain.css.
const BONE = "#e6e7eb"
const ACCENT = "#e2b867"
const SIGNAL = "#f3dcaa"

type V3 = [number, number, number]

function floorGrid(w: number, d: number, step = 0.5) {
  const g = new Ink()
  for (let x = -w; x <= w + 1e-6; x += step) g.line([x, 0, -d], [x, 0, d])
  for (let z = -d; z <= d + 1e-6; z += step) g.line([-w, 0, z], [w, 0, z])
  return g
}

/** Circle in the plane facing +z (a wall) centred at c. */
function wallCircle(ink: Ink, c: V3, r: number, seg = 18) {
  const pts: V3[] = []
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2
    pts.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, c[2]])
  }
  ink.path(pts)
}

/** Cubic bezier on the floor between two points, bulging along x. */
function curve(a: V3, b: V3, seg = 18): V3[] {
  const mx = (a[0] + b[0]) / 2
  const c1 = new THREE.Vector3(mx, a[1], a[2])
  const c2 = new THREE.Vector3(mx, b[1], b[2])
  const bez = new THREE.CubicBezierCurve3(new THREE.Vector3(...a), c1, c2, new THREE.Vector3(...b))
  return bez.getPoints(seg).map((p) => [p.x, p.y, p.z] as V3)
}

function dashed(ink: Ink, a: V3, b: V3, dashes = 8) {
  for (let i = 0; i < dashes; i++) {
    const t0 = i / dashes
    const t1 = t0 + 0.5 / dashes
    ink.line(
      [a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0, a[2] + (b[2] - a[2]) * t0],
      [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1, a[2] + (b[2] - a[2]) * t1],
    )
  }
}

/* ── Qixazow: an n8n workflow — trigger → Claude agent → publication / consulting / video ── */
export function workflowScene(): WireSpec {
  const grid = floorGrid(4.5, 3.2)
  const trigger = new Ink()
  const agent = new Ink()
  const subs = new Ink()
  const wiresIn = new Ink()
  const wiresOut = new Ink()
  const outputs = new Ink()
  const glyphs = new Ink()

  // Trigger node with a lightning glyph on top.
  trigger.box(1.1, 0.35, 0.9, -3.4, 0, 0)
  glyphs.path([[-3.3, 0.36, -0.28], [-3.5, 0.36, 0.02], [-3.3, 0.36, 0.02], [-3.5, 0.36, 0.3]])

  // Claude agent node, larger, with a starburst glyph.
  agent.box(1.8, 0.48, 1.2, -0.6, 0, 0)
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI
    agent.line([-0.6 - Math.cos(a) * 0.32, 0.49, -Math.sin(a) * 0.32], [-0.6 + Math.cos(a) * 0.32, 0.49, Math.sin(a) * 0.32])
  }

  // Memory + tools sub-nodes, hanging off the agent with dashed links.
  subs.box(0.8, 0.24, 0.6, -1.3, 0, 2.3)
  subs.box(0.8, 0.24, 0.6, 0.1, 0, 2.3)
  dashed(subs, [-1.0, 0.12, 0.6], [-1.3, 0.12, 2.0])
  dashed(subs, [-0.2, 0.12, 0.6], [0.1, 0.12, 2.0])

  // Outputs: the three Qixazow pillars.
  const outs: V3[] = [
    [2.9, 0, -2.0],
    [2.9, 0, 0],
    [2.9, 0, 2.0],
  ]
  outs.forEach(([x, , z]) => outputs.box(1.3, 0.35, 0.85, x, 0, z))
  // publication: text lines · consulting: two speech cards · video: play triangle
  for (let i = 0; i < 3; i++) glyphs.line([2.6, 0.36, -2.2 + i * 0.18], [3.2, 0.36, -2.2 + i * 0.18])
  glyphs.floorRect(2.55, -0.25, 2.95, 0.1, 0.36)
  glyphs.floorRect(2.85, -0.1, 3.25, 0.25, 0.36)
  glyphs.path([[2.75, 0.36, 1.75], [3.15, 0.36, 2.0], [2.75, 0.36, 2.25], [2.75, 0.36, 1.75]])

  // Wires between ports.
  const inPath = curve([-2.85, 0.18, 0], [-1.5, 0.18, 0], 10)
  wiresIn.path(inPath)
  const outPaths = outs.map(([x, , z]) => curve([0.3, 0.2, 0], [x - 0.65, 0.18, z]))
  outPaths.forEach((p) => wiresOut.path(p))
  ;[[-2.85, 0.18, 0], [-1.5, 0.18, 0], [0.3, 0.2, 0], ...outs.map(([x, , z]) => [x - 0.65, 0.18, z] as V3)].forEach(([x, y, z]) =>
    wiresIn.ring(x, y, z, 0.08, 10),
  )

  return {
    view: 3.7,
    target: [0, 0.6, 0],
    yaw: -0.15,
    layers: [
      { ink: grid, color: BONE, opacity: 0.08, at: [0, 0.25] },
      { ink: trigger, color: BONE, at: [0.1, 0.3] },
      { ink: wiresIn, color: BONE, opacity: 0.7, at: [0.25, 0.42] },
      { ink: agent, color: ACCENT, opacity: 1, at: [0.35, 0.58] },
      { ink: subs, color: BONE, opacity: 0.6, at: [0.5, 0.72] },
      { ink: wiresOut, color: BONE, opacity: 0.7, at: [0.58, 0.8] },
      { ink: outputs, color: BONE, at: [0.66, 0.9] },
      { ink: glyphs, color: SIGNAL, opacity: 0.95, at: [0.8, 1] },
    ],
    flows: outPaths.map((p) => ({ points: [...inPath, ...p], color: SIGNAL, count: 2, speed: 0.16 })),
    notes: [
      { anchor: [-3.4, 0.36, 0], title: "Trigger", body: "Idea or client request" },
      { anchor: [-0.6, 0.5, 0], title: "Claude agent", body: "Orchestrated in n8n" },
      { anchor: [-0.6, 0.25, 2.3], title: "Memory + tools", body: "Context and integrations" },
      { anchor: [2.9, 0.36, 0], title: "Output", body: "Guides · consulting · video" },
    ],
  }
}

/* ── VeraAI: the room shell inks in, then furniture is placed into it ── */
export function interiorScene(): WireSpec {
  const W = 4, D = 3, H = 3.2
  const grid = floorGrid(W, D)
  const shell = new Ink()
  shell.line([-W, 0, D], [W, 0, D])
  shell.line([W, 0, D], [W, 0, -D])
  shell.line([-W, 0, D], [-W, 0, -D])
  shell.rect(-W, 0, W, H, -D)
  shell.line([-W, 0, -D], [-W, H, -D])
  shell.line([-W, H, -D], [-W, H, D])
  shell.line([-W, H, D], [-W, 0, D])
  shell.rect(-1.6, 1.0, 0.8, 2.6, -D + 0.01)
  shell.line([-0.4, 1.0, -D + 0.01], [-0.4, 2.6, -D + 0.01])
  shell.line([-1.6, 1.8, -D + 0.01], [0.8, 1.8, -D + 0.01])
  shell.line([-W + 0.01, 0, 0.6], [-W + 0.01, 2.2, 0.6])
  shell.line([-W + 0.01, 2.2, 0.6], [-W + 0.01, 2.2, 1.6])
  shell.line([-W + 0.01, 2.2, 1.6], [-W + 0.01, 0, 1.6])

  // Photo → 2D layout: a frame on the wall with a floor plan sketched inside.
  const plan = new Ink()
  plan.rect(1.6, 1.95, 3.5, 2.95, -D + 0.01)
  plan.rect(1.75, 2.08, 3.35, 2.82, -D + 0.01)
  plan.line([2.4, 2.08, -D + 0.01], [2.4, 2.55, -D + 0.01])
  plan.line([2.4, 2.55, -D + 0.01], [3.35, 2.55, -D + 0.01])
  plan.line([2.9, 2.55, -D + 0.01], [2.9, 2.82, -D + 0.01])

  const rug = new Ink()
  rug.floorRect(-2.2, -1.0, 1.0, 0.2, 0.01)

  const sofa = new Ink()
  sofa.box(2.6, 0.42, 0.95, -0.6, 0, 1.6)
  sofa.box(2.6, 0.5, 0.22, -0.6, 0.42, 2.0)
  sofa.box(0.22, 0.32, 0.95, -1.8, 0.42, 1.6)
  sofa.box(0.22, 0.32, 0.95, 0.6, 0.42, 1.6)

  const table = new Ink()
  table.box(1.3, 0.06, 0.7, -0.6, 0.4, 0.2)
  for (const [x, z] of [[-1.15, -0.05], [-0.05, -0.05], [-1.15, 0.45], [-0.05, 0.45]]) table.line([x, 0, z], [x, 0.4, z])

  const desk = new Ink()
  desk.box(2.0, 0.05, 0.8, 2.6, 0.75, -2.45)
  for (const [x, z] of [[1.65, -2.8], [3.55, -2.8], [1.65, -2.1], [3.55, -2.1]]) desk.line([x, 0, z], [x, 0.75, z])
  desk.box(1.0, 0.62, 0.05, 2.6, 1.0, -2.65)
  desk.box(0.12, 0.2, 0.12, 2.6, 0.8, -2.65)

  const chair = new Ink()
  chair.box(0.55, 0.06, 0.55, 2.4, 0.45, -1.6)
  chair.box(0.55, 0.6, 0.06, 2.4, 0.51, -1.35)
  chair.line([2.4, 0, -1.6], [2.4, 0.45, -1.6])

  const shelf = new Ink()
  shelf.box(0.42, 2.2, 1.5, -3.75, 0, -1.4)
  for (const y of [0.55, 1.1, 1.65]) shelf.line([-3.54, y, -2.15], [-3.54, y, -0.65])

  const plant = new Ink()
  plant.geo(new THREE.CylinderGeometry(0.22, 0.17, 0.45, 10, 1, true), [3.3, 0.225, 1.9], [0, 0, 0], 1)
  plant.geo(new THREE.IcosahedronGeometry(0.42, 0), [3.3, 0.85, 1.9])

  const lamp = new Ink()
  lamp.line([-2.6, 0, 1.6], [-2.6, 2.2, 1.6])
  lamp.geo(new THREE.CylinderGeometry(0.18, 0.4, 0.42, 12, 1, true), [-2.6, 2.35, 1.6], [0, 0, 0], 1)
  lamp.geo(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 12), [-2.6, 0.02, 1.6], [0, 0, 0], 1)

  return {
    view: 4.8,
    target: [0, 1.25, 0],
    layers: [
      { ink: grid, color: BONE, opacity: 0.08, at: [0, 0.22] },
      { ink: shell, color: BONE, opacity: 0.85, at: [0.04, 0.4] },
      { ink: plan, color: ACCENT, opacity: 1, at: [0.3, 0.5] },
      { ink: rug, color: BONE, opacity: 0.5, at: [0.42, 0.52] },
      { ink: sofa, color: BONE, mode: "drop", at: [0.48, 0.64] },
      { ink: table, color: BONE, mode: "drop", at: [0.55, 0.7] },
      { ink: desk, color: BONE, mode: "drop", at: [0.6, 0.76] },
      { ink: chair, color: BONE, mode: "drop", at: [0.66, 0.8] },
      { ink: shelf, color: BONE, mode: "drop", at: [0.7, 0.86] },
      { ink: plant, color: BONE, mode: "drop", at: [0.76, 0.9] },
      { ink: lamp, color: SIGNAL, mode: "drop", opacity: 1, at: [0.82, 0.98] },
    ],
    notes: [
      { anchor: [2.55, 2.95, -3], title: "Photo → 2D layout", body: "Image-to-layout pipeline" },
      { anchor: [-0.6, 0.92, 2.0], title: "3D placement", body: "Drag-and-place sandbox" },
      { anchor: [-3.75, 2.2, -1.4], title: "Live catalogs", body: "IKEA · Home Depot via Firestore" },
      { anchor: [2.6, 1.62, -2.65], title: "Checkout + assistant", body: "Stripe tiers · AI chatbot" },
    ],
  }
}

/* ── AESS: an org hierarchy on a board, a scheduling calendar, an access-control lock ── */
export function orgScene(): WireSpec {
  const Z = -1.6
  const node = (ink: Ink, x: number, y: number, w = 1.0) => {
    ink.box(w, 0.5, 0.12, x, y - 0.25, Z)
    wallCircle(ink, [x - w / 2 + 0.2, y, Z + 0.07], 0.11, 12)
    ink.line([x - w / 2 + 0.4, y + 0.06, Z + 0.07], [x + w / 2 - 0.12, y + 0.06, Z + 0.07])
    ink.line([x - w / 2 + 0.4, y - 0.08, Z + 0.07], [x + w / 2 - 0.3, y - 0.08, Z + 0.07])
  }
  const elbow = (ink: Ink, x0: number, y0: number, x1: number, y1: number) => {
    const my = (y0 + y1) / 2
    ink.path([[x0, y0, Z], [x0, my, Z], [x1, my, Z], [x1, y1, Z]])
  }

  const root = new Ink()
  node(root, 0, 3.5, 1.2)
  const l1 = new Ink()
  const lvl2 = new Ink()
  const l2 = new Ink()
  const lvl3 = new Ink()
  const mids = [-2.6, 0, 2.6]
  mids.forEach((x) => {
    elbow(l1, 0, 3.25, x, 2.55)
    node(lvl2, x, 2.3)
    ;[-0.6, 0.6].forEach((dx) => {
      elbow(l2, x, 2.05, x + dx, 1.35)
      node(lvl3, x + dx, 1.1, 0.95)
    })
  })

  const cal = new Ink()
  const cols = 7, rows = 4, cell = 0.62
  const x0 = -(cols * cell) / 2, z0 = 0.2
  for (let c = 0; c <= cols; c++) cal.line([x0 + c * cell, 0, z0], [x0 + c * cell, 0, z0 + rows * cell])
  for (let r = 0; r <= rows; r++) cal.line([x0, 0, z0 + r * cell], [x0 + cols * cell, 0, z0 + r * cell])
  const events = new Ink()
  ;[[1, 0], [3, 1], [4, 1], [0, 2], [5, 2], [2, 3], [6, 3]].forEach(([c, r]) =>
    events.box(cell - 0.16, 0.08, cell - 0.16, x0 + c * cell + cell / 2, 0, z0 + r * cell + cell / 2),
  )

  const lock = new Ink()
  lock.box(0.9, 0.75, 0.32, 3.7, 0.2, 1.2)
  lock.geo(new THREE.TorusGeometry(0.28, 0.035, 6, 16, Math.PI), [3.7, 0.95, 1.2], [0, 0, 0], 1)
  lock.line([3.42, 0.95, 1.2], [3.42, 0.8, 1.2])
  lock.line([3.98, 0.95, 1.2], [3.98, 0.8, 1.2])
  wallCircle(lock, [3.7, 0.62, 1.37], 0.08, 10)
  lock.line([3.7, 0.54, 1.37], [3.7, 0.38, 1.37])

  const board = new Ink()
  board.rect(-4.2, 0.4, 4.2, 4.2, Z - 0.08)

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
      { ink: events, color: SIGNAL, mode: "drop", opacity: 0.95, at: [0.78, 0.95] },
      { ink: lock, color: ACCENT, opacity: 1, at: [0.72, 0.98] },
    ],
    flows: [
      { points: [[0, 3.25, Z + 0.1], [0, 2.9, Z + 0.1], [-2.6, 2.9, Z + 0.1], [-2.6, 2.05, Z + 0.1], [-2.6, 1.7, Z + 0.1], [-3.2, 1.7, Z + 0.1], [-3.2, 1.35, Z + 0.1]], color: SIGNAL, count: 1, speed: 0.22 },
      { points: [[0, 3.25, Z + 0.1], [0, 2.9, Z + 0.1], [2.6, 2.9, Z + 0.1], [2.6, 2.05, Z + 0.1], [2.6, 1.7, Z + 0.1], [3.2, 1.7, Z + 0.1], [3.2, 1.35, Z + 0.1]], color: SIGNAL, count: 1, speed: 0.22 },
    ],
    notes: [
      { anchor: [0, 3.75, Z], title: "Org hierarchy", body: "Real-time D3 org charts" },
      { anchor: [-3.2, 0.85, Z], title: ".NET → React", body: "Phased HRMS migration" },
      { anchor: [0.6, 0.05, 1.4], title: "Scheduling", body: "API-integrated calendars" },
      { anchor: [3.7, 1.25, 1.2], title: "Access control", body: "Scoped roles · 20+ admins" },
    ],
  }
}

/* ── Appright: a server rack wired to a door controller, a CCTV camera and a sensor ── */
export function hardwareScene(): WireSpec {
  const grid = floorGrid(4.5, 3.2)

  const rack = new Ink()
  rack.box(1.2, 2.7, 1.0, -2.8, 0, -1.4)
  const units = new Ink()
  for (let i = 1; i < 6; i++) units.rect(-3.35, i * 0.44, -2.25, i * 0.44 + 0.3, -0.89)
  const leds = new Ink()
  for (let i = 1; i < 6; i++) leds.box(0.07, 0.07, 0.04, -2.38, i * 0.44 + 0.12, -0.88)

  const door = new Ink()
  door.rect(1.3, 0, 2.7, 2.4, -2.6)
  door.rect(1.42, 0, 2.58, 2.28, -2.58)
  door.line([2.45, 1.1, -2.56], [2.45, 1.3, -2.56])
  const reader = new Ink()
  reader.box(0.28, 0.42, 0.1, 3.05, 1.0, -2.55)
  wallCircle(reader, [3.05, 1.28, -2.49], 0.07, 10)

  const camera = new Ink()
  camera.line([3.0, 0, 1.4], [3.0, 2.3, 1.4])
  camera.box(0.8, 0.32, 0.36, 2.85, 2.3, 1.4)
  camera.geo(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 10, 1, true), [2.4, 2.46, 1.4], [0, 0, Math.PI / 2], 1)

  const sensor = new Ink()
  sensor.box(0.6, 0.28, 0.6, -0.3, 0, 2.3)
  sensor.line([-0.3, 0.28, 2.3], [-0.3, 0.75, 2.3])
  sensor.ring(-0.3, 0.75, 2.3, 0.14, 12)
  sensor.ring(-0.3, 0.75, 2.3, 0.28, 16)

  const p = {
    door: [[-2.2, 0.02, -1.0], [-1.2, 0.02, -1.0], [-1.2, 0.02, -2.3], [2.0, 0.02, -2.3], [2.0, 0.02, -2.6]] as V3[],
    cam: [[-2.2, 0.02, -0.9], [0.6, 0.02, -0.9], [0.6, 0.02, 1.4], [3.0, 0.02, 1.4]] as V3[],
    sensor: [[-2.4, 0.02, -0.9], [-2.4, 0.02, 2.3], [-0.6, 0.02, 2.3]] as V3[],
  }
  const cables = new Ink()
  Object.values(p).forEach((path) => cables.path(path))

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
      { anchor: [-2.8, 2.7, -1.4], title: "Django REST", body: "OAuth 2.0 · JWT auth" },
      { anchor: [3.05, 1.42, -2.55], title: "Hardware control", body: "Secured device endpoints" },
      { anchor: [2.85, 2.62, 1.4], title: "Visitor alerts", body: "Visitor Alert Management" },
      { anchor: [-0.3, 0.9, 2.3], title: "Service mgmt", body: "−30% template render time" },
    ],
  }
}

export const EXPERIENCE_SCENES = {
  workflow: workflowScene,
  interior: interiorScene,
  org: orgScene,
  hardware: hardwareScene,
} as const

export type ExperienceSceneId = keyof typeof EXPERIENCE_SCENES

/* ════ Education & publication ═══════════════════════════════════════════ */

/* ── Northeastern: campus hall with a cupola, the wordmark on the lawn, and an AI automation corner ── */
export function northeasternScene(): WireSpec {
  const grid = floorGrid(4.6, 3.4)
  const hall = new Ink()
  hall.box(5.6, 1.9, 1.4, 0, 0, -2.0)
  for (const y of [0.35, 1.15])
    for (let x = -2.5; x <= 2.5; x += 0.55) if (Math.abs(x) > 1.05) hall.rect(x - 0.14, y, x + 0.14, y + 0.45, -1.29)
  const portico = new Ink()
  for (const x of [-0.75, -0.25, 0.25, 0.75]) portico.line([x, 0.15, -1.0], [x, 1.6, -1.0])
  portico.box(2.1, 0.15, 0.45, 0, 1.6, -1.12)
  portico.path([[-1.05, 1.75, -0.9], [0, 2.35, -0.9], [1.05, 1.75, -0.9], [-1.05, 1.75, -0.9]])
  portico.box(2.4, 0.08, 0.7, 0, 0, -0.95)
  portico.box(2.2, 0.08, 0.5, 0, 0.08, -1.0)
  const cupola = new Ink()
  cupola.box(0.8, 0.85, 0.8, 0, 1.9, -2.0)
  cupola.rect(-0.18, 2.1, 0.18, 2.55, -1.59)
  cupola.geo(new THREE.ConeGeometry(0.62, 0.7, 4), [0, 3.1, -2.0], [0, Math.PI / 4, 0], 1)

  const word = new Ink()
  letter(word, "NORTHEASTERN", { at: [1.2, 0.05, 1.3], size: 0.36 })

  // AI automation corner: a trigger feeds an agent node, which drives an output; a model floats above.
  const flow = new Ink()
  flow.box(0.6, 0.24, 0.5, -3.7, 0, 2.6)
  flow.box(0.6, 0.24, 0.5, -1.7, 0, 0.6)
  const agent = new Ink()
  agent.box(0.9, 0.32, 0.7, -3.6, 0, 0.5)
  agent.geo(new THREE.IcosahedronGeometry(0.36, 0), [-3.6, 1.15, 0.5])
  dashed(agent, [-3.6, 0.33, 0.5], [-3.6, 0.8, 0.5], 5)
  const wires = new Ink()
  const pIn: V3[] = [[-3.7, 0.12, 2.35], [-3.7, 0.12, 1.5], [-3.6, 0.12, 0.85]]
  const pOut: V3[] = [[-3.15, 0.16, 0.5], [-2.4, 0.16, 0.55], [-2.0, 0.12, 0.6]]
  wires.path(pIn)
  wires.path(pOut)

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
      { anchor: [0, 3.45, -2.0], title: "Northeastern University", body: "M.S. Information Systems, Boston" },
      { anchor: [-3.6, 1.5, 0.5], title: "AI automation", body: "Agentic workflows · LLM agents" },
      { anchor: [-1.7, 0.24, 0.6], title: "Automation in practice", body: "n8n pipelines and integrations" },
    ],
  }
}

/* ── SGSITS: a domed campus block, the wordmark, and an IT workstation ── */
export function sgsitsScene(): WireSpec {
  const grid = floorGrid(4.6, 3.4)
  const block = new Ink()
  block.box(6.2, 1.5, 1.3, 0, 0, -2.1)
  for (let x = -2.7; x <= 2.7; x += 0.6) {
    if (Math.abs(x) < 0.75) continue
    for (const y of [0.25, 0.9]) {
      block.line([x - 0.15, y, -1.44], [x - 0.15, y + 0.3, -1.44])
      block.line([x + 0.15, y, -1.44], [x + 0.15, y + 0.3, -1.44])
      wallCircleHalf(block, [x, y + 0.3, -1.44], 0.15)
    }
  }
  const tower = new Ink()
  tower.box(1.2, 2.5, 1.2, 0, 0, -2.0)
  tower.rect(-0.25, 0, 0.25, 0.8, -1.39)
  wallCircleHalf(tower, [0, 0.8, -1.39], 0.25)
  tower.geo(new THREE.SphereGeometry(0.62, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2), [0, 2.5, -2.0], [0, 0, 0], 1)

  const word = new Ink()
  letter(word, "SGSITS", { at: [1.3, 0.05, 1.4], size: 0.5 })

  const desk = new Ink()
  desk.box(1.5, 0.05, 0.75, -3.0, 0.7, 1.0)
  for (const [x, z] of [[-3.7, 0.68], [-2.3, 0.68], [-3.7, 1.32], [-2.3, 1.32]]) desk.line([x, 0, z], [x, 0.7, z])
  desk.box(1.0, 0.6, 0.05, -3.0, 0.82, 0.75)
  desk.box(0.6, 0.03, 0.22, -3.0, 0.76, 1.15)
  const code = new Ink()
  ;[0.5, 0.75, 0.62, 0.4].forEach((w, i) => code.line([-3.38, 1.3 - i * 0.12, 0.79], [-3.38 + w, 1.3 - i * 0.12, 0.79]))

  return {
    view: 5.0,
    target: [0, 1.45, 0],
    layers: [
      { ink: grid, color: BONE, opacity: 0.08, at: [0, 0.2] },
      { ink: block, color: BONE, opacity: 0.85, at: [0.04, 0.42] },
      { ink: tower, color: ACCENT, opacity: 1, at: [0.3, 0.55] },
      { ink: word, color: ACCENT, opacity: 1, at: [0.48, 0.84] },
      { ink: desk, color: BONE, mode: "drop", at: [0.7, 0.86] },
      { ink: code, color: SIGNAL, opacity: 1, at: [0.84, 1] },
    ],
    notes: [
      { anchor: [0, 3.15, -2.0], title: "SGSITS, Indore", body: "B.E. Information Technology" },
      { anchor: [-3.0, 1.42, 0.75], title: "Coursework", body: "Web engineering · DSA · AI" },
    ],
  }
}

/* ── IJISRT: an open journal, a shield for AI-driven data protection, and the journal's wordmark ── */
export function journalScene(): WireSpec {
  const grid = floorGrid(4.6, 3.4)
  const book = new Ink()
  const Z0 = -1.8, Z1 = 0.6
  for (const side of [-1, 1]) {
    const edge = 2.2 * side
    book.path([[0, 0.32, Z0], [edge * 0.5, 0.26, Z0], [edge, 0.12, Z0], [edge, 0.12, Z1], [edge * 0.5, 0.26, Z1], [0, 0.32, Z1]])
    book.line([edge, 0, Z0], [edge, 0.12, Z0])
    book.line([edge, 0, Z1], [edge, 0.12, Z1])
  }
  book.line([0, 0.32, Z0], [0, 0.32, Z1])
  book.floorRect(-2.3, Z0 - 0.08, 2.3, Z1 + 0.08, 0)
  const lines = new Ink()
  for (let z = Z0 + 0.3; z < Z1 - 0.2; z += 0.28)
    for (const side of [-1, 1]) lines.line([0.25 * side, 0.3, z], [(z > Z1 - 0.7 ? 1.3 : 1.9) * side, 0.17, z])

  // Shield with a lock, standing above the right page and facing the camera.
  const shield = new Ink()
  const r = Math.PI / 4
  const dir: V3 = [Math.cos(r), 0, -Math.sin(r)]
  const at: V3 = [1.6, 1.0, 0.2]
  const P = (u: number, v: number): V3 => [at[0] + dir[0] * u, at[1] + v, at[2] + dir[2] * u]
  const outline: [number, number][] = [[-0.75, 1.9], [0, 2.15], [0.75, 1.9], [0.75, 1.0], [0.45, 0.45], [0, 0.15], [-0.45, 0.45], [-0.75, 1.0], [-0.75, 1.9]]
  shield.path(outline.map(([u, v]) => P(u, v)))
  shield.path(outline.map(([u, v]) => P(u * 0.82, 0.18 + v * 0.86)))
  shield.path([[-0.28, 0.7], [0.28, 0.7], [0.28, 1.15], [-0.28, 1.15], [-0.28, 0.7]].map(([u, v]) => P(u, v)))
  shield.path(arcUV(0, 1.15, 0.2, 0.25).map(([u, v]) => P(u, v)))

  // A small neural mesh around the shield: "AI" in "AI for data protection".
  const mesh = new Ink()
  const nodes: V3[] = [P(-1.3, 2.4), P(-1.5, 1.4), P(-1.2, 0.6), P(1.3, 2.4), P(1.5, 1.5), P(1.2, 0.6)]
  nodes.forEach(([x, y, z]) => mesh.geo(new THREE.OctahedronGeometry(0.09, 0), [x, y, z]))
  ;[[0, 1], [1, 2], [3, 4], [4, 5], [0, 4], [1, 3], [2, 4], [1, 5]].forEach(([a, b]) => mesh.line(nodes[a], nodes[b]))

  const word = new Ink()
  letter(word, "IJISRT", { at: [-0.4, 0.05, 3.2], size: 0.5 })

  const orbit: V3[] = Array.from({ length: 33 }, (_, i) => {
    const a = (i / 32) * Math.PI * 2
    return [at[0] + Math.cos(a) * 1.15, at[1] + 1.15 + Math.sin(a) * 0.15, at[2] + Math.sin(a) * 1.15]
  })

  return {
    view: 4.8,
    target: [0, 1.2, 0.6],
    layers: [
      { ink: grid, color: BONE, opacity: 0.08, at: [0, 0.2] },
      { ink: book, color: BONE, at: [0.04, 0.36] },
      { ink: lines, color: BONE, opacity: 0.45, at: [0.28, 0.5] },
      { ink: word, color: ACCENT, opacity: 1, at: [0.42, 0.76] },
      { ink: mesh, color: BONE, opacity: 0.6, at: [0.62, 0.84] },
      { ink: shield, color: SIGNAL, mode: "drop", opacity: 1, at: [0.72, 0.94] },
    ],
    flows: [{ points: orbit, color: SIGNAL, count: 3, speed: 0.1 }],
    notes: [
      { anchor: [-1.1, 0.27, -0.6], title: "IJISRT · Vol. 8 Issue 12", body: "Published Dec 2023" },
      { anchor: [1.6, 3.2, 0.2], title: "AI for data protection", body: "Safeguarding digital assets" },
    ],
  }
}

/** Upper half-circle in a wall plane (facing +z), for arches. */
function wallCircleHalf(ink: Ink, c: V3, r: number, seg = 10) {
  const pts: V3[] = []
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI
    pts.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r, c[2]])
  }
  ink.path(pts)
}

/** Upper half-ellipse in (u, v) plane coordinates, for the lock shackle. */
function arcUV(cu: number, cv: number, ru: number, rv: number, seg = 10): [number, number][] {
  return Array.from({ length: seg + 1 }, (_, i) => {
    const a = (i / seg) * Math.PI
    return [cu + Math.cos(a) * ru, cv + Math.sin(a) * rv] as [number, number]
  })
}

export const EDUCATION_SCENES = { northeastern: northeasternScene, sgsits: sgsitsScene, journal: journalScene } as const
