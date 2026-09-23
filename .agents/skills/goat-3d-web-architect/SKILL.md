---
name: goat-3d-web-architect
description: >-
  The definitive, master-level engineering standard for building award-winning,
  cinema-grade 3D websites. Covers Apple-style high-DPR scroll canvas sequences,
  WebGL/Three.js/GSAP/Lenis architectures, zero-cost AI voice assistants,
  full-stack backend connectivity, curated free 3D/PBR asset pipelines,
  FWA/Awwwards aesthetic benchmarks, and zero-downtime production deployment.
---

# GOAT 3D Web Architect: The Master Blueprint

### 1. Apple-Style Frame Sequence Canvas Protocol
```typescript
const renderFrame = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, canvas: HTMLCanvasElement) => {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const imgAspect = img.width / img.height;
  const canvasAspect = width / height;
  let drawW = width;
  let drawH = height;
  let offsetX = 0;
  let offsetY = 0;

  if (canvasAspect > imgAspect) {
    drawH = width / imgAspect;
    offsetY = (height - drawH) / 2;
  } else {
    drawW = height * imgAspect;
    offsetX = (width - drawW) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  ctx.restore();
};
```

### 2. Native Web Speech Voice Assistant Rules
- Deep, clear authoritative tone: `utterance.pitch = 0.88`, `utterance.rate = 1.10`.
- Sequential chaining: Never use blind `setTimeout` calls for conversational tours. Always bind progression to `utterance.onend`.
- Hardware conflict defense: Never hold an `AudioContext` or `getUserMedia` mic stream while speech recognition or synthesis is active.

### 3. Obsidian Dark Luxury Aesthetic Rules
- Never use `#000000` flat black. Layer rich tones:
  - Base: `#080d09`
  - Surface: `#0e1610`
  - Elevate: `#152219`
  - Border: `#1c2e22`
- High-impact neon accents:
  - Electric Lime: `#c6f554`
  - Cyber Gold: `#f7cc46`
  - Laser Cyan: `#38bdf8`
- Typography:
  - Headings: `Syne`, `Outfit`, or `Clash Display`
  - Body: `Inter` or `Plus Jakarta Sans`

### 4. Zero-Fail Production Standard
- Clamped DPR at max 2 for GPU memory optimization.
- Zero black void protocol: Frame 0 or placeholder 3D geometry mounts synchronously before heavy assets load.
- Self-contained standalone builds and server rewrite rules.
