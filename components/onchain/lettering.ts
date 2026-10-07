import type { Ink } from "@/lib/ink"

type P = [number, number]
type V3 = [number, number, number]

/** Points along an elliptical arc, angles in degrees (a1 < a0 runs clockwise). */
function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 14): P[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as P
  })
}

// Single-stroke capitals on a 1 × 1.4 cell, drawn like a plotter pen. Only the letters the scenes need.
const GLYPHS: Record<string, { w: number; strokes: P[][] }> = {
  A: { w: 1, strokes: [[[0, 0], [0.5, 1.4], [1, 0]], [[0.2, 0.55], [0.8, 0.55]]] },
  E: { w: 0.9, strokes: [[[0.9, 1.4], [0, 1.4], [0, 0], [0.9, 0]], [[0, 0.7], [0.7, 0.7]]] },
  G: { w: 1, strokes: [[...arc(0.5, 0.7, 0.5, 0.7, 40, 360, 20), [0.55, 0.7]]] },
  H: { w: 1, strokes: [[[0, 0], [0, 1.4]], [[1, 0], [1, 1.4]], [[0, 0.7], [1, 0.7]]] },
  I: { w: 0.5, strokes: [[[0.25, 0], [0.25, 1.4]], [[0, 1.4], [0.5, 1.4]], [[0, 0], [0.5, 0]]] },
  J: { w: 0.9, strokes: [[[0.85, 1.4], [0.85, 0.4], ...arc(0.45, 0.4, 0.4, 0.4, 0, -180, 10)]] },
  N: { w: 1, strokes: [[[0, 0], [0, 1.4], [1, 0], [1, 1.4]]] },
  O: { w: 1, strokes: [arc(0.5, 0.7, 0.5, 0.7, 90, 450, 24)] },
  R: { w: 1, strokes: [[[0, 0], [0, 1.4], [0.6, 1.4], ...arc(0.6, 1.05, 0.35, 0.35, 90, -90, 10), [0, 0.7]], [[0.45, 0.7], [1, 0]]] },
  S: { w: 0.95, strokes: [[...arc(0.48, 1.05, 0.45, 0.35, 15, 270, 12), ...arc(0.48, 0.35, 0.45, 0.35, 90, -165, 12)]] },
  T: { w: 1, strokes: [[[0, 1.4], [1, 1.4]], [[0.5, 1.4], [0.5, 0]]] },
}

const GAP = 0.32

export function textWidth(text: string, size: number) {
  const units = [...text].reduce((w, c, i) => w + (GLYPHS[c]?.w ?? 0.6) + (i ? GAP : 0), 0)
  return units * size
}

/**
 * Inks `text` as wire lettering standing on the floor, centred on `at` and turned `rotY` radians
 * (π/4 faces the isometric camera, so the word reads straight). Two outlines a little apart give it depth.
 */
export function letter(ink: Ink, text: string, { at, size, rotY = Math.PI / 4, depth = 0.12 }: { at: V3; size: number; rotY?: number; depth?: number }) {
  const dir: V3 = [Math.cos(rotY), 0, -Math.sin(rotY)]
  const nrm: V3 = [Math.sin(rotY), 0, Math.cos(rotY)]
  const start = -textWidth(text, size) / 2
  const to3 = (u: number, v: number, w: number): V3 => [at[0] + dir[0] * u + nrm[0] * w, at[1] + v, at[2] + dir[2] * u + nrm[2] * w]

  let x = start
  for (const ch of text) {
    const g = GLYPHS[ch]
    if (g) {
      for (const stroke of g.strokes) {
        const front = stroke.map(([u, v]) => to3(x + u * size, v * size, 0))
        const back = stroke.map(([u, v]) => to3(x + u * size, v * size, -depth))
        ink.path(front)
        ink.path(back)
        // Join front and back at the stroke ends and every few points, so letters read as solid.
        stroke.forEach((_, i) => {
          if (i === 0 || i === stroke.length - 1 || i % 4 === 0) ink.line(front[i], back[i])
        })
      }
    }
    x += ((g?.w ?? 0.6) + GAP) * size
  }
}
