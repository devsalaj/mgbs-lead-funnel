/**
 * ============================================================================
 * MGBS Inc. - Lead Funnel Interactive Engine
 * File: js/app.js
 * 
 * Capabilities:
 * - Mobile navigation drawer and responsive transitions
 * - Sticky header scroll elevation
 * - Animated stats counters ($550M+, 600+, 20+)
 * - Interactive "3 Ds" Diagnostic Engine with dynamic panels & form pre-fill
 * - Smooth scroll anchors & keyboard accessibility
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initProjectsDropdown();
  initStatsCounters();
  initDiagnosticEngine();
  initSectionPresentationEngine();
  initCtexModule();
});

/**
 * Sticky Header Scroll State
 */
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  // Header scroll state is maintained dynamically by the presentation engine
  window.MGBS_UpdateHeaderState = function(isScrolled) {
    if (isScrolled) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
}

/**
 * Mobile Navigation Drawer
 */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const navLinks = document.querySelectorAll('.mobile-drawer .nav-link, .mobile-drawer .btn, .mobile-drawer .mobile-project-item');

  if (!toggleBtn || !drawer) return;

  const toggleDrawer = () => {
    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
      drawer.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    } else {
      drawer.classList.add('open');
      toggleBtn.setAttribute('aria-expanded', 'true');
    }
  };

  toggleBtn.addEventListener('click', toggleDrawer);

  // Close drawer on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Close drawer on outside click
  document.addEventListener('click', (e) => {
    if (drawer.classList.contains('open') && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
      drawer.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Ongoing Projects Dashboard Popover / Dropdown
 */
function initProjectsDropdown() {
  const container = document.querySelector('.projects-dropdown-container');
  const triggerBtn = document.getElementById('btn-projects-dropdown');
  const menu = document.getElementById('projects-dropdown-menu');

  if (!container || !triggerBtn || !menu) return;

  const openDropdown = () => {
    container.classList.add('open');
    triggerBtn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
  };

  const closeDropdown = () => {
    container.classList.remove('open');
    triggerBtn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    const isOpen = container.classList.contains('open');
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  triggerBtn.addEventListener('click', toggleDropdown);

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (container.classList.contains('open') && !container.contains(e.target)) {
      closeDropdown();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && container.classList.contains('open')) {
      closeDropdown();
      triggerBtn.focus();
    }
  });

  // Close when clicking any menu link
  const menuLinks = menu.querySelectorAll('a');
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDropdown();
    });
  });
}

/**
 * Animated Social Proof Counters ($550M+, 600+, 20+)
 */
function initStatsCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  let hasAnimated = false;

  const animateValue = (el, start, end, duration, prefix = '', suffix = '') => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeProgress * (end - start) + start);
      
      const numSpan = el.querySelector('.counter-val');
      if (numSpan) {
        numSpan.textContent = current.toLocaleString();
      } else {
        el.textContent = `${prefix}${current.toLocaleString()}${suffix}`;
      }

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        statNumbers.forEach(stat => {
          const target = parseInt(stat.getAttribute('data-count'), 10);
          if (!isNaN(target)) {
            animateValue(stat, 0, target, 1800);
          }
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.hero-stats-grid');
  if (statsSection) {
    observer.observe(statsSection);
  }
}

/**
 * Interactive "3 Ds" Diagnostic Engine
 */
function initDiagnosticEngine() {
  const tabs = document.querySelectorAll('.d-tab-btn');
  const panels = document.querySelectorAll('.diagnostic-panel-content');
  const quickActionBtns = document.querySelectorAll('.btn-diagnostic-action');

  if (!tabs.length || !panels.length) return;

  // Tab switching logic
  const activateTab = (targetId) => {
    // Update tabs
    tabs.forEach(tab => {
      const isTarget = tab.getAttribute('data-target') === targetId;
      tab.classList.toggle('active', isTarget);
      tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    // Update panels
    panels.forEach(panel => {
      const isTarget = panel.getAttribute('id') === `panel-${targetId}`;
      panel.classList.toggle('active', isTarget);
    });
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');
      activateTab(targetId);
    });

    // Keyboard navigation
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = tab.nextElementSibling || tabs[0];
        next.focus();
        next.click();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = tab.previousElementSibling || tabs[tabs.length - 1];
        prev.focus();
        prev.click();
      }
    });
  });

  // Quick Action Buttons inside diagnostic panels
  quickActionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const selectedChallenge = btn.getAttribute('data-challenge');
      const challengeDropdown = document.getElementById('operational_challenge');

      if (challengeDropdown && selectedChallenge) {
        challengeDropdown.value = selectedChallenge;
        // Trigger change event for validation styling
        challengeDropdown.dispatchEvent(new Event('change'));
      }

      // Smooth scroll to consultation form
      const contactSection = document.getElementById('consultation');
      if (contactSection) {
        const headerOffset = 90;
        const elementPosition = contactSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Highlight the dropdown
        if (challengeDropdown) {
          setTimeout(() => {
            challengeDropdown.focus();
            challengeDropdown.classList.add('pulse-highlight');
            setTimeout(() => challengeDropdown.classList.remove('pulse-highlight'), 1200);
          }, 600);
        }
      }
    });
  });
}

/**
 * ============================================================================
 * Controlled Section Presentation Engine (Cinematic Chapter Flow)
 * 
 * Capabilities:
 * - Unified navigation engine across mouse wheel, FAB, header links, keys, touch
 * - Forward transitions enter from bottom (translateY 45px -> 0, opacity 0 -> 1)
 * - Backward transitions reverse smoothly (translateY -35px -> 0, opacity 0 -> 1)
 * - Adaptive internal scrolling for oversized chapters (Diagnostics, CTEx, Consult)
 * - Wheel cooldown, boundary detent & trackpad gesture protection
 * - Deep linking, hash update (replaceState) & popstate support
 * - Draggable FAB handle support with touch/pointer suppression
 * ============================================================================
 */
