import * as THREE from "three"
import { Ink } from "@/lib/ink"
import type { WireSpec } from "./wire-scene"

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
