/**
 * mayankbhadrasen.com · work.js
 * Experience status (Pending → Confirmed when a block's drawing finishes) and the Stack bento:
 * reveals, the workflow pulse, spotlights and "used at" links.
 * Needs main.js (window.Portfolio) and the fence.js "wire:drawn" event.
 */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var P = window.Portfolio;

  /* ═══════════════════════════════════════════
     EXPERIENCE: confirm each block once its scene has drawn
     ═══════════════════════════════════════════ */

  $$('.oc-exp').forEach(function (block) {
    block.addEventListener('wire:drawn', function () {
      var status = $('.oc-status', block);
      if (status) status.classList.remove('is-pending');
    });
  });

  /* ═══════════════════════════════════════════
     PROJECTS RAIL
     Snap-scrolling cards with arrow buttons, a progress line and mouse drag.
     ═══════════════════════════════════════════ */

  (function () {
    var rail = $('.oc-projects');
    if (!rail) return;
    var prev = $('[data-rail="prev"]');
    var next = $('[data-rail="next"]');
    var bar = $('.oc-rail-progress');

    // On wide screens the cards are grouped into pages of 6 (3 across, 2 down) and the arrows move a page.
    // Narrower screens keep one row of cards. Order comes from the HTML: newest project first.
    var PER_PAGE = 6;
    var wide = window.matchMedia('(min-width: 1001px)');
    var cards = $$('.oc-card', rail);
    var paginate = function () {
      $$('.oc-page', rail).forEach(function (pg) { pg.remove(); });
      if (wide.matches) {
        for (var i = 0; i < cards.length; i += PER_PAGE) {
          var pg = document.createElement('div');
          pg.className = 'oc-page';
          cards.slice(i, i + PER_PAGE).forEach(function (c) { pg.appendChild(c); });
          rail.appendChild(pg);
        }
      } else {
        cards.forEach(function (c) { rail.appendChild(c); });
      }
      rail.scrollLeft = 0;
    };
    paginate();
    wide.addEventListener('change', function () { paginate(); update(); });

    var step = function () {
      var unit = $('.oc-page', rail) || $('.oc-card', rail);
      var gap = parseFloat(getComputedStyle(rail).columnGap) || 20;
      return unit ? unit.getBoundingClientRect().width + gap : rail.clientWidth;
    };
    var update = function () {
      var max = rail.scrollWidth - rail.clientWidth;
      var p = max > 0 ? rail.scrollLeft / max : 0;
      if (bar) bar.style.setProperty('--p', Math.max(0.12, p).toFixed(3));
      if (prev) prev.disabled = rail.scrollLeft <= 2;
      if (next) next.disabled = rail.scrollLeft >= max - 2;
    };
    var go = function (dir) {
      rail.scrollBy({ left: dir * step(), behavior: P.reduced() ? 'auto' : 'smooth' });
    };
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    rail.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });

    // Drag to scroll with a mouse (touch and trackpads scroll natively). A real drag swallows the click.
    var down = null;
    var moved = false;
    rail.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = { x: e.clientX, left: rail.scrollLeft };
      moved = false;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - down.x;
      if (!moved && Math.abs(dx) > 6) { moved = true; rail.classList.add('is-dragging'); }
      if (moved) rail.scrollLeft = down.left - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = null;
      if (!moved) return;
      // Re-enable snapping from where the drag ended, then settle on the nearest card.
      var left = rail.scrollLeft;
      rail.classList.remove('is-dragging');
      rail.scrollLeft = left;
      var s = step();
      rail.scrollTo({ left: Math.round(left / s) * s, behavior: 'smooth' });
    });
    rail.addEventListener('click', function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
    rail.addEventListener('dragstart', function (e) { e.preventDefault(); });

    update();
  })();

  /* ═══════════════════════════════════════════
     WORKFLOW THUMBNAILS
     Each project card draws an n8n-style canvas of its real workflow stages, then runs it on a loop:
     a packet travels each connection and every node lights up and gets a check as data reaches it.
     Coordinates live in a 160 × 100 box, the card image's 16:10 shape.
     ═══════════════════════════════════════════ */

  var FLOWS = {
    applications: {
      nodes: [
        { id: 'tick', x: 13, y: 50, icon: 'clock', label: 'Schedule', kind: 'trigger' },
        { id: 'saved', x: 35, y: 50, icon: 'googlesheets', label: 'Saved jobs', top: true },
        { id: 'gh', x: 60, y: 16, icon: 'greenhouse', label: 'Greenhouse' },
        { id: 'ashby', x: 60, y: 39, icon: 'briefcase', label: 'Ashby' },
        { id: 'lever', x: 60, y: 62, icon: 'briefcase', label: 'Lever' },
        { id: 'remote', x: 60, y: 85, icon: 'briefcase', label: 'Remote boards' },
        { id: 'merge', x: 86, y: 50, icon: 'git-merge', label: 'Merge', top: true },
        { id: 'filter', x: 110, y: 50, icon: 'filter', label: 'Filter' },
        { id: 'apps', x: 140, y: 31, icon: 'googlesheets', label: 'New jobs' },
        { id: 'log', x: 140, y: 70, icon: 'list-checks', label: 'Run log' },
      ],
      edges: [['tick', 'saved'], ['saved', 'gh'], ['saved', 'ashby'], ['saved', 'lever'], ['saved', 'remote'],
        ['gh', 'merge'], ['ashby', 'merge'], ['lever', 'merge'], ['remote', 'merge'],
        ['merge', 'filter'], ['filter', 'apps'], ['filter', 'log']],
    },
    'one-pipe': {
      nodes: [
        { id: 'tick', x: 13, y: 50, icon: 'clock', label: 'Schedule', kind: 'trigger' },
        { id: 'ads', x: 40, y: 17, icon: 'huggingface', label: 'HF ad copy' },
        { id: 'cmp', x: 40, y: 50, icon: 'huggingface', label: 'HF campaigns' },
        { id: 'rss', x: 40, y: 83, icon: 'rss', label: 'RSS × 4' },
        { id: 'map', x: 70, y: 50, icon: 'braces', label: 'One schema', top: true },
        { id: 'qc', x: 99, y: 50, icon: 'shield-check', label: 'Quality checks', kind: 'ai' },
        { id: 'csv', x: 136, y: 29, icon: 'file-spreadsheet', label: 'Clean CSV' },
        { id: 'report', x: 136, y: 71, icon: 'file-json', label: 'QA report' },
      ],
      edges: [['tick', 'ads'], ['tick', 'cmp'], ['tick', 'rss'], ['ads', 'map'], ['cmp', 'map'], ['rss', 'map'],
        ['map', 'qc'], ['qc', 'csv'], ['qc', 'report']],
    },
    'cw-lab': {
      nodes: [
        { id: 'ads', x: 13, y: 28, icon: 'database', label: '156 ads', kind: 'trigger' },
        { id: 'labels', x: 13, y: 72, icon: 'list-checks', label: 'Hand labels' },
        { id: 'judge', x: 45, y: 28, icon: 'claude', label: 'Claude judge', kind: 'ai' },
        { id: 'parse', x: 77, y: 28, icon: 'braces', label: 'Strict parser', top: true },
        { id: 'score', x: 105, y: 50, icon: 'split', label: 'Score' },
        { id: 'report', x: 137, y: 50, icon: 'file-spreadsheet', label: 'Accuracy · ECE' },
      ],
      edges: [['ads', 'judge'], ['judge', 'parse'], ['parse', 'score'], ['labels', 'score'], ['score', 'report']],
    },
    'ad-review': {
      nodes: [
        { id: 'hook', x: 13, y: 46, icon: 'webhook', label: 'Webhook', kind: 'trigger' },
        { id: 'gate', x: 35, y: 46, icon: 'shield-check', label: 'Gatekeeper', top: true },
        { id: 'claude', x: 57, y: 46, icon: 'claude', label: 'Claude', kind: 'ai' },
        { id: 'valid', x: 79, y: 46, icon: 'split', label: 'Valid?', top: true },
        { id: 'rules', x: 79, y: 80, icon: 'braces', label: 'Rules fallback' },
        { id: 'plan', x: 103, y: 46, icon: 'list-checks', label: 'Plan' },
        { id: 'hubspot', x: 137, y: 17, icon: 'hubspot', label: 'HubSpot task' },
        { id: 'slack', x: 137, y: 46, icon: 'message-square-text', label: 'Slack alert' },
        { id: 'log', x: 137, y: 75, icon: 'database', label: 'Action log' },
      ],
      edges: [['hook', 'gate'], ['gate', 'claude'], ['claude', 'valid'], ['valid', 'plan'], ['valid', 'rules'], ['rules', 'plan'],
        ['plan', 'hubspot'], ['plan', 'slack'], ['plan', 'log']],
    },
  };

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var HALF = 7.5; // half a node's width, in box units

  /** Longest-path depth of every node from the trigger, so execution flows left to right in stages. */
  function levels(flow) {
    var depth = {};
    flow.nodes.forEach(function (n) { depth[n.id] = 0; });
    for (var pass = 0; pass < flow.nodes.length; pass++) {
      flow.edges.forEach(function (e) { depth[e[1]] = Math.max(depth[e[1]], depth[e[0]] + 1); });
    }
    return depth;
  }

  function edgePath(a, b) {
    if (Math.abs(a.x - b.x) < 4) {
      // Same column: drop straight down from the bottom of one node to the top of the next.
      var y1 = a.y + HALF * 1.6, y2 = b.y - HALF * 1.6;
      return 'M' + a.x + ' ' + y1 + ' C' + a.x + ' ' + (y1 + 8) + ' ' + b.x + ' ' + (y2 - 8) + ' ' + b.x + ' ' + y2;
    }
    var x1 = a.x + HALF, x2 = b.x - HALF, mx = (x1 + x2) / 2;
    return 'M' + x1 + ' ' + a.y + ' C' + mx + ' ' + a.y + ' ' + mx + ' ' + b.y + ' ' + x2 + ' ' + b.y;
  }

  function buildFlow(el, flow) {
    var byId = {};
    flow.nodes.forEach(function (n) { byId[n.id] = n; });
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 160 100');
    svg.setAttribute('aria-hidden', 'true');
    var edges = flow.edges.map(function (e) {
      var path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', edgePath(byId[e[0]], byId[e[1]]));
      path.setAttribute('pathLength', '1');
      path.setAttribute('class', 'oc-flow__edge');
      var pkt = document.createElementNS(SVG_NS, 'circle');
      pkt.setAttribute('r', '1.5');
      pkt.setAttribute('class', 'oc-flow__pkt');
      svg.appendChild(path);
      svg.appendChild(pkt);
      return { from: e[0], to: e[1], path: path, pkt: pkt, len: path.getTotalLength() };
    });
    el.appendChild(svg);
    var nodes = {};
    flow.nodes.forEach(function (n) {
      var d = document.createElement('div');
      d.className = 'oc-node' + (n.kind ? ' oc-node--' + n.kind : '') + (n.top ? ' oc-node--label-top' : '');
      d.style.left = (n.x / 160) * 100 + '%';
      d.style.top = n.y + '%';
      d.setAttribute('aria-hidden', 'true');
      d.innerHTML =
        '<i class="oc-logo" style="-webkit-mask-image:url(assets/logos/' + n.icon + '.svg);mask-image:url(assets/logos/' + n.icon + '.svg)"></i>' +
        '<span class="oc-node__label"></span><i class="oc-node__ok"></i>';
      d.querySelector('.oc-node__label').textContent = n.label;
      el.appendChild(d);
      nodes[n.id] = d;
    });
    return { edges: edges, nodes: nodes, depth: levels(flow) };
  }

  $$('.oc-flow[data-flow]').forEach(function (el) {
    var flow = FLOWS[el.dataset.flow];
    if (!flow) return;
    var f = buildFlow(el, flow);
    var STAGE = 0.55; // seconds per stage
    var nodeEls = Object.keys(f.nodes).map(function (id) { return f.nodes[id]; });

    if (P.reduced()) {
      f.edges.forEach(function (e) { e.path.style.strokeDashoffset = '0'; });
      nodeEls.forEach(function (n) { n.classList.add('is-done'); });
      return;
    }

    // Draw-in: connections ink stage by stage while nodes pop in.
    var intro = gsap.timeline({ paused: true });
    Object.keys(f.nodes).forEach(function (id) {
      intro.from(f.nodes[id], { scale: 0.4, autoAlpha: 0, duration: 0.5, ease: 'back.out(2)' }, f.depth[id] * 0.18);
    });
    f.edges.forEach(function (e) {
      intro.to(e.path, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut' }, f.depth[e.from] * 0.18 + 0.15);
    });

    // Run loop: packets travel each connection; a node runs when data arrives and keeps its check until the loop restarts.
    var run = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.1 });
    run.call(function () {
      nodeEls.forEach(function (n) { n.classList.remove('is-run', 'is-done'); });
      f.edges.forEach(function (e) { e.path.classList.remove('is-on'); });
    }, [], 0);
    Object.keys(f.nodes).forEach(function (id) {
      var t = f.depth[id] * STAGE;
      var n = f.nodes[id];
      run.call(function () { n.classList.add('is-run'); }, [], t);
      run.call(function () { n.classList.remove('is-run'); n.classList.add('is-done'); }, [], t + STAGE * 0.8);
    });
    f.edges.forEach(function (e) {
      var start = f.depth[e.from] * STAGE + STAGE * 0.15;
      var dur = (f.depth[e.to] - f.depth[e.from]) * STAGE - STAGE * 0.15;
      var state = { p: 0 };
      run.call(function () { e.path.classList.add('is-on'); }, [], start);
      run.fromTo(state, { p: 0 }, {
        p: 1, duration: dur, ease: 'power1.inOut', immediateRender: false,
        onUpdate: function () {
          var pt = e.path.getPointAtLength(state.p * e.len);
          e.pkt.setAttribute('cx', pt.x);
          e.pkt.setAttribute('cy', pt.y);
          e.pkt.style.opacity = state.p < 0.08 ? state.p / 0.08 : state.p > 0.92 ? (1 - state.p) / 0.08 : 1;
        },
        onComplete: function () { e.pkt.style.opacity = 0; },
      }, start);
    });

    // Play only while the card is on screen (horizontally inside the rail as well as vertically).
    var started = false;
    new IntersectionObserver(function (entries) {
      var on = entries[0].isIntersecting;
      if (on && !started) {
        started = true;
        intro.play().then(function () { run.play(); });
      } else if (started && intro.progress() === 1) {
        if (on) run.play(); else run.pause();
      }
    }, { threshold: 0.35 }).observe(el);
  });

  /* ═══════════════════════════════════════════
     STACK
     ═══════════════════════════════════════════ */

  var stack = $('.oc-stack');
  if (!stack) return;
  var tiles = $$('.oc-tile', stack);

  // "Used at": hovering, focusing or tapping a tool lists where it was used, in that tile's footer.
  var idle = function (footer) {
    footer.innerHTML = '<span class="oc-mono oc-dim">Hover a tool to see where I used it</span>';
  };
  var show = function (tile, token) {
    $$('.oc-token', tile).forEach(function (t) { t.classList.toggle('is-on', t === token); });
    var footer = $('.oc-tile__used', tile);
    var name = token.dataset.skill;
    var used = JSON.parse(token.dataset.used || '[]');
    footer.textContent = '';
    var label = document.createElement('span');
    label.className = 'oc-mono oc-dim';
    label.textContent = used.length ? name + ' at' : name + ' is part of my toolkit';
    footer.appendChild(label);
    used.forEach(function (u) {
      var a = document.createElement('a');
      a.href = u.href;
      a.className = 'oc-used';
      a.textContent = u.label;
      footer.appendChild(a);
    });
  };
  tiles.forEach(function (tile) {
    $$('.oc-token', tile).forEach(function (token) {
      ['pointerenter', 'focus', 'click'].forEach(function (ev) {
        token.addEventListener(ev, function () { show(tile, token); });
      });
    });
    tile.addEventListener('pointerleave', function () {
      $$('.oc-token', tile).forEach(function (t) { t.classList.remove('is-on'); });
      idle($('.oc-tile__used', tile));
    });
  });

  var mm = gsap.matchMedia();

  mm.add(P.MOTION_OK, function () {
    tiles.forEach(function (tile, i) {
      var tokens = tile.querySelectorAll('.oc-token');
      var tl = gsap.timeline({ scrollTrigger: { trigger: tile, start: 'top 82%' }, defaults: { ease: 'expo.out' } });
      tl.fromTo(tile, { clipPath: 'inset(0% 0% 100% 0% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.1, ease: 'expo.inOut' }, i * 0.08);
      tl.from(tile.querySelectorAll('.oc-tile__head > *, .oc-tile__blurb'), { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.06 }, '-=0.5');
      if (i === 2) {
        // Cloud & DevOps: layers stack upward like a deployment.
        tl.from(tokens, { y: 40, autoAlpha: 0, duration: 0.7, stagger: { each: 0.07, from: 'end' }, ease: 'back.out(1.6)', clearProps: 'transform,opacity,visibility' }, '-=0.4');
      } else {
        tl.from(tokens, { scale: 0.7, autoAlpha: 0, duration: 0.55, stagger: 0.04, ease: 'back.out(2.2)', clearProps: 'transform,opacity,visibility' }, '-=0.4');
      }
    });

    // Integration & Automation: a pulse runs through the tools in order, like data through a workflow.
    var flow = gsap.utils.toArray('.oc-tile--0 .oc-token', stack);
    var pulse = gsap.timeline({ repeat: -1, repeatDelay: 1.2, paused: true });
    flow.forEach(function (t, i) {
      pulse.call(function () { t.classList.add('is-pulse'); }, [], i * 0.32).call(function () { t.classList.remove('is-pulse'); }, [], i * 0.32 + 0.6);
    });
    ScrollTrigger.create({
      trigger: '.oc-tile--0', start: 'top 85%', end: 'bottom 15%',
      onToggle: function (self) { if (self.isActive) pulse.play(); else pulse.pause(); },
    });
  });

  mm.add(P.MOTION_OK + ' and ' + P.FINE_POINTER, function () {
    var offs = tiles.map(function (t) { return P.bindSpotlight(t); });
    return function () { offs.forEach(function (off) { off(); }); };
  });
})();
