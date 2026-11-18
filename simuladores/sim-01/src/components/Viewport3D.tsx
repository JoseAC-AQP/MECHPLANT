import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  AnalysisResult,
  CameraPreset,
  ComponentDefinition,
  MaterialSpec,
  SimulationParams,
  UnitSystem,
  ViewportOptions,
} from '../types/engineering';
import { sampleStressColor, COLORMAP_CSS_GRADIENT } from '../engine/stressColormap';
import { formatEng, toDisplayLength, toDisplayStress, unitLabels } from '../engine/units';

export interface Viewport3DHandle {
  captureSnapshot: () => string | null;
  resetCamera: () => void;
}

interface Viewport3DProps {
  params: SimulationParams;
  component: ComponentDefinition;
  material: MaterialSpec;
  result: AnalysisResult;
  options: ViewportOptions;
  unitSystem: UnitSystem;
  onDropComponent?: (componentId: string) => void;
}

interface ProbeReading {
  xMm: number;
  stressMPa: number;
  displacementMm: number;
}

const WORLD_SPAN = 4.8; // Standardized world length along X (-2.4 .. +2.4)

// Reusable math objects outside animation loops to avoid GC churn
const _camTargetPos = new THREE.Vector3();
const _camLookTarget = new THREE.Vector3(0, 0, 0);

function detectSoftwareWebGL(): boolean {
  try {
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

/**
 * Builds a subdivided deformable BufferGeometry representing the active cross-section
 * along X in [-WORLD_SPAN/2, +WORLD_SPAN/2], so vertex colors & analytical/FEM deformations
 * map smoothly across the full 3D mesh.
 */
function buildDeformableGeometry(
  params: SimulationParams,
  component: ComponentDefinition,
): {
  geometry: THREE.BufferGeometry;
  basePositions: Float32Array;
  visualHeight: number;
  visualWidth: number;
} {
  const L = Math.max(40, params.lengthMm);
  const scale = WORLD_SPAN / L;

  // Clamp visual cross-section aspect ratios so slender or stubby parts remain crisp & inspectable
  const clampDim = (mm: number, minW = 0.22, maxW = 1.45) =>
    THREE.MathUtils.clamp(mm * scale, minW, maxW);

  let visualHeight = 0.5;
  let visualWidth = 0.45;

  const isCircular =
    params.sectionType === 'CIRCULAR' || params.sectionType === 'TUBULAR';

  let geometry: THREE.BufferGeometry;

  if (isCircular) {
    const rOuter = clampDim(params.diameterMm, 0.24, 1.3) * 0.5;
    visualHeight = rOuter * 2;
    visualWidth = rOuter * 2;

    const radialSegs = 28;
    const lengthSegs = 48;
    const isStepped =
      component.geometryType === 'STEPPED_SHAFT' ||
      component.geometryType === 'CONVEYOR_SHAFT';

    if (params.sectionType === 'TUBULAR') {
      // Build hollow tube mesh (outer + inner walls + end caps) using Cylinder-like ring grid
      // Use outer cylinder with visible wall ring caps via LatheGeometry rotated along X
      const rInner = Math.max(
        rOuter * 0.25,
        Math.min(rOuter * 0.88, rOuter * (params.innerDiameterMm / Math.max(1, params.diameterMm))),
      );
      const pts: THREE.Vector2[] = [];
      const halfL = WORLD_SPAN / 2;
      // Outer surface from -halfL to +halfL
      for (let i = 0; i <= lengthSegs; i++) {
        const y = -halfL + (i / lengthSegs) * WORLD_SPAN;
        pts.push(new THREE.Vector2(rOuter, y));
      }
      // End cap + inner bore back
      pts.push(new THREE.Vector2(rInner, halfL));
      for (let i = lengthSegs; i >= 0; i--) {
        const y = -halfL + (i / lengthSegs) * WORLD_SPAN;
        pts.push(new THREE.Vector2(rInner, y));
      }
      pts.push(new THREE.Vector2(rOuter, -halfL));
      geometry = new THREE.LatheGeometry(pts, radialSegs);
      geometry.rotateZ(-Math.PI / 2);
    } else {
      geometry = new THREE.CylinderGeometry(
        rOuter,
        rOuter,
        WORLD_SPAN,
        radialSegs,
        lengthSegs,
        false,
      );
      geometry.rotateZ(-Math.PI / 2);

      // Apply stepped shaft profile if applicable
      if (isStepped) {
        const pos = geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const u = (x + WORLD_SPAN / 2) / WORLD_SPAN;
          let mult = 1.0;
          if (u < 0.16 || u > 0.84) mult = 0.78;
          else if (u > 0.34 && u < 0.66) mult = 1.18;
          pos.setY(i, pos.getY(i) * mult);
          pos.setZ(i, pos.getZ(i) * mult);
        }
        geometry.computeVertexNormals();
      }
    }
  } else if (params.sectionType === 'I_BEAM') {
    const h = clampDim(params.heightMm, 0.45, 1.35);
    const w = clampDim(params.widthMm, 0.32, 1.0);
    visualHeight = h;
    visualWidth = w;
    const tf = THREE.MathUtils.clamp(h * (params.flangeThicknessMm / Math.max(1, params.heightMm)), 0.06, h * 0.25);
    const tw = THREE.MathUtils.clamp(w * (params.webThicknessMm / Math.max(1, params.widthMm)), 0.05, w * 0.35);

    const shape = new THREE.Shape();
    const hw = w / 2;
    const hh = h / 2;
    const htw = tw / 2;
    shape.moveTo(-hw, -hh);
    shape.lineTo(hw, -hh);
    shape.lineTo(hw, -hh + tf);
    shape.lineTo(htw, -hh + tf);
    shape.lineTo(htw, hh - tf);
    shape.lineTo(hw, hh - tf);
    shape.lineTo(hw, hh);
    shape.lineTo(-hw, hh);
    shape.lineTo(-hw, hh - tf);
    shape.lineTo(-htw, hh - tf);
    shape.lineTo(-htw, -hh + tf);
    shape.lineTo(-hw, -hh + tf);
    shape.closePath();

    geometry = new THREE.ExtrudeGeometry(shape, {
      steps: 44,
      depth: WORLD_SPAN,
      bevelEnabled: false,
    });
    // Extrude creates along +Z; rotate so extrusion is along +X centered at 0
    geometry.translate(0, 0, -WORLD_SPAN / 2);
    geometry.rotateY(Math.PI / 2);
  } else {
    // RECTANGULAR / PLATE / KEY / ARM
    const isPlate = component.geometryType === 'PLATE';
    const isKey = component.geometryType === 'KEY_JOINT';
    const h = clampDim(params.heightMm, isPlate ? 0.14 : 0.26, 1.25);
    const w = clampDim(params.widthMm, isPlate ? 1.1 : 0.24, isPlate ? 1.85 : 1.15);
    visualHeight = h;
    visualWidth = w;

    geometry = new THREE.BoxGeometry(WORLD_SPAN, h, w, 48, 10, 8);
    if (isKey) {
      // Chamfer top edges slightly visually
      const pos = geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const z = pos.getZ(i);
        if (y > h * 0.42 && Math.abs(z) > w * 0.42) {
          pos.setY(i, y * 0.92);
          pos.setZ(i, z * 0.92);
        }
      }
      geometry.computeVertexNormals();
    }
  }

  // Ensure non-indexed or clean vertex colors attribute
  const count = geometry.attributes.position.count;
  const colors = new Float32Array(count * 3);
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const basePositions = new Float32Array(geometry.attributes.position.array);

  return { geometry, basePositions, visualHeight, visualWidth };
}

