import type { Metadata } from "next"
import Link from "next/link"
import { profile } from "@/lib/content"
import "./privacy.css"

export const metadata: Metadata = {
  title: "Privacy policy | Mayank Bhadrasen",
  description: "What mayankbhadrasen.com collects, which third-party services are involved, and the choices you have.",
}

const UPDATED = "October 7, 2026"
const EMAIL = profile.email

const SERVICES = [
  {
    name: "Google Apps Script, Gmail and Google Sheets",
    by: "Google LLC",
    what: "Receives contact-form submissions, emails them to me and keeps a copy in a private spreadsheet.",
    data: "Name, email, subject, message, time sent.",
    link: "https://policies.google.com/privacy",
  },
  {
    name: "Website hosting",
    by: "The provider serving mayankbhadrasen.com",
    what: "Delivers the site's pages and files to your browser.",
    data: "Standard request logs: IP address, browser and device type, pages requested, time.",
    link: null,
  },
  {
    name: "Google Fonts (Space Grotesk, JetBrains Mono)",
    by: "Google LLC",
    what: "Fonts are downloaded once when the site is built and then served from this site.",
    data: "None. Your browser never contacts Google Fonts.",
    link: null,
  },
  {
    name: "Open-source libraries: Next.js, React, Three.js, GSAP, Lenis, Simple Icons, Lucide",
    by: "Their open-source maintainers",
    what: "Run the 3D scenes, animations, smooth scrolling and icons, bundled into the site.",
    data: "None. They run entirely in your browser and send nothing anywhere.",
    link: null,
  },
]

const LINKS = ["GitHub", "LinkedIn", "X (Twitter)", "Qixazow", "the live Uniswap V2 demo (hosted on Vercel)", "your email app, for mailto: links"]

