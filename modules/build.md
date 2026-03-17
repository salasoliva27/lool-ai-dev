# BUILD — lool-ai

### Stack
- **Widget:** Vanilla JavaScript + MediaPipe Face Mesh (runs entirely in the browser, no server needed for try-on)
- **Delivery:** Single `<script>` tag — store pastes it once into their site, works regardless of their tech stack
- **Backend:** Node.js + Express — store accounts, catalog management, embed code generation
- **Storage:** Cloudflare R2 — glasses product images per store
- **Billing:** Stripe (MXN) — monthly store subscriptions
- **Photo save:** Browser Canvas API — customer captures frame and downloads to their device, nothing stored server-side

### How it works
1. Store pastes one `<script>` tag into their product page
2. A "Try on" button appears next to the glasses
3. Customer clicks → camera opens in a modal, no login required
4. MediaPipe detects face landmarks in real time → glasses image overlaid on face
5. Customer hits "Save photo" → image downloaded to their device
6. Customer closes modal → nothing retained on our side

### Stages

| Stage | Description | Definition of done | Status |
|---|---|---|---|
| 1 | Try-on widget core | Script tag embeddable on any page. Camera opens, MediaPipe detects face, glasses image overlaid in real time. Works on desktop + mobile Chrome/Safari. | ⬜ |
| 2 | Photo capture + save | Customer can freeze the frame and download the photo to their device. | ⬜ |
| 3 | Store dashboard | Store owner logs in, uploads glasses catalog (image + name + product ID), gets their unique `<script>` tag. | ⬜ |
| 4 | Per-client integration | For each new store: connect widget to their catalog (Shopify, WooCommerce, custom — handled case by case). | ⬜ |
| 5 | Billing | Stripe MXN subscription. Store pays monthly, loses access if they cancel. | ⬜ |
| 6 | LFPDPPP compliance | Privacy notice shown before camera activates. Consent recorded. No facial data persisted server-side (camera runs locally in browser). | ⬜ |

### Current stage
Stage 1 — not yet started.

### Blockers
- None. Stack is defined. Ready to build Stage 1.
- Note: LFPDPPP risk is low for MVP since no facial data leaves the browser — but privacy notice still needed before real users.

### Build log
2026-03-17 — Stack defined. Vanilla JS + MediaPipe. Single script tag delivery model confirmed.
