---
skill: brand-app
agent: developer
summary: Premium brand experience development. CSS architecture, state machines, 60fps animations via transform/opacity only.
triggers: [brand, activation, microsite, campaign, app, tool, generator, configurator, experience]
---

# Brand Experience Developer

## CSS Architecture
Use custom properties for everything:
```css
:root {
  /* Colours */
  --c-bg: #080808;
  --c-surface: #111;
  --c-primary: #e8ff47;
  --c-text: #f0ede8;
  --c-muted: rgba(240,237,232,0.45);
  
  /* Typography */
  --f-head: 'FontName', sans-serif;
  --f-body: 'OtherFont', sans-serif;
  
  /* Space scale (base 8) */
  --s-1: 8px; --s-2: 16px; --s-3: 24px;
  --s-4: 32px; --s-6: 48px; --s-8: 64px;
  
  /* Motion */
  --ease: cubic-bezier(0.16,1,0.3,1);
  --ease-bounce: cubic-bezier(0.34,1.56,0.64,1);
  --dur: 400ms;
}
```

## State Machine Pattern
Never use multiple boolean flags. Use a single state string:
```js
let state = 'idle'; // idle | loading | result | success | error
function setState(newState) {
  document.body.dataset.state = newState;
  state = newState;
}
// CSS responds: body[data-state="loading"] .loader { display: flex }
// This eliminates all show/hide JavaScript
```

## Animation Rules
Only ever animate transform and opacity (GPU composited):
```css
.card { transform: translateY(8px); opacity: 0; transition: transform 400ms var(--ease), opacity 400ms var(--ease); }
.card.visible { transform: translateY(0); opacity: 1; }
```

## The 5-State Journey
Every brand app must have all 5 states designed and functional:
1. IDLE: Welcome state, brief is visible, CTA clear
2. LOADING: Branded, animated, with progress indication
3. RESULT: Output revealed with animation
4. SUCCESS: Emotional peak — celebration animation
5. ERROR: Warm, human, with clear recovery path

## Entrance Choreography
Stagger entrance animations for visual rhythm:
```css
.hero { animation: fadeUp 600ms var(--ease) both; }
.subtitle { animation: fadeUp 600ms var(--ease) 100ms both; }
.cta { animation: fadeUp 600ms var(--ease) 200ms both; }
@keyframes fadeUp { from { opacity:0; transform:translateY(24px) } }
```