function buildArrowMesh(colorHex: number, length = 0.85): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.35,
    metalness: 0.2,
    emissive: colorHex,
    emissiveIntensity: 0.25,
  });

  const shaftLen = length * 0.7;
  const headLen = length * 0.3;
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.032, shaftLen, 14),
    mat,
  );
  shaft.position.y = headLen + shaftLen / 2;

  const head = new THREE.Mesh(
    new THREE.ConeGeometry(0.085, headLen, 16),
    mat,
  );
  head.position.y = headLen / 2;
  head.rotation.x = Math.PI; // Tip points to y = 0 along -Y

  group.add(shaft, head);
  return group;
}

function buildTorqueRing(colorHex: number, radius: number, ccw: boolean): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.3,
    metalness: 0.3,
    emissive: colorHex,
    emissiveIntensity: 0.25,
  });
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.03, 12, 32, Math.PI * 1.45),
    mat,
  );
  torus.rotation.y = Math.PI / 2;
  group.add(torus);

  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.2, 14), mat);
  const endAngle = Math.PI * 1.45;
  const cy = Math.sin(endAngle) * radius;
  const cz = Math.cos(endAngle) * radius;
  cone.position.set(0, cy, -cz);
  cone.rotation.x = ccw ? -endAngle : -endAngle + Math.PI;
  group.add(cone);

  return group;
}

