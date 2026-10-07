"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { ArrowUpRight, Download } from "lucide-react"

import { education, experience, nav, profile, projects, publication, skills, socials, stats, venture } from "@/lib/content"
import {
  bindActiveNav,
  bindMagnetic,
  countUp,
  FINE_POINTER,
  gsap,
  MOTION_OK,
  ScrollTrigger,
  splitReveal,
  SplitText,
  useGSAP,
  useLenis,
  WIPE_FROM,
  WIPE_TO,
} from "@/lib/motion"
import { honeypotProps, useContactForm } from "@/lib/contact"
import { RoomScene } from "./room-scene"
import "./blueprint.css"

const COLS = ["A", "B", "C", "D", "E", "F", "G", "H"]
// Nav labels use the sheet each section is drawn on (Qixazow is A-02, education sits under A-04).
const SHEET: Record<string, string> = { about: "A-01", work: "A-03", experience: "A-04", education: "A-04", contact: "A-05" }
const PLOT = "power2.inOut"

function SheetHead({ sheet, title, note }: { sheet: string; title: React.ReactNode; note?: string }) {
  const [code, no] = sheet.split("-")
  return (
    <header className="bp-head">
      <div className="bp-head__bubble">
        <span>{no}</span>
        <span>{code}</span>
      </div>
      <div>
        <h2 className="bp-h2">{title}</h2>
        {note && <p className="bp-mono bp-head__note">{note}</p>}
      </div>
      <i className="bp-head__rule" />
      <i className="bp-head__rule bp-head__rule--2" />
    </header>
  )
}

/** Pediment, entablature and three columns, one column per Qixazow pillar. */
function Temple() {
  return (
    <svg className="bp-temple" viewBox="0 0 420 300" aria-hidden="true">
      <path pathLength={1} d="M20 92 L210 18 L400 92 Z" />
      <path pathLength={1} d="M14 92 H406 V112 H14 Z" />
      <path pathLength={1} className="bp-temple__cols" d="M44 112 V250 M84 112 V250 M190 112 V250 M230 112 V250 M336 112 V250 M376 112 V250" />
      <path pathLength={1} d="M34 112 H94 M180 112 H240 M326 112 H386 M34 250 H94 M180 250 H240 M326 250 H386" />
      <path pathLength={1} d="M8 250 H412 V266 H8 Z M0 266 H420 V282 H0 Z" />
      <text x="64" y="186">01</text>
      <text x="210" y="186">02</text>
      <text x="356" y="186">03</text>
      <text x="210" y="74" className="bp-temple__title">
        QIXAZOW
      </text>
    </svg>
  )
}

