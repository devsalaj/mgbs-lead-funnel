# MGBS Inc. - Milestone 1 Lead Funnel & Diagnostic Engine

**Millennium Global Business Solutions (MGBS Inc.)**  
*Logic-Based Thinking Supported by Compassion*  
Executive Leadership: **Dr. Shree Nanguneri, PhD** (CEO & Founder, ex-GE Plastics, Six Sigma Master Black Belt)

---

## 🚀 Overview

This repository contains the complete, production-ready codebase for **Milestone 1 ($100 USD Proof of Concept)** for MGBS Inc. It delivers a high-trust, executive-grade single-page funnel engineered for immediate conversion and lead generation across global enterprise clients.

### 🌟 Key Features Delivered:
1. **Header & 3D Brand Wordmark (`M1-01`)**:
   - Continuous 3D spinning loop video with `.webm` primary and `.mp4` fallback.
   - Dr. Shree's requested Corporate Blue (`#0B2545`) geometric lettering overlay.
   - Separated Brand Wordmark (`MGBS` + `Millennium Global Business Solutions` + `Lean 6σ Universal`).
   - Smooth mobile responsive collapse keeping header clean and uncluttered.
2. **Executive Authority Hero (`M1-01`)**:
   - Authoritative headline: *"Logic-Based Thinking Supported by Compassion."*
   - Credential highlights for Dr. Shree Nanguneri (ex-GE Plastics, Six Sigma Master Black Belt).
   - Animated social proof metrics: **$550M+** Financial Impact, **600+** Belts Mentored, **20+** Years Global Track Record.
3. **Interactive "3 Ds" Diagnostic Engine (`M1-02`)**:
   - Tabbed interactive selector for **Defects**, **Deviations**, and **Delays**.
   - Dynamic 3-column breakdown: Operational Symptoms, Root Cause Analysis, and MGBS Six Sigma Solutions (DMAIC, 8 Rs of Sustenance, Kaizen).
   - Direct action triggers pre-selecting category and smoothly scrolling to consultation.
4. **Resilient Lead Capture Funnel (`M1-03`)**:
   - Real-time client-side validation for business email, company, and challenge.
   - LocalStorage Draft Auto-Save & Write-Ahead Log (WAL) preventing data loss during offline / network drops.
   - Asynchronous `no-cors` submission to Google Apps Script Webhook.
   - Animated submit spinner & elegant executive confirmation modal.
5. **Self-Healing Google Apps Script Webhook (`LeadCRMWebhook.gs`)**:
   - Target Spreadsheet: `1udlLNXjaxnW6GO3n-yffB1qNE3MExdH83y9g_48h-Nk` (Tab: `Lead_CRM`).
   - Dynamic column mapping (zero hardcoded indexes).
   - Automatic tab creation, header enforcement, and range protection.
   - Dual email dispatch to `bizsupport@mgbs.com` and `snangunerimgbs@gmail.com`.
6. **Cloudflare Edge Deployment (`_headers`, `wrangler.toml`)**:
   - Strict Content Security Policy (CSP), HSTS (max-age 1 year), and anti-clickjacking.
   - Immutable 1-year caching for video/media assets.

---

## 📁 Project Architecture

```
mgbs-lead-funnel/
├── index.html                       # Semantic HTML5 Single-Page Funnel Shell
├── _headers                         # Cloudflare Edge Security & Caching Headers
├── wrangler.toml                    # Cloudflare Pages Configuration
├── css/
│   └── styles.css                   # Responsive layout, Material You palette & animations
├── js/
│   ├── app.js                       # Mobile nav, scroll effects, 3 Ds interactive engine
│   └── form-handler.js              # Client-side validation, submission & toast feedback
├── assets/
│   ├── mgbs-logo-loop.webm          # 280x280 square 3D loop (WebM)
│   ├── mgbs-logo-loop.mp4           # 280x280 square 3D loop (MP4 fallback)
│   └── mgbs-logo-animated.svg       # Vector fallback & poster
├── google-apps-script/
│   └── LeadCRMWebhook.gs            # Zero-CORS serverless doPost handler for Google Sheets
└── README.md                        # Deployment & operations guide
```

---

## ⚡ Deployment Instructions

### 1. Cloudflare Pages Deployment (Direct / Git / CLI)

#### Via Cloudflare Dashboard:
1. Navigate to **Workers & Pages** > **Create application** > **Pages**.
2. Connect your Git repository or upload the `mgbs-lead-funnel` folder.
3. Build Settings:
   - **Framework Preset**: None (Static HTML)
   - **Build Output Directory**: `.` (or root of directory)
4. Deploy! The `_headers` file will automatically configure edge caching and strict security policies.

#### Via Wrangler CLI:
```bash
cd "/home/salajka/CREATOR/FlowZuite/MGBS s nanguneri /mgbs-lead-funnel"
npx wrangler pages deploy . --project-name=mgbs-lead-funnel
```

---

### 2. Google Apps Script Webhook Setup

1. Open your target Google Sheet (`1udlLNXjaxnW6GO3n-yffB1qNE3MExdH83y9g_48h-Nk`).
2. Go to **Extensions** > **Apps Script**.
3. Copy the entire contents of `google-apps-script/LeadCRMWebhook.gs` into the script editor.
4. Click **Deploy** > **New Deployment**:
   - **Select type**: Web app
   - **Description**: MGBS Lead CRM Webhook v1.0
   - **Execute as**: Me (`your-account@gmail.com`)
   - **Who has access**: Anyone (crucial for receiving form submissions from web visitors)
5. Click **Deploy** and authorize the script.
6. Copy the resulting **Web App URL** (e.g. `https://script.google.com/macros/s/.../exec`).
7. Update `GAS_WEBHOOK_URL` in `js/form-handler.js` with your deployed URL.

---

## 🧪 Local Preview & Testing

To test locally:
```bash
cd "/home/salajka/CREATOR/FlowZuite/MGBS s nanguneri /mgbs-lead-funnel"
python3 -m http.server 8080
```
Open [http://localhost:8080](http://localhost:8080) in any modern browser.

---

## 🛡️ Security & Resilience Compliance

- **Zero-Lost Writes**: Submissions are held in client-side Write-Ahead Log until confirmed.
- **Header Protection**: Header row in Google Sheets is automatically styled, frozen, and protected against accidental manual edits.
- **Idempotency**: Prevents duplicate rows when a user double-clicks or experiences a retry cycle.
- **Enterprise Edge Defense**: A+ security headers on Cloudflare with strict frame-ancestors and CSP.
