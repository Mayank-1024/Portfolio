"use client"

import { createElement, useEffect, useRef } from "react"
import Lenis from "lenis"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import { useGSAP } from "@gsap/react"
import "lenis/dist/lenis.css"

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

export { gsap, ScrollTrigger, SplitText, useGSAP }

/** gsap.matchMedia condition: only animate for people who haven't asked for less motion. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)"
export const FINE_POINTER = "(hover: hover) and (pointer: fine)"

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** Lenis smooth scrolling driven by GSAP's ticker, so ScrollTrigger and Lenis never disagree. */
export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (prefersReducedMotion()) return
    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -72 } })
    lenisRef.current = lenis
    lenis.on("scroll", ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    // Default lag smoothing stays on: after a long frame (hydration, WebGL setup) animations resume
    // instead of jumping ahead, so the intro isn't skipped on slower machines.
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return lenisRef
}

/** Scrolls to a section id through Lenis when it is running, natively otherwise. */
export function scrollToId(lenis: Lenis | null, id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: -72, duration: 1.4 })
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" })
}

/**
 * Splits `el` into masked lines/words/chars and animates them in.
 * Re-splits on resize and font load (autoSplit), so lines never break wrongly.
 */
export function splitReveal(el: Element, by: "lines" | "words" | "chars", from: gsap.TweenVars, to?: gsap.TweenVars) {
  return SplitText.create(el, {
    type: by === "chars" ? "words,chars" : by === "words" ? "lines,words" : "lines",
    mask: to ? undefined : by,
    autoSplit: true,
    onSplit: (self) => (to ? gsap.fromTo(self[by], from, to) : gsap.from(self[by], from)),
  })
}

/** Left-to-right "plotter" wipe, as clip-path from/to pairs. */
export const WIPE_FROM = { clipPath: "inset(0% 100% 0% 0%)" }
export const WIPE_TO = { clipPath: "inset(0% 0% 0% 0%)" }

/** Counts every number inside `el` up from zero, keeping the surrounding text ("30–40%", "+12.0 m"). */
export function countUp(el: HTMLElement, vars: gsap.TweenVars = {}) {
  const parts = (el.textContent ?? "").split(/(\d+(?:\.\d+)?)/)
  const targets = parts.map((p, i) => (i % 2 ? { n: parseFloat(p), dp: p.split(".")[1]?.length ?? 0 } : null))
  const state = { p: 0 }
  const render = () =>
    (el.textContent = parts.map((p, i) => (targets[i] ? (targets[i]!.n * state.p).toFixed(targets[i]!.dp) : p)).join(""))
  render()
  return gsap.to(state, { p: 1, duration: 1.6, ease: "power3.out", ...vars, onUpdate: render })
}

/** Elements matching `selector` drift toward the pointer and spring back. Returns a cleanup. */
export function bindMagnetic(root: HTMLElement, selector: string, strength = 0.3) {
  const offs = Array.from(root.querySelectorAll<HTMLElement>(selector)).map((el) => {
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.45)" })
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.45)" })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * strength)
      yTo((e.clientY - (r.top + r.height / 2)) * strength)
    }
    const leave = () => (xTo(0), yTo(0))
    el.addEventListener("pointermove", move)
    el.addEventListener("pointerleave", leave)
    return () => (el.removeEventListener("pointermove", move), el.removeEventListener("pointerleave", leave))
  })
  return () => offs.forEach((off) => off())
}

/** 3D tilt toward the pointer; also exposes --mx/--my (0–100%) for a glare highlight. */
export function bindTilt(root: HTMLElement, selector: string, max = 7) {
  const offs = Array.from(root.querySelectorAll<HTMLElement>(selector)).map((el) => {
    gsap.set(el, { transformPerspective: 900 })
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3" })
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3" })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      ry((px - 0.5) * max * 2)
      rx((0.5 - py) * max * 2)
      el.style.setProperty("--mx", `${px * 100}%`)
      el.style.setProperty("--my", `${py * 100}%`)
    }
    const leave = () => (rx(0), ry(0))
    el.addEventListener("pointermove", move)
    el.addEventListener("pointerleave", leave)
    return () => (el.removeEventListener("pointermove", move), el.removeEventListener("pointerleave", leave))
  })
  return () => offs.forEach((off) => off())
}