export function Blueprint() {
  const root = useRef<HTMLDivElement>(null)
  useLenis()
  const [drawn, setDrawn] = useState(false)
  const { status, error, onSubmit } = useContactForm()
  const levels = experience.length

  useGSAP(
    () => {
      const el = root.current!
      const q = <T extends Element = HTMLElement>(s: string, scope: Element = el) => gsap.utils.toArray<T>(s, scope)

      const links = new Map(q<HTMLAnchorElement>(".bp-nav__links a").map((a) => [a.hash.slice(1), a]))
      bindActiveNav(el.querySelector<HTMLElement>(".bp-nav__ind")!, links, el.querySelector(".bp-hero"))

      const mm = gsap.matchMedia()

      mm.add(MOTION_OK, () => {
        // ── Cover sheet: the plotter draws the frame, then inks the title.
        const title = SplitText.create(".bp-h1", { type: "lines" })
        gsap
          .timeline({ defaults: { ease: PLOT }, delay: 0.1 })
          .from(".bp-nav", { yPercent: -100, autoAlpha: 0, duration: 0.8, ease: "power3.out" })
          .from(".bp-edge--t", { scaleX: 0, duration: 0.7 }, 0.1)
          .from(".bp-edge--r", { scaleY: 0, duration: 0.5 }, ">-0.1")
          .from(".bp-edge--b", { scaleX: 0, duration: 0.7 }, ">-0.1")
          .from(".bp-edge--l", { scaleY: 0, duration: 0.5 }, ">-0.1")
          .from(".bp-coords span", { autoAlpha: 0, y: 6, duration: 0.3, stagger: 0.04, ease: "power2.out" }, 0.4)
          .fromTo("[data-ink]", WIPE_FROM, { ...WIPE_TO, duration: 0.8, stagger: 0.1 }, 0.5)
          .fromTo(title.lines, WIPE_FROM, { ...WIPE_TO, duration: 1, stagger: 0.18 }, 0.6)
          .from("[data-intro]", { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }, 1.2)
          .fromTo(".bp-titleblock tr", WIPE_FROM, { ...WIPE_TO, duration: 0.6, stagger: 0.12 }, 1.6)

        gsap.to(".bp-hero__text", { y: -90, ease: "none", scrollTrigger: { trigger: ".bp-hero", start: "top top", end: "bottom top", scrub: true } })

        // ── Sheet headings: bubble stamps in, double rule plots across, title inks.
        q(".bp-head").forEach((head) => {
          const st = { trigger: head, start: "top 84%" }
          gsap
            .timeline({ scrollTrigger: st, defaults: { ease: PLOT } })
            .from(head.querySelector(".bp-head__bubble"), { scale: 0, rotation: -120, duration: 0.8, ease: "back.out(1.8)" })
            .from(q(".bp-head__rule", head), { scaleX: 0, duration: 1.1, stagger: 0.12 }, 0.1)
            .from(head.querySelector(".bp-head__note"), { autoAlpha: 0, x: -10, duration: 0.6 }, 0.6)
          splitReveal(head.querySelector(".bp-h2")!, "lines", WIPE_FROM, { ...WIPE_TO, duration: 1, ease: PLOT, stagger: 0.12, scrollTrigger: st })
        })

        // ── About: notes ink line by line; dimension lines measure the photo.
        q(".bp-about__text p").forEach((p) =>
          splitReveal(p, "lines", WIPE_FROM, { ...WIPE_TO, duration: 0.9, ease: PLOT, stagger: 0.07, scrollTrigger: { trigger: p, start: "top 85%" } }),
        )
        gsap
          .timeline({ scrollTrigger: { trigger: ".bp-photo", start: "top 78%" }, defaults: { ease: PLOT } })
          .from(".bp-dim--h", { scaleX: 0, duration: 0.9 })
          .from(".bp-dim--v", { scaleY: 0, duration: 0.9 }, 0)
          .add(() => q(".bp-dim span").forEach((s) => countUp(s, { duration: 1.1 })), 0.1)
          .fromTo(".bp-photo__frame", WIPE_FROM, { ...WIPE_TO, duration: 1.2 }, 0.3)
          .from(".bp-photo figcaption", { autoAlpha: 0, duration: 0.6 }, 1.2)
        gsap.fromTo(".bp-photo__frame img", { yPercent: -5, scale: 1.1 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: ".bp-photo", scrub: true } })

        // ── Tables plot row by row; spec values count.
        q(".bp-spec, .bp-schedule").forEach((t) =>
          gsap.fromTo(q("caption, tr", t), WIPE_FROM, { ...WIPE_TO, duration: 0.7, ease: PLOT, stagger: 0.09, scrollTrigger: { trigger: t, start: "top 85%" } }),
        )
        q(".bp-spec__v").forEach((v) => ScrollTrigger.create({ trigger: v, start: "top 88%", once: true, onEnter: () => countUp(v) }))

        // ── Qixazow: the temple draws as you scroll past it.
        gsap
          .timeline({ scrollTrigger: { trigger: ".bp-venture", start: "top 80%", end: "center 45%", scrub: 0.6 } })
          .to(q(".bp-temple path"), { strokeDashoffset: 0, ease: "none", stagger: 0.18 })
          .to(".bp-temple text", { autoAlpha: 1, stagger: 0.05 }, ">-0.1")
        gsap.from(q(".bp-venture__text > *"), { y: 26, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: ".bp-venture__text", start: "top 80%" } })

        // ── Projects: crosshairs register, the drawing plots in, specs follow.
        q(".bp-project").forEach((proj) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: proj, start: "top 75%" }, defaults: { ease: PLOT } })
          tl.from(q(".bp-cross", proj), {
            autoAlpha: 0,
            x: (i) => (i % 2 ? 40 : -40),
            y: (i) => (i < 2 ? -40 : 40),
            rotation: 90,
            duration: 0.8,
            ease: "power3.out",
          })
            .fromTo(proj.querySelector(".bp-project__img"), WIPE_FROM, { ...WIPE_TO, duration: 1.1 }, 0.2)
            .from(proj.querySelector(".bp-project__detail"), { scale: 0, duration: 0.5, ease: "back.out(2.5)" }, 0.9)
            .from(q(".bp-project__spec > *, .bp-project__spec tr", proj), { autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.07, ease: "power3.out" }, 0.4)
          gsap.fromTo(proj.querySelector(".bp-project__img img"), { yPercent: -6, scale: 1.12 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: proj, scrub: true } })
        })

        // ── Building: floors are poured slab by slab; the meter reads elevation as you descend.
        gsap.from(".bp-roof path", { strokeDashoffset: 1, duration: 1.2, ease: PLOT, scrollTrigger: { trigger: ".bp-roof", start: "top 85%" } })
        q(".bp-floor").forEach((f) =>
          gsap
            .timeline({ scrollTrigger: { trigger: f, start: "top 82%" }, defaults: { ease: PLOT } })
            .from(f.querySelector(".bp-floor__slab"), { scaleX: 0, duration: 0.9 })
            .from(f.querySelector(".bp-floor__lvl"), { autoAlpha: 0, x: 20, duration: 0.6, ease: "power3.out" }, 0.2)
            .from(q(".bp-floor__body > *, .bp-floor li", f), { autoAlpha: 0, y: 14, duration: 0.6, stagger: 0.05, ease: "power3.out" }, 0.3),
        )
        const meterText = el.querySelector<HTMLElement>(".bp-meter__value")!
        const top = levels * 3
        gsap.fromTo(
          ".bp-meter__fill",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ".bp-floors",
              start: "top 55%",
              end: "bottom 55%",
              scrub: true,
              onUpdate: (self) => {
                const h = top * (1 - self.progress)
                meterText.textContent = h < 0.05 ? "±0.00 m" : `+${h.toFixed(2)} m`
              },
            },
          },
        )
        gsap
          .timeline({ scrollTrigger: { trigger: ".bp-grade", start: "top 85%" } })
          .from(".bp-grade", { scaleX: 0, duration: 1, ease: PLOT })
          .from(".bp-footing", { y: -40, autoAlpha: 0, duration: 0.9, ease: "bounce.out", stagger: 0.12 }, 0.4)

        // ── Contact.
        gsap.from(q(".bp-contact > div > *, .bp-form > *"), {
          y: 22,
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: { trigger: ".bp-contact", start: "top 78%" },
        })
      })

      mm.add(`${MOTION_OK} and ${FINE_POINTER}`, () => {
        // Drafting crosshair with a live coordinate readout, over the cover sheet only.
        const sheet = el.querySelector<HTMLElement>(".bp-sheet")!
        const cross = el.querySelector<HTMLElement>(".bp-crosshair")!
        const readout = cross.querySelector<HTMLElement>(".bp-crosshair__read")!
        const xTo = gsap.quickTo(cross, "--cx", { duration: 0.25, ease: "power3" })
        const yTo = gsap.quickTo(cross, "--cy", { duration: 0.25, ease: "power3" })
        const move = (e: PointerEvent) => {
          const r = sheet.getBoundingClientRect()
          const x = e.clientX - r.left
          const y = e.clientY - r.top
          xTo(x)
          yTo(y)
          readout.textContent = `X ${(x * 0.75).toFixed(1).padStart(6, "0")}  Y ${(y * 0.75).toFixed(1).padStart(6, "0")}`
          cross.classList.add("is-on")
        }
        const leave = () => cross.classList.remove("is-on")
        sheet.addEventListener("pointermove", move)
        sheet.addEventListener("pointerleave", leave)
        const offMag = bindMagnetic(el, ".bp-btn", 0.2)
        return () => {
          sheet.removeEventListener("pointermove", move)
          sheet.removeEventListener("pointerleave", leave)
          offMag()
        }
      })

      el.classList.add("is-ready")
    },
    { scope: root },
  )

  return (
    <div className="bp" ref={root}>
      <header className="bp-nav">
        <a href="#top" className="bp-brand bp-mono">
          <span className="bp-brand__mark">MB</span> M. Bhadrasen <span className="bp-faint">/ A-series</span>
        </a>
        <nav className="bp-nav__links bp-mono">
          <span className="bp-nav__ind" aria-hidden="true" />
          {nav.map((n) => (
            <a key={n.id} href={`#${n.id}`}>
              <span className="bp-faint">{SHEET[n.id]}</span> {n.label}
            </a>
          ))}
        </nav>
        <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="bp-btn bp-btn--sm">
          <Download size={14} /> Resume
        </a>
      </header>

      {/* ── Cover sheet ───────────────────────────────────── */}
      <section id="top" className={`bp-hero ${drawn ? "is-drawn" : ""}`}>
        <div className="bp-sheet">
          <i className="bp-edge bp-edge--t" />
          <i className="bp-edge bp-edge--r" />
          <i className="bp-edge bp-edge--b" />
          <i className="bp-edge bp-edge--l" />
          <div className="bp-coords bp-coords--top bp-mono">
            {COLS.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
          <div className="bp-coords bp-coords--side bp-mono">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
          <RoomScene onDrawn={() => setDrawn(true)} />
          <div className="bp-crosshair" aria-hidden="true">
            <i className="bp-crosshair__h" />
            <i className="bp-crosshair__v" />
            <span className="bp-crosshair__read bp-mono" />
          </div>

          <div className="bp-hero__text">
            <p className="bp-mono bp-faint" data-ink>
              Drawing no. MB-2026 · Sheet A-00 · Cover
            </p>
            <h1 className="bp-h1">
              Mayank
              <br />
              Bhadrasen
            </h1>
            <p className="bp-hero__role" data-intro>
              Full-stack developer &amp; <em>AI automation</em> engineer.
            </p>
            <p className="bp-hero__tag" data-intro>
              I draft the architecture, build the product, and automate the work behind it.
            </p>
            <div className="bp-hero__ctas" data-intro>
              <a href="#work" className="bp-btn bp-btn--solid">
                See the drawings <ArrowUpRight size={15} />
              </a>
              <a href="#contact" className="bp-btn">
                Request a proposal
              </a>
            </div>
          </div>

          <table className="bp-titleblock bp-mono">
            <tbody>
              <tr>
                <th>Project</th>
                <td colSpan={3}>Portfolio — {profile.role}</td>
              </tr>
              <tr>
                <th>Drawn</th>
                <td>M. Bhadrasen</td>
                <th>Scale</th>
                <td>1 : 1</td>
              </tr>
              <tr>
                <th>Site</th>
                <td>{profile.location}</td>
                <th>Rev</th>
                <td>2026.10</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── A-01 About ────────────────────────────────────── */}
      <section id="about" className="bp-section">
        <SheetHead sheet="A-01" title={<>Elevation: <em>about</em></>} note="General notes on the engineer" />
        <div className="bp-about">
          <div className="bp-about__text">
            {profile.summary.map((p, i) => (
              <p key={i}>
                <span className="bp-mono bp-noteno">{i + 1}.</span> {p}
              </p>
            ))}
          </div>
          <figure className="bp-photo">
            <div className="bp-dim bp-dim--h bp-mono">
              <span>520</span>
            </div>
            <div className="bp-dim bp-dim--v bp-mono">
              <span>520</span>
            </div>
            <div className="bp-photo__frame">
              <div className="bp-photo__img">
                <Image src={profile.photo} alt={profile.name} width={520} height={520} priority />
              </div>
            </div>
            <figcaption className="bp-mono">Fig. 1 — The engineer, on site.</figcaption>
          </figure>
        </div>
        <table className="bp-spec">
          <caption className="bp-mono">Specifications</caption>
          <tbody>
            {stats.map((s, i) => (
              <tr key={s.label}>
                <td className="bp-mono bp-faint">S-{i + 1}</td>
                <td className="bp-spec__v">{s.value}</td>
                <td>{s.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ── A-02 Qixazow ──────────────────────────────────── */}
      <section id="qixazow" className="bp-section">
        <SheetHead sheet="A-02" title={<>Structure: <em>a co-founded venture</em></>} note="Three pillars, one roof" />
        <div className="bp-venture">
          <div className="bp-venture__draw">
            <Temple />
          </div>
          <div className="bp-venture__text">
            <p className="bp-mono bp-amber">
              {venture.role} · {venture.period}
            </p>
            <h3 className="bp-venture__name">{venture.name}</h3>
            <p className="bp-venture__sum">{venture.summary}</p>
            <ol className="bp-venture__pillars">
              {venture.pillars.map((p, i) => (
                <li key={p.title}>
                  <span className="bp-mono">0{i + 1}</span>
                  <strong>{p.title}</strong>
                  <span>{p.body}</span>
                </li>
              ))}
            </ol>
            <a href={venture.url} target="_blank" rel="noopener noreferrer" className="bp-btn bp-btn--amber">
              Visit {venture.domain} <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* ── A-03 Work ─────────────────────────────────────── */}
      <section id="work" className="bp-section">
        <SheetHead sheet="A-03" title={<>Details: <em>selected work</em></>} note="Not to scale — but built to spec" />
        <div className="bp-projects">
          {projects.map((p, i) => (
            <article key={p.slug} className={`bp-project ${i % 2 ? "is-flip" : ""}`}>
              <div className="bp-project__view">
                <i className="bp-cross bp-cross--tl" />
                <i className="bp-cross bp-cross--tr" />
                <i className="bp-cross bp-cross--bl" />
                <i className="bp-cross bp-cross--br" />
                <a className="bp-project__img" href={p.demo ?? p.code} target="_blank" rel="noopener noreferrer" aria-label={`Open ${p.title}`}>
                  <Image src={p.image} alt={p.title} width={900} height={560} />
                </a>
                <span className="bp-project__detail bp-mono">
                  <b>{i + 1}</b>
                  <span>A-03</span>
                </span>
              </div>
              <div className="bp-project__spec">
                <p className="bp-mono bp-amber">
                  Detail {i + 1} · {p.kicker}
                </p>
                <h3>{p.title}</h3>
                <p className="bp-project__desc">{p.description}</p>
                <table className="bp-mono">
                  <tbody>
                    <tr>
                      <th>Materials</th>
                      <td>{p.stack.join(" · ")}</td>
                    </tr>
                    <tr>
                      <th>Refs</th>
                      <td className="bp-project__links">
                        {p.demo && (
                          <a href={p.demo} target="_blank" rel="noopener noreferrer">
                            Live ↗
                          </a>
                        )}
                        {p.code && (
                          <a href={p.code} target="_blank" rel="noopener noreferrer">
                            Source ↗
                          </a>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── A-04 Experience + education as one building ──── */}
      <section id="experience" className="bp-section">
        <SheetHead sheet="A-04" title={<>Section: <em>career elevation</em></>} note="Built floor by floor, on solid foundations" />
        <div className="bp-building">
          <div className="bp-roof">
            <svg viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 60 L500 4 L1000 60" pathLength={1} />
            </svg>
          </div>
          <div className="bp-floors">
            <div className="bp-meter" aria-hidden="true">
              <span className="bp-meter__fill" />
              <span className="bp-meter__value bp-mono">+{(levels * 3).toFixed(2)} m</span>
            </div>
            {experience.map((r, i) => {
              const level = levels - i
              return (
                <div key={r.company} className={`bp-floor ${r.current ? "is-wip" : ""}`}>
                  <i className="bp-floor__slab" />
                  <div className="bp-floor__lvl bp-mono">
                    <span className="bp-floor__mark">▽</span>
                    <span>Level {String(level).padStart(2, "0")}</span>
                    <span className="bp-faint">+{(level * 3).toFixed(1)} m</span>
                  </div>
                  <div className="bp-floor__body">
                    <div className="bp-floor__top">
                      <h3>{r.title}</h3>
                      <span className="bp-mono bp-floor__period">{r.current ? "● In progress" : r.period}</span>
                    </div>
                    <p className="bp-floor__co">
                      {r.company}{" "}
                      <span className="bp-faint">
                        · {r.location}
                        {r.note ? ` · ${r.note}` : ""}
                      </span>
                    </p>
                    <ul>
                      {r.bullets.map((b) => (
                        <li key={b.slice(0, 24)}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="bp-grade bp-mono">
            <span>±0.00 Grade</span>
          </div>
          <div id="education" className="bp-foundations">
            {education.map((e, i) => (
              <div key={e.school} className="bp-footing">
                <span className="bp-mono bp-faint">
                  Footing F{i + 1} · {e.period}
                </span>
                <h4>{e.degree}</h4>
                <p>
                  {e.school}, {e.location}
                </p>
                <p className="bp-mono bp-faint">{e.detail}</p>
              </div>
            ))}
            <div className="bp-footing bp-footing--pub">
              <span className="bp-mono bp-amber">Survey · {publication.date}</span>
              <h4>“{publication.title}”</h4>
              <p className="bp-mono bp-faint">{publication.venue}</p>
            </div>
          </div>
        </div>

        <table className="bp-schedule">
          <caption className="bp-mono">Materials schedule</caption>
          <thead className="bp-mono">
            <tr>
              <th>Mark</th>
              <th>Group</th>
              <th>Specification</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((g, i) => (
              <tr key={g.group}>
                <td className="bp-mono bp-amber">M-{i + 1}</td>
                <td>{g.group}</td>
                <td>{g.items.map((s) => s.name).join(" · ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ── A-05 Contact ──────────────────────────────────── */}
      <section id="contact" className="bp-section">
        <SheetHead sheet="A-05" title={<>Request for <em>proposal</em></>} note="Roles, builds and automations welcome" />
        <div className="bp-contact">
          <div>
            <p className="bp-contact__lead">Tell me what needs designing, building or automating. I usually reply within a couple of days.</p>
            <a href={socials.email} className="bp-contact__mail">
              {profile.email}
            </a>
            <ul className="bp-contact__links bp-mono">
              <li><a href={socials.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a></li>
              <li><a href={socials.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></li>
              <li><a href={socials.x} target="_blank" rel="noopener noreferrer">X ↗</a></li>
              <li><a href={venture.url} target="_blank" rel="noopener noreferrer">Qixazow ↗</a></li>
            </ul>
          </div>
          <form className="bp-form" onSubmit={onSubmit}>
            <div className="bp-form__row">
              <label>
                <span className="bp-mono">01 · Name</span>
                <input name="name" required maxLength={120} autoComplete="name" placeholder="Jane Doe" />
              </label>
              <label>
                <span className="bp-mono">02 · Email</span>
                <input name="email" type="email" required maxLength={200} autoComplete="email" placeholder="jane@company.com" />
              </label>
            </div>
            <label>
              <span className="bp-mono">03 · Subject</span>
              <input name="subject" maxLength={200} placeholder="Role · project · automation" />
            </label>
            <label>
              <span className="bp-mono">04 · Brief</span>
              <textarea name="message" required maxLength={5000} rows={4} placeholder="What are we building?" />
            </label>
            <input {...honeypotProps} />
            <div className="bp-form__foot">
              <button type="submit" className="bp-btn bp-btn--solid" disabled={status === "sending"}>
                {status === "sending" ? "Issuing…" : "Issue for review"} <ArrowUpRight size={15} />
              </button>
              <p className={`bp-mono bp-form__status is-${status}`} role="status">
                {status === "sent" && "Received — stamped and filed. I'll be in touch."}
                {status === "error" && `✕ ${error}. Email me directly instead.`}
              </p>
            </div>
            {status === "sent" && (
              <div className="bp-stamp bp-mono" aria-hidden="true">
                <span>Approved</span>
                <small>M.B. · {new Date().toLocaleDateString("en-US")}</small>
              </div>
            )}
          </form>
        </div>
      </section>

      <footer className="bp-foot bp-mono">
        <table>
          <tbody>
            <tr>
              <th>Drawn</th>
              <td>{profile.name}</td>
              <th>Checked</th>
              <td>✓</td>
              <th>Date</th>
              <td>{new Date().getFullYear()}</td>
              <th>Sheet</th>
              <td>A-05 of A-05</td>
            </tr>
          </tbody>
        </table>
      </footer>
    </div>
  )
}
