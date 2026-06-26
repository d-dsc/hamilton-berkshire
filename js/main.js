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
  let currentChapter = '0.0';
  let framePerspectiveActive = false;

  /* ==========================================================
     OPENING SEQUENCE
     Body is locked (overflow:hidden) until aperture dismissed.
     ========================================================== */
  document.body.classList.add('aperture-locked');

  function dismissAperture() {
    if (apertureDismissed) return;
    apertureDismissed = true;

    // Run the dismiss animation
    aperture.classList.add('dismissed');

    // Show persistent UI
    setTimeout(() => {
      frame.classList.add('visible');
      navTrigger.classList.add('visible');
      chapterIndicator.textContent = '0.1 / bearing';
      chapterIndicator.classList.add('visible');
    }, 350);

    // After animation: unlock scroll and nudge into content
    setTimeout(() => {
      document.body.classList.remove('aperture-locked');

      // Small scroll to trigger IntersectionObserver for 0.1
      const ch1 = document.getElementById('chapter-0.1');
      if (ch1) {
        ch1.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 750);

    // Remove aperture from DOM after it's fully gone
    setTimeout(() => {
      if (aperture) aperture.remove();
    }, 1200);

    // Clean up listeners
    window.removeEventListener('wheel', onFirstWheel, { passive: false });
    document.removeEventListener('touchmove', onFirstTouch, { passive: false });
  }

  function onFirstWheel(e) {
    e.preventDefault();
    dismissAperture();
  }

  function onFirstTouch(e) {
    e.preventDefault();
    dismissAperture();
  }

  // Listen for interaction (body is locked, so scroll events won't fire normally)
  window.addEventListener('wheel', onFirstWheel, { passive: false });
  document.addEventListener('touchmove', onFirstTouch, { passive: false });

  // Also dismiss on click/tap of aperture
  if (aperture) {
    aperture.addEventListener('click', dismissAperture);
  }

  // Keyboard: any key dismisses
  document.addEventListener('keydown', function onKey(e) {
    if (apertureDismissed) {
      document.removeEventListener('keydown', onKey);
      return;
    }
    dismissAperture();
  }, { once: false });

  /* ==========================================================
     CHAPTER DETECTION
     ========================================================== */
  const chapters = document.querySelectorAll('[data-chapter]');

  const chapterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const chapter = entry.target.dataset.chapter;
        const title = entry.target.dataset.title;
        currentChapter = chapter;

        if (chapterIndicator) {
          chapterIndicator.textContent = chapter + ' / ' + title;
        }

        // Frame state
        frame.classList.remove('active', 'chapter-transition', 'perspective');

        if (chapter === '0.0') {
          frame.classList.remove('visible');
        } else {
          frame.classList.add('visible');
        }

        // Perspective for ventures
        if (chapter === '0.3') {
          frame.classList.add('perspective');
          framePerspectiveActive = true;
        } else {
          framePerspectiveActive = false;
        }

        // Brief pulse
        frame.classList.add('chapter-transition');
        setTimeout(() => frame.classList.remove('chapter-transition'), 500);
      }
    });
  }, {
    threshold: 0.25,
    rootMargin: '-8% 0px -8% 0px'
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
     SCROLL-BASED FRAME PERSPECTIVE (0.3)
     ========================================================== */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        // Frame perspective
        if (framePerspectiveActive) {
          const chapter03 = document.getElementById('chapter-0.3');
          if (chapter03) {
            const rect = chapter03.getBoundingClientRect();
            const progress = Math.max(0, Math.min(1, 1 - (rect.bottom / window.innerHeight)));
            frame.style.transform = `perspective(1000px) rotateY(${progress * 1.5}deg)`;
          }
        }

        // Scroll progress bar
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
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function animateFrame() {
    if (frame.classList.contains('visible') && !framePerspectiveActive && apertureDismissed) {
      const tx = mouseX * 0.8;
      const ty = mouseY * 0.8;
      frame.style.transform = `translate(${tx}px, ${ty}px)`;
    }
    requestAnimationFrame(animateFrame);
  }
  requestAnimationFrame(animateFrame);
});
