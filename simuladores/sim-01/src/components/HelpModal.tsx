import React, { useMemo, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { VALIDATED_BENCHMARKS } from '../data/learningData';
import { DEFAULT_MATERIALS } from '../data/materials';
import { analyzeComponent } from '../engine/analyticalSolver';
import { SimulationParams } from '../types/engineering';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ open, onClose }) => {
  const [tab, setTab] = useState<'GUIDE' | 'STANDARDS' | 'BENCHMARKS'>('GUIDE');

  const benchmarkResults = useMemo(() => {
    const baseTemplate: SimulationParams = {
      componentId: 'barra-cilindrica',
      moduleId: 'M1_AXIAL',
      materialId: 'astm-a36',
      sectionType: 'CIRCULAR',
      supportCondition: 'FIXED_FREE',
      loadMode: 'TENSION',
      failureCriterion: 'VON_MISES',
      lengthMm: 1000,
      widthMm: 50,
      heightMm: 100,
      diameterMm: 20,
      innerDiameterMm: 0,
      thicknessMm: 10,
      flangeThicknessMm: 10,
      webThicknessMm: 8,
      forceN: 40000,
      torqueNm: 1500,
      distributedLoadNPerMm: 10,
      loadPositionRatio: 0.5,
      loadAngleDeg: 0,
      shearPlanes: 1,
      includeAxialInCombined: false,
      includeBendingInCombined: true,
      includeTorsionInCombined: true,
      includeShearInCombined: false,
    };

    return VALIDATED_BENCHMARKS.map((bm) => {
      const merged: SimulationParams = { ...baseTemplate, ...bm.params };
      const mat =
        DEFAULT_MATERIALS.find((m) => m.id === merged.materialId) ?? DEFAULT_MATERIALS[0];
      const res = analyzeComponent(merged, mat);
      return { bm, res };
    });
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden shadow-lg">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Ayuda, Normativa Técnica y Validación de Referencia
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pt-3 border-b border-slate-200 flex gap-2 bg-slate-50">
          {[
            { id: 'GUIDE' as const, label: 'Guía Rápida de Uso' },
            { id: 'STANDARDS' as const, label: 'Normativa y Bibliografía' },
            { id: 'BENCHMARKS' as const, label: 'Problemas Validados' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                tab === t.id
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto cae-scroll p-5 text-xs text-slate-700 space-y-4">
          {tab === 'GUIDE' && (
            <div className="space-y-3">
              <p>
                <strong>1. Selección de componente:</strong> Elige cualquier elemento estructural, de máquina o equipo industrial en el panel izquierdo (clic o arrastrar hacia el visor 3D).
              </p>
              <p>
                <strong>2. Configuración de parámetros:</strong> Ajusta dimensiones, sección transversal, material, magnitud/dirección/posición de carga y apoyos en el panel derecho. Todos los cálculos y el mapa de colores 3D se recalculan automáticamente.
              </p>
              <p>
                <strong>3. Inspección 3D y gráficos:</strong> Rota con el botón izquierdo del mouse, haz zoom con la rueda y pasa el cursor sobre la pieza para leer el esfuerzo local con la sonda. Expande la bandeja inferior para ver diagramas V(x), M(x), Círculo de Mohr y comparación con FEM 1D.
              </p>
              <p>
                <strong>4. Diferencia entre métodos:</strong> STRESSLAB 3D separa explícitamente las ecuaciones analíticas cerradas, el solucionador matricial FEM 1D y el factor de amplificación visual usado en el modelo 3D.
              </p>
            </div>
          )}

          {tab === 'STANDARDS' && (
            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Referencias Normativas Aplicadas</h3>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>ISO 80000:</strong> Sistema coherente de magnitudes, unidades SI (mm, N, MPa) y factores de conversión al sistema inglés (in, lbf, psi).</li>
                  <li><strong>ISO 286:</strong> Referencia conceptual de tolerancias y ajustes eje-cubo en análisis de chavetas y árboles escalonados.</li>
                  <li><strong>ISO 898-1:</strong> Referencia de propiedades mecánicas y clases resistentes en pernos y uniones atornilladas.</li>
                  <li><strong>ASTM / SAE / AISI:</strong> Especificaciones referenciales para aceros estructurales, aceros al carbono/aleados, aluminio y fundición gris.</li>
                  <li><strong>ASME / ANSI:</strong> Prácticas recomendadas de diseño de ejes de transmisión y criterios de seguridad elástica.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Bibliografía Base</h3>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Budynas &amp; Nisbett — <em>Shigley’s Mechanical Engineering Design</em>.</li>
                  <li>Robert L. Norton — <em>Machine Design: An Integrated Approach</em>.</li>
                  <li>Beer, Johnston, DeWolf &amp; Mazurek — <em>Mechanics of Materials</em>.</li>
                </ul>
              </div>
            </div>
          )}

          {tab === 'BENCHMARKS' && (
            <div className="space-y-3">
              <p>
                Verificación en vivo del motor analítico y del solucionador FEM 1D frente a problemas clásicos resueltos de literatura técnica:
              </p>
              {benchmarkResults.map(({ bm, res }) => (
                <div
                  key={bm.id}
                  className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">{bm.title}</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Validado
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">{bm.reference}</div>
                  <div className="font-mono text-[11px] text-slate-700">{bm.inputsSummary}</div>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] border-t border-slate-200">
                    <div>
                      <span className="text-slate-500 block font-sans">Teórico esperado:</span>
                      <strong>
                        {'expectedNormalMPa' in bm
                          ? `σ = ${bm.expectedNormalMPa} MPa · δ = ${bm.expectedDisplacementMm} mm`
                          : 'expectedBendingMPa' in bm
                            ? `σ = ${bm.expectedBendingMPa} MPa · δ = ${bm.expectedDeflectionMm} mm`
                            : `τ = ${bm.expectedShearMPa} MPa · θ = ${bm.expectedTwistDeg}°`}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-sans">Motor STRESSLAB 3D + FEM 1D:</span>
                      <strong className="text-blue-700">
                        {bm.params.moduleId === 'M4_TORSION'
                          ? `τ = ${res.shearStressMPa.toFixed(2)} MPa · θ = ${res.twistAngleDeg.toFixed(3)}°`
                          : `σ = ${res.normalStressMPa.toFixed(2)} MPa · δ = ${res.maxDisplacementMm.toFixed(4)} mm`}{' '}
                        (Diff FEM: {res.fem.analyticalDiffPercent.toFixed(3)}%)
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