function buildMechanicalContext(
  component: ComponentDefinition,
  visualHeight: number,
  visualWidth: number,
): THREE.Group {
  const context = new THREE.Group();
  const darkSteel = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.45,
    metalness: 0.78,
  });
  const machinedSteel = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.28,
    metalness: 0.88,
  });
  const brassAccent = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    roughness: 0.35,
    metalness: 0.82,
  });

  const gType = component.geometryType;

  if (gType === 'BOLT_JOINT' || gType === 'MOTOR_MOUNT') {
    // Hex bolt head on left, hex nut on right, lap/clevis plates
    const r = visualHeight * 0.52;
    const head = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 1.55, r * 1.55, 0.26, 6),
      darkSteel,
    );
    head.rotation.z = Math.PI / 2;
    head.position.x = -WORLD_SPAN / 2 - 0.12;
    context.add(head);

    const nut = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 1.5, r * 1.5, 0.24, 6),
      machinedSteel,
    );
    nut.rotation.z = Math.PI / 2;
    nut.position.x = WORLD_SPAN / 2 + 0.1;
    context.add(nut);

    // Translucent shear plates so user sees bolt inside!
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.5,
      metalness: 0.65,
      transparent: true,
      opacity: 0.36,
    });
    const upperPlate = new THREE.Mesh(
      new THREE.BoxGeometry(WORLD_SPAN * 0.35, visualHeight * 2.3, visualWidth * 2.3),
      plateMat,
    );
    upperPlate.position.set(0, visualHeight * 0.35, 0);
    const lowerPlate = new THREE.Mesh(
      new THREE.BoxGeometry(WORLD_SPAN * 0.28, visualHeight * 2.1, visualWidth * 2.1),
      plateMat,
    );
    lowerPlate.position.set(-WORLD_SPAN * 0.34, -visualHeight * 0.25, 0);
    context.add(upperPlate, lowerPlate);
  } else if (gType === 'KEY_JOINT') {
    // Translucent shaft + outer hub collar seated around the key
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.35,
      metalness: 0.75,
      transparent: true,
      opacity: 0.28,
    });
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(visualHeight * 1.6, visualHeight * 1.6, WORLD_SPAN * 1.15, 28),
      collarMat,
    );
    shaft.rotation.z = Math.PI / 2;
    shaft.position.y = -visualHeight * 1.5;
    context.add(shaft);
  } else if (gType === 'CONVEYOR_SHAFT' || gType === 'PULLEY_SUPPORT') {
    // Drum / Pulley wheel mounted at center
    const drumRadius = Math.max(0.55, visualHeight * 1.35);
    const drum = new THREE.Mesh(
      new THREE.CylinderGeometry(drumRadius, drumRadius, 0.9, 32),
      darkSteel,
    );
    drum.rotation.z = Math.PI / 2;
    drum.material = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.55,
      metalness: 0.65,
      transparent: true,
      opacity: 0.34,
    });
    const flangeL = new THREE.Mesh(
      new THREE.TorusGeometry(drumRadius, 0.04, 12, 32),
      machinedSteel,
    );
    flangeL.rotation.y = Math.PI / 2;
    flangeL.position.x = -0.45;
    const flangeR = flangeL.clone();
    flangeR.position.x = 0.45;
    context.add(drum, flangeL, flangeR);
  } else if (gType === 'BEARING_SUPPORT') {
    // Bronze bearing ring mounted at top center
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(visualHeight * 0.72, 0.08, 16, 32),
      brassAccent,
    );
    ring.position.set(0, visualHeight * 0.85, 0);
    context.add(ring);
  } else if (gType === 'TRANSMISSION_SHAFT' || gType === 'STEPPED_SHAFT') {
    // Coupling flange & bearing collars
    const collarL = new THREE.Mesh(
      new THREE.CylinderGeometry(visualHeight * 0.75, visualHeight * 0.75, 0.16, 24),
      machinedSteel,
    );
    collarL.rotation.z = Math.PI / 2;
    collarL.position.x = -WORLD_SPAN * 0.42;
    const collarR = collarL.clone();
    collarR.position.x = WORLD_SPAN * 0.42;
    context.add(collarL, collarR);
  } else if (gType === 'HOPPER_FRAME' || gType === 'MACHINE_FRAME') {
    // End flange plates with bolt heads
    const endPlateL = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, visualHeight * 1.35, visualWidth * 1.45),
      darkSteel,
    );
    endPlateL.position.x = -WORLD_SPAN / 2 - 0.04;
    const endPlateR = endPlateL.clone();
    endPlateR.position.x = WORLD_SPAN / 2 + 0.04;
    context.add(endPlateL, endPlateR);
  } else if (gType === 'CRUSHER_ARM' || gType === 'LEVER_ARM' || gType === 'BRACKET') {
    // Pivot boss cylinder at the fixed root + load eye at tip
    const boss = new THREE.Mesh(
      new THREE.CylinderGeometry(visualHeight * 0.65, visualHeight * 0.65, visualWidth * 1.35, 24),
      darkSteel,
    );
    boss.rotation.x = Math.PI / 2;
    boss.position.x = -WORLD_SPAN / 2;
    const tipPin = new THREE.Mesh(
      new THREE.CylinderGeometry(visualHeight * 0.28, visualHeight * 0.28, visualWidth * 1.25, 20),
      machinedSteel,
    );
    tipPin.rotation.x = Math.PI / 2;
    tipPin.position.x = WORLD_SPAN * 0.45;
    context.add(boss, tipPin);
  }

  return context;
}

function buildSupportFixtures(
  params: SimulationParams,
  visualHeight: number,
  visualWidth: number,
): THREE.Group {
  const group = new THREE.Group();
  const supportMat = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9,
    roughness: 0.4,
    metalness: 0.45,
  });
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.65,
    metalness: 0.5,
  });

  const halfL = WORLD_SPAN / 2;
  const yBottom = -visualHeight / 2;

  const makeWallClamp = (xPos: number) => {
    const clamp = new THREE.Group();
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, Math.max(0.9, visualHeight * 1.8), Math.max(0.7, visualWidth * 1.6)),
      wallMat,
    );
    plate.position.set(xPos, 0, 0);
    const rim = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, Math.max(0.92, visualHeight * 1.82), 0.08),
      supportMat,
    );
    rim.position.set(xPos, 0, Math.max(0.35, visualWidth * 0.8));
    clamp.add(plate, rim);
    return clamp;
  };

  const makePinSupport = (xPos: number, isRoller: boolean) => {
    const sup = new THREE.Group();
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.34, 4),
      supportMat,
    );
    cone.rotation.y = Math.PI / 4;
    cone.position.set(xPos, yBottom - 0.17, 0);
    sup.add(cone);

    if (isRoller) {
      const roller = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.36, 16),
        supportMat,
      );
      roller.rotation.x = Math.PI / 2;
      roller.position.set(xPos, yBottom - 0.42, 0);
      sup.add(roller);
    } else {
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.42), wallMat);
      base.position.set(xPos, yBottom - 0.37, 0);
      sup.add(base);
    }
    return sup;
  };

  if (params.moduleId === 'M2_SHEAR') {
    const planes = params.supportCondition === 'DOUBLE_SHEAR' ? 2 : params.shearPlanes;
    if (planes === 2) {
      group.add(makePinSupport(-halfL * 0.72, false));
      group.add(makePinSupport(halfL * 0.72, false));
    } else {
      group.add(makeWallClamp(-halfL - 0.07));
    }
  } else if (params.supportCondition === 'FIXED_FREE' || params.moduleId === 'M1_AXIAL' || params.moduleId === 'M4_TORSION') {
    group.add(makeWallClamp(-halfL - 0.07));
  } else if (params.supportCondition === 'FIXED_FIXED') {
    group.add(makeWallClamp(-halfL - 0.07));
    group.add(makeWallClamp(halfL + 0.07));
  } else {
    group.add(makePinSupport(-halfL + 0.08, false));
    group.add(makePinSupport(halfL - 0.08, true));
  }

  return group;
}

