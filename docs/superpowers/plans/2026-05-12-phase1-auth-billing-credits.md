# CreativeOS Phase 1 — Auth · Billing · Credits Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate the `/run` pipeline behind Supabase auth and a Stripe-backed credit system so CreativeOS can charge real users.

**Architecture:** Supabase handles auth (JWTs) and the Postgres DB (profiles + credit ledger). Express middleware verifies the JWT and checks credits before each run. Stripe webhooks grant credits on subscription and top-up purchase. No React — plain HTML pages for login and the billing portal link.

**Tech Stack:** Node.js/Express (ESM, existing), `@supabase/supabase-js`, `stripe`, Supabase Postgres, Railway (existing deploy)

---

## External Setup Checklist (browser — do before coding)

These can't be scripted — complete them first:

- [ ] Create Supabase project at supabase.com → copy `Project URL`, `anon key`, `service_role key`
- [ ] In Supabase SQL Editor — run the schema SQL from Task 1
- [ ] Create Stripe account at stripe.com → copy `Secret key`
- [ ] In Stripe Dashboard → Products → create three products:
  - "Creator" — $29/mo recurring → copy `price_id`
  - "Studio" — $79/mo recurring → copy `price_id`
  - "Agency" — $199/mo recurring → copy `price_id`
  - "Top-up" — $10 one-time → copy `price_id`
- [ ] In Stripe Dashboard → Webhooks → add endpoint `https://<your-railway-domain>/billing/webhook` → listen for `checkout.session.completed`, `customer.subscription.deleted` → copy `Webhook signing secret`
- [ ] Add all secrets to Railway environment variables (and local `.env`)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/supabase.js` | Create | Supabase client singleton (service role for server ops) |
| `lib/stripe.js` | Create | Stripe client singleton |
| `lib/credits.js` | Create | Credit ledger read/deduct/grant — all DB credit ops |
| `middleware/auth.js` | Create | Verify Supabase JWT → attach `req.user` |
| `middleware/requireCredits.js` | Create | Check credits > 0, deduct 1 before passing to handler |
| `routes/auth.js` | Create | `GET /auth/me` — return user + credit balance |
| `routes/billing.js` | Create | `POST /billing/checkout`, `GET /billing/portal`, `POST /billing/webhook` |
| `server.js` | Modify | Wire new routes + middleware; guard `/run` and `/estimate` |
| `public/login.html` | Create | Supabase auth UI (email magic link) |
| `public/app.html` | Create | Redirect shim: if logged in → `/`, if not → `/login.html` |
| `.env.example` | Modify | Add all new env var keys |

---

## Task 1: Database Schema (Supabase SQL Editor)

**Files:** none (run in Supabase SQL Editor)

- [ ] **Step 1: Run this SQL in Supabase SQL Editor**

```sql
-- Profiles: one row per user, created on first sign-in
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  tier text not null default 'free',
  credits_remaining integer not null default 5,
  total_runs integer not null default 0,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Credit ledger: immutable audit log of every credit change
create table if not exists credit_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  delta integer not null,
  reason text not null,
  stripe_event_id text,
  created_at timestamptz not null default now()
);

-- Row-level security: users see only their own rows
alter table profiles enable row level security;
alter table credit_ledger enable row level security;

create policy "Users read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users read own ledger"
  on credit_ledger for select using (auth.uid() = user_id);
```

- [ ] **Step 2: Verify tables exist**

In Supabase → Table Editor, confirm `profiles` and `credit_ledger` appear.

---

## Task 2: Install Dependencies

**Files:** `package.json`

- [ ] **Step 1: Install Supabase and Stripe SDKs**

```bash
npm install @supabase/supabase-js stripe
```

- [ ] **Step 2: Verify install**

```bash
node -e "import('@supabase/supabase-js').then(() => console.log('ok'))"
```

Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add supabase-js and stripe"
```

---

## Task 3: Supabase Client

**Files:**
- Create: `lib/supabase.js`

- [ ] **Step 1: Create `lib/supabase.js`**