export default function PrivacyPage() {
  return (
    <div className="pp">
      <header className="pp-nav">
        <Link href="/" className="pp-brand">
          <span className="pp-brand__mark">MB</span>
          <span>
            mayank<span className="pp-dim">.bhadrasen</span>
          </span>
        </Link>
        <Link href="/" className="pp-back">
          ← Back to portfolio
        </Link>
      </header>

      <main className="pp-main">
        <p className="pp-mono pp-accent">Last updated {UPDATED}</p>
        <h1>Privacy policy</h1>
        <p className="pp-lead">
          This is my personal portfolio. It collects only what you choose to send me through the contact form. This page explains exactly what
          that is, which services are involved, how long I keep it and what you can ask me to do with it.
        </p>

        <div className="pp-glance">
          <div>
            <strong>Collected</strong>
            <span>Only what you type into the contact form.</span>
          </div>
          <div>
            <strong>Not used</strong>
            <span>Cookies, analytics, ads, tracking pixels or browser storage.</span>
          </div>
          <div>
            <strong>Shared</strong>
            <span>Never sold or shared. Google stores form messages for me.</span>
          </div>
        </div>

        <section>
          <h2>Who is responsible</h2>
          <p>
            mayankbhadrasen.com is run by {profile.name}, an individual based in {profile.location}. I&apos;m responsible for the information described
            here (the &ldquo;controller&rdquo;, in data-protection terms). Contact me about anything on this page at{" "}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
          </p>
        </section>

        <section>
          <h2>What I collect</h2>
          <p>When you send the contact form, I receive:</p>
          <ul>
            <li>your name and email address (required),</li>
            <li>a subject (optional) and your message (required),</li>
            <li>the date and time it was sent.</li>
          </ul>
          <p>
            The form also contains a hidden field that people never see. It only exists to catch automated spam bots, which tend to fill it in; any
            submission with that field filled is discarded.
          </p>
          <p>
            If you email me directly instead of using the form, I receive whatever you include in that email, handled the same way as form
            messages.
          </p>
        </section>

        <section>
          <h2>What I don&apos;t collect</h2>
          <ul>
            <li>No cookies of any kind, so there is no cookie banner.</li>
            <li>No analytics or visitor tracking (no Google Analytics, no heatmaps, no session recording).</li>
            <li>No advertising, retargeting or social-media tracking pixels.</li>
            <li>Nothing saved in your browser (no localStorage, sessionStorage or IndexedDB).</li>
            <li>No accounts, sign-ins or payment details.</li>
          </ul>
          <p>
            The site reads two browser settings to adapt how it behaves, and keeps neither: whether you prefer reduced motion (which turns off
            animations) and whether you use a mouse or touch (which turns pointer effects on or off). The 3D scenes are drawn on your own device.
          </p>
        </section>

        <section>
          <h2>How I use it</h2>
          <p>
            Only to read your message and reply to you. I don&apos;t add you to mailing lists, use your details for marketing, sell or rent them, or
            share them with anyone else.
          </p>
          <p>
            For visitors in the UK and EU: I process form messages because you chose to send them (consent) and so I can answer your enquiry
            (legitimate interests). You can withdraw consent at any time by asking me to delete your message.
          </p>
        </section>

        <section>
          <h2>Third-party services</h2>
          <p>These are every outside service involved in running this site, and what each one sees.</p>
          <div className="pp-services">
            {SERVICES.map((s) => (
              <div key={s.name} className="pp-service">
                <h3>{s.name}</h3>
                <p className="pp-mono pp-dim">{s.by}</p>
                <dl>
                  <dt>Role</dt>
                  <dd>{s.what}</dd>
                  <dt>Data</dt>
                  <dd>{s.data}</dd>
                </dl>
                {s.link && (
                  <a href={s.link} target="_blank" rel="noopener noreferrer" className="pp-mono">
                    Their privacy policy ↗
                  </a>
                )}
              </div>
            ))}
          </div>
          <p>
            Google stores form messages on my behalf and may process them on servers outside your country, including in the United States, under
            its own safeguards. My hosting provider may keep its request logs for a limited time for security and reliability; I don&apos;t use them
            to identify visitors.
          </p>
        </section>

        <section>
          <h2>How long I keep it</h2>
          <p>
            I keep messages for as long as they are useful for our conversation, and delete them once they no longer are. You can ask me to delete
            yours at any time and I will, from both my inbox and the spreadsheet.
          </p>
        </section>

        <section>
          <h2>Security</h2>
          <p>
            The site is served over HTTPS, and form messages travel to Google over an encrypted connection. They are stored in my own Google account,
            protected by Google&apos;s security and my sign-in. No system is perfectly secure, so please don&apos;t send sensitive personal information
            (such as ID or financial details) through the form.
          </p>
        </section>

        <section>
          <h2>Your rights</h2>
          <p>Wherever you live, you can ask me to:</p>
          <ul>
            <li>tell you what information I hold about you and give you a copy,</li>
            <li>correct it,</li>
            <li>delete it,</li>
            <li>stop using it.</li>
          </ul>
          <p>
            Email <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and I&apos;ll respond within 30 days. Depending on where you live (for example under the
            GDPR, UK GDPR or California privacy law), you may also have the right to complain to your local data-protection authority. I don&apos;t
            sell or share personal information as defined by California law, and because the site does no tracking, there is nothing for
            &ldquo;Do Not Track&rdquo; or Global Privacy Control signals to switch off.
          </p>
        </section>

        <section>
          <h2>Links to other sites</h2>
          <p>
            The site links to {LINKS.slice(0, -1).join(", ")} and {LINKS.at(-1)}. Nothing is sent to those sites until you click a link. Once you
            leave this site, their own privacy practices apply.
          </p>
        </section>

        <section>
          <h2>Children</h2>
          <p>This site isn&apos;t aimed at children, and I don&apos;t knowingly collect information from anyone under 13.</p>
        </section>

        <section>
          <h2>Changes</h2>
          <p>If how the site handles information changes, I&apos;ll update this page and the date at the top.</p>
        </section>
      </main>

      <footer className="pp-foot pp-mono">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <Link href="/">mayankbhadrasen.com</Link>
      </footer>
    </div>
  )
}
