import {
  AnalysisResult,
  CalculationStep,
  DiagramPoint,
  MaterialSpec,
  MohrCircleData,
  RadialPoint,
  SafetyStatus,
  SectionProperties,
  SimulationParams,
} from '../types/engineering';
import { runSimplifiedFem } from './femSolver';

export function computeSectionProperties(
  params: SimulationParams,
  material: MaterialSpec,
): SectionProperties {
  const L = Math.max(1, params.lengthMm);
  const b = Math.max(1, params.widthMm);
  const h = Math.max(1, params.heightMm);
  const d = Math.max(1, params.diameterMm);
  const di =
    params.sectionType === 'TUBULAR'
      ? Math.max(0, Math.min(d - 2, params.innerDiameterMm))
      : 0;
  const tf = Math.max(1, Math.min(h * 0.4, params.flangeThicknessMm));
  const tw = Math.max(1, Math.min(b * 0.8, params.webThicknessMm));

  let areaMm2 = 0;
  let inertiaZMm4 = 0;
  let polarInertiaJmm4 = 0;
  let yMaxMm = 0;
  let bearingAreaMm2 = b * h;

  switch (params.sectionType) {
    case 'CIRCULAR': {
      const r = d / 2;
      areaMm2 = Math.PI * r * r;
      inertiaZMm4 = (Math.PI * Math.pow(d, 4)) / 64;
      polarInertiaJmm4 = (Math.PI * Math.pow(d, 4)) / 32;
      yMaxMm = r;
      bearingAreaMm2 = d * Math.max(1, params.thicknessMm);
      break;
    }
    case 'TUBULAR': {
      const ro = d / 2;
      const ri = di / 2;
      areaMm2 = Math.PI * (ro * ro - ri * ri);
      inertiaZMm4 = (Math.PI * (Math.pow(d, 4) - Math.pow(di, 4))) / 64;
      polarInertiaJmm4 = (Math.PI * (Math.pow(d, 4) - Math.pow(di, 4))) / 32;
      yMaxMm = ro;
      bearingAreaMm2 = d * Math.max(1, (d - di) / 2);
      break;
    }
    case 'I_BEAM': {
      const hw = Math.max(1, h - 2 * tf);
      areaMm2 = 2 * b * tf + hw * tw;
      inertiaZMm4 = (b * Math.pow(h, 3) - (b - tw) * Math.pow(hw, 3)) / 12;
      // Approximate Saint-Venant torsion constant for open I-section
      polarInertiaJmm4 = (2 * b * Math.pow(tf, 3) + hw * Math.pow(tw, 3)) / 3;
      yMaxMm = h / 2;
      bearingAreaMm2 = tw * h;
      break;
    }
    case 'RECTANGULAR':
    default: {
      areaMm2 = b * h;
      inertiaZMm4 = (b * Math.pow(h, 3)) / 12;
      // Saint-Venant rectangular torsion approx: J ≈ (b*h*(b^2+h^2))/12 or beta*a*b^3
      const longSide = Math.max(b, h);
      const shortSide = Math.min(b, h);
      const ratio = shortSide / longSide;
      const beta = 1 / 3 - 0.21 * ratio * (1 - Math.pow(ratio, 4) / 12);
      polarInertiaJmm4 = beta * longSide * Math.pow(shortSide, 3);
      yMaxMm = h / 2;
      bearingAreaMm2 = (h / 2) * L; // Key bearing area (h/2)*L
      break;
    }
  }

  const sectionModulusMm3 = inertiaZMm4 / Math.max(0.1, yMaxMm);
  const volumeM3 = (areaMm2 * L) * 1e-9;
  const massKg = volumeM3 * material.densityKgM3;

  return {
    areaMm2,
    inertiaZMm4,
    polarInertiaJmm4,
    sectionModulusMm3,
    yMaxMm,
    bearingAreaMm2,
    massKg,
  };
}

