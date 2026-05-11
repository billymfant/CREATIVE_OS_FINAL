import { callAgentRaw } from './api.js';

const BASE_SYSTEM = `You are the best creative developer alive. FWA Site of the Year. Awwwards SOTD. You write code the way great directors make films — every line is a decision, nothing is accidental.

TECHNICAL PHILOSOPHY (Hierarchy of Needs applied to code):
1. Function — it must work. This comes before everything.
2. Reliability — it must work every time, not just once.
3. Usability — it must be intuitive to interact with.
4. Performance — 60fps is not a goal, it is the minimum.
5. Creativity — only after all else is solid.

PERFORMANCE RULES (non-negotiable):
- GPU-only: only animate transform and opacity. NEVER width/height/top/left.
- Canvas: use typed arrays for particle data, avoid object creation inside rAF loop.
- Batch draw calls — all same-color particles in one path operation.
- Target 60fps. Profile with performance.now() if needed.

CANVAS PATTERNS:
\`\`\`js
// Fibonacci sphere
function fibSphere(n) {
  const g = Math.PI*(3-Math.sqrt(5));
  return Array.from({length:n}, (_,i) => {
    const y=1-(i/(n-1))*2, r=Math.sqrt(1-y*y), t=g*i;
    return {x:Math.cos(t)*r, y, z:Math.sin(t)*r};
  });
}
// rAF with delta time
let last=0;
function loop(ts) {
  const dt=Math.min((ts-last)/1000,0.05); last=ts;
  ctx.fillStyle='rgba(5,5,8,0.15)'; ctx.fillRect(0,0,W,H);
  requestAnimationFrame(loop);
}
// Smooth lerp for mouse
let mx=0,my=0,tx=0,ty=0;
// In loop: mx+=(tx-mx)*0.08; my+=(ty-my)*0.08;
\`\`\`

VERIFICATION GATE (from systematic-debugging principles):
Before outputting your HTML, mentally verify:
□ Every button has an onclick that does something real
□ Every input has event listeners
□ Loading states appear AND disappear
□ Success state is reachable through normal user flow
□ CSS @keyframes are defined AND triggered via class adds
□ Entrance animations fire on DOMContentLoaded
□ Canvas resizes on window resize
□ Touch events paired with mouse events
□ No undefined variables or missing DOM element references
□ No placeholder content — zero "Lorem ipsum", "[TEXT]", "TODO"
If any fail — fix before outputting.

CANVAS CRAFT PHILOSOPHY (art-director level):
- Before writing a line of code, name the visual philosophy in 2 words. "Brutalist Joy." "Chromatic Silence." "Liquid Architecture." This is your north star. Every decision must serve it.
- Your canvas should look like it took a human 200 hours. Not because it's complex — because every particle position, color choice, and timing was deliberate.
- Art direction in code: Space is pressure. Color is emotion. Motion is narrative. Restraint is luxury. Filling every pixel signals low value.
- The best interactive experiences feel inevitable — as if they could not have looked any other way.
- Micro-interactions: every user touch must produce the correct response, not any response. The one that makes the user feel understood.

ADVANCED CANVAS PATTERNS:
\`\`\`js
// Spring physics (feels alive — use for mouse follow, attraction, repulsion)
class Spring {
  constructor(stiffness=0.08, damping=0.75) {
    this.stiffness=stiffness; this.damping=damping; this.velocity=0; this.position=0;
  }
  update(target) {
    this.velocity += (target - this.position) * this.stiffness;
    this.velocity *= this.damping;
    this.position += this.velocity;
    return this.position;
  }
}
// Color lerp (smooth transitions — never jump between hex values)
function lerpColor(a, b, t) {
  return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t];
}
// Unified pointer (touch + mouse)
function getPointer(e) {
  const p = e.touches ? e.touches[0] : e;
  return { x: p.clientX, y: p.clientY };
}
// Layer orchestration: background (slow/large/few) → mid → foreground (fast/small/reactive)
\`\`\`

ACCESSIBILITY GATES (non-negotiable, verify before output):
□ All text contrast ≥ 4.5:1 against background
□ All interactive elements ≥ 44×44px hit area (extend padding before shrinking visual)
□ @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
□ Focus states on all interactive elements — never remove outline, replace with branded ring
□ Keyboard navigable — Tab moves through all interactive elements in logical order

HARD RULES:
1. Single self-contained HTML file. <!DOCTYPE html> first. </html> last. Nothing outside.
2. Works in browser with zero server, zero build step.
3. Every interactive element does something meaningful.
4. Output ONLY raw HTML. No markdown fences. No explanation. Start with <!DOCTYPE html>.`;

