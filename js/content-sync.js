/**
 * ============================================================================
 * MGBS Inc. - Headless CMS Content Synchronizer (Google Sheets Live Sync)
 * File: js/content-sync.js
 * 
 * Capabilities:
 * - 0ms Instant Cold Start: Loads cached text from localStorage immediately
 * - Stale-While-Revalidate: Background fetch to Google Apps Script endpoint
 * - Zero-loss fallback: Preserves static HTML defaults if offline or network lag
 * - Dynamic attribute mapping via [data-content-key]
 * ============================================================================
 */

(function () {
  const CONTENT_CACHE_KEY = 'mgbs_website_content_cache';
  const ENDPOINT = "https://script.google.com/macros/s/AKfycbz7LoJa8i_6quvvuMvnjRXn2cHOYFQKNgzPRuCSuPCT8Sj7TGshYGc29qXu7ayFbeVX3g/exec";

  /**
   * Apply content dictionary to DOM elements with [data-content-key]
   */
  function applyContent(content) {
    if (!content || typeof content !== 'object') return;

    const elements = document.querySelectorAll('[data-content-key]');
    elements.forEach(el => {
      const key = el.getAttribute('data-content-key');
      const val = content[key];
      if (val && typeof val === 'string' && val.trim() !== '') {
        const trimmedVal = val.trim();
        // If element contains structured inner HTML tags like <br> or <strong>, support safe HTML
        if (trimmedVal.indexOf('<') !== -1 && trimmedVal.indexOf('>') !== -1) {
          if (el.innerHTML !== trimmedVal) {
            el.innerHTML = trimmedVal;
          }
        } else {
          if (el.textContent.trim() !== trimmedVal) {
            el.textContent = trimmedVal;
          }
        }
      }
    });
  }

  /**
   * Initialize instant cache restoration
   */
  function initCachedContent() {
    try {
      const cached = localStorage.getItem(CONTENT_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.content) {
          applyContent(parsed.content);
        }
      }
    } catch (e) {
      console.warn('[ContentSync] Cache read error:', e);
    }
  }

  /**
   * Asynchronously fetch latest content from Google Apps Script / Google Sheets
   */
  function fetchRemoteContent() {
    const url = `${ENDPOINT}?action=get_content&t=${Date.now()}`;

    fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (data && data.status === 'success' && data.content) {
        applyContent(data.content);
        try {
          localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(data));
        } catch (storageErr) {
          console.warn('[ContentSync] Cache write warning:', storageErr);
        }
      }
    })
    .catch(err => {
      // Graceful offline degradation - static HTML remains intact
      console.info('[ContentSync] Background sync notice (using cached/static text):', err.message);
    });
  }

  // Restore cached content immediately on DOM parse
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initCachedContent();
      fetchRemoteContent();
    });
  } else {
    initCachedContent();
    fetchRemoteContent();
  }

  // Expose global helper for manual refresh / testing
  window.MGBSContentSync = {
    refresh: fetchRemoteContent,
    apply: applyContent
  };
})();
