import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = path.join(__dirname, '..', 'skills');

const cache = new Map();

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };
  const meta = {};
  match[1].split('\n').forEach(line => {
    const [key, ...vals] = line.split(':');
    if (key && vals.length) {
      const val = vals.join(':').trim();
      if (val.startsWith('[')) {
        meta[key.trim()] = val.slice(1,-1).split(',').map(s => s.trim().replace(/['"]/g,''));
      } else {
        meta[key.trim()] = val.replace(/['"]/g, '');
      }
    }
  });
  return { meta, body: match[2].trim() };
}

export async function loadSkill(agentId, skillName, mode = 'full') {
  const cacheKey = `${agentId}/${skillName}/${mode}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const folderMap = { ui_designer: 'ui-designer', creative_director: 'creative-director' };
  const folder = folderMap[agentId] || agentId;
  const skillPath = path.join(SKILLS_DIR, folder, `${skillName}.md`);

  try {
    const raw = await fs.readFile(skillPath, 'utf-8');
    const { meta, body } = parseFrontmatter(raw);
    const result = mode === 'summary' ? `[SKILL: ${meta.summary || skillName}]` : body;
    cache.set(cacheKey, result);
    return result;
  } catch {
    return '';
  }
}

export async function detectSkill(agentId, brief) {
  const folderMap = { ui_designer: 'ui-designer', creative_director: 'creative-director' };
  const folder = folderMap[agentId] || agentId;
  const agentSkillsDir = path.join(SKILLS_DIR, folder);

  try {
    const files = await fs.readdir(agentSkillsDir);
    const briefLower = brief.toLowerCase();
    let bestSkill = null, bestScore = 0;

    await Promise.all(files.filter(f => f.endsWith('.md')).map(async f => {
      const raw = await fs.readFile(path.join(agentSkillsDir, f), 'utf-8');
      const { meta } = parseFrontmatter(raw);
      const triggers = meta.triggers || [];
      const score = triggers.filter(t => briefLower.includes(t.toLowerCase())).length;
      if (score > bestScore) { bestScore = score; bestSkill = f.replace('.md',''); }
    }));

    return bestSkill;
  } catch {
    return null;
  }
}
