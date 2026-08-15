/* ============================================
   Subhakant Rout — Portfolio Interactions
   Particles, Typing, Scroll Reveals, Nav
   ============================================ */

(function () {
  'use strict';

  // --- Particle System ---
  class ParticleSystem {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.mouse = { x: null, y: null, radius: 150 };
      this.resize();
      this.init();
      this.animate();

      window.addEventListener('resize', () => this.resize());
      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      });
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    init() {
      this.particles = [];
      const count = Math.min(Math.floor((this.canvas.width * this.canvas.height) / 15000), 100);
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.4,
          speedY: (Math.random() - 0.5) * 0.4,
          opacity: Math.random() * 0.5 + 0.1,
          color: Math.random() > 0.5 ? '0, 240, 255' : '139, 92, 246',
        });
      }
    }

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.particles.forEach((p, i) => {
        // Move particles
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around edges
        if (p.x < 0) p.x = this.canvas.width;
        if (p.x > this.canvas.width) p.x = 0;
        if (p.y < 0) p.y = this.canvas.height;
        if (p.y > this.canvas.height) p.y = 0;

        // Mouse interaction: gentle push
        if (this.mouse.x !== null) {
          const dx = p.x - this.mouse.x;
          const dy = p.y - this.mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < this.mouse.radius) {
            const force = (this.mouse.radius - dist) / this.mouse.radius;
            p.x += dx * force * 0.02;
            p.y += dy * force * 0.02;
          }
        }

        // Draw particle
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
        this.ctx.fill();

        // Draw connections
        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = `rgba(0, 240, 255, ${0.06 * (1 - dist / 120)})`;
            this.ctx.lineWidth = 0.5;
            this.ctx.stroke();
          }
        }
      });

      requestAnimationFrame(() => this.animate());
    }
  }

  // --- Typing Animation ---
  class TypingAnimation {
    constructor(element, texts, speed = 80, pauseTime = 2000) {
      this.element = element;
      this.texts = texts;
      this.speed = speed;
      this.pauseTime = pauseTime;
      this.textIndex = 0;
      this.charIndex = 0;
      this.isDeleting = false;
      this.type();
    }

    type() {
      const currentText = this.texts[this.textIndex];
      const displayText = this.isDeleting
        ? currentText.substring(0, this.charIndex--)
        : currentText.substring(0, this.charIndex++);

      this.element.textContent = displayText;

      let delay = this.isDeleting ? this.speed / 2 : this.speed;

      if (!this.isDeleting && this.charIndex > currentText.length) {
        delay = this.pauseTime;
        this.isDeleting = true;
      } else if (this.isDeleting && this.charIndex < 0) {
        this.isDeleting = false;
        this.textIndex = (this.textIndex + 1) % this.texts.length;
        delay = 400;
      }

      setTimeout(() => this.type(), delay);
    }
  }

  // --- Scroll Reveal ---
  function initScrollReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal, .skill-card').forEach((el) => observer.observe(el));
  }

  // --- Counter Animation ---
  function animateCounters() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-target'), 10);
            const suffix = el.getAttribute('data-suffix') || '';
            let current = 0;
            const step = Math.ceil(target / 50);
            const interval = setInterval(() => {
              current += step;
              if (current >= target) {
                current = target;
                clearInterval(interval);
              }
              el.textContent = current + suffix;
            }, 30);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('[data-target]').forEach((el) => observer.observe(el));
  }

  // --- Navigation ---
  function initNav() {
    const nav = document.querySelector('.nav');
    const toggle = document.querySelector('.nav__toggle');
    const links = document.querySelector('.nav__links');

    // Scroll effect
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Mobile toggle
    if (toggle) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        links.classList.toggle('open');
      });

      // Close on link click
      links.querySelectorAll('.nav__link').forEach((link) => {
        link.addEventListener('click', () => {
          toggle.classList.remove('active');
          links.classList.remove('open');
        });
      });
    }

    // Active section highlighting
    const sections = document.querySelectorAll('.section[id]');
    const navLinks = document.querySelectorAll('.nav__link[data-section]');

    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach((section) => {
        const top = section.offsetTop - 200;
        if (window.scrollY >= top) {
          current = section.getAttribute('id');
        }
      });
      navLinks.forEach((link) => {
        link.style.color = '';
        if (link.getAttribute('data-section') === current) {
          link.style.color = '#00f0ff';
        }
      });
    });
  }

  // --- Smooth scroll for anchor links ---
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // --- Initialize Everything ---
  document.addEventListener('DOMContentLoaded', () => {
    // Particles
    new ParticleSystem('particles-canvas');

    // Typing animation
    const typedEl = document.getElementById('typed-text');
    if (typedEl) {
      new TypingAnimation(typedEl, [
        'Full Stack Developer',
        'AI Enthusiast',
        'Open Source Builder',
        'Problem Solver',
      ]);
    }

    // Scroll reveals
    initScrollReveal();

    // Counter animations
    animateCounters();

    // Navigation
    initNav();

    // Smooth scroll
    initSmoothScroll();
  });
})();
