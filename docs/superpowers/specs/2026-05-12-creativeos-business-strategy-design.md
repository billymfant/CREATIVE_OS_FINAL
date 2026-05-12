# CreativeOS Business Strategy — Design Spec
**Date:** 2026-05-12  
**Status:** Approved for implementation planning

---

## 1. What We're Building

CreativeOS is a multi-agent AI creative pipeline that converts a brief into a fully deployable HTML campaign. The 7-agent chain (Classifier → Strategist → Copywriter → UI Designer → Motion → Creative Director → QA) produces output no single-model tool can match in coherence and craft.

The core moat: **orchestrated quality + deployable output**. Competitors give you copy or designs. CreativeOS gives you a live campaign.

---

## 2. B2B vs B2C Verdict

**Start B2C-prosumer, evolve toward B2B-SMB.**

**Why B2C first:**
- "Enter brief → get campaign" is immediately legible to freelancers, solo marketers, and content creators — no procurement, no champion needed
- RPG levelling + style library are consumer engagement mechanics (delight, discovery)
- Low-friction Product Hunt / creator-community launch path
- First 0→$10K MRR fastest through self-serve

**Why not pure B2C (consumer):**
- Token costs mean free-tier economics are brutal at scale without careful limits
- The depth (7 agents, custom styles, quality tiers) is overkill for occasional users
- "Client configs" + "token budgets" are already agency-thinking

**Why B2B-SMB is the $1M ARR path:**
- Boutique agencies (3–15 people) spend $2K–$8K/month on creative production
- They need client workspaces, output history, white-label delivery — all logical V2 features
- Agency lifetime value is 5–10× individual creator LTV
- The pipeline's QA agent specifically de-risks agency delivery (brand compliance)

**Target sequence:**
1. **Phase 1** — Freelancers, solo marketers, small studios (self-serve B2C)
2. **Phase 2** — Boutique agencies, in-house creative teams 3–20 pax (B2B SMB)
3. **Phase 3** — Mid-market agencies + enterprise creative teams (B2B enterprise, custom contracts)

---

## 3. Pricing Model

**Usage-based credits, bundled in subscription tiers.**

Credits align with AI cost structure (token spend varies per run). Subscriptions provide predictability for users and smooth MRR for the business.

| Tier | Price | Credits/mo | Agent runs ~equiv | Target segment |
|------|-------|------------|-------------------|----------------|
| Free | $0 | 5 credits | 5 runs | Lead gen / trial |
| Creator | $29/mo | 40 credits | 40 runs | Freelancers |
| Studio | $79/mo | 120 credits | 120 runs | Small studios |
| Agency | $199/mo | 400 credits | 400 runs + client workspaces | Agencies |
| Top-up | $10 | +20 credits | Pay-as-you-go top-up | All tiers |

**Credit cost per run:** 1 credit = 1 standard run (quality preset 1.0×). High-quality preset (2.0×) costs 2 credits. Fast preset (0.5×) costs 0.5 credits. This maps directly to token_budget multipliers already in the codebase.

**Annual discount:** 20% off (Creator → $23/mo, Studio → $63/mo, Agency → $159/mo) — drives LTV and reduces churn.

---

## 4. Infrastructure Stack (Phase 1)

All services chosen for Railway compatibility and zero-DevOps setup.

| Component | Service | Why |
|-----------|---------|-----|
| Auth | Supabase Auth | Email + Google OAuth, free tier generous |
| Database | Supabase Postgres | Jobs table + users + credit ledger |
| Billing | Stripe Subscriptions + Billing Portal | One SDK, hosted invoice/card UI |
| Hosting | Railway (already live) | Node.js server already configured |
| Static assets | Serve from Railway or Vercel | Existing public/ folder |
| Email | Resend | Cheap, developer-friendly, Railway add-on |

**Key Supabase tables:**
- `users` — id, email, tier, credits_remaining, total_runs
- `jobs` — id, user_id, client, brief, status, created_at, output_html
- `credit_ledger` — user_id, delta, reason, stripe_event_id, ts

**Stripe integration points:**
1. Subscription created → grant monthly credits (webhook)
2. Top-up purchased → add 20 credits (one-time payment)
3. Billing portal link in Settings page (no custom invoice UI)

---

## 5. Auth & Credit Guard

Every `/run` API call checks:
1. JWT from Supabase (user authenticated)
2. `credits_remaining > 0` (or tier === 'free' with monthly quota)
3. Deduct credits atomically before queuing the job

Free tier: 5 lifetime credits on signup (not monthly reset) → converts to paid fast or churns cleanly.

---

## 6. Go-to-Market — Phase 1

**Primary channel: creator community seeding (weeks 1–8)**

1. **Product Hunt launch** — "AI creative pipeline that writes, designs, and deploys your campaign in one brief." Target: top 5 product of the day. Asset: screen-record of wormhole UI → campaign output.
2. **Twitter/X build-in-public** — weekly progress posts showing real outputs. Target: @indiemakers, @designerwhoblog, @MarketingMax communities.
3. **Discord** — CreativeOS server. Early users get bonus credits for sharing outputs publicly.
4. **Reddit seeding** — r/webdev, r/freelance, r/marketing — show the output, link to free tier.

**Content hook:** "I gave it a one-line brief. 45 seconds later I had a full campaign page." Output quality does the selling — every run is a demo.

**Influencer tier:** 10 creators get 6 months free Agency in exchange for one public output post/week.

**Target Phase 1 metrics (0→6 months):**
- 500 free signups
- 50 paid users ($29–$79 tier)
- MRR: ~$2,500
- Conversion rate free→paid: 10%

---

## 7. Phase 2 — Agency Unlock (months 6–18)

Additions that unlock B2B-SMB revenue:

1. **Client workspaces** — Agency tier gets multi-client folders; outputs tagged per client
2. **White-label output domain** — Agency outputs served from `client.creativeos.app/output/...` or custom domain
3. **Team seats** — up to 3 seats on Agency; add seat for $30/mo
4. **Style injection per client** — saved brand tokens (colors, fonts, voice) auto-injected into every run for that client
5. **API access** — Studio+ tiers get a `/api/run` endpoint for automation

**Phase 2 pricing addition:**
- Agency Pro: $399/mo — unlimited runs, 5 seats, white-label, API

---

## 8. Key Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Anthropic API cost spikes | Credit cost per run mapped to token_budget; high-quality preset charges 2× credits |
| Free-tier abuse | 5 lifetime credits (not monthly) + email verify required |
| Output quality inconsistency | QA agent already in pipeline; add output rating (thumbs up/down) to feed model selection |
| Churn after first run | Email onboarding sequence: "Your next campaign is waiting" with use-case examples |
| Competition from Claude.ai / GPT-4o | Moat is orchestration quality + deployable output + style system, not raw model capability |

---

## 9. Implementation Phases Summary

**Phase 1 (weeks 1–6):** Auth (Supabase) + Billing (Stripe) + Credit guard on /run  
**Phase 2 (weeks 6–10):** Jobs persistence in Supabase + output history in Preview page (currently reads from disk)  
**Phase 3 (weeks 10–18):** Client workspaces + team seats + API access  
**Phase 4 (months 6–18):** White-label output + agency onboarding + enterprise contracts

---

## 10. Success Metrics

| Metric | 6-month target | 18-month target |
|--------|---------------|-----------------|
| MRR | $2,500 | $25,000 |
| Paid users | 50 | 300 |
| Avg revenue per user | $50/mo | $83/mo |
| Free→Paid conversion | 10% | 15% |
| Monthly churn | <8% | <5% |
| Net Revenue Retention | — | >110% (expansion via credits + seats) |
