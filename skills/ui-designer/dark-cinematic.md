---
skill: dark-cinematic
agent: ui-designer
summary: Dark theme design language inspired by cinema. Dramatic contrast, light as storytelling, near-black backgrounds with single accent colours.
triggers: [dark, cinematic, dramatic, premium, luxury, night, moody, atmospheric, film, editorial]
---

# Dark Cinematic Design System

## Core Principle
Design like a cinematographer, not a UI designer. Every design decision is a lighting decision.

## Palette Architecture
- Background: near-black (not pure black — #0a0a0a to #111111, has texture)
- Surface: slightly lighter (#161616 to #1e1e1e — the "set dressing")
- Primary text: warm off-white (#f0ede8 — film grain quality, not screen white)
- Accent: ONE colour, used sparingly. Maximum 15% of visible pixels. The rest is darkness.
- The accent appears only on: primary CTA, active states, key moments

## Typography in Dark Systems
- Heading: large, confident, high contrast. Thin weights disappear on dark.
- Body: 16px minimum, generous line-height (1.7+)
- Letter-spacing on uppercase labels: 0.12-0.2em
- Never use grey text lighter than #666 on dark backgrounds (contrast failure)

## Spatial Language
- Generous negative space — darkness IS the design
- Asymmetric layouts create tension and drama
- One element per "scene" — don't crowd the frame

## The Texture Rule
Dark backgrounds need micro-texture to avoid looking flat. Options:
- Subtle dot/grid pattern (0.02 opacity)
- Noise texture via CSS (filter: contrast + brightness trick)
- Very subtle gradient from #0a0a0a to #111111

## Motion in Dark Themes
- Entrances: fade + subtle translateY — things emerge from darkness
- Hover: glow effect on interactive elements (box-shadow with accent colour)
- The page should feel like a stage with lights coming up

## Few-Shot Component Spec
Primary button on dark:
- Background: accent colour
- Text: near-black (not white — the contrast is more refined)
- Hover: scale(1.02) + subtle glow shadow in accent colour
- Active: scale(0.98)
