# Mayank Bhadrasen — Portfolio

Personal site for [mayankbhadrasen.com](https://mayankbhadrasen.com): full-stack developer & AI automation engineer, co-founder of [Qixazow](https://qixazow.com).

The "On-Chain" design: a Three.js chain of blocks in the hero (one block per section, click to jump), experience as stacked blocks that each draw a wireframe scene of what was built there, an interactive Stack bento showing where each tool was used, and an obsidian + champagne-gold palette.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Three.js · GSAP (ScrollTrigger, SplitText) · Lenis · Simple Icons · plain scoped CSS.

## Develop

```bash
yarn          # install
yarn dev      # http://localhost:3000
yarn build    # production build (also type-checks)
```

## Where things live

```
app/                       layout, fonts, global reset, home page
components/onchain/
  onchain.tsx              the page: sections, GSAP choreography
  chain-scene.tsx          hero 3D block chain
  wire-scene.tsx           engine for the self-drawing experience scenes
  experience-scenes.ts     one line drawing per role
  stack-section.tsx        interactive skills bento
  onchain.css              all styles; palette tokens at the top
lib/
  content.ts               ALL portfolio copy — edit this to update the site
  motion.tsx               GSAP/Lenis helpers
  ink.ts                   line-drawing geometry helper
  contact.ts               contact form submission
scripts/contact-mailer.gs  Google Apps Script that emails form submissions
public/                    images and GradResume_Mayank.pdf
```

## Contact form

The form posts to a Google Apps Script web app that emails each submission to the site owner and logs it to a Sheet. Setup steps are at the top of `scripts/contact-mailer.gs`. Point the site at the deployment with:

```bash
NEXT_PUBLIC_CONTACT_ENDPOINT=https://script.google.com/macros/s/…/exec
```

Motion respects `prefers-reduced-motion`; pointer effects only run on mouse/trackpad devices.