```js
import { createClient } from '@supabase/supabase-js';

// Service-role client for server-side ops (bypasses RLS)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

- [ ] **Step 2: Verify client initialises**

```bash
node -e "
import('./lib/supabase.js').then(m => {
  console.log('client type:', typeof m.supabase.from);
});
"
```

Expected: `client type: function`

---

## Task 4: Stripe Client

**Files:**
- Create: `lib/stripe.js`

- [ ] **Step 1: Create `lib/stripe.js`**

```js
import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10'
});
```

- [ ] **Step 2: Verify**

```bash
node -e "import('./lib/stripe.js').then(m => console.log(typeof m.stripe.customers))"
```

Expected: `object`

---

## Task 5: Credit Ledger Library

**Files:**
- Create: `lib/credits.js`

- [ ] **Step 1: Create `lib/credits.js`**

```js
import { supabase } from './supabase.js';

export async function getCredits(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('credits_remaining, tier, total_runs')
    .eq('id', userId)
    .single();
  if (error) throw new Error('Profile not found');
  return data;
}

export async function deductCredit(userId, reason = 'pipeline_run') {
  // Atomic deduction — fails if credits_remaining is already 0
  const { data, error } = await supabase.rpc('deduct_credit', {
    p_user_id: userId,
    p_reason: reason
  });
  if (error) throw new Error('Insufficient credits');
  return data; // returns new credits_remaining
}

export async function grantCredits(userId, delta, reason, stripeEventId = null) {
  // Update profile credits
  const { error: profileErr } = await supabase.rpc('grant_credits', {
    p_user_id: userId,
    p_delta: delta,
    p_reason: reason,
    p_stripe_event_id: stripeEventId
  });
  if (profileErr) throw profileErr;
}
```

- [ ] **Step 2: Create the two Postgres functions in Supabase SQL Editor**

```sql
-- Atomic deduct (returns new balance, errors if 0)
create or replace function deduct_credit(p_user_id uuid, p_reason text)
returns integer language plpgsql security definer as $$
declare
  new_balance integer;
begin
  update profiles
  set credits_remaining = credits_remaining - 1,
      total_runs = total_runs + 1
  where id = p_user_id and credits_remaining > 0
  returning credits_remaining into new_balance;

  if new_balance is null then
    raise exception 'Insufficient credits';
  end if;

  insert into credit_ledger (user_id, delta, reason)
  values (p_user_id, -1, p_reason);

  return new_balance;
end;
$$;

-- Grant credits
create or replace function grant_credits(
  p_user_id uuid, p_delta integer,
  p_reason text, p_stripe_event_id text default null
) returns void language plpgsql security definer as $$
begin
  update profiles
  set credits_remaining = credits_remaining + p_delta,
      tier = case
        when p_reason like 'subscription_%' then split_part(p_reason, '_', 2)
        else tier
      end
  where id = p_user_id;

  insert into credit_ledger (user_id, delta, reason, stripe_event_id)
  values (p_user_id, p_delta, p_reason, p_stripe_event_id);
end;
$$;
```

- [ ] **Step 3: Commit**

```bash
git add lib/
git commit -m "feat: add credits library and Supabase client"
```

---

## Task 6: Auth Middleware

**Files:**
- Create: `middleware/auth.js`

- [ ] **Step 1: Create `middleware/auth.js`**

```js
import { supabase } from '../lib/supabase.js';

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not authenticated.' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid session.' });

  req.user = user;
  next();
}
```

---

## Task 7: Credit Guard Middleware

**Files:**
- Create: `middleware/requireCredits.js`

- [ ] **Step 1: Create `middleware/requireCredits.js`**

```js
import { getCredits, deductCredit } from '../lib/credits.js';

