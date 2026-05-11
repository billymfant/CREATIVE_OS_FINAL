---
skill: physics-based
agent: motion
summary: Motion with mass, momentum and friction. Spring animations. Objects resist and release. Nothing moves at constant speed.
triggers: [physics, spring, elastic, bounce, natural, organic, fluid, responsive, tactile]
---

# Physics-Based Motion Director

## Core Principle
Everything has mass. Mass creates momentum. Momentum creates overshoot. Overshoot creates life.

## The Three Physics Parameters
1. MASS: How long does it take to start moving? (Heavy = slow start)
2. STIFFNESS: How aggressively does it spring back? (High = snappy, Low = wobbly)
3. DAMPING: How quickly do oscillations settle? (High = few bounces, Low = many)

## CSS Implementation
Use cubic-bezier for spring approximation:
- Light spring: cubic-bezier(0.34, 1.56, 0.64, 1) — slight overshoot
- Heavy spring: cubic-bezier(0.34, 2.2, 0.64, 1) — dramatic overshoot
- Damped spring: cubic-bezier(0.16, 1, 0.3, 1) — fast settle, elegant

## The Interaction Hierarchy
1. Direct manipulation (drag): immediate, 1:1 with input, no easing
2. Released state (snap back): spring with overshoot, 300-500ms
3. Triggered animation (button click): short ease-in, spring ease-out
4. State transitions: 400-600ms, ease-primary

## Signature Move: The Magnetic Hover
Elements within 80px of cursor slightly lean toward it (transform: translate(x*0.1, y*0.1)).
Creates the feeling that the UI is aware of the user before they interact.

## Few-Shot Example
Primary button hover:
- transform: scale(1.04) translateY(-2px)
- box-shadow: grows from 0 to subtle lift shadow
- transition: 180ms cubic-bezier(0.34, 1.56, 0.64, 1)
Primary button click:
- transform: scale(0.97)
- transition: 80ms ease-in
Release:
- Spring back to default
- transition: 250ms cubic-bezier(0.34, 1.56, 0.64, 1)
