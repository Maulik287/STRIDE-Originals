import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { Layers, RotateCw, Eye, Sparkles, Sun, Palette, Zap } from 'lucide-react';

export interface Sneaker3DCanvasProps {
  primaryColor?: string;
  accentColor?: string;
  soleColor?: string;
  modelName?: string;
  interactive?: boolean;
  explodedProgress?: number; // 0 to 1
  autoRotate?: boolean;
  className?: string;
  showControls?: boolean;
  lightingPreset?: 'cyber-lime' | 'cyber-gold' | 'studio';
  onLayerSelect?: (layerName: string) => void;
}

export interface Sneaker3DCanvasHandle {
  resetCamera: () => void;
  setExploded: (val: boolean) => void;
  toggleAutoRotate: () => void;
}

export const Sneaker3DCanvas = forwardRef<Sneaker3DCanvasHandle, Sneaker3DCanvasProps>(({
  primaryColor = '#EBEBEB',
  accentColor = '#1D1D1F',
  soleColor = '#b58351',
  modelName = 'Samba OG Architecture',
  interactive = true,
  explodedProgress: externalExplodedProgress,
  autoRotate: initialAutoRotate = true,
  className = 'w-full h-full min-h-[380px]',
  showControls = true,
  lightingPreset: initialLighting = 'cyber-lime',
  onLayerSelect,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Control states
  const [isExploded, setIsExploded] = useState(false);
  const [explodeSlider, setExplodeSlider] = useState(0); // 0 to 100
  const [isAutoRotate, setIsAutoRotate] = useState(initialAutoRotate);
  const [wireframe, setWireframe] = useState(false);
  const [activeLighting, setActiveLighting] = useState<'cyber-lime' | 'cyber-gold' | 'studio'>(initialLighting);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const shoeGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number>(0);

  // Mesh components dictionary for exploded animations & material updates
  const partsRef = useRef<{
    outsole?: THREE.Mesh;
    midsole?: THREE.Mesh;
    upper?: THREE.Mesh;
    tToe?: THREE.Mesh;
    stripes?: THREE.Group;
    laces?: THREE.Group;
    tongue?: THREE.Mesh;
    heelTab?: THREE.Mesh;
  }>({});

  // Materials dictionary
  const materialsRef = useRef<{
    outsoleMat?: THREE.MeshStandardMaterial;
    midsoleMat?: THREE.MeshStandardMaterial;
    upperMat?: THREE.MeshStandardMaterial;
    tToeMat?: THREE.MeshStandardMaterial;
    accentMat?: THREE.MeshStandardMaterial;
    lacesMat?: THREE.MeshStandardMaterial;
  }>({});

  // Lighting references
  const lightsRef = useRef<{
    ambient?: THREE.AmbientLight;
    spot1?: THREE.SpotLight;
    spot2?: THREE.DirectionalLight;
    rimLight?: THREE.PointLight;
  }>({});

  // Drag interaction physics
  const isDraggingRef = useRef(false);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0.005 });
  const targetRotationRef = useRef({ x: 0.1, y: 0.8 });

  // Expose imperative methods to parent
  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      targetRotationRef.current = { x: 0.15, y: 0.8 };
    },
    setExploded: (val: boolean) => {
      setIsExploded(val);
      setExplodeSlider(val ? 100 : 0);
    },
    toggleAutoRotate: () => {
      setIsAutoRotate(prev => !prev);
    }
  }));

  // Helper to construct procedural curved sole profile
  const createSoleGeometry = () => {
    const shape = new THREE.Shape();
    // Profile of sneaker foot outline from heel to toe
    shape.moveTo(-2.2, -0.6);
    shape.bezierCurveTo(-2.4, -0.2, -2.4, 0.4, -2.2, 0.6); // Heel cup
    shape.bezierCurveTo(-1.5, 0.7, -0.5, 0.65, 0.2, 0.75); // Arch & ball
    shape.bezierCurveTo(1.4, 0.85, 2.3, 0.6, 2.5, 0.0);   // Toe tip
    shape.bezierCurveTo(2.3, -0.6, 1.4, -0.85, 0.2, -0.75);
    shape.bezierCurveTo(-0.5, -0.65, -1.5, -0.7, -2.2, -0.6);

    const extrudeSettings = {
      steps: 2,
      depth: 0.35,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelSegments: 4,
    };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    geom.rotateX(Math.PI / 2);
    return geom;
  };

  // Helper to construct sneaker upper body
  const createUpperGeometry = () => {
    const shape = new THREE.Shape();
    shape.moveTo(-2.1, -0.55);
    shape.bezierCurveTo(-2.3, -0.1, -2.3, 0.3, -2.1, 0.55);
    shape.bezierCurveTo(-1.4, 0.65, -0.3, 0.6, 0.4, 0.68);
    shape.bezierCurveTo(1.3, 0.75, 2.1, 0.5, 2.3, 0.0);
    shape.bezierCurveTo(2.1, -0.5, 1.3, -0.75, 0.4, -0.68);
    shape.bezierCurveTo(-0.3, -0.6, -1.4, -0.65, -2.1, -0.55);

    const extrudeSettings = {
      steps: 4,
      depth: 0.9,
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0.15,
      bevelSegments: 5,
    };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    geom.rotateX(Math.PI / 2);
    return geom;
  };

  // Main setup effect
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;

    // Rule 1: High-DPR Clamping (Math.min(devicePixelRatio, 2))
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 6.2);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(dpr);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Create lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const spotLight1 = new THREE.SpotLight(0x0066ff, 3.2, 25, Math.PI / 4, 0.4, 1.2);
    spotLight1.position.set(5, 7, 5);
    spotLight1.castShadow = true;
    scene.add(spotLight1);

    const dirLight = new THREE.DirectionalLight(0x06b6d4, 2.2);
    dirLight.position.set(-6, 5, -4);
    scene.add(dirLight);

    const rimLight = new THREE.PointLight(0xff2a6d, 2.5, 15);
    rimLight.position.set(0, -3, -4);
    scene.add(rimLight);

    lightsRef.current = {
      ambient: ambientLight,
      spot1: spotLight1,
      spot2: dirLight,
      rimLight: rimLight,
    };

    // Subtly floating ambient cyber particles
    const particleCount = 120;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 12;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x0066ff,
      size: 0.035,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Build the master Sneaker Group
    const shoeGroup = new THREE.Group();
    shoeGroupRef.current = shoeGroup;
    scene.add(shoeGroup);

    // Initial PBR Materials
    const outsoleMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(soleColor),
      roughness: 0.65,
      metalness: 0.1,
    });
    const midsoleMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      roughness: 0.4,
      metalness: 0.05,
    });
    const upperMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(primaryColor),
      roughness: 0.35,
      metalness: 0.15,
    });
    const tToeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accentColor),
      roughness: 0.9,
      metalness: 0.0,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accentColor),
      roughness: 0.25,
      metalness: 0.2,
    });
    const lacesMat = new THREE.MeshStandardMaterial({
      color: 0xfcfcfc,
      roughness: 0.7,
      metalness: 0.05,
    });

    materialsRef.current = {
      outsoleMat,
      midsoleMat,
      upperMat,
      tToeMat,
      accentMat,
      lacesMat,
    };

    // 1. OUTSOLE (Gum Rubber Cupsole)
    const outsoleGeom = createSoleGeometry();
    const outsoleMesh = new THREE.Mesh(outsoleGeom, outsoleMat);
    outsoleMesh.position.set(0, -0.65, 0);
    outsoleMesh.castShadow = true;
    outsoleMesh.receiveShadow = true;
    outsoleMesh.name = 'Gum Rubber Outsole';
    shoeGroup.add(outsoleMesh);
    partsRef.current.outsole = outsoleMesh;

    // 2. MIDSOLE (Shock Cushioning Layer)
    const midsoleGeom = createSoleGeometry();
    midsoleGeom.scale(0.97, 0.5, 0.97);
    const midsoleMesh = new THREE.Mesh(midsoleGeom, midsoleMat);
    midsoleMesh.position.set(0, -0.4, 0);
    midsoleMesh.name = 'EVA / Boost Midsole';
    shoeGroup.add(midsoleMesh);
    partsRef.current.midsole = midsoleMesh;

    // 3. UPPER (Full-grain Leather Upper)
    const upperGeom = createUpperGeometry();
    const upperMesh = new THREE.Mesh(upperGeom, upperMat);
    upperMesh.position.set(0, 0.1, 0);
    upperMesh.castShadow = true;
    upperMesh.name = 'Full-Grain Leather Upper';
    shoeGroup.add(upperMesh);
    partsRef.current.upper = upperMesh;

    // 4. SUEDE T-TOE OVERLAY
    const tToeGeom = new THREE.SphereGeometry(0.8, 24, 16, 0, Math.PI, 0, Math.PI / 2);
    tToeGeom.scale(1.1, 0.5, 0.9);
    tToeGeom.rotateY(-Math.PI / 2);
    tToeGeom.rotateZ(0.08);
    const tToeMesh = new THREE.Mesh(tToeGeom, tToeMat);
    tToeMesh.position.set(1.4, 0.22, 0);
    tToeMesh.name = 'Terrace Suede T-Toe';
    shoeGroup.add(tToeMesh);
    partsRef.current.tToe = tToeMesh;

    // 5. ICONIC 3-STRIPES / SIDE ACCENT CHEVRONS
    const stripesGroup = new THREE.Group();
    stripesGroup.name = 'Lateral Stripes & Branding';
    for (let s = -1; s <= 1; s += 2) {
      for (let i = 0; i < 3; i++) {
        const stripeGeom = new THREE.BoxGeometry(0.12, 0.65, 0.04);
        stripeGeom.rotateZ(-0.38);
        const stripeMesh = new THREE.Mesh(stripeGeom, accentMat);
        stripeMesh.position.set(-0.2 + i * 0.32, 0.28, s * 0.64);
        stripesGroup.add(stripeMesh);
      }
    }
    shoeGroup.add(stripesGroup);
    partsRef.current.stripes = stripesGroup;

    // 6. LACES & EYESTAY
    const lacesGroup = new THREE.Group();
    lacesGroup.name = 'Woven Cotton Laces';
    for (let i = 0; i < 5; i++) {
      const laceGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8);
      laceGeom.rotateX(Math.PI / 2);
      laceGeom.rotateZ(i % 2 === 0 ? 0.2 : -0.2);
      const laceMesh = new THREE.Mesh(laceGeom, lacesMat);
      laceMesh.position.set(-0.6 + i * 0.32, 0.62 + i * 0.04, 0);
      lacesGroup.add(laceMesh);
    }
    shoeGroup.add(lacesGroup);
    partsRef.current.laces = lacesGroup;

    // 7. TONGUE
    const tongueGeom = new THREE.BoxGeometry(1.6, 0.1, 0.65);
    tongueGeom.rotateZ(0.4);
    const tongueMesh = new THREE.Mesh(tongueGeom, upperMat);
    tongueMesh.position.set(0.1, 0.7, 0);
    tongueMesh.name = 'Padded Tongue with Gold Foil Stamp';
    shoeGroup.add(tongueMesh);
    partsRef.current.tongue = tongueMesh;

    // 8. HEEL TAB
    const heelGeom = new THREE.BoxGeometry(0.5, 0.5, 0.8);
    heelGeom.rotateZ(-0.35);
    const heelMesh = new THREE.Mesh(heelGeom, accentMat);
    heelMesh.position.set(-1.8, 0.45, 0);
    heelMesh.name = 'Reinforced Heel Counter Tab';
    shoeGroup.add(heelMesh);
    partsRef.current.heelTab = heelMesh;

    // Center and tilt shoeGroup
    shoeGroup.position.set(0, 0, 0);
    shoeGroup.rotation.x = targetRotationRef.current.x;
    shoeGroup.rotation.y = targetRotationRef.current.y;

    // Rule 3: Zero Black Void Protocol — Immediate Frame 0 Render!
    renderer.render(scene, camera);

    // Animation Loop with inertia and exploded animation
    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Rotate particles slowly
      particleSystem.rotation.y += 0.0008;

      // Inertia / Damping on rotation
      if (isAutoRotate && !isDraggingRef.current) {
        targetRotationRef.current.y += 0.008;
      }

      // Smooth lerp to target rotation
      shoeGroup.rotation.y += (targetRotationRef.current.y - shoeGroup.rotation.y) * 0.08;
      shoeGroup.rotation.x += (targetRotationRef.current.x - shoeGroup.rotation.x) * 0.08;

      // Handle Exploded View animation smoothly
      const targetExplode = (externalExplodedProgress !== undefined ? externalExplodedProgress : (explodeSlider / 100));
      const currentOutsoleY = partsRef.current.outsole?.position.y || -0.65;
      const targetOutsoleY = -0.65 - targetExplode * 0.9;
      if (partsRef.current.outsole) {
        partsRef.current.outsole.position.y += (targetOutsoleY - currentOutsoleY) * 0.12;
      }

      const currentMidsoleY = partsRef.current.midsole?.position.y || -0.4;
      const targetMidsoleY = -0.4 - targetExplode * 0.45;
      if (partsRef.current.midsole) {
        partsRef.current.midsole.position.y += (targetMidsoleY - currentMidsoleY) * 0.12;
      }

      const currentUpperY = partsRef.current.upper?.position.y || 0.1;
      const targetUpperY = 0.1 + targetExplode * 0.15;
      if (partsRef.current.upper) {
        partsRef.current.upper.position.y += (targetUpperY - currentUpperY) * 0.12;
      }

      const currentLacesY = partsRef.current.laces?.position.y || 0;
      const targetLacesY = targetExplode * 0.75;
      if (partsRef.current.laces) {
        partsRef.current.laces.position.y += (targetLacesY - currentLacesY) * 0.12;
      }

      const currentTongueY = partsRef.current.tongue?.position.y || 0.7;
      const targetTongueY = 0.7 + targetExplode * 0.65;
      if (partsRef.current.tongue) {
        partsRef.current.tongue.position.y += (targetTongueY - currentTongueY) * 0.12;
      }

      const currentTToeX = partsRef.current.tToe?.position.x || 1.4;
      const targetTToeX = 1.4 + targetExplode * 0.55;
      if (partsRef.current.tToe) {
        partsRef.current.tToe.position.x += (targetTToeX - currentTToeX) * 0.12;
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Resize observer for responsive layout
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          const currentDpr = Math.min(window.devicePixelRatio || 1, 2);
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH, false);
          renderer.setPixelRatio(currentDpr);
          renderer.render(scene, camera);
        }
      }
    });
    resizeObserver.observe(container);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, []);

  // Update materials when primaryColor, accentColor, soleColor, or wireframe changes
  useEffect(() => {
    if (materialsRef.current.upperMat) {
      materialsRef.current.upperMat.color.set(primaryColor);
      materialsRef.current.upperMat.wireframe = wireframe;
    }
    if (materialsRef.current.tToeMat) {
      materialsRef.current.tToeMat.color.set(accentColor);
      materialsRef.current.tToeMat.wireframe = wireframe;
    }
    if (materialsRef.current.accentMat) {
      materialsRef.current.accentMat.color.set(accentColor);
      materialsRef.current.accentMat.wireframe = wireframe;
    }
    if (materialsRef.current.outsoleMat) {
      materialsRef.current.outsoleMat.color.set(soleColor);
      materialsRef.current.outsoleMat.wireframe = wireframe;
    }
    if (materialsRef.current.midsoleMat) {
      materialsRef.current.midsoleMat.wireframe = wireframe;
    }
    if (materialsRef.current.lacesMat) {
      materialsRef.current.lacesMat.wireframe = wireframe;
    }
  }, [primaryColor, accentColor, soleColor, wireframe]);

  // Update lighting preset
  useEffect(() => {
    if (!lightsRef.current.spot1 || !lightsRef.current.spot2 || !lightsRef.current.rimLight) return;

    if (activeLighting === 'cyber-lime') {
      lightsRef.current.spot1.color.set(0x00f59b); // Vibrant Mint / Lime
      lightsRef.current.spot1.intensity = 3.5;
      lightsRef.current.spot2.color.set(0x0066ff); // Hyper Cobalt
      lightsRef.current.spot2.intensity = 2.4;
      lightsRef.current.rimLight.color.set(0xff2a6d); // Electric Coral rim
    } else if (activeLighting === 'cyber-gold') {
      lightsRef.current.spot1.color.set(0xf59e0b);
      lightsRef.current.spot1.intensity = 3.8;
      lightsRef.current.spot2.color.set(0x06b6d4);
      lightsRef.current.spot2.intensity = 2.0;
      lightsRef.current.rimLight.color.set(0x8b5cf6);
    } else {
      // Studio Daylight
      lightsRef.current.spot1.color.set(0xffffff);
      lightsRef.current.spot1.intensity = 3.0;
      lightsRef.current.spot2.color.set(0xe2e8f0);
      lightsRef.current.spot2.intensity = 2.2;
      lightsRef.current.rimLight.color.set(0xffffff);
    }
  }, [activeLighting]);

  // Pointer drag interactions
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    isDraggingRef.current = true;
    mousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !interactive) return;
    const deltaX = e.clientX - mousePosRef.current.x;
    const deltaY = e.clientY - mousePosRef.current.y;
    mousePosRef.current = { x: e.clientX, y: e.clientY };

    targetRotationRef.current.y += deltaX * 0.009;
    targetRotationRef.current.x = Math.max(-0.4, Math.min(0.6, targetRotationRef.current.x + deltaY * 0.007));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore if already released
    }
  };

  const toggleExplodedState = () => {
    const nextVal = !isExploded;
    setIsExploded(nextVal);
    setExplodeSlider(nextVal ? 100 : 0);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl bg-slate-50 border border-slate-200 select-none flex flex-col justify-between ${className}`}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Top HUD: Architectural model watermark & telemetry */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0066ff] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0066ff]"></span>
          </span>
          <span className="text-[11px] font-mono-code font-extrabold tracking-widest text-[#0066ff] uppercase">
            3D CAD ENGINE • 60 FPS
          </span>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-white/85 border border-slate-200 backdrop-blur-md text-[10px] font-mono-code font-bold text-slate-600 shadow-xs">
          DPR 2.0 CLAMPED
        </div>
      </div>

      {/* Bottom Floating Interactive Control Bar */}
      {showControls && (
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-white/90 border border-slate-200 backdrop-blur-md shadow-xl">
          {/* Exploded Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleExplodedState}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-display uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                isExploded || explodeSlider > 0
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isExploded ? 'Collapsed' : 'Exploded View'}</span>
            </button>

            {/* Exploded slider */}
            <input
              type="range"
              min="0"
              max="100"
              value={explodeSlider}
              onChange={(e) => {
                const val = Number(e.target.value);
                setExplodeSlider(val);
                setIsExploded(val > 50);
              }}
              className="w-20 sm:w-24 accent-[#0066ff] cursor-pointer"
              title="Explode separation level"
            />
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-1.5">
            {/* Auto-spin toggle */}
            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              title={isAutoRotate ? 'Pause 360 Spin' : 'Resume 360 Spin'}
              className={`p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                isAutoRotate ? 'bg-blue-50 text-[#0066ff] border border-blue-200' : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            </button>

            {/* Wireframe Toggle */}
            <button
              onClick={() => setWireframe(!wireframe)}
              title="Toggle Wireframe CAD Mesh"
              className={`p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                wireframe ? 'bg-cyan-50 text-cyan-600 border border-cyan-200' : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {/* Lighting Preset Switcher */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={() => setActiveLighting('cyber-lime')}
                title="Neon Cyber Studio"
                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${
                  activeLighting === 'cyber-lime' ? 'bg-[#0066ff] text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3 h-3" />
              </button>
              <button
                onClick={() => setActiveLighting('cyber-gold')}
                title="Cyber Gold Studio"
                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${
                  activeLighting === 'cyber-gold' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3 h-3" />
              </button>
              <button
                onClick={() => setActiveLighting('studio')}
                title="Daylight Studio"
                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${
                  activeLighting === 'studio' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Sun className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating hints */}
      <div className="absolute bottom-16 left-4 pointer-events-none hidden sm:block">
        <span className="text-[10px] font-mono-code font-medium text-slate-600 bg-white/90 px-2 py-1 rounded border border-slate-200 shadow-xs backdrop-blur-xs">
          Drag to rotate • Click Explode to inspect layers
        </span>
      </div>
    </div>
  );
});

Sneaker3DCanvas.displayName = 'Sneaker3DCanvas';
