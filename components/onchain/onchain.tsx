"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ArrowDownRight, ArrowUpRight, Check, Download, Github, Linkedin, Mail } from "lucide-react"

import { education, experience, profile, projects, publication, socials, stats, venture, type Role } from "@/lib/content"
import {
  bindActiveNav,
  bindMagnetic,
  bindSpotlight,
  bindTilt,
  countUp,
  fakeHash,
  FINE_POINTER,
  gsap,
  MOTION_OK,
  Scramble,
  scrollToId,
  ScrollTrigger,
  splitReveal,
  SplitText,
  useGSAP,
  useLenis,
} from "@/lib/motion"
import { honeypotProps, useContactForm } from "@/lib/contact"
import { ChainScene, type ChainBlock } from "./chain-scene"
import { WireScene } from "./wire-scene"
import { EXPERIENCE_SCENES } from "./experience-scenes"
import { StackSection } from "./stack-section"
import "./onchain.css"

const BLOCKS: ChainBlock[] = [
  { id: "top", label: "Genesis" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "stack", label: "Stack" },
  { id: "education", label: "Education" },
  { id: "qixazow", label: "Qixazow" },
  { id: "work", label: "Work" },
  { id: "contact", label: "Contact" },
]

const NAV = BLOCKS.slice(1)

const short = (h: string) => `${h.slice(0, 8)}…${h.slice(-4)}`

function useBlockHeight() {
  const [height, setHeight] = useState(18204331)
  useEffect(() => {
    const id = setInterval(() => setHeight((h) => h + 1), 2400)
    return () => clearInterval(id)
  }, [])
  return height
}

function SectionHead({ index, label, title, sub }: { index: number; label: string; title: React.ReactNode; sub?: string }) {
  return (
    <header className="oc-head">
      <div className="oc-mono oc-head__tag">
        <Scramble className="oc-head__idx" text={`#0x${index.toString(16).padStart(2, "0")}`} glyphs="0123456789abcdef" duration={700} />
        <span className="oc-head__rule" />
        <span className="oc-head__label">{label}</span>
      </div>
      <h2 className="oc-h2">{title}</h2>
      {sub && <p className="oc-sub">{sub}</p>}
    </header>
  )
}

function CurvePanel() {
  // y = k / x, drawn in a 160×90 box.
  const pts = Array.from({ length: 40 }, (_, i) => {
    const x = 14 + i * 3.6
    const y = Math.min(84, 900 / (x - 4))
    return `${x.toFixed(1)},${(90 - y).toFixed(1)}`
  })
  const d = `M${pts.join(" L")}`
  return (
    <div className="oc-curve" aria-hidden="true">
      <span className="oc-mono">x · y = k</span>
      <svg viewBox="0 0 160 90">
        <path d="M10 2 V86 H158" className="oc-curve__axis" />
        <path d={d} className="oc-curve__line" pathLength={1} />
        <circle r="3.5" className="oc-curve__dot">
          <animateMotion dur="5s" repeatCount="indefinite" keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" path={d} />
        </circle>
      </svg>
    </div>
  )
}

function Receipt() {
  return (
    <div className="oc-receipt" role="status">
      <svg viewBox="0 0 52 52" aria-hidden="true">
        <circle cx="26" cy="26" r="24" pathLength={1} />
        <path d="M15 27 l7 7 l15 -16" pathLength={1} />
      </svg>
      <p className="oc-receipt__title">Block mined</p>
      <p className="oc-mono oc-dim">
        tx <Scramble text={short(fakeHash(String(Date.now())))} trigger="mount" glyphs="0123456789abcdef" duration={900} />
      </p>
      <p className="oc-receipt__body">Message received. I&apos;ll reply within a couple of days.</p>
    </div>
  )
}

