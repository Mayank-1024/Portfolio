# Mayank Bhadrasen — Portfolio

Personal site for [mayankbhadrasen.com](https://mayankbhadrasen.com): full-stack developer & AI automation engineer, co-founder of [Qixazow](https://qixazow.com).

A static site: plain HTML, CSS and JavaScript with no build step. A Three.js chain of blocks in the hero (click a block to jump to its section), experience and education as blocks that each draw a wireframe scene of what was built there, an interactive Stack bento showing where each tool was used, and an obsidian + champagne-gold palette.

## Run locally

```bash
python3 -m http.server 3000   # then open http://localhost:3000
```

Any static server works. Open the site through a server rather than as a `file://` page, because `js/fence.js` is an ES module.

## Structure

```
index.html              the portfolio (all sections and content)
privacy.html            privacy policy
css/style.css           all styles: fonts, reset, portfolio (.oc-*), privacy page (.pp-*)
js/
  config.js             contact form endpoint
  main.js               smooth scroll, GSAP choreography, nav, scrambles, counters, contact form
  fence.js              Three.js: hero block chain + self-drawing wire scenes (ES module)
  work.js               Experience status + Stack bento interactions
  vendor/               self-hosted GSAP (ScrollTrigger, SplitText), Lenis, Three.js
assets/
  fonts/                Space Grotesk + JetBrains Mono (woff2)
  logos/                skill logos (SVG, tinted via CSS mask)
  images/               profile photo and project screenshots
  GradResume_Mayank.pdf
scripts/contact-mailer.gs   Google Apps Script that emails form submissions
favicon.svg  robots.txt  sitemap.xml
```

## Editing content

All copy lives directly in `index.html`. Each skill token carries its "used at" links in `data-used`. Each wire scene is picked by its `data-scene` name, which maps to a drawing defined in `js/fence.js`.

Projects are cards in the `.oc-projects` rail, newest first. Workflow cards use a `data-flow` thumbnail: its nodes, icons (`assets/logos/`) and connections are listed in `FLOWS` in `js/work.js`, and the draw-and-run animation is generated from that list.

After changing CSS or JS, bump the `?v=` query on its `<link>` / `<script>` tags so browsers fetch the new file.

## Contact form

The form posts to a Google Apps Script web app that emails each submission and logs it to a Sheet. Setup steps are at the top of `scripts/contact-mailer.gs`; paste the deployment's `/exec` URL into `js/config.js`.

## Libraries

All self-hosted in `js/vendor/`, so visitors' browsers never contact a CDN: GSAP 3.15 (ScrollTrigger, SplitText), Lenis 1.3, and Three.js 0.186 (bundled with only the classes the scenes use). Motion respects `prefers-reduced-motion`; pointer effects only run on mouse/trackpad devices.
