"use client";

import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  InstancedMesh,
  MathUtils,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PointLight,
  Points,
  PointsMaterial,
  Scene,
  SphereGeometry,
  WebGLRenderer,
} from "three";

/**
 * Real-time 3D layer behind the hero burger: lit sesame seeds tumbling in depth and warm embers rising
 * from the grill. ~2k triangles, one draw call per layer, DPR capped, paused off-screen / in background tabs.
 * Loaded lazily (next/dynamic) and only on desktop-class devices without reduced-motion.
 */
export default function HeroScene() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    } catch {
      return; // No WebGL: the photo-only hero still looks complete.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block";

    const scene = new Scene();
    const camera = new PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 14);

    scene.add(new AmbientLight(0xfff1dc, 0.55));
    const key = new DirectionalLight(0xffe2b0, 2.2);
    key.position.set(4, 6, 8);
    scene.add(key);
    const rim = new PointLight(0xff5b1f, 40, 30);
    rim.position.set(-5, -3, 4);
    scene.add(rim);

    // Sesame seeds — flattened, slightly pointed ellipsoids.
    const SEEDS = 70;
    const seedGeo = new SphereGeometry(0.16, 14, 10);
    seedGeo.scale(1, 0.42, 0.62);
    const seedMat = new MeshStandardMaterial({ color: new Color("#F3DFB2"), roughness: 0.55, metalness: 0.05 });
    const seeds = new InstancedMesh(seedGeo, seedMat, SEEDS);
    const dummy = new Object3D();
    const data = Array.from({ length: SEEDS }, () => ({
      x: MathUtils.randFloatSpread(16),
      y: MathUtils.randFloatSpread(10),
      z: MathUtils.randFloat(-8, 4),
      rx: Math.random() * Math.PI,
      ry: Math.random() * Math.PI,
      sx: MathUtils.randFloat(0.002, 0.008),
      sy: MathUtils.randFloat(0.003, 0.01),
      drift: MathUtils.randFloat(0.002, 0.006),
      phase: Math.random() * Math.PI * 2,
      scale: MathUtils.randFloat(0.7, 1.35),
    }));
    scene.add(seeds);

    // Embers — additive glowing points rising slowly.
    const EMBERS = 160;
    const pos = new Float32Array(EMBERS * 3);
    const speed = new Float32Array(EMBERS);
    for (let i = 0; i < EMBERS; i++) {
      pos[i * 3] = MathUtils.randFloatSpread(18);
      pos[i * 3 + 1] = MathUtils.randFloatSpread(12);
      pos[i * 3 + 2] = MathUtils.randFloat(-6, 3);
      speed[i] = MathUtils.randFloat(0.004, 0.014);
    }
    const emberGeo = new BufferGeometry();
    emberGeo.setAttribute("position", new BufferAttribute(pos, 3));
    const dot = document.createElement("canvas");
    dot.width = dot.height = 64;
    const g = dot.getContext("2d")!;
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,220,150,1)");
    grad.addColorStop(0.35, "rgba(255,120,40,.7)");
    grad.addColorStop(1, "rgba(255,60,20,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    const emberTex = new CanvasTexture(dot);
    const emberMat = new PointsMaterial({ size: 0.22, map: emberTex, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0.85 });
    const embers = new Points(emberGeo, emberMat);
    scene.add(embers);

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let running = true;
    let raf = 0;
    let t = 0;
    const loop = () => {
      raf = 0;
      if (!running) return;
      t += 1;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      camera.position.x = pointer.x * 1.2;
      camera.position.y = -pointer.y * 0.8;
      camera.lookAt(0, 0, 0);

      for (let i = 0; i < SEEDS; i++) {
        const s = data[i];
        s.rx += s.sx;
        s.ry += s.sy;
        s.y += s.drift;
        if (s.y > 6) s.y = -6;
        dummy.position.set(s.x + Math.sin(t * 0.01 + s.phase) * 0.3, s.y, s.z);
        dummy.rotation.set(s.rx, s.ry, 0);
        dummy.scale.setScalar(s.scale);
        dummy.updateMatrix();
        seeds.setMatrixAt(i, dummy.matrix);
      }
      seeds.instanceMatrix.needsUpdate = true;

      const p = emberGeo.attributes.position as BufferAttribute;
      for (let i = 0; i < EMBERS; i++) {
        let y = p.getY(i) + speed[i];
        if (y > 6.5) y = -6.5;
        p.setY(i, y);
        p.setX(i, p.getX(i) + Math.sin(t * 0.02 + i) * 0.003);
      }
      p.needsUpdate = true;
      rim.intensity = 34 + Math.sin(t * 0.03) * 8;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && running) raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting && !document.hidden;
      start();
    });
    io.observe(el);
    const onVis = () => {
      running = !document.hidden;
      start();
    };
    document.addEventListener("visibilitychange", onVis);
    start();

    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onPointer);
      seedGeo.dispose();
      seedMat.dispose();
      emberGeo.dispose();
      emberMat.dispose();
      emberTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={host} aria-hidden className="pointer-events-none absolute inset-0" />;
}