function evaluateBeamCurve(
  params: SimulationParams,
  material: MaterialSpec,
  section: SectionProperties,
): {
  profile: DiagramPoint[];
  reactionAN: number;
  reactionBN: number;
  reactionMomentANm: number;
  maxShearN: number;
  maxMomentNm: number;
  maxDeflectionMm: number;
  maxBendingStressMPa: number;
} {
  const L = Math.max(10, params.lengthMm);
  const E = Math.max(100, material.elasticModulusMPa);
  const I = Math.max(1, section.inertiaZMm4);
  const yMax = section.yMaxMm;
  const nPts = 41;
  const profile: DiagramPoint[] = [];

  const angleCos = Math.cos((params.loadAngleDeg * Math.PI) / 180);
  const P = params.forceN * angleCos; // Transverse N
  const w = params.distributedLoadNPerMm * angleCos; // N/mm
  const a = Math.max(0.02 * L, Math.min(0.98 * L, params.loadPositionRatio * L));
  const bSpan = L - a;

  let reactionAN = 0;
  let reactionBN = 0;
  let reactionMomentANm = 0;

  if (params.loadMode === 'DISTRIBUTED_LOAD') {
    if (params.supportCondition === 'FIXED_FREE') {
      reactionAN = w * L;
      reactionBN = 0;
      reactionMomentANm = (w * L * L) / 2000;
    } else if (params.supportCondition === 'FIXED_FIXED') {
      reactionAN = (w * L) / 2;
      reactionBN = (w * L) / 2;
      reactionMomentANm = (w * L * L) / 12000;
    } else {
      reactionAN = (w * L) / 2;
      reactionBN = (w * L) / 2;
      reactionMomentANm = 0;
    }
  } else {
    if (params.supportCondition === 'FIXED_FREE') {
      reactionAN = P;
      reactionBN = 0;
      reactionMomentANm = (P * a) / 1000;
    } else if (params.supportCondition === 'FIXED_FIXED') {
      reactionAN = (P * bSpan * bSpan * (3 * a + bSpan)) / Math.pow(L, 3);
      reactionBN = (P * a * a * (a + 3 * bSpan)) / Math.pow(L, 3);
      reactionMomentANm = (P * a * bSpan * bSpan) / (L * L * 1000);
    } else {
      reactionAN = (P * bSpan) / L;
      reactionBN = (P * a) / L;
      reactionMomentANm = 0;
    }
  }

  for (let i = 0; i < nPts; i++) {
    const x = (i / (nPts - 1)) * L;
    let V = 0;
    let M_Nmm = 0;
    let v_mm = 0;

    if (params.loadMode === 'DISTRIBUTED_LOAD') {
      if (params.supportCondition === 'FIXED_FREE') {
        V = w * (L - x);
        M_Nmm = -0.5 * w * Math.pow(L - x, 2);
        v_mm = -(w * x * x * (6 * L * L - 4 * L * x + x * x)) / (24 * E * I);
      } else if (params.supportCondition === 'FIXED_FIXED') {
        V = w * (L / 2 - x);
        M_Nmm = (w * (6 * L * x - 6 * x * x - L * L)) / 12;
        v_mm = -(w * x * x * Math.pow(L - x, 2)) / (24 * E * I);
      } else {
        V = w * (L / 2 - x);
        M_Nmm = 0.5 * w * x * (L - x);
        v_mm = -(w * x * (Math.pow(L, 3) - 2 * L * x * x + Math.pow(x, 3))) / (24 * E * I);
      }
    } else {
      if (params.supportCondition === 'FIXED_FREE') {
        V = x <= a ? P : 0;
        M_Nmm = x <= a ? -P * (a - x) : 0;
        if (x <= a) {
          v_mm = -(P * x * x * (3 * a - x)) / (6 * E * I);
        } else {
          v_mm = -(P * a * a * (3 * x - a)) / (6 * E * I);
        }
      } else if (params.supportCondition === 'FIXED_FIXED') {
        const Ma = (P * a * bSpan * bSpan) / (L * L);
        const Ra = reactionAN;
        V = x < a ? Ra : Ra - P;
        M_Nmm = Ra * x - Ma - (x > a ? P * (x - a) : 0);
        // Macaulay integration for fixed-fixed beam
        const termLoad = x > a ? (P * Math.pow(x - a, 3)) / 6 : 0;
        v_mm = ((Ra * Math.pow(x, 3)) / 6 - (Ma * x * x) / 2 - termLoad) / (E * I);
      } else {
        V = x < a ? reactionAN : reactionAN - P;
        M_Nmm = x <= a ? reactionAN * x : reactionAN * x - P * (x - a);
        if (x <= a) {
          v_mm = -(P * bSpan * x * (L * L - bSpan * bSpan - x * x)) / (6 * E * I * L);
        } else {
          const xb = L - x;
          v_mm = -(P * a * xb * (L * L - a * a - xb * xb)) / (6 * E * I * L);
        }
      }
    }

    const momentNm = M_Nmm / 1000;
    const normalStressMPa = Math.abs((M_Nmm * yMax) / I);
    const tauAvg = Math.abs(V) / Math.max(1, section.areaMm2);
    const vonMisesMPa = Math.sqrt(normalStressMPa * normalStressMPa + 3 * tauAvg * tauAvg);

    profile.push({
      xMm: x,
      shearN: V,
      momentNm,
      deflectionMm: v_mm,
      normalStressMPa,
      vonMisesMPa,
    });
  }

  const maxShearN = Math.max(...profile.map((p) => Math.abs(p.shearN)));
  const maxMomentNm = Math.max(...profile.map((p) => Math.abs(p.momentNm)));
  const maxDeflectionMm = Math.max(...profile.map((p) => Math.abs(p.deflectionMm)));
  const maxBendingStressMPa = Math.max(...profile.map((p) => p.normalStressMPa));

  return {
    profile,
    reactionAN,
    reactionBN,
    reactionMomentANm,
    maxShearN,
    maxMomentNm,
    maxDeflectionMm,
    maxBendingStressMPa,
  };
}

