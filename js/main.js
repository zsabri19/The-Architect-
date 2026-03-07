/* ============================================================
   ClarityOS — main.js
   Interaction layer for clarityos.global-mkts.com
   ============================================================ */

(function () {
  'use strict';

  /* ── Utility: run after DOM ready ── */
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {

    /* ============================================================
       1. NAVIGATION — scroll effect + hamburger
       ============================================================ */
    const nav        = document.querySelector('.nav');
    const hamburger  = document.querySelector('.nav__hamburger');
    const mobileMenu = document.querySelector('.nav__mobile');

    // Scroll-triggered glass effect
    if (nav) {
      const onScroll = () => {
        nav.classList.toggle('scrolled', window.scrollY > 80);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll(); // run once on load
    }

    // Hamburger toggle
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
        hamburger.setAttribute('aria-expanded', String(isOpen));
      });

      // Close on mobile link click
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('open');
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
          hamburger.setAttribute('aria-expanded', 'false');
        });
      });

      // Close on Escape key
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
          hamburger.classList.remove('open');
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
          hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    /* ============================================================
       2. SCROLL REVEAL — IntersectionObserver
       ============================================================ */
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(el => {
      revealObserver.observe(el);
    });

    /* ============================================================
       3. STAGGER ANIMATION for grid children
       ============================================================ */
    document.querySelectorAll('.stagger').forEach(parent => {
      Array.from(parent.children).forEach((child, i) => {
        child.style.transitionDelay = `${i * 90}ms`;
      });
    });

    /* ============================================================
       4. FAQ ACCORDION
       ============================================================ */
    document.querySelectorAll('.faq__question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item      = btn.closest('.faq__item');
        const isOpen    = item.classList.contains('open');
        const allItems  = document.querySelectorAll('.faq__item');

        // Close all open items
        allItems.forEach(el => el.classList.remove('open'));

        // If it wasn't open, open it
        if (!isOpen) {
          item.classList.add('open');
        }

        btn.setAttribute('aria-expanded', String(!isOpen));
      });
    });

    /* ============================================================
       5. SMOOTH SCROLL for anchor links
       ============================================================ */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const offset = nav ? nav.offsetHeight + 24 : 80;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });

    /* ============================================================
       6. ACTIVE NAV LINK (mark current page)
       ============================================================ */
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__link, .nav__mobile-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      const linkPage = href.split('/').pop();
      if (linkPage === currentPath ||
          (currentPath === 'index.html' && linkPage === '') ||
          (currentPath === '' && linkPage === 'index.html')) {
        link.setAttribute('aria-current', 'page');
      }
    });

    /* ============================================================
       7. HERO IMAGE PARALLAX (desktop only)
       ============================================================ */
    const heroImg = document.querySelector('.hero__img');
    if (heroImg && window.matchMedia('(min-width: 769px)').matches &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const heroSection = heroImg.closest('.hero');
        if (heroSection) {
          const heroBottom = heroSection.getBoundingClientRect().bottom;
          if (heroBottom > 0) {
            heroImg.style.transform = `scale(1.03) translateY(${scrolled * 0.15}px)`;
          }
        }
      }, { passive: true });
    }

    /* ============================================================
       8. COUNTER ANIMATION
       ============================================================ */
    const counters = document.querySelectorAll('[data-counter]');
    if (counters.length) {
      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el     = entry.target;
            const target = parseFloat(el.dataset.counter);
            const suffix = el.dataset.suffix || '';
            const prefix = el.dataset.prefix || '';
            const dec    = target % 1 !== 0 ? 1 : 0;
            const duration = 1800;
            let start = null;

            function step(ts) {
              if (!start) start = ts;
              const progress = Math.min((ts - start) / duration, 1);
              // Ease out
              const val = progress < 1
                ? target * (1 - Math.pow(1 - progress, 3))
                : target;
              el.textContent = prefix + val.toFixed(dec) + suffix;
              if (progress < 1) requestAnimationFrame(step);
            }

            requestAnimationFrame(step);
            counterObserver.unobserve(el);
          });
        },
        { threshold: 0.5 }
      );

      counters.forEach(el => counterObserver.observe(el));
    }

    /* ============================================================
       9. NEWSLETTER FORM — simple submit handler
       ============================================================ */
    const dispatchForm = document.querySelector('.dispatch__form');
    if (dispatchForm) {
      dispatchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const input  = this.querySelector('input[type="email"]');
        const btn    = this.querySelector('button[type="submit"]');
        if (!input || !input.value) return;

        const originalText = btn.textContent;
        btn.textContent = 'Subscribed ✓';
        btn.disabled    = true;
        btn.style.background = '#2e7d52';
        input.value = '';

        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled    = false;
          btn.style.background = '';
        }, 4000);
      });
    }

    /* ============================================================
       10. CONTACT FORM — submit handler
       ============================================================ */
    document.querySelectorAll('form.contact-form').forEach(form => {
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const btn         = this.querySelector('button[type="submit"]');
        const originalTxt = btn ? btn.textContent : '';
        if (btn) {
          btn.textContent = 'Sending…';
          btn.disabled    = true;
        }

        try {
          const data = new FormData(this);
          const response = await fetch(this.action, {
            method: 'POST',
            body: data,
            headers: { 'Accept': 'application/json' }
          });

          if (response.ok) {
            this.innerHTML = `
              <div style="text-align:center;padding:3rem 1rem;">
                <div style="font-size:3rem;margin-bottom:1rem;">✓</div>
                <h3 style="font-family:'Playfair Display',serif;color:var(--dawn);margin-bottom:0.5rem;">Message Received</h3>
                <p style="color:var(--muted);">Zeeshan's team will respond within 48 hours.</p>
              </div>`;
          } else {
            throw new Error('Network error');
          }
        } catch {
          if (btn) {
            btn.textContent = originalTxt;
            btn.disabled    = false;
          }
          const errMsg = this.querySelector('.form-error');
          if (errMsg) {
            errMsg.style.display = 'block';
          }
        }
      });
    });

    /* ============================================================
       11. BOOK 3D TILT on hover
       ============================================================ */
    const book = document.querySelector('.book');
    if (book) {
      book.addEventListener('mousemove', (e) => {
        const rect = book.getBoundingClientRect();
        const x    = e.clientX - rect.left - rect.width / 2;
        const y    = e.clientY - rect.top  - rect.height / 2;
        const rotY = -(x / rect.width)  * 12;
        const rotX =  (y / rect.height) * 6;
        book.style.transform = `perspective(900px) rotateY(${rotY}deg) rotateX(${rotX}deg)`;
      });
      book.addEventListener('mouseleave', () => {
        book.style.transform = 'perspective(900px) rotateY(-10deg)';
      });
    }

    /* ============================================================
       12. PATH CARD MAGNETIC TILT
       ============================================================ */
    document.querySelectorAll('.path-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x    = e.clientX - rect.left - rect.width  / 2;
        const y    = e.clientY - rect.top  - rect.height / 2;
        const rotY = (x / rect.width)  * 6;
        const rotX = -(y / rect.height) * 4;
        card.style.transform =
          `perspective(1000px) rotateY(${rotY}deg) rotateX(${rotX}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });

  }); // end ready

})();

/* ============================================================
   EMAIL CAPTURE HANDLER
   ============================================================ */
function handleEmailCapture(event) {
  event.preventDefault();
  const email = event.target.email.value;

  // Store email (replace with your email service integration)
  console.log('Email captured:', email);

  // Show success message
  const form = event.target;
  const text = form.parentElement.querySelector('.email-capture__text');
  const sub = form.parentElement.querySelector('.email-capture__sub');

  form.innerHTML = '<p style="color:#C9A84C;font-size:1rem;text-align:center;padding:1rem;">Thanks! Check your inbox for the assessment.</p>';

  // Track conversion
  if (typeof gtag !== 'undefined') {
    gtag('event', 'generate_lead', {
      'event_category': 'form',
      'event_label': 'hero_email_capture'
    });
  }
}

/* ============================================================
   EXIT INTENT POPUP
   ============================================================ */
let exitIntentShown = false;
document.addEventListener('mouseleave', (e) => {
  if (e.clientY <= 0 && !exitIntentShown && !sessionStorage.getItem('exit_intent_shown')) {
    exitIntentShown = true;
    sessionStorage.setItem('exit_intent_shown', '1');

    // Show exit intent after slight delay
    setTimeout(() => {
      showExitIntent();
    }, 500);
  }
});

function showExitIntent() {
  // Create popup dynamically
  const popup = document.createElement('div');
  popup.id = 'exit-intent-popup';
  popup.innerHTML = `
    <div class="exit-intent-overlay" onclick="closeExitIntent()"></div>
    <div class="exit-intent-modal">
      <button class="exit-intent-close" onclick="closeExitIntent()">&times;</button>
      <span class="exit-intent-eyebrow">Before You Go</span>
      <h2 class="exit-intent-title">Get the Free<br/>Framework Guide</h2>
      <p class="exit-intent-text">Download the 8C Crisis-to-Clarity Framework — used by Fortune 500 leaders.</p>
      <form class="exit-intent-form" onsubmit="handleExitIntent(event)">
        <input type="email" name="email" placeholder="Your email" required />
        <button type="submit">Send Me the Framework</button>
      </form>
    </div>
  `;
  document.body.appendChild(popup);
  document.body.style.overflow = 'hidden';
}

function closeExitIntent() {
  const popup = document.getElementById('exit-intent-popup');
  if (popup) {
    popup.remove();
    document.body.style.overflow = '';
  }
}

function handleExitIntent(event) {
  event.preventDefault();
  const email = event.target.email.value;
  console.log('Exit intent email:', email);
  closeExitIntent();
  alert('Thanks! Check your inbox for the framework guide.');
}

/* ============================================================
   CHAT WIDGET (ClarityOS Agent Demo)
   ============================================================ */
function initChatWidget() {
  // Floating chat button
  const chatBtn = document.createElement('div');
  chatBtn.id = 'chat-widget-btn';
  chatBtn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
    <span>Try ClarityOS Agent</span>
  `;
  chatBtn.onclick = openChatWidget;
  document.body.appendChild(chatBtn);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initChatWidget);

