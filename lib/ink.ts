import * as THREE from "three"

/** Collects edge segments from many meshes into one buffer so the whole drawing can be "inked" in order. */
export class Ink {
  pts: number[] = []
  private m = new THREE.Matrix4()
  private v = new THREE.Vector3()

  geo(g: THREE.BufferGeometry, pos: [number, number, number], rot: [number, number, number] = [0, 0, 0], threshold = 20) {
    const e = new THREE.EdgesGeometry(g, threshold)
    this.m.compose(new THREE.Vector3(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), new THREE.Vector3(1, 1, 1))
    const a = e.attributes.position
    for (let i = 0; i < a.count; i++) {
      this.v.fromBufferAttribute(a, i).applyMatrix4(this.m)
      this.pts.push(this.v.x, this.v.y, this.v.z)
    }
    e.dispose()
    g.dispose()
  }
  box(w: number, h: number, d: number, x: number, y: number, z: number) {
    this.geo(new THREE.BoxGeometry(w, h, d), [x, y + h / 2, z])
  }
  line(a: [number, number, number], b: [number, number, number]) {
    this.pts.push(...a, ...b)
  }
  rect(x0: number, y0: number, x1: number, y1: number, z: number) {
    this.line([x0, y0, z], [x1, y0, z])
    this.line([x1, y0, z], [x1, y1, z])
    this.line([x1, y1, z], [x0, y1, z])
    this.line([x0, y1, z], [x0, y0, z])
  }
  /** Polyline through points (consecutive segments). */
  path(points: [number, number, number][]) {
    for (let i = 0; i < points.length - 1; i++) this.line(points[i], points[i + 1])
  }
  /** Flat rectangle lying on the floor plane (y fixed). */
  floorRect(x0: number, z0: number, x1: number, z1: number, y = 0) {
    this.path([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], [x0, y, z0]])
  }
  /** Circle in the XZ plane. */
  ring(x: number, y: number, z: number, r: number, seg = 24) {
    const pts: [number, number, number][] = []
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2
      pts.push([x + Math.cos(a) * r, y, z + Math.sin(a) * r])
    }
    this.path(pts)
  }
  build(color: string, opacity = 1) {
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.pts, 3))
    const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity })
    const l = new THREE.LineSegments(g, m)
    l.geometry.setDrawRange(0, 0)
    return { l, count: this.pts.length / 3, dispose: () => (g.dispose(), m.dispose()) }
  }
}
