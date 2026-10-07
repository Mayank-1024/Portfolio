"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { prefersReducedMotion } from "@/lib/motion"
import { Ink } from "@/lib/ink"

type Note = { anchor: [number, number, number]; title: string; body: string }

const NOTES: Note[] = [
  { anchor: [2.6, 2.05, -2.3], title: "Frontend", body: "React · Next.js · TypeScript" },
  { anchor: [-2.6, 2.6, 1.6], title: "Automation", body: "n8n · LLM agents · Claude" },
  { anchor: [-0.4, 2.3, -3], title: "Integrations", body: "REST · OAuth 2.0 · Webhooks" },
  { anchor: [-3.75, 1.9, -1.1], title: "Infrastructure", body: "Docker · AWS · Firebase" },
]

function drawRoom() {
  const grid = new Ink()
  const W = 4, D = 3, H = 3.2
  for (let x = -W; x <= W; x += 0.5) grid.line([x, 0, -D], [x, 0, D])
  for (let z = -D; z <= D; z += 0.5) grid.line([-W, 0, z], [W, 0, z])

  const main = new Ink()
  // Floor outline and walls.
  main.line([-W, 0, D], [W, 0, D])
  main.line([W, 0, D], [W, 0, -D])
  main.line([-W, 0, D], [-W, 0, -D])
  main.rect(-W, 0, W, H, -D)
  main.line([-W, 0, -D], [-W, H, -D])
  main.line([-W, H, -D], [-W, H, D])
  main.line([-W, H, D], [-W, 0, D])
  // Window on the back wall, with mullions.
  main.rect(-1.6, 1.0, 0.8, 2.6, -D + 0.01)
  main.line([-0.4, 1.0, -D + 0.01], [-0.4, 2.6, -D + 0.01])
  main.line([-1.6, 1.8, -D + 0.01], [0.8, 1.8, -D + 0.01])
  // Door on the left wall.
  main.line([-W + 0.01, 0, 0.6], [-W + 0.01, 2.2, 0.6])
  main.line([-W + 0.01, 2.2, 0.6], [-W + 0.01, 2.2, 1.6])
  main.line([-W + 0.01, 2.2, 1.6], [-W + 0.01, 0, 1.6])
  // Sofa.
  main.box(2.6, 0.42, 0.95, -0.6, 0, 1.6)
  main.box(2.6, 0.5, 0.22, -0.6, 0.42, 2.0)
  main.box(0.22, 0.32, 0.95, -1.8, 0.42, 1.6)
  main.box(0.22, 0.32, 0.95, 0.6, 0.42, 1.6)
  // Rug and coffee table.
  main.rect(-2.2, 0.2, 1.0, -1.0, 0)
  main.box(1.3, 0.06, 0.7, -0.6, 0.4, 0.2)
  for (const [x, z] of [[-1.15, -0.05], [-0.05, -0.05], [-1.15, 0.45], [-0.05, 0.45]]) main.line([x, 0, z], [x, 0.4, z])
  // Desk and monitor, back right.
  main.box(2.0, 0.05, 0.8, 2.6, 0.75, -2.45)
  for (const [x, z] of [[1.65, -2.8], [3.55, -2.8], [1.65, -2.1], [3.55, -2.1]]) main.line([x, 0, z], [x, 0.75, z])
  main.box(1.0, 0.62, 0.05, 2.6, 1.0, -2.65)
  main.box(0.12, 0.2, 0.12, 2.6, 0.8, -2.65)
  main.box(0.5, 0.95, 0.5, 2.0, 0, -1.7)
  // Bookshelf against the left wall.
  main.box(0.42, 2.2, 1.5, -3.75, 0, -1.4)
  for (const y of [0.55, 1.1, 1.65]) main.line([-3.54, y, -2.15], [-3.54, y, -0.65])
  // Plant.
  main.geo(new THREE.CylinderGeometry(0.22, 0.17, 0.45, 10, 1, true), [3.3, 0.225, 1.9], [0, 0, 0], 1)
  main.geo(new THREE.IcosahedronGeometry(0.42, 0), [3.3, 0.85, 1.9])

  // The lamp is the "automation" piece and is drawn in amber.
  const accent = new Ink()
  accent.line([-2.6, 0, 1.6], [-2.6, 2.2, 1.6])
  accent.geo(new THREE.CylinderGeometry(0.18, 0.4, 0.42, 12, 1, true), [-2.6, 2.35, 1.6], [0, 0, 0], 1)
  accent.geo(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 12), [-2.6, 0.02, 1.6], [0, 0, 0], 1)
  // Dimension line along the front edge.
  const dim = new Ink()
  dim.line([-W, 0, D + 0.6], [W, 0, D + 0.6])
  dim.line([-W, 0, D + 0.4], [-W, 0, D + 0.8])
  dim.line([W, 0, D + 0.4], [W, 0, D + 0.8])
  dim.line([W + 0.6, 0, -D], [W + 0.6, 0, D])
  dim.line([W + 0.4, 0, -D], [W + 0.8, 0, -D])
  dim.line([W + 0.4, 0, D], [W + 0.8, 0, D])

  return { grid, main, accent, dim }
}

