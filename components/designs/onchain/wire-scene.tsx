"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import type { Ink } from "@/lib/ink"
import { prefersReducedMotion } from "@/lib/motion"

type V3 = [number, number, number]

export type WireLayer = {
  ink: Ink
  color: string
  opacity?: number
  /** Start/end of this layer within the 0–1 drawing timeline. */
  at: [number, number]
  /** "draw" inks the lines progressively; "drop" lowers the finished piece into place. */
  mode?: "draw" | "drop"
}
export type WireFlow = { points: V3[]; color: string; count?: number; speed?: number }
export type WireNote = { anchor: V3; title: string; body: string }
export type WireSpec = { layers: WireLayer[]; flows?: WireFlow[]; notes: WireNote[]; view?: number; target?: V3; yaw?: number }

const DROP = 2.6
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

/** Polyline sampler for packets: position at 0–1 along the whole path. */
function sampler(points: V3[]) {
  const v = points.map((p) => new THREE.Vector3(...p))
  const lengths = v.slice(1).map((p, i) => p.distanceTo(v[i]))
  const total = lengths.reduce((a, b) => a + b, 0)
  return (t: number, out: THREE.Vector3) => {
    let d = t * total
    for (let i = 0; i < lengths.length; i++) {
      if (d <= lengths[i] || i === lengths.length - 1) return out.lerpVectors(v[i], v[i + 1], Math.min(1, d / lengths[i]))
      d -= lengths[i]
    }
    return out
  }
}

/**
 * An isometric line drawing that inks itself once it scrolls into view, then idles:
 * packets travel along its flows, it sways, and it turns toward the pointer.
 */
export function WireScene({ build, onDrawn, duration = 2800 }: { build: () => WireSpec; onDrawn?: () => void; duration?: number }) {
  const host = useRef<HTMLDivElement>(null)
  const notesRef = useRef<HTMLDivElement>(null)
  const done = useRef(onDrawn)
  done.current = onDrawn
  const [notes] = useState(() => build().notes)
  const [drawn, setDrawn] = useState(false)
  const [hot, setHot] = useState<number | null>(null)

  useEffect(() => {
    const el = host.current
    const notesEl = notesRef.current
    if (!el || !notesEl) return
    const reduced = prefersReducedMotion()
    const spec = build()

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.prepend(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
    const target = new THREE.Vector3(...(spec.target ?? [0, 1, 0]))
    camera.position.set(11, 9, 11).add(target)
    camera.lookAt(target)
    const world = new THREE.Group()
    world.position.copy(target)
    const content = new THREE.Group()
    content.position.copy(target).multiplyScalar(-1)
    world.add(content)
    scene.add(world)

    const disposables: { dispose: () => void }[] = []
    const layers = spec.layers.map((layer) => {
      const built = layer.ink.build(layer.color, layer.opacity ?? 0.9)
      content.add(built.l)
      disposables.push(built)
      if (layer.mode === "drop") built.l.geometry.setDrawRange(0, built.count)
      const mat = built.l.material as THREE.LineBasicMaterial
      return { ...layer, ...built, mat, base: layer.opacity ?? 0.9 }
    })

    const packetGeo = new THREE.SphereGeometry(0.07, 10, 10)
    disposables.push(packetGeo)
    const packets = (spec.flows ?? []).flatMap((f) => {
      const mat = new THREE.MeshBasicMaterial({ color: f.color, transparent: true, opacity: 0 })
      disposables.push(mat)
      const at = sampler(f.points)
      return Array.from({ length: f.count ?? 2 }, (_, i) => {
        const m = new THREE.Mesh(packetGeo, mat)
        content.add(m)
        return { m, mat, at, t: i / (f.count ?? 2), speed: f.speed ?? 0.12 }
      })
    })

    const view = spec.view ?? 5
    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h)
      // Keep the full width of the drawing in frame; portrait frames simply gain height.
      const halfW = view * 1.25
      const halfH = halfW / (w / h)
      camera.left = -halfW
      camera.right = halfW
      camera.top = halfH * 0.84
      camera.bottom = -halfH * 1.16
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    let px = 0
    let lx = 0
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      px = (e.clientX - r.left) / r.width - 0.5
    }
    const onLeave = () => (px = 0)
    el.addEventListener("pointermove", onMove)
    el.addEventListener("pointerleave", onLeave)

    const noteEls = Array.from(notesEl.children) as HTMLElement[]
    const anchors = spec.notes.map((n) => new THREE.Vector3(...n.anchor))
    const v = new THREE.Vector3()

    let start = -1
    let visible = false
    let fired = false
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting
        if (visible && start < 0) start = performance.now()
      },
      { threshold: 0.3 },
    )
    io.observe(el)

    const clock = new THREE.Clock()
    let raf = 0
    const frame = (now: number) => {
      const dt = Math.min(0.05, clock.getDelta())
      const p = start < 0 ? 0 : reduced ? 1 : clamp01((now - start) / duration)

      for (const l of layers) {
        const local = clamp01((p - l.at[0]) / (l.at[1] - l.at[0]))
        if (l.mode === "drop") {
          l.l.position.y = DROP * (1 - easeOut(local))
          l.mat.opacity = l.base * clamp01(local * 3)
        } else {
          l.l.geometry.setDrawRange(0, Math.floor(l.count * ease(local)) & ~1)
        }
      }

      const live = clamp01((p - 0.92) / 0.08)
      for (const k of packets) {
        k.t = (k.t + dt * k.speed) % 1
        k.at(k.t, k.m.position)
        k.mat.opacity = live
      }

      if (p >= 1 && !fired) {
        fired = true
        setDrawn(true)
        done.current?.()
      }

      const t = clock.elapsedTime
      lx += (px - lx) * 0.06
      world.rotation.y = (spec.yaw ?? 0) + Math.sin(t * 0.25) * 0.08 + lx * 0.6

      world.updateMatrixWorld()
      const w = el.clientWidth
      const h = el.clientHeight
      anchors.forEach((a, i) => {
        v.copy(a).applyMatrix4(content.matrixWorld).project(camera)
        const x = ((v.x + 1) / 2) * w
        noteEls[i].style.transform = `translate(${x}px, ${((1 - v.y) / 2) * h}px)`
      })

      renderer.render(scene, camera)
    }
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (visible) frame(now)
      // Scrolled away mid-drawing: still confirm on time, so status and legend don't stay pending.
      else if (!fired && start >= 0 && (reduced || now - start >= duration)) {
        fired = true
        setDrawn(true)
        done.current?.()
      }
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerleave", onLeave)
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [build, duration])

  return (
    <div ref={host} className={`oc-wire ${drawn ? "is-drawn" : ""}`}>
      <div ref={notesRef} className="oc-wire__marks" aria-hidden="true">
        {notes.map((n, i) => (
          <span key={n.title} className={`oc-mark ${hot === i ? "is-hot" : ""}`} style={{ ["--i" as string]: i }}>
            <b>{String.fromCharCode(65 + i)}</b>
          </span>
        ))}
      </div>
      <ul className="oc-wire__legend">
        {notes.map((n, i) => (
          <li key={n.title} onPointerEnter={() => setHot(i)} onPointerLeave={() => setHot(null)} style={{ ["--i" as string]: i }}>
            <b>{String.fromCharCode(65 + i)}</b>
            <span>
              <strong>{n.title}</strong> {n.body}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
