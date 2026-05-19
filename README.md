# Cyber Scorecard — Prototype

A click-through prototype of the Cyber Scorecard Overview as it would live **inside Sonic Portal**. Built with Vue 3 + Vite + TypeScript, styled against the [PIE design system](https://pie.design/) tokens. All data is mock.

This prototype exists to validate the **L + A first cut** with the inner team before we commit to building it inside the real Sonic Portal codebase.

---

## What's in here

- **Hero RiskRing** — open 270° gauge with gradient active arc (green → amber → red), boundary ticks at score 40 and 70, RAG-coloured score marker, and a rev-style animation on load.
- **Top Mover banner (A)** — calls out the biggest score change since yesterday with the agent's recommended fix.
- **Reporting Dip banner (G)** — launch-month framing, per-user dismissible.
- **Three RAG-strip index tiles (B)** — CVEI / HREI / SCREI, click any to drill in.
- **Drill drawer (L)** — opens in place with the metric breakdown + agent's take card.
- **Aggregate comparison (F)** — your team vs P&T average vs top quartile.
- **What this measures (I)** — placeholder pill in the hero corner, ready to expand.
- **Start-here overlay** — first-load tour for reviewers; auto-dismisses after first read.
- **Feedback chip** — fixed bottom-right link out to your team's Slack channel.

Design decisions baked in:

- No absolute-target ticks until InfoSec lock real targets.
- Reporting-dip banner is per-user dismissible (uses `localStorage`).
- All comparisons are aggregates-only — never named teams (Works Council).
- Band thresholds: 0–40 Low Exposure · 40–70 Elevated Risk · 70+ Critical Risk.

---

## Run it locally

You'll need [Node 20+](https://nodejs.org). Check with `node -v`.

```sh
npm install
npm run dev
```

Opens at <http://localhost:5173>. Hot-reload on every save.

For a production build (used by Vercel automatically):

```sh
npm run build       # output goes to ./dist
npm run preview     # serve the built bundle locally on :4173
```

---

## Share it with your team

### Easiest path — Vercel + Slack link (recommended)

1. **Create a private GitHub repo** (personal or JET org). On <https://github.com/new>:
   - Name: `cyber-scorecard-prototype`
   - Private
   - No README / .gitignore / license (we already have them)

2. **Push this folder** to the new repo:
   ```sh
   git init
   git add .
   git commit -m "Initial prototype"
   git branch -M main
   git remote add origin git@github.com:YOUR-USER/cyber-scorecard-prototype.git
   git push -u origin main
   ```

3. **Connect to Vercel** at <https://vercel.com/new>:
   - Sign in with GitHub
   - Import the repo
   - Framework preset: **Vite** (auto-detected)
   - Click **Deploy**. ~60 seconds later you have a `cyber-scorecard-prototype.vercel.app` URL.

4. **Share the URL in your team's Slack channel.** Every push to `main` auto-redeploys.

### Optional — Lock to JET emails (Cloudflare Pages + Access)

Same idea, but you sign reviewers in via email allowlist (free for small teams).

1. Push the repo as above.
2. Go to <https://dash.cloudflare.com> → Workers & Pages → Create application → Pages → Connect to Git.
3. Pick the repo, framework preset **Vite**.
4. Once deployed, add **Cloudflare Access** with an Email allowlist of `*@justeattakeaway.com` (or whichever JET domains apply).

### Pointing the feedback chip at your team

Open [`src/data/mockData.ts`](src/data/mockData.ts) and update:

```ts
export const product = {
  ...
  feedbackUrl: 'https://justeattakeaway.slack.com/archives/CXXXXXXXX',
}
```

---

## Project structure

```
cyber-scorecard-prototype/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── vercel.json
├── index.html
├── public/favicon.svg
└── src/
    ├── main.ts
    ├── App.vue
    ├── styles/
    │   ├── tokens.css        # PIE tokens mirrored as CSS variables
    │   └── global.css        # Reset, font defaults, page background
    ├── data/
    │   └── mockData.ts       # All mock data — edit to flip scores, deltas, agent text
    ├── composables/
    │   └── useGaugeMath.ts   # Gauge geometry + easeOutRev animation
    └── components/
        ├── ScorecardOverview.vue  # Page composition + reviewer controls
        ├── PageChrome.vue         # Sonic chrome + tabs
        ├── RiskRing.vue           # The hero ring
        ├── IndexTile.vue          # CVEI / HREI / SCREI tile
        ├── ComparisonBlock.vue    # Aggregate comparison rows
        ├── TopMoverBanner.vue     # Concept A
        ├── ReportingDipBanner.vue # Concept G
        ├── DrillDrawer.vue        # Concept L
        ├── StartHereOverlay.vue   # First-load tour
        └── FeedbackChip.vue       # Bottom-right Slack link
```

---

## When you're ready to integrate with real PIE Web Components

Currently the prototype implements PIE-style components in-house using PIE design tokens (`src/styles/tokens.css`). When you move into the real Sonic Portal stack:

1. `npm install @justeattakeaway/pie-webc`
2. In `src/main.ts`, import the components you need: `import '@justeattakeaway/pie-webc/components/button.js'` etc.
3. Replace `<button class="btn-primary">` with `<pie-button variant="primary">` and so on.
4. Vite's `isCustomElement` config (already in `vite.config.ts`) already recognises `pie-*` tags.

The RiskRing is custom (PIE doesn't ship a gauge component) — that stays as-is.

---

## Known limitations

- All data is mock. There's no API.
- The "Open in Jira" buttons don't actually open anything.
- The drill drawer for HREI and SCREI uses inline mock data; CVEI uses the full `mockData.ts` structure.
- Mobile layout is functional but not as polished as desktop.
- No light theme. Dark only.