export function RoomScene({ onDrawn }: { onDrawn?: () => void }) {
  const host = useRef<HTMLDivElement>(null)
  const notesRef = useRef<HTMLDivElement>(null)
  const drawn = useRef(onDrawn)
  drawn.current = onDrawn

  useEffect(() => {
    const el = host.current
    const notesEl = notesRef.current
    if (!el || !notesEl) return
    const reduced = prefersReducedMotion()

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.prepend(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
    camera.position.set(11, 9, 11)
    camera.lookAt(0, 1.1, 0)

    const room = new THREE.Group()
    scene.add(room)
    const ink = drawRoom()
    const layers = [
      { ...ink.grid.build("#7cc4ff", 0.12), speed: 1.6 },
      { ...ink.main.build("#cfe6ff", 0.92), speed: 1 },
      { ...ink.accent.build("#ffb547", 1), speed: 1 },
      { ...ink.dim.build("#7cc4ff", 0.6), speed: 1 },
    ]
    layers.forEach((l) => room.add(l.l))

    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      renderer.setSize(w, h)
      const aspect = w / h
      const view = w < 700 ? 6.6 : 5.6
      const shift = w >= 1000 ? view * aspect * 0.27 : 0
      camera.left = -view * aspect - shift
      camera.right = view * aspect - shift
      camera.top = view
      camera.bottom = -view
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener("resize", resize)

    const noteEls = Array.from(notesEl.children) as HTMLElement[]
    const anchors = NOTES.map((n) => new THREE.Vector3(...n.anchor))
    const v = new THREE.Vector3()

    let mx = 0, my = 0, lx = 0, ly = 0
    const onMove = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5
      my = e.clientY / window.innerHeight - 0.5
    }
    window.addEventListener("pointermove", onMove)

    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(el)

    const start = performance.now()
    const DRAW_MS = 2600
    let doneFired = false
    let raf = 0

    const frame = (now: number) => {
      const p = reduced ? 1 : Math.min(1, (now - start) / DRAW_MS)
      // Main lines ink in first, then the amber lamp and dimension lines.
      layers.forEach((l, i) => {
        const local = i === 0 ? Math.min(1, p * l.speed) : i === 1 ? Math.min(1, p / 0.8) : Math.max(0, (p - 0.75) / 0.25)
        l.l.geometry.setDrawRange(0, Math.floor(l.count * easeInOut(local)) & ~1)
      })
      if (p >= 1 && !doneFired) {
        doneFired = true
        drawn.current?.()
      }

      lx += (mx - lx) * 0.05
      ly += (my - ly) * 0.05
      const scroll = Math.min(1, window.scrollY / window.innerHeight)
      room.rotation.y = lx * 0.5 + scroll * 0.7
      room.rotation.x = ly * 0.08
      room.position.y = -scroll * 1.5

      room.updateMatrixWorld()
      const w = el.clientWidth
      const h = el.clientHeight
      anchors.forEach((a, i) => {
        v.copy(a).applyMatrix4(room.matrixWorld).project(camera)
        noteEls[i].style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px)`
      })

      renderer.render(scene, camera)
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (visible) frame(now)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener("resize", resize)
      window.removeEventListener("pointermove", onMove)
      layers.forEach((l) => l.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div ref={host} className="bp-scene" aria-hidden="true">
      <div ref={notesRef} className="bp-notes">
        {NOTES.map((n, i) => (
          <div key={n.title} className="bp-note" style={{ ["--i" as string]: i }}>
            <i className="bp-note__dot" />
            <div className="bp-note__card">
              <span className="bp-note__no">{String.fromCharCode(65 + i)}</span>
              <strong>{n.title}</strong>
              <span>{n.body}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}
