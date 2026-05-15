# CreativeOS — Session Handoff
**Date:** 2026-05-15  
**Branch:** `main`

---

## What Was Done This Session

### 1. Skills Installed
- 27 skills from `ComposioHQ/awesome-claude-skills` installed into `.claude/skills/`
- No API key required for any of them
- `connect-apps` / `connect-apps-plugin` deliberately skipped (require Composio API)
- `ui-ux-pro-max` was already present and confirmed working

### 2. DESIGN.md Created
- `DESIGN.md` at project root follows the [Google Labs design.md spec](https://github.com/google-labs-code/design.md)
- YAML front matter contains all design tokens (colors, typography, spacing, radius, motion, shadows)
- Markdown body contains rationale, contrast table, usage rules, and anti-patterns
- Tokens match `public/design-tokens.css` exactly — this is the single source of truth

### 3. Light/Dark Theme Toggle
**Files changed:**
- `public/theme.js` — new shared script (load in `<head>` for zero FOUC)
  - Sets `data-theme` on `<html>` immediately before render
  - Auto-injects sun/moon button into every `.topbar` found on the page
  - Persists choice in `localStorage` key `cos-theme` (default: dark)
- `public/design-tokens.css` — added `[data-theme="light"]` override block + `.theme-toggle` styles
- `public/index.html`, `preview.html`, `styles-explorer.html`, `usage.html` — added `<script src="theme.js">` in `<head>`
- `landing.html` intentionally excluded from theming

**Canvas (index.html only) — `isLight()` in rAF loop:**

| Element | Dark | Light |
|---|---|---|
| Background | `#000008` | `#f5f4f0` |
| Stars | `rgba(240,240,255,…)` | `rgba(99,102,241,…)` |
| Glow max-alpha | 0.50 | 0.18 |
| Hole color | `rgb(0,0,10)` | `rgb(30,32,53)` |
| Particles (back) | teal `rgb(6,182,212)` | deep-indigo `rgb(63,51,189)` |
| Particles (front) | iris `rgb(129,140,248)` | iris `rgb(99,102,241)` |
| Base alpha | 0.18 | 0.28 |

### 4. Bug Fixes (Pre-Push Audit — 6 confirmed)

| File | Bug | Fix |
|---|---|---|
| `design-tokens.css` | `--space-md` undefined, used in 4 places | Added alias `--space-md: var(--space-3)` |
| `index.html:470` | `--progress-track-bg` undefined | Changed to `--progress-bg` |
| `index.html:895` | class `yellow` on `#est-time`, CSS rule is `.warn` | Changed to `warn` |
| `landing.html` | `--indigo-500` used but never declared | Added to landing's local `:root` |
| `usage.html` | `min-height: 100vh` | Changed to `100dvh` |
| `agents/api.js` | Model string duplicated in 2 places | Extracted to `const MODEL` |

**Known non-critical (not fixed):**
- `index.html:1116` — `geo-layer` reference is null-guarded, dead code from removed feature
- `landing.html` — `SCROLL_ANIMATION.mp4` in gitignore (media), served from cloud in prod
- `agents/usage-tracker.js:9` — separate model string, update manually when upgrading

---

## Project Structure

```
CreativeOS/
├── public/
│   ├── index.html            # Main app (brief → pipeline → output)
│   ├── landing.html          # Marketing page (no theme toggle)
│   ├── preview.html          # Output preview
│   ├── usage.html            # Claude API usage dashboard
│   ├── styles-explorer.html  # UI style browser
│   ├── planet-particles.html # Standalone canvas demo
│   ├── design-tokens.css     # Single source of truth — all design tokens
│   └── theme.js              # Theme toggle script
├── agents/
│   ├── api.js                # Claude API wrapper (callAgent / callAgentRaw)
│   ├── classifier.js
│   ├── copywriter.js
│   ├── creative-director.js
│   ├── developer.js          # Generates HTML/CSS/JS output
│   ├── estimator.js
│   ├── motion.js
│   ├── qa.js
│   ├── strategist.js
│   ├── ui-designer.js
│   └── usage-tracker.js
├── server.js                 # Express server
├── creator.js                # Pipeline orchestration
├── DESIGN.md                 # Design system (Google Labs format)
└── .claude/skills/           # 30+ installed skills
```

---

## Design System Quick Reference

| | |
|---|---|
| **Colors** | Obsidian scale (bg) + Iris/indigo accent |
| **Fonts** | Syne (display) + IBM Plex Mono (UI) |
| **Spacing** | 8px base, `--space-1` (4px) → `--space-7` (52px) |
| **Theme attr** | `data-theme="dark"` (default) / `"light"` on `<html>` |
| **Token layers** | PRIMITIVES → SEMANTIC → COMPONENTS in `design-tokens.css` |

---

## Suggested Next Tasks

- [ ] Auth / billing / credits system (Phase 1 plan in previous commit)
- [ ] Test theme toggle at 375px mobile — topbar layout with added button
- [ ] Replace `SCROLL_ANIMATION.mp4` in landing.html with hosted asset or CSS fallback
- [ ] Remove `geo-layer` dead code at `index.html:1116`
- [ ] Extract shared topbar HTML into a JS include (avoid 4-file edits per topbar change)
- [ ] Update `agents/usage-tracker.js:9` model string when upgrading Claude version

---

## How to Run

```bash
npm install
node server.js
# Open http://localhost:3000
```

Requires `ANTHROPIC_API_KEY` in `.env`.