function initSectionPresentationEngine() {
  const sectionIds = ['home', 'about', 'diagnostic', 'methodology', 'ctex', 'consultation'];
  const chapters = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  if (chapters.length === 0) return;

  let currentIndex = 0;
  let isTransitioning = false;
  let wheelCooldownUntil = 0;
  let accumulatedOverscroll = 0;
  let overscrollDirection = null;

  const fabNav = document.getElementById('fab-unified-dock');
  const btnFabPrev = document.getElementById('btn-fab-prev');
  const btnFabNext = document.getElementById('btn-fab-next');
  const fabIndicator = document.getElementById('fab-section-indicator');
  const header = document.querySelector('.site-header');

  /**
   * Central Controller: Navigate to target chapter
   */
  function navigateToSection(targetIndex, direction, immediate = false) {
    if (targetIndex < 0 || targetIndex >= chapters.length) return;
    if (isTransitioning && !immediate) return;

    if (!direction) {
      direction = targetIndex >= currentIndex ? 'forward' : 'backward';
    }

    if (targetIndex === currentIndex && !immediate) return;

    const prevChapter = chapters[currentIndex];
    const nextChapter = chapters[targetIndex];

    isTransitioning = true;

    if (immediate) {
      chapters.forEach((ch, idx) => {
        ch.classList.toggle('active', idx === targetIndex);
        ch.classList.remove('exit-up', 'exit-down');
        ch.style.transform = '';
        ch.style.opacity = '';
        ch.setAttribute('aria-hidden', idx === targetIndex ? 'false' : 'true');
      });
      nextChapter.scrollTop = 0;
      isTransitioning = false;
    } else {
      if (direction === 'forward') {
        prevChapter.classList.remove('active');
        prevChapter.classList.add('exit-up');

        nextChapter.classList.remove('exit-up', 'exit-down');
        nextChapter.style.transform = 'translateY(45px)';
        nextChapter.style.opacity = '0';
        void nextChapter.offsetWidth; // Force layout reflow

        nextChapter.classList.add('active');
        nextChapter.style.transform = 'translateY(0)';
        nextChapter.style.opacity = '1';
        nextChapter.scrollTop = 0;
      } else {
        prevChapter.classList.remove('active');
        prevChapter.classList.add('exit-down');

        nextChapter.classList.remove('exit-up', 'exit-down');
        nextChapter.style.transform = 'translateY(-35px)';
        nextChapter.style.opacity = '0';
        void nextChapter.offsetWidth; // Force layout reflow

        nextChapter.classList.add('active');
        nextChapter.style.transform = 'translateY(0)';
        nextChapter.style.opacity = '1';

        // When entering backward into an oversized chapter, position at bottom
        if (nextChapter.scrollHeight > nextChapter.clientHeight + 10) {
          nextChapter.scrollTop = nextChapter.scrollHeight - nextChapter.clientHeight;
        } else {
          nextChapter.scrollTop = 0;
        }
      }

      setTimeout(() => {
        prevChapter.classList.remove('exit-up', 'exit-down');
        nextChapter.style.transform = '';
        nextChapter.style.opacity = '';
        isTransitioning = false;
        accumulatedOverscroll = 0;
        overscrollDirection = null;
      }, 650);
    }

    currentIndex = targetIndex;

    // Synchronize UI States
    syncPresentationUI();
  }

  // Expose global method
  window.MGBS_NavigateToSection = navigateToSection;

  /**
   * Synchronize all UI indicators, buttons, header links, and state
   */
  function syncPresentationUI() {
    // 1. Floating Section FAB Indicator
    if (fabIndicator) {
      fabIndicator.textContent = `0${currentIndex + 1} / 0${chapters.length}`;
    }

    // 2. FAB Prev / Next Buttons Disabled State
    if (btnFabPrev) btnFabPrev.disabled = (currentIndex === 0);
    if (btnFabNext) btnFabNext.disabled = (currentIndex === chapters.length - 1);

    // 3. Header & Mobile Navigation Links
    const currentId = sectionIds[currentIndex];
    document.querySelectorAll('.nav-menu .nav-link, .mobile-drawer .nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${currentId}`) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });

    // 4. Header Elevation (.scrolled) State
    if (header) {
      const activeChapter = chapters[currentIndex];
      if (currentIndex > 0 || (activeChapter && activeChapter.scrollTop > 20)) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // 5. Non-intrusive URL Hash Update
    if (window.location.hash !== `#${currentId}`) {
      try {
        history.replaceState(null, '', `#${currentId}`);
      } catch (e) {}
    }

    // 7. ARIA Attributes
    chapters.forEach((ch, idx) => {
      ch.setAttribute('aria-hidden', idx === currentIndex ? 'false' : 'true');
    });
  }

  /**
   * Mouse Wheel Navigation with Adaptive Internal Scrolling
   */
  window.addEventListener('wheel', (e) => {
    if (isTransitioning) return;
    const now = Date.now();
    if (now < wheelCooldownUntil) return;

    // Suppress wheel navigation inside inputs, textareas, selects, or interactive dropdowns
    const target = e.target;
    if (target && target.closest('input, textarea, select, [contenteditable="true"], .projects-dropdown-menu, .player-scrubber-track, .fab-dock-btn, .fab-audio-flyout')) {
      return;
    }

    const currentChapter = chapters[currentIndex];
    if (!currentChapter) return;

    const deltaY = e.deltaY;
    if (Math.abs(deltaY) < 18) return; // Filter micro-movements

    const isOverflowing = currentChapter.scrollHeight > currentChapter.clientHeight + 50;

    if (deltaY > 0) {
      // FORWARD / DOWN
      if (currentIndex >= chapters.length - 1) return;

      if (isOverflowing) {
        const atBottom = (currentChapter.scrollTop + currentChapter.clientHeight) >= (currentChapter.scrollHeight - 10);
        if (!atBottom) {
          accumulatedOverscroll = 0;
          overscrollDirection = null;
          return; // Allow natural internal scrolling down
        }

        // Reached bottom boundary: accumulate intentional overscroll resistance
        if (overscrollDirection !== 'down') {
          overscrollDirection = 'down';
          accumulatedOverscroll = 0;
        }
        accumulatedOverscroll += deltaY;

        if (accumulatedOverscroll >= 40) {
          accumulatedOverscroll = 0;
          overscrollDirection = null;
          wheelCooldownUntil = now + 700;
          navigateToSection(currentIndex + 1, 'forward');
        }
      } else {
        // Fits within viewport: immediate transition
        wheelCooldownUntil = now + 700;
        navigateToSection(currentIndex + 1, 'forward');
      }
    } else {
      // BACKWARD / UP
      if (currentIndex <= 0) return;

      if (isOverflowing) {
        const atTop = currentChapter.scrollTop <= 6;
        if (!atTop) {
          accumulatedOverscroll = 0;
          overscrollDirection = null;
          return; // Allow natural internal scrolling up
        }

        // Reached top boundary: accumulate intentional overscroll resistance
        if (overscrollDirection !== 'up') {
          overscrollDirection = 'up';
          accumulatedOverscroll = 0;
        }
        accumulatedOverscroll += deltaY;

        if (accumulatedOverscroll <= -40) {
          accumulatedOverscroll = 0;
          overscrollDirection = null;
          wheelCooldownUntil = now + 700;
          navigateToSection(currentIndex - 1, 'backward');
        }
      } else {
        // Fits within viewport: immediate transition
        wheelCooldownUntil = now + 700;
        navigateToSection(currentIndex - 1, 'backward');
      }
    }
  }, { passive: true });

  /**
   * Internal Scroll Listeners on each Chapter
   */
  chapters.forEach(ch => {
    ch.addEventListener('scroll', () => {
      // Header scrolled state
      if (header) {
        if (currentIndex > 0 || ch.scrollTop > 20) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }

      // Reset overscroll latches when moving away from edges
      const isAtEdge = (ch.scrollTop <= 6) || ((ch.scrollTop + ch.clientHeight) >= (ch.scrollHeight - 10));
      if (!isAtEdge) {
        accumulatedOverscroll = 0;
        overscrollDirection = null;
      }
    }, { passive: true });
  });

  /**
   * Keyboard Navigation
   */
  window.addEventListener('keydown', (e) => {
    if (isTransitioning) return;

    // Ignore while typing in form elements
    const activeEl = document.activeElement;
    if (activeEl && (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName) || activeEl.isContentEditable)) {
      return;
    }

    const currentChapter = chapters[currentIndex];
    const isOverflowing = currentChapter && (currentChapter.scrollHeight > currentChapter.clientHeight + 50);

    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      if (isOverflowing && (currentChapter.scrollTop + currentChapter.clientHeight) < (currentChapter.scrollHeight - 10)) {
        currentChapter.scrollBy({ top: 240, behavior: 'smooth' });
        return;
      }
      e.preventDefault();
      if (currentIndex < chapters.length - 1) {
        navigateToSection(currentIndex + 1, 'forward');
      }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      if (isOverflowing && currentChapter.scrollTop > 10) {
        currentChapter.scrollBy({ top: -240, behavior: 'smooth' });
        return;
      }
      e.preventDefault();
      if (currentIndex > 0) {
        navigateToSection(currentIndex - 1, 'backward');
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      navigateToSection(0, 'backward');
    } else if (e.key === 'End') {
      e.preventDefault();
      navigateToSection(chapters.length - 1, 'forward');
    }
  });

  /**
   * Touch & Swipe Gestures on Mobile / Tablet
   */
  let touchStartY = 0;
  let touchStartX = 0;
  let touchStartTime = 0;

  window.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    touchStartTime = Date.now();
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    if (isTransitioning || e.changedTouches.length !== 1) return;
    const touchEndY = e.changedTouches[0].clientY;
    const touchEndX = e.changedTouches[0].clientX;
    const diffY = touchStartY - touchEndY;
    const diffX = touchStartX - touchEndX;
    const elapsed = Date.now() - touchStartTime;

    if (Math.abs(diffY) < 55 || Math.abs(diffY) <= Math.abs(diffX) || elapsed > 750) return;

    const currentChapter = chapters[currentIndex];
    if (!currentChapter) return;
    const isOverflowing = currentChapter.scrollHeight > currentChapter.clientHeight + 50;

    if (diffY > 0) {
      // Swipe UP -> Next Section
      if (isOverflowing) {
        const atBottom = (currentChapter.scrollTop + currentChapter.clientHeight) >= (currentChapter.scrollHeight - 15);
        if (!atBottom) return;
      }
      if (currentIndex < chapters.length - 1) {
        navigateToSection(currentIndex + 1, 'forward');
      }
    } else {
      // Swipe DOWN -> Previous Section
      if (isOverflowing) {
        const atTop = currentChapter.scrollTop <= 15;
        if (!atTop) return;
      }
      if (currentIndex > 0) {
        navigateToSection(currentIndex - 1, 'backward');
      }
    }
  }, { passive: true });

  /**
   * Floating FAB Buttons
   */
  if (btnFabPrev) {
    btnFabPrev.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigateToSection(currentIndex - 1, 'backward');
    });
  }
  if (btnFabNext) {
    btnFabNext.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigateToSection(currentIndex + 1, 'forward');
    });
  }

  /**
   * Header Links & In-Page Section Anchor Routing
   */
  const allSectionLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  allSectionLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const targetId = href.substring(1);
      const targetIdx = sectionIds.indexOf(targetId);

      if (targetIdx !== -1) {
        e.preventDefault();
        e.stopPropagation();

        // Close mobile drawer if open
        const mobileDrawer = document.getElementById('mobile-drawer');
        const drawerOverlay = document.getElementById('drawer-overlay');
        const btnMobileMenu = document.getElementById('btn-mobile-menu');
        if (mobileDrawer && mobileDrawer.classList.contains('active')) {
          mobileDrawer.classList.remove('active');
          if (drawerOverlay) drawerOverlay.classList.remove('active');
          if (btnMobileMenu) btnMobileMenu.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }

        const dir = targetIdx >= currentIndex ? 'forward' : 'backward';
        navigateToSection(targetIdx, dir);
      }
    });
  });

  /**
   * ==========================================================================
   * Persistent, Handle-Only Dragging Engine (Section FAB & Audio Controller)
   * ==========================================================================
   */
  function makeElementDraggable(element, handles, storageKey) {
    if (!element) return;
    const handleList = (Array.isArray(handles) ? handles : [handles]).filter(Boolean);
    if (handleList.length === 0) return;
    if (element._isDraggableInitialized) return;
    element._isDraggableInitialized = true;

    const MARGIN = 12;

    function getClampedCoordinates(targetX, targetY) {
      const minX = MARGIN;
      const minY = MARGIN;
      const width = element.offsetWidth || 50;
      const height = element.offsetHeight || 50;
      const maxX = Math.max(minX, window.innerWidth - width - MARGIN);
      const maxY = Math.max(minY, window.innerHeight - height - MARGIN);
      return {
        x: Math.min(Math.max(targetX, minX), maxX),
        y: Math.min(Math.max(targetY, minY), maxY)
      };
    }

    function savePosition(x, y) {
      if (!storageKey) return;
      try {
        localStorage.setItem(storageKey, JSON.stringify({ left: Math.round(x), top: Math.round(y) }));
        element._hasCustomPos = true;
      } catch (err) {}
    }

    function restoreSavedPosition() {
      if (!storageKey) return;
      try {
        const saved = localStorage.getItem(storageKey);
        if (!saved) return;
        const parsed = JSON.parse(saved);
        if (typeof parsed.left === 'number' && typeof parsed.top === 'number' && !isNaN(parsed.left) && !isNaN(parsed.top)) {
          const clamped = getClampedCoordinates(parsed.left, parsed.top);
          element.style.left = `${clamped.x}px`;
          element.style.top = `${clamped.y}px`;
          element.style.right = 'auto';
          element.style.bottom = 'auto';
          element._hasCustomPos = true;
        }
      } catch (err) {}
    }

    restoreSavedPosition();

    let isDragging = false;
    let hasMoved = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    let activePointerId = null;
    let activeHandle = null;

    // Prevent browser native drag (e.g. dragging text/svg)
    element.addEventListener('dragstart', (e) => e.preventDefault());

    const onPointerMove = (e) => {
      if (!isDragging) return;
      if (activePointerId !== null && e.pointerId !== activePointerId) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!hasMoved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        hasMoved = true;
      }

      if (hasMoved) {
        e.preventDefault();
        const clamped = getClampedCoordinates(initialLeft + dx, initialTop + dy);
        element.style.left = `${clamped.x}px`;
        element.style.top = `${clamped.y}px`;
        element.style.right = 'auto';
        element.style.bottom = 'auto';
      }
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      if (activePointerId !== null && e.pointerId !== activePointerId) return;

      isDragging = false;
      element.classList.remove('is-dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      try {
        if (activeHandle && activePointerId !== null) {
          activeHandle.releasePointerCapture(activePointerId);
        }
      } catch (err) {}

      if (hasMoved) {
        const curLeft = parseFloat(element.style.left);
        const curTop = parseFloat(element.style.top);
        if (!isNaN(curLeft) && !isNaN(curTop)) {
          savePosition(curLeft, curTop);
        }
      }

      activePointerId = null;
      activeHandle = null;
    };

    handleList.forEach((handle) => {
      handle.style.touchAction = 'none';

      handle.addEventListener('pointerdown', (e) => {
        // If clicking on a button, input, or interactive control, let the button handle it
        if (e.target && e.target.closest('button, input, select, textarea, .fab-nav-btn, .fab-dock-btn, .fab-audio-flyout, a')) {
          return;
        }

        // Allow primary mouse button (0) or touch/pen (where button is 0 or -1)
        if (e.pointerType === 'mouse' && e.button !== 0) return;

        isDragging = true;
        hasMoved = false;
        activePointerId = e.pointerId;
        activeHandle = handle;
        startX = e.clientX;
        startY = e.clientY;

        const rect = element.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        element.style.left = `${initialLeft}px`;
        element.style.top = `${initialTop}px`;
        element.style.right = 'auto';
        element.style.bottom = 'auto';

        element.classList.add('is-dragging');
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';

        // Bind move and end to window for 60fps tracking that never drops
        window.addEventListener('pointermove', onPointerMove, { passive: false });
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);

        try {
          handle.setPointerCapture(e.pointerId);
        } catch (err) {}

        e.preventDefault();
        e.stopPropagation();
      });
    });

    element.recheckBounds = function() {
      if (!element._hasCustomPos) return;
      const rect = element.getBoundingClientRect();
      const clamped = getClampedCoordinates(rect.left, rect.top);
      element.style.left = `${clamped.x}px`;
      element.style.top = `${clamped.y}px`;
      element.style.right = 'auto';
      element.style.bottom = 'auto';
      savePosition(clamped.x, clamped.y);
    };

    let resizeTimer = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!isDragging && element._hasCustomPos) {
          element.recheckBounds();
        }
      }, 50);
    };

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });
  }

  // Initialize Unified Mega-Pill Dock dragging (Grabbing anywhere on the dock surface)
  if (fabNav) {
    makeElementDraggable(fabNav, fabNav, 'mgbs_pos_unified_dock');
  }

  // --- Auto-Minimizing Mega-Pill Dock (10-Second Inactivity Collapse) ---
  const INACTIVITY_TIMEOUT = 10000;
  let minimizeTimer = null;
  let isHoveringDock = false;

  function minimizeDock() {
    if (isHoveringDock) return;
    if (fabNav) {
      fabNav.classList.add('is-minimized');
    }
  }

  function expandDock() {
    if (fabNav) {
      fabNav.classList.remove('is-minimized');
    }
    startInactivityTimer();
  }

  function startInactivityTimer() {
    if (minimizeTimer) clearTimeout(minimizeTimer);
    if (isHoveringDock) return;
    minimizeTimer = setTimeout(minimizeDock, INACTIVITY_TIMEOUT);
  }

  function onUserActive() {
    expandDock();
  }

  if (fabNav) {
    fabNav.addEventListener('pointerenter', () => {
      isHoveringDock = true;
      if (minimizeTimer) clearTimeout(minimizeTimer);
      expandDock();
    });

    fabNav.addEventListener('pointerleave', () => {
      isHoveringDock = false;
      startInactivityTimer();
    });

    // Expand on click/tap if minimized
    fabNav.addEventListener('click', () => {
      expandDock();
    });
  }

  // Activity listeners to expand dock and refresh 10s timer
  window.addEventListener('wheel', onUserActive, { passive: true });
  window.addEventListener('scroll', onUserActive, { passive: true });
  window.addEventListener('touchmove', onUserActive, { passive: true });
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Space'].includes(e.code)) {
      onUserActive();
    }
  }, { passive: true });

  chapters.forEach((ch) => {
    ch.addEventListener('scroll', onUserActive, { passive: true });
  });

  // Start initial 10-second timer on page load
  startInactivityTimer();

  // Expose methods for testing or external hooks
  window.MGBS_ExpandDock = expandDock;
  window.MGBS_MinimizeDock = minimizeDock;

  /**
   * Deep-Linking & Browser History Navigation
   */
  const hash = window.location.hash ? window.location.hash.substring(1) : '';
  const initialIdx = sectionIds.indexOf(hash);
  if (initialIdx !== -1) {
    navigateToSection(initialIdx, 'forward', true);
  } else {
    navigateToSection(0, 'forward', true);
  }

  window.addEventListener('popstate', () => {
    const currentHash = window.location.hash ? window.location.hash.substring(1) : '';
    const targetIdx = sectionIds.indexOf(currentHash);
    if (targetIdx !== -1 && targetIdx !== currentIndex) {
      const dir = targetIdx > currentIndex ? 'forward' : 'backward';
      navigateToSection(targetIdx, dir);
    }
  });
}

