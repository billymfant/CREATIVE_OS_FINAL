import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RPG_FILE = path.join(__dirname, '..', 'data', 'rpg-state.json');

// ═══════════════════════════════════════════════════════
// RPG ITEM & LEVELLING SYSTEM
// Agents level up from usage and unlock items that
// permanently modify their behaviour and system prompts.
// ═══════════════════════════════════════════════════════

export const ITEMS = {
  strategist: [
    {
      id: 'human_truth_lens', name: 'Human Truth Lens', tier: 1,
      xp_required: 3, emoji: '🔍', rarity: 'uncommon',
      description: 'Unlocks after 3 briefs. Sharpens insight to find the emotional core others miss.',
      prompt_modifier: `EQUIPPED ITEM — Human Truth Lens (Tier 1):
Your strategies now automatically identify the irreducible human truth before anything else.
Ask: "What is the one feeling this experience creates that couldn't exist without it?"
This single question transforms your output from clever to unforgettable.`
    },
    {
      id: 'cultural_radar', name: 'Cultural Radar', tier: 2,
      xp_required: 8, emoji: '📡', rarity: 'rare',
      description: 'Unlocks after 8 briefs. Detects cultural tension points that make ideas timely.',
      prompt_modifier: `EQUIPPED ITEM — Cultural Radar (Tier 2):
You now automatically identify the cultural moment or tension that makes this idea timely.
Your strategies reference real cultural context. An idea that taps into NOW is worth 10x one that is merely good.`
    },
    {
      id: 'brand_oracle', name: 'Brand Oracle', tier: 3,
      xp_required: 20, emoji: '🔮', rarity: 'legendary',
      description: 'Unlocks after 20 briefs. You see what the brand needs before the client does.',
      prompt_modifier: `EQUIPPED ITEM — Brand Oracle (Tier 3 — Legendary):
You now identify not just what the brief asks for, but what the brand actually needs — even when those differ.
Include a section: WHAT THE BRAND REALLY NEEDS — this may differ from the brief.`
    }
  ],
  copywriter: [
    {
      id: 'sharp_pencil', name: 'Sharp Pencil', tier: 1,
      xp_required: 3, emoji: '✏️', rarity: 'uncommon',
      description: 'Unlocks after 3 briefs. Every word is earned. Nothing is wasted.',
      prompt_modifier: `EQUIPPED ITEM — Sharp Pencil (Tier 1):
Rule: if removing a word doesn't change the meaning, remove it.
Rule: if the sentence is longer than 8 words, find a way to split it.
Rule: the most important word in any line is the last one — put the punch there.`
    },
    {
      id: 'voice_key', name: 'Voice Key', tier: 2,
      xp_required: 8, emoji: '🗝️', rarity: 'rare',
      description: 'Unlocks after 8 briefs. You unlock the brand\'s true voice instantly.',
      prompt_modifier: `EQUIPPED ITEM — Voice Key (Tier 2):
Before writing any copy, produce a voice fingerprint:
"This brand sounds like [person] who [characteristic]. Never [what they avoid]. Always [signature move]."
Every line of copy is checked against this fingerprint.`
    },
    {
      id: 'cannes_pen', name: 'Cannes Pen', tier: 3,
      xp_required: 20, emoji: '🏆', rarity: 'legendary',
      description: 'Unlocks after 20 briefs. You write copy that wins awards.',
      prompt_modifier: `EQUIPPED ITEM — Cannes Pen (Tier 3 — Legendary):
For every headline, write it 5 ways internally and choose the most unexpected one that still lands.
Include: ALTERNATIVE HEADLINE (the one I almost sent) — showing the runner-up.`
    }
  ],
  ui_designer: [
    {
      id: 'grid_compass', name: 'Grid Compass', tier: 1,
      xp_required: 3, emoji: '📐', rarity: 'uncommon',
      description: 'Unlocks after 3 briefs. Perfect spatial rhythm in every design.',
      prompt_modifier: `EQUIPPED ITEM — Grid Compass (Tier 1):
Specify exact spatial systems: base unit, column count, gutter width, margin scale.
All spacing recommendations are expressed as multiples of the base unit.`
    },
    {
      id: 'colour_theory_goggles', name: 'Colour Theory Goggles', tier: 2,
      xp_required: 8, emoji: '🕶️', rarity: 'rare',
      description: 'Unlocks after 8 briefs. You see colour relationships others miss.',
      prompt_modifier: `EQUIPPED ITEM — Colour Theory Goggles (Tier 2):
Include dominant/secondary/accent split ratio (e.g. 70/20/10), emotional role of each colour,
and the one colour that would destroy the system if misused.
Specify exact usage rule for the accent: "appears only on [specific elements]."`
    },
    {
      id: 'pentagram_eye', name: 'Pentagram Eye', tier: 3,
      xp_required: 20, emoji: '👁️', rarity: 'legendary',
      description: 'Unlocks after 20 briefs. You design at Pentagram level.',
      prompt_modifier: `EQUIPPED ITEM — Pentagram Eye (Tier 3 — Legendary):
Include: DESIGN PHILOSOPHY (2 sentences on conceptual underpinning),
THE RULE (the one rule that makes every future design decision obvious),
THE UNEXPECTED CHOICE (the single decision that will make this unforgettable).`
    }
  ],
  motion: [
    {
      id: 'timing_watch', name: 'Timing Watch', tier: 1,
      xp_required: 3, emoji: '⏱️', rarity: 'uncommon',
      description: 'Unlocks after 3 briefs. Millisecond-precise timing direction.',
      prompt_modifier: `EQUIPPED ITEM — Timing Watch (Tier 1):
Every animation includes exact millisecond durations and exact CSS cubic-bezier values — never generic easing names.
Specify delay patterns as precise sequences (e.g. "100ms, 180ms, 260ms stagger").`
    },
    {
      id: 'physics_engine', name: 'Physics Engine', tier: 2,
      xp_required: 8, emoji: '⚙️', rarity: 'rare',
      description: 'Unlocks after 8 briefs. Motion has mass, momentum and friction.',
      prompt_modifier: `EQUIPPED ITEM — Physics Engine (Tier 2):
Define a PHYSICS PERSONALITY: Mass (light/medium/heavy), Damping (how quickly oscillations settle),
Friction (how quickly moving things stop). These three values govern all motion in the experience.`
    },
    {
      id: 'buck_studio_pass', name: 'Buck Studio Pass', tier: 3,
      xp_required: 20, emoji: '🎬', rarity: 'legendary',
      description: 'Unlocks after 20 briefs. You direct motion like Buck or Psyop.',
      prompt_modifier: `EQUIPPED ITEM — Buck Studio Pass (Tier 3 — Legendary):
Include: SIGNATURE MOVE (the one animation that defines the entire experience),
MOTION NARRATIVE (how the animation arc tells the same story as the creative concept),
THE MOMENT (the single frame that, if screenshotted, communicates everything).`
    }
  ],
  creative_director: [
    {
      id: 'red_pen', name: 'Red Pen', tier: 1,
      xp_required: 3, emoji: '🖊️', rarity: 'uncommon',
      description: 'Unlocks after 3 briefs. Your creative reviews are sharp and actionable.',
      prompt_modifier: `EQUIPPED ITEM — Red Pen (Tier 1):
Include a WHAT I CHANGED AND WHY section. For every modification you make to the team's work,
explain the creative rationale. The developer should understand the thinking, not just receive instructions.`
    },
    {
      id: 'creative_compass', name: 'Creative Compass', tier: 2,
      xp_required: 8, emoji: '🧭', rarity: 'rare',
      description: 'Unlocks after 8 briefs. You always know true creative north.',
      prompt_modifier: `EQUIPPED ITEM — Creative Compass (Tier 2):
Define TRUE CREATIVE NORTH before reviewing any team work. One sentence. The direction everything must point toward.
Every mandate you issue is tested against this north star before it is written.`
    },
    {
      id: 'grand_prix_eye', name: 'Grand Prix Eye', tier: 3,
      xp_required: 20, emoji: '🦁', rarity: 'legendary',
      description: 'Unlocks after 20 briefs. You see Grand Prix potential in every brief.',
      prompt_modifier: `EQUIPPED ITEM — Grand Prix Eye (Tier 3 — Legendary):
Review every project with: "Could this win a Cannes Grand Prix?"
WHAT WOULD MAKE THIS EXTRAORDINARY now provides 3 specific, buildable suggestions ranked by creative impact.`
    }
  ],
  developer: [
    {
      id: 'performance_chip', name: 'Performance Chip', tier: 1,
      xp_required: 3, emoji: '⚡', rarity: 'uncommon',
      description: 'Unlocks after 3 briefs. Every animation runs at 60fps.',
      prompt_modifier: `EQUIPPED ITEM — Performance Chip (Tier 1):
Only animate transform and opacity (never width, height, top, left).
On canvas: use typed arrays, avoid object creation in the animation loop.
60fps is not a goal — it is the minimum acceptable standard.`
    },
    {
      id: 'interaction_gloves', name: 'Interaction Gloves', tier: 2,
      xp_required: 8, emoji: '🥊', rarity: 'rare',
      description: 'Unlocks after 8 briefs. Every interaction feels physical and satisfying.',
      prompt_modifier: `EQUIPPED ITEM — Interaction Gloves (Tier 2):
Apply the "juice" principle to every interactive element.
Every click: visual feedback (scale/color) + settling animation.
Every hover: state change in under 150ms. Every form: loading + success + error states, all animated.`
    },
    {
      id: 'fwa_trophy', name: 'FWA Trophy', tier: 3,
      xp_required: 20, emoji: '🏅', rarity: 'legendary',
      description: 'Unlocks after 20 briefs. You build FWA Site of the Year quality.',
      prompt_modifier: `EQUIPPED ITEM — FWA Trophy (Tier 3 — Legendary):
Custom cursor that responds to context. Smooth scroll with momentum.
At least one "wow moment" — a technical achievement that makes developers say "how did they do that?"
The loading screen is itself an experience. Every detail is considered.`
    }
  ],
  qa: [
    {
      id: 'bug_scanner', name: 'Bug Scanner', tier: 1,
      xp_required: 3, emoji: '🔬', rarity: 'uncommon',
      description: 'Unlocks after 3 briefs. Nothing broken ships.',
      prompt_modifier: `EQUIPPED ITEM — Bug Scanner (Tier 1):
Run a systematic 10-point checklist on every piece of code you review.
Document each check as PASS/FAIL with a specific observation.
Your QA report is a document the developer can act on immediately, not general feedback.`
    },
    {
      id: 'user_empathy_lens', name: 'User Empathy Lens', tier: 2,
      xp_required: 8, emoji: '👓', rarity: 'rare',
      description: 'Unlocks after 8 briefs. You experience the output as the user does.',
      prompt_modifier: `EQUIPPED ITEM — User Empathy Lens (Tier 2):
Review from 3 perspectives:
THE FIRST-TIMER: What confuses them in the first 10 seconds?
THE EXPLORER: What reward do they find if they try everything?
THE RETURNER: Is there any reason to come back?`
    },
    {
      id: 'client_shield', name: 'Client Shield', tier: 3,
      xp_required: 20, emoji: '🛡️', rarity: 'legendary',
      description: 'Unlocks after 20 briefs. Nothing ships that would embarrass a client.',
      prompt_modifier: `EQUIPPED ITEM — Client Shield (Tier 3 — Legendary):
Give a SHIPPING CONFIDENCE SCORE from 1-10 with specific reasoning.
Below 7: MUST FIX list. 7-8: SHOULD FIX list with priority. 9-10: NICE TO HAVE list.`
    }
  ]
};