/** Writes the pointer position inside `el` to --sx/--sy for a spotlight gradient. */
export function bindSpotlight(el: HTMLElement) {
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect()
    el.style.setProperty("--sx", `${e.clientX - r.left}px`)
    el.style.setProperty("--sy", `${e.clientY - r.top}px`)
  }
  el.addEventListener("pointermove", move)
  return () => el.removeEventListener("pointermove", move)
}

/**
 * Moves a nav indicator under whichever section is in view. `links` maps section id → anchor;
 * while `hero` is in view nothing is active.
 */
export function bindActiveNav(indicator: HTMLElement, links: Map<string, HTMLElement>, hero?: Element | null) {
  const xTo = gsap.quickTo(indicator, "x", { duration: 0.5, ease: "power3" })
  const wTo = gsap.quickTo(indicator, "width", { duration: 0.5, ease: "power3" })
  const set = (id: string | null) => {
    links.forEach((a, key) => a.classList.toggle("is-active", key === id))
    const a = id ? links.get(id) : null
    gsap.to(indicator, { autoAlpha: a ? 1 : 0, duration: 0.3 })
    if (a) (xTo(a.offsetLeft), wTo(a.offsetWidth))
  }
  links.forEach((_, id) => {
    const section = document.getElementById(id)
    if (!section) return
    ScrollTrigger.create({
      trigger: section,
      start: "top 45%",
      end: "bottom 45%",
      onToggle: (self) => self.isActive && set(id),
    })
  })
  if (hero) ScrollTrigger.create({ trigger: hero, start: "top top", end: "bottom 45%", onToggle: (self) => self.isActive && set(null) })
  set(null)
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+=<>/\\"

/** Animates `el` from random glyphs to `text`. Returns a cancel function. */
export function scramble(el: HTMLElement, text: string, duration = 900, glyphs = GLYPHS) {
  if (prefersReducedMotion()) {
    el.textContent = text
    return () => {}
  }
  const start = performance.now()
  let id = 0
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / duration)
    const settled = Math.floor(p * text.length)
    let out = ""
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      out += i < settled || ch === " " ? ch : glyphs[(Math.random() * glyphs.length) | 0]
    }
    el.textContent = out
    if (p < 1) id = requestAnimationFrame(tick)
  }
  id = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(id)
}

type ScrambleProps = {
  text: string
  as?: keyof HTMLElementTagNameMap
  className?: string
  /** "inview" runs once when visible; "hover" re-runs on pointer enter (of the closest [data-scramble-host] if any). */
  trigger?: "mount" | "inview" | "hover"
  duration?: number
  delay?: number
  glyphs?: string
}

export function Scramble({ text, as = "span", className, trigger = "inview", duration, delay = 0, glyphs }: ScrambleProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let cancel = () => {}
    let timer = 0
    const run = () => {
      cancel()
      timer = window.setTimeout(() => (cancel = scramble(el, text, duration, glyphs)), delay)
    }
    if (trigger === "mount") run()
    let io: IntersectionObserver | undefined
    if (trigger === "inview") {
      io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          run()
          io?.disconnect()
        }
      })
      io.observe(el)
    }
    const host = trigger === "hover" ? (el.closest<HTMLElement>("[data-scramble-host]") ?? el) : null
    host?.addEventListener("pointerenter", run)
    return () => {
      cancel()
      clearTimeout(timer)
      io?.disconnect()
      host?.removeEventListener("pointerenter", run)
    }
  }, [text, trigger, duration, delay, glyphs])

  return createElement(as, { ref, className, "aria-label": text }, text)
}

/** Deterministic pseudo hash so markup is stable between server and client renders. */
export function fakeHash(seed: string, length = 40) {
  let h = 2166136261
  let out = ""
  for (let i = 0; out.length < length; i++) {
    h ^= seed.charCodeAt(i % seed.length) + i
    h = Math.imul(h, 16777619) >>> 0
    out += (h % 16).toString(16)
  }
  return "0x" + out
}
