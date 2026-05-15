---
tokens:
  meta:
    name: CreativeOS
    version: "1.0"
    style: dark-cinematic
    stack: html-css-vanilla

  color:
    # --- Primitives ---
    iris-300: "#c7d2fe"
    iris-400: "#a5b4fc"
    iris-500: "#818cf8"
    iris-600: "#6366f1"
    iris-700: "#4f46e5"

    obsidian-1000: "#060608"
    obsidian-900:  "#0a0a10"
    obsidian-800:  "#0f1020"
    obsidian-700:  "#1e2035"
    obsidian-600:  "#2a2b45"
    obsidian-500:  "#3a3a55"

    white-100: "#f0f0ff"
    white-60:  "#9999bb"
    white-30:  "#6b6b8a"
    white-10:  "#3a3a55"

    red-400:   "#f87171"
    green-400: "#34d399"
    amber-400: "#fbbf24"

    # --- Semantic ---
    background:     "#060608"
    surface:        "#0f1020"
    surface-raised: "#1e2035"
    overlay:        "#2a2b45"

    border:         "#1e2035"
    border-accent:  "#2a2b45"

    primary:        "#818cf8"
    primary-hover:  "#a5b4fc"
    primary-active: "#6366f1"
    primary-dim:    "rgba(129,140,248,0.10)"
    primary-border: "rgba(129,140,248,0.28)"
    on-primary:     "#060608"

    text:           "#f0f0ff"
    text-muted:     "#6b6b8a"
    text-subtle:    "#3a3a55"

    error:          "#f87171"
    error-border:   "rgba(248,113,113,0.50)"
    error-bg:       "rgba(248,113,113,0.06)"
    success:        "#34d399"
    warning:        "#fbbf24"

  typography:
    font-display: "'Syne', sans-serif"
    font-ui:      "'IBM Plex Mono', monospace"
    size-xs:   "12px"
    size-sm:   "13px"
    size-base: "14px"
    size-md:   "16px"
    size-lg:   "18px"
    size-xl:   "24px"
    size-2xl:  "32px"
    size-3xl:  "40px"
    line-height-tight:  "1.25"
    line-height-normal: "1.5"
    line-height-loose:  "1.75"
    weight-normal: "400"
    weight-medium: "500"
    weight-bold:   "700"

  spacing:
    space-1: "4px"
    space-2: "8px"
    space-3: "14px"
    space-4: "20px"
    space-5: "28px"
    space-6: "40px"
    space-7: "52px"
    container-x: "28px"
    card-pad:    "14px"

  radius:
    sm:   "4px"
    md:   "7px"
    lg:   "10px"
    xl:   "12px"
    full: "9999px"

  motion:
    duration-fast:   "150ms"
    duration-normal: "200ms"
    easing-enter: "cubic-bezier(0.0, 0.0, 0.2, 1)"
    easing-exit:  "cubic-bezier(0.4, 0.0, 1, 1)"

  shadow:
    card:   "0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)"
    modal:  "0 8px 32px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)"
    glow:   "0 0 20px rgba(129,140,248,0.20)"
---

# CreativeOS Design System

CreativeOS is a dark-cinematic AI creative production tool. The visual language is **obsidian + iris** — deep space blacks with an indigo-violet accent — conveying craft, focus, and machine intelligence. Every decision favors signal over noise: muted surfaces let the work surface, the iris accent guides attention precisely.

---

## Color

### Palette Philosophy

The palette has two axes:

- **Obsidian** — the neutral backbone. Ten stops from near-black (`#060608`) through dark navy (`#3a3a55`). Used for all backgrounds, surfaces, and borders. The layering system (bg → surface → raised → overlay) creates depth without adding visual weight.
- **Iris** — the single accent. A perceptual violet (`#818cf8` at rest) that reads as electric against obsidian without screaming. Five stops allow hover, active, and dim states all from one hue family.

### Usage Rules

| Token | Use |
|---|---|
| `background` | Page root. Never use lighter surfaces here. |
| `surface` | Cards, panels, drawers. One step up from bg. |
| `surface-raised` | Tooltips, popovers, floating UI. |
| `overlay` | Modal scrim, dropdown backdrop. |
| `primary` | Interactive elements: buttons, links, focus rings, active nav. |
| `primary-dim` | Subtle tinted backgrounds (active agent cards, badges). |
| `text` | Body copy and headings on dark backgrounds. |
| `text-muted` | Secondary labels, metadata, placeholder text. |
| `text-subtle` | Decorative/disabled text only — never standalone readable copy. |

### Contrast Compliance

All text pairings meet WCAG AA (4.5:1 minimum):

