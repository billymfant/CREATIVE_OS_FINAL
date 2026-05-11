import { callAgent } from './api.js';

const BASE_SYSTEM = `You are the Global Creative Director at the world's most awarded agency. 30 years. More Cannes Lions than anyone alive. Nike, Apple, Coca-Cola, Chanel, Spotify.

YOUR ROLE: You receive output from four specialists and synthesise it into a single source of truth before a developer builds anything. You are the last creative gate.

YOUR JOB IS NOT TO PRAISE. YOUR JOB IS TO MAKE IT BETTER.

You read everything with these questions:
- Does the copy actually come from the strategy? Or did the copywriter go their own way?
- Does the design serve the emotional arc? Or did the designer just pick what looks nice?
- Does the motion language match the tone?
- Are there contradictions between agents that will confuse the developer?
- What is the single weakest element — and what is the specific fix?
- Does this feel like ONE experience, or four deliverables bolted together?

YOUR AUTHORITY:
- Rewrite copy that doesn't match strategy
- Adjust color choices that feel off-brand
- Sharpen a concept that's too vague
- Add specificity where agents were too general
- Resolve contradictions between agents

YOUR OUTPUT is the Creative Direction Document — the developer's single source of truth. Opinionated, specific, complete.

SYNTHESIS FRAMEWORK (senior agency methodology):
- The 4 specialist outputs are raw material. Your job: find the through-line they all share but haven't named. Name it. Make it the spine of everything.
- Visual-copy alignment test: cover the design and read the copy alone. Cover the copy and look at the design alone. Do they describe the same brand? Same feeling? If not — fundamental misalignment. Fix it.
- The experience mandate must pass the "tattoo test": if tattooed on the developer's forearm, would it guide every ambiguous decision correctly? If not — it's not specific enough.
- What the brand stands AGAINST is as important as what it stands for. The best creative has an enemy. Ideas without opposition are directionless.
- "Does every element earn its place?" — ask this of every copy line, color choice, and interaction. Nothing survives that can't answer yes.

QUALITY GATES (run before outputting):
- Does the concept have internal tension? (Tension makes experiences memorable. Comfort makes them forgettable.)
- Is the headline the bravest version of itself? Or did the copywriter play safe?
- Does the visual mood match the emotional arc from strategy?
- Are there any contradictions between agents that will cause the developer to make the wrong call?
- Is this ONE experience, or four deliverables that happen to share a file?

Respond ONLY with valid JSON. No markdown. Start with {`;

export async function runCreativeDirector(brief, handoff, skillModifier = '', itemModifiers = '') {
  const system = BASE_SYSTEM
    + (skillModifier ? '\n\n' + skillModifier : '')
    + (itemModifiers ? '\n\n' + itemModifiers : '');

  const s  = handoff.strategist || {};
  const c  = handoff.copywriter || {};
  const ui = handoff.ui_designer || {};
  const m  = handoff.motion || {};
  const intel = handoff.intelligence || {};

  // Compressed handoff — only what the CD needs
  const compressedHandoff = `
INTELLIGENCE:
- Visual north star: ${intel.visual_north_star || ''}
- Technical approach: ${intel.technical_approach || ''}
- What makes this special: ${intel.what_makes_this_special || ''}

STRATEGIST:
- Human truth: ${s.human_truth || ''}
- Concept: ${s.concept || ''}
- Tone: ${s.tone || ''}
- Experience arc: ${JSON.stringify(s.experience_arc || '')}
- What NOT to do: ${s.what_not_to_do || ''}

COPYWRITER:
- App name: ${c.app_name || ''} | Tagline: ${c.tagline || ''}
- Headline: ${c.headline || ''}
- CTA: ${c.cta_primary || ''} | Voice: ${c.voice_notes || ''}

UI DESIGNER:
- Background: ${ui.palette?.background || ''} | Primary: ${ui.palette?.primary || ''} | Accent: ${ui.palette?.accent || ''}
- Fonts: ${ui.font_heading || ''} / ${ui.font_body || ''}
- Mood: ${ui.mood || ''} | Motif: ${ui.visual_motif || ''}

MOTION:
- Feel: ${m.feel || ''} | Success: ${m.success_peak || ''}`;

  return callAgent({
    system,
    user: `BRIEF: ${brief}

${compressedHandoff}

Review everything. Find what's weak. Make the call.

Respond with this exact JSON shape:
{
  "cd_verdict": "Honest assessment — what's strong, weak, what you changed and why. 3-4 sentences. Be direct.",
  "concept_refined": "The concept sharpened to its irreducible core. 2 sentences. Every word earns its place.",
  "experience_mandate": "The single directive governing every creative decision. 1 powerful sentence.",
  "copy_final": {
    "app_name": "Final approved name",
    "tagline": "Final approved tagline",
    "headline": "Final approved headline",
    "subheadline": "Final approved subheadline",
    "cta_primary": "Final CTA",
    "cta_secondary": "Final secondary CTA",
    "loading_message": "Final loading copy",
    "success_message": "Final success copy",
    "ui_lines": ["Final line 1", "Final line 2", "Final line 3", "Final line 4", "Final line 5", "Final line 6"]
  },
  "design_mandates": [
    "5-7 specific design decisions the developer must implement exactly",
    "E.g: Hero headline is 72px, fills 80% of viewport width",
    "E.g: Accent color appears ONLY on primary CTA and success state",
    "E.g: All cards: border 1px solid, border-radius 12px, padding 24px, no shadow",
    "These are not suggestions. They are mandates."
  ],
  "motion_mandates": [
    "4-5 specific animations the developer must implement exactly",
    "E.g: Hero enters translateY(40px)→0, opacity 0→1, 700ms cubic-bezier(0.16,1,0.3,1)",
    "E.g: Primary CTA mousedown: scale(0.96) 80ms, release: spring to 1 200ms",
    "E.g: Success: radial burst from button center, expands to fill viewport 800ms"
  ],
  "interaction_spec": "Complete user journey. Every step, every state, every transition. 6-8 sentences.",
  "technical_priorities": [
    "60fps non-negotiable — GPU-composited transforms only",
    "2-3 more specific priorities for this brief"
  ],
  "what_would_make_this_fail": "2-3 specific things that if the developer gets wrong, the brief fails.",
  "what_would_make_this_extraordinary": "1-2 specific opportunities to elevate from good to unforgettable."
}`,
    maxTokens: 3000
  });
}
