# Project 1.1 Architecture & Implementation Plan: CTEx Tier UI & Chaptered Audio Player

**Project Name:** MGBS Lead Funnel - Project 1.1 (CTEx Lean Execution)  
**Target Domain:** [https://mgbs.com](https://mgbs.com) / [https://www.mgbs.com](https://www.mgbs.com)  
**Turnaround:** 2–3 Days ($60 OpEx Add-on)  
**Status:** Ready for User Review & Approval  

---

## 1. Executive Summary & Objective

Project 1.1 integrates Dr. Shree Nanguneri's **Career Transition Excellence (CTEx)** program into the live MGBS Inc. platform. The objective is to provide executive and career-transition prospects with an interactive, self-service tier selector and an authoritative chaptered audio testimonial player (grounded in Dr. Shree's 20+ year GE Plastics track record and ASQ/IASSC credentials), paired with conversion telemetry to track prospect purchase intent across all 7 pricing tiers.

---

## 2. Component Architecture & Design Specifications

### Component 1: CTEx Tier UI & Product Selection Dropdown
- **Placement:** Positioned in a dedicated `#ctex` section between Methodology (`#methodology`) and Consultation (`#consultation`), with quick anchor link added to main navigation.
- **Top-Left Dropdown:** Follows the wireframe layout, allowing instantaneous selection among the 7 official CTEx tiers (all charm-priced ending in 99 or 69):
  1. **Resume Design Optimization:** $69 *(was $75)*
  2. **LinkedIn Profile Optimization:** $69 *(was $75)*
  3. **Academic Excellence (High School, UG & PG):** $99 *(was $100)*
  4. **UG/PG Employment Success:** $199 *(was $200)*
  5. **Early Professional Career Success:** $499 *(was $500)*
  6. **Mid Career Transitions:** $999 *(was $1,000)*
  7. **Senior Management Career Progress:** $1,999 *(was $2,000)*
- **Dynamic Content Updates:** Selecting a tier instantly updates:
  - Active Price Display & Badge (with value anchor)
  - Deliverable Scope bullet points (e.g., ATS scoring, Six Sigma career roadmap, executive positioning)
  - Target audience description
  - Dynamic checkout CTA with custom data attributes (`data-tier-id`, `data-tier-price`)

### Component 2: Interactive Chaptered Audio Player & Floating Mini-Controller
- **Source Narration:** Studio-grade narration overview of Dr. Shree's 20+ year track record, GE Plastics operational excellence, and LinkedIn client recommendations (`assets/audio/ctex-overview-chaptered.mp3`).
- **Cue-Point Navigation (Single File Architecture):**
  - **Chapter 1 (0:00 - 0:26):** *Six Sigma in Careers*
  - **Chapter 2 (0:26 - 0:47):** *Handling Transition Risks*
  - **Chapter 3 (0:47 - 1:11):** *Track Record & LinkedIn*
  - **Chapter 4 (1:11 - 1:28):** *Program Options & Action*
- **Player Controls & Polish:**
  - Modern media player with Next & Skip chapter buttons (`#btn-audio-prev`, `#btn-audio-next`), Play/Pause state toggle with deterministic SVG display classes.
  - Interactive chapter pills with real-time active highlights.
- **Persistent Floating Audio Controller (Docked Above FAB):**
  - Positioned directly above `.fab-section-nav` (`bottom: calc(2rem + 155px); right: 2rem;`).
  - Animates in when audio starts playing, allowing the user to navigate and scroll across the entire website while controlling playback (Play/Pause, Skip Next, Skip Prev, live chapter indicator, and progress tracking).
  - Bidirectionally synchronized with the in-card player.

### Component 3: Basic Interaction & Conversion Telemetry
- **Lightweight Event Tracking:**
  - Event 1: `ctex_tier_selected` (`tier_id`, `tier_name`, `price`, `timestamp`)
  - Event 2: `ctex_enroll_initiated` (`tier_id`, `tier_name`, `price`, `timestamp`, `payment_method`)
  - Event 3: `ctex_audio_chapter_played` (`chapter_index`, `chapter_name`, `playback_time`)
- **Storage & Forwarding:**
  - Saves events to client-side log in `localStorage` (`_mgbs_telemetry_events`) for auditability.
  - Dispatches standard GA4 events (`select_item`, `begin_checkout`) if `gtag` is present.
  - Optional fallback to append to Google Sheets CRM lead log when email is present.

---

## 3. File Modification Plan

| File | Type | Changes |
| :--- | :--- | :--- |
| `index.html` | HTML | Add CTEx section `#ctex`, top-left tier selector dropdown, tier details card, checkout CTA button, and chaptered audio player markup. Add "CTEx Programs" to navigation. |
| `css/styles.css` | CSS | Add styles for CTEx grid, tier selector dropdown, tier badges, custom HTML5 audio player skin, chapter pills, and responsive mobile layout. |
| `js/app.js` | JS | Add CTEx tier configuration object, dropdown change listener, dynamic tier renderer, chaptered audio cue-point sync (`timeupdate`), and telemetry emitter. |
| `assets/audio/ctex-overview-chaptered.mp3` | Media | Synthesized high-fidelity neural audio track covering Dr. Shree's career transition methodology and recommendations. |

---

## 4. Verifiable Success Criteria
1. **Dropdown Interaction:** Selecting any of the 7 tiers updates the price, description, and CTA button within 50ms without layout shifting.
2. **Audio Seeking:** Clicking Chapter 1, 2, 3, or 4 jumps directly to the designated timestamp and updates the active chapter indicator.
3. **Audio Playback:** Audio plays smoothly across Chrome, Firefox, Safari, and mobile browsers with accurate scrubber synchronization.
4. **Telemetry Logging:** Changing tiers and clicking "Enroll / Sign Up to Pay" records an entry in `localStorage.getItem('_mgbs_telemetry_events')` and fires a GA4 event.
5. **Mobile Responsiveness:** CTEx section stacks neatly on mobile viewports (< 768px) with no horizontal overflow.
6. **Cloudflare Deployment:** Deployed to `https://mgbs.com` with HTTP 200 OK and no console errors.
