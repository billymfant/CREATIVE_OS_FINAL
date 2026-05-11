import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { v4 as uuid } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { runClassifier, calculateTokenGravity } from './agents/classifier.js';
import { runEstimator }         from './agents/estimator.js';
import { runStrategist }        from './agents/strategist.js';
import { runCopywriter }        from './agents/copywriter.js';
import { runUIDesigner }        from './agents/ui-designer.js';
import { runMotion }            from './agents/motion.js';
import { runCreativeDirector }  from './agents/creative-director.js';
import { runDeveloper }         from './agents/developer.js';
import { runQA }                from './agents/qa.js';
import { loadSkill, detectSkill } from './agents/skill-loader.js';
import { awardXP, getItemModifiers, getRPGState, equipItem } from './agents/rpg.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

// Landing page is the entry point; /app goes to the pipeline SPA
app.get('/', (req, res) => res.redirect('/landing.html'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/output', express.static(path.join(__dirname, 'outputs')));

// ─────────────────────────────────────────────────────────
// POST /estimate — pre-flight gravity estimate
// ─────────────────────────────────────────────────────────
app.post('/estimate', async (req, res) => {
  const { brief } = req.body;
  if (!brief?.trim()) return res.status(400).json({ error: 'Brief required.' });
  try {
    const estimate = await runEstimator(brief);
    res.json(estimate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// GET /rpg — RPG state for frontend display
// ─────────────────────────────────────────────────────────
app.get('/rpg', async (req, res) => {
  try { res.json(await getRPGState()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /rpg/equip — equip or unequip an item
app.post('/rpg/equip', async (req, res) => {
  const { agentId, itemId, equip } = req.body;
  res.json({ success: await equipItem(agentId, itemId, equip !== false) });
});

// ─────────────────────────────────────────────────────────
// POST /run — full pipeline
// Merged: V7 classifier+skills+RPG + our silencing+lab+principles
// ─────────────────────────────────────────────────────────
app.post('/run', async (req, res) => {
  const { brief, client, token_budget, agent_budgets } = req.body;
  if (!brief?.trim() || brief.length < 10)
    return res.status(400).json({ error: 'Brief is too short.' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const send = (event, data) =>
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  try {
    // ── Load client config ──
    let clientConfig = {};
    if (client) {
      try {
        clientConfig = JSON.parse(
          await fs.readFile(path.join(__dirname, 'configs', `${client}.json`), 'utf-8')
        );
        send('status', { msg: `Client config loaded: ${client}` });
      } catch {
        send('status', { msg: `No config for "${client}" — running generic.` });
      }
    }

    // ── LAYER 0: Brief Intelligence (Classifier) ──
    send('agent', { id: 'classifier', state: 'active', label: 'Reading the brief…' });

    let intelligence;
    try {
      intelligence = await runClassifier(brief);
    } catch {
      // Fallback if classifier fails
      intelligence = {
        brief_type: 'MIXED', complexity: 'MEDIUM',
        agent_weights: { strategist:6, copywriter:6, ui_designer:7, motion:5, creative_director:7, developer:9, qa:8 },
        silent_agents: [],
        skill_activations: { strategist:'brand_activation', copywriter:'brand_voice', ui_designer:'dark_cinematic', motion:'cinematic', creative_director:'experience_architect', developer:'brand_app', qa:'experience_qa' },
        token_total_recommended: 28000,
        visual_north_star: '', technical_approach: '', what_makes_this_special: '', emotional_target: ''
      };
    }

    // Apply user-override budgets if provided from gravity screen
    const silentAgents = agent_budgets
      ? Object.entries(agent_budgets).filter(([,b]) => b.skip || b.gravity === 'SILENT').map(([id]) => id)
      : (intelligence.silent_agents || []);

    // ── LAYER 1: Token Gravity ──
    const totalBudget = token_budget || intelligence.token_total_recommended || 28000;
    const tokenAllocation = agent_budgets
      ? Object.fromEntries(Object.entries(agent_budgets).map(([id,b]) => [id, b.tokens || 0]))
      : calculateTokenGravity(intelligence.agent_weights, totalBudget, silentAgents);

    send('agent', { id: 'classifier', state: 'done', output: { intelligence, tokenAllocation } });
    send('status', { msg: `Intelligence: ${intelligence.brief_type} | ${totalBudget} tokens across ${7 - silentAgents.length} agents` });

    const handoff = { brief, client: clientConfig, intelligence, tokenAllocation };

    // Helper: load skill + RPG item modifiers for any agent
    async function agentCtx(agentId) {
      const classifiedSkill = intelligence.skill_activations?.[agentId];
      const skillName = classifiedSkill || await detectSkill(agentId, brief);
      const [skillModifier, itemModifiers] = await Promise.all([
        skillName ? loadSkill(agentId, skillName, 'full') : Promise.resolve(''),
        getItemModifiers(agentId)
      ]);
      return { skillModifier, itemModifiers, skillName };
    }

    // Brief type detection for silencing logic
    const briefLower = brief.toLowerCase();
    const isGenerative = intelligence.brief_type === 'GENERATIVE_ART' ||
      briefLower.includes('particle') || briefLower.includes('canvas') ||
      briefLower.includes('generative') || briefLower.includes('sphere') ||
      briefLower.includes('simulation') || briefLower.includes('3d') ||
      briefLower.includes('immersive');

    const copywriterSilent = silentAgents.includes('copywriter') || tokenAllocation.copywriter === 0;
    const cdSilent = silentAgents.includes('creative_director') || tokenAllocation.creative_director === 0;

    // ── AGENT 1: Strategist ──
    send('agent', { id: 'strategist', state: 'active', label: 'Finding the human truth…' });
    const sCtx = await agentCtx('strategist');
    handoff.strategist = await runStrategist(brief, clientConfig, sCtx.skillModifier, sCtx.itemModifiers);
    send('agent', { id: 'strategist', state: 'done', output: handoff.strategist });

    // ── AGENT 2: Copywriter (silenced on generative/data viz) ──
    if (copywriterSilent || isGenerative) {
      send('agent', { id: 'copywriter', state: 'done', output: { _skipped: true } });
      handoff.copywriter = { _skipped: true };
    } else {
      send('agent', { id: 'copywriter', state: 'active', label: 'Writing every word…' });
      const cCtx = await agentCtx('copywriter');
      handoff.copywriter = await runCopywriter(brief, handoff.strategist, clientConfig, cCtx.skillModifier, cCtx.itemModifiers);
      send('agent', { id: 'copywriter', state: 'done', output: handoff.copywriter });
    }

    // ── AGENT 3: UI Designer ──
    send('agent', { id: 'ui_designer', state: 'active', label: 'Designing the visual system…' });
    const uCtx = await agentCtx('ui_designer');
    handoff.ui_designer = await runUIDesigner(brief, handoff.strategist, handoff.copywriter, clientConfig, uCtx.skillModifier, uCtx.itemModifiers);
    send('agent', { id: 'ui_designer', state: 'done', output: handoff.ui_designer });

    // ── AGENT 4: Motion ──
    send('agent', { id: 'motion', state: 'active', label: 'Defining the motion language…' });
    const mCtx = await agentCtx('motion');
    handoff.motion = await runMotion(brief, handoff, clientConfig, mCtx.skillModifier, mCtx.itemModifiers);
    send('agent', { id: 'motion', state: 'done', output: handoff.motion });

    // ── AGENT 5: Creative Director (silenced on generative/simple) ──
    if (cdSilent || isGenerative) {
      send('agent', { id: 'creative_director', state: 'done', output: { _skipped: true } });
      handoff.creative_director = { _skipped: true };
    } else {
      send('agent', { id: 'creative_director', state: 'active', label: 'Creative Director reviewing…' });
      const cdCtx = await agentCtx('creative_director');
      handoff.creative_director = await runCreativeDirector(brief, handoff, cdCtx.skillModifier, cdCtx.itemModifiers);
      send('agent', { id: 'creative_director', state: 'done', output: handoff.creative_director });
    }

    // ── AGENT 6: Developer ──
    send('agent', { id: 'developer', state: 'active', label: 'Building the experience…' });
    send('status', { msg: `Developer has ${tokenAllocation.developer} tokens — ${intelligence.technical_approach || 'building now…'}` });

    const devCtx = await agentCtx('developer');
    let html;
    try {
      html = await runDeveloper(brief, handoff, tokenAllocation.developer, devCtx.skillModifier, devCtx.itemModifiers);
    } catch (devErr) {
      if (devErr.message.includes('token limit')) {
        send('budget_exceeded', {
          agent: 'developer',
          current_budget: tokenAllocation.developer,
          suggested_budget: Math.min(tokenAllocation.developer + 4000, 16000),
          message: devErr.message,
          handoff_snapshot: handoff
        });
        res.end(); return;
      }
      throw devErr;
    }
    send('agent', { id: 'developer', state: 'done' });

    // ── AGENT 7: QA ──
    send('agent', { id: 'qa', state: 'active', label: 'QA — three-pass audit…' });
    send('status', { msg: `QA has ${tokenAllocation.qa} tokens — systematic 4-phase audit running…` });

    const qaCtx = await agentCtx('qa');
    let finalHtml;
    try {
      finalHtml = await runQA(brief, html, handoff, tokenAllocation.qa, qaCtx.skillModifier, qaCtx.itemModifiers);
    } catch (qaErr) {
      send('status', { msg: 'QA hit token limit — saving developer output.' });
      finalHtml = html;
    }
    send('agent', { id: 'qa', state: 'done' });

    // ── Save output ──
    const jobId = uuid();
    await fs.mkdir(path.join(__dirname, 'outputs'), { recursive: true });
    await fs.writeFile(
      path.join(__dirname, 'outputs', `${jobId}.html`),
      finalHtml, 'utf-8'
    );
    await fs.writeFile(
      path.join(__dirname, 'outputs', `${jobId}.json`),
      JSON.stringify({ id: jobId, brief, client: client || null, intelligence, tokenAllocation, handoff, createdAt: new Date().toISOString() }, null, 2)
    );

    // ── Award RPG XP ──
    const { newUnlocks } = await awardXP(intelligence.brief_type, intelligence.agent_weights || {});
    if (newUnlocks.length > 0) {
      send('items_unlocked', { unlocks: newUnlocks });
    }

    send('done', { jobId, url: `/output/${jobId}.html`, intelligence, tokenAllocation });

  } catch (err) {
    console.error('Pipeline error:', err);
    send('error', { message: err.message });
  }

  res.end();
});

// ─────────────────────────────────────────────────────────
// GET /jobs
// ─────────────────────────────────────────────────────────
app.get('/jobs', async (req, res) => {
  try {
    const files = await fs.readdir(path.join(__dirname, 'outputs'));
    const jobs = await Promise.all(
      files.filter(f => f.endsWith('.json')).map(async f => {
        const j = JSON.parse(await fs.readFile(path.join(__dirname, 'outputs', f), 'utf-8'));
        return { id: j.id, brief: j.brief, client: j.client, createdAt: j.createdAt, url: `/output/${j.id}.html` };
      })
    );
    res.json(jobs.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch { res.json([]); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CreativeOS running → http://localhost:${PORT}`));
