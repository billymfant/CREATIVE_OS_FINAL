---
skill: canvas-generative
agent: developer
summary: Master-level Canvas API and creative coding. Particle systems, noise functions, force fields, orbital mechanics. 60fps always.
triggers: [particle, generative, procedural, canvas, visual, immersive, interactive, 3d, art, physics]
---

# Generative Canvas Specialist

## Performance First
60fps is the minimum. Anything less breaks immersion.

### Performance Rules
- Use typed arrays for particle data: `new Float32Array(N * 6)` (x,y,vx,vy,life,size)
- Never create objects inside the animation loop (no `new` in `requestAnimationFrame`)
- Use `ctx.fillRect(0,0,W,H)` with low alpha for motion trails, not `clearRect`
- Profile with `performance.now()` — if frame time >16ms, optimize
- Batch draw calls: draw all particles of same colour in one path

## Particle System Template
```js
class ParticleSystem {
  constructor(n) {
    // Pack all particle data into typed arrays
    this.x = new Float32Array(n);
    this.y = new Float32Array(n);
    this.vx = new Float32Array(n);
    this.vy = new Float32Array(n);
    this.life = new Float32Array(n);
    this.n = n;
  }
  update() {
    for(let i=0; i<this.n; i++) {
      this.vx[i] += (this.targetX[i]-this.x[i]) * 0.05; // spring to target
      this.vy[i] += (this.targetY[i]-this.y[i]) * 0.05;
      this.vx[i] *= 0.9; // damping
      this.vy[i] *= 0.9;
      this.x[i] += this.vx[i];
      this.y[i] += this.vy[i];
    }
  }
}
```

## Noise Functions
For organic movement, use simplex noise (include a minimal implementation):
```js
// Minimal 2D value noise (no dependencies)
function noise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x-xi, yf = y-yi;
  const u = xf*xf*(3-2*xf), v = yf*yf*(3-2*yf);
  const a = hash(xi,yi), b = hash(xi+1,yi);
  const c = hash(xi,yi+1), d = hash(xi+1,yi+1);
  return a + u*(b-a) + v*(c-a) + u*v*(a-b-c+d);
}
function hash(x,y) { return (Math.sin(x*127.1+y*311.7)*43758.5453)%1; }
```

## Fibonacci Sphere Distribution
For distributing points evenly on a sphere:
```js
function fibSphere(n) {
  const pts = [], golden = Math.PI*(3-Math.sqrt(5));
  for(let i=0; i<n; i++) {
    const y = 1-(i/(n-1))*2, r = Math.sqrt(1-y*y);
    const theta = golden*i;
    pts.push({x:Math.cos(theta)*r, y, z:Math.sin(theta)*r});
  }
  return pts;
}
```

## Mouse Interaction Pattern
```js
// Mouse repulsion field
const dx = p.x - mouse.x, dy = p.y - mouse.y;
const dist = Math.sqrt(dx*dx+dy*dy);
if(dist < repelRadius) {
  const force = (repelRadius-dist)/repelRadius;
  p.vx += (dx/dist)*force*strength;
  p.vy += (dy/dist)*force*strength;
}
```

## Colour Interpolation
```js
function lerpColor(hex1, hex2, t) {
  const a = hexToRgb(hex1), b = hexToRgb(hex2);
  return `rgb(${lerp(a.r,b.r,t)|0},${lerp(a.g,b.g,t)|0},${lerp(a.b,b.b,t)|0})`;
}
```
