/* ============================================================
   main.js — Vanilla JS portfolio logic
   Replaces: ParticlesContainer, SectionParticles, TypewriterEffect,
             AnimatedSection, useScrollDirection, contact form
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. NAVBAR SCROLL HIDE/SHOW ─────────────────────────────── */
  (function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', function () {
      const current = window.scrollY;
      if (current > lastScrollY && current > 80) {
        navbar.classList.add('hidden-nav');
      } else {
        navbar.classList.remove('hidden-nav');
      }
      lastScrollY = current;
    }, { passive: true });
  })();


  /* ── 2. ANIMATED SECTIONS (IntersectionObserver fade-in) ─────── */
  (function initAnimatedSections() {
    const sections = document.querySelectorAll('.animated-section');
    if (!sections.length) return;

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    sections.forEach(function (el) { observer.observe(el); });
  })();


  /* ── 3. PARTICLES — Hero Section ─────────────────────────────── */
  (function initHeroParticles() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function Particle() {
      this.reset();
    }
    Particle.prototype.reset = function () {
      this.x      = Math.random() * canvas.width;
      this.y      = Math.random() * canvas.height;
      this.size   = Math.random() * 3 + 1;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.r      = Math.floor(Math.random() * 100 + 155);
      this.b      = Math.floor(Math.random() * 100 + 155);
      this.g      = Math.floor(Math.random() * 50);
      this.alpha  = Math.random() * 0.5 + 0.1;
    };
    Particle.prototype.update = function () {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x > canvas.width  || this.x < 0) this.speedX = -this.speedX;
      if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
    };
    Particle.prototype.draw = function () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.alpha + ')';
      ctx.fill();
    };

    var count     = Math.min(100, Math.floor((window.innerWidth * window.innerHeight) / 10000));
    var particles = [];
    for (var i = 0; i < count; i++) particles.push(new Particle());

    function connect() {
      var maxD = 150;
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx   = particles[i].x - particles[j].x;
          var dy   = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxD) {
            var op = (1 - dist / maxD) * 0.2;
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(147,51,234,' + op + ')';
            ctx.lineWidth   = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(function (p) { p.update(); p.draw(); });
      connect();
      requestAnimationFrame(animate);
    }
    animate();
  })();


  /* ── 4. PARTICLES — Per Section (lazy, only when visible) ────── */
  (function initSectionParticles() {
    var sectionIds = ['about', 'projects', 'experience', 'education', 'contact'];

    sectionIds.forEach(function (id) {
      var section = document.getElementById(id);
      if (!section) return;

      var canvas = document.createElement('canvas');
      canvas.className = 'particles-canvas';
      canvas.style.position = 'absolute';
      canvas.style.inset    = '0';
      canvas.style.zIndex   = '0';
      canvas.style.pointerEvents = 'none';
      section.insertBefore(canvas, section.firstChild);

      var ctx   = canvas.getContext('2d');
      var rafId = null;
      var active = false;

      function resize() {
        canvas.width  = section.offsetWidth;
        canvas.height = section.offsetHeight;
      }
      resize();
      window.addEventListener('resize', resize, { passive: true });

      function Particle() {
        this.reset();
      }
      Particle.prototype.reset = function () {
        this.x      = Math.random() * canvas.width;
        this.y      = Math.random() * canvas.height;
        this.size   = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.r      = Math.floor(Math.random() * 100 + 155);
        this.b      = Math.floor(Math.random() * 100 + 155);
        this.g      = Math.floor(Math.random() * 50);
        this.alpha  = Math.random() * 0.35 + 0.05;
      };
      Particle.prototype.update = function () {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width  || this.x < 0) this.speedX = -this.speedX;
        if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
      };
      Particle.prototype.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.alpha + ')';
        ctx.fill();
      };

      var count     = Math.min(40, Math.floor((window.innerWidth * window.innerHeight) / 25000));
      var particles = [];
      for (var i = 0; i < count; i++) particles.push(new Particle());

      function connect() {
        var maxD = 130;
        for (var i = 0; i < particles.length; i++) {
          for (var j = i + 1; j < particles.length; j++) {
            var dx   = particles[i].x - particles[j].x;
            var dy   = particles[i].y - particles[j].y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < maxD) {
              var op = (1 - dist / maxD) * 0.15;
              ctx.beginPath();
              ctx.strokeStyle = 'rgba(147,51,234,' + op + ')';
              ctx.lineWidth   = 1;
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      function loop() {
        if (!active) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(function (p) { p.update(); p.draw(); });
        connect();
        rafId = requestAnimationFrame(loop);
      }

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            active = true;
            resize();
            loop();
          } else {
            active = false;
            cancelAnimationFrame(rafId);
          }
        });
      }, { threshold: 0.05 });

      observer.observe(section);
    });
  })();


  /* ── 5. TYPEWRITER EFFECT ─────────────────────────────────────── */
  (function initTypewriter() {
    var el = document.getElementById('typewriter-text');
    if (!el) return;

    var words = [
      'Decentralized Web Apps',
      'Blockchain-Integrated UI/UX',
      'AI-Powered Workflows',
      'Secure Web3 Solutions',
      'Full-Stack Magic with React & Django',
      'Smart Contracts in Action',
      'Real-Time Crypto Dashboards',
    ];

    var idx       = 0;
    var charIdx   = 0;
    var deleting  = false;
    var speed     = 150;

    function tick() {
      var word    = words[idx];
      var current = deleting
        ? word.substring(0, charIdx - 1)
        : word.substring(0, charIdx + 1);

      el.textContent = current;
      charIdx = current.length;

      if (!deleting && current === word) {
        // Pause at end of word
        setTimeout(function () {
          deleting = true;
          setTimeout(tick, 50);
        }, 1500);
        return;
      } else if (deleting && current === '') {
        deleting = false;
        idx      = (idx + 1) % words.length;
        speed    = 150;
      } else {
        speed = deleting ? 50 : 150;
      }

      setTimeout(tick, speed);
    }
    setTimeout(tick, 400);
  })();


  /* ── 6. CONTACT FORM ──────────────────────────────────────────── */
  (function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var btn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = {
        name:    form.elements['name'].value,
        email:   form.elements['email'].value,
        subject: form.elements['subject'].value,
        message: form.elements['message'].value,
      };

      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      fetch(
        'https://script.google.com/macros/s/AKfycbwEuHQvPAXyM9fzKxka1NrZqoZu3oSHDJZQgl3AJ2rEI0jyLQtxBNVFdVetr2bFZwmalw/exec',
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(data),
        }
      )
      .then(function (res) {
        if (res.ok) {
          alert('Message sent successfully! I\'ll get back to you soon.');
          form.reset();
        } else {
          alert('Something went wrong. Please try again or email me directly.');
        }
      })
      .catch(function () {
        alert('Network error. Please try emailing me directly at bhadrasen.m@northeastern.edu');
      })
      .finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = 'Send Message'; }
      });
    });
  })();


  /* ── 7. CURRENT YEAR IN FOOTER ───────────────────────────────── */
  (function setYear() {
    var el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
  })();


  /* ── 8. SCROLL PROGRESS BAR ──────────────────────────────────── */
  (function initScrollProgress() {
    var progress = document.getElementById('scroll-progress');
    if (!progress) return;

    window.addEventListener('scroll', function () {
      var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      progress.style.width = scrolled + '%';
    }, { passive: true });
  })();


  /* ── 9. MOBILE NAVIGATION OVERLAY ────────────────────────────── */
  (function initMobileNav() {
    var toggle = document.getElementById('mobile-menu-toggle');
    var overlay = document.getElementById('mobile-menu-overlay');
    if (!toggle || !overlay) return;

    function toggleMenu() {
      var isOpen = toggle.classList.contains('open');
      if (isOpen) {
        toggle.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      } else {
        toggle.classList.add('open');
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    }

    toggle.addEventListener('click', toggleMenu);

    // Close menu when clicking link
    var links = overlay.querySelectorAll('a');
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  })();


  /* ── 10. PREMIUM CARD INTERACTIONS (Mouse Glow & 3D Tilt) ───── */
  (function initCardEffects() {
    var cards = document.querySelectorAll('.card');
    if (!cards.length) return;

    var isTouch = window.matchMedia('(pointer: coarse)').matches;

    cards.forEach(function (card) {
      // Glow effect (runs on mousemove)
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');
      });

      // 3D Tilt effect (desktop only)
      if (!isTouch) {
        card.addEventListener('mouseenter', function () {
          card.style.transition = 'transform 0.1s ease, border-color 0.35s ease, box-shadow 0.35s ease';
        });

        card.addEventListener('mousemove', function (e) {
          var rect = card.getBoundingClientRect();
          var x = e.clientX - rect.left;
          var y = e.clientY - rect.top;

          var xc = x / rect.width - 0.5;
          var yc = y / rect.height - 0.5;

          var maxTilt = 8; // degrees
          var rotateX = -yc * maxTilt;
          var rotateY = xc * maxTilt;

          card.style.transform = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-5px)';
        });

        card.addEventListener('mouseleave', function () {
          card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.35s ease, box-shadow 0.35s ease';
          card.style.transform = '';
        });
      }
    });
  })();

})();