export function computeMohrCircle(sigmaX: number, sigmaY: number, tauXY: number): MohrCircleData {
  const centerSigma = (sigmaX + sigmaY) / 2;
  const diff = (sigmaX - sigmaY) / 2;
  const radiusR = Math.sqrt(diff * diff + tauXY * tauXY);
  const sigma1 = centerSigma + radiusR;
  const sigma2 = centerSigma - radiusR;
  const tauMaxAbs = Math.max(radiusR, Math.abs(sigma1) / 2, Math.abs(sigma2) / 2);
  const principalAngleDeg =
    Math.abs(diff) < 1e-9 && Math.abs(tauXY) < 1e-9
      ? 0
      : (0.5 * Math.atan2(tauXY, diff) * 180) / Math.PI;

  return {
    sigmaX,
    sigmaY,
    tauXY,
    centerSigma,
    radiusR,
    sigma1,
    sigma2,
    tauMaxAbs,
    principalAngleDeg,
  };
}

export function analyzeComponent(params: SimulationParams, material: MaterialSpec): AnalysisResult {
  const section = computeSectionProperties(params, material);
  const L = Math.max(1, params.lengthMm);
  const E = Math.max(100, material.elasticModulusMPa);
  const G = Math.max(50, material.shearModulusMPa);
  const A = Math.max(1, section.areaMm2);
  const J = Math.max(1, section.polarInertiaJmm4);
  const steps: CalculationStep[] = [];
  const warnings: string[] = [];

  if (params.sectionType === 'TUBULAR' && params.innerDiameterMm >= params.diameterMm - 1) {
    warnings.push('El diámetro interior debe ser menor al diámetro exterior para mantener espesor de pared.');
  }
  if (params.lengthMm < params.heightMm * 2 && params.moduleId === 'M3_BENDING') {
    warnings.push('Relación L/h < 2: viga muy corta; la teoría clásica de Euler-Bernoulli desprecia deformación por cortante transversal.');
  }

  let normalStressMPa = 0;
  let tensileMaxMPa = 0;
  let compressiveMaxMPa = 0;
  let shearStressMPa = 0;
  let bearingStressMPa = 0;
  let maxDisplacementMm = 0;
  let strainMicro = 0;
  let twistAngleDeg = 0;
  let torsionalStiffnessNmPerRad = (G * J) / (L * 1000);
  let reactionAN = 0;
  let reactionBN = 0;
  let reactionMomentANm = 0;
  let maxBendingMomentNm = 0;
  let maxShearForceN = 0;
  let maxStressLocationLabel = 'Sección uniforme';

  let beamProfile: DiagramPoint[] = [];
  const radialProfile: RadialPoint[] = [];

  // 1. MODULE 01: AXIAL TENSION / COMPRESSION
  if (params.moduleId === 'M1_AXIAL') {
    const sign = params.loadMode === 'COMPRESSION' ? -1 : 1;
    const F = params.forceN;
    normalStressMPa = (sign * F) / A;
    tensileMaxMPa = sign > 0 ? normalStressMPa : 0;
    compressiveMaxMPa = sign < 0 ? Math.abs(normalStressMPa) : 0;
    const deltaMm = (F * L) / (E * A);
    maxDisplacementMm = deltaMm;
    strainMicro = (deltaMm / L) * 1e6;
    reactionAN = F;
    maxStressLocationLabel = 'Distribución uniforme en toda la sección transversal';

    // Uniform profile along L for plotting
    for (let i = 0; i <= 20; i++) {
      const x = (i / 20) * L;
      beamProfile.push({
        xMm: x,
        shearN: 0,
        momentNm: 0,
        deflectionMm: (sign * deltaMm * x) / L,
        normalStressMPa: Math.abs(normalStressMPa),
        vonMisesMPa: Math.abs(normalStressMPa),
      });
    }

    steps.push(
      {
        label: 'Área transversal resistente',
        formula: params.sectionType === 'CIRCULAR' ? 'A = π·d² / 4' : 'A = b · h',
        substitution:
          params.sectionType === 'CIRCULAR'
            ? `A = π·(${params.diameterMm.toFixed(1)})² / 4`
            : `A = ${params.widthMm.toFixed(1)} × ${params.heightMm.toFixed(1)}`,
        result: `${A.toFixed(2)} mm²`,
      },
      {
        label: 'Esfuerzo normal axial',
        formula: 'σ = F / A',
        substitution: `σ = ${sign < 0 ? '-' : ''}${F.toFixed(0)} N / ${A.toFixed(2)} mm²`,
        result: `${normalStressMPa.toFixed(2)} MPa`,
      },
      {
        label: sign < 0 ? 'Acortamiento elástico' : 'Alargamiento elástico',
        formula: 'δ = (F · L) / (E · A)',
        substitution: `δ = (${F.toFixed(0)} × ${L.toFixed(1)}) / (${E.toFixed(0)} × ${A.toFixed(2)})`,
        result: `${deltaMm.toFixed(4)} mm (ε = ${strainMicro.toFixed(1)} με)`,
      },
    );
  }

  // 2. MODULE 02: SHEAR (BOLTS, PINS, KEYS)
  else if (params.moduleId === 'M2_SHEAR') {
    const planes = params.supportCondition === 'DOUBLE_SHEAR' ? 2 : params.shearPlanes;
    const isKey = params.componentId === 'chaveta';
    const singlePlaneArea = isKey ? params.widthMm * L : A;
    const totalShearArea = singlePlaneArea * planes;
    const F = params.forceN;

    shearStressMPa = F / Math.max(0.1, totalShearArea);
    maxShearForceN = F / planes;
    reactionAN = F / planes;
    reactionBN = planes === 2 ? F / 2 : 0;

    // Bearing / Crushing stress
    const bearArea = isKey
      ? Math.max(1, (params.heightMm / 2) * L)
      : Math.max(1, params.diameterMm * Math.max(1, params.thicknessMm));
    bearingStressMPa = F / bearArea;

    // Approximate local elastic shear slip over effective shear zone thickness
    const effectiveShearGap = Math.max(2, params.thicknessMm * 0.4);
    maxDisplacementMm = (shearStressMPa / G) * effectiveShearGap;
    maxStressLocationLabel =
      planes === 2
        ? 'Planos de corte dobles (interfaz horquilla-pasador)'
        : isKey
          ? 'Plano medio de corte y cara lateral de aplastamiento'
          : 'Plano de corte simple en interfaz de unión';

    for (let i = 0; i <= 20; i++) {
      const x = (i / 20) * L;
      const inShearPlane = planes === 2 ? Math.abs(x - L * 0.3) < L * 0.1 || Math.abs(x - L * 0.7) < L * 0.1 : Math.abs(x - L * 0.5) < L * 0.12;
      const localTau = inShearPlane ? shearStressMPa : shearStressMPa * 0.25;
      beamProfile.push({
        xMm: x,
        shearN: F / planes,
        momentNm: 0,
        deflectionMm: maxDisplacementMm,
        normalStressMPa: 0,
        vonMisesMPa: Math.sqrt(3) * localTau,
      });
    }

    steps.push(
      {
        label: 'Área resistente al corte',
        formula: isKey ? 'A_corte = n · (b · L)' : 'A_corte = n · (π · d² / 4)',
        substitution: isKey
          ? `A_corte = ${planes} × (${params.widthMm.toFixed(1)} × ${L.toFixed(1)})`
          : `A_corte = ${planes} × π·(${params.diameterMm.toFixed(1)})² / 4`,
        result: `${totalShearArea.toFixed(2)} mm² (${planes} plano${planes > 1 ? 's' : ''})`,
      },
      {
        label: 'Esfuerzo cortante promedio',
        formula: 'τ = F / A_corte',
        substitution: `τ = ${F.toFixed(0)} N / ${totalShearArea.toFixed(2)} mm²`,
        result: `${shearStressMPa.toFixed(2)} MPa`,
      },
      {
        label: 'Esfuerzo de aplastamiento (contacto)',
        formula: isKey ? 'σ_ap = F / ((h/2)·L)' : 'σ_ap = F / (d·t)',
        substitution: `σ_ap = ${F.toFixed(0)} / ${bearArea.toFixed(1)}`,
        result: `${bearingStressMPa.toFixed(2)} MPa`,
      },
    );
  }

  // 3. MODULE 03: BENDING
  else if (params.moduleId === 'M3_BENDING') {
    const beam = evaluateBeamCurve(params, material, section);
    beamProfile = beam.profile;
    reactionAN = beam.reactionAN;
    reactionBN = beam.reactionBN;
    reactionMomentANm = beam.reactionMomentANm;
    maxShearForceN = beam.maxShearN;
    maxBendingMomentNm = beam.maxMomentNm;
    maxDisplacementMm = beam.maxDeflectionMm;
    normalStressMPa = beam.maxBendingStressMPa;
    tensileMaxMPa = beam.maxBendingStressMPa;
    compressiveMaxMPa = beam.maxBendingStressMPa;

    // Peak transverse shear stress (approx 1.5 V/A for rect, 1.33 V/A for circle, V/A_web for I-beam)
    const shearFactor =
      params.sectionType === 'RECTANGULAR' ? 1.5 : params.sectionType === 'CIRCULAR' ? 4 / 3 : 1.15;
    shearStressMPa = (shearFactor * maxShearForceN) / A;

    const peakNode = beamProfile.reduce((best, cur) =>
      cur.normalStressMPa > best.normalStressMPa ? cur : best,
    );
    maxStressLocationLabel = `x = ${peakNode.xMm.toFixed(0)} mm (fibras extremas y = ±${section.yMaxMm.toFixed(1)} mm)`;

    steps.push(
      {
        label: 'Momento de inercia respecto al eje neutro (Iz)',
        formula:
          params.sectionType === 'RECTANGULAR'
            ? 'Iz = b·h³ / 12'
            : params.sectionType === 'CIRCULAR'
              ? 'Iz = π·d⁴ / 64'
              : params.sectionType === 'I_BEAM'
                ? 'Iz = [b·h³ - (b-tw)·hw³] / 12'
                : 'Iz = π·(D⁴ - d⁴) / 64',
        substitution: `c = y_max = ${section.yMaxMm.toFixed(2)} mm`,
        result: `${section.inertiaZMm4.toFixed(1)} mm⁴`,
      },
      {
        label: 'Momento flector máximo',
        formula:
          params.supportCondition === 'FIXED_FREE'
            ? params.loadMode === 'DISTRIBUTED_LOAD'
              ? 'M_max = w·L² / 2'
              : 'M_max = F·a'
            : params.loadMode === 'DISTRIBUTED_LOAD'
              ? 'M_max = w·L² / 8'
              : 'M_max = F·a·b / L',
        substitution: `Ra = ${reactionAN.toFixed(0)} N, Rb = ${reactionBN.toFixed(0)} N`,
        result: `${maxBendingMomentNm.toFixed(2)} N·m`,
      },
      {
        label: 'Esfuerzo normal máximo de flexión',
        formula: 'σ_max = M_max · c / Iz',
        substitution: `σ_max = (${(maxBendingMomentNm * 1000).toFixed(0)} N·mm × ${section.yMaxMm.toFixed(1)} mm) / ${section.inertiaZMm4.toFixed(0)} mm⁴`,
        result: `${normalStressMPa.toFixed(2)} MPa`,
      },
    );
  }

  // 4. MODULE 04: TORSION
  else if (params.moduleId === 'M4_TORSION') {
    const T_Nmm = params.torqueNm * 1000;
    const rOuter = params.sectionType === 'RECTANGULAR' ? Math.min(params.widthMm, params.heightMm) / 2 : params.diameterMm / 2;
    const rInner = params.sectionType === 'TUBULAR' ? Math.min(rOuter - 1, params.innerDiameterMm / 2) : 0;

    shearStressMPa = (T_Nmm * rOuter) / J;
    const thetaRad = (T_Nmm * L) / (G * J);
    twistAngleDeg = (thetaRad * 180) / Math.PI;
    maxDisplacementMm = rOuter * thetaRad; // Arc displacement at outer radius
    torsionalStiffnessNmPerRad = (G * J) / (L * 1000);
    maxStressLocationLabel = `Superficie exterior del eje (r = ${rOuter.toFixed(1)} mm)`;

    if (params.sectionType === 'RECTANGULAR' || params.sectionType === 'I_BEAM') {
      warnings.push('La fórmula τ = T·r/J es exacta para ejes circulares macizos o tubulares; en secciones no circulares es aproximada.');
    }

    for (let i = 0; i <= 10; i++) {
      const r = rInner + ((rOuter - rInner) * i) / 10;
      radialProfile.push({
        rMm: r,
        shearStressMPa: (T_Nmm * r) / J,
      });
    }

    for (let i = 0; i <= 20; i++) {
      const x = (i / 20) * L;
      beamProfile.push({
        xMm: x,
        shearN: 0,
        momentNm: params.torqueNm,
        deflectionMm: (twistAngleDeg * x) / L,
        normalStressMPa: 0,
        vonMisesMPa: Math.sqrt(3) * shearStressMPa,
      });
    }

    steps.push(
      {
        label: 'Momento polar de inercia (J)',
        formula: params.sectionType === 'TUBULAR' ? 'J = π·(D⁴ - d⁴) / 32' : 'J = π·d⁴ / 32',
        substitution:
          params.sectionType === 'TUBULAR'
            ? `J = π·(${params.diameterMm.toFixed(1)}⁴ - ${params.innerDiameterMm.toFixed(1)}⁴) / 32`
            : `J = π·(${params.diameterMm.toFixed(1)})⁴ / 32`,
        result: `${J.toFixed(1)} mm⁴`,
      },
      {
        label: 'Esfuerzo cortante torsional máximo',
        formula: 'τ_max = T · r / J',
        substitution: `τ_max = (${T_Nmm.toFixed(0)} N·mm × ${rOuter.toFixed(1)} mm) / ${J.toFixed(0)} mm⁴`,
        result: `${shearStressMPa.toFixed(2)} MPa`,
      },
      {
        label: 'Ángulo de torsión',
        formula: 'θ = (T · L) / (G · J)',
        substitution: `θ = (${T_Nmm.toFixed(0)} × ${L.toFixed(1)}) / (${G.toFixed(0)} × ${J.toFixed(0)})`,
        result: `${twistAngleDeg.toFixed(3)}° (${thetaRad.toFixed(5)} rad)`,
      },
    );
  }

  // 5 & 6. MODULE 05 (COMBINED) & MODULE 06 (SAFETY & FAILURE)
  else {
    const beam = evaluateBeamCurve(params, material, section);
    beamProfile = beam.profile;
    reactionAN = beam.reactionAN;
    reactionBN = beam.reactionBN;
    reactionMomentANm = beam.reactionMomentANm;
    maxShearForceN = beam.maxShearN;
    maxBendingMomentNm = beam.maxMomentNm;
    maxDisplacementMm = beam.maxDeflectionMm;

    const axialAngleSin = Math.sin((params.loadAngleDeg * Math.PI) / 180);
    const axialForce = params.includeAxialInCombined
      ? params.forceN * (Math.abs(axialAngleSin) > 0.05 ? axialAngleSin : 0.35)
      : 0;
    const sigmaAxial = axialForce / A;
    const sigmaBending = params.includeBendingInCombined ? beam.maxBendingStressMPa : 0;
    normalStressMPa = sigmaAxial + sigmaBending;
    tensileMaxMPa = Math.abs(sigmaAxial) + sigmaBending;
    compressiveMaxMPa = Math.abs(sigmaBending - Math.max(0, sigmaAxial));

    const rOuter = params.sectionType === 'CIRCULAR' || params.sectionType === 'TUBULAR' ? params.diameterMm / 2 : section.yMaxMm;
    const tauTorsion = params.includeTorsionInCombined ? (params.torqueNm * 1000 * rOuter) / J : 0;
    const tauTransverse = params.includeShearInCombined ? (1.33 * maxShearForceN) / A : 0;
    shearStressMPa = tauTorsion + tauTransverse;

    const thetaRad = (params.torqueNm * 1000 * L) / (G * J);
    twistAngleDeg = params.includeTorsionInCombined ? (thetaRad * 180) / Math.PI : 0;

    // Update beamProfile vonMises with torsion included
    beamProfile = beamProfile.map((pt) => {
      const sTot = (params.includeBendingInCombined ? pt.normalStressMPa : 0) + Math.abs(sigmaAxial);
      const tTot = tauTorsion + (params.includeShearInCombined ? (1.33 * Math.abs(pt.shearN)) / A : 0);
      return {
        ...pt,
        normalStressMPa: sTot,
        vonMisesMPa: Math.sqrt(sTot * sTot + 3 * tTot * tTot),
      };
    });

    const peakNode = beamProfile.reduce((best, cur) =>
      cur.vonMisesMPa > best.vonMisesMPa ? cur : best,
    );
    maxStressLocationLabel = `x = ${peakNode.xMm.toFixed(0)} mm (fibra extrema bajo estado combinado)`;

    steps.push(
      {
        label: 'Esfuerzo normal resultante (Axial + Flexión)',
        formula: 'σ_x = σ_axial + σ_flexión = (F_ax/A) + (M·c/Iz)',
        substitution: `σ_x = ${sigmaAxial.toFixed(2)} + ${sigmaBending.toFixed(2)}`,
        result: `${normalStressMPa.toFixed(2)} MPa`,
      },
      {
        label: 'Esfuerzo cortante resultante (Torsión + Corte)',
        formula: 'τ_xy = τ_torsión + τ_corte = (T·r/J) + (k·V/A)',
        substitution: `τ_xy = ${tauTorsion.toFixed(2)} + ${tauTransverse.toFixed(2)}`,
        result: `${shearStressMPa.toFixed(2)} MPa`,
      },
    );
  }

  // Plane stress invariants, Mohr's Circle, Von Mises & Tresca (valid for ALL modules)
  const mohr = computeMohrCircle(normalStressMPa, 0, shearStressMPa);
  const vonMisesMPa = Math.sqrt(normalStressMPa * normalStressMPa + 3 * shearStressMPa * shearStressMPa);
  const trescaMPa = Math.sqrt(normalStressMPa * normalStressMPa + 4 * shearStressMPa * shearStressMPa);

  const equivalentStressMPa = params.failureCriterion === 'TRESCA' ? trescaMPa : vonMisesMPa;
  const Sy = Math.max(1, material.yieldStrengthMPa);
  const safetyFactorVM = vonMisesMPa > 1e-6 ? Sy / vonMisesMPa : 99.9;
  const safetyFactorTresca = trescaMPa > 1e-6 ? Sy / trescaMPa : 99.9;
  const activeSafetyFactor =
    params.failureCriterion === 'TRESCA' ? safetyFactorTresca : safetyFactorVM;

  let safetyStatus: SafetyStatus = 'SAFE';
  let safetyStatusLabel = 'Seguro según el criterio seleccionado';
  if (activeSafetyFactor < 1.0) {
    safetyStatus = 'FAIL';
    safetyStatusLabel = 'Supera el límite admisible';
  } else if (activeSafetyFactor < 1.5) {
    safetyStatus = 'REVIEW';
    safetyStatusLabel = 'Requiere revisión de diseño';
  }

  if (params.moduleId === 'M5_COMBINED' || params.moduleId === 'M6_SAFETY') {
    steps.push(
      {
        label: 'Esfuerzos principales (Círculo de Mohr)',
        formula: 'σ_1,2 = (σ_x / 2) ± √[(σ_x / 2)² + τ_xy²]',
        substitution: `C = ${mohr.centerSigma.toFixed(2)} MPa, R = ${mohr.radiusR.toFixed(2)} MPa`,
        result: `σ₁ = ${mohr.sigma1.toFixed(2)} MPa, σ₂ = ${mohr.sigma2.toFixed(2)} MPa`,
      },
      {
        label:
          params.failureCriterion === 'TRESCA'
            ? 'Criterio de Tresca (Esfuerzo cortante máximo)'
            : 'Criterio de Von Mises (Energía de distorsión)',
        formula:
          params.failureCriterion === 'TRESCA'
            ? 'σ_eq = √(σ_x² + 4·τ_xy²)'
            : 'σ_vm = √(σ_x² + 3·τ_xy²)',
        substitution: `σ_y = ${Sy.toFixed(0)} MPa, FS = σ_y / σ_eq`,
        result: `${equivalentStressMPa.toFixed(2)} MPa → FS = ${activeSafetyFactor.toFixed(2)}`,
      },
    );
  } else {
    steps.push({
      label:
        params.failureCriterion === 'TRESCA'
          ? 'Factor de seguridad (Tresca)'
          : 'Factor de seguridad (Von Mises)',
      formula: 'FS = Sy / σ_eq',
      substitution: `FS = ${Sy.toFixed(0)} MPa / ${equivalentStressMPa.toFixed(2)} MPa`,
      result: `${activeSafetyFactor.toFixed(2)} — ${safetyStatusLabel}`,
    });
  }

  // Run 1D FEM verification alongside analytical calculations
  const fem = runSimplifiedFem(
    params,
    material,
    section,
    maxDisplacementMm,
    params.moduleId === 'M4_TORSION' ? shearStressMPa : normalStressMPa,
  );

  // Pedagogical & Industrial interpretation
  let engineeringInterpretation = '';
  if (safetyStatus === 'FAIL') {
    engineeringInterpretation = `Condición crítica: el esfuerzo equivalente (${equivalentStressMPa.toFixed(1)} MPa) supera el límite de fluencia referencial de ${material.name} (${Sy} MPa). Existe alto riesgo de deformación plástica permanente o fractura en operación. Se recomienda aumentar sección transversal, reducir brazo de palanca o migrar a un acero de mayor resistencia (ej. AISI 4140).`;
  } else if (safetyStatus === 'REVIEW') {
    engineeringInterpretation = `Margen reducido (FS = ${activeSafetyFactor.toFixed(2)}): el componente permanece en rango elástico bajo carga estática nominal, pero es vulnerable ante picos dinámicos, fatiga, corrosión o desalineamiento en planta. Conviene elevar FS ≥ 1.5–2.0 según práctica de diseño ASME/Shigley.`;
  } else {
    engineeringInterpretation = `Operación estable en rango elástico (FS = ${activeSafetyFactor.toFixed(2)}). El esfuerzo equivalente representa el ${((equivalentStressMPa / Sy) * 100).toFixed(1)}% del límite de fluencia referencial. Verifique tolerancias dimensionales, concentradores de esfuerzo y apriete periódico en mantenimiento preventivo.`;
  }

  return {
    section,
    normalStressMPa,
    tensileMaxMPa,
    compressiveMaxMPa,
    shearStressMPa,
    bearingStressMPa,
    vonMisesMPa,
    trescaMPa,
    equivalentStressMPa,
    maxDisplacementMm,
    strainMicro,
    twistAngleDeg,
    torsionalStiffnessNmPerRad,
    reactionAN,
    reactionBN,
    reactionMomentANm,
    maxBendingMomentNm,
    maxShearForceN,
    safetyFactorVM,
    safetyFactorTresca,
    activeSafetyFactor,
    safetyStatus,
    safetyStatusLabel,
    maxStressLocationLabel,
    mohr,
    beamProfile,
    radialProfile,
    steps,
    warnings,
    fem,
    engineeringInterpretation,
  };
}
