import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USAGE_FILE = path.join(__dirname, '../data/usage.json');

const COST_PER_M = {
  'claude-sonnet-4-20250514': { input: 3.00, output: 15.00 },
  'claude-opus-4-20250514':   { input: 15.00, output: 75.00 },
  'claude-haiku-4-20250514':  { input: 0.80, output: 4.00 },
};

export async function trackUsage({ model, input_tokens, output_tokens }) {
  const rates = COST_PER_M[model] ?? { input: 3.00, output: 15.00 };
  const cost_usd = parseFloat(
    ((input_tokens * rates.input + output_tokens * rates.output) / 1_000_000).toFixed(6)
  );

  const entry = {
    ts: new Date().toISOString(),
    model,
    input_tokens,
    output_tokens,
    cost_usd,
  };

  let data = { runs: [] };
  try { data = JSON.parse(await fs.readFile(USAGE_FILE, 'utf-8')); } catch {}

  data.runs.push(entry);
  await fs.mkdir(path.dirname(USAGE_FILE), { recursive: true });
  await fs.writeFile(USAGE_FILE, JSON.stringify(data), 'utf-8');
  return entry;
}

export async function getUsageStats() {
  let data = { runs: [] };
  try { data = JSON.parse(await fs.readFile(USAGE_FILE, 'utf-8')); } catch {}

  const now   = new Date();
  const today = now.toISOString().slice(0, 10);
  const month = now.toISOString().slice(0, 7);

  const todayRuns = data.runs.filter(r => r.ts.startsWith(today));
  const monthRuns = data.runs.filter(r => r.ts.startsWith(month));

  const sum = runs => runs.reduce(
    (a, r) => ({
      calls:         a.calls + 1,
      input_tokens:  a.input_tokens  + r.input_tokens,
      output_tokens: a.output_tokens + r.output_tokens,
      cost_usd:      parseFloat((a.cost_usd + r.cost_usd).toFixed(6)),
    }),
    { calls: 0, input_tokens: 0, output_tokens: 0, cost_usd: 0 }
  );

  return {
    today:    sum(todayRuns),
    month:    sum(monthRuns),
    all_time: sum(data.runs),
    recent:   data.runs.slice(-30).reverse(),
  };
}
