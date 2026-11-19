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
  initCtexModule();
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
  const sectionIds = ['home', 'about', 'diagnostic', 'methodology', 'ctex', 'consultation'];
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

  const sectionIds = ['home', 'about', 'diagnostic', 'methodology', 'ctex', 'consultation'];
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

  // Floating persistent audio mini-player elements
  const fabAudioController = document.getElementById('fab-audio-controller');
  const fabAudioMiniView = document.getElementById('fab-audio-mini-view');
  const btnFabMiniToggle = document.getElementById('btn-fab-mini-toggle');
  const btnFabMiniEnlarge = document.getElementById('btn-fab-mini-enlarge');
  const btnFabAudioMinimize = document.getElementById('btn-fab-audio-minimize');
  const btnFabAudioClose = document.getElementById('btn-fab-audio-close');
  const btnFabAudioPlay = document.getElementById('btn-fab-audio-play');
  const btnFabAudioPrev = document.getElementById('btn-fab-audio-prev');
  const btnFabAudioNext = document.getElementById('btn-fab-audio-next');
  const fabAudioChapterTitle = document.getElementById('fab-audio-chapter-title');
  const fabAudioTimeReadout = document.getElementById('fab-audio-time-readout');
  const fabAudioTrack = document.getElementById('fab-audio-track');
  const fabAudioTrackFill = document.getElementById('fab-audio-track-fill');
  const fabAudioInfoWrap = document.querySelector('.fab-audio-info-wrap');

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

      // Floating Mini-Player Play/Pause State
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

      // Floating Mini-Player Visibility & Pulse State
      if (fabAudioController) {
        fabAudioController.classList.toggle('is-playing', isPlaying);
        if (isPlaying) {
          fabAudioController.classList.add('is-visible');
          fabAudioController.setAttribute('aria-hidden', 'false');
        }
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

    // Attach Previous / Next Listeners (Card & Floating Controller)
    if (btnAudioPrev) btnAudioPrev.addEventListener('click', skipToPrevChapter);
    if (btnAudioNext) btnAudioNext.addEventListener('click', skipToNextChapter);
    if (btnFabAudioPrev) btnFabAudioPrev.addEventListener('click', skipToPrevChapter);
    if (btnFabAudioNext) btnFabAudioNext.addEventListener('click', skipToNextChapter);

    // Minimize Button: Collapses floating player to smaller size button (audio continues)
    if (btnFabAudioMinimize) {
      btnFabAudioMinimize.addEventListener('click', (e) => {
        e.stopPropagation();
        btnFabAudioMinimize.blur();
        if (fabAudioController) {
          fabAudioController.classList.add('is-minimized');
          trackCtexEvent('ctex_floating_audio_minimized', {});
        }
      });
    }

    // Close Button: Stops the audio player altogether and dismisses the floating controller
    if (btnFabAudioClose) {
      btnFabAudioClose.addEventListener('click', (e) => {
        e.stopPropagation();
        btnFabAudioClose.blur();
        audioElement.pause();
        setPlayState(false);
        if (fabAudioController) {
          fabAudioController.classList.remove('is-visible', 'is-minimized');
          fabAudioController.setAttribute('aria-hidden', 'true');
        }
        trackCtexEvent('ctex_floating_audio_closed_stop', {
          currentTime: audioElement.currentTime
        });
      });
    }

    // Enlarge Button (on smaller size button): Expands back to full floating player
    if (btnFabMiniEnlarge) {
      btnFabMiniEnlarge.addEventListener('click', (e) => {
        e.stopPropagation();
        btnFabMiniEnlarge.blur();
        if (fabAudioController) {
          fabAudioController.classList.remove('is-minimized');
          trackCtexEvent('ctex_floating_audio_enlarged', {});
        }
      });
    }

    // Minimized Bubble Play/Pause Toggle
    if (btnFabMiniToggle) {
      btnFabMiniToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay();
      });
    }

    // Scrolling automatically minimizes the full controller to the smaller size button
    let lastAudioScrollY = window.pageYOffset || document.documentElement.scrollTop;
    window.addEventListener('scroll', () => {
      const currentY = window.pageYOffset || document.documentElement.scrollTop;
      if (Math.abs(currentY - lastAudioScrollY) > 25) {
        if (fabAudioController && fabAudioController.classList.contains('is-visible') && !fabAudioController.classList.contains('is-minimized')) {
          fabAudioController.classList.add('is-minimized');
        }
        lastAudioScrollY = currentY;
      }
    }, { passive: true });

    // Click on floating title to smoothly scroll down to #ctex section
    if (fabAudioInfoWrap) {
      fabAudioInfoWrap.addEventListener('click', () => {
        const ctexSection = document.getElementById('ctex');
        if (ctexSection) {
          ctexSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    audioElement.addEventListener('play', () => setPlayState(true));
    audioElement.addEventListener('pause', () => setPlayState(false));
    audioElement.addEventListener('ended', () => {
      setPlayState(false);
      trackFill.style.width = '0%';
      if (fabAudioTrackFill) fabAudioTrackFill.style.width = '0%';
      if (timeCurrent) timeCurrent.textContent = '00:00';
      const dur = audioElement.duration || 87.84;
      if (fabAudioTimeReadout) fabAudioTimeReadout.textContent = `00:00 / ${formatTime(dur)}`;
      if (fabAudioController) {
        fabAudioController.classList.remove('is-visible', 'is-minimized');
        fabAudioController.setAttribute('aria-hidden', 'true');
      }
      trackCtexEvent('ctex_audio_completed', {});
    });

    audioElement.addEventListener('loadedmetadata', () => {
      if (timeTotal && audioElement.duration) {
        timeTotal.textContent = formatTime(audioElement.duration);
      }
      if (fabAudioTimeReadout && audioElement.duration) {
        fabAudioTimeReadout.textContent = `00:00 / ${formatTime(audioElement.duration)}`;
      }
    });

    // Timeupdate sync for scrubber bar, floating mini-player, time readouts, and chapter highlights
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

      // Sync Floating Mini-Player Readouts
      if (fabAudioTimeReadout) {
        fabAudioTimeReadout.textContent = `${formatTime(cur)} / ${formatTime(dur)}`;
      }
      if (fabAudioTrackFill) {
        fabAudioTrackFill.style.width = `${pct}%`;
      }
      if (fabAudioChapterTitle && activeChapter) {
        fabAudioChapterTitle.textContent = activeChapter.title;
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

    // Click on Floating Mini-Player Track to Seek
    if (fabAudioTrack) {
      fabAudioTrack.addEventListener('click', (e) => {
        const rect = fabAudioTrack.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, clickX / rect.width));
        const dur = audioElement.duration || 87.84;
        audioElement.currentTime = pct * dur;
        if (audioElement.paused) {
          audioElement.play().catch(() => {});
        }
        trackCtexEvent('ctex_audio_scrub', { targetTime: audioElement.currentTime, source: 'fab_scrubber' });
      });
    }

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
