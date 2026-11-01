import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThreeStore, CampusBuildingNode } from '../../stores/useThreeStore';
import { createPulseBeaconMaterial } from './PulseBeaconShader';
import { Building2, Users, Bell, ArrowRight, Eye, Sun, Moon } from 'lucide-react';

export const CampusScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    buildings,
    selectedBuilding,
    isDayMode,
    focusBuilding,
    clearSelectedBuilding,
    setViewMode,
    toggleDayNight,
  } = useThreeStore();

  const [hoveredBuilding, setHoveredBuilding] = useState<CampusBuildingNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDayMode ? 0x1e293b : 0x0b1120);
    scene.fog = new THREE.FogExp2(isDayMode ? 0x1e293b : 0x0b1120, 0.012);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 45, 60);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(
      isDayMode ? 0xffffff : 0x334155,
      isDayMode ? 1.0 : 0.6
    );
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, isDayMode ? 1.4 : 0.8);
    sunLight.position.set(40, 70, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Secondary subtle fill
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.3);
    fillLight.position.set(-30, 20, -30);
    scene.add(fillLight);

    // 3. Ground Plane with Grid
    const groundGeo = new THREE.PlaneGeometry(200, 200, 64, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: isDayMode ? 0x0f172a : 0x070c18,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(180, 36, 0x3b82f6, 0x1e293b);
    gridHelper.position.y = 0.05;
    scene.add(gridHelper);

    // 4. Department Building Meshes & GLSL Pulse Beacons
    const buildingMeshes: { mesh: THREE.Mesh; data: CampusBuildingNode }[] = [];
    const beaconMaterials: THREE.ShaderMaterial[] = [];

    buildings.forEach((b) => {
      // Main architectural building body
      const boxGeo = new THREE.BoxGeometry(b.size[0], b.size[1], b.size[2]);
      const boxMat = new THREE.MeshStandardMaterial({
        color: 0x151e32,
        roughness: 0.3,
        metalness: 0.7,
        emissive: new THREE.Color(b.beaconColor),
        emissiveIntensity: 0.08,
      });

      const mesh = new THREE.Mesh(boxGeo, boxMat);
      mesh.position.set(b.position[0], b.position[1], b.position[2]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      (mesh as any).buildingData = b;
      scene.add(mesh);
      buildingMeshes.push({ mesh, data: b });

      // Holographic Pulse Beacon Cylinder
      const beaconGeo = new THREE.CylinderGeometry(0.8, 2.5, 14, 16, 1, true);
      const beaconMat = createPulseBeaconMaterial(b.beaconColor);
      beaconMaterials.push(beaconMat);

      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(b.position[0], b.position[1] + b.size[1] / 2 + 7, b.position[2]);
      scene.add(beacon);

      // Glowing Point Light above beacon
      const beaconLight = new THREE.PointLight(b.beaconColor, 1.2, 25);
      beaconLight.position.set(b.position[0], b.position[1] + b.size[1] / 2 + 3, b.position[2]);
      scene.add(beaconLight);

      // Subtle rooftop accent
      const roofGeo = new THREE.BoxGeometry(b.size[0] * 0.9, 0.4, b.size[2] * 0.9);
      const roofMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(b.beaconColor),
        emissive: new THREE.Color(b.beaconColor),
        emissiveIntensity: 0.5,
      });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(b.position[0], b.position[1] + b.size[1] / 2 + 0.2, b.position[2]);
      scene.add(roof);
    });

    // 5. Interactive Raycaster & Mouse Move
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(buildingMeshes.map((b) => b.mesh));

      if (intersects.length > 0) {
        const hitData = (intersects[0].object as any).buildingData as CampusBuildingNode;
        setHoveredBuilding(hitData);
        setTooltipPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        containerRef.current!.style.cursor = 'pointer';
      } else {
        setHoveredBuilding(null);
        setTooltipPos(null);
        containerRef.current!.style.cursor = 'default';
      }
    };

    const onClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(buildingMeshes.map((b) => b.mesh));

      if (intersects.length > 0) {
        const hitData = (intersects[0].object as any).buildingData as CampusBuildingNode;
        focusBuilding(hitData.id);
      } else {
        clearSelectedBuilding();
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    // 6. Camera Orbiting & Animation Loop
    let targetLookAt = new THREE.Vector3(0, 0, 0);
    let targetCamPos = new THREE.Vector3(0, 45, 60);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Update shader uniforms
      beaconMaterials.forEach((mat) => {
        mat.uniforms.uTime.value = elapsedTime;
      });

      // Target interpolation
      if (selectedBuilding) {
        targetLookAt.set(
          selectedBuilding.position[0],
          selectedBuilding.position[1] / 2,
          selectedBuilding.position[2]
        );
        targetCamPos.set(
          selectedBuilding.position[0] + 18,
          selectedBuilding.position[1] + 14,
          selectedBuilding.position[2] + 24
        );
      } else {
        targetLookAt.set(0, 0, 0);
        targetCamPos.set(
          Math.sin(elapsedTime * 0.05) * 60,
          45,
          Math.cos(elapsedTime * 0.05) * 60
        );
      }

      camera.position.lerp(targetCamPos, 0.04);
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
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('mousemove', onMouseMove);
        renderer.domElement.removeEventListener('click', onClick);
      }
      cancelAnimationFrame(animationFrameId);

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
    };
  }, [buildings, selectedBuilding, isDayMode, focusBuilding, clearSelectedBuilding]);

  return (
    <div className="relative w-full h-[620px] bg-[#0b1120] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* 3D WebGL Canvas Target */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Top Floating Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 bg-[#151e32]/90 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-slate-700/80 pointer-events-auto shadow-lg">
          <Building2 className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-white tracking-wide">
            Campus Spatial Navigation (Three.js 3D Graph)
          </span>
          <span className="text-[10px] bg-blue-500/20 text-blue-300 font-mono px-2 py-0.5 rounded">
            Interactive Raycasting
          </span>
        </div>

        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={toggleDayNight}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#151e32]/90 hover:bg-slate-700 backdrop-blur-md rounded-lg border border-slate-700 text-xs font-medium text-slate-200 transition shadow"
            title="Toggle Day/Night Environmental Lighting"
          >
            {isDayMode ? <Moon className="w-3.5 h-3.5 text-blue-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isDayMode ? 'Night Mode' : 'Day Mode'}</span>
          </button>

          <button
            onClick={() => setViewMode('LAB_DESK')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 backdrop-blur-md rounded-lg text-xs font-medium text-white transition shadow"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Enter 3D Lab Desk</span>
          </button>
        </div>
      </div>

      {/* Hover Tooltip Card */}
      {hoveredBuilding && tooltipPos && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 bg-[#151e32]/95 backdrop-blur-md border border-slate-700 px-3.5 py-2.5 rounded-lg shadow-2xl text-xs"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="flex items-center space-x-2 font-bold text-white mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: hoveredBuilding.beaconColor }}
            />
            <span>{hoveredBuilding.name}</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2">{hoveredBuilding.description}</p>
          <div className="flex items-center space-x-3 text-[10px] text-slate-300 font-mono">
            <span className="flex items-center space-x-1">
              <Users className="w-3 h-3 text-emerald-400" />
              <span>{hoveredBuilding.activeSessions} Active Labs</span>
            </span>
            <span className="flex items-center space-x-1">
              <Bell className="w-3 h-3 text-amber-400" />
              <span>{hoveredBuilding.unreadNotices} Unread Notices</span>
            </span>
          </div>
        </div>
      )}

      {/* Selected Building Detail Panel Drawer */}
      {selectedBuilding && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 bg-[#151e32]/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedBuilding.beaconColor }}
              />
              <h3 className="text-sm font-bold text-white">{selectedBuilding.name}</h3>
            </div>
            <button
              onClick={clearSelectedBuilding}
              className="text-xs text-slate-400 hover:text-white"
            >
              Reset
            </button>
          </div>
          <p className="text-xs text-slate-300 mb-3">{selectedBuilding.description}</p>
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs font-mono">
            <div className="bg-[#0b1120] p-2 rounded border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Live Sessions</div>
              <div className="text-emerald-400 font-bold">{selectedBuilding.activeSessions} Running</div>
            </div>
            <div className="bg-[#0b1120] p-2 rounded border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase">Circulars</div>
              <div className="text-blue-400 font-bold">{selectedBuilding.unreadNotices} Active</div>
            </div>
          </div>
          <button
            onClick={() => setViewMode('LAB_DESK')}
            className="w-full flex items-center justify-center space-x-1.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition shadow"
          >
            <span>Access Department Lab Workstations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
