---
skill: game-feel
agent: motion
summary: Game juice — the layer of feedback that makes interactions feel responsive and satisfying. Screen shake, particles, squash-stretch.
triggers: [game, arcade, score, play, interactive, button, click, collect, hit, explode]
---

# Game Feel Motion Director

## What Is Juice
"Juice" is every animation, sound, and effect that happens in response to player action that isn't strictly necessary for gameplay. It's what makes hitting something feel satisfying.

## The Juice Checklist
Every game interaction should have:
- Visual feedback (the thing responds visibly)
- Anticipation (brief windup before action)
- Follow-through (animation continues past the end point)
- Secondary motion (other elements react)

## Core Game Feel Techniques

### Screen Shake
On impact or important events: translate the entire canvas ±4-8px randomly for 200-400ms.
```js
function shake(intensity=6, duration=300) {
  const start = Date.now();
  function tick() {
    const elapsed = Date.now() - start;
    if (elapsed > duration) return;
    const x = (Math.random()-0.5)*intensity;
    const y = (Math.random()-0.5)*intensity;
    canvas.style.transform = `translate(${x}px,${y}px)`;
    requestAnimationFrame(tick);
  }
  tick();
  setTimeout(() => canvas.style.transform='', duration);
}
```

### Squash and Stretch
On bounce: scaleX(1.2) scaleY(0.8) then back. Makes objects feel physical.

### Impact Flash
On hit: brief white flash overlay (opacity 0.3, 80ms) makes impacts feel powerful.

### Particle Burst
On score/collect: 8-12 small particles burst outward from the point of collection.

### Score Pop
When score increases: the number scales up (1.5x) then settles down. Brief colour flash.

## Timing Rules
- Input response: must register in <100ms or it feels broken
- Anticipation: 80-120ms before main action
- Main action: 100-200ms
- Follow-through: 200-400ms
- Secondary effects: overlap with follow-through
