---
skill: game-engine
agent: developer
summary: Browser game development. Fixed timestep loops, collision detection, score systems, start/game/end screens. Keyboard and touch.
triggers: [game, arcade, tetris, score, play, level, lives, leaderboard, compete, challenge]
---

# Browser Game Engineer

## The Game Loop (Fixed Timestep)
```js
const TICK = 1000/60; // 16.67ms
let lastTime = 0, accumulator = 0;

function gameLoop(timestamp) {
  const delta = timestamp - lastTime;
  lastTime = timestamp;
  accumulator += delta;
  
  while(accumulator >= TICK) {
    update(TICK/1000); // fixed physics step
    accumulator -= TICK;
  }
  
  render();
  if(state === 'playing') requestAnimationFrame(gameLoop);
}
```

## Input System
Handle both keyboard and touch simultaneously:
```js
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// Mobile touch
canvas.addEventListener('touchstart', e => {
  const t = e.touches[0];
  handleInput(t.clientX, t.clientY);
}, {passive:false});
```

## 3-Screen Structure
Every game needs exactly 3 screens — start, game, end:
```js
// State machine
let gameState = 'start'; // start | playing | dead | win

function render() {
  ctx.clearRect(0,0,W,H);
  if(gameState === 'start') drawStart();
  else if(gameState === 'playing') drawGame();
  else if(gameState === 'dead' || gameState === 'win') drawEnd();
}
```

## Collision Detection (AABB)
```js
function collides(a, b) {
  return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
}
```

## Score System
```js
let score = 0, highScore = parseInt(localStorage.getItem('hs')||0);
function addScore(points) {
  score += points;
  if(score > highScore) { highScore = score; localStorage.setItem('hs', highScore); }
  // Animate score display
  scoreEl.style.transform = 'scale(1.4)';
  setTimeout(() => scoreEl.style.transform = '', 200);
}
```

## Difficulty Curve
```js
// Speed increases with score
const speed = BASE_SPEED + Math.floor(score/100) * SPEED_INCREMENT;
// Spawn rate increases with level
const spawnInterval = Math.max(MIN_INTERVAL, BASE_INTERVAL - level * 200);
```