export async function requireCredits(req, res, next) {
  try {
    const profile = await getCredits(req.user.id);
    if (profile.credits_remaining <= 0) {
      return res.status(402).json({
        error: 'No credits remaining.',
        credits_remaining: 0,
        upgrade_url: '/billing/checkout?tier=creator'
      });
    }
    // Deduct atomically before the pipeline runs (prevents concurrent over-spend)
    await deductCredit(req.user.id, 'pipeline_run');
    req.profile = profile;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
```

- [ ] **Step 2: Commit middleware**

```bash
git add middleware/
git commit -m "feat: add auth and credit guard middleware"
```

---

## Task 8: Auth Routes

**Files:**
- Create: `routes/auth.js`

- [ ] **Step 1: Create `routes/auth.js`**

```js
import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { getCredits } from '../lib/credits.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /auth/me — returns user profile + credits (called by frontend on load)
router.get('/me', requireAuth, async (req, res) => {
  try {
    const profile = await getCredits(req.user.id);
    res.json({ user: req.user, ...profile });
  } catch {
    res.status(404).json({ error: 'Profile not found.' });
  }
});

export default router;
```

---

## Task 9: Billing Routes

**Files:**
- Create: `routes/billing.js`

- [ ] **Step 1: Create `routes/billing.js`**

```js
import { Router } from 'express';
import { stripe } from '../lib/stripe.js';
import { supabase } from '../lib/supabase.js';
import { grantCredits } from '../lib/credits.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const TIER_CREDITS = { creator: 40, studio: 120, agency: 400 };

const PRICE_IDS = {
  creator: process.env.STRIPE_PRICE_CREATOR,
  studio:  process.env.STRIPE_PRICE_STUDIO,
  agency:  process.env.STRIPE_PRICE_AGENCY,
  topup:   process.env.STRIPE_PRICE_TOPUP
};

// POST /billing/checkout?tier=creator — create Stripe checkout session
router.post('/checkout', requireAuth, async (req, res) => {
  const tier = (req.query.tier || 'creator').toLowerCase();
  const priceId = PRICE_IDS[tier];
  if (!priceId) return res.status(400).json({ error: 'Unknown tier.' });

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', req.user.id)
    .single();

  let customerId = profile.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: profile.email, metadata: { supabase_uid: req.user.id } });
    customerId = customer.id;
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', req.user.id);
  }

  const isTopup = tier === 'topup';
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: isTopup ? 'payment' : 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.APP_URL}/?checkout=success`,
    cancel_url: `${process.env.APP_URL}/billing.html`,
    metadata: { supabase_uid: req.user.id, tier }
  });

  res.json({ url: session.url });
});

// GET /billing/portal — Stripe billing portal for plan management
router.get('/portal', requireAuth, async (req, res) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', req.user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return res.status(400).json({ error: 'No billing account found.' });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.APP_URL}/billing.html`
  });

  res.json({ url: session.url });
});

// POST /billing/webhook — Stripe event handler
// raw body is set as req.rawBody by server.js BEFORE json() middleware
router.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch {
      return res.status(400).send('Webhook signature failed');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const uid = session.metadata?.supabase_uid;
      const tier = session.metadata?.tier;
      if (!uid) return res.sendStatus(200);

      if (tier === 'topup') {
        await grantCredits(uid, 20, 'topup_purchase', event.id);
      } else if (TIER_CREDITS[tier]) {
        await grantCredits(uid, TIER_CREDITS[tier], `subscription_${tier}`, event.id);
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', sub.customer)
        .single();
      if (profile) {
        await supabase.from('profiles').update({ tier: 'free' }).eq('id', profile.id);
      }
    }

    res.sendStatus(200);
  }
);

export default router;
```

- [ ] **Step 2: Commit routes**

```bash
git add routes/
git commit -m "feat: add auth and billing routes"
```

---

## Task 10: Wire Into server.js

**Files:**
- Modify: `server.js`

- [ ] **Step 1: Add imports and route wiring to `server.js`**

Add these imports after existing imports:

```js
import authRouter    from './routes/auth.js';
import billingRouter from './routes/billing.js';
import { requireAuth }    from './middleware/auth.js';
import { requireCredits } from './middleware/requireCredits.js';
```

- [ ] **Step 2: Mount billing webhook BEFORE `express.json()` (raw body needed)**

Replace the `app.use(express.json())` line with:

```js
// Stripe webhook needs raw body — intercept with app.use BEFORE json parser
// app.use (not app.post) so it sets rawBody and falls through to the billing router
app.use('/billing/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body;
  next();
});