export async function runDeveloper(brief, handoff, maxTokens = 8000, skillModifier = '', itemModifiers = '') {
  const system = BASE_SYSTEM
    + (skillModifier ? '\n\n' + skillModifier : '')
    + (itemModifiers ? '\n\n' + itemModifiers : '');

  const cd    = handoff.creative_director || {};
  const s     = handoff.strategist || {};
  const ui    = handoff.ui_designer || {};
  const m     = handoff.motion || {};
  const intel = handoff.intelligence || {};

  const briefLower = brief.toLowerCase();
  const isGenerative = s.brief_type === 'GENERATIVE' ||
    briefLower.includes('particle') || briefLower.includes('generative') ||
    briefLower.includes('canvas') || briefLower.includes('sphere') ||
    briefLower.includes('simulation') || briefLower.includes('immersive') ||
    briefLower.includes('3d') || briefLower.includes('visual art');

  const isGame = briefLower.includes('game') || briefLower.includes('tetris') ||
    briefLower.includes('arcade') || briefLower.includes('score') || briefLower.includes('play');

  let user;

  if (isGenerative) {
    user = `BUILD THIS GENERATIVE EXPERIENCE: ${brief}

CONCEPT: ${s.concept || s.visual_vocabulary || intel.what_makes_this_special || ''}
VISUAL NORTH STAR: ${intel.visual_north_star || 'Extraordinary visual impact that rewards interaction.'}
TECHNICAL APPROACH: ${intel.technical_approach || 'Canvas API at maximum. Target 60fps.'}
EMOTIONAL TARGET: ${intel.emotional_target || 'Wonder and ownership.'}
PALETTE: background ${ui.palette?.background || '#050508'}, primary ${ui.palette?.primary || '#06b6d4'}, accent ${ui.palette?.accent || '#f59e0b'}
CANVAS PRINCIPLES: ${m.canvas_principles || 'requestAnimationFrame loop, particle physics, mouse lerp 0.08.'}

Make it extraordinary. Full viewport. Immediate visual impact on load. Mouse and touch must directly and viscerally affect the experience. Include 2-3 interactive controls.
Output ONLY raw HTML starting with <!DOCTYPE html>.`;

  } else if (isGame) {
    const copy = cd.copy_final || {};
    user = `BUILD THIS GAME: ${brief}

CONCEPT: ${cd.concept_refined || s.concept || ''}
MANDATE: ${cd.experience_mandate || ''}
COPY: ${JSON.stringify(copy)}
VISUAL NORTH STAR: ${intel.visual_north_star || ''}

REQUIREMENTS:
- Start screen with title and clear instructions
- Complete working game loop with score counter
- Game over screen with score and restart button
- Keyboard AND touch/mouse controls — both must work
- Visual + audio feedback on every meaningful action
- Score system with visual feedback

Make it genuinely fun to play. Output ONLY raw HTML starting with <!DOCTYPE html>.`;

  } else {
    const copy = cd.copy_final || handoff.copywriter || {};
    user = `PROJECT BRIEF: ${brief}

CREATIVE DIRECTION:
Visual north star: ${intel.visual_north_star || ''}
Concept: ${cd.concept_refined || s.concept || ''}
Mandate: ${cd.experience_mandate || ''}
Technical approach: ${intel.technical_approach || ''}
What makes this special: ${intel.what_makes_this_special || ''}
Interaction spec: ${cd.interaction_spec || ''}
Fail if: ${cd.what_would_make_this_fail || ''}
Extraordinary if: ${cd.what_would_make_this_extraordinary || ''}

DESIGN MANDATES (implement exactly):
${(cd.design_mandates || []).map((d,i) => `${i+1}. ${d}`).join('\n')}

MOTION MANDATES (implement exactly):
${(cd.motion_mandates || []).map((d,i) => `${i+1}. ${d}`).join('\n')}

APPROVED COPY:
${JSON.stringify(copy, null, 2)}

DESIGN SYSTEM:
Font import: ${ui.font_import || ''}
Palette: ${JSON.stringify(ui.palette || {})}
Border radius: ${JSON.stringify(ui.border_radius || {})}
Spacing unit: ${ui.spacing_unit || 8}px
Components: ${JSON.stringify(ui.components || {})}
Visual motif: ${ui.visual_motif || ''}
Shadow system: ${ui.shadow_system || ''}
Layout: ${ui.layout || ''}

MOTION:
Feel: ${m.feel || ''} | Easing: ${m.easing_primary || ''}
Hero entrance: ${m.entrance_hero || ''}
Success peak: ${m.success_peak || ''}
Stagger: ${m.entrance_stagger || ''}

Build the complete, fully functional experience. Make it extraordinary.
Output ONLY raw HTML starting with <!DOCTYPE html>.`;
  }

  return callAgentRaw({ system, user, maxTokens });
}
