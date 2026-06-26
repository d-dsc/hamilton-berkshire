/* ============================================================
   HAMILTON BERKSHIRE | Frame System Controller
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const aperture = document.querySelector('.aperture');
  const frame = document.querySelector('.frame');
  const navTrigger = document.querySelector('.nav-trigger');
  const chapterIndicator = document.querySelector('.chapter-indicator');
  const navOverlay = document.querySelector('.nav-overlay');
  const navClose = document.querySelector('.nav-close');
  const navLinks = document.querySelectorAll('.nav-chapters a');
  const scrollProgress = document.querySelector('.scroll-progress');

  let apertureDismissed = false;
  let framePerspectiveActive = false;

  /* ==========================================================
     OPENING SEQUENCE
     Aperture is a fixed overlay. Scroll/touch fades it out.
     No body locking — page is always scrollable underneath.
     ========================================================== */
  function dismissAperture() {
    if (apertureDismissed) return;
    apertureDismissed = true;

    aperture.classList.add('dismissed');

    // Show persistent UI quickly
    setTimeout(() => {
      frame.classList.add('visible');
      navTrigger.classList.add('visible');
      chapterIndicator.textContent = '0.1 / bearing';
      chapterIndicator.classList.add('visible');
    }, 250);

    // Remove aperture from DOM
    setTimeout(() => {
      if (aperture) aperture.remove();
    }, 600);

    // Clean up
    window.removeEventListener('wheel', onFirstWheel, { passive: false });
    document.removeEventListener('touchmove', onFirstTouch, { passive: false });
  }

  function onFirstWheel(e) {
    e.preventDefault();
    dismissAperture();
  }

  function onFirstTouch(e) {
    // Only dismiss if scrolling down (not up) to avoid accidental dismissal
    dismissAperture();
  }

  // Listen for scroll/touch on the aperture
  window.addEventListener('wheel', onFirstWheel, { passive: false });
  document.addEventListener('touchstart', dismissAperture, { passive: true, once: true });
  document.addEventListener('touchmove', onFirstTouch, { passive: false });

  // Click/tap dismisses
  if (aperture) {
    aperture.addEventListener('click', dismissAperture);
  }

  // Any key dismisses
  document.addEventListener('keydown', function onKey() {
    if (!apertureDismissed) dismissAperture();
  });

  /* ==========================================================
     CHAPTER DETECTION
     ========================================================== */
  const chapters = document.querySelectorAll('[data-chapter]');

  const chapterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const chapter = entry.target.dataset.chapter;
        const title = entry.target.dataset.title;

        if (chapterIndicator) {
          chapterIndicator.textContent = chapter + ' / ' + title;
        }

        frame.classList.remove('active', 'chapter-transition', 'perspective');

        if (chapter === '0.0') {
          frame.classList.remove('visible');
        } else {
          frame.classList.add('visible');
        }

        if (chapter === '0.3') {
          frame.classList.add('perspective');
          framePerspectiveActive = true;
        } else {
          framePerspectiveActive = false;
        }

        frame.classList.add('chapter-transition');
        setTimeout(() => frame.classList.remove('chapter-transition'), 500);
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '-5% 0px -5% 0px'
  });

  chapters.forEach(ch => chapterObserver.observe(ch));

  /* ==========================================================
     NAVIGATION OVERLAY
     ========================================================== */
  function openNav() {
    navOverlay.classList.add('open');
    navOverlay.setAttribute('aria-hidden', 'false');
    navTrigger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    navOverlay.classList.remove('open');
    navOverlay.setAttribute('aria-hidden', 'true');
    navTrigger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (navTrigger) {
    navTrigger.addEventListener('click', () => {
      navOverlay.classList.contains('open') ? closeNav() : openNav();
    });
  }

  if (navClose) navClose.addEventListener('click', closeNav);

  navLinks.forEach(link => {
    link.addEventListener('click', () => setTimeout(closeNav, 300));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navOverlay.classList.contains('open')) closeNav();
  });

  navOverlay.addEventListener('click', (e) => {
    if (e.target === navOverlay) closeNav();
  });

  /* ==========================================================
     MODE EXPANSIONS (0.2)
     ========================================================== */
  document.querySelectorAll('.mode-expand').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const detail = document.getElementById(targetId);
      const isOpen = detail.classList.contains('open');

      document.querySelectorAll('.mode-detail.open').forEach(d => {
        if (d !== detail) {
          d.classList.remove('open');
          const otherBtn = document.querySelector(`[data-target="${d.id}"]`);
          if (otherBtn) { otherBtn.classList.remove('open'); otherBtn.setAttribute('aria-expanded', 'false'); }
        }
      });

      if (isOpen) {
        detail.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        detail.classList.add('open');
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ==========================================================
     STEP EXPANSIONS (0.4)
     ========================================================== */
  document.querySelectorAll('.step-expand').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const detail = document.getElementById(targetId);
      const isOpen = detail.classList.contains('open');

      if (isOpen) {
        detail.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        detail.classList.add('open');
        btn.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ==========================================================
     SCROLL PROGRESS + FRAME PERSPECTIVE
     ========================================================== */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (framePerspectiveActive) {
          const chapter03 = document.getElementById('chapter-0.3');
          if (chapter03) {
            const rect = chapter03.getBoundingClientRect();
            const progress = Math.max(0, Math.min(1, 1 - (rect.bottom / window.innerHeight)));
            frame.style.transform = `perspective(1000px) rotateY(${progress * 1.5}deg)`;
          }
        }

        if (scrollProgress && apertureDismissed) {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          scrollProgress.style.width = progress + '%';
          if (progress > 0.5) {
            scrollProgress.classList.add('visible');
          } else {
            scrollProgress.classList.remove('visible');
          }
        }

        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* ==========================================================
     MOUSE-RESPONSIVE FRAME
     ========================================================== */
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function animateFrame() {
    if (frame.classList.contains('visible') && !framePerspectiveActive && apertureDismissed) {
      frame.style.transform = `translate(${mouseX * 0.8}px, ${mouseY * 0.8}px)`;
    }
    requestAnimationFrame(animateFrame);
  }
  requestAnimationFrame(animateFrame);
});