app.use(express.json());
```

- [ ] **Step 3: Mount new routers (after static files, before /run)**

```js
app.use('/auth', authRouter);
app.use('/billing', billingRouter);
```

- [ ] **Step 4: Guard `/run` with auth + credits**

Change:
```js
app.post('/run', async (req, res) => {
```

To:
```js
app.post('/run', requireAuth, requireCredits, async (req, res) => {
```

Also guard `/estimate`:
```js
app.post('/estimate', requireAuth, async (req, res) => {
```

- [ ] **Step 5: Commit**

```bash
git add server.js
git commit -m "feat: wire auth and credit guard into Express pipeline"
```

---

## Task 11: Login Page

**Files:**
- Create: `public/login.html`

- [ ] **Step 1: Create `public/login.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CreativeOS — Sign In</title>
<link rel="stylesheet" href="design-tokens.css">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-ui);
  min-height: 100dvh;
  display: flex; align-items: center; justify-content: center;
}
.card {
  width: 100%; max-width: 380px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 40px 32px;
  display: flex; flex-direction: column; gap: 24px;
}
.logo {
  font-family: var(--font-display);
  font-size: 22px; font-weight: 800; letter-spacing: -0.03em;
  color: var(--color-text); text-align: center;
}
.logo em { color: #818cf8; font-style: normal; }
.tagline { font-size: 12px; color: var(--color-text-muted); text-align: center; line-height: 1.5; }
.form { display: flex; flex-direction: column; gap: 12px; }
.input {
  width: 100%; padding: 10px 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px; color: var(--color-text);
  font-family: var(--font-ui); font-size: 13px; outline: none;
}
.input:focus { border-color: rgba(129,140,248,0.4); }
.btn {
  padding: 11px 16px; border-radius: 8px; border: none;
  background: #818cf8; color: #fff;
  font-family: var(--font-ui); font-size: 13px; font-weight: 600;
  cursor: pointer; transition: background 0.15s;
}
.btn:hover { background: #6366f1; }
.btn:disabled { opacity: 0.5; cursor: default; }
.msg { font-size: 12px; color: var(--color-text-muted); text-align: center; line-height: 1.5; }
.msg.success { color: #34d399; }
.msg.error { color: #f87171; }
</style>
</head>
<body>
<div class="card">
  <div class="logo">Creative<em>OS</em></div>
  <p class="tagline">Sign in to run your creative pipeline.<br>We'll send a magic link — no password needed.</p>
  <div class="form" id="form">
    <input class="input" type="email" id="email" placeholder="your@email.com" autocomplete="email">
    <button class="btn" id="btn">Send Magic Link</button>
  </div>
  <p class="msg" id="msg"></p>
</div>

<script type="module">
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const sb = createClient(
  '__SUPABASE_URL__',        // replaced at build/runtime
  '__SUPABASE_ANON_KEY__'    // replaced at build/runtime
);

// If already logged in, go to app
const { data: { session } } = await sb.auth.getSession();
if (session) { window.location.href = '/app'; }

const btn = document.getElementById('btn');
const msg = document.getElementById('msg');

btn.addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  if (!email) return;
  btn.disabled = true;
  btn.textContent = 'Sending…';
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + '/app' }
  });
  if (error) {
    msg.textContent = error.message;
    msg.className = 'msg error';
    btn.disabled = false;
    btn.textContent = 'Send Magic Link';
  } else {
    msg.textContent = 'Check your inbox — magic link sent.';
    msg.className = 'msg success';
    document.getElementById('form').style.opacity = '0.4';
  }
});
</script>
</body>
</html>
```

**Note:** Replace `__SUPABASE_URL__` and `__SUPABASE_ANON_KEY__` with your real values. These are public-safe (anon key, not service role).

- [ ] **Step 2: Commit**

```bash
git add public/login.html
git commit -m "feat: add magic-link login page"
```

---

## Task 12: Credit Display in Pipeline Header

**Files:**
- Modify: `public/index.html`

- [ ] **Step 1: Add credit display to topbar nav in `index.html`**

Find the `.nav` div in the topbar. After the existing nav links, add:

```html
<span id="credit-chip" style="
  font-size:10px; font-weight:600; letter-spacing:0.04em;
  background: rgba(129,140,248,0.12);
  border: 1px solid rgba(129,140,248,0.25);
  border-radius: 99px;
  padding: 3px 10px;
  color: #818cf8;
  display: none;
"></span>
```

- [ ] **Step 2: Add auth check script to `index.html` (before closing `</body>`)**

```html
<script type="module">
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const sb = createClient('__SUPABASE_URL__', '__SUPABASE_ANON_KEY__');

const { data: { session } } = await sb.auth.getSession();
if (!session) { window.location.href = '/login.html'; }

// Show credit balance
try {
  const res = await fetch('/auth/me', { headers: { Authorization: `Bearer ${session.access_token}` } });
  const profile = await res.json();
  const chip = document.getElementById('credit-chip');
  chip.textContent = `${profile.credits_remaining} credits`;
  chip.style.display = '';
} catch {}

// Attach token to all /run and /estimate fetch calls
// (override XMLHttpRequest + fetch to inject Authorization header)
const _fetch = window.fetch;
window.fetch = (url, opts = {}) => {
  if (typeof url === 'string' && (url.startsWith('/run') || url.startsWith('/estimate'))) {
    opts.headers = { ...opts.headers, Authorization: `Bearer ${session.access_token}` };
  }
  return _fetch(url, opts);
};
</script>
```

- [ ] **Step 3: Commit**

```bash
git add public/index.html
git commit -m "feat: add credit chip and auth guard to pipeline UI"
```

---

## Task 13: Update .env.example

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Add new env vars to `.env.example`**

```bash
# Existing
ANTHROPIC_API_KEY=

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_CREATOR=price_...
STRIPE_PRICE_STUDIO=price_...
STRIPE_PRICE_AGENCY=price_...
STRIPE_PRICE_TOPUP=price_...

# App
APP_URL=https://your-railway-domain.railway.app
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: update env.example with Supabase and Stripe keys"
```

---

## Task 14: Smoke Test (End-to-End)

- [ ] **Step 1: Start server locally**

```bash
npm run dev
```

Expected: `CreativeOS running → http://localhost:3000`

- [ ] **Step 2: Test unauthenticated /run is blocked**

```bash
curl -s -X POST http://localhost:3000/run \
  -H "Content-Type: application/json" \
  -d '{"brief":"test"}' | jq .
```

Expected: `{"error": "Not authenticated."}`

- [ ] **Step 3: Test login page loads**

Open `http://localhost:3000/login.html` — should see magic link form.

- [ ] **Step 4: Test Stripe webhook locally (requires Stripe CLI)**

```bash
stripe listen --forward-to localhost:3000/billing/webhook
stripe trigger checkout.session.completed
```

Expected: server logs show credit grant, no errors.

- [ ] **Step 5: Deploy to Railway**

```bash
git push
```

Then add all env vars in Railway Dashboard → Variables.

---

## Phase 2 Preview (next session)

Once Phase 1 is live with paying users:
- Move job storage from filesystem to Supabase `jobs` table
- Preview page reads from DB (currently reads from `/outputs` folder — breaks on Railway ephemeral disk)
- Add billing management page (`public/billing.html`)
- Email onboarding sequence via Resend

---

## Stripe Credit Grant Map

| Event | Credits granted | Tier set |
|-------|----------------|----------|
| Creator subscription | +40 | creator |
| Studio subscription | +120 | studio |
| Agency subscription | +400 | agency |
| Top-up purchase | +20 | unchanged |
| Monthly renewal | +40/120/400 | unchanged |
| Subscription cancelled | 0 | free |
