"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { gsap, prefersReducedMotion } from "@/lib/motion"

export type ChainBlock = { id: string; label: string }

// Matches the On-Chain palette (onchain.css): champagne accent, pale gold signal, cool slate rim light.
const ACCENT = new THREE.Color("#e2b867")
const SIGNAL = new THREE.Color("#f3dcaa")
const SLATE = new THREE.Color("#7f95c4")

/** Draws the front face of a block: number, label and a hash, in the mono font the page uses. */
function faceTexture(index: number, label: string, font: string) {
  const c = document.createElement("canvas")
  c.width = c.height = 512
  const g = c.getContext("2d")!
  const grad = g.createLinearGradient(0, 0, 512, 512)
  grad.addColorStop(0, "#1b1d24")
  grad.addColorStop(1, "#0b0c0f")
  g.fillStyle = grad
  g.fillRect(0, 0, 512, 512)
  g.strokeStyle = "rgba(228,230,236,.28)"
  g.lineWidth = 2
  for (let i = 1; i < 8; i++) {
    g.beginPath()
    g.moveTo(0, i * 64)
    g.lineTo(512, i * 64)
    g.globalAlpha = 0.25
    g.stroke()
  }
  g.globalAlpha = 1
  g.fillStyle = "rgba(238,236,232,.55)"
  g.font = `500 30px ${font}`
  g.fillText("BLOCK", 44, 82)
  g.fillStyle = "#e2b867"
  g.font = `700 112px ${font}`
  g.fillText(`#${index.toString(16).padStart(2, "0")}`, 40, 220)
  g.fillStyle = "#eeece8"
  g.font = `600 44px ${font}`
  g.fillText(label.toUpperCase(), 44, 330)
  g.fillStyle = "rgba(238,236,232,.38)"
  g.font = `400 24px ${font}`
  let h = (index + 7) * 2654435761
  let hash = "0x"
  for (let i = 0; i < 18; i++) {
    h = (h ^ (h >>> 13)) * 1274126177
    hash += ((h >>> 0) % 16).toString(16)
  }
  g.fillText(hash, 44, 410)
  g.fillStyle = "#e2b867"
  g.beginPath()
  g.arc(458, 70, 12, 0, Math.PI * 2)
  g.fill()
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

export function ChainScene({ blocks, onSelect }: { blocks: ChainBlock[]; onSelect: (id: string) => void }) {
  const host = useRef<HTMLDivElement>(null)
  const select = useRef(onSelect)
  select.current = onSelect

  useEffect(() => {
    const el = host.current
    if (!el) return
    const reduced = prefersReducedMotion()
    const small = window.innerWidth < 768

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog("#0b0c0f", 12, 30)
    const camera = new THREE.PerspectiveCamera(small ? 50 : 34, 1, 0.1, 100)
    camera.position.set(0, 0.4, 16)

    scene.add(new THREE.AmbientLight("#ffffff", 0.9))
    const key = new THREE.PointLight(ACCENT, 55, 40)
    key.position.set(6, 5, 8)
    scene.add(key)
    const rim = new THREE.PointLight(SLATE, 40, 40)
    rim.position.set(-7, -4, 6)
    scene.add(rim)

    const chain = new THREE.Group()
    chain.position.set(small ? 0 : 1.1, small ? 2.2 : 1.3, 0)
    scene.add(chain)

    const font = getComputedStyle(document.body).getPropertyValue("--font-jetbrains") || "monospace"
    const size = 1.7
    const boxGeo = new THREE.BoxGeometry(size, size, size)
    const edgeGeo = new THREE.EdgesGeometry(boxGeo)
    const sideMat = new THREE.MeshStandardMaterial({ color: "#181a21", metalness: 0.5, roughness: 0.4, emissive: "#22252e", emissiveIntensity: 0.4 })
    const disposables: { dispose: () => void }[] = [boxGeo, edgeGeo, sideMat]

    const spacing = small ? 2.3 : 2.45
    const items = blocks.map((b, i) => {
      const tex = faceTexture(i + 1, b.label, font)
      const faceMat = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.2, roughness: 0.5, emissive: "#ffffff", emissiveMap: tex, emissiveIntensity: 0.7 })
      const mesh = new THREE.Mesh(boxGeo, [faceMat, faceMat, sideMat, sideMat, faceMat, faceMat])
      const edgeMat = new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.9 })
      const edges = new THREE.LineSegments(edgeGeo, edgeMat)
      const halo = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending }))
      halo.scale.setScalar(1.12)
      const g = new THREE.Group()
      g.add(mesh, edges, halo)
      mesh.userData = { id: b.id, index: i }
      chain.add(g)
      disposables.push(tex, faceMat, edgeMat, halo.material as THREE.Material)
      const from = new THREE.Vector3((Math.random() - 0.5) * 26, 9 + Math.random() * 8, (Math.random() - 0.5) * 14 - 6)
      const spin = new THREE.Vector3(Math.random() * 6 - 3, Math.random() * 6 - 3, Math.random() * 2 - 1)
      return { g, mesh, edgeMat, phase: i * 0.9, hover: 0, from, spin, lock: reduced ? 1 : 0 }
    })

    // Links: two rails between each pair of neighbours, rebuilt every frame from block positions.
    const railCount = (blocks.length - 1) * 2
    const railPos = new Float32Array(railCount * 2 * 3)
    const railGeo = new THREE.BufferGeometry()
    railGeo.setAttribute("position", new THREE.BufferAttribute(railPos, 3))
    const railMat = new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.45 })
    chain.add(new THREE.LineSegments(railGeo, railMat))
    disposables.push(railGeo, railMat)

    // Data packets riding the rails.
    const packetGeo = new THREE.SphereGeometry(0.07, 12, 12)
    const packetMat = new THREE.MeshBasicMaterial({ color: SIGNAL })
    const packets = Array.from({ length: blocks.length - 1 }, (_, i) => {
      const m = new THREE.Mesh(packetGeo, packetMat)
      chain.add(m)
      return { m, link: i, t: Math.random() }
    })
    disposables.push(packetGeo, packetMat)

    // Ambient dust.
    const dustCount = small ? 350 : 800
    const dust = new Float32Array(dustCount * 3)
    for (let i = 0; i < dustCount; i++) {
      dust[i * 3] = (Math.random() - 0.5) * 40
      dust[i * 3 + 1] = (Math.random() - 0.5) * 20
      dust[i * 3 + 2] = (Math.random() - 0.5) * 20 - 4
    }
    const dustGeo = new THREE.BufferGeometry()
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dust, 3))
    const dustMat = new THREE.PointsMaterial({ color: "#d9dbe2", size: 0.03, transparent: true, opacity: 0.6, depthWrite: false })
    const dustPts = new THREE.Points(dustGeo, dustMat)
    scene.add(dustPts)
    disposables.push(dustGeo, dustMat)

    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      renderer.setSize(w, h, false)
      renderer.domElement.style.width = "100%"
      renderer.domElement.style.height = "100%"
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      fit()
    }

    // Shrink the whole chain (keeping its proportions) until the first and last blocks, at rest, sit inside the frame.
    const probe = new THREE.Object3D()
    const pv = new THREE.Vector3()
    const fit = () => {
      const z = camera.position.z
      camera.position.z = 16
      camera.updateMatrixWorld()
      const n = items.length
      const mid = (n - 1) / 2
      const inFrame = (scale: number) => {
        probe.position.copy(chain.position)
        probe.rotation.set(0.12, -0.35, -0.12)
        probe.scale.setScalar(scale)
        probe.updateMatrixWorld()
        return [0, n - 1].every((i) =>
          [-1.25, 1.25].every((dx) => {
            pv.set((i - mid) * spacing + dx, Math.sin(i * 1.1) * 0.6, Math.cos(i * 0.8) * 1.2).applyMatrix4(probe.matrixWorld).project(camera)
            return Math.abs(pv.x) <= 0.93
          }),
        )
      }
      let scale = 1
      while (scale > 0.5 && !inFrame(scale)) scale -= 0.02
      chain.scale.setScalar(scale)
      camera.position.z = z
    }
    resize()
    window.addEventListener("resize", resize)

    const pointer = new THREE.Vector2(0, 0)
    const target = new THREE.Vector2(0, 0)
    const ray = new THREE.Raycaster()
    let hovered: number | null = null
    const meshes = items.map((it) => it.mesh)

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      target.copy(pointer)
    }
    const onClick = () => {
      if (hovered !== null) select.current(blocks[hovered].id)
    }
    el.addEventListener("pointermove", onMove)
    el.addEventListener("click", onClick)

    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(el)

    const look = new THREE.Vector2(0, 0)
    const tmp = new THREE.Vector3()
    const tmp2 = new THREE.Vector3()
    const clock = new THREE.Clock()
    let raf = 0

    const intro = { links: reduced ? 1 : 0 }
    const introTl = gsap.timeline({ delay: 0.15 })
    if (!reduced) {
      items.forEach((it, i) => introTl.to(it, { lock: 1, duration: 1.5, ease: "expo.out" }, i * 0.12))
      introTl.to(intro, { links: 1, duration: 0.9, ease: "power2.out" }, ">-0.7")
    }
    const dest = new THREE.Vector3()

    const frame = () => {
      const t = clock.getElapsedTime()
      const scroll = Math.min(1.4, window.scrollY / window.innerHeight)
      look.lerp(target, 0.05)

      chain.rotation.y = -0.35 + look.x * 0.35
      chain.rotation.x = 0.12 - look.y * 0.18
      chain.rotation.z = -0.12

      const spread = spacing * (1 + scroll * 0.6)
      const mid = (items.length - 1) / 2
      items.forEach((it, i) => {
        const x = (i - mid) * spread
        dest.set(x, Math.sin(t * 0.7 + it.phase) * 0.35 + Math.sin(i * 1.1) * 0.6, Math.cos(i * 0.8) * 1.2 - scroll * 3)
        it.g.position.lerpVectors(it.from, dest, it.lock)
        const un = 1 - it.lock
        it.g.rotation.set(Math.sin(t * 0.4 + it.phase) * 0.25 + 0.35 + it.spin.x * un, t * 0.18 + it.phase + it.spin.y * un, it.spin.z * un)
        const want = hovered === i ? 1 : 0
        it.hover += (want - it.hover) * 0.12
        it.g.scale.setScalar((0.35 + 0.65 * it.lock) * (1 + it.hover * 0.14))
        it.edgeMat.color.copy(ACCENT).lerp(SIGNAL, it.hover)
      })

      for (let i = 0; i < items.length - 1; i++) {
        items[i].g.getWorldPosition(tmp)
        items[i + 1].g.getWorldPosition(tmp2)
        chain.worldToLocal(tmp)
        chain.worldToLocal(tmp2)
        for (let r = 0; r < 2; r++) {
          const off = r === 0 ? 0.18 : -0.18
          const o = (i * 2 + r) * 6
          railPos.set([tmp.x, tmp.y + off, tmp.z, tmp2.x, tmp2.y + off, tmp2.z], o)
        }
      }
      railGeo.attributes.position.needsUpdate = true
      railMat.opacity = 0.45 * intro.links

      packets.forEach((p) => {
        p.t = (p.t + 0.006) % 1
        items[p.link].g.getWorldPosition(tmp)
        items[p.link + 1].g.getWorldPosition(tmp2)
        chain.worldToLocal(tmp)
        chain.worldToLocal(tmp2)
        p.m.position.lerpVectors(tmp, tmp2, p.t)
        p.m.position.y += 0.18
        p.m.visible = intro.links > 0.98
      })

      dustPts.rotation.y = t * 0.01 + look.x * 0.05
      camera.position.z = 16 + scroll * 4
      renderer.domElement.style.opacity = String(Math.max(0, 1 - scroll * 0.9))

      ray.setFromCamera(pointer, camera)
      const hit = ray.intersectObjects(meshes, false)[0]
      hovered = hit ? (hit.object.userData.index as number) : null
      el.style.cursor = hovered !== null ? "pointer" : ""

      renderer.render(scene, camera)
    }

    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (visible) frame()
    }

    // Repaint the faces once the web font is ready so the canvas text uses it.
    document.fonts?.ready.then(() => {
      const f = getComputedStyle(document.body).getPropertyValue("--font-jetbrains") || "monospace"
      items.forEach((it, i) => {
        const face = (it.mesh.material as THREE.MeshStandardMaterial[])[4]
        const old = face.map
        const tex = faceTexture(i + 1, blocks[i].label, f)
        face.map = tex
        face.emissiveMap = tex
        face.needsUpdate = true
        old?.dispose()
        disposables.push(tex)
      })
      if (reduced) frame()
    })

    if (reduced) {
      frame()
      window.addEventListener("resize", frame)
    } else loop()

    return () => {
      introTl.kill()
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener("resize", resize)
      window.removeEventListener("resize", frame)
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("click", onClick)
      disposables.forEach((d) => d.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [blocks])

  return <div ref={host} className="oc-scene" aria-hidden="true" />
}
