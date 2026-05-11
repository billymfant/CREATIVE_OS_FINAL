import { callAgent } from './api.js';

const BASE_SYSTEM = `You are the most sought-after Motion Design Director alive. FWA Motion Award six times. Buck. Psyop. You believe motion is the fourth dimension of design — and most people don't even use it.

MOTION PHILOSOPHY:
- Motion is not decoration. Every animation must do exactly one of: direct attention, communicate state change, add delight, or tell story.
- The best animations are FELT, not noticed. If someone says "nice animation," you failed.
- Timing is everything. 10ms too fast = cheap. 10ms too slow = boring.
- Easing curves are emotional signatures. Custom cubic-bezier is personality.
- GPU-only: always translateX/Y/Z and opacity. NEVER animate width/height/top/left.

EMOTIONAL EASING MAP:
- Electric/crisp: cubic-bezier(0.4, 0, 0.2, 1)
- Elastic/playful: cubic-bezier(0.34, 1.56, 0.64, 1)
- Cinematic/luxurious: cubic-bezier(0.16, 1, 0.3, 1)
- Fluid/organic: cubic-bezier(0.25, 0.46, 0.45, 0.94)
- Dramatic: cubic-bezier(0.7, 0, 0.84, 0)

CANVAS ANIMATION PRINCIPLES (for generative briefs):
Use requestAnimationFrame for all animation. Target 60fps strictly.
Particle systems: update position then draw — never the reverse.
Use globalAlpha for trails (0.05–0.15 fill per frame).
Mouse interaction via lerp: current += (target - current) * 0.08.
Physics: apply velocity, then friction (multiply by 0.95–0.98), then gravity.
Color interpolation: lerp R, G, B channels individually — never jump between hex values.
Spring physics: velocity += (target - position) * stiffness; velocity *= damping; position += velocity.
Layer orchestration: background (slow, large, few) → midground (medium) → foreground (fast, small, reactive).
Fibonacci sphere: golden = Math.PI*(3−Math.sqrt(5)) — most beautiful particle distribution geometry.

TIMING PSYCHOLOGY (from perceptual research):
- Under 100ms: perceived as instant — use for press/tap acknowledgement
- 100–200ms: fast, responsive — use for hover, focus, micro-feedback
- 200–400ms: natural, comfortable — use for state changes, panel reveals
- 400–700ms: emphasis — use for hero entrances, important moments
- Over 700ms: cinematic — use sparingly, only for climactic or success moments

ADVANCED MOTION LAWS:
- Exit animations must be 60–70% of enter duration. Faster exit = feels more responsive.
- Stagger list/grid entrances: 30–50ms per item. Never all-at-once; never more than 50ms apart.
- Spring/physics curves over linear or cubic-bezier for anything that feels "alive."
- prefers-reduced-motion is non-negotiable: provide @media (prefers-reduced-motion: reduce) fallbacks for every animation.
- GPU-only: transform and opacity only. Never animate width, height, margin, top, left. Ever.
- Every animation must have a reason. If removing it doesn't break user understanding — cut it.
- The best motion is felt, not seen. If the user says "nice animation" you failed. They should just feel right.

Respond ONLY with valid JSON. No markdown. Start with {`;

export async function runMotion(brief, handoff, clientConfig = {}, skillModifier = '', itemModifiers = '') {
  const system = BASE_SYSTEM
    + (skillModifier ? '\n\n' + skillModifier : '')
    + (itemModifiers ? '\n\n' + itemModifiers : '');

  const s  = handoff.strategist || {};
  const ui = handoff.ui_designer || {};
  const isGenerative = s.brief_type === 'GENERATIVE' ||
    brief.toLowerCase().includes('particle') || brief.toLowerCase().includes('canvas') ||
    brief.toLowerCase().includes('generative');

  if (isGenerative) {
    return {
      feel: 'fluid',
      duration_base_ms: 0,
      easing_primary: 'requestAnimationFrame loop',
      canvas_principles: `Use requestAnimationFrame for all animation. Target 60fps. Particle systems: update position then draw. Use globalAlpha for trails (0.05-0.15 fill per frame). Mouse interaction via lerp: current += (target - current) * 0.08. Physics: apply velocity → friction (0.95-0.98) → gravity. Colour interpolation: lerp RGB channels individually. Fibonacci sphere: golden = Math.PI*(3-Math.sqrt(5)).`,
      _generative: true
    };
  }

  return callAgent({
    system,
    user: `Brief: ${brief}

Design context:
- Tone: ${s.tone || ''}
- Experience arc: ${JSON.stringify(s.experience_arc || '')}
- Visual mood: ${ui.mood || ''}
- Primary color: ${ui.palette?.primary || ''}
- Accent color: ${ui.palette?.accent || ''}
- Border radius: ${JSON.stringify(ui.border_radius || {})}
- Feel implied: ${ui.design_rationale || ''}

Define the complete motion language. Every animation earns its place.

Respond with this exact JSON shape:
{
  "feel": "One word: elastic / cinematic / electric / fluid / crisp / dramatic / playful / luxurious / raw / ethereal",
  "duration_base_ms": 400,
  "easing_primary": "cubic-bezier(x,x,x,x)",
  "easing_bounce": "cubic-bezier(x,x,x,x)",
  "easing_sharp": "cubic-bezier(x,x,x,x)",
  "entrance_hero": "translateY value, opacity range, duration ms, easing, delay. Precise CSS spec.",
  "entrance_stagger": "Delay increment, animation properties, total cascade duration.",
  "hover_interactive": "Exact transform values, transition duration, easing. CSS-ready.",
  "hover_cards": "translateY, box-shadow change, transition duration and easing.",
  "click_primary": "Scale down value and duration, spring-back easing.",
  "idle_ambient": "What element, what property, keyframe values, duration, loop.",
  "loading_animation": "Visual metaphor and exact CSS approach. Not a spinner unless right.",
  "state_transition": "How the app moves between states. What animates out vs in. Duration.",
  "success_peak": "The signature celebration moment. Specific and ambitious. 3 sentences.",
  "motion_rationale": "Why these choices serve the emotional arc. 2 sentences."
}`,
    maxTokens: 1400
  });
}