function buildLoadIndicators(
  params: SimulationParams,
  visualHeight: number,
  visualWidth: number,
): THREE.Group {
  const group = new THREE.Group();
  const loadColor = 0xf59e0b; // Calibrated amber telemetry load arrows
  const halfL = WORLD_SPAN / 2;
  const yTop = visualHeight / 2;

  if (params.moduleId === 'M1_AXIAL') {
    const isComp = params.loadMode === 'COMPRESSION';
    const arrow = buildArrowMesh(loadColor, 0.95);
    arrow.rotation.z = isComp ? Math.PI / 2 : -Math.PI / 2;
    arrow.position.set(isComp ? halfL + 0.05 : halfL + 1.0, 0, 0);
    group.add(arrow);
  } else if (params.moduleId === 'M4_TORSION') {
    const ring = buildTorqueRing(
      loadColor,
      Math.max(0.42, visualHeight * 0.78),
      params.loadMode !== 'TORQUE_CW',
    );
    ring.position.set(halfL - 0.15, 0, 0);
    group.add(ring);
  } else if (params.loadMode === 'DISTRIBUTED_LOAD' && (params.moduleId === 'M3_BENDING' || params.moduleId === 'M5_COMBINED' || params.moduleId === 'M6_SAFETY')) {
    const count = 7;
    for (let i = 0; i < count; i++) {
      const x = -halfL + 0.25 + (i / (count - 1)) * (WORLD_SPAN - 0.5);
      const arrow = buildArrowMesh(loadColor, 0.7);
      arrow.position.set(x, yTop + 0.04, 0);
      group.add(arrow);
    }
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(WORLD_SPAN - 0.46, 0.03, 0.03),
      new THREE.MeshBasicMaterial({ color: loadColor }),
    );
    bar.position.set(0, yTop + 0.74, 0);
    group.add(bar);
  } else {
    const xPos = -halfL + params.loadPositionRatio * WORLD_SPAN;
    const arrow = buildArrowMesh(loadColor, 0.95);
    arrow.position.set(xPos, yTop + 0.05, 0);
    arrow.rotation.z = THREE.MathUtils.degToRad(-params.loadAngleDeg);
    group.add(arrow);

    if ((params.moduleId === 'M5_COMBINED' || params.moduleId === 'M6_SAFETY') && params.includeTorsionInCombined && params.torqueNm > 0) {
      const ring = buildTorqueRing(0xf97316, Math.max(0.42, visualHeight * 0.78), true);
      ring.position.set(halfL - 0.18, 0, 0);
      group.add(ring);
    }
  }

  // Highlight shear planes if M2_SHEAR
  if (params.moduleId === 'M2_SHEAR') {
    const planes = params.supportCondition === 'DOUBLE_SHEAR' ? 2 : params.shearPlanes;
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const pGeom = new THREE.PlaneGeometry(visualWidth * 1.9, visualHeight * 1.9);
    const xs = planes === 2 ? [-WORLD_SPAN * 0.22, WORLD_SPAN * 0.22] : [0];
    xs.forEach((px) => {
      const pMesh = new THREE.Mesh(pGeom, planeMat);
      pMesh.rotation.y = Math.PI / 2;
      pMesh.position.x = px;
      group.add(pMesh);
    });
  }

  return group;
}