// ── State Management ──

async function loadState() {
  try {
    await fs.mkdir(path.join(__dirname, '..', 'data'), { recursive: true });
    const raw = await fs.readFile(RPG_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return createInitialState();
  }
}

function createInitialState() {
  const agents = ['strategist', 'copywriter', 'ui_designer', 'motion', 'creative_director', 'developer', 'qa'];
  const state = { agents: {}, total_runs: 0, created_at: new Date().toISOString() };
  agents.forEach(id => {
    state.agents[id] = { xp: 0, level: 0, runs: 0, equipped_items: [], unlocked_items: [], brief_types: {} };
  });
  return state;
}

async function saveState(state) {
  await fs.mkdir(path.join(__dirname, '..', 'data'), { recursive: true });
  await fs.writeFile(RPG_FILE, JSON.stringify(state, null, 2));
}

export async function awardXP(briefType, agentWeights) {
  const state = await loadState();
  state.total_runs++;
  const newUnlocks = [];

  Object.entries(agentWeights).forEach(([agentId, weight]) => {
    const agent = state.agents[agentId];
    if (!agent || weight === 0) return;

    const xpGained = Math.round(weight * 0.5 + 1);
    agent.xp += xpGained;
    agent.runs++;
    agent.brief_types[briefType] = (agent.brief_types[briefType] || 0) + 1;

    const agentItems = ITEMS[agentId] || [];
    agentItems.forEach(item => {
      if (!agent.unlocked_items.includes(item.id) && agent.runs >= item.xp_required) {
        agent.unlocked_items.push(item.id);
        if (!agent.equipped_items.includes(item.id)) agent.equipped_items.push(item.id);
        newUnlocks.push({ agent: agentId, item });
      }
    });

    agent.level = Math.floor(agent.runs / 5);
  });

  await saveState(state);
  return { state, newUnlocks };
}

export async function getItemModifiers(agentId) {
  const state = await loadState();
  const agent = state.agents[agentId];
  if (!agent) return '';

  const agentItems = ITEMS[agentId] || [];
  return agent.equipped_items
    .map(itemId => agentItems.find(i => i.id === itemId))
    .filter(Boolean)
    .map(item => item.prompt_modifier)
    .join('\n\n');
}

export async function getRPGState() { return loadState(); }

export async function equipItem(agentId, itemId, equip = true) {
  const state = await loadState();
  const agent = state.agents[agentId];
  if (!agent || !agent.unlocked_items.includes(itemId)) return false;
  if (equip && !agent.equipped_items.includes(itemId)) agent.equipped_items.push(itemId);
  else if (!equip) agent.equipped_items = agent.equipped_items.filter(id => id !== itemId);
  await saveState(state);
  return true;
}
