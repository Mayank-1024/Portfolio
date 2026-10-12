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