function ExperienceBlock({ role, index, total }: { role: Role; index: number; total: number }) {
  const [drawn, setDrawn] = useState(false)
  const block = (total - index).toString(16).padStart(2, "0")
  return (
    <article id={`exp-${role.id}`} className={`oc-exp ${index % 2 ? "is-flip" : ""}`}>
      <i className="oc-exp__node" aria-hidden="true" />
      <div className="oc-exp__scene">
        <div className="oc-exp__bar oc-mono">
          <span>Block #{block}</span>
          <span className="oc-dim">render · {role.company.split(" ")[0].toLowerCase()}</span>
        </div>
        <WireScene build={EXPERIENCE_SCENES[role.scene]} onDrawn={() => setDrawn(true)} />
        <i className="oc-tick oc-tick--tl" />
        <i className="oc-tick oc-tick--tr" />
        <i className="oc-tick oc-tick--bl" />
        <i className="oc-tick oc-tick--br" />
      </div>
      <div className="oc-exp__info">
        <div className="oc-exp__meta oc-mono">
          <Scramble className="oc-accent" text={short(fakeHash(role.company))} glyphs="0123456789abcdef" />
          {role.current ? (
            <span className="oc-chip oc-chip--signal">
              <span className="oc-pulse" /> Live
            </span>
          ) : (
            <span className={`oc-chip oc-status ${drawn ? "" : "is-pending"}`}>
              <span className="oc-status__pending">
                <i className="oc-spinner" /> Pending
              </span>
              <span className="oc-status__done">
                <Check size={12} /> Confirmed
              </span>
            </span>
          )}
        </div>
        <p className="oc-mono oc-exp__period">{role.period}</p>
        <h3 className="oc-exp__title">{role.title}</h3>
        <p className="oc-exp__co">
          {role.company}
          <span className="oc-dim">
            {" "}
            · {role.location}
            {role.note ? ` · ${role.note}` : ""}
          </span>
        </p>
        <ul className="oc-exp__bullets">
          {role.bullets.map((b) => (
            <li key={b.slice(0, 24)}>{b}</li>
          ))}
        </ul>
        <ul className="oc-tags">
          {role.stack.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export function OnChain() {
  const root = useRef<HTMLDivElement>(null)
  const lenis = useLenis()
  const height = useBlockHeight()
  const { status, error, onSubmit } = useContactForm()

  useGSAP(
    () => {
      const el = root.current!
      const q = <T extends Element = HTMLElement>(s: string, scope: Element = el) => gsap.utils.toArray<T>(s, scope)

      const links = new Map(q<HTMLAnchorElement>(".oc-nav__links a").map((a) => [a.hash.slice(1), a]))
      bindActiveNav(el.querySelector<HTMLElement>(".oc-nav__ind")!, links, el.querySelector(".oc-hero"))

      const mm = gsap.matchMedia()

      mm.add(MOTION_OK, () => {
        // ── Intro: nav, name by character, role by word, then the rest.
        const name = SplitText.create(".oc-h1", { type: "chars", mask: "chars" })
        const role = SplitText.create(".oc-hero__role", { type: "words", mask: "words" })
        gsap
          .timeline({ defaults: { ease: "expo.out" }, delay: 0.25 })
          .from(".oc-nav", { yPercent: -100, autoAlpha: 0, duration: 1 })
          .from(name.chars, { yPercent: 115, duration: 1.2, stagger: 0.03 }, 0.15)
          .from(role.words, { yPercent: 110, duration: 1, stagger: 0.04 }, 0.6)
          .from("[data-intro]", { y: 22, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.85)

        // ── Hero lifts away as the chain spreads out.
        gsap.to(".oc-hero__content", {
          y: -140,
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: { trigger: ".oc-hero", start: "top top", end: "bottom 25%", scrub: true },
        })

        gsap.to(".oc-progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } })

        // ── Section headings: rule draws, title rises line by line.
        q(".oc-head").forEach((head) => {
          const st = { trigger: head, start: "top 82%" }
          gsap
            .timeline({ scrollTrigger: st, defaults: { ease: "expo.out" } })
            .from(head.querySelector(".oc-head__rule"), { scaleX: 0, duration: 0.9 })
            .from(head.querySelector(".oc-head__label"), { autoAlpha: 0, x: -12, duration: 0.6 }, 0.2)
            .from(head.querySelector(".oc-sub"), { autoAlpha: 0, y: 14, duration: 0.8 }, 0.35)
          splitReveal(head.querySelector(".oc-h2")!, "lines", { yPercent: 110, duration: 1.1, stagger: 0.09, ease: "expo.out", scrollTrigger: st })
        })

        // ── Staggered groups.
        const group = (sel: string, vars: gsap.TweenVars = {}) =>
          ScrollTrigger.batch(q(sel), {
            start: "top 88%",
            once: true,
            onEnter: (batch) => gsap.from(batch, { y: 48, autoAlpha: 0, duration: 1, ease: "expo.out", stagger: 0.1, ...vars }),
          })
        group(".oc-about__text > *")
        group(".oc-stat")
        group(".oc-card", { y: 80, rotationX: -8, transformPerspective: 900 })
        group(".oc-block")
        group(".oc-contact__info > *")
        group(".oc-form > *", { y: 24, stagger: 0.06 })

        // ── About: photo wipes up, frame ticks fly in from the centre, stats count.
        gsap
          .timeline({ scrollTrigger: { trigger: ".oc-photo", start: "top 80%" } })
          .fromTo(".oc-photo", { clipPath: "inset(100% 0% 0% 0% round 18px)" }, { clipPath: "inset(0% 0% 0% 0% round 18px)", duration: 1.4, ease: "expo.inOut" })
          .from(".oc-tick", { scale: 0, autoAlpha: 0, duration: 0.6, ease: "back.out(3)", stagger: 0.06 }, "-=0.3")
        gsap.fromTo(".oc-photo img", { yPercent: -6, scale: 1.12 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: ".oc-photo", scrub: true } })
        q(".oc-stat__v").forEach((v) => ScrollTrigger.create({ trigger: v, start: "top 88%", once: true, onEnter: () => countUp(v) }))

        // ── Qixazow: the card grows into place, the name types out.
        gsap.fromTo(
          ".oc-venture",
          { scale: 0.9, autoAlpha: 0.3 },
          { scale: 1, autoAlpha: 1, ease: "none", scrollTrigger: { trigger: ".oc-venture", start: "top 95%", end: "top 40%", scrub: true } },
        )
        splitReveal(el.querySelector(".oc-venture__name")!, "chars", {
          yPercent: 110,
          duration: 1,
          stagger: 0.04,
          ease: "expo.out",
          scrollTrigger: { trigger: ".oc-venture", start: "top 65%" },
        })
        gsap.from(".oc-venture__pillars > div", {
          y: 30,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "expo.out",
          scrollTrigger: { trigger: ".oc-venture__pillars", start: "top 85%" },
        })

        // ── Experience: the chain rail fills as you scroll; each block's details follow its drawing.
        gsap.fromTo(".oc-exps__fill", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".oc-exps", start: "top 60%", end: "bottom 60%", scrub: true } })
        q(".oc-exp").forEach((block) => {
          const st = { trigger: block, start: "top 72%" }
          gsap
            .timeline({ scrollTrigger: st, defaults: { ease: "expo.out" } })
            .from(block.querySelector(".oc-exp__node"), { scale: 0, duration: 0.6, ease: "back.out(3)" })
            .fromTo(block.querySelector(".oc-exp__scene"), { clipPath: "inset(0% 0% 100% 0% round 18px)" }, { clipPath: "inset(0% 0% 0% 0% round 18px)", duration: 1.2, ease: "expo.inOut" }, 0)
            .from(q(".oc-exp__info > *, .oc-exp__bullets li, .oc-exp__info .oc-tags li", block), { y: 26, autoAlpha: 0, duration: 0.8, stagger: 0.05 }, 0.3)
        })
      })

      mm.add(`${MOTION_OK} and ${FINE_POINTER}`, () => {
        const offs = [
          bindMagnetic(el, ".oc-btn, .oc-socials a, .oc-brand__mark", 0.25),
          bindTilt(el, ".oc-card", 5),
          bindSpotlight(el.querySelector<HTMLElement>(".oc-venture")!),
        ]
        return () => offs.forEach((off) => off())
      })

      el.classList.add("is-ready")
    },
    { scope: root },
  )

  return (
    <div className="oc" ref={root} id="top">
      <div className="oc-progress" aria-hidden="true" />
      <div className="oc-glow oc-glow--a" />
      <div className="oc-glow oc-glow--b" />

      <header className="oc-nav">
        <a href="#top" className="oc-brand">
          <span className="oc-brand__mark">MB</span>
          <span className="oc-mono">
            mayank<span className="oc-dim">.bhadrasen</span>
          </span>
        </a>
        <nav className="oc-nav__links oc-mono">
          <span className="oc-nav__ind" aria-hidden="true" />
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="oc-net oc-mono" title="Block height (just for fun)">
          <span className="oc-pulse" /> mainnet · #{height.toLocaleString("en-US")}
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="oc-hero">
        <ChainScene blocks={BLOCKS} onSelect={(id) => scrollToId(lenis.current, id)} />
        <div className="oc-hero__content">
          <div className="oc-mono oc-hero__label" data-intro>
            <span className="oc-chip oc-chip--signal">Block #000 · Genesis</span>
          </div>
          <h1 className="oc-h1">
            {profile.firstName}
            <br />
            {profile.lastName}
          </h1>
          <p className="oc-hero__role">
            Full-stack developer &amp; <span className="oc-accent">AI automation</span> engineer.
          </p>
          <p className="oc-hero__tag" data-intro>
            {profile.tagline}
          </p>
          <div className="oc-hero__ctas" data-intro>
            <a href="#work" className="oc-btn oc-btn--primary">
              View work <ArrowDownRight size={16} />
            </a>
            <a href="#contact" className="oc-btn">
              Get in touch
            </a>
            <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="oc-btn oc-btn--ghost">
              <Download size={15} /> Resume
            </a>
          </div>
        </div>
        <div className="oc-hero__hint oc-mono" data-intro>
          <span>Click a block to jump to its section</span>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────── */}
      <section id="about" className="oc-section">
        <SectionHead
          index={1}
          label="About"
          title={
            <>
              Interfaces people use. <span className="oc-accent">Automations</span> that run without them.
            </>
          }
        />
        <div className="oc-about">
          <div className="oc-about__text">
            {profile.summary.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
            <div className="oc-socials">
              <a href={socials.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github size={18} />
              </a>
              <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
              <a href={socials.x} target="_blank" rel="noopener noreferrer" aria-label="X">
                𝕏
              </a>
              <a href={socials.email} aria-label="Email">
                <Mail size={18} />
              </a>
            </div>
          </div>
          <figure className="oc-photo">
            <div className="oc-photo__img">
              <Image src={profile.photo} alt={profile.name} width={520} height={520} priority />
            </div>
            <figcaption className="oc-mono">
              <span>{short(fakeHash("mayank"))}</span>
              <span className="oc-signal">
                <Check size={12} /> verified
              </span>
            </figcaption>
            <i className="oc-tick oc-tick--tl" />
            <i className="oc-tick oc-tick--tr" />
            <i className="oc-tick oc-tick--bl" />
            <i className="oc-tick oc-tick--br" />
          </figure>
        </div>
        <div className="oc-stats">
          {stats.map((s) => (
            <div key={s.label} className="oc-stat">
              <div className="oc-stat__v">{s.value}</div>
              <div className="oc-stat__l">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Experience ───────────────────────────────────── */}
      <section id="experience" className="oc-section">
        <SectionHead index={2} label="Transaction history" title="Experience" sub="Four blocks on the chain, each one rendered from what I built there." />
        <div className="oc-exps">
          <div className="oc-exps__rail" aria-hidden="true">
            <span className="oc-exps__fill" />
          </div>
          {experience.map((r, i) => (
            <ExperienceBlock key={r.company} role={r} index={i} total={experience.length} />
          ))}
        </div>
      </section>

      {/* ── Stack ────────────────────────────────────────── */}
      <section id="stack" className="oc-section">
        <SectionHead index={3} label="Toolkit" title="The stack, and where I used it." />
        <StackSection />
      </section>

      {/* ── Education ────────────────────────────────────── */}
      <section id="education" className="oc-section">
        <SectionHead index={4} label="Foundation" title="Education" />
        <div className="oc-edu">
          {education.map((e) => (
            <div key={e.school} className="oc-block">
              <span className="oc-mono oc-dim">{e.period}</span>
              <h3>{e.degree}</h3>
              <p className="oc-block__school">
                {e.school}, {e.location}
              </p>
              <p className="oc-mono oc-block__detail">{e.detail}</p>
            </div>
          ))}
          <div className="oc-block oc-block--pub">
            <span className="oc-mono oc-signal">Publication · {publication.date}</span>
            <h3>“{publication.title}”</h3>
            <p className="oc-mono oc-block__detail">{publication.venue}</p>
          </div>
        </div>
      </section>

      {/* ── Qixazow ──────────────────────────────────────── */}
      <section id="qixazow" className="oc-section">
        <SectionHead index={5} label="Co-founded venture" title="Genesis of something new." />
        <a href={venture.url} target="_blank" rel="noopener noreferrer" className="oc-venture">
          <div className="oc-venture__inner">
            <div className="oc-venture__top oc-mono">
              <span>Genesis block · {venture.role}</span>
              <span className="oc-chip oc-chip--signal">
                <span className="oc-pulse" /> Live
              </span>
            </div>
            <h3 className="oc-venture__name">{venture.name}</h3>
            <p className="oc-venture__sum">{venture.summary}</p>
            <div className="oc-venture__pillars">
              {venture.pillars.map((p, i) => (
                <div key={p.title}>
                  <span className="oc-mono oc-dim">0{i + 1}</span>
                  <strong>{p.title}</strong>
                  <span>{p.body}</span>
                </div>
              ))}
            </div>
            <span className="oc-venture__cta oc-mono">
              Visit {venture.domain} <ArrowUpRight size={15} />
            </span>
          </div>
        </a>
      </section>

      {/* ── Work ─────────────────────────────────────────── */}
      <section id="work" className="oc-section">
        <SectionHead index={6} label="Deployed contracts" title="Selected work" sub="Things I've shipped, with the code to prove it." />
        <div className="oc-projects">
          {projects.map((p) => (
            <article key={p.slug} className="oc-card" data-scramble-host>
              <div className="oc-card__meta oc-mono">
                <span>Contract</span>
                <Scramble text={short(fakeHash(p.slug))} trigger="hover" duration={500} glyphs="0123456789abcdef" />
              </div>
              <div className="oc-card__img">
                <Image src={p.image} alt={p.title} width={640} height={400} />
                {p.slug === "uniswap" && <CurvePanel />}
              </div>
              <div className="oc-card__body">
                <span className="oc-mono oc-accent">{p.kicker}</span>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <ul className="oc-tags">
                  {p.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="oc-card__links oc-mono">
                {p.demo && (
                  <a href={p.demo} target="_blank" rel="noopener noreferrer">
                    Live demo <ArrowUpRight size={14} />
                  </a>
                )}
                {p.code && (
                  <a href={p.code} target="_blank" rel="noopener noreferrer">
                    Source <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────── */}
      <section id="contact" className="oc-section">
        <SectionHead
          index={7}
          label="New transaction"
          title={
            <>
              Let&apos;s build something <span className="oc-accent">that runs itself.</span>
            </>
          }
        />
        <div className="oc-contact">
          <div className="oc-contact__info">
            <p>
              Hiring for a full-stack or automation role, need a workflow automated, or want to talk Qixazow? Send a transaction. I reply within a
              couple of days.
            </p>
            <a href={socials.email} className="oc-contact__mail">
              {profile.email} <ArrowUpRight size={18} />
            </a>
            <ul className="oc-contact__list oc-mono">
              <li><a href={socials.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a></li>
              <li><a href={socials.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></li>
              <li><a href={socials.x} target="_blank" rel="noopener noreferrer">X ↗</a></li>
              <li><a href={venture.url} target="_blank" rel="noopener noreferrer">Qixazow ↗</a></li>
            </ul>
          </div>
          <form className={`oc-form ${status === "sent" ? "is-sent" : ""}`} onSubmit={onSubmit}>
            <div className="oc-form__to oc-mono">
              <span className="oc-dim">to</span> mayank.bhadrasen
            </div>
            <div className="oc-form__row">
              <label>
                <span className="oc-mono">from.name</span>
                <input name="name" required maxLength={120} placeholder="Your name" autoComplete="name" />
              </label>
              <label>
                <span className="oc-mono">from.email</span>
                <input name="email" type="email" required maxLength={200} placeholder="you@company.com" autoComplete="email" />
              </label>
            </div>
            <label>
              <span className="oc-mono">subject</span>
              <input name="subject" maxLength={200} placeholder="Role, project or automation" />
            </label>
            <label>
              <span className="oc-mono">data</span>
              <textarea name="message" required maxLength={5000} rows={5} placeholder="Tell me what you're building…" />
            </label>
            <input {...honeypotProps} />
            <button type="submit" className="oc-btn oc-btn--primary oc-form__send" disabled={status === "sending"}>
              {status === "sending" ? (
                <>
                  <i className="oc-spinner" /> Pending…
                </>
              ) : (
                <>
                  Sign &amp; send <ArrowUpRight size={16} />
                </>
              )}
            </button>
            {status === "error" && (
              <p className="oc-form__status oc-mono is-error" role="alert">
                ✕ Reverted: {error}. You can also email me directly.
              </p>
            )}
            {status === "sent" && <Receipt />}
          </form>
        </div>
      </section>

      <footer className="oc-foot oc-mono">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span className="oc-dim">block #{height.toLocaleString("en-US")} · built with Next.js, Three.js &amp; GSAP</span>
      </footer>
    </div>
  )
}
