import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  Grid,
  Layers,
  Pause,
  Play,
  Sun,
  XOctagon,
} from 'lucide-react';
import {
  AnalysisResult,
  CameraPreset,
  MaterialSpec,
  SimulationParams,
  StressFieldView,
  UnitSystem,
  ViewportOptions,
} from '../types/engineering';
import {
  formatEng,
  toDisplayForce,
  toDisplayLength,
  toDisplayStress,
  toDisplayTorque,
  unitLabels,
} from '../engine/units';
import { ChartsPanel } from './ChartsPanel';

interface ResultsSummaryBarProps {
  params: SimulationParams;
  material: MaterialSpec;
  materials: MaterialSpec[];
  result: AnalysisResult;
  unitSystem: UnitSystem;
  viewportOptions: ViewportOptions;
  onChangeViewport: (patch: Partial<ViewportOptions>) => void;
}

type DrawerTab = 'DIAGRAMS' | 'MOHR' | 'COMPARISON' | 'MATH_FEM' | 'INTERPRETATION';

export const ResultsSummaryBar: React.FC<ResultsSummaryBarProps> = ({
  params,
  material,
  materials,
  result,
  unitSystem,
  viewportOptions,
  onChangeViewport,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DrawerTab>('DIAGRAMS');

  const ul = unitLabels(unitSystem);

  const statusBadge =
    result.safetyStatus === 'SAFE'
      ? {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
          textClass: 'text-emerald-700',
          bgClass: 'bg-emerald-50 border-emerald-200',
        }
      : result.safetyStatus === 'REVIEW'
        ? {
            icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
            textClass: 'text-amber-800',
            bgClass: 'bg-amber-50 border-amber-200',
          }
        : {
            icon: <XOctagon className="w-4 h-4 text-red-600 shrink-0" />,
            textClass: 'text-red-700',
            bgClass: 'bg-red-50 border-red-200',
          };

  return (
    <div className="bg-white border-t border-slate-200 flex flex-col shrink-0">
      {/* 3D Viewport Controls Ribbon */}
      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        {/* Camera Views */}
        <div className="flex items-center gap-1">
          <span className="text-slate-500 mr-1 hidden sm:inline">Vistas:</span>
          {(['ISO', 'FRONT', 'SIDE', 'TOP'] as CameraPreset[]).map((cam) => (
            <button
              key={cam}
              type="button"
              onClick={() => onChangeViewport({ cameraPreset: cam })}
              className={`px-2 py-0.5 rounded border font-medium transition-colors cursor-pointer whitespace-nowrap ${
                viewportOptions.cameraPreset === cam
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cam === 'ISO'
                ? 'Isométrica'
                : cam === 'FRONT'
                  ? 'Frontal'
                  : cam === 'SIDE'
                    ? 'Lateral'
                    : 'Superior'}
            </button>
          ))}
        </div>

        {/* Layer Visibility Toggles */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={() =>
              onChangeViewport({ showOriginalGhost: !viewportOptions.showOriginalGhost })
            }
            className={`px-2 py-0.5 rounded border cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              viewportOptions.showOriginalGhost
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Original</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeViewport({ showDeformed: !viewportOptions.showDeformed })}
            className={`px-2 py-0.5 rounded border cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              viewportOptions.showDeformed
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Deformado</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeViewport({ showLoads: !viewportOptions.showLoads })}
            className={`px-2 py-0.5 rounded border cursor-pointer whitespace-nowrap ${
              viewportOptions.showLoads
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            Cargas
          </button>
          <button
            type="button"
            onClick={() => onChangeViewport({ showSupports: !viewportOptions.showSupports })}
            className={`px-2 py-0.5 rounded border cursor-pointer whitespace-nowrap ${
              viewportOptions.showSupports
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            Apoyos
          </button>
          <button
            type="button"
            onClick={() => onChangeViewport({ showMesh: !viewportOptions.showMesh })}
            className={`px-2 py-0.5 rounded border cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              viewportOptions.showMesh
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            <Grid className="w-3 h-3" />
            <span>Malla</span>
          </button>
        </div>

        {/* Stress Field, Animation & Amplification */}
        <div className="flex items-center gap-2">
          <select
            value={viewportOptions.stressField}
            onChange={(e) =>
              onChangeViewport({ stressField: e.target.value as StressFieldView })
            }
            aria-label="Campo escalar visualizado"
            className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-800 text-[11px]"
          >
            <option value="VON_MISES">Mapa: Von Mises</option>
            <option value="NORMAL">Mapa: Esfuerzo Normal</option>
            <option value="SHEAR">Mapa: Esfuerzo Cortante</option>
            <option value="DISPLACEMENT">Mapa: Desplazamientos</option>
          </select>

          <button
            type="button"
            onClick={() =>
              onChangeViewport({ animateDeformation: !viewportOptions.animateDeformation })
            }
            className={`px-2 py-0.5 rounded border flex items-center gap-1 cursor-pointer whitespace-nowrap ${
              viewportOptions.animateDeformation
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            {viewportOptions.animateDeformation ? (
              <Pause className="w-3 h-3" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            <span>Animar</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 hidden md:inline">Escala def.:</span>
            <input
              type="range"
              min={1}
              max={200}
              step={5}
              value={viewportOptions.amplificationFactor}
              onChange={(e) =>
                onChangeViewport({ amplificationFactor: Number(e.target.value) })
              }
              className="w-16 cae-slider"
              aria-label="Factor de amplificación visual de deformación"
            />
            <span className="font-mono tabular-nums w-8 text-right">
              {viewportOptions.amplificationFactor}×
            </span>
          </div>

          <button
            type="button"
            onClick={() => onChangeViewport({ darkViewport: !viewportOptions.darkViewport })}
            title="Alternar fondo del visor 3D"
            className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Engineering KPIs & Safety Classification */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-5 text-xs">
          <div>
            <span className="block text-[10px] text-slate-500">
              {params.failureCriterion === 'TRESCA'
                ? 'Esfuerzo Tresca'
                : 'Esfuerzo Von Mises'}
            </span>
            <span className="font-mono tabular-nums text-sm font-bold text-slate-900">
              {formatEng(toDisplayStress(result.equivalentStressMPa, unitSystem), 2)}{' '}
              <span className="text-[11px] font-normal text-slate-500">{ul.stress}</span>
            </span>
          </div>

          <div>
            <span className="block text-[10px] text-slate-500">
              Normal (σ) / Cortante (τ)
            </span>
            <span className="font-mono tabular-nums text-sm font-semibold text-slate-800">
              {formatEng(toDisplayStress(result.normalStressMPa, unitSystem), 1)} /{' '}
              {formatEng(toDisplayStress(result.shearStressMPa, unitSystem), 1)}{' '}
              <span className="text-[11px] font-normal text-slate-500">{ul.stress}</span>
            </span>
          </div>

          <div>
            <span className="block text-[10px] text-slate-500">
              {params.moduleId === 'M4_TORSION'
                ? 'Ángulo de Torsión (θ)'
                : 'Deformación Máxima (δ)'}
            </span>
            <span className="font-mono tabular-nums text-sm font-semibold text-slate-800">
              {params.moduleId === 'M4_TORSION'
                ? `${result.twistAngleDeg.toFixed(3)}°`
                : `${formatEng(toDisplayLength(result.maxDisplacementMm, unitSystem), 4)} ${ul.length}`}
            </span>
          </div>

          <div>
            <span className="block text-[10px] text-slate-500">
              Límite Fluencia ({material.name})
            </span>
            <span className="font-mono tabular-nums text-sm font-semibold text-slate-800">
              {formatEng(toDisplayStress(material.yieldStrengthMPa, unitSystem), 0)} {ul.stress}
            </span>
          </div>

          <div
            className={`px-3 py-1.5 rounded border flex items-center gap-2 ${statusBadge.bgClass}`}
          >
            {statusBadge.icon}
            <div>
              <div className="font-mono tabular-nums text-xs font-bold text-slate-900">
                FS = {result.activeSafetyFactor > 50 ? '> 50' : result.activeSafetyFactor.toFixed(2)}
              </div>
              <div className={`text-[11px] font-medium ${statusBadge.textClass}`}>
                {result.safetyStatusLabel}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDrawerOpen((v) => !v)}
          className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <span>{drawerOpen ? 'Ocultar Análisis y Gráficos' : 'Ver Gráficos, Mohr y FEM 1D'}</span>
          {drawerOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Engineering Analysis Drawer */}
      {drawerOpen && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded">
              {[
                { id: 'DIAGRAMS' as const, label: 'Diagramas (V, M, τ, δ)' },
                { id: 'MOHR' as const, label: 'Círculo de Mohr' },
                { id: 'COMPARISON' as const, label: 'Comparar Materiales' },
                { id: 'MATH_FEM' as const, label: 'Analítico vs. FEM 1D' },
                { id: 'INTERPRETATION' as const, label: 'Interpretación Técnica' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === t.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-slate-500">
              Ubicación esfuerzo máx.: <strong className="text-slate-700">{result.maxStressLocationLabel}</strong>
            </span>
          </div>

          {(activeTab === 'DIAGRAMS' || activeTab === 'MOHR' || activeTab === 'COMPARISON') && (
            <ChartsPanel
              params={params}
              result={result}
              materials={materials}
              unitSystem={unitSystem}
              mode={activeTab}
            />
          )}

          {activeTab === 'MATH_FEM' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Analytical Steps */}
              <div className="bg-white border border-slate-200 rounded p-3">
                <h4 className="text-xs font-semibold text-slate-900 mb-2">
                  A. Resultados Analíticos (Ecuaciones Clásicas)
                </h4>
                <div className="space-y-2 text-xs">
                  {result.steps.map((st, idx) => (
                    <div
                      key={idx}
                      className="pb-2 border-b border-slate-100 last:border-none last:pb-0"
                    >
                      <div className="font-medium text-slate-800">{st.label}</div>
                      <div className="font-mono text-[11px] text-blue-700 mt-0.5">{st.formula}</div>
                      <div className="flex justify-between items-baseline text-[11px] text-slate-600 font-mono mt-0.5">
                        <span>{st.substitution}</span>
                        <span className="font-semibold text-slate-900">{st.result}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simplified 1D FEM Comparison */}
              <div className="bg-white border border-slate-200 rounded p-3 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 mb-1">
                    B. Resultados Numéricos FEM Simplificado
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-2.5">
                    {result.fem.methodLabel} · {result.fem.elementType}
                  </p>

                  {result.fem.available ? (
                    <div className="grid grid-cols-2 gap-2.5 text-xs bg-slate-50 border border-slate-200 rounded p-2.5 font-mono tabular-nums">
                      <div>
                        <span className="text-[10px] font-sans text-slate-500 block">
                          Malla Discretizada
                        </span>
                        <span className="font-semibold text-slate-900">
                          {result.fem.numElements} elem. / {result.fem.numNodes} nodos ({result.fem.totalDofs} GDL)
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-sans text-slate-500 block">
                          Diferencia FEM vs. Analítico
                        </span>
                        <span className="font-semibold text-emerald-700">
                          {result.fem.analyticalDiffPercent.toFixed(3)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-sans text-slate-500 block">
                          {params.moduleId === 'M4_TORSION'
                            ? 'Ángulo Máx. FEM'
                            : 'Desplazamiento Máx. FEM'}
                        </span>
                        <span className="font-semibold text-slate-900">
                          {params.moduleId === 'M4_TORSION'
                            ? `${result.fem.maxDisplacementMm.toFixed(3)}°`
                            : `${formatEng(toDisplayLength(result.fem.maxDisplacementMm, unitSystem), 4)} ${ul.length}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-sans text-slate-500 block">
                          Esfuerzo Máx. Nodal FEM
                        </span>
                        <span className="font-semibold text-slate-900">
                          {formatEng(toDisplayStress(result.fem.maxStressMPa, unitSystem), 2)} {ul.stress}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs bg-slate-50 border border-slate-200 rounded p-3 text-slate-600">
                      {result.fem.stiffnessMatrixNote}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <strong>C. Visualización Didáctica:</strong> La deformación en 3D está amplificada{' '}
                  {viewportOptions.amplificationFactor}× para facilitar la inspección geométrica; los valores numéricos corresponden al modelo real sin amplificación.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'INTERPRETATION' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded p-3 space-y-2">
                <h4 className="font-semibold text-slate-900">
                  Evaluación e Interpretación de Ingeniería
                </h4>
                <p className="text-slate-700 leading-relaxed">{result.engineeringInterpretation}</p>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 font-mono tabular-nums text-[11px]">
                  <div>
                    <span className="text-slate-500 font-sans block">Reacción Apoyo A</span>
                    <span className="font-semibold text-slate-900">
                      {formatEng(toDisplayForce(result.reactionAN, unitSystem), 0)} {ul.force}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans block">Reacción Apoyo B</span>
                    <span className="font-semibold text-slate-900">
                      {formatEng(toDisplayForce(result.reactionBN, unitSystem), 0)} {ul.force}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans block">Momento Máx. M_max</span>
                    <span className="font-semibold text-slate-900">
                      {formatEng(toDisplayTorque(result.maxBendingMomentNm, unitSystem), 1)} {ul.torque}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded p-3 space-y-2">
                <h4 className="font-semibold text-slate-900">Alcance y Normativa</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Cálculos basados en mecánica de materiales clásica (Shigley, Beer &amp; Johnston, Norton) bajo régimen elástico lineal e isotrópico.
                </p>
                <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded p-2">
                  Nota técnica: Esta herramienta educativa no constituye una certificación oficial de seguridad estructural ni reemplaza un análisis detallado de fatiga, pandeo o normas constructivas vigentes.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
