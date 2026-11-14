/**
 * ============================================================================
 * MGBS Inc. - Lead Funnel Form Handler & Resilient Client WAL
 * File: js/form-handler.js
 * 
 * Capabilities:
 * - Real-time form validation with inline visual cues
 * - Client-Side Write-Ahead Log (WAL) & Draft Auto-Save in localStorage
 * - Zero-loss resilient submission (handles online/offline state)
 * - Asynchronous Google Apps Script Webhook submission (no-cors mode)
 * - Executive confirmation modal & toast notification system
 * ============================================================================
 */

// Target Webhook Configuration
// If deploying to live Google Apps Script, replace with your deployed Web App Exec URL:
const MGBS_CONFIG = {
  // Configured default Webhook URL for Google Apps Script
  // In production, paste the /exec URL from your Apps Script Deployment
  GAS_WEBHOOK_URL: "https://script.google.com/macros/s/AKfycbz7LoJa8i_6quvvuMvnjRXn2cHOYFQKNgzPRuCSuPCT8Sj7TGshYGc29qXu7ayFbeVX3g/exec",
  STORAGE_KEYS: {
    DRAFT: "mgbs_lead_draft_v1",
    PENDING_QUEUE: "mgbs_pending_leads_wal"
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initLeadForm();
  initModal();
  restoreDraft();
  processPendingQueue();
});

/**
 * Initialize Form Validation & Submission
 */
function initLeadForm() {
  const form = document.getElementById('mgbs-lead-form');
  if (!form) return;

  const inputs = form.querySelectorAll('.form-input, .form-select, .form-textarea');

  // Input listener for real-time validation & auto-save draft
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      validateField(input);
      saveDraft();
    });

    input.addEventListener('blur', () => {
      validateField(input);
    });

    if (input.tagName === 'SELECT') {
      input.addEventListener('change', () => {
        validateField(input);
        saveDraft();
      });
    }
  });

  // Form submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    let isValid = true;
    inputs.forEach(input => {
      if (!validateField(input)) {
        isValid = false;
      }
    });

    if (!isValid) {
      showToast("Please complete all required fields correctly.", "error");
      const firstInvalid = form.querySelector('.invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Prepare Lead Data Object
    const clientTxId = generateUUID();
    const leadData = {
      client_transaction_id: clientTxId,
      full_name: document.getElementById('full_name').value.trim(),
      work_email: document.getElementById('work_email').value.trim(),
      phone: document.getElementById('phone').value.trim() || "Not provided",
      company: document.getElementById('company').value.trim(),
      operational_challenge: document.getElementById('operational_challenge').value,
      message: document.getElementById('message').value.trim(),
      timestamp: new Date().toISOString()
    };

    // UI Loading State
    const submitBtn = document.getElementById('btn-submit-lead');
    setButtonLoading(submitBtn, true);

    try {
      // 1. Save to Client Write-Ahead Log (WAL) first to prevent data loss
      enqueuePendingLead(leadData);

      // 2. Transmit to Google Apps Script Webhook
      await submitToGasWebhook(leadData);

      // 3. Mark transaction as synced in WAL
      dequeuePendingLead(clientTxId);

      // 4. Clear draft from localStorage
      clearDraft();

      // 5. Reset form inputs
      form.reset();
      inputs.forEach(input => {
        input.classList.remove('valid', 'invalid');
      });

      // 6. Show Executive Confirmation Modal
      showSuccessModal(leadData);

    } catch (submitErr) {
      console.warn("Direct webhook dispatch error (queued in client WAL):", submitErr);
      
      // Since it's saved in WAL, acknowledge user with reassurance
      showToast("Inquiry recorded offline. Will sync automatically upon connection.", "success");
      showSuccessModal(leadData);
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

/**
 * Field Validation Logic
 */
function validateField(field) {
  const value = field.value.trim();
  const id = field.id;
  let valid = true;

  if (field.hasAttribute('required')) {
    if (!value) {
      valid = false;
    }
  }

  // Work Email regex check
  if (id === 'work_email' && value) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      valid = false;
    }
  }

  // Phone check (optional, but if provided must be a valid phone format)
  if (id === 'phone' && value) {
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9()]{6,20}$/;
    if (!phoneRegex.test(value)) {
      valid = false;
    }
  }

  // Company check
  if (id === 'company' && field.hasAttribute('required')) {
    if (value.length < 2) valid = false;
  }

  // Operational Challenge dropdown
  if (id === 'operational_challenge' && field.hasAttribute('required')) {
    if (!value || value === "") valid = false;
  }

  // Update classes
  if (valid) {
    field.classList.remove('invalid');
    if (value) field.classList.add('valid');
  } else {
    field.classList.remove('valid');
    field.classList.add('invalid');
  }

  return valid;
}

/**
 * Submit Payload to Google Apps Script Webhook
 */