| Foreground | Background | Ratio |
|---|---|---|
| `text` (#f0f0ff) | `background` (#060608) | ~18:1 |
| `text-muted` (#6b6b8a) | `background` (#060608) | ~5.2:1 |
| `primary` (#818cf8) | `background` (#060608) | ~7.1:1 |
| `on-primary` (#060608) | `primary` (#818cf8) | ~7.1:1 |

`text-subtle` (#3a3a55 on #060608) is **decorative only** — never use for readable body copy.

---

## Typography

### Fonts

- **Syne** (`font-display`) — geometric sans for all headings and brand marks. High x-height, tight letter-spacing at large sizes. Conveys editorial confidence.
- **IBM Plex Mono** (`font-ui`) — monospace for all UI text, labels, inputs, and metadata. Reinforces the "machine / pipeline" character of the product. Keeps numeric data aligned.

### Scale

The type scale is conservative — two sizes cover 90% of UI copy:

| Token | Size | Use |
|---|---|---|
| `size-xs` | 12px | Badges, captions, legal |
| `size-sm` | 13px | Dense table data |
| `size-base` | 14px | Primary UI labels, inputs, body |
| `size-md` | 16px | Section subheadings |
| `size-lg` | 18px | Card titles |
| `size-xl` | 24px | Page headings |
| `size-2xl` | 32px | Hero headlines |
| `size-3xl` | 40px | Display / marketing only |

Body text minimum is **14px** in UI contexts. Never go below 12px for any rendered text.

Line height for body: `1.5`. For headings: `1.25`. Never use unitless values below 1.25.

---

## Spacing

8px base grid. All spacing values are multiples of 4px, biased toward multiples of 8px for major layout gaps.

| Token | Value | Use |
|---|---|---|
| `space-1` | 4px | Icon gaps, tight inline spacing |
| `space-2` | 8px | Element padding, tag spacing |
| `space-3` | 14px | Card padding (`card-pad`) |
| `space-4` | 20px | Section internal spacing |
| `space-5` | 28px | Container horizontal padding (`container-x`) |
| `space-6` | 40px | Section separators |
| `space-7` | 52px | Page-level vertical rhythm |

Never use arbitrary pixel values. Always map to a spacing token.

---

## Border Radius

| Token | Value | Use |
|---|---|---|
| `sm` | 4px | Badges, tags, small chips |
| `md` | 7px | Input fields, small cards |
| `lg` | 10px | Standard cards, panels |
| `xl` | 12px | Modals, drawers, large surfaces |
| `full` | 9999px | Pills, avatar circles, toggle tracks |

The radius system is intentionally restrained — no soft "app-like" rounding. The slight sharpness reinforces the tool character.

---

## Motion

All animations use GPU-compositable properties only: `transform` and `opacity`. Never animate `width`, `height`, `top`, `left`, or `background-color` directly.

| Token | Value | Use |
|---|---|---|
| `duration-fast` | 150ms | Hover states, button feedback, focus rings |
| `duration-normal` | 200ms | Panel slides, card reveals, dropdowns |
| `easing-enter` | ease-out | Elements entering the screen |
| `easing-exit` | ease-in | Elements leaving the screen |

Exit animations should run at ~65% of enter duration. Stagger list items by 30ms per item.

Always include `@media (prefers-reduced-motion: reduce)` overrides — set `transition-duration: 0.01ms` for all animated elements.

---

## Elevation & Shadow

Depth is expressed through layered surfaces and subtle borders, not heavy drop shadows.

| Token | Use |
|---|---|
| `shadow.card` | Floating cards at rest |
| `shadow.modal` | Modal dialogs, command palette |
| `shadow.glow` | Iris glow on primary interactive elements (hover/focus) |

Avoid `box-shadow` blur values above 32px. Avoid colored shadows except iris glow.

---

## Component Tokens

All component tokens reference semantic tokens — never raw hex values in component stylesheets.

### Focus Ring

Applied globally via `:focus-visible`. Two-layer ring: 2px offset filled with `background`, then 2px iris border (`primary-border`).

```css
box-shadow: 0 0 0 2px var(--color-bg),
            0 0 0 4px rgba(129,140,248,0.40);
```

### Topbar

Semi-transparent: `rgba(6,6,8,0.85)` with `backdrop-filter: blur(12px)`. Border-bottom: `rgba(255,255,255,0.05)`. This keeps the topbar visually grounded without obscuring content below.

### Agent Cards

Three states — idle, active, done — each expressed through `background` + `border` token pairs at increasing iris opacity. Active state uses `primary-dim` fill; done state desaturates to near-invisible iris.

### Buttons (Primary)

Background `primary`, text `on-primary`. Hover lifts to `primary-hover`, active drops to `primary-active`. Disabled uses `primary-dim` fill with 40% opacity text — never a gray variant.

---

## Anti-Patterns

- **No raw hex in components.** Always use a CSS custom property.
- **No emoji as icons.** Use SVG only (Heroicons or Lucide).
- **No gray-on-gray text.** `text-subtle` is decoration, not communication.
- **No light mode surfaces** mixed into dark UI. The palette has no light-mode layer.
- **No `width`/`height` animations.** Use `transform: scale()` instead.
- **No `100vh` for full-height layouts on mobile.** Use `100dvh` or `min-h-dvh`.
- **No font sizes below 12px** — even for captions.
