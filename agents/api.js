import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function withRetry(fn, retries = 2, delay = 1000) {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;
    const isRetryable = err.status === 529 || err.status === 503 || err.status === 429;
    if (!isRetryable) throw err;
    await new Promise(r => setTimeout(r, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

export async function callAgent({ system, user, maxTokens = 1200 }) {
  const msg = await withRetry(() => client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }]
  }));

  if (msg.stop_reason === 'max_tokens') {
    throw new Error(`Agent hit token limit (${maxTokens}).`);
  }

  const raw = msg.content.find(b => b.type === 'text')?.text || '';
  const cleaned = raw.replace(/```json|```/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`Agent returned no JSON.\nRaw: ${raw.slice(0, 300)}`);

  try {
    return JSON.parse(match[0]);
  } catch(e) {
    throw new Error(`JSON parse failed: ${e.message}\nRaw: ${match[0].slice(0, 300)}`);
  }
}

export async function callAgentRaw({ system, user, maxTokens = 10000 }) {
  const msg = await withRetry(() => client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }]
  }));

  if (msg.stop_reason === 'max_tokens') {
    throw new Error(`Developer/QA agent hit token limit — output was truncated. Try a more focused brief or click Proceed to extend the budget.`);
  }

  const raw = msg.content.find(b => b.type === 'text')?.text || '';
  const html = raw.replace(/```html|```/g, '').trim();

  if (html.length < 200) {
    throw new Error(`Agent returned too little output (${html.length} chars). Stop: ${msg.stop_reason}`);
  }

  return html;
}
