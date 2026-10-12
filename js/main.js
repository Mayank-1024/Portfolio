/**
 * mayankbhadrasen.com · main.js
 * Smooth scroll, GSAP choreography, nav, text scrambles, counters and the contact form.
 * Needs gsap, ScrollTrigger, SplitText and Lenis (js/vendor) and CONTACT_ENDPOINT (js/config.js).
 * Safe on every page: each block only runs when its markup exists.
 */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var MOTION_OK = '(prefers-reduced-motion: no-preference)';
  var FINE_POINTER = '(hover: hover) and (pointer: fine)';
  var reduced = function () { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; };

  gsap.registerPlugin(ScrollTrigger, SplitText);

  /* ═══════════════════════════════════════════
     HELPERS
     ═══════════════════════════════════════════ */

  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+=<>/\\';
  var HEX = '0123456789abcdef';

  /** Animates `el` from random glyphs to `text`. Returns a cancel function. */
  function scramble(el, text, duration, glyphs) {
    duration = duration || 900;
    glyphs = glyphs || GLYPHS;
    if (reduced()) { el.textContent = text; return function () {}; }
    var start = performance.now();
    var id = 0;
    var tick = function (now) {
      var p = Math.min(1, (now - start) / duration);
      var settled = Math.floor(p * text.length);
      var out = '';
      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        out += i < settled || ch === ' ' ? ch : glyphs[(Math.random() * glyphs.length) | 0];
      }
      el.textContent = out;
      if (p < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return function () { cancelAnimationFrame(id); };
  }

  /** Deterministic pseudo hash (matches the hashes baked into the markup). */
  function fakeHash(seed, length) {
    length = length || 40;
    var h = 2166136261;
    var out = '';
    for (var i = 0; out.length < length; i++) {
      h ^= seed.charCodeAt(i % seed.length) + i;
      h = Math.imul(h, 16777619) >>> 0;
      out += (h % 16).toString(16);
    }
    return '0x' + out;
  }
  var short = function (h) { return h.slice(0, 8) + '…' + h.slice(-4); };

  /** Splits `el` into masked lines/words/chars and animates them in; re-splits on resize. */
  function splitReveal(el, by, from) {
    return SplitText.create(el, {
      type: by === 'chars' ? 'words,chars' : by === 'words' ? 'lines,words' : 'lines',
      mask: by,
      autoSplit: true,
      onSplit: function (self) { return gsap.from(self[by], from); },
    });
  }

  /** Counts every number inside `el` up from zero, keeping the surrounding text ("30-40%"). */
  function countUp(el, vars) {
    var parts = (el.textContent || '').split(/(\d+(?:\.\d+)?)/);
    var targets = parts.map(function (p, i) {
      return i % 2 ? { n: parseFloat(p), dp: (p.split('.')[1] || '').length } : null;
    });
    var state = { p: 0 };
    var render = function () {
      el.textContent = parts.map(function (p, i) {
        return targets[i] ? (targets[i].n * state.p).toFixed(targets[i].dp) : p;
      }).join('');
    };
    render();
    return gsap.to(state, Object.assign({ p: 1, duration: 1.6, ease: 'power3.out', onUpdate: render }, vars || {}));
  }

  /** Elements matching `selector` drift toward the pointer and spring back. Returns a cleanup. */
  function bindMagnetic(root, selector, strength) {
    strength = strength || 0.3;
    var offs = $$(selector, root).map(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.45)' });
      var yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.45)' });
      var move = function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };
      var leave = function () { xTo(0); yTo(0); };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      return function () { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
    });
    return function () { offs.forEach(function (off) { off(); }); };
  }

  /** 3D tilt toward the pointer; also exposes --mx/--my (0-100%) for a glare highlight. */
  function bindTilt(root, selector, max) {
    max = max || 7;
    var offs = $$(selector, root).map(function (el) {
      gsap.set(el, { transformPerspective: 900 });
      var rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3' });
      var ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3' });
      var move = function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        ry((px - 0.5) * max * 2);
        rx((0.5 - py) * max * 2);
        el.style.setProperty('--mx', px * 100 + '%');
        el.style.setProperty('--my', py * 100 + '%');
      };
      var leave = function () { rx(0); ry(0); };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      return function () { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
    });
    return function () { offs.forEach(function (off) { off(); }); };
  }

  /** Writes the pointer position inside `el` to --sx/--sy for a spotlight gradient. */
  function bindSpotlight(el) {
    var move = function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--sx', e.clientX - r.left + 'px');
      el.style.setProperty('--sy', e.clientY - r.top + 'px');
    };
    el.addEventListener('pointermove', move);
    return function () { el.removeEventListener('pointermove', move); };
  }

  /** Moves the nav indicator under whichever section is in view; nothing is active over the hero. */
  function bindActiveNav(indicator, links, hero) {
    var xTo = gsap.quickTo(indicator, 'x', { duration: 0.5, ease: 'power3' });
    var wTo = gsap.quickTo(indicator, 'width', { duration: 0.5, ease: 'power3' });
    var set = function (id) {
      links.forEach(function (a, key) { a.classList.toggle('is-active', key === id); });
      var a = id ? links.get(id) : null;
      gsap.to(indicator, { autoAlpha: a ? 1 : 0, duration: 0.3 });
      if (a) { xTo(a.offsetLeft); wTo(a.offsetWidth); }
    };
    links.forEach(function (_, id) {
      var section = document.getElementById(id);
      if (!section) return;
      ScrollTrigger.create({
        trigger: section, start: 'top 45%', end: 'bottom 45%',
        onToggle: function (self) { if (self.isActive) set(id); },
      });
    });
    if (hero) ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom 45%', onToggle: function (self) { if (self.isActive) set(null); } });
    set(null);
  }

  /* ═══════════════════════════════════════════
     SMOOTH SCROLL
     Lenis driven by GSAP's ticker, so ScrollTrigger and Lenis never disagree.
     ═══════════════════════════════════════════ */

  var page = $('.oc');
  var lenis = null;

  if (page) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    if (!reduced()) {
      lenis = new Lenis({ lerp: 0.1, anchors: { offset: -72 } });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    }
  }

  /** Scrolls to a section id through Lenis when it is running, natively otherwise. */
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -72, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' });
  }

  // Shared with fence.js and work.js.
  window.Portfolio = {
    MOTION_OK: MOTION_OK, FINE_POINTER: FINE_POINTER, reduced: reduced,
    scrollToId: scrollToId, bindSpotlight: bindSpotlight, scramble: scramble,
  };

  /* ═══════════════════════════════════════════
     SMALL LIVE BITS
     ═══════════════════════════════════════════ */

  // Old links from the design-comparison phase carried ?design=…; drop it so the address stays clean.
  (function () {
    var url = new URL(window.location.href);
    if (!url.searchParams.has('design')) return;
    url.searchParams.delete('design');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  })();

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Block height (just for fun): ticks up every 2.4 s, in the nav and the footer.
  (function () {
    var els = $$('[data-block-height]');
    if (!els.length) return;
    var height = 18204331;
    setInterval(function () {
      height += 1;
      var text = height.toLocaleString('en-US');
      els.forEach(function (el) { el.textContent = text; });
    }, 2400);
  })();

  // Scrambles: "inview" runs once when visible, "hover" re-runs on pointer enter of the [data-scramble-host].
  $$('[data-scramble]').forEach(function (el) {
    var text = el.getAttribute('aria-label') || el.textContent;
    var glyphs = el.dataset.glyphs === 'hex' ? HEX : GLYPHS;
    var duration = Number(el.dataset.duration) || 900;
    var cancel = function () {};
    var run = function () { cancel(); cancel = scramble(el, text, duration, glyphs); };
    if (el.dataset.scramble === 'inview') {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { run(); io.disconnect(); }
      });
      io.observe(el);
    } else if (el.dataset.scramble === 'hover') {
      (el.closest('[data-scramble-host]') || el).addEventListener('pointerenter', run);
    } else {
      run();
    }
  });

  /* ═══════════════════════════════════════════
     CHOREOGRAPHY
     ═══════════════════════════════════════════ */

  if (page) {
    var q = function (s, scope) { return gsap.utils.toArray(s, scope || page); };

    var links = new Map(q('.oc-nav__links a').map(function (a) { return [a.hash.slice(1), a]; }));
    bindActiveNav($('.oc-nav__ind', page), links, $('.oc-hero', page));

    var mm = gsap.matchMedia();

    mm.add(MOTION_OK, function () {
      // ── Intro: nav, name by character, role by word, then the rest.
      var name = SplitText.create('.oc-h1', { type: 'chars', mask: 'chars' });
      var role = SplitText.create('.oc-hero__role', { type: 'words', mask: 'words' });
      gsap
        .timeline({ defaults: { ease: 'expo.out' }, delay: 0.25 })
        .from('.oc-nav', { yPercent: -100, autoAlpha: 0, duration: 1 })
        .from(name.chars, { yPercent: 115, duration: 1.2, stagger: 0.03 }, 0.15)
        .from(role.words, { yPercent: 110, duration: 1, stagger: 0.04 }, 0.6)
        .from('[data-intro]', { y: 22, autoAlpha: 0, duration: 0.9, stagger: 0.08 }, 0.85);

      // ── Hero lifts away as the chain spreads out.
      gsap.to('.oc-hero__content', {
        y: -140, autoAlpha: 0, ease: 'none',
        scrollTrigger: { trigger: '.oc-hero', start: 'top top', end: 'bottom 25%', scrub: true },
      });

      gsap.to('.oc-progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

      // ── Section headings: rule draws, title rises line by line.
      q('.oc-head').forEach(function (head) {
        var st = { trigger: head, start: 'top 82%' };
        gsap
          .timeline({ scrollTrigger: st, defaults: { ease: 'expo.out' } })
          .from(head.querySelector('.oc-head__rule'), { scaleX: 0, duration: 0.9 })
          .from(head.querySelector('.oc-head__label'), { autoAlpha: 0, x: -12, duration: 0.6 }, 0.2)
          .from(head.querySelector('.oc-sub'), { autoAlpha: 0, y: 14, duration: 0.8 }, 0.35);
        splitReveal(head.querySelector('.oc-h2'), 'lines', { yPercent: 110, duration: 1.1, stagger: 0.09, ease: 'expo.out', scrollTrigger: st });
      });

      // ── Staggered groups.
      var group = function (sel, vars) {
        ScrollTrigger.batch(q(sel), {
          start: 'top 88%', once: true,
          onEnter: function (batch) {
            gsap.from(batch, Object.assign({ y: 48, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.1 }, vars || {}));
          },
        });
      };
      group('.oc-about__text > *');
      group('.oc-stat');
      group('.oc-card', { y: 80, rotationX: -8, transformPerspective: 900 });
      group('.oc-edu-item', { y: 60 });
      group('.oc-contact__info > *');
      group('.oc-form > *', { y: 24, stagger: 0.06 });

      // ── About: photo wipes up, frame ticks fly in from the centre, stats count.
      gsap
        .timeline({ scrollTrigger: { trigger: '.oc-photo', start: 'top 80%' } })
        .fromTo('.oc-photo', { clipPath: 'inset(100% 0% 0% 0% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.4, ease: 'expo.inOut' })
        .from('.oc-tick', { scale: 0, autoAlpha: 0, duration: 0.6, ease: 'back.out(3)', stagger: 0.06 }, '-=0.3');
      gsap.fromTo('.oc-photo img', { yPercent: -6, scale: 1.12 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.oc-photo', scrub: true } });
      q('.oc-stat__v').forEach(function (v) {
        ScrollTrigger.create({ trigger: v, start: 'top 88%', once: true, onEnter: function () { countUp(v); } });
      });

      // ── Qixazow: the card grows into place, the name types out.
      gsap.fromTo('.oc-venture', { scale: 0.9, autoAlpha: 0.3 }, {
        scale: 1, autoAlpha: 1, ease: 'none',
        scrollTrigger: { trigger: '.oc-venture', start: 'top 95%', end: 'top 40%', scrub: true },
      });
      splitReveal($('.oc-venture__name', page), 'chars', {
        yPercent: 110, duration: 1, stagger: 0.04, ease: 'expo.out',
        scrollTrigger: { trigger: '.oc-venture', start: 'top 65%' },
      });
      gsap.from('.oc-venture__pillars > div', {
        y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'expo.out',
        scrollTrigger: { trigger: '.oc-venture__pillars', start: 'top 85%' },
      });

      // ── Experience: the chain rail fills as you scroll; each block's details follow its drawing.
      gsap.fromTo('.oc-exps__fill', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.oc-exps', start: 'top 60%', end: 'bottom 60%', scrub: true } });
      q('.oc-exp').forEach(function (block) {
        var st = { trigger: block, start: 'top 72%' };
        gsap
          .timeline({ scrollTrigger: st, defaults: { ease: 'expo.out' } })
          .from(block.querySelector('.oc-exp__node'), { scale: 0, duration: 0.6, ease: 'back.out(3)' })
          .fromTo(block.querySelector('.oc-exp__scene'), { clipPath: 'inset(0% 0% 100% 0% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.2, ease: 'expo.inOut' }, 0)
          .from(q('.oc-exp__info > *, .oc-exp__bullets li, .oc-exp__info .oc-tags li', block), { y: 26, autoAlpha: 0, duration: 0.8, stagger: 0.05 }, 0.3);
      });
    });

    mm.add(MOTION_OK + ' and ' + FINE_POINTER, function () {
      var offs = [
        bindMagnetic(page, '.oc-btn, .oc-socials a, .oc-brand__mark', 0.25),
        bindTilt(page, '.oc-card', 5),
        bindSpotlight($('.oc-venture', page)),
      ];
      return function () { offs.forEach(function (off) { off(); }); };
    });

    page.classList.add('is-ready');
  }

  /* ═══════════════════════════════════════════
     CONTACT FORM
     Posts to the Google Apps Script that emails each submission and logs it (scripts/contact-mailer.gs).
     ═══════════════════════════════════════════ */

  var form = $('.oc-form');
  if (form) {
    var send = $('.oc-form__send', form);
    var sendIdle = send.innerHTML;
    var sending = false;

    var setError = function (message) {
      var p = $('.oc-form__status', form);
      if (!message) { if (p) p.remove(); return; }
      if (!p) {
        p = document.createElement('p');
        p.className = 'oc-form__status oc-mono is-error';
        p.setAttribute('role', 'alert');
        send.after(p);
      }
      p.textContent = '✕ Reverted: ' + message + '. You can also email me directly.';
    };

    var showReceipt = function () {
      var r = document.createElement('div');
      r.className = 'oc-receipt';
      r.setAttribute('role', 'status');
      r.innerHTML =
        '<svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24" pathLength="1"></circle><path d="M15 27 l7 7 l15 -16" pathLength="1"></path></svg>' +
        '<p class="oc-receipt__title">Block mined</p>' +
        '<p class="oc-mono oc-dim">tx <span data-tx></span></p>' +
        '<p class="oc-receipt__body">Message received. I&apos;ll reply within a couple of days.</p>';
      form.appendChild(r);
      var tx = short(fakeHash(String(Date.now())));
      var span = $('[data-tx]', r);
      span.setAttribute('aria-label', tx);
      scramble(span, tx, 900, HEX);
      form.classList.add('is-sent');
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      var field = function (name) { var el = form.elements.namedItem(name); return el ? el.value.trim() : ''; };
      var data = { name: field('name'), email: field('email'), subject: field('subject'), message: field('message'), company: field('company') };

      sending = true;
      send.disabled = true;
      send.innerHTML = '<i class="oc-spinner"></i> Pending…';
      setError('');

      // text/plain keeps this a "simple" CORS request; Apps Script can't answer the preflight a JSON content type triggers.
      fetch(CONTACT_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) })
        .then(function (res) {
          return res.json().catch(function () { return null; }).then(function (body) {
            if (!res.ok || !body || !body.ok) throw new Error((body && body.error) || 'Request failed (' + res.status + ')');
          });
        })
        .then(function () { form.reset(); showReceipt(); })
        .catch(function (err) { setError(((err && err.message) || 'Something went wrong').replace(/\.$/, '')); })
        .then(function () { sending = false; send.disabled = false; send.innerHTML = sendIdle; });
    });
  }
})();
