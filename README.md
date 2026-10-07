# Mayank Bhadrasen — Portfolio

Personal site for [mayankbhadrasen.com](https://mayankbhadrasen.com): full-stack developer & AI automation engineer, co-founder of [Qixazow](https://qixazow.com).

Two candidate designs are live side by side while one is chosen; switch with the tab bar or keys `1` / `2`:

| Design | URL | Idea |
| --- | --- | --- |
| On-Chain | `/?design=onchain` | A Three.js chain of blocks, one per section; experience as a block-explorer feed. |
| Blueprint | `/?design=blueprint` | A self-drawing wireframe room on a drafting sheet; career drawn as a building elevation. |

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Three.js · GSAP (ScrollTrigger, SplitText) · Lenis · plain scoped CSS.

## Develop

```bash
yarn          # install
yarn dev      # http://localhost:3000
yarn build    # production build (also type-checks)
```

## Where things live

```
app/                     layout, fonts, global reset, page that hosts the designs
components/designs/
  onchain/               On-Chain design + its Three.js scene + scoped CSS
  blueprint/             Blueprint design + its Three.js scene + scoped CSS
  design-switcher.tsx    the floating tab bar
lib/
  content.ts             ALL portfolio copy — edit this to update both designs
  motion.tsx             GSAP/Lenis helpers shared by the designs
  contact.ts             contact form submission
scripts/contact-mailer.gs  Google Apps Script that emails form submissions
public/                  images and GradResume_Mayank.pdf
```

## Contact form

The form posts to a Google Apps Script web app that emails each submission to the site owner and (optionally) logs it to a Sheet. Setup steps are at the top of `scripts/contact-mailer.gs`. Point the site at the deployment with:

```bash
NEXT_PUBLIC_CONTACT_ENDPOINT=https://script.google.com/macros/s/…/exec
```

Motion respects `prefers-reduced-motion`; pointer effects only run on mouse/trackpad devices.
