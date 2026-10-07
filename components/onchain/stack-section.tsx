"use client"

import { useRef, useState } from "react"
import { Bot, Braces, FlaskConical, ChartSpline, Cloud, Container, Database, KeyRound, Network, Server, Webhook, Workflow, type LucideIcon } from "lucide-react"
import {
  siChartdotjs,
  siD3,
  siDjango,
  siDocker,
  siFigma,
  siFirebase,
  siGithub,
  siGithubactions,
  siJavascript,
  siJsonwebtokens,
  siMongodb,
  siN8n,
  siNextdotjs,
  siNodedotjs,
  siOpenjdk,
  siPostman,
  siPython,
  siReact,
  siRedux,
  siSolidity,
  siSqlite,
  siTypescript,
  siVercel,
  type SimpleIcon,
} from "simple-icons"

import { skills, type Skill, type UsedIn } from "@/lib/content"
import { bindSpotlight, FINE_POINTER, gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/motion"

const BRANDS: Record<string, SimpleIcon> = {
  siChartdotjs, siD3, siDjango, siDocker, siFigma, siFirebase, siGithub, siGithubactions, siJavascript, siJsonwebtokens, siMongodb,
  siN8n, siNextdotjs, siNodedotjs, siOpenjdk, siPostman, siPython, siReact, siRedux, siSolidity, siSqlite, siTypescript, siVercel,
}
// Generic tools have no brand mark.
const GENERIC: Record<string, LucideIcon> = { test: FlaskConical, bot: Bot, network: Network, webhook: Webhook, key: KeyRound, database: Database, cloud: Cloud, server: Server }
const GROUP_ICONS: LucideIcon[] = [Workflow, Braces, Container, ChartSpline]

const USED: Record<UsedIn, { label: string; href: string }> = {
  qixazow: { label: "Qixazow", href: "#exp-qixazow" },
  veraai: { label: "VeraAI", href: "#exp-veraai" },
  aess: { label: "AESS", href: "#exp-aess" },
  appright: { label: "Appright", href: "#exp-appright" },
  uniswap: { label: "Uniswap V2", href: "#projects" },
  nextap: { label: "NexTap", href: "#projects" },
  emergency: { label: "Emergency Alert", href: "#projects" },
  northeastern: { label: "M.S. coursework", href: "#education" },
}

function SkillIcon({ icon, size = 18 }: { icon: string; size?: number }) {
  const brand = BRANDS[icon]
  if (brand)
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
        <path d={brand.path} />
      </svg>
    )
  const Generic = GENERIC[icon] ?? Braces
  return <Generic size={size} strokeWidth={1.6} aria-hidden="true" />
}

type Active = { group: number; skill: Skill } | null

export function StackSection() {
  const root = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<Active>(null)

  useGSAP(
    () => {
      const el = root.current!
      const tiles = gsap.utils.toArray<HTMLElement>(".oc-tile", el)
      const mm = gsap.matchMedia()

      mm.add(MOTION_OK, () => {
        tiles.forEach((tile, i) => {
          const tokens = tile.querySelectorAll(".oc-token")
          const tl = gsap.timeline({ scrollTrigger: { trigger: tile, start: "top 82%" }, defaults: { ease: "expo.out" } })
          tl.fromTo(tile, { clipPath: "inset(0% 0% 100% 0% round 18px)" }, { clipPath: "inset(0% 0% 0% 0% round 18px)", duration: 1.1, ease: "expo.inOut" }, i * 0.08)
          tl.from(tile.querySelectorAll(".oc-tile__head > *, .oc-tile__blurb"), { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.06 }, "-=0.5")
          if (i === 2) {
            // Cloud & DevOps: layers stack upward like a deployment.
            tl.from(tokens, { y: 40, autoAlpha: 0, duration: 0.7, stagger: { each: 0.07, from: "end" }, ease: "back.out(1.6)", clearProps: "transform,opacity,visibility" }, "-=0.4")
          } else {
            tl.from(tokens, { scale: 0.7, autoAlpha: 0, duration: 0.55, stagger: 0.04, ease: "back.out(2.2)", clearProps: "transform,opacity,visibility" }, "-=0.4")
          }
        })

        // Integration & Automation: a pulse runs through the tools in order, like data through a workflow.
        const flow = gsap.utils.toArray<HTMLElement>(".oc-tile--0 .oc-token", el)
        const pulse = gsap.timeline({ repeat: -1, repeatDelay: 1.2, paused: true })
        flow.forEach((t, i) => pulse.call(() => t.classList.add("is-pulse"), [], i * 0.32).call(() => t.classList.remove("is-pulse"), [], i * 0.32 + 0.6))
        ScrollTrigger.create({ trigger: ".oc-tile--0", start: "top 85%", end: "bottom 15%", onToggle: (self) => (self.isActive ? pulse.play() : pulse.pause()) })
      })

      mm.add(`${MOTION_OK} and ${FINE_POINTER}`, () => {
        const offs = tiles.map((t) => bindSpotlight(t))
        return () => offs.forEach((off) => off())
      })
    },
    { scope: root },
  )

  return (
    <div className="oc-stack" ref={root}>
      {skills.map((g, gi) => {
        const GroupIcon = GROUP_ICONS[gi]
        const current = active?.group === gi ? active.skill : null
        return (
          <section key={g.group} className={`oc-tile oc-tile--${gi}`} onPointerLeave={() => setActive(null)}>
            <header className="oc-tile__head">
              <span className="oc-tile__icon">
                <GroupIcon size={18} strokeWidth={1.6} />
              </span>
              <h3>{g.group}</h3>
            </header>
            <p className="oc-tile__blurb">{g.blurb}</p>
            <ul className="oc-tokens">
              {g.items.map((s) => (
                <li key={s.name}>
                  <button
                    type="button"
                    className={`oc-token ${current?.name === s.name ? "is-on" : ""}`}
                    onPointerEnter={() => setActive({ group: gi, skill: s })}
                    onFocus={() => setActive({ group: gi, skill: s })}
                    onClick={() => setActive({ group: gi, skill: s })}
                    aria-describedby={`used-${gi}`}
                  >
                    <span className="oc-token__icon">
                      <SkillIcon icon={s.icon} size={gi === 1 ? 24 : 16} />
                    </span>
                    <span className="oc-token__name">{s.name}</span>
                  </button>
                </li>
              ))}
            </ul>
            <footer className="oc-tile__used" id={`used-${gi}`} aria-live="polite">
              {current ? (
                current.used.length ? (
                  <>
                    <span className="oc-mono oc-dim">{current.name} at</span>
                    {current.used.map((u) => (
                      <a key={u} href={USED[u].href} className="oc-used">
                        {USED[u].label}
                      </a>
                    ))}
                  </>
                ) : (
                  <span className="oc-mono oc-dim">{current.name} is part of my toolkit</span>
                )
              ) : (
                <span className="oc-mono oc-dim">Hover a tool to see where I used it</span>
              )}
            </footer>
          </section>
        )
      })}
    </div>
  )
}
