import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Wrench } from 'lucide-react';
import { INDUSTRIAL_CASES } from '../data/industrialCases';
import { analyzeComponent } from '../engine/analyticalSolver';
import { formatEng, toDisplayLength, toDisplayStress, unitLabels } from '../engine/units';
import { IndustrialCase, MaterialSpec, SimulationParams, UnitSystem } from '../types/engineering';

interface IndustrialCasesViewProps {
  materials: MaterialSpec[];
  unitSystem: UnitSystem;
  onLoadCaseInSimulator: (params: SimulationParams) => void;
}

export const IndustrialCasesView: React.FC<IndustrialCasesViewProps> = ({
  materials,
  unitSystem,
  onLoadCaseInSimulator,
}) => {
  const [selectedId, setSelectedId] = useState(INDUSTRIAL_CASES[0].id);
  const activeCase: IndustrialCase =
    INDUSTRIAL_CASES.find((c) => c.id === selectedId) ?? INDUSTRIAL_CASES[0];

  // Interactive Comparative Redesign Lab inside each case
  const [trialDiameterMm, setTrialDiameterMm] = useState(activeCase.params.diameterMm);
  const [trialHeightMm, setTrialHeightMm] = useState(activeCase.params.heightMm);
  const [trialThicknessMm, setTrialThicknessMm] = useState(activeCase.params.lengthMm);
  const [trialMaterialId, setTrialMaterialId] = useState(activeCase.params.materialId);

  const handleSelectCase = (c: IndustrialCase) => {
    setSelectedId(c.id);
    setTrialDiameterMm(c.params.diameterMm);
    setTrialHeightMm(c.params.heightMm);
    setTrialThicknessMm(c.params.lengthMm);
    setTrialMaterialId(c.params.materialId);
  };

  const baseMaterial =
    materials.find((m) => m.id === activeCase.params.materialId) ?? materials[0];
  const trialMaterial = materials.find((m) => m.id === trialMaterialId) ?? materials[0];

  const baselineResult = useMemo(
    () => analyzeComponent(activeCase.params, baseMaterial),
    [activeCase, baseMaterial],
  );

  const redesignedParams: SimulationParams = useMemo(
    () => ({
      ...activeCase.params,
      diameterMm: trialDiameterMm,
      heightMm: trialHeightMm,
      lengthMm: trialThicknessMm,
      materialId: trialMaterialId,
    }),
    [activeCase, trialDiameterMm, trialHeightMm, trialThicknessMm, trialMaterialId],
  );

  const redesignResult = useMemo(
    () => analyzeComponent(redesignedParams, trialMaterial),
    [redesignedParams, trialMaterial],
  );

  const ul = unitLabels(unitSystem);
  const targetReached = redesignResult.activeSafetyFactor >= activeCase.targetSafetyFactor;

  return (
    <div className="flex-1 overflow-y-auto cae-scroll bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Case List */}
        <div className="lg:col-span-4 space-y-2">
          <div className="mb-3">
            <h1 className="text-lg font-bold text-slate-900">Casos Reales de Planta</h1>
            <p className="text-xs text-slate-600 mt-0.5">
              8 escenarios de mantenimiento industrial con diagnóstico mecánico y actividad comparativa de rediseño.
            </p>
          </div>
          {INDUSTRIAL_CASES.map((c) => {
            const active = c.id === activeCase.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectCase(c)}
                className={`w-full text-left p-3 rounded border transition-colors cursor-pointer ${
                  active
                    ? 'bg-white border-blue-600 text-slate-900'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="text-[11px] font-mono font-semibold text-blue-700">
                  {c.code}
                </div>
                <div className="text-xs font-semibold mt-0.5">{c.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">{c.equipment}</div>
              </button>
            );
          })}
        </div>

        {/* Right Detailed Case Engineering Dossier */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <div className="text-xs font-mono text-blue-700 font-semibold">
                  {activeCase.code} · {activeCase.equipment}
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">{activeCase.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => onLoadCaseInSimulator(redesignedParams)}
                className="px-3.5 py-2 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>Cargar en Simulador 3D</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-slate-900 block">Función del componente</span>
                  <p className="text-slate-600 mt-0.5">{activeCase.componentFunction}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block">Problema de mantenimiento reportado</span>
                  <p className="text-red-800 bg-red-50 border border-red-200 rounded p-2 mt-0.5">
                    {activeCase.maintenanceProblem}
                  </p>
                </div>
              </div>

              <div className="space-y-2 bg-slate-50 border border-slate-200 rounded p-3">
                <div>
                  <span className="font-semibold text-slate-900">Cargas actuantes: </span>
                  <span className="text-slate-700">{activeCase.actingLoadsSummary}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Geometría inicial: </span>
                  <span className="text-slate-700">{activeCase.geometrySummary}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Condición de apoyo: </span>
                  <span className="text-slate-700">{activeCase.supportSummary}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Material original: </span>
                  <span className="text-slate-700">{baseMaterial.name}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-200">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1.5">Posibles causas raíz de falla</h3>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  {activeCase.failureCauses.map((fc, i) => (
                    <li key={i}>{fc}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1.5">
                  Recomendaciones de mantenimiento y rediseño
                </h3>
                <ul className="list-disc pl-4 space-y-1 text-slate-700">
                  {activeCase.maintenanceRecommendations.map((mr, i) => (
                    <li key={i}>{mr}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Interactive Activity: Modify Geometry / Material & Compare */}
          <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Actividad Comparativa de Rediseño
                </h3>
              </div>
              {targetReached && (
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Meta alcanzada (FS ≥ {activeCase.targetSafetyFactor.toFixed(2)})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600">{activeCase.redesignChallenge}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Material propuesto
                </label>
                <select
                  value={trialMaterialId}
                  onChange={(e) => setTrialMaterialId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-slate-50"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (Sy = {m.yieldStrengthMPa} MPa)
                    </option>
                  ))}
                </select>
              </div>

              {(activeCase.params.sectionType === 'CIRCULAR' ||
                activeCase.params.sectionType === 'TUBULAR') ? (
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="font-semibold text-slate-700">Diámetro d</label>
                    <span className="font-mono tabular-nums font-semibold">
                      {formatEng(toDisplayLength(trialDiameterMm, unitSystem), 1)} {ul.length}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={140}
                    step={1}
                    value={trialDiameterMm}
                    onChange={(e) => setTrialDiameterMm(Number(e.target.value))}
                    className="w-full cae-slider"
                  />
                </div>
              ) : (
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="font-semibold text-slate-700">Altura / Peralte h</label>
                    <span className="font-mono tabular-nums font-semibold">
                      {formatEng(toDisplayLength(trialHeightMm, unitSystem), 1)} {ul.length}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={260}
                    step={2}
                    value={trialHeightMm}
                    onChange={(e) => setTrialHeightMm(Number(e.target.value))}
                    className="w-full cae-slider"
                  />
                </div>
              )}

              <div>
                <div className="flex justify-between mb-1">
                  <label className="font-semibold text-slate-700">Longitud L</label>
                  <span className="font-mono tabular-nums font-semibold">
                    {formatEng(toDisplayLength(trialThicknessMm, unitSystem), 0)} {ul.length}
                  </span>
                </div>
                <input
                  type="range"
                  min={Math.max(30, Math.round(activeCase.params.lengthMm * 0.4))}
                  max={Math.round(activeCase.params.lengthMm * 1.6)}
                  step={5}
                  value={trialThicknessMm}
                  onChange={(e) => setTrialThicknessMm(Number(e.target.value))}
                  className="w-full cae-slider"
                />
              </div>
            </div>

            {/* Baseline vs Redesign Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-1">
                <div className="font-semibold text-slate-700">Condición Original (Falla en Planta)</div>
                <div className="flex justify-between font-mono tabular-nums">
                  <span>Esfuerzo Equivalente:</span>
                  <span className="font-semibold">
                    {formatEng(toDisplayStress(baselineResult.equivalentStressMPa, unitSystem), 2)} {ul.stress}
                  </span>
                </div>
                <div className="flex justify-between font-mono tabular-nums">
                  <span>Factor de Seguridad:</span>
                  <span className="font-bold text-red-700">
                    FS = {baselineResult.activeSafetyFactor.toFixed(2)} ({baselineResult.safetyStatusLabel})
                  </span>
                </div>
              </div>

              <div
                className={`border rounded p-3 text-xs space-y-1 ${
                  targetReached
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="font-semibold text-slate-900">Tu Propuesta de Rediseño</div>
                <div className="flex justify-between font-mono tabular-nums">
                  <span>Esfuerzo Equivalente:</span>
                  <span className="font-semibold">
                    {formatEng(toDisplayStress(redesignResult.equivalentStressMPa, unitSystem), 2)} {ul.stress}
                  </span>
                </div>
                <div className="flex justify-between font-mono tabular-nums">
                  <span>Factor de Seguridad:</span>
                  <span
                    className={`font-bold ${
                      targetReached ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    FS = {redesignResult.activeSafetyFactor.toFixed(2)} ({redesignResult.safetyStatusLabel})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