/**
 * ============================================================================
 * Career Transition Excellence (CTEx) & Interactive Audio (Project 1.1)
 * ============================================================================
 */
function initCtexModule() {
  const tierSelect = document.getElementById('ctex-tier-select');
  const priceDisplay = document.getElementById('ctex-price-val');
  const headingDisplay = document.getElementById('ctex-tier-heading');
  const personaDisplay = document.getElementById('ctex-tier-persona');
  const deliverablesList = document.getElementById('ctex-deliverables-list');
  const enrollBtn = document.getElementById('ctex-enroll-btn');
  const enrollBtnText = document.getElementById('ctex-enroll-btn-text');

  // Audio elements (In-Card & Floating Controller)
  const audioElement = document.getElementById('ctex-audio-element');
  const playBtn = document.getElementById('btn-audio-play');
  const btnAudioPrev = document.getElementById('btn-audio-prev');
  const btnAudioNext = document.getElementById('btn-audio-next');
  const playIcon = document.getElementById('audio-icon-play');
  const pauseIcon = document.getElementById('audio-icon-pause');
  const timeCurrent = document.getElementById('player-time-current');
  const timeTotal = document.getElementById('player-time-total');
  const chapterActiveLabel = document.getElementById('player-chapter-active-title');
  const scrubberTrack = document.getElementById('player-scrubber-track');
  const trackFill = document.getElementById('player-track-fill');
  const chapterPills = document.querySelectorAll('.chapter-pill');

  // Floating persistent audio player elements
  // Floating persistent audio elements in Unified Mega-Pill Dock
  const fabUnifiedDock = document.getElementById('fab-unified-dock');
  const btnFabAudioPlay = document.getElementById('btn-fab-audio-play');
  const btnFabAudioPrev = document.getElementById('btn-fab-audio-prev');
  const btnFabAudioNext = document.getElementById('btn-fab-audio-next');
  const fabDockProgressFill = document.getElementById('fab-dock-progress-fill');
  const fabDockProgressFillMini = document.getElementById('fab-dock-progress-fill-mini');
  const fabAudioFlyout = document.getElementById('fab-audio-flyout');
  const fabFlyoutTitle = document.getElementById('fab-flyout-title');
  const fabFlyoutTime = document.getElementById('fab-flyout-time');

  // 7 Verified CTEx Tiers (All charm-priced ending in 69 or 99)
  const CTEX_TIERS = {
    'tier-1': {
      name: 'Resume Design Optimization',
      price: 69,
      formattedPrice: '$69',
      persona: 'Target: Job seekers & professionals needing ATS compliance and high-impact structural clarity.',
      deliverables: [
        'Full structural overhaul & ATS compliance scan',
        'Quantifiable metrics alignment (eliminating resume defects)',
        'Executive format deliverable (PDF & editable source)'
      ]
    },
    'tier-2': {
      name: 'LinkedIn Profile Optimization',
      price: 69,
      formattedPrice: '$69',
      persona: 'Target: Professionals seeking algorithmic recruiter discoverability and high-authority executive positioning.',
      deliverables: [
        'Headline, About & Experience overhaul for SEO keywords',
        'Strategic featured section curation & social proof arrangement',
        'Outreach & networking communication playbooks'
      ]
    },
    'tier-3': {
      name: 'Academic Excellence (High School, UG & PG)',
      price: 99,
      formattedPrice: '$99',
      persona: 'Target: High School, Undergraduate & Postgraduate students aiming for top-tier admissions and internships.',
      deliverables: [
        'Academic trajectory review & coursework positioning',
        'Statement of Purpose (SOP) & application essay refinement',
        'Research & extracurricular portfolio structuring'
      ]
    },
    'tier-4': {
      name: 'UG/PG Employment Success',
      price: 199,
      formattedPrice: '$199',
      persona: 'Target: Graduating students and campus placement candidates entering the competitive job market.',
      deliverables: [
        'Campus-to-corporate transition diagnostic',
        'Resume & LinkedIn synchronization tailored to target roles',
        'Mock interview preparation & behavioral question frameworks'
      ]
    },
    'tier-5': {
      name: 'Early Professional Career Success',
      price: 499,
      formattedPrice: '$499',
      persona: 'Target: Early-career professionals (1–5 years experience) seeking accelerated promotion or lateral pivot.',
      deliverables: [
        'Career trajectory diagnostic & 3-year growth roadmap',
        'Variance analysis of current skill gaps vs market demand',
        'Two 1-on-1 strategic coaching sessions with Dr. Shree',
        'Salary negotiation & compensation benchmarking tactics'
      ]
    },
    'tier-6': {
      name: 'Mid Career Transitions',
      price: 999,
      formattedPrice: '$999',
      persona: 'Target: Managers & team leads (6–15 years experience) navigating industry shifts or managerial promotions.',
      deliverables: [
        'Comprehensive DMAIC career audit & transition risk mitigation',
        'Executive leadership presence & cross-functional positioning',
        'Four 1-on-1 strategic mentorship sessions with Dr. Shree',
        'Confidential executive recruiter positioning package'
      ]
    },
    'tier-7': {
      name: 'Senior Management Career Progress',
      price: 1999,
      formattedPrice: '$1,999',
      persona: 'Target: Senior Directors, VPs & C-Suite candidates seeking high-stakes executive roles and board seats.',
      deliverables: [
        'Full executive board & advisory dossier development',
        'Executive headhunter engagement & personal branding strategy',
        'Six 1-on-1 deep advisory sessions with Dr. Shree Nanguneri, PhD',
        'Direct ongoing advisory support throughout offer & negotiation'
      ]
    }
  };

  // 4 Chapter Cue Points
  const CHAPTER_CUES = [
    { chapter: 1, title: 'Chapter 1: Six Sigma in Careers', start: 0.0, end: 26.5 },
    { chapter: 2, title: 'Chapter 2: Handling Transition Risks', start: 26.5, end: 47.83 },
    { chapter: 3, title: 'Chapter 3: Track Record & LinkedIn', start: 47.83, end: 71.74 },
    { chapter: 4, title: 'Chapter 4: Program Options & Action', start: 71.74, end: 87.84 }
  ];

  // Telemetry Event Dispatcher
  const trackCtexEvent = (eventName, payload) => {
    const record = {
      event: eventName,
      payload: payload,
      timestamp: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem('_mgbs_telemetry_events') || '[]');
      existing.push(record);
      localStorage.setItem('_mgbs_telemetry_events', JSON.stringify(existing.slice(-100)));
    } catch (e) {
      // Storage unavailable or disabled
    }

    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload);
    }

    console.log('[MGBS Telemetry]', eventName, payload);
  };

  // --- COMPONENT 1: Tier Selection Handler ---
  if (tierSelect && priceDisplay && headingDisplay && personaDisplay && deliverablesList && enrollBtn) {
    const updateTierUI = (tierKey) => {
      const tier = CTEX_TIERS[tierKey];
      if (!tier) return;

      // Update UI
      priceDisplay.textContent = tier.formattedPrice;
      headingDisplay.textContent = tier.name;
      personaDisplay.textContent = tier.persona;

      // Rebuild deliverables checklist
      deliverablesList.innerHTML = tier.deliverables.map(item => `
        <li>
          <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
          <span>${item}</span>
        </li>
      `).join('');

      // Update CTA attributes
      enrollBtn.setAttribute('data-tier', tierKey);
      enrollBtn.setAttribute('data-price', tier.price);
      enrollBtn.setAttribute('data-name', tier.name);
      if (enrollBtnText) {
        enrollBtnText.textContent = `Enroll / Sign Up to Pay — ${tier.formattedPrice}`;
      }

      // Telemetry
      trackCtexEvent('ctex_tier_selected', {
        tier_id: tierKey,
        tier_name: tier.name,
        price: tier.price
      });
    };

    tierSelect.addEventListener('change', (e) => {
      updateTierUI(e.target.value);
    });

    // CTA Click - Pre-fill Consultation Challenge Dropdown & Telemetry
    enrollBtn.addEventListener('click', (e) => {
      const selectedTierKey = enrollBtn.getAttribute('data-tier') || 'tier-1';
      const tier = CTEX_TIERS[selectedTierKey];

      trackCtexEvent('ctex_enroll_initiated', {
        tier_id: selectedTierKey,
        tier_name: tier.name,
        price: tier.price
      });

      // Pre-fill consultation challenge dropdown if present
      const challengeDropdown = document.getElementById('operational_challenge');
      if (challengeDropdown) {
        const matchingOption = Array.from(challengeDropdown.options).find(opt => 
          opt.value.includes(tier.name) || opt.value.includes(`$${tier.price}`)
        );
        if (matchingOption) {
          challengeDropdown.value = matchingOption.value;
          challengeDropdown.dispatchEvent(new Event('change'));
        }
      }
    });
  }

  // --- COMPONENT 2: Single-File Chaptered Audio Player & Floating Controller ---
  if (audioElement && playBtn && scrubberTrack && trackFill) {
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const fabPlayIcon = document.getElementById('fab-audio-icon-play');
    const fabPauseIcon = document.getElementById('fab-audio-icon-pause');

    // Initialize SVG Perimeter Progress Contours (Capsule & Mini Circle)
    let progressPerimeter = 0;
    if (fabDockProgressFill) {
      try {
        progressPerimeter = fabDockProgressFill.getTotalLength();
      } catch (err) {
        progressPerimeter = 309.08;
      }
      fabDockProgressFill.style.strokeDasharray = `${progressPerimeter}`;
      fabDockProgressFill.style.strokeDashoffset = `${progressPerimeter}`;
    }

    let progressPerimeterMini = 0;
    if (fabDockProgressFillMini) {
      try {
        progressPerimeterMini = fabDockProgressFillMini.getTotalLength();
      } catch (err) {
        progressPerimeterMini = 131.95;
      }
      fabDockProgressFillMini.style.strokeDasharray = `${progressPerimeterMini}`;
      fabDockProgressFillMini.style.strokeDashoffset = `${progressPerimeterMini}`;
    }

    const setPlayState = (isPlaying) => {
      // In-Card Play/Pause Button State
      playBtn.classList.toggle('is-playing', isPlaying);
      if (isPlaying) {
        if (playIcon) playIcon.classList.add('d-none');
        if (pauseIcon) pauseIcon.classList.remove('d-none');
        playBtn.setAttribute('aria-label', 'Pause Audio');
      } else {
        if (playIcon) playIcon.classList.remove('d-none');
        if (pauseIcon) pauseIcon.classList.add('d-none');
        playBtn.setAttribute('aria-label', 'Play Audio');
      }

      // Unified Mega-Pill Dock Play/Pause State
      if (btnFabAudioPlay) {
        btnFabAudioPlay.classList.toggle('is-playing', isPlaying);
        if (isPlaying) {
          if (fabPlayIcon) fabPlayIcon.classList.add('d-none');
          if (fabPauseIcon) fabPauseIcon.classList.remove('d-none');
          btnFabAudioPlay.setAttribute('aria-label', 'Pause Audio');
        } else {
          if (fabPlayIcon) fabPlayIcon.classList.remove('d-none');
          if (fabPauseIcon) fabPauseIcon.classList.add('d-none');
          btnFabAudioPlay.setAttribute('aria-label', 'Play Audio');
        }
      }

      // Unified Mega-Pill Pulse & Status State
      if (fabUnifiedDock) {
        fabUnifiedDock.classList.toggle('is-playing', isPlaying);
      }
    };

    const togglePlay = () => {
      if (audioElement.paused) {
        audioElement.play().then(() => {
          setPlayState(true);
          trackCtexEvent('ctex_audio_play', { currentTime: audioElement.currentTime });
        }).catch(err => {
          console.warn('Playback error:', err);
        });
      } else {
        audioElement.pause();
        setPlayState(false);
        trackCtexEvent('ctex_audio_pause', { currentTime: audioElement.currentTime });
      }
    };

    const getCurrentChapterIndex = () => {
      const cur = audioElement.currentTime;
      const idx = CHAPTER_CUES.findIndex(ch => cur >= ch.start && cur < ch.end);
      return idx >= 0 ? idx : 0;
    };

    const seekToChapter = (chapterIndex) => {
      if (chapterIndex < 0 || chapterIndex >= CHAPTER_CUES.length) return;
      const ch = CHAPTER_CUES[chapterIndex];
      audioElement.currentTime = ch.start;
      if (audioElement.paused) {
        audioElement.play().catch(() => {});
      }
      chapterPills.forEach(p => p.classList.remove('active'));
      const activePill = document.querySelector(`.chapter-pill[data-chapter="${ch.chapter}"]`);
      if (activePill) activePill.classList.add('active');

      trackCtexEvent('ctex_audio_chapter_seek', {
        chapter: ch.chapter,
        timestamp: ch.start,
        title: ch.title
      });
    };

    const skipToNextChapter = () => {
      const currentIdx = getCurrentChapterIndex();
      if (currentIdx < CHAPTER_CUES.length - 1) {
        seekToChapter(currentIdx + 1);
      } else {
        seekToChapter(0);
      }
    };

    const skipToPrevChapter = () => {
      const cur = audioElement.currentTime;
      const currentIdx = getCurrentChapterIndex();
      if (cur - CHAPTER_CUES[currentIdx].start > 2.5) {
        audioElement.currentTime = CHAPTER_CUES[currentIdx].start;
      } else if (currentIdx > 0) {
        seekToChapter(currentIdx - 1);
      } else {
        audioElement.currentTime = 0;
      }
    };

    // Attach Play / Pause Listeners
    playBtn.addEventListener('click', togglePlay);
    if (btnFabAudioPlay) {
      btnFabAudioPlay.addEventListener('click', togglePlay);
    }

    // Attach Previous / Next Listeners (Card & Unified Mega-Pill Dock)
    if (btnAudioPrev) btnAudioPrev.addEventListener('click', skipToPrevChapter);
    if (btnAudioNext) btnAudioNext.addEventListener('click', skipToNextChapter);
    if (btnFabAudioPrev) btnFabAudioPrev.addEventListener('click', skipToPrevChapter);
    if (btnFabAudioNext) btnFabAudioNext.addEventListener('click', skipToNextChapter);

    // Click on hover flyout to smoothly navigate to #ctex chapter details
    if (fabAudioFlyout) {
      fabAudioFlyout.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof window.MGBS_NavigateToSection === 'function') {
          window.MGBS_NavigateToSection(4);
        } else {
          const ctexSection = document.getElementById('ctex');
          if (ctexSection) {
            ctexSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    }

    audioElement.addEventListener('play', () => setPlayState(true));
    audioElement.addEventListener('pause', () => setPlayState(false));
    audioElement.addEventListener('ended', () => {
      setPlayState(false);
      trackFill.style.width = '0%';
      if (fabDockProgressFill && progressPerimeter > 0) {
        fabDockProgressFill.style.strokeDashoffset = `${progressPerimeter}`;
      }
      if (fabDockProgressFillMini && progressPerimeterMini > 0) {
        fabDockProgressFillMini.style.strokeDashoffset = `${progressPerimeterMini}`;
      }
      if (timeCurrent) timeCurrent.textContent = '00:00';
      const dur = audioElement.duration || 87.84;
      if (fabFlyoutTime) fabFlyoutTime.textContent = `00:00 / ${formatTime(dur)}`;
      trackCtexEvent('ctex_audio_completed', {});
    });

    audioElement.addEventListener('loadedmetadata', () => {
      if (timeTotal && audioElement.duration) {
        timeTotal.textContent = formatTime(audioElement.duration);
      }
      if (fabFlyoutTime && audioElement.duration) {
        fabFlyoutTime.textContent = `00:00 / ${formatTime(audioElement.duration)}`;
      }
    });

    // Timeupdate sync for scrubber bar, perimeter progress, flyout time readouts, and chapter highlights
    audioElement.addEventListener('timeupdate', () => {
      const cur = audioElement.currentTime;
      const dur = audioElement.duration || 87.84;

      if (timeCurrent) {
        timeCurrent.textContent = formatTime(cur);
      }

      const pct = Math.min(100, Math.max(0, (cur / dur) * 100));
      trackFill.style.width = `${pct}%`;

      // Find active chapter
      const activeChapter = CHAPTER_CUES.find(ch => cur >= ch.start && cur < ch.end) || CHAPTER_CUES[0];

      if (chapterActiveLabel && activeChapter) {
        chapterActiveLabel.textContent = activeChapter.title;
      }

      // Sync Unified Dock Flyout Readouts & Perimeter Progress (Capsule & Mini Circle)
      if (fabFlyoutTime) {
        fabFlyoutTime.textContent = `${formatTime(cur)} / ${formatTime(dur)}`;
      }
      if (fabFlyoutTitle && activeChapter) {
        fabFlyoutTitle.textContent = activeChapter.title;
      }
      if (fabDockProgressFill && progressPerimeter > 0) {
        const offset = progressPerimeter * (1 - (pct / 100));
        fabDockProgressFill.style.strokeDashoffset = `${offset}`;
      }
      if (fabDockProgressFillMini && progressPerimeterMini > 0) {
        const offsetMini = progressPerimeterMini * (1 - (pct / 100));
        fabDockProgressFillMini.style.strokeDashoffset = `${offsetMini}`;
      }

      // Highlight active chapter pill
      chapterPills.forEach(pill => {
        const chNum = parseInt(pill.getAttribute('data-chapter'), 10);
        if (activeChapter && chNum === activeChapter.chapter) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });
    });

    // Click on In-Card Scrubber Track to Seek
    scrubberTrack.addEventListener('click', (e) => {
      const rect = scrubberTrack.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      const dur = audioElement.duration || 87.84;
      audioElement.currentTime = pct * dur;
      if (audioElement.paused) {
        audioElement.play().catch(() => {});
      }
      trackCtexEvent('ctex_audio_scrub', { targetTime: audioElement.currentTime, source: 'card_scrubber' });
    });

    // Chapter Pill Click Seeking
    chapterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const startSec = parseFloat(pill.getAttribute('data-start') || '0');
        const chNum = pill.getAttribute('data-chapter');

        audioElement.currentTime = startSec;
        audioElement.play().catch(() => {});

        chapterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        trackCtexEvent('ctex_audio_chapter_seek', {
          chapter: chNum,
          timestamp: startSec
        });
      });
    });
  }
}
