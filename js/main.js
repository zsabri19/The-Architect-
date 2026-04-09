/* ============================================================
   ClarityOS — main.js
   Interaction layer for clarityos.global-mkts.com
   ============================================================ */

(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    const nav = document.querySelector('.nav');
    const hamburger = document.querySelector('.nav__hamburger');
    const mobileMenu = document.querySelector('.nav__mobile');

    if (nav) {
      const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 80);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
        hamburger.setAttribute('aria-expanded', String(isOpen));
      });

      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('open');
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
          hamburger.setAttribute('aria-expanded', 'false');
        });
      });

      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
          hamburger.classList.remove('open');
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    document.querySelectorAll('.stagger').forEach(parent => {
      Array.from(parent.children).forEach((child, i) => {
        child.style.transitionDelay = `${i * 90}ms`;
      });
    });

    document.querySelectorAll('.faq__question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq__item');
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq__item').forEach(el => el.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
        btn.setAttribute('aria-expanded', String(!isOpen));
      });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const offset = nav ? nav.offsetHeight + 24 : 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__link, .nav__mobile-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      const linkPage = href.split('/').pop();
      if (linkPage === currentPath || (currentPath === 'index.html' && linkPage === '') || (currentPath === '' && linkPage === 'index.html')) {
        link.setAttribute('aria-current', 'page');
      }
    });

    const heroImg = document.querySelector('.hero__img');
    if (heroImg && window.matchMedia('(min-width: 769px)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const heroSection = heroImg.closest('.hero');
        if (heroSection && heroSection.getBoundingClientRect().bottom > 0) {
          heroImg.style.transform = `scale(1.03) translateY(${scrolled * 0.15}px)`;
        }
      }, { passive: true });
    }

    const counters = document.querySelectorAll('[data-counter]');
    if (counters.length) {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.dataset.counter);
          const suffix = el.dataset.suffix || '';
          const prefix = el.dataset.prefix || '';
          const dec = target % 1 !== 0 ? 1 : 0;
          const duration = 1800;
          let start = null;
          function step(ts) {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const val = progress < 1 ? target * (1 - Math.pow(1 - progress, 3)) : target;
            el.textContent = prefix + val.toFixed(dec) + suffix;
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          counterObserver.unobserve(el);
        });
      }, { threshold: 0.5 });
      counters.forEach(el => counterObserver.observe(el));
    }

    const dispatchForm = document.querySelector('.dispatch__form');
    if (dispatchForm) {
      dispatchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const input = this.querySelector('input[type="email"]');
        const btn = this.querySelector('button[type="submit"]');
        if (!input || !input.value) return;
        const originalText = btn.textContent;
        btn.textContent = 'Subscribed ✓';
        btn.disabled = true;
        btn.style.background = '#2e7d52';
        input.value = '';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
          btn.style.background = '';
        }, 4000);
      });
    }

    document.querySelectorAll('[data-track-click]').forEach(link => {
      link.addEventListener('click', () => {
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'select_content', {
            content_type: 'cta',
            item_id: link.dataset.trackClick
          });
        }
      });
    });

    document.querySelectorAll('form.contact-form').forEach(form => {
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const btn = this.querySelector('button[type="submit"]');
        const originalTxt = btn ? btn.textContent : '';
        if (btn) {
          btn.textContent = 'Sending…';
          btn.disabled = true;
        }
        try {
          const data = new FormData(this);
          const response = await fetch(this.action, {
            method: 'POST',
            body: data,
            headers: { 'Accept': 'application/json' }
          });
          if (response.ok) {
            this.innerHTML = `\n              <div style="text-align:center;padding:3rem 1rem;">\n                <div style="font-size:3rem;margin-bottom:1rem;">✓</div>\n                <h3 style="font-family:'Playfair Display',serif;color:var(--dawn);margin-bottom:0.5rem;">Message Received</h3>\n                <p style="color:var(--muted);">Zeeshan's team will respond within 48 hours.</p>\n              </div>`;
          } else {
            throw new Error('Network error');
          }
        } catch {
          if (btn) {
            btn.textContent = originalTxt;
            btn.disabled = false;
          }
          const errMsg = this.querySelector('.form-error');
          if (errMsg) errMsg.style.display = 'block';
        }
      });
    });

    const book = document.querySelector('.book');
    if (book) {
      book.addEventListener('mousemove', (e) => {
        const rect = book.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotY = -(x / rect.width) * 12;
        const rotX = (y / rect.height) * 6;
        book.style.transform = `perspective(900px) rotateY(${rotY}deg) rotateX(${rotX}deg)`;
      });
      book.addEventListener('mouseleave', () => {
        book.style.transform = 'perspective(900px) rotateY(-10deg)';
      });
    }

    document.querySelectorAll('.path-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotY = (x / rect.width) * 6;
        const rotX = -(y / rect.height) * 4;
        card.style.transform = `perspective(1000px) rotateY(${rotY}deg) rotateX(${rotX}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  });
})();
