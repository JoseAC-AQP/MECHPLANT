import {
  FemNodeResult,
  FemSolution,
  MaterialSpec,
  SectionProperties,
  SimulationParams,
} from '../types/engineering';

/**
 * Solves linear system A * x = b using Gaussian elimination with partial pivoting.
 */
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let k = 0; k < n; k++) {
    let maxRow = k;
    let maxVal = Math.abs(M[k][k]);
    for (let i = k + 1; i < n; i++) {
      const val = Math.abs(M[i][k]);
      if (val > maxVal) {
        maxVal = val;
        maxRow = i;
      }
    }
    if (maxRow !== k) {
      const tmp = M[k];
      M[k] = M[maxRow];
      M[maxRow] = tmp;
    }

    const pivot = M[k][k];
    if (Math.abs(pivot) < 1e-14) continue;

    for (let i = k + 1; i < n; i++) {
      const factor = M[i][k] / pivot;
      if (factor === 0) continue;
      for (let j = k; j <= n; j++) {
        M[i][j] -= factor * M[k][j];
      }
    }
  }

  const x = new Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = M[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= M[i][j] * x[j];
    }
    x[i] = Math.abs(M[i][i]) > 1e-14 ? sum / M[i][i] : 0;
  }
  return x;
}

function applyDirichletBC(K: number[][], F: number[], dofIndex: number, prescribedValue = 0) {
  const n = F.length;
  for (let i = 0; i < n; i++) {
    if (i !== dofIndex) {
      F[i] -= K[i][dofIndex] * prescribedValue;
      K[i][dofIndex] = 0;
      K[dofIndex][i] = 0;
    }
  }
  K[dofIndex][dofIndex] = 1;
  F[dofIndex] = prescribedValue;
}

/**
 * Simplified 1D Structural Finite Element Solver:
 * - M1_AXIAL: 12 2-node 1D bar elements (EA/Le)
 * - M3_BENDING: 16 2-node Euler-Bernoulli beam elements (2 DOF/node: v, theta)
 * - M4_TORSION: 12 2-node torsional shaft elements (GJ/Le)
 */
