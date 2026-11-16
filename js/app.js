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
  initSmoothScroll();
  initScrollSpy();
  initSectionNavFab();
});

/**
 * Sticky Header Scroll State
 */
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
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
 * Smooth Anchor Navigation with Offset
 */
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        e.preventDefault();
        const header = document.querySelector('.site-header');
        const headerOffset = header ? header.offsetHeight + 10 : 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * ScrollSpy: Dynamically update active navigation link with the gold underline
 */
function initScrollSpy() {
  const sectionIds = ['home', 'about', 'diagnostic', 'methodology', 'consultation'];
  const sections = sectionIds
    .map(id => ({ id, el: document.getElementById(id) }))
    .filter(item => item.el !== null);

  const navLinks = document.querySelectorAll('.nav-menu .nav-link, .mobile-drawer .nav-link');

  const setActive = (id) => {
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${id}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  const updateActiveNav = () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const header = document.querySelector('.site-header');
    const headerHeight = header ? header.offsetHeight : 80;

    // If near the very top of the page, activate Home
    if (scrollY < 120) {
      setActive('home');
      return;
    }

    // If reached bottom of the page, activate Consultation
    if ((window.innerHeight + scrollY) >= (document.documentElement.scrollHeight - 60)) {
      setActive('consultation');
      return;
    }

    // Detect section based on current viewport bounding rectangle
    let activeId = 'home';
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const rect = section.el.getBoundingClientRect();
      if (rect.top <= headerHeight + 120) {
        activeId = section.id;
        break;
      }
    }

    setActive(activeId);
  };

  // Scroll listener with passive flag
  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // Initial trigger
  updateActiveNav();

  // Instant update on click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        setActive(href.substring(1));
      }
    });
  });
}

/**
 * Floating Section Navigation FAB (Next / Prev Section Jumps)
 */
function initSectionNavFab() {
  const fab = document.getElementById('fab-section-nav');
  const btnPrev = document.getElementById('btn-fab-prev');
  const btnNext = document.getElementById('btn-fab-next');
  const indicator = document.getElementById('fab-section-indicator');

  if (!fab || !btnPrev || !btnNext) return;

  const sectionIds = ['home', 'about', 'diagnostic', 'methodology', 'consultation'];
  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(el => el !== null);

  let currentIndex = 0;

  const scrollToSection = (index) => {
    if (index < 0 || index >= sections.length) return;
    const targetEl = sections[index];
    const header = document.querySelector('.site-header');
    const headerHeight = header ? header.offsetHeight : 80;
    const targetY = targetEl.getBoundingClientRect().top + window.pageYOffset - (headerHeight - 2);

    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: 'smooth'
    });
  };

  const updateFabState = () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const header = document.querySelector('.site-header');
    const headerHeight = header ? header.offsetHeight : 80;

    let detectedIndex = 0;
    if ((window.innerHeight + scrollY) >= (document.documentElement.scrollHeight - 60)) {
      detectedIndex = sections.length - 1;
    } else {
      for (let i = sections.length - 1; i >= 0; i--) {
        const rect = sections[i].getBoundingClientRect();
        if (rect.top <= headerHeight + 140) {
          detectedIndex = i;
          break;
        }
      }
    }

    currentIndex = detectedIndex;

    // Enable/disable buttons based on position
    btnPrev.disabled = (currentIndex === 0);
    btnNext.disabled = (currentIndex === sections.length - 1);

    if (indicator) {
      indicator.textContent = `0${currentIndex + 1} / 0${sections.length}`;
    }
  };

  btnPrev.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentIndex > 0) {
      scrollToSection(currentIndex - 1);
    }
  });

  btnNext.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentIndex < sections.length - 1) {
      scrollToSection(currentIndex + 1);
    }
  });

  window.addEventListener('scroll', updateFabState, { passive: true });
  updateFabState();
}