async function submitToGasWebhook(leadData) {
  // Use URLSearchParams for reliable cross-origin POST transmission to Apps Script
  const formData = new URLSearchParams();
  formData.append('action', 'submit_lead');
  for (const [key, value] of Object.entries(leadData)) {
    formData.append(key, value);
  }

  // Use mode: 'no-cors' so browser does not block Google Apps Script redirection
  return fetch(MGBS_CONFIG.GAS_WEBHOOK_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formData.toString()
  });
}

/**
 * Client-Side Write-Ahead Log (WAL)
 */
function enqueuePendingLead(lead) {
  try {
    const queue = JSON.parse(localStorage.getItem(MGBS_CONFIG.STORAGE_KEYS.PENDING_QUEUE) || "[]");
    queue.push(lead);
    localStorage.setItem(MGBS_CONFIG.STORAGE_KEYS.PENDING_QUEUE, JSON.stringify(queue));
  } catch (e) {
    console.error("Local storage error in enqueue:", e);
  }
}

function dequeuePendingLead(txId) {
  try {
    let queue = JSON.parse(localStorage.getItem(MGBS_CONFIG.STORAGE_KEYS.PENDING_QUEUE) || "[]");
    queue = queue.filter(item => item.client_transaction_id !== txId);
    localStorage.setItem(MGBS_CONFIG.STORAGE_KEYS.PENDING_QUEUE, JSON.stringify(queue));
  } catch (e) {
    console.error("Local storage error in dequeue:", e);
  }
}

async function processPendingQueue() {
  if (!navigator.onLine) return;

  try {
    const queue = JSON.parse(localStorage.getItem(MGBS_CONFIG.STORAGE_KEYS.PENDING_QUEUE) || "[]");
    if (!queue.length) return;

    for (const lead of queue) {
      try {
        await submitToGasWebhook(lead);
        dequeuePendingLead(lead.client_transaction_id);
      } catch (err) {
        console.warn("Retry failed for txId: " + lead.client_transaction_id);
      }
    }
  } catch (e) {
    console.error("Error processing pending queue:", e);
  }
}

window.addEventListener('online', processPendingQueue);

/**
 * Draft Save & Restore
 */
function saveDraft() {
  try {
    const draft = {
      full_name: document.getElementById('full_name')?.value || '',
      work_email: document.getElementById('work_email')?.value || '',
      phone: document.getElementById('phone')?.value || '',
      company: document.getElementById('company')?.value || '',
      operational_challenge: document.getElementById('operational_challenge')?.value || '',
      message: document.getElementById('message')?.value || ''
    };
    localStorage.setItem(MGBS_CONFIG.STORAGE_KEYS.DRAFT, JSON.stringify(draft));
  } catch (e) {}
}

function restoreDraft() {
  try {
    const saved = localStorage.getItem(MGBS_CONFIG.STORAGE_KEYS.DRAFT);
    if (!saved) return;

    const draft = JSON.parse(saved);
    if (draft.full_name) document.getElementById('full_name').value = draft.full_name;
    if (draft.work_email) document.getElementById('work_email').value = draft.work_email;
    if (draft.phone) document.getElementById('phone').value = draft.phone;
    if (draft.company) document.getElementById('company').value = draft.company;
    if (draft.operational_challenge) document.getElementById('operational_challenge').value = draft.operational_challenge;
    if (draft.message) document.getElementById('message').value = draft.message;
  } catch (e) {}
}

function clearDraft() {
  try {
    localStorage.removeItem(MGBS_CONFIG.STORAGE_KEYS.DRAFT);
  } catch (e) {}
}

/**
 * Confirmation Modal Management
 */
function initModal() {
  const modal = document.getElementById('success-modal');
  const closeBtn = document.getElementById('btn-close-modal');

  if (!modal || !closeBtn) return;

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
    }
  });
}

function showSuccessModal(lead) {
  const modal = document.getElementById('success-modal');
  if (!modal) return;

  // Fill receipt fields
  const nameEl = document.getElementById('receipt-name');
  const emailEl = document.getElementById('receipt-email');
  const companyEl = document.getElementById('receipt-company');
  const challengeEl = document.getElementById('receipt-challenge');

  if (nameEl) nameEl.textContent = lead.full_name;
  if (emailEl) emailEl.textContent = lead.work_email;
  if (companyEl) companyEl.textContent = lead.company;
  if (challengeEl) challengeEl.textContent = lead.operational_challenge;

  modal.classList.add('active');
}

/**
 * UI Utilities
 */
function setButtonLoading(button, isLoading) {
  if (!button) return;
  if (isLoading) {
    button.classList.add('loading');
    button.setAttribute('disabled', 'true');
  } else {
    button.classList.remove('loading');
    button.removeAttribute('disabled');
  }
}

function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
