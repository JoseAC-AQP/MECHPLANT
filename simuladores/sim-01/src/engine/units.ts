import { UnitSystem } from '../types/engineering';

export const MM_PER_IN = 25.4;
export const N_PER_LBF = 4.4482216152605;
export const MPA_PER_PSI = 0.006894757293168361;
export const NM_PER_LBF_IN = 0.1129848290276167;
export const KGM3_PER_LBIN3 = 27679.9047;
export const KG_PER_LB = 0.45359237;

export function toDisplayLength(mm: number, unit: UnitSystem): number {
  return unit === 'SI' ? mm : mm / MM_PER_IN;
}
export function fromDisplayLength(val: number, unit: UnitSystem): number {
  return unit === 'SI' ? val : val * MM_PER_IN;
}

export function toDisplayArea(mm2: number, unit: UnitSystem): number {
  return unit === 'SI' ? mm2 : mm2 / (MM_PER_IN * MM_PER_IN);
}

export function toDisplayInertia(mm4: number, unit: UnitSystem): number {
  const f = MM_PER_IN ** 4;
  return unit === 'SI' ? mm4 : mm4 / f;
}

export function toDisplayForce(n: number, unit: UnitSystem): number {
  return unit === 'SI' ? n : n / N_PER_LBF;
}
export function fromDisplayForce(val: number, unit: UnitSystem): number {
  return unit === 'SI' ? val : val * N_PER_LBF;
}

export function toDisplayTorque(nm: number, unit: UnitSystem): number {
  return unit === 'SI' ? nm : nm / NM_PER_LBF_IN;
}
export function fromDisplayTorque(val: number, unit: UnitSystem): number {
  return unit === 'SI' ? val : val * NM_PER_LBF_IN;
}

export function toDisplayDistLoad(nPerMm: number, unit: UnitSystem): number {
  // N/mm -> lbf/in
  return unit === 'SI' ? nPerMm : (nPerMm * MM_PER_IN) / N_PER_LBF;
}
export function fromDisplayDistLoad(val: number, unit: UnitSystem): number {
  return unit === 'SI' ? val : (val * N_PER_LBF) / MM_PER_IN;
}

export function toDisplayStress(mpa: number, unit: UnitSystem): number {
  return unit === 'SI' ? mpa : mpa / MPA_PER_PSI;
}
export function fromDisplayStress(val: number, unit: UnitSystem): number {
  return unit === 'SI' ? val : val * MPA_PER_PSI;
}

export function toDisplayDensity(kgm3: number, unit: UnitSystem): number {
  return unit === 'SI' ? kgm3 : kgm3 / KGM3_PER_LBIN3;
}

export function toDisplayMass(kg: number, unit: UnitSystem): number {
  return unit === 'SI' ? kg : kg / KG_PER_LB;
}

export function unitLabels(unit: UnitSystem) {
  if (unit === 'SI') {
    return {
      length: 'mm',
      area: 'mm²',
      inertia: 'mm⁴',
      modulus3: 'mm³',
      force: 'N',
      torque: 'N·m',
      distLoad: 'N/mm',
      stress: 'MPa',
      density: 'kg/m³',
      mass: 'kg',
    };
  }
  return {
    length: 'in',
    area: 'in²',
    inertia: 'in⁴',
    modulus3: 'in³',
    force: 'lbf',
    torque: 'lbf·in',
    distLoad: 'lbf/in',
    stress: 'psi',
    density: 'lb/in³',
    mass: 'lb',
  };
}

export function formatEng(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1e6) return value.toExponential(2);
  if (abs > 0 && abs < 0.001) return value.toExponential(2);
  return value.toLocaleString('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
