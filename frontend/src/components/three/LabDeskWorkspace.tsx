import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThreeStore } from '../../stores/useThreeStore';
import { useEditorStore } from '../../stores/useEditorStore';
import { Monitor, Lightbulb, ZoomIn, ZoomOut, ArrowLeft, Terminal, ShieldCheck } from 'lucide-react';

export const LabDeskWorkspace: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { setViewMode, lampLit, toggleLamp } = useThreeStore();
  const { code, terminalLogs } = useEditorStore();

  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [heartbeatActive, setHeartbeatActive] = useState(true);

  // Dynamic monitor canvas texture updater
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 640;
    canvasRef.current = canvas;

    const updateScreenCanvas = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background
      ctx.fillStyle = '#0b1120';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Top IDE Bar
      ctx.fillStyle = '#151e32';
      ctx.fillRect(0, 0, canvas.width, 48);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 20px "JetBrains Mono", monospace';
      ctx.fillText('CampusNotify Proctored Lab Terminal v2.4 — Station #24', 24, 32);

      // Heartbeat Dot
      ctx.fillStyle = heartbeatActive ? '#10b981' : '#f43f5e';
      ctx.beginPath();
      ctx.arc(canvas.width - 32, 24, 8, 0, Math.PI * 2);
      ctx.fill();

      // Code text preview
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px "JetBrains Mono", monospace';
      const lines = code.split('\n').slice(0, 16);
      lines.forEach((line, idx) => {
        if (line.includes('class') || line.includes('public') || line.includes('static')) {
          ctx.fillStyle = '#38bdf8';
        } else if (line.includes('//') || line.includes('*')) {
          ctx.fillStyle = '#64748b';
        } else if (line.includes('int') || line.includes('return')) {
          ctx.fillStyle = '#a78bfa';
        } else {
          ctx.fillStyle = '#e2e8f0';
        }
        ctx.fillText(line, 24, 80 + idx * 24);
      });

      // Terminal Bottom Split
      ctx.fillStyle = '#070c18';
      ctx.fillRect(0, canvas.height - 180, canvas.width, 180);

      ctx.fillStyle = '#10b981';
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillText('>>> LIVE TELEMETRY STDOUT:', 24, canvas.height - 150);

      const logPreviews = terminalLogs.slice(0, 4);
      logPreviews.forEach((log, idx) => {
        ctx.fillStyle = log.includes('⚠️') ? '#f59e0b' : '#38bdf8';
        ctx.fillText(`$ ${log}`, 24, canvas.height - 120 + idx * 22);
      });
    };

    updateScreenCanvas();
    const interval = setInterval(updateScreenCanvas, 1000);
    return () => clearInterval(interval);
  }, [code, terminalLogs, heartbeatActive]);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1120);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    const initialPos = new THREE.Vector3(0, 1.4, 2.2);
    const zoomedPos = new THREE.Vector3(0, 1.15, 1.2);
    camera.position.copy(isZoomedIn ? zoomedPos : initialPos);
    camera.lookAt(0, 1.0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // 2. Lighting & Toggleable Desk Lamp
    const ambientLight = new THREE.AmbientLight(0x334155, 0.6);
    scene.add(ambientLight);

    const ceilingLight = new THREE.DirectionalLight(0xffffff, 0.8);
    ceilingLight.position.set(0, 5, 2);
    ceilingLight.castShadow = true;
    scene.add(ceilingLight);

    // Desk Lamp Warm PointLight
    const lampLight = new THREE.PointLight(0xffedd5, lampLit ? 2.5 : 0.0, 4);
    lampLight.position.set(-0.8, 1.6, -0.1);
    lampLight.castShadow = true;
    scene.add(lampLight);

    // 3. Desk Bench Mesh
    const deskTopGeo = new THREE.BoxGeometry(2.4, 0.08, 1.2);
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.4,
      metalness: 0.2,
    });
    const deskTop = new THREE.Mesh(deskTopGeo, deskMat);
    deskTop.position.set(0, 0.9, 0);
    deskTop.receiveShadow = true;
    scene.add(deskTop);

    // Desk Legs
    const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 16);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8 });
    [[-1.1, -0.5], [1.1, -0.5], [-1.1, 0.5], [1.1, 0.5]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, 0.45, z);
      leg.castShadow = true;
      scene.add(leg);
    });

    // 4. PC Monitor with Dynamic Canvas Texture
    const monitorStandGeo = new THREE.BoxGeometry(0.24, 0.02, 0.2);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7 });
    const monitorStand = new THREE.Mesh(monitorStandGeo, standMat);
    monitorStand.position.set(0, 0.95, -0.1);
    scene.add(monitorStand);

    const monitorPillarGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.25, 16);
    const monitorPillar = new THREE.Mesh(monitorPillarGeo, standMat);
    monitorPillar.position.set(0, 1.08, -0.12);
    scene.add(monitorPillar);

    const monitorBezelGeo = new THREE.BoxGeometry(1.24, 0.74, 0.04);
    const bezelMat = new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.5 });
    const monitorBezel = new THREE.Mesh(monitorBezelGeo, bezelMat);
    monitorBezel.position.set(0, 1.28, -0.1);
    monitorBezel.castShadow = true;
    scene.add(monitorBezel);

    // Screen with dynamic CanvasTexture!
    const canvasTexture = new THREE.CanvasTexture(canvasRef.current);
    canvasTexture.minFilter = THREE.LinearFilter;
    canvasTexture.magFilter = THREE.LinearFilter;

    const screenGeo = new THREE.PlaneGeometry(1.18, 0.68);
    const screenMat = new THREE.MeshBasicMaterial({
      map: canvasTexture,
      toneMapped: false,
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 1.28, -0.078);
    scene.add(screen);

    // Monitor screen glow
    const screenGlow = new THREE.PointLight(0x38bdf8, 0.6, 1.8);
    screenGlow.position.set(0, 1.28, 0.1);
    scene.add(screenGlow);

    // 5. Desk Accessories: Keyboard, Mouse, CPU Tower
    const keyboardGeo = new THREE.BoxGeometry(0.65, 0.015, 0.2);
    const keyboardMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const keyboard = new THREE.Mesh(keyboardGeo, keyboardMat);
    keyboard.position.set(0, 0.95, 0.25);
    scene.add(keyboard);

    const mouseGeo = new THREE.BoxGeometry(0.08, 0.02, 0.12);
    const mouse = new THREE.Mesh(mouseGeo, keyboardMat);
    mouse.position.set(0.45, 0.95, 0.25);
    scene.add(mouse);

    // CPU Tower with Blinking LED
    const cpuGeo = new THREE.BoxGeometry(0.24, 0.55, 0.5);
    const cpuMat = new THREE.MeshStandardMaterial({ color: 0x0a0f1d, metalness: 0.6 });
    const cpu = new THREE.Mesh(cpuGeo, cpuMat);
    cpu.position.set(0.9, 0.28, 0);
    scene.add(cpu);

    const ledGeo = new THREE.SphereGeometry(0.012, 16, 16);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const powerLed = new THREE.Mesh(ledGeo, ledMat);
    powerLed.position.set(0.9, 0.52, 0.26);
    scene.add(powerLed);

    // 6. Desk Lamp
    const lampBaseGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16);
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const lampBase = new THREE.Mesh(lampBaseGeo, lampMat);
    lampBase.position.set(-0.8, 0.95, -0.1);
    scene.add(lampBase);

    const lampArmGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.6, 16);
    const lampArm = new THREE.Mesh(lampArmGeo, lampMat);
    lampArm.position.set(-0.8, 1.25, -0.1);
    lampArm.rotation.z = -0.2;
    scene.add(lampArm);

    // Animation Loop with smooth lerp
    let animId: number;
    const targetPos = new THREE.Vector3();
    const targetLookAt = new THREE.Vector3(0, 1.05, 0);

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Blinking power LED heartbeat
      const time = Date.now() * 0.003;
      const isBlink = Math.sin(time * 3) > 0;
      setHeartbeatActive((prev) => (prev !== isBlink ? isBlink : prev));
      ledMat.color.setHex(isBlink ? 0x10b981 : 0x047857);

      canvasTexture.needsUpdate = true;

      // Smooth camera lerp
      targetPos.copy(isZoomedIn ? zoomedPos : initialPos);
      camera.position.lerp(targetPos, 0.05);
      camera.lookAt(targetLookAt);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);

      // Recursive GPU memory disposal
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry) {
            obj.geometry.dispose();
          }
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        }
      });
      scene.clear();

      if (renderer.domElement && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      canvasTexture.dispose();
    };
  }, [isZoomedIn, lampLit]);

  return (
    <div className="relative w-full h-[620px] bg-[#0b1120] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <div ref={containerRef} className="w-full h-full" />

      {/* Floating Workbench Toolbar Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 bg-[#151e32]/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-slate-700 pointer-events-auto shadow-lg">
          <Monitor className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white tracking-wide">
            3D Computer Lab Workstation Desk
          </span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded">
            Live Dynamic Canvas Texture
          </span>
        </div>

        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={toggleLamp}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition shadow backdrop-blur-md ${
              lampLit
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-[#151e32]/90 border-slate-700 text-slate-400'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{lampLit ? 'Lamp ON' : 'Lamp OFF'}</span>
          </button>

          <button
            onClick={() => setIsZoomedIn(!isZoomedIn)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#151e32]/90 hover:bg-slate-700 backdrop-blur-md rounded-lg border border-slate-700 text-xs font-medium text-slate-200 transition shadow"
          >
            {isZoomedIn ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
            <span>{isZoomedIn ? 'Overview View' : 'Focus Monitor'}</span>
          </button>

          <button
            onClick={() => setViewMode('CAMPUS')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 backdrop-blur-md rounded-lg text-xs font-medium text-white transition shadow"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Campus</span>
          </button>
        </div>
      </div>

      {/* Hardware Telemetry Footbar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="bg-[#151e32]/90 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-lg text-xs font-mono text-slate-300 flex items-center space-x-4 pointer-events-auto">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Station #24 Active</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">RAM: 32GB ECC (Verified)</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">LAN: Captive Portal Zero-Rated</span>
        </div>

        <div className="bg-[#151e32]/90 backdrop-blur-md border border-slate-700/80 px-3 py-2 rounded-lg text-xs text-blue-400 font-mono flex items-center space-x-1.5 pointer-events-auto">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Physical Lab Power Cut Immunity Ready</span>
        </div>
      </div>
    </div>
  );
};