function openChatWidget() {
  // Check if popup already exists
  let widget = document.getElementById('chat-widget-modal');

  if (!widget) {
    widget = document.createElement('div');
    widget.id = 'chat-widget-modal';
    widget.innerHTML = `
      <div class="chat-widget-overlay" onclick="closeChatWidget()"></div>
      <div class="chat-widget-content">
        <div class="chat-widget-header">
          <h3>ClarityOS Agent</h3>
          <button onclick="closeChatWidget()">&times;</button>
        </div>
        <div class="chat-widget-body" id="chat-messages">
          <div class="chat-message chat-message--bot">
            <p>I'm the ClarityOS Intelligence Node. I operate with the precision of a transformation architect.</p>
            <p style="margin-top:0.5rem;color:#888;font-size:0.8rem;">Try me: "How do I fix a failing transformation?"</p>
          </div>
        </div>
        <form class="chat-widget-input" onsubmit="handleChatSubmit(event)">
          <input type="text" id="chat-input" placeholder="Ask me anything..." />
          <button type="submit">Send</button>
        </form>
        <p class="chat-widget-footer">This is a demo. <a href="clarityos.html">Book a session</a> for full access.</p>
      </div>
    `;
    document.body.appendChild(widget);
  }

  document.body.style.overflow = 'hidden';
}

function closeChatWidget() {
  const widget = document.getElementById('chat-widget-modal');
  if (widget) {
    widget.remove();
    document.body.style.overflow = '';
  }
}

function handleChatSubmit(event) {
  event.preventDefault();
  const input = document.getElementById('chat-input');
  const message = input.value.trim();

  if (!message) return;

  // Add user message
  const messagesDiv = document.getElementById('chat-messages');
  messagesDiv.innerHTML += `
    <div class="chat-message chat-message--user">
      <p>${message}</p>
    </div>
  `;

  // Clear input
  input.value = '';

  // Simulate bot response (replace with actual API call to your ClarityOS agent)
  setTimeout(() => {
    messagesDiv.innerHTML += `
      <div class="chat-message chat-message--bot">
        <p>Crisis forces clarity that comfort never could.</p>
        <p style="margin-top:0.5rem;">This is a demo response. To unlock the full ClarityOS agent with my full capabilities, <a href="clarityos.html" style="color:#C984C;">book a $79 session</a>.</p>
      </div>
    `;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, 1000);

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
