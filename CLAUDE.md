# Cyber Scorecard prototype — context for Claude Code

This is a **click-through prototype** of the Cyber Scorecard Overview, designed to live inside Sonic Portal at JET. Built collaboratively with Aditya (lead product designer) to validate the **L+A first cut** with the inner team before integration into the real Sonic Portal codebase.

**Important:** This is a prototype, not production. All data is mock. The point is to get team feedback on the design — not to ship to users.

---

## Who's who

- **Aditya** (`aditya.pradana@justeattakeaway.com`) — lead product designer, owns the design and runs this prototype.
- **Stephen Portillo** — Product Owner per the PRD (build side).
- **Ritesh Patel** — Interim CISO, KR-level owner (outcome side).
- **Mert Öztekin** — CTO, sponsor.
- **Sherif Clinch · Steven Markey · Callaghan Ebojoh · Shrijeet Karade** — PRD contributors / build team.

---

## Design decisions locked in (don't undo these without asking)

1. **First cut = L+A** — the score-to-action loop. L = drill-from-dial (inline drawer). A = top-mover banner.
2. **Host = Sonic Portal.** This is a new surface inside an existing product, not a standalone. Tabbed nav at top.
3. **Score direction = exposure.** Higher = more risk. 0 = SAFE, 100 = CRITICAL. Don't invert.
4. **Band thresholds: 0–40 / 40–70 / 70–100** — Low Exposure / Elevated Risk / Critical Risk.
5. **RAG on the active arc.** The ring uses a green→amber→red gradient. Two small white ticks at score 40 and 70 mark the band boundaries.
6. **Score marker, no needle.** Short RAG-coloured radial marker at the current score, like the boundary ticks but ~24px longer toward the centre. A small dot at the inner tip. NO long centre-to-rim needle.
7. **Rev animation.** On load, the ring sweeps 0 → past target → settles back. Uses `easeOutRev` in `src/composables/useGaugeMath.ts`. ~1400ms. PIE expressive motion. Respects `prefers-reduced-motion`.
8. **Aggregates-only comparisons.** Your team vs P&T average vs top quartile — never named other teams. Works Council compliance.
9. **Reporting Dip banner is per-user dismissible** (localStorage). Not on a time window.
10. **No absolute target ticks** until InfoSec lock real thresholds. Don't add them speculatively.

---

## Stack

- **Vue 3** (Composition API, `<script setup>` syntax, TypeScript)
- **Vite 5** for dev server + build
- **TypeScript** — strict mode but `noUnusedLocals` / `noUnusedParameters` off for prototype speed
- **No state library.** Refs + props. The app is small enough.
- **PIE design tokens** — mirrored in `src/styles/tokens.css` as CSS custom properties. We do NOT currently use `@justeattakeaway/pie-webc` components (the npm package). When integrating into the real Sonic Portal stack, swap in `<pie-button>`, `<pie-notification>`, etc. — Vite is already configured (`isCustomElement: tag => tag.startsWith('pie-')`).
- **Fonts:** Inter (Google Fonts) as JET Sans Digital fallback; PT Mono for code. Italic is reserved for JET brand moments — the hero numeral, score values, deltas.

---

## File map

```
src/
├── main.ts                 # Vue app entry
├── App.vue                 # Root — just composes ScorecardOverview + FeedbackChip + StartHereOverlay
├── styles/
│   ├── tokens.css          # All PIE tokens as CSS variables — colour, radius, spacing, motion, type
│   └── global.css          # Reset + body defaults + radial page tint
├── data/
│   └── mockData.ts         # ALL mock data. Single source of truth for scores, deltas, agent text, product config
├── composables/
│   └── useGaugeMath.ts     # Pure functions for score → SVG coords + easeOutRev easing curve
└── components/
    ├── ScorecardOverview.vue   # Page composition. Hosts the reviewer demo bar. Wires everything together
    ├── PageChrome.vue          # Browser chrome strip + Sonic tabs (Overview / HREI / CVEI / SCREI)
    ├── RiskRing.vue            # The hero. SVG ring with gradient arc, boundary ticks, score marker, rev animation
    ├── IndexTile.vue           # CVEI / HREI / SCREI tile. RAG strip + big italic number + descriptor + delta
    ├── ComparisonBlock.vue     # Your team vs P&T avg vs top quartile
    ├── TopMoverBanner.vue      # Concept A — calls out biggest mover + recommended fix
    ├── ReportingDipBanner.vue  # Concept G — launch-month "scores will rise" framing. Dismissible.
    ├── DrillDrawer.vue         # Concept L — opens below tiles when one is clicked
    ├── StartHereOverlay.vue    # 30-second tour modal for first-time visitors
    └── FeedbackChip.vue        # Bottom-right Slack link
```

