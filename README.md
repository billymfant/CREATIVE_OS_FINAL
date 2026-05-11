# CreativeOS — Final Build

7-agent AI creative pipeline. Strategy → Copy → Design → Motion → Creative Direction → Development → QA.

**What's merged in this build:**
- V7: Classifier (brief intelligence layer), skill .md files, RPG levelling system, token gravity
- Ours: Agent silencing on wrong brief types, design book principles, walking lab world, motion canvas fast path, superpowers systematic debugging in QA

## Setup

```bash
npm install
cp .env.example .env
# Add ANTHROPIC_API_KEY to .env
npm run dev
# → http://localhost:3000
```

## Architecture

```
├── agents/
│   ├── api.js              Anthropic client + retry
│   ├── classifier.js       Layer 0 — brief intelligence + token gravity + skill routing
│   ├── estimator.js        Pre-flight UI estimator (gravity screen)
│   ├── skill-loader.js     Loads .md skill files, auto-detects by brief keywords
│   ├── rpg.js              XP + item unlocking + prompt modification
│   ├── strategist.js       Human truth + concept
│   ├── copywriter.js       Voice + copy (silenced on generative briefs)
│   ├── ui-designer.js      Design system + palette
│   ├── motion.js           Animation language (canvas fast-path for generative)
│   ├── creative-director.js CD synthesis (silenced on generative briefs)
│   ├── developer.js        HTML builder + verification gate
│   └── qa.js               4-phase systematic audit
├── skills/
│   ├── strategist/         brand-activation, game-design, generative-art
│   ├── copywriter/         brand-voice, minimal
│   ├── ui-designer/        dark-cinematic, brand-system
│   ├── motion/             game-feel, physics-based
│   ├── creative-director/  brand-guardian, generative-vision, game-director, experience-architect
│   ├── developer/          canvas-generative, brand-app, game-engine
│   └── qa/                 experience-qa, game-qa, brand-qa
├── configs/
│   └── coca-cola.json      Example client brand config
├── public/
│   ├── index.html          Main frontend (gravity screen + pipeline)
│   ├── lab.html            Walking agent lab world (iframe)
│   └── assets/             7 character PNGs + lab background
├── data/                   RPG state (auto-created on first run)
├── outputs/                Generated experiences (auto-created)
├── server.js
└── package.json
```

## How the pipeline works

1. **Estimator** (frontend, pre-flight) — estimates cost, complexity, gravity per agent
2. **Classifier** (Layer 0, server) — reads brief, determines brief_type, agent_weights, skill_activations, visual_north_star, technical_approach, what_makes_this_special
3. **Token gravity** — distributes token budget weighted by agent importance + floors
4. **Skill injection** — each agent loads the right .md skill file for this brief type
5. **RPG modifiers** — equipped items inject additional prompt context per agent
6. **Silencing** — copywriter + creative director skip entirely on generative/data viz briefs
7. **Pipeline** — strategist → copywriter → ui_designer → motion → creative_director → developer → qa
8. **XP awards** — agents earn XP proportional to weight, unlock items at 3/8/20 runs

## Agent silencing logic

| Brief type | Silenced agents | Reason |
|---|---|---|
| GENERATIVE / CANVAS | copywriter, creative_director | No copy needed, CD just adds latency |
| DATA_VIZ | copywriter, creative_director | Same |
| GAME | copywriter weight minimal | Game UI copy is minimal |
| BRAND / ACTIVATION | none | All agents run at full weight |

## Lab world integration

Screen 2 shows `lab.html` in an iframe. SSE events automatically wire to it:
```js
// Fires automatically from pipeline SSE events
window.CreativeOSLab.activateAgent('strategist');
window.CreativeOSLab.markDone('strategist');
window.CreativeOSLab.resetAll();
window.CreativeOSLab.runDemo(); // cycles all agents
```

## Adding new skills

Create a markdown file in the right `skills/` subfolder:
```markdown
---
skill: my-new-skill
agent: developer
summary: One line description for auto-detection.
triggers: [keyword1, keyword2, keyword3]
---

# Skill content here
Everything in this section gets injected into the agent's system prompt.
```
No code change required. The skill-loader auto-detects and injects on the next run.

## Deploy

```bash
railway up
```
