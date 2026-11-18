import React from 'react';
import { ArrowRight } from 'lucide-react';
import { AnalysisModuleId, SimulationParams } from '../types/engineering';

interface ModulesOverviewViewProps {
  activeModuleId: AnalysisModuleId;
  onActivateModule: (moduleId: AnalysisModuleId, preset: Partial<SimulationParams>) => void;
}

const MODULES_CARDS: {
  id: AnalysisModuleId;
  number: string;
  title: string;
  equation: string;
  summary: string;
  outputs: string[];
  preset: Partial<SimulationParams>;
}[] = [
  {
    id: 'M1_AXIAL',
    number: 'Módulo 01',
    title: 'Esfuerzo Normal por Tracción y Compresión',
    equation: 'σ = F / A   ·   δ = (F · L) / (E · A)',
    summary:
      'Analiza barras prismáticas sometidas a fuerzas axiales de estiramiento o aplastamiento, evaluando la deformación unitaria y el efecto de Poisson.',
    outputs: ['Esfuerzo normal σ', 'Área transversal A', 'Alargamiento / acortamiento δ', 'Deformación unitaria ε'],
    preset: {
      componentId: 'barra-cilindrica',
      moduleId: 'M1_AXIAL',
      sectionType: 'CIRCULAR',
      supportCondition: 'FIXED_FREE',
      loadMode: 'TENSION',
      diameterMm: 30,
      lengthMm: 600,
      forceN: 35000,
    },
  },
  {
    id: 'M2_SHEAR',
    number: 'Módulo 02',
    title: 'Esfuerzo Cortante Directo',
    equation: 'τ = F / (n · A_corte)   ·   σ_ap = F / (d · t)',
    summary:
      'Evalúa pernos en cortante simple o doble, pasadores de unión y chavetas de acoplamiento, calculando área resistente, cortante y aplastamiento.',
    outputs: ['Fuerza cortante V', 'Área resistente A_corte', 'Número de planos de corte (1 o 2)', 'Aplastamiento lateral'],
    preset: {
      componentId: 'perno-union',
      moduleId: 'M2_SHEAR',
      sectionType: 'CIRCULAR',
      supportCondition: 'DOUBLE_SHEAR',
      shearPlanes: 2,
      diameterMm: 16,
      lengthMm: 110,
      forceN: 36000,
    },
  },
  {
    id: 'M3_BENDING',
    number: 'Módulo 03',
    title: 'Esfuerzo de Flexión en Vigas',
    equation: 'σ = (M · y) / Iz',
    summary:
      'Modela vigas simplemente apoyadas, en voladizo y doblemente empotradas bajo carga puntual o distribuida con secciones rectangular, circular, tubular e I.',
    outputs: ['Diagramas V(x) y M(x)', 'Zonas de tracción y compresión', 'Línea neutra', 'Flecha máxima δ y FEM 1D'],
    preset: {
      componentId: 'viga',
      moduleId: 'M3_BENDING',
      sectionType: 'I_BEAM',
      supportCondition: 'PINNED_ROLLER',
      loadMode: 'POINT_LOAD',
      lengthMm: 1400,
      widthMm: 80,
      heightMm: 140,
      forceN: 28000,
      loadPositionRatio: 0.5,
    },
  },
  {
    id: 'M4_TORSION',
    number: 'Módulo 04',
    title: 'Esfuerzo de Torsión en Ejes',
    equation: 'τ = (T · r) / J   ·   θ = (T · L) / (G · J)',
    summary:
      'Simula ejes circulares macizos o tubulares sometidos a torque horario o antihorario con animación angular y perfil radial de esfuerzos.',
    outputs: ['Esfuerzo cortante máximo τ_max', 'Ángulo de torsión θ (°)', 'Rigidez torsional GJ/L', 'Distribución radial τ(r)'],
    preset: {
      componentId: 'eje-transmision',
      moduleId: 'M4_TORSION',
      sectionType: 'CIRCULAR',
      supportCondition: 'FIXED_FREE',
      loadMode: 'TORQUE_CCW',
      diameterMm: 45,
      lengthMm: 900,
      torqueNm: 1100,
    },
  },
  {
    id: 'M5_COMBINED',
    number: 'Módulo 05',
    title: 'Esfuerzos Combinados y Círculo de Mohr',
    equation: 'σ_1,2 = (σ_x/2) ± √[(σ_x/2)² + τ_xy²]',
    summary:
      'Integra solicitaciones simultáneas (tracción + flexión, flexión + torsión, cortante + flexión) para obtener esfuerzos principales y el Círculo de Mohr.',
    outputs: ['Esfuerzos principales σ₁, σ₂', 'Cortante máximo absoluto', 'Círculo de Mohr interactivo', 'Esfuerzo equivalente Von Mises'],
    preset: {
      componentId: 'arbol-escalonado',
      moduleId: 'M5_COMBINED',
      sectionType: 'CIRCULAR',
      supportCondition: 'PINNED_ROLLER',
      loadMode: 'POINT_LOAD',
      diameterMm: 48,
      lengthMm: 900,
      forceN: 12000,
      torqueNm: 1850,
      includeAxialInCombined: true,
      includeBendingInCombined: true,
      includeTorsionInCombined: true,
      includeShearInCombined: true,
    },
  },
  {
    id: 'M6_SAFETY',
    number: 'Módulo 06',
    title: 'Factor de Seguridad y Criterios de Falla',
    equation: 'σ_vm = √(σ² + 3τ²)   ·   σ_Tr = √(σ² + 4τ²)   ·   FS = Sy / σ_eq',
    summary:
      'Evalúa la integridad elástica comparando el criterio de energía de distorsión (Von Mises) y esfuerzo cortante máximo (Tresca) frente al límite elástico.',
    outputs: ['Criterio Von Mises vs. Tresca', 'Factor de seguridad FS', 'Clasificación de estado de diseño', 'Comparación entre materiales'],
    preset: {
      componentId: 'brazo-chancadora',
      moduleId: 'M6_SAFETY',
      sectionType: 'RECTANGULAR',
      supportCondition: 'FIXED_FREE',
      loadMode: 'POINT_LOAD',
      materialId: 'aisi-4140',
      lengthMm: 900,
      widthMm: 75,
      heightMm: 130,
      forceN: 65000,
    },
  },
];

export const ModulesOverviewView: React.FC<ModulesOverviewViewProps> = ({
  activeModuleId,
  onActivateModule,
}) => {
  return (
    <div className="flex-1 overflow-y-auto cae-scroll bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Módulos de Análisis Mecánico (M01 – M06)
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Selecciona cualquier módulo para abrirlo directamente en el Simulador 3D con su modelo, cargas y ecuaciones correspondientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES_CARDS.map((mod) => {
            const isCurrent = mod.id === activeModuleId;
            return (
              <div
                key={mod.id}
                className={`bg-white border rounded p-4 flex flex-col justify-between space-y-3 ${
                  isCurrent ? 'border-blue-600' : 'border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="text-[11px] font-mono font-semibold text-blue-700">
                    {mod.number}
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">{mod.title}</h2>
                  <div className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 font-mono text-[11px] text-slate-800">
                    {mod.equation}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{mod.summary}</p>
                  <ul className="text-[11px] text-slate-700 space-y-1 pt-1">
                    {mod.outputs.map((o, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="text-blue-600">·</span>
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => onActivateModule(mod.id, mod.preset)}
                  className="w-full py-2 px-3 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Abrir en Simulador 3D</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