export const Viewport3D = forwardRef<Viewport3DHandle, Viewport3DProps>(
  ({ params, component, material, result, options, unitSystem, onDropComponent }, ref) => {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const [probe, setProbe] = useState<ProbeReading | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [contextLost, setContextLost] = useState(false);

    // Refs to mutable Three.js objects so React UI updates never tear down WebGL
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const isSoftwareGlRef = useRef<boolean>(false);
    const requestRenderRef = useRef<() => void>(() => {});
    const cameraTransitionRef = useRef<boolean>(false);

    // Model group & deformable mesh refs
    const rootGroupRef = useRef<THREE.Group | null>(null);
    const mainMeshRef = useRef<THREE.Mesh | null>(null);
    const wireMeshRef = useRef<THREE.LineSegments | null>(null);
    const ghostMeshRef = useRef<THREE.Mesh | null>(null);
    const basePositionsRef = useRef<Float32Array | null>(null);
    const visualDimsRef = useRef<{ h: number; w: number }>({ h: 0.5, w: 0.45 });

    // Mutable latest props for animation loop without re-binding listeners
    const latestRef = useRef({ params, result, options, material });
    latestRef.current = { params, result, options, material };

    const applyCameraPreset = (preset: CameraPreset) => {
      if (preset === 'FRONT') _camTargetPos.set(0, 0.5, 6.2);
      else if (preset === 'SIDE') _camTargetPos.set(6.2, 0.6, 0.2);
      else if (preset === 'TOP') _camTargetPos.set(0, 6.5, 0.05);
      else _camTargetPos.set(4.1, 2.7, 4.6);
      cameraTransitionRef.current = true;
      requestRenderRef.current();
    };

    useImperativeHandle(ref, () => ({
      captureSnapshot: () => {
        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        if (!renderer || !scene || !camera) return null;
        renderer.render(scene, camera);
        return renderer.domElement.toDataURL('image/png');
      },
      resetCamera: () => {
        applyCameraPreset('ISO');
      },
    }));

    // 1. Initialize WebGLRenderer & Scene ONCE
    useEffect(() => {
      const container = mountRef.current;
      if (!container) return;

      const isSoftwareGl = detectSoftwareWebGL();
      isSoftwareGlRef.current = isSoftwareGl;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x161c26);
      scene.fog = new THREE.FogExp2(0x161c26, 0.035);
      sceneRef.current = scene;

      const width = container.clientWidth || 800;
      const height = container.clientHeight || 520;
      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      camera.position.set(4.1, 2.7, 4.6);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = !isSoftwareGl;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // Studio environment reflections for metallic fixtures
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();

      // 3-Point Warm/Cool Studio Lighting
      const hemi = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.75);
      scene.add(hemi);

      const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.45);
      keyLight.position.set(5, 8, 6);
      keyLight.castShadow = !isSoftwareGl;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.left = -5;
      keyLight.shadow.camera.right = 5;
      keyLight.shadow.camera.top = 5;
      keyLight.shadow.camera.bottom = -5;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.65);
      rimLight.position.set(-6, 3, -5);
      scene.add(rimLight);

      // Engineering Grid & Coordinate Triad
      const grid = new THREE.GridHelper(14, 28, 0x334155, 0x243042);
      grid.position.y = -1.65;
      scene.add(grid);

      const axes = new THREE.AxesHelper(0.95);
      axes.position.set(-3.1, -1.63, 2.2);
      scene.add(axes);

      // Soft contact shadow plane
      const shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(14, 14),
        new THREE.ShadowMaterial({ opacity: 0.25 }),
      );
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -1.64;
      shadowPlane.receiveShadow = true;
      scene.add(shadowPlane);

      const rootGroup = new THREE.Group();
      scene.add(rootGroup);
      rootGroupRef.current = rootGroup;

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = !isSoftwareGl;
      controls.dampingFactor = 0.07;
      controls.minDistance = 2.0;
      controls.maxDistance = 16.0;
      controls.target.set(0, 0, 0);
      controlsRef.current = controls;

      controls.addEventListener('start', () => {
        cameraTransitionRef.current = false;
      });
      controls.addEventListener('change', () => {
        requestRenderRef.current();
      });

      const onContextLost = (e: Event) => {
        e.preventDefault();
        setContextLost(true);
      };
      const onContextRestored = () => {
        setContextLost(false);
        requestRenderRef.current();
      };
      renderer.domElement.addEventListener('webglcontextlost', onContextLost);
      renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

      // Raycaster probe on click / hover
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let lastMove = 0;

      const handlePointerMove = (ev: PointerEvent) => {
        const now = performance.now();
        if (now - lastMove < 55) return;
        lastMove = now;
        const mesh = mainMeshRef.current;
        if (!mesh) return;
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObject(mesh, false);
        if (hits.length > 0) {
          const pt = hits[0].point;
          const u = THREE.MathUtils.clamp((pt.x + WORLD_SPAN / 2) / WORLD_SPAN, 0, 1);
          const { params: p, result: r } = latestRef.current;
          const xMm = u * p.lengthMm;
          const prof = r.beamProfile;
          let localStress = r.equivalentStressMPa;
          let localDisp = r.maxDisplacementMm * u;
          if (prof.length > 1) {
            const idx = Math.min(prof.length - 1, Math.round(u * (prof.length - 1)));
            const dp = prof[idx];
            localStress =
              latestRef.current.options.stressField === 'NORMAL'
                ? dp.normalStressMPa
                : latestRef.current.options.stressField === 'SHEAR'
                  ? r.shearStressMPa
                  : dp.vonMisesMPa;
            localDisp = Math.abs(dp.deflectionMm);
          }
          setProbe({ xMm, stressMPa: localStress, displacementMm: localDisp });
        } else {
          setProbe(null);
        }
      };
      renderer.domElement.addEventListener('pointermove', handlePointerMove);

      // Render-on-demand & Software-GL paced animation loop
      let frameId = 0;
      let renderBusy = false;
      let renderDirty = false;
      let animStart = performance.now();
      let lastFrameTime = animStart;

      function afterDraw(cb: () => void) {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        if (gl && typeof gl.fenceSync === 'function') {
          const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
          gl.flush();
          const poll = () => {
            const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
            if (state === gl.UNSIGNALED) {
              frameId = window.setTimeout(poll, 5);
            } else {
              if (sync) gl.deleteSync(sync);
              frameId = window.setTimeout(cb, 80);
            }
          };
          frameId = window.setTimeout(poll, 5);
        } else {
          frameId = window.setTimeout(cb, 80);
        }
      }

      const applyDeformationAndColors = (phaseFactor: number) => {
        const mesh = mainMeshRef.current;
        const base = basePositionsRef.current;
        if (!mesh || !base) return;
        const { params: p, result: r, options: opts, material: matSpec } = latestRef.current;
        const geom = mesh.geometry as THREE.BufferGeometry;
        const posAttr = geom.attributes.position as THREE.BufferAttribute;
        const colAttr = geom.attributes.color as THREE.BufferAttribute;
        const count = posAttr.count;
        const { h: vh } = visualDimsRef.current;

        const showDef = opts.showDeformed;
        // Scale physical mm displacement into visible world units smoothly
        const normAmp = showDef ? (opts.amplificationFactor / 50) * phaseFactor : 0;
        const L = Math.max(10, p.lengthMm);
        const maxStressRef = Math.max(
          0.01,
          opts.stressField === 'NORMAL'
            ? Math.abs(r.normalStressMPa)
            : opts.stressField === 'SHEAR'
              ? r.shearStressMPa
              : opts.stressField === 'DISPLACEMENT'
                ? Math.max(1e-4, r.maxDisplacementMm)
                : r.vonMisesMPa,
        );

        const planes = p.supportCondition === 'DOUBLE_SHEAR' ? 2 : p.shearPlanes;

        for (let i = 0; i < count; i++) {
          const bx = base[i * 3];
          const by = base[i * 3 + 1];
          const bz = base[i * 3 + 2];
          const u = THREE.MathUtils.clamp((bx + WORLD_SPAN / 2) / WORLD_SPAN, 0, 1);

          let nx = bx;
          let ny = by;
          let nz = bz;
          let scalarRatio = 0.2;

          if (p.moduleId === 'M1_AXIAL') {
            const sign = p.loadMode === 'COMPRESSION' ? -1 : 1;
            const visualStretch = THREE.MathUtils.clamp((r.maxDisplacementMm / L) * 3.5 * normAmp, 0, 0.28);
            nx = bx + sign * u * visualStretch * WORLD_SPAN * 0.5;
            const poissonScale = 1 - sign * matSpec.poissonRatio * visualStretch * 0.65;
            ny = by * poissonScale;
            nz = bz * poissonScale;
            scalarRatio = opts.stressField === 'DISPLACEMENT' ? u : 0.85;
          } else if (p.moduleId === 'M2_SHEAR') {
            const slipAmt = THREE.MathUtils.clamp(0.08 * normAmp, 0, 0.22);
            if (planes === 2) {
              const inCenter = Math.abs(bx) < WORLD_SPAN * 0.22;
              ny = inCenter ? by - slipAmt : by;
              const distToPlane = Math.min(
                Math.abs(bx + WORLD_SPAN * 0.22),
                Math.abs(bx - WORLD_SPAN * 0.22),
              );
              scalarRatio = Math.exp(-Math.pow(distToPlane / 0.28, 2));
            } else {
              ny = bx > 0 ? by - slipAmt : by;
              scalarRatio = Math.exp(-Math.pow(bx / 0.3, 2));
            }
          } else if (p.moduleId === 'M4_TORSION') {
            const twistRad = THREE.MathUtils.clamp(
              THREE.MathUtils.degToRad(r.twistAngleDeg) * 0.12 * normAmp,
              0,
              Math.PI * 0.65,
            );
            const theta = (p.loadMode === 'TORQUE_CW' ? -1 : 1) * u * twistRad;
            const c = Math.cos(theta);
            const s = Math.sin(theta);
            ny = by * c - bz * s;
            nz = by * s + bz * c;
            const radial = Math.sqrt(by * by + bz * bz) / Math.max(0.01, vh * 0.5);
            scalarRatio = opts.stressField === 'DISPLACEMENT' ? u : THREE.MathUtils.clamp(radial, 0, 1);
          } else {
            // M3_BENDING, M5_COMBINED, M6_SAFETY
            const prof = r.beamProfile;
            let deflWorld = 0;
            let slope = 0;
            let localMomentRatio = 0;
            let localVM = r.vonMisesMPa;

            if (prof.length > 2) {
              const fIdx = u * (prof.length - 1);
              const i0 = Math.min(prof.length - 2, Math.floor(fIdx));
              const frac = fIdx - i0;
              const p0 = prof[i0];
              const p1 = prof[i0 + 1];
              const deflMm = THREE.MathUtils.lerp(p0.deflectionMm, p1.deflectionMm, frac);
              const maxDefMm = Math.max(1e-4, r.maxDisplacementMm);
              // Normalized deflection scaled visually by amplification factor
              const visualScale = THREE.MathUtils.clamp(
                (maxDefMm / L) * 14 * normAmp,
                0,
                0.75,
              );
              deflWorld = (deflMm / maxDefMm) * visualScale;
              const dyMm = p1.deflectionMm - p0.deflectionMm;
              const dxMm = Math.max(1e-3, p1.xMm - p0.xMm);
              slope = (dyMm / dxMm) * (visualScale / (maxDefMm / WORLD_SPAN));
              localVM = THREE.MathUtils.lerp(p0.vonMisesMPa, p1.vonMisesMPa, frac);
              localMomentRatio = localVM / maxStressRef;
            }

            // Combine optional axial + torsion if M5/M6
            let yCur = by;
            let zCur = bz;
            if ((p.moduleId === 'M5_COMBINED' || p.moduleId === 'M6_SAFETY') && p.includeTorsionInCombined && r.twistAngleDeg > 0) {
              const tw = THREE.MathUtils.clamp(
                THREE.MathUtils.degToRad(r.twistAngleDeg) * 0.1 * normAmp,
                0,
                0.45,
              ) * u;
              const c = Math.cos(tw);
              const s = Math.sin(tw);
              yCur = by * c - bz * s;
              zCur = by * s + bz * c;
            }

            // Euler-Bernoulli kinematic rotation of cross section
            nx = bx - yCur * THREE.MathUtils.clamp(slope, -0.35, 0.35);
            ny = yCur + deflWorld;
            nz = zCur;

            const yNorm = Math.abs(by) / Math.max(0.01, vh * 0.5);
            if (opts.stressField === 'DISPLACEMENT') {
              scalarRatio = Math.abs(deflWorld) / Math.max(1e-4, THREE.MathUtils.clamp((r.maxDisplacementMm / L) * 14 * normAmp, 0.01, 0.75));
            } else if (opts.stressField === 'NORMAL') {
              scalarRatio = localMomentRatio * yNorm;
            } else if (opts.stressField === 'SHEAR') {
              // Parabolic shear distribution max at neutral axis
              scalarRatio = (1 - 0.65 * yNorm * yNorm) * 0.78;
            } else {
              // Von Mises combines bending (outer fibers) + shear/torsion
              const bendTerm = localMomentRatio * (0.25 + 0.75 * yNorm);
              scalarRatio = THREE.MathUtils.clamp(bendTerm, 0, 1);
            }
          }

          posAttr.setXYZ(i, nx, ny, nz);
          const col = sampleStressColor(scalarRatio);
          colAttr.setXYZ(i, col.r, col.g, col.b);
        }

        posAttr.needsUpdate = true;
        colAttr.needsUpdate = true;
        geom.computeVertexNormals();
      };

      const renderFrame = (now: number) => {
        const dt = Math.min(0.1, (now - lastFrameTime) / 1000);
        lastFrameTime = now;

        if (cameraTransitionRef.current) {
          camera.position.x = THREE.MathUtils.damp(camera.position.x, _camTargetPos.x, 8, dt);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, _camTargetPos.y, 8, dt);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, _camTargetPos.z, 8, dt);
          controls.target.lerp(_camLookTarget, 1 - Math.exp(-8 * dt));
          if (camera.position.distanceTo(_camTargetPos) < 0.02) {
            camera.position.copy(_camTargetPos);
            cameraTransitionRef.current = false;
          }
        }

        const opts = latestRef.current.options;
        const phase = opts.animateDeformation
          ? 0.5 + 0.5 * Math.sin(((now - animStart) / 1000) * 2.4)
          : 1.0;

        applyDeformationAndColors(phase);
        controls.update();
        renderer.render(scene, camera);

        const stillTransitioning = cameraTransitionRef.current || opts.animateDeformation;
        const done = () => {
          renderBusy = false;
          if (stillTransitioning || renderDirty) {
            renderDirty = false;
            requestRender();
          }
        };

        if (isSoftwareGl) afterDraw(done);
        else done();
      };

      const requestRender = () => {
        if (renderBusy) {
          renderDirty = true;
          return;
        }
        renderBusy = true;
        frameId = requestAnimationFrame(renderFrame);
      };
      requestRenderRef.current = requestRender;

      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth || 800;
        const h = container.clientHeight || 520;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        requestRender();
      };
      const resizeObs = new ResizeObserver(handleResize);
      resizeObs.observe(container);

      requestRender();

      return () => {
        cancelAnimationFrame(frameId);
        clearTimeout(frameId);
        resizeObs.disconnect();
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
        renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
        renderer.domElement.removeEventListener('pointermove', handlePointerMove);
        controls.dispose();
        renderer.dispose();
      };
    }, []);

    // 2. Rebuild procedural 3D model when component/section/support/load geometry changes
    useEffect(() => {
      const root = rootGroupRef.current;
      if (!root) return;

      // Dispose previous geometries & materials cleanly
      while (root.children.length > 0) {
        const child = root.children[0];
        root.remove(child);
        child.traverse((obj) => {
          if ((obj as THREE.Mesh).geometry) {
            (obj as THREE.Mesh).geometry.dispose();
          }
          const mat = (obj as THREE.Mesh).material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else if (mat) mat.dispose();
        });
      }

      const { geometry, basePositions, visualHeight, visualWidth } = buildDeformableGeometry(
        params,
        component,
      );
      basePositionsRef.current = basePositions;
      visualDimsRef.current = { h: visualHeight, w: visualWidth };

      const mainMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.42,
        metalness: 0.22,
        side: THREE.DoubleSide,
      });
      const mainMesh = new THREE.Mesh(geometry, mainMat);
      mainMesh.castShadow = true;
      mainMesh.receiveShadow = true;
      mainMeshRef.current = mainMesh;
      root.add(mainMesh);

      // Mesh / FEM Wireframe overlay
      const wireGeo = new THREE.WireframeGeometry(geometry);
      const wireMat = new THREE.LineBasicMaterial({
        color: options.darkViewport ? 0x0f172a : 0x1e293b,
        transparent: true,
        opacity: 0.28,
      });
      const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
      wireMesh.visible = options.showMesh;
      wireMeshRef.current = wireMesh;
      mainMesh.add(wireMesh); // Attached as child so wireframe deforms with mesh? Actually WireframeGeometry is static snapshot, let's use material wireframe toggle or overlay mesh!
      // Better: overlay a cloned Mesh sharing the exact deformable geometry with wireframe: true!
      wireMesh.visible = false;
      const deformWireMat = new THREE.MeshBasicMaterial({
        color: options.darkViewport ? 0x0f172a : 0x1e293b,
        wireframe: true,
        transparent: true,
        opacity: 0.22,
      });
      const deformWireMesh = new THREE.Mesh(geometry, deformWireMat);
      deformWireMesh.visible = options.showMesh;
      deformWireMesh.name = 'femWireOverlay';
      root.add(deformWireMesh);

      // Undeformed original ghost wireframe
      const ghostGeo = geometry.clone();
      const ghostMat = new THREE.MeshBasicMaterial({
        color: 0x94a3b8,
        wireframe: true,
        transparent: true,
        opacity: 0.16,
      });
      const ghostMesh = new THREE.Mesh(ghostGeo, ghostMat);
      ghostMesh.visible = options.showOriginalGhost;
      ghostMeshRef.current = ghostMesh;
      root.add(ghostMesh);

      // Composite mechanical auxiliary parts
      const mechContext = buildMechanicalContext(component, visualHeight, visualWidth);
      root.add(mechContext);

      // Supports
      if (options.showSupports) {
        const supports = buildSupportFixtures(params, visualHeight, visualWidth);
        root.add(supports);
      }

      // Loads
      if (options.showLoads) {
        const loads = buildLoadIndicators(params, visualHeight, visualWidth);
        root.add(loads);
      }

      requestRenderRef.current();
    }, [
      params,
      component,
      options.showSupports,
      options.showLoads,
      options.showMesh,
      options.showOriginalGhost,
      options.darkViewport,
    ]);

    // 3. Trigger re-render when visual options, results, or backdrop change
    useEffect(() => {
      const scene = sceneRef.current;
      if (scene) {
        const bg = options.darkViewport ? 0x161c26 : 0xe8eef5;
        scene.background = new THREE.Color(bg);
        scene.fog = new THREE.FogExp2(bg, 0.03);
      }
      requestRenderRef.current();
    }, [options, result, material]);

    // 4. Camera preset transitions
    useEffect(() => {
      applyCameraPreset(options.cameraPreset);
    }, [options.cameraPreset]);

    const ul = unitLabels(unitSystem);
    const minVal = 0;
    const maxVal =
      options.stressField === 'NORMAL'
        ? Math.abs(result.normalStressMPa)
        : options.stressField === 'SHEAR'
          ? result.shearStressMPa
          : options.stressField === 'DISPLACEMENT'
            ? result.maxDisplacementMm
            : result.vonMisesMPa;
    const isDisp = options.stressField === 'DISPLACEMENT';
    const dispUnit = isDisp ? ul.length : ul.stress;
    const dispMax = isDisp
      ? toDisplayLength(maxVal, unitSystem)
      : toDisplayStress(maxVal, unitSystem);

    const fieldLabel =
      options.stressField === 'NORMAL'
        ? 'Esfuerzo Normal σ'
        : options.stressField === 'SHEAR'
          ? 'Esfuerzo Cortante τ'
          : options.stressField === 'DISPLACEMENT'
            ? 'Desplazamiento δ'
            : 'Esfuerzo Von Mises σ_vm';

    return (
      <div
        className="relative w-full h-full overflow-hidden select-none"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const compId = e.dataTransfer.getData('text/component-id');
          if (compId && onDropComponent) onDropComponent(compId);
        }}
      >
        {/* Dedicated empty WebGL mount container */}
        <div
          ref={mountRef}
          className="w-full h-full cursor-crosshair"
          aria-label="Visualizador 3D de esfuerzos mecánicos"
        />

        {contextLost && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 text-slate-100 text-sm">
            Contexto WebGL suspendido. Restableciendo escena 3D...
          </div>
        )}

        {isDragOver && (
          <div className="absolute inset-3 border-2 border-dashed border-blue-400 bg-blue-500/10 pointer-events-none flex items-center justify-center rounded">
            <span className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded">
              Suelta para cargar componente en el simulador 3D
            </span>
          </div>
        )}

        {/* Top-left Viewport Header Info (solid translucent slate, no backdrop-filter over WebGL) */}
        <div
          className={`absolute top-3 left-3 px-3 py-2 rounded border text-xs pointer-events-none ${
            options.darkViewport
              ? 'bg-slate-900/90 border-slate-700 text-slate-100'
              : 'bg-white/95 border-slate-200 text-slate-900'
          }`}
        >
          <div className="font-semibold tracking-tight">{component.name}</div>
          <div className={options.darkViewport ? 'text-slate-400' : 'text-slate-500'}>
            {material.name} · {fieldLabel}
          </div>
        </div>

        {/* Right Color Scale Legend (Blue -> Green -> Yellow -> Orange -> Red) */}
        <div
          className={`absolute top-3 right-3 p-2.5 rounded border text-[11px] font-mono tabular-nums pointer-events-none ${
            options.darkViewport
              ? 'bg-slate-900/90 border-slate-700 text-slate-100'
              : 'bg-white/95 border-slate-200 text-slate-900'
          }`}
        >
          <div className="font-sans font-semibold text-[11px] mb-2">
            Escala ({dispUnit})
          </div>
          <div className="flex items-stretch gap-2">
            <div
              className="w-3.5 h-36 rounded-sm border border-slate-500/40"
              style={{ background: COLORMAP_CSS_GRADIENT }}
            />
            <div className="flex flex-col justify-between text-right leading-none">
              <span className="text-red-400 font-semibold">{formatEng(dispMax, isDisp ? 3 : 1)}</span>
              <span>{formatEng(dispMax * 0.75, isDisp ? 3 : 1)}</span>
              <span>{formatEng(dispMax * 0.5, isDisp ? 3 : 1)}</span>
              <span>{formatEng(dispMax * 0.25, isDisp ? 3 : 1)}</span>
              <span className="text-blue-400">{formatEng(minVal, isDisp ? 3 : 1)}</span>
            </div>
          </div>
          <div className={`mt-2 pt-1.5 border-t text-[10px] font-sans ${options.darkViewport ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
            Amplif.: {options.amplificationFactor}×
          </div>
        </div>

        {/* Bottom-left Coordinate Legend & Surface Probe Readout */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {probe && (
            <div
              className={`px-2.5 py-1.5 rounded border text-[11px] font-mono tabular-nums ${
                options.darkViewport
                  ? 'bg-slate-900/95 border-slate-700 text-slate-100'
                  : 'bg-white/95 border-slate-200 text-slate-900'
              }`}
            >
              Sonda x = {formatEng(toDisplayLength(probe.xMm, unitSystem), 1)} {ul.length} ·{' '}
              {formatEng(toDisplayStress(probe.stressMPa, unitSystem), 2)} {ul.stress} · δ ={' '}
              {formatEng(toDisplayLength(probe.displacementMm, unitSystem), 4)} {ul.length}
            </div>
          )}
          <div
            className={`px-2.5 py-1 rounded border text-[10px] font-mono flex items-center gap-3 ${
              options.darkViewport
                ? 'bg-slate-900/85 border-slate-700 text-slate-300'
                : 'bg-white/90 border-slate-200 text-slate-600'
            }`}
          >
            <span className="text-red-400 font-semibold">X: Longitud</span>
            <span className="text-emerald-400 font-semibold">Y: Vertical</span>
            <span className="text-blue-400 font-semibold">Z: Transversal</span>
            <span className="hidden sm:inline opacity-75">· Arrastra para rotar · Rueda para zoom</span>
          </div>
        </div>
      </div>
    );
  },
);

Viewport3D.displayName = 'Viewport3D';