export function runSimplifiedFem(
  params: SimulationParams,
  material: MaterialSpec,
  section: SectionProperties,
  analyticalMaxDispMm: number,
  analyticalMaxStressMPa: number,
): FemSolution {
  const L = Math.max(10, params.lengthMm);
  const E = Math.max(100, material.elasticModulusMPa);
  const G = Math.max(50, material.shearModulusMPa);
  const A = Math.max(1, section.areaMm2);
  const I = Math.max(1, section.inertiaZMm4);
  const J = Math.max(1, section.polarInertiaJmm4);
  const yMax = Math.max(1, section.yMaxMm);

  if (params.moduleId === 'M1_AXIAL') {
    const numElements = 12;
    const numNodes = numElements + 1;
    const Le = L / numElements;
    const ke = (E * A) / Le;
    const K = Array.from({ length: numNodes }, () => new Array<number>(numNodes).fill(0));
    const F = new Array<number>(numNodes).fill(0);

    for (let e = 0; e < numElements; e++) {
      K[e][e] += ke;
      K[e][e + 1] -= ke;
      K[e + 1][e] -= ke;
      K[e + 1][e + 1] += ke;
    }

    const sign = params.loadMode === 'COMPRESSION' ? -1 : 1;
    F[numNodes - 1] = sign * params.forceN;
    applyDirichletBC(K, F, 0, 0);

    const u = solveLinearSystem(K, F);
    const nodes: FemNodeResult[] = [];
    for (let i = 0; i < numNodes; i++) {
      const strain = i === 0 ? (u[1] - u[0]) / Le : (u[i] - u[i - 1]) / Le;
      const sigma = E * strain;
      nodes.push({
        nodeIndex: i,
        xMm: i * Le,
        displacementMm: u[i],
        rotationRad: 0,
        axialOrShearStressMPa: sigma,
        bendingStressMPa: 0,
        vonMisesMPa: Math.abs(sigma),
      });
    }

    const maxDisp = Math.max(...nodes.map((n) => Math.abs(n.displacementMm)));
    const maxStress = Math.max(...nodes.map((n) => n.vonMisesMPa));
    const diffPct =
      analyticalMaxDispMm > 1e-9
        ? (Math.abs(maxDisp - Math.abs(analyticalMaxDispMm)) / Math.abs(analyticalMaxDispMm)) * 100
        : 0;

    return {
      available: true,
      methodLabel: 'FEM 1D Barra Axial (Matriz de Rigidez Ensamblada)',
      elementType: 'Elemento barra uniaxial de 2 nodos (1 GDL/nodo)',
      numElements,
      numNodes,
      totalDofs: numNodes,
      nodes,
      maxDisplacementMm: maxDisp,
      maxStressMPa: maxStress,
      analyticalDiffPercent: diffPct,
      stiffnessMatrixNote: `Sistema lineal [${numNodes}×${numNodes}] resuelto por eliminación gaussiana con pivoteo parcial.`,
    };
  }

  if (params.moduleId === 'M3_BENDING' || params.moduleId === 'M5_COMBINED' || params.moduleId === 'M6_SAFETY') {
    const numElements = 16;
    const numNodes = numElements + 1;
    const totalDofs = numNodes * 2;
    const Le = L / numElements;
    const K = Array.from({ length: totalDofs }, () => new Array<number>(totalDofs).fill(0));
    const F = new Array<number>(totalDofs).fill(0);

    const factor = (E * I) / (Le * Le * Le);
    const kLocal = [
      [12 * factor, 6 * Le * factor, -12 * factor, 6 * Le * factor],
      [6 * Le * factor, 4 * Le * Le * factor, -6 * Le * factor, 2 * Le * Le * factor],
      [-12 * factor, -6 * Le * factor, 12 * factor, -6 * Le * factor],
      [6 * Le * factor, 2 * Le * Le * factor, -6 * Le * factor, 4 * Le * Le * factor],
    ];

    const isDistributed = params.loadMode === 'DISTRIBUTED_LOAD';
    const w = isDistributed ? params.distributedLoadNPerMm : 0;

    for (let e = 0; e < numElements; e++) {
      const dofs = [2 * e, 2 * e + 1, 2 * (e + 1), 2 * (e + 1) + 1];
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          K[dofs[i]][dofs[j]] += kLocal[i][j];
        }
      }
      if (isDistributed) {
        // Consistent nodal load vector for downward UDL (negative Y)
        F[dofs[0]] -= (w * Le) / 2;
        F[dofs[1]] -= (w * Le * Le) / 12;
        F[dofs[2]] -= (w * Le) / 2;
        F[dofs[3]] += (w * Le * Le) / 12;
      }
    }

    if (!isDistributed) {
      const a = Math.max(0.02 * L, Math.min(0.98 * L, params.loadPositionRatio * L));
      const elIdx = Math.min(numElements - 1, Math.floor(a / Le));
      const xi = (a - elIdx * Le) / Le; // 0..1 local coordinate
      // Cubic Hermite shape functions for exact consistent nodal force & moment
      const N1 = 1 - 3 * xi * xi + 2 * xi * xi * xi;
      const N2 = Le * (xi - 2 * xi * xi + xi * xi * xi);
      const N3 = 3 * xi * xi - 2 * xi * xi * xi;
      const N4 = Le * (-xi * xi + xi * xi * xi);
      const P = -params.forceN * Math.cos((params.loadAngleDeg * Math.PI) / 180);
      F[2 * elIdx] += P * N1;
      F[2 * elIdx + 1] += P * N2;
      F[2 * (elIdx + 1)] += P * N3;
      F[2 * (elIdx + 1) + 1] += P * N4;
    }

    // Apply boundary conditions
    if (params.supportCondition === 'FIXED_FREE') {
      applyDirichletBC(K, F, 0, 0);
      applyDirichletBC(K, F, 1, 0);
    } else if (params.supportCondition === 'FIXED_FIXED') {
      applyDirichletBC(K, F, 0, 0);
      applyDirichletBC(K, F, 1, 0);
      applyDirichletBC(K, F, totalDofs - 2, 0);
      applyDirichletBC(K, F, totalDofs - 1, 0);
    } else {
      // PINNED_ROLLER default
      applyDirichletBC(K, F, 0, 0);
      applyDirichletBC(K, F, totalDofs - 2, 0);
    }

    const u = solveLinearSystem(K, F);
    const nodes: FemNodeResult[] = [];

    for (let i = 0; i < numNodes; i++) {
      const v = u[2 * i];
      const theta = u[2 * i + 1];

      // Recover bending moment M(x) from adjacent element curvature d^2v/dx^2
      let momentNmm = 0;
      if (i < numElements) {
        const v1 = u[2 * i];
        const t1 = u[2 * i + 1];
        const v2 = u[2 * (i + 1)];
        const t2 = u[2 * (i + 1) + 1];
        // At xi = 0: d2N/dx2
        const d2 = (-6 * v1 - 4 * Le * t1 + 6 * v2 - 2 * Le * t2) / (Le * Le);
        momentNmm = E * I * d2;
      } else {
        const e = numElements - 1;
        const v1 = u[2 * e];
        const t1 = u[2 * e + 1];
        const v2 = u[2 * (e + 1)];
        const t2 = u[2 * (e + 1) + 1];
        // At xi = 1
        const d2 = (6 * v1 + 2 * Le * t1 - 6 * v2 + 4 * Le * t2) / (Le * Le);
        momentNmm = E * I * d2;
      }

      const bendingSigma = Math.abs((momentNmm * yMax) / I);
      nodes.push({
        nodeIndex: i,
        xMm: i * Le,
        displacementMm: Math.abs(v),
        rotationRad: theta,
        axialOrShearStressMPa: 0,
        bendingStressMPa: bendingSigma,
        vonMisesMPa: bendingSigma,
      });
    }

    const maxDisp = Math.max(...nodes.map((n) => n.displacementMm));
    const maxStress = Math.max(...nodes.map((n) => n.bendingStressMPa));
    const diffPct =
      analyticalMaxDispMm > 1e-9
        ? (Math.abs(maxDisp - Math.abs(analyticalMaxDispMm)) / Math.abs(analyticalMaxDispMm)) * 100
        : 0;

    return {
      available: true,
      methodLabel: 'FEM 1D Viga Euler-Bernoulli (Ensamblaje Matricial)',
      elementType: 'Elemento viga cúbico de Hermite (2 nodos, 2 GDL/nodo: v, θ)',
      numElements,
      numNodes,
      totalDofs,
      nodes,
      maxDisplacementMm: maxDisp,
      maxStressMPa: maxStress,
      analyticalDiffPercent: diffPct,
      stiffnessMatrixNote: `Matriz global [${totalDofs}×${totalDofs}] con cargas nodales consistentes de Hermite y condiciones de contorno Dirichlet.`,
    };
  }

  if (params.moduleId === 'M4_TORSION') {
    const numElements = 12;
    const numNodes = numElements + 1;
    const Le = L / numElements;
    const ke = (G * J) / Le;
    const K = Array.from({ length: numNodes }, () => new Array<number>(numNodes).fill(0));
    const F = new Array<number>(numNodes).fill(0);

    for (let e = 0; e < numElements; e++) {
      K[e][e] += ke;
      K[e][e + 1] -= ke;
      K[e + 1][e] -= ke;
      K[e + 1][e + 1] += ke;
    }

    const torqueNmm = params.torqueNm * 1000;
    F[numNodes - 1] = torqueNmm;
    applyDirichletBC(K, F, 0, 0);

    const theta = solveLinearSystem(K, F);
    const rOuter = Math.max(1, params.diameterMm / 2);
    const nodes: FemNodeResult[] = [];
    for (let i = 0; i < numNodes; i++) {
      const dThetaDx = i === 0 ? (theta[1] - theta[0]) / Le : (theta[i] - theta[i - 1]) / Le;
      const tau = G * rOuter * dThetaDx;
      nodes.push({
        nodeIndex: i,
        xMm: i * Le,
        displacementMm: (theta[i] * 180) / Math.PI, // stored as deg angle for torsion inspection
        rotationRad: theta[i],
        axialOrShearStressMPa: Math.abs(tau),
        bendingStressMPa: 0,
        vonMisesMPa: Math.sqrt(3) * Math.abs(tau),
      });
    }

    const maxAngleDeg = Math.max(...nodes.map((n) => Math.abs(n.displacementMm)));
    const maxTau = Math.max(...nodes.map((n) => n.axialOrShearStressMPa));
    const diffPct =
      analyticalMaxStressMPa > 1e-9
        ? (Math.abs(maxTau - analyticalMaxStressMPa) / analyticalMaxStressMPa) * 100
        : 0;

    return {
      available: true,
      methodLabel: 'FEM 1D Torsión Circular (Rigidez GJ/Le)',
      elementType: 'Elemento barra torsional de 2 nodos (1 GDL angular/nodo)',
      numElements,
      numNodes,
      totalDofs: numNodes,
      nodes,
      maxDisplacementMm: maxAngleDeg,
      maxStressMPa: maxTau,
      analyticalDiffPercent: diffPct,
      stiffnessMatrixNote: `Sistema torsional [${numNodes}×${numNodes}] ensamblado para distribución angular θ(x).`,
    };
  }

  // Shear connections (M2_SHEAR) are modeled analytically as localized fastener planes
  return {
    available: false,
    methodLabel: 'Solución Analítica de Plano de Corte Directo',
    elementType: 'Unión localizada (sin discretización 1D de viga)',
    numElements: 0,
    numNodes: 0,
    totalDofs: 0,
    nodes: [],
    maxDisplacementMm: analyticalMaxDispMm,
    maxStressMPa: analyticalMaxStressMPa,
    analyticalDiffPercent: 0,
    stiffnessMatrixNote: 'El cortante directo en pernos/chavetas se evalúa analíticamente mediante áreas resistentes de corte y aplastamiento.',
  };
}
