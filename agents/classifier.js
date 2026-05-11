import { callAgent } from './api.js';

// ═══════════════════════════════════════════════════════
// BRIEF INTELLIGENCE LAYER — Layer 0
// Reads the brief and outputs the full intelligence map:
// token gravity + skill activation + creative north star
// ═══════════════════════════════════════════════════════

const SYSTEM = `You are a creative production intelligence system at the world's most awarded agency. You read project briefs and produce a complete operational map that determines how a team of AI agents should allocate their resources and expertise.

You understand all creative disciplines deeply:
- Brand strategy and activation design
- Generative art, particle systems, WebGL, canvas programming
- Game design and interactive mechanics
- UI/UX and microsite design
- Motion design and animation systems
- Frontend development at award-winning quality

Your output drives three systems:
1. TOKEN GRAVITY — how much creative resource each agent deserves (1-10 weight)
2. SKILL ACTIVATION — which specialist knowledge each agent loads
3. AGENT SILENCING — whether agents should be skipped entirely to save cost

SILENCING RULES (non-negotiable):
- GENERATIVE/CANVAS briefs: copywriter weight=1 (silent), creative_director weight=1 (silent)
- DATA_VIZ briefs: copywriter weight=1 (silent), creative_director weight=1 (silent)
- SIMPLE landing page: developer weight=4 (low), creative_director weight=2 (minimal)
- GAME briefs: copywriter weight=2 (minimal), creative_director weight=3 (minimal)
- BRAND/ACTIVATION: all agents run at full weight

Respond ONLY with valid JSON. No markdown. Start with {`;

export async function runClassifier(brief) {
  return callAgent({
    system: SYSTEM,
    user: `Analyse this brief and produce the full intelligence map: "${brief}"

Respond with this exact JSON shape:
{
  "brief_type": "GENERATIVE_ART | BRAND_ACTIVATION | GAME | MICROSITE | DATA_VIZ | TOOL | APP | MIXED",
  "complexity": "SIMPLE | MEDIUM | COMPLEX | VERY_COMPLEX",
  "primary_discipline": "The single most important creative discipline this brief demands",
  "emotional_target": "The exact emotion the final output should create in the user. 1 sentence.",
  "agent_weights": {
    "strategist": 7,
    "copywriter": 8,
    "ui_designer": 8,
    "motion": 6,
    "creative_director": 9,
    "developer": 9,
    "qa": 8
  },
  "silent_agents": ["list of agent ids with weight 1 — these will be skipped entirely"],
  "skill_activations": {
    "strategist": "brand_activation | generative_art | game_design | experiential | campaign",
    "copywriter": "brand_voice | minimal | storytelling | technical | game_ui",
    "ui_designer": "dark_cinematic | brand_system | minimal_luxury | retro | editorial | game_hud",
    "motion": "physics_based | cinematic | game_feel | brand_fluid | generative",
    "creative_director": "brand_guardian | generative_vision | game_director | experience_architect",
    "developer": "canvas_generative | brand_app | game_engine | microsite | tool_builder",
    "qa": "experience_qa | game_qa | brand_qa | technical_qa"
  },
  "token_total_recommended": 28000,
  "visual_north_star": "One sentence describing the visual ideal this experience should reach. Be specific and ambitious.",
  "technical_approach": "Specific technical recommendation for the developer — Canvas/WebGL/CSS/DOM — and exactly why.",
  "what_makes_this_special": "The one creative opportunity in this brief that most teams would miss. 1 sentence.",
  "complexity_reason": "Why this complexity level. 1 sentence."
}`,
    maxTokens: 1000
  });
}

// Token gravity calculator
// Takes agent weights (1-10) and total budget, returns exact token allocation
export function calculateTokenGravity(weights, totalBudget, silentAgents = []) {
  const agents = ['strategist', 'copywriter', 'ui_designer', 'motion', 'creative_director', 'developer', 'qa'];

  // Floor tokens — minimum per agent when running
  const floors = {
    strategist: 700, copywriter: 600, ui_designer: 700,
    motion: 600, creative_director: 900, developer: 6000, qa: 4000
  };

  // Silent agents get 0
  const activeAgents = agents.filter(a => !silentAgents.includes(a));
  const totalFloor = activeAgents.reduce((sum, a) => sum + floors[a], 0);
  const remaining = Math.max(0, totalBudget - totalFloor);
  const totalWeight = activeAgents.reduce((sum, a) => sum + (weights[a] || 5), 0);

  const allocation = {};
  agents.forEach(agent => {
    if (silentAgents.includes(agent)) {
      allocation[agent] = 0;
    } else {
      const weight = weights[agent] || 5;
      const bonus = Math.round((weight / totalWeight) * remaining);
      allocation[agent] = floors[agent] + bonus;
    }
  });

  return allocation;
}