---

## Conventions

- **Vue SFCs** use `<script setup lang="ts">` Composition API.
- **No global stylesheet for components.** Each component owns its `<style scoped>`. Tokens come from CSS vars defined in `tokens.css`.
- **Imports use relative paths** (`../composables/useGaugeMath`) — keep it simple, no path aliases.
- **Animations** go through `useGaugeMath.easeOutRev` if they're rev-style, or PIE motion tokens (`var(--t-fast)`, `var(--ease-out)`) if they're functional.
- **Colour** is always via CSS variables — never hard-coded hex in components.
- **RAG state** flows through the `Band` type (`'safe' | 'warn' | 'crit'`). `bandFor(score)` and `bandLabel(band)` are in `mockData.ts`.
- **Mobile responsiveness** uses simple `@media (max-width: ...)` queries inside each component's `<style>`. Breakpoints: 900, 700, 600.

---

## What still needs work (Aditya may want to do these together)

- **HREI and SCREI drill drawers** use inline mock metrics — should move to `mockData.ts` like CVEI does for consistency.
- **"What this measures" pill** in the hero corner is a placeholder — doesn't expand yet. Should become a real PIE Tooltip / Popover.
- **The `feedbackUrl`** in `mockData.ts` is `#feedback` — needs the real Slack channel URL before sharing.
- **"Open in Jira" buttons** are visual only.
- **No real PIE Web Components** yet. When swapping in: `npm install @justeattakeaway/pie-webc`, import the components in `main.ts`, replace HTML buttons with `<pie-button>` etc.

---

## Source documents (in the parent folder)

Outside this prototype folder, in `../InfoSec Scorecard--InfoSec Scorecard/`:

- `Cyber Scorecard PRD.pdf` — 10 pages, the source of truth for product scope (also at `../Projects--InfoSec Scorecard/`)
- `Cyber Security Scorecard KR.pdf` — 4 pages, the outcome-level KR doc (also at `../Projects--InfoSec Scorecard/`)
- `Cyber Scorecard - Inception Board v2.html` — the PRD-aligned inception board with full project framing (vision, problem, scope, stakeholders, risks, personas, journey, milestones)
- `Cyber Scorecard - Idea Exploration.html` — the 12-concept divergence canvas. L+A were selected from here.
- `Cyber Scorecard - Overview Sketch v3 PIE.html` — the previous-iteration HTML sketch this Vue prototype evolved from.

The **Miro inception board** is at <https://miro.com/app/board/uXjVHREqQr4=/> — has all 11 inception frames plus a PRD-corrections banner.

---

## How to think about feedback

When reviewers point out things, sort them into:

1. **Bug or breakage** — fix immediately. (Markers misaligned, animation broken, etc.)
2. **Visual / token alignment** — usually a CSS variable change in `tokens.css` or one component. Quick.
3. **Information design** — what's surfaced, what's hidden. Bigger decision, usually goes back to Aditya.
4. **Out-of-scope ideas** — note them in a follow-up but don't bolt them onto this prototype. The point of this build is to test L+A specifically.

---

## When you (Claude Code) make changes

- Run `npm run dev` if not already running. It hot-reloads.
- Before suggesting a change touching the ring or the geometry, look at `useGaugeMath.ts` first — the maths is centralised there.
- Keep mock data in `mockData.ts` — don't sprinkle it through components.
- Don't add new npm dependencies without checking with Aditya.
- The deploy path is Vercel → free tier → auto-deploys from `main`. Don't add anything that would break a static build.

---

## How we got here (short)

1. Inception board built off project memory → corrected against the actual PRD when Aditya shared it.
2. Idea exploration across 12 concepts → converged to L+A.
3. Three HTML sketch iterations (donuts, ring, PIE-skinned ring with animation).
4. Aditya gave feedback on the v3 sketch — markers misplaced, needle wrong shape, dark theme colours off, plus *"let's move to code from here together."*
5. This Vue + Vite + TS prototype scaffolded as the starting point.
6. Aditya then said *"can I not use Claude Code?"* — yes, you (Claude Code) are now reading this CLAUDE.md, which is the cleanest handoff.

---

Welcome. Aditya knows where this is going — follow their lead, ask clarifying questions, propose changes before making them.
