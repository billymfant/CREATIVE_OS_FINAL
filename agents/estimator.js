import { callAgent } from './api.js';

const SYSTEM = `You are a senior technical producer at a top creative agency. You read project briefs and estimate complexity and cost before the pipeline runs. You understand AI token costs, frontend complexity, and what makes a project simple vs complex.

GRAVITY RULES:
- GENERATIVE/CANVAS/PARTICLE: Developer MAXIMUM (12k-16k), QA MAXIMUM, Copywriter SILENT, Creative Director SILENT
- GAME: Developer MAXIMUM (10k-14k), QA MAXIMUM, Motion HIGH, others MINIMAL
- LANDING PAGE/MICROSITE: Copywriter MAXIMUM, UI Designer MAXIMUM, Developer LOW (3k-5k)
- DATA VIZ: Developer MAXIMUM, Copywriter SILENT, Creative Director SILENT
- BRAND ACTIVATION: All agents run HIGH-MAXIMUM

Gravity levels: MAXIMUM | HIGH | SUPPORTING | MINIMAL | SILENT

Respond ONLY with valid JSON. No markdown. Start with {`;

export async function runEstimator(brief) {
  return callAgent({
    system: SYSTEM,
    user: `Estimate this brief: "${brief}"

{
  "complexity": "SIMPLE | MEDIUM | COMPLEX | VERY_COMPLEX",
  "brief_type": "BRAND_CAMPAIGN | GENERATIVE | GAME | LANDING_PAGE | DATA_VIZ | ACTIVATION | TOOL | APP",
  "complexity_reason": "1 sentence.",
  "what_will_be_built": "Specific description of what Developer will build. 2 sentences.",
  "confidence": "HIGH | MEDIUM | LOW",
  "agent_budgets": {
    "strategist":        { "tokens": 1000, "gravity": "MAXIMUM", "skip": false, "reason": "1 sentence." },
    "copywriter":        { "tokens": 1400, "gravity": "MAXIMUM", "skip": false, "reason": "1 sentence." },
    "ui_designer":       { "tokens": 1800, "gravity": "MAXIMUM", "skip": false, "reason": "1 sentence." },
    "motion":            { "tokens": 1600, "gravity": "HIGH",    "skip": false, "reason": "1 sentence." },
    "creative_director": { "tokens": 2500, "gravity": "MAXIMUM", "skip": false, "reason": "1 sentence." },
    "developer":         { "tokens": 8000, "gravity": "MAXIMUM", "skip": false, "reason": "1 sentence." },
    "qa":                { "tokens": 8000, "gravity": "MAXIMUM", "skip": false, "reason": "1 sentence." }
  },
  "estimated_tokens_total": 18000,
  "estimated_cost_usd": 0.28,
  "estimated_cost_eur": 0.26,
  "estimated_time_seconds": 95,
  "silent_agents": [],
  "dominant_agents": [],
  "risk_factors": ["specific things that could cause failure"],
  "recommendation": "GO | WARN | SIMPLIFY",
  "recommendation_reason": "1 sentence.",
  "simplified_brief": null
}`,
    maxTokens: 1000
  });
}
