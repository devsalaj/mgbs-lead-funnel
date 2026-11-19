# Project 1.1 Tasks Checklist: CTEx Tier UI & Audio Player

- [x] **Phase 1: Artifact & Workspace Preparation**
  - [x] Create implementation plan artifact (`project-1.1-ctex-plan.md`)
  - [x] Create task list artifact (`project-1.1-ctex-tasks.md`)
  - [x] Copy plan and task artifacts to local project `artifacts/` folder
  - [x] Obtain user approval on the plan and approach (All pricing ending in 69 or 99)

- [x] **Phase 2: Audio Asset Generation & Cue-Point Mapping**
  - [x] Write script covering Dr. Shree's 20-year track record and CTEx framework
  - [x] Generate studio-quality audio narration using `edge-tts` (`assets/audio/ctex-overview-chaptered.mp3`)
  - [x] Map exact timestamps for Chapters 1, 2, 3, and 4 (0.0s, 26.5s, 47.83s, 71.74s)

- [x] **Phase 3: Frontend Component Implementation**
  - [x] Add `#ctex` section markup in `index.html` (Top-Left Tier Dropdown, dynamic price display, deliverables list, CTA button)
  - [x] Add Single-File Chaptered Audio Player markup with Play/Pause, scrubber bar, and 4 chapter pills
  - [x] Add "CTEx Programs" link in desktop header and mobile drawer navigation
  - [x] Implement responsive styling in `css/styles.css` matching MGBS Navy/Gold design tokens

- [x] **Phase 4: Client Logic & Telemetry Engine**
  - [x] Define 7 CTEx tier data structures in `js/app.js` with descriptions and pricing ($69, $69, $99, $199, $499, $999, $1,999)
  - [x] Implement dropdown event handler with smooth DOM updates
  - [x] Implement audio player logic: play/pause, timeupdate scrubber sync, cue-point seeking
  - [x] Implement telemetry module (`trackCtexEvent`) logging to `localStorage` and GA4

- [x] **Phase 5: Verification & Production Deployment**
  - [x] Test tier selection and price display across all 7 tiers (Verified in live browser)
  - [x] Test audio cue-point navigation and progress bar scrubbing (Verified jumping to Ch 3 at 47.83s)
  - [x] Test mobile responsiveness and cross-browser audio playback
  - [x] Deploy update via `npx wrangler pages deploy .`
  - [x] Verify live on `https://mgbs.com` and `https://www.mgbs.com` (HTTP 200 OK)
