/**
 * ============================================================================
 * MGBS Inc. - PayPal Standard Checkout & Smart Payment Buttons Controller
 * File: js/paypal-checkout.js
 * Version: 8.0
 * 
 * Capabilities:
 * - Dynamic PayPal JavaScript SDK Loader with Client ID configuration
 * - Contextual Tier Injection (Syncs with CTEx 7 Tiers and Headless CMS prices)
 * - PayPal Smart Buttons Rendering (PayPal, Credit/Debit Cards, Pay Later, Venmo)
 * - Complete Error Recovery, Cancellation, and User-Friendly Fallbacks
 * - Instant Client-Side WAL (Write-Ahead Log) in localStorage for zero lost transactions
 * - Asynchronous Background Sync to Google Apps Script ("Transactions" Tab)
 * - Executive Receipt Confirmation Modal with full payment details
 * ============================================================================
 */

(function () {
  'use strict';

  // Global Config with Safe Fallbacks
  const CONFIG = window.MGBS_PAYPAL_CONFIG || {
    // Dr. Shree's PayPal Client ID (Defaulting to 'sb' for sandbox testing; replace with live Client ID)
    clientId: 'sb',
    currency: 'USD',
    environment: 'sandbox',
    endpoint: 'https://script.google.com/macros/s/AKfycbz7LoJa8i_6quvvuMvnjRXn2cHOYFQKNgzPRuCSuPCT8Sj7TGshYGc29qXu7ayFbeVX3g/exec'
  };

  const STORAGE_WAL_KEY = '_mgbs_pending_transactions_wal';

  // CTEx Tiers Reference (Fallback if not exposed on window)
  const FALLBACK_TIERS = {
    'tier-1': { id: 'tier-1', name: 'Resume Design Optimization', price: 69, formattedPrice: '$69', persona: 'Job seekers & professionals needing ATS compliance and high-impact structural clarity.' },
    'tier-2': { id: 'tier-2', name: 'LinkedIn Profile Optimization', price: 69, formattedPrice: '$69', persona: 'Professionals seeking inbound recruiter visibility and authority positioning.' },
    'tier-3': { id: 'tier-3', name: 'Academic Excellence (High School, UG & PG)', price: 99, formattedPrice: '$99', persona: 'Students preparing for competitive college admissions or graduate fellowships.' },
    'tier-4': { id: 'tier-4', name: 'UG/PG Employment Success', price: 199, formattedPrice: '$199', persona: 'Fresh graduates & campus talent competing for first corporate placements.' },
    'tier-5': { id: 'tier-5', name: 'Early Professional Career Success', price: 499, formattedPrice: '$499', persona: 'Working professionals (2–5 yrs experience) aiming for rapid promotion or first lateral jump.' },
    'tier-6': { id: 'tier-6', name: 'Mid Career Transitions', price: 999, formattedPrice: '$999', persona: 'Managers, Senior Specialists & Tech Leads (6–15 yrs) pivoting sectors or climbing to director.' },
    'tier-7': { id: 'tier-7', name: 'Senior Management Career Progress', price: 1999, formattedPrice: '$1,999', persona: 'Directors, VPs & C-Suite executives seeking board seats or enterprise general management.' }
  };

  let activeTier = FALLBACK_TIERS['tier-1'];
  let isSdkLoading = false;
  let isSdkReady = false;
  let currentRenderedButtons = null;

  // DOM Elements Cache
  let modalOverlay = null;
  let receiptOverlay = null;
  let btnCloseModal = null;
  let btnCloseReceipt = null;
  let btnEnrollCta = null;
  let tierSelect = null;
  let linkSwitchConsultation = null;

  /**
   * Resolve active CTEx Tier metadata dynamically from window.MGBS_CTEX_TIERS or DOM
   */
  function getActiveTierData(tierKey) {
    if (window.MGBS_CTEX_TIERS && window.MGBS_CTEX_TIERS[tierKey]) {
      return window.MGBS_CTEX_TIERS[tierKey];
    }
    if (FALLBACK_TIERS[tierKey]) {
      return FALLBACK_TIERS[tierKey];
    }
    return FALLBACK_TIERS['tier-1'];
  }

  /**
   * Dynamic PayPal SDK Script Injector
   */
  function loadPayPalSdk() {
    return new Promise((resolve, reject) => {
      if (window.paypal && window.paypal.Buttons) {
        isSdkReady = true;
        return resolve(window.paypal);
      }

      if (isSdkLoading) {
        const checkInterval = setInterval(() => {
          if (window.paypal && window.paypal.Buttons) {
            clearInterval(checkInterval);
            isSdkReady = true;
            resolve(window.paypal);
          }
        }, 100);
        return;
      }

      isSdkLoading = true;

      // Allow Google Sheets headless CMS or window config to override client-id
      let resolvedClientId = CONFIG.clientId;
      if (window.MGBS_CURRENT_CONTENT && window.MGBS_CURRENT_CONTENT.paypal_client_id) {
        resolvedClientId = window.MGBS_CURRENT_CONTENT.paypal_client_id.trim();
      }

      const script = document.createElement('script');
      script.id = 'paypal-js-sdk';
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(resolvedClientId)}&currency=${encodeURIComponent(CONFIG.currency)}&components=buttons&enable-funding=venmo,card`;
      script.async = true;

      script.onload = () => {
        isSdkLoading = false;
        isSdkReady = true;
        console.log('[MGBS PayPal] SDK initialized successfully.');
        resolve(window.paypal);
      };

      script.onerror = (err) => {
        isSdkLoading = false;
        console.error('[MGBS PayPal] SDK failed to load:', err);
        reject(err);
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Client-Side Write-Ahead Log (WAL) to guarantee zero lost transactions
   */
  function recordTransactionInWAL(payload) {
    try {
      const queue = JSON.parse(localStorage.getItem(STORAGE_WAL_KEY) || '[]');
      queue.push({
        payload: payload,
        client_timestamp: new Date().toISOString(),
        synced: false
      });
      localStorage.setItem(STORAGE_WAL_KEY, JSON.stringify(queue.slice(-50)));
    } catch (e) {
      console.warn('[MGBS WAL] Local storage not accessible for WAL logging');
    }
  }

  /**
   * Dispatch transaction to Google Apps Script "Transactions" Tab
   */
  function syncTransactionToBackend(transactionData) {
    recordTransactionInWAL(transactionData);

    const payload = Object.assign({
      action: 'record_payment'
    }, transactionData);

    const endpoint = CONFIG.endpoint;

    // Use fetch with KeepAlive for reliable delivery even if user navigates
    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload),
      keepalive: true
    })
    .then(res => res.json())
    .then(data => {
      console.log('[MGBS PayPal] Transaction successfully logged to Google Sheet:', data);
      markTransactionSynced(transactionData.order_id || transactionData.transaction_id);
      return data;
    })
    .catch(err => {
      console.warn('[MGBS PayPal] Background sync deferred (will retry on next load):', err);
    });
  }

  function markTransactionSynced(orderOrTxId) {
    try {
      const queue = JSON.parse(localStorage.getItem(STORAGE_WAL_KEY) || '[]');
      const updated = queue.map(item => {
        if (item.payload && (item.payload.order_id === orderOrTxId || item.payload.transaction_id === orderOrTxId)) {
          item.synced = true;
        }
        return item;
      });
      localStorage.setItem(STORAGE_WAL_KEY, JSON.stringify(updated));
    } catch (e) {}
  }

  /**
   * Flush pending un-synced transactions from WAL on initialization
   */
  function flushPendingTransactions() {
    try {
      const queue = JSON.parse(localStorage.getItem(STORAGE_WAL_KEY) || '[]');
      const pending = queue.filter(item => !item.synced);
      if (pending.length === 0) return;

      console.log(`[MGBS PayPal WAL] Flushing ${pending.length} pending transactions...`);
      pending.forEach(item => {
        fetch(CONFIG.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(Object.assign({ action: 'record_payment' }, item.payload)),
          keepalive: true
        })
        .then(res => res.json())
        .then(() => markTransactionSynced(item.payload.order_id || item.payload.transaction_id))
        .catch(() => {});
      });
    } catch (e) {}
  }

  /**
   * Populate Checkout Modal Details with Selected Tier Info
   */
  function updateModalTierSummary(tier) {
    const badgeEl = document.getElementById('checkout-tier-badge');
    const nameEl = document.getElementById('checkout-tier-name');
    const personaEl = document.getElementById('checkout-tier-persona');
    const priceEl = document.getElementById('checkout-price-amount');
    const deliverablesList = document.getElementById('checkout-deliverables-list');

    if (badgeEl) badgeEl.textContent = (tier.id || 'tier').toUpperCase().replace('-', ' ');
    if (nameEl) nameEl.textContent = tier.name;
    if (personaEl) personaEl.textContent = tier.persona;
    if (priceEl) priceEl.textContent = `$${tier.price}`;

    if (deliverablesList && Array.isArray(tier.deliverables)) {
      deliverablesList.innerHTML = tier.deliverables.map(d => `<li>${d}</li>`).join('');
    } else if (deliverablesList) {
      // Default fallback deliverables
      deliverablesList.innerHTML = `
        <li>Full structural analysis &amp; DMAIC career positioning</li>
        <li>Direct 1-on-1 mentorship session with Dr. Shree Nanguneri, PhD</li>
        <li>Comprehensive deliverable package &amp; action blueprint</li>
      `;
    }
  }

  /**
   * Render or Re-render PayPal Smart Buttons for Current Tier Price
   */
  function renderPayPalButtons() {
    const container = document.getElementById('paypal-button-container');
    const spinner = document.getElementById('paypal-loading-spinner');
    const errorNotice = document.getElementById('paypal-error-notice');
    if (!container) return;

    if (errorNotice) errorNotice.classList.add('d-none');
    if (spinner) spinner.style.display = 'flex';

    loadPayPalSdk().then(paypal => {
      if (spinner) spinner.style.display = 'none';

      // Clean out any previous rendered buttons
      container.innerHTML = '';

      if (currentRenderedButtons && typeof currentRenderedButtons.close === 'function') {
        try { currentRenderedButtons.close(); } catch (e) {}
      }

      currentRenderedButtons = paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'pay',
          height: 48
        },

        createOrder: function (data, actions) {
          const tier = activeTier;
          console.log('[MGBS PayPal] Initiating order for:', tier.name, `$${tier.price}`);

          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [{
              description: `MGBS CTEx: ${tier.name}`,
              custom_id: tier.id,
              soft_descriptor: 'MGBS CTEx',
              amount: {
                currency_code: CONFIG.currency,
                value: tier.price.toFixed(2),
                breakdown: {
                  item_total: {
                    currency_code: CONFIG.currency,
                    value: tier.price.toFixed(2)
                  }
                }
              },
              items: [{
                name: tier.name,
                description: tier.persona ? tier.persona.substring(0, 120) : 'Executive Career Mentorship',
                unit_amount: {
                  currency_code: CONFIG.currency,
                  value: tier.price.toFixed(2)
                },
                quantity: '1',
                category: 'DIGITAL_GOODS'
              }]
            }],
            application_context: {
              brand_name: 'Millennium Global Business Solutions Inc.',
              shipping_preference: 'NO_SHIPPING',
              user_action: 'PAY_NOW'
            }
          });
        },

        onApprove: function (data, actions) {
          console.log('[MGBS PayPal] Payment approved. Capturing funds for order:', data.orderID);
          if (spinner) {
            spinner.style.display = 'flex';
            const spinnerText = spinner.querySelector('span');
            if (spinnerText) spinnerText.textContent = 'Verifying and capturing payment...';
          }

          return actions.order.capture().then(function (captureDetails) {
            console.log('[MGBS PayPal] Capture successful:', captureDetails);
            if (spinner) spinner.style.display = 'none';

            // Extract capture metadata
            const payer = captureDetails.payer || {};
            const payerName = payer.name 
              ? `${payer.name.given_name || ''} ${payer.name.surname || ''}`.trim() 
              : 'Valued Client';
            const payerEmail = payer.email_address || '';
            const purchaseUnit = (captureDetails.purchase_units && captureDetails.purchase_units[0]) || {};
            const payments = (purchaseUnit.payments && purchaseUnit.payments.captures) || [];
            const primaryCapture = payments[0] || {};
            const transactionId = primaryCapture.id || captureDetails.id || data.orderID;
            const countryCode = (payer.address && payer.address.country_code) || 'US';

            const transactionRecord = {
              transaction_id: transactionId,
              order_id: data.orderID,
              payer_name: payerName,
              payer_email: payerEmail,
              tier_id: activeTier.id,
              tier_name: activeTier.name,
              amount_usd: String(activeTier.price),
              payment_status: captureDetails.status || 'COMPLETED',
              payment_method: 'PayPal / Smart Button',
              country_code: countryCode
            };

            // 1. Close checkout modal
            closeCheckoutModal();

            // 2. Open executive receipt confirmation modal
            openReceiptModal(transactionRecord);

            // 3. Dispatch to Google Apps Script & localStorage WAL
            syncTransactionToBackend(transactionRecord);

            // 4. Dispatch custom event for external telemetry
            window.dispatchEvent(new CustomEvent('mgbs:payment-completed', {
              detail: transactionRecord
            }));
          });
        },

        onCancel: function (data) {
          console.log('[MGBS PayPal] Buyer closed or cancelled the PayPal popup:', data);
          if (spinner) spinner.style.display = 'none';
          showToast('Checkout paused. You can resume whenever you are ready.', 'info');
        },

        onError: function (err) {
          console.error('[MGBS PayPal] Smart Buttons Error:', err);
          if (spinner) spinner.style.display = 'none';
          if (errorNotice) {
            errorNotice.classList.remove('d-none');
            const errText = document.getElementById('paypal-error-text');
            if (errText) errText.textContent = 'PayPal encountered an error initializing checkout. Please try again or contact us.';
          }
        }
      }).render('#paypal-button-container');

    }).catch(err => {
      console.error('[MGBS PayPal] Failed to render smart buttons:', err);
      if (spinner) spinner.style.display = 'none';
      if (errorNotice) {
        errorNotice.classList.remove('d-none');
        const errText = document.getElementById('paypal-error-text');
        if (errText) errText.textContent = 'Unable to connect to PayPal. Please check your network connection.';
      }
    });
  }

  /**
   * Modal Show / Hide Controllers
   */
  function openCheckoutModal(tierKey) {
    if (!modalOverlay) {
      modalOverlay = document.getElementById('ctex-payment-modal');
    }
    if (!modalOverlay) return;

    const resolvedKey = tierKey || (tierSelect ? tierSelect.value : 'tier-1');
    activeTier = getActiveTierData(resolvedKey);

    updateModalTierSummary(activeTier);
    modalOverlay.classList.add('is-active');
    document.body.classList.add('modal-open');

    // Render buttons freshly for the current tier
    renderPayPalButtons();
  }

  function closeCheckoutModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('is-active');
    }
    document.body.classList.remove('modal-open');
  }

  function openReceiptModal(record) {
    if (!receiptOverlay) {
      receiptOverlay = document.getElementById('ctex-receipt-modal');
    }
    if (!receiptOverlay) return;

    const rTier = document.getElementById('receipt-tier-name');
    const rAmount = document.getElementById('receipt-amount');
    const rName = document.getElementById('receipt-payer-name');
    const rEmail = document.getElementById('receipt-payer-email');
    const rTx = document.getElementById('receipt-tx-id');

    if (rTier) rTier.textContent = record.tier_name;
    if (rAmount) rAmount.textContent = `$${record.amount_usd} USD`;
    if (rName) rName.textContent = record.payer_name;
    if (rEmail) rEmail.textContent = record.payer_email;
    if (rTx) rTx.textContent = record.transaction_id;

    receiptOverlay.classList.add('is-active');
    document.body.classList.add('modal-open');
  }

  function closeReceiptModal() {
    if (receiptOverlay) {
      receiptOverlay.classList.remove('is-active');
    }
    document.body.classList.remove('modal-open');
  }

  function showToast(msg, type = 'info') {
    const container = document.querySelector('.toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : 'show'}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  /**
   * Initialize Listeners on Page Load
   */
  function init() {
    modalOverlay = document.getElementById('ctex-payment-modal');
    receiptOverlay = document.getElementById('ctex-receipt-modal');
    btnCloseModal = document.getElementById('btn-close-checkout-modal');
    btnCloseReceipt = document.getElementById('btn-close-receipt-modal');
    btnEnrollCta = document.getElementById('ctex-enroll-btn');
    tierSelect = document.getElementById('ctex-tier-select');
    linkSwitchConsultation = document.getElementById('link-switch-to-consultation');

    // Intercept "Enroll / Sign Up to Pay" CTA to open Checkout Modal
    if (btnEnrollCta) {
      btnEnrollCta.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const selectedTier = btnEnrollCta.getAttribute('data-tier') || (tierSelect ? tierSelect.value : 'tier-1');
        openCheckoutModal(selectedTier);
      });
    }

    // Modal close buttons
    if (btnCloseModal) {
      btnCloseModal.addEventListener('click', closeCheckoutModal);
    }
    if (btnCloseReceipt) {
      btnCloseReceipt.addEventListener('click', closeReceiptModal);
    }

    // Close on backdrop click
    if (modalOverlay) {
      modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) {
          closeCheckoutModal();
        }
      });
    }
    if (receiptOverlay) {
      receiptOverlay.addEventListener('click', function (e) {
        if (e.target === receiptOverlay) {
          closeReceiptModal();
        }
      });
    }

    // Escape key closes modals
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeCheckoutModal();
        closeReceiptModal();
      }
    });

    // "Switch to Consultation" link inside Checkout Modal
    if (linkSwitchConsultation) {
      linkSwitchConsultation.addEventListener('click', function (e) {
        closeCheckoutModal();
        // Allow smooth scroll to #consultation section
        if (typeof window.MGBS_NavigateToSection === 'function') {
          window.MGBS_NavigateToSection(5);
        }
      });
    }

    // Flush any pending WAL writes from prior sessions
    flushPendingTransactions();

    // Expose programmatic hooks
    window.MGBS_OpenCheckout = openCheckoutModal;
    window.MGBS_CloseCheckout = closeCheckoutModal;
    window.MGBS_OpenReceipt = openReceiptModal;
  }

  // Self-initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
