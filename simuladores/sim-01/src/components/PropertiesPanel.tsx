import React from 'react';
import {
  AnalysisModuleId,
  AnalysisResult,
  ComponentDefinition,
  CrossSectionType,
  FailureCriterion,
  LoadMode,
  MaterialSpec,
  SimulationParams,
  SupportCondition,
  UnitSystem,
} from '../types/engineering';
import {
  formatEng,
  fromDisplayDistLoad,
  fromDisplayForce,
  fromDisplayLength,
  fromDisplayTorque,
  toDisplayArea,
  toDisplayDistLoad,
  toDisplayForce,
  toDisplayInertia,
  toDisplayLength,
  toDisplayMass,
  toDisplayStress,
  toDisplayTorque,
  unitLabels,
} from '../engine/units';

interface PropertiesPanelProps {
  params: SimulationParams;
  component: ComponentDefinition;
  materials: MaterialSpec[];
  result: AnalysisResult;
  unitSystem: UnitSystem;
  onChangeParams: (patch: Partial<SimulationParams>) => void;
}

const MODULE_OPTIONS: { id: AnalysisModuleId; label: string }[] = [
  { id: 'M1_AXIAL', label: '01. Normal (Tracción / Compresión)' },
  { id: 'M2_SHEAR', label: '02. Esfuerzo Cortante' },
  { id: 'M3_BENDING', label: '03. Esfuerzo de Flexión' },
  { id: 'M4_TORSION', label: '04. Esfuerzo de Torsión' },
  { id: 'M5_COMBINED', label: '05. Esfuerzos Combinados' },
  { id: 'M6_SAFETY', label: '06. Factor de Seguridad y Falla' },
];

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  params,
  component,
  materials,
  result,
  unitSystem,
  onChangeParams,
}) => {
  const ul = unitLabels(unitSystem);
  const selectedMat = materials.find((m) => m.id === params.materialId) ?? materials[0];

  const lenMin = unitSystem === 'SI' ? 40 : 1.5;
  const lenMax = unitSystem === 'SI' ? 3000 : 120;
  const dimMin = unitSystem === 'SI' ? 6 : 0.25;
  const dimMax = unitSystem === 'SI' ? 300 : 12;

  const isCircular = params.sectionType === 'CIRCULAR' || params.sectionType === 'TUBULAR';
  const isTubular = params.sectionType === 'TUBULAR';
  const isIBeam = params.sectionType === 'I_BEAM';

  const restrictionsText =
    params.moduleId === 'M2_SHEAR'
      ? params.supportCondition === 'DOUBLE_SHEAR'
        ? 'UX=0, UY=0 en extremos de horquilla (2 planos de corte)'
        : 'UX=0, UY=0 en placa fija (1 plano de corte)'
      : params.supportCondition === 'FIXED_FREE' || params.moduleId === 'M1_AXIAL' || params.moduleId === 'M4_TORSION'
        ? 'Empotramiento en x=0 (UX=UY=UZ=RX=RY=RZ=0)'
        : params.supportCondition === 'FIXED_FIXED'
          ? 'Doble empotramiento en x=0 y x=L'
          : 'Apoyo fijo x=0 (UX=UY=0) · Rodillo x=L (UY=0)';

  return (
    <aside className="w-80 shrink-0 bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200">
        <h2 className="text-xs font-semibold text-slate-900 tracking-tight">
          Propiedades y Parámetros
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{component.name}</p>
      </div>

      <div className="flex-1 overflow-y-auto cae-scroll p-4 space-y-5 text-xs">
        {/* Module & Failure Criterion */}
        <section className="space-y-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Módulo de Análisis
            </label>
            <select
              value={params.moduleId}
              onChange={(e) => {
                const mod = e.target.value as AnalysisModuleId;
                const patch: Partial<SimulationParams> = { moduleId: mod };
                if (mod === 'M1_AXIAL') {
                  patch.loadMode = 'TENSION';
                  patch.supportCondition = 'FIXED_FREE';
                } else if (mod === 'M2_SHEAR') {
                  patch.supportCondition = params.shearPlanes === 2 ? 'DOUBLE_SHEAR' : 'SINGLE_SHEAR';
                  patch.loadMode = 'POINT_LOAD';
                } else if (mod === 'M3_BENDING') {
                  if (params.loadMode === 'TENSION' || params.loadMode === 'COMPRESSION' || params.loadMode === 'TORQUE_CW' || params.loadMode === 'TORQUE_CCW') {
                    patch.loadMode = 'POINT_LOAD';
                  }
                  if (params.supportCondition === 'SINGLE_SHEAR' || params.supportCondition === 'DOUBLE_SHEAR') {
                    patch.supportCondition = 'PINNED_ROLLER';
                  }
                } else if (mod === 'M4_TORSION') {
                  patch.loadMode = 'TORQUE_CCW';
                  patch.supportCondition = 'FIXED_FREE';
                  if (params.sectionType === 'I_BEAM') patch.sectionType = 'CIRCULAR';
                } else {
                  if (params.loadMode === 'TENSION' || params.loadMode === 'COMPRESSION' || params.loadMode === 'TORQUE_CW' || params.loadMode === 'TORQUE_CCW') {
                    patch.loadMode = 'POINT_LOAD';
                  }
                  if (params.supportCondition === 'SINGLE_SHEAR' || params.supportCondition === 'DOUBLE_SHEAR') {
                    patch.supportCondition = 'PINNED_ROLLER';
                  }
                }
                onChangeParams(patch);
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 font-medium focus:outline-none focus:border-blue-500"
            >
              {MODULE_OPTIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Material (Biblioteca Referencial)
            </label>
            <select
              value={params.materialId}
              onChange={(e) => onChangeParams({ materialId: e.target.value })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-500"
            >
              {materials.map((mat) => (
                <option key={mat.id} value={mat.id}>
                  {mat.name} (Sy = {formatEng(toDisplayStress(mat.yieldStrengthMPa, unitSystem), 0)} {ul.stress})
                </option>
              ))}
            </select>
            <div className="mt-1 text-[11px] text-slate-500 font-mono tabular-nums">
              E = {formatEng(toDisplayStress(selectedMat.elasticModulusMPa, unitSystem), 0)} {ul.stress} · ν = {selectedMat.poissonRatio}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Criterio de Falla
            </label>
            <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 rounded border border-slate-200">
              {(['VON_MISES', 'TRESCA'] as FailureCriterion[]).map((crit) => (
                <button
                  key={crit}
                  type="button"
                  onClick={() => onChangeParams({ failureCriterion: crit })}
                  className={`py-1 px-2 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                    params.failureCriterion === crit
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {crit === 'VON_MISES' ? 'Von Mises' : 'Tresca (τ max)'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Geometry & Section */}
        <section className="pt-3 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-semibold text-slate-800">Geometría y Sección</h3>
          </div>

          <div>
            <label className="block text-[11px] text-slate-600 mb-1">Perfil Transversal</label>
            <select
              value={params.sectionType}
              onChange={(e) => onChangeParams({ sectionType: e.target.value as CrossSectionType })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-500"
            >
              <option value="CIRCULAR">Circular maciza</option>
              <option value="TUBULAR">Tubular hueca</option>
              <option value="RECTANGULAR">Rectangular</option>
              <option value="I_BEAM">Perfil estructural I</option>
            </select>
          </div>

          {/* Length */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-[11px] text-slate-600">Longitud (L)</label>
              <span className="font-mono tabular-nums font-medium text-slate-900">
                {formatEng(toDisplayLength(params.lengthMm, unitSystem), 1)} {ul.length}
              </span>
            </div>
            <input
              type="range"
              min={lenMin}
              max={lenMax}
              step={unitSystem === 'SI' ? 10 : 0.5}
              value={toDisplayLength(params.lengthMm, unitSystem)}
              onChange={(e) =>
                onChangeParams({ lengthMm: fromDisplayLength(Number(e.target.value), unitSystem) })
              }
              className="w-full cae-slider"
            />
          </div>

          {isCircular ? (
            <>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[11px] text-slate-600">
                    {isTubular ? 'Diámetro exterior (D)' : 'Diámetro (d)'}
                  </label>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    {formatEng(toDisplayLength(params.diameterMm, unitSystem), 1)} {ul.length}
                  </span>
                </div>
                <input
                  type="range"
                  min={dimMin}
                  max={dimMax}
                  step={unitSystem === 'SI' ? 1 : 0.1}
                  value={toDisplayLength(params.diameterMm, unitSystem)}
                  onChange={(e) =>
                    onChangeParams({
                      diameterMm: fromDisplayLength(Number(e.target.value), unitSystem),
                    })
                  }
                  className="w-full cae-slider"
                />
              </div>

              {isTubular && (
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-[11px] text-slate-600">Diámetro interior (d_i)</label>
                    <span className="font-mono tabular-nums font-medium text-slate-900">
                      {formatEng(toDisplayLength(params.innerDiameterMm, unitSystem), 1)} {ul.length}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={unitSystem === 'SI' ? 4 : 0.15}
                    max={Math.max(
                      unitSystem === 'SI' ? 6 : 0.25,
                      toDisplayLength(params.diameterMm - 2, unitSystem),
                    )}
                    step={unitSystem === 'SI' ? 1 : 0.1}
                    value={toDisplayLength(
                      Math.min(params.innerDiameterMm, params.diameterMm - 2),
                      unitSystem,
                    )}
                    onChange={(e) =>
                      onChangeParams({
                        innerDiameterMm: fromDisplayLength(Number(e.target.value), unitSystem),
                      })
                    }
                    className="w-full cae-slider"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[11px] text-slate-600">Ancho (b)</label>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    {formatEng(toDisplayLength(params.widthMm, unitSystem), 1)} {ul.length}
                  </span>
                </div>
                <input
                  type="range"
                  min={dimMin}
                  max={dimMax}
                  step={unitSystem === 'SI' ? 1 : 0.1}
                  value={toDisplayLength(params.widthMm, unitSystem)}
                  onChange={(e) =>
                    onChangeParams({
                      widthMm: fromDisplayLength(Number(e.target.value), unitSystem),
                    })
                  }
                  className="w-full cae-slider"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[11px] text-slate-600">Altura / Peralte (h)</label>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    {formatEng(toDisplayLength(params.heightMm, unitSystem), 1)} {ul.length}
                  </span>
                </div>
                <input
                  type="range"
                  min={dimMin}
                  max={dimMax}
                  step={unitSystem === 'SI' ? 1 : 0.1}
                  value={toDisplayLength(params.heightMm, unitSystem)}
                  onChange={(e) =>
                    onChangeParams({
                      heightMm: fromDisplayLength(Number(e.target.value), unitSystem),
                    })
                  }
                  className="w-full cae-slider"
                />
              </div>

              {isIBeam && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">
                      Esp. ala ({ul.length})
                    </label>
                    <input
                      type="number"
                      min={unitSystem === 'SI' ? 3 : 0.1}
                      max={unitSystem === 'SI' ? 40 : 1.5}
                      step={unitSystem === 'SI' ? 1 : 0.05}
                      value={Number(toDisplayLength(params.flangeThicknessMm, unitSystem).toFixed(2))}
                      onChange={(e) =>
                        onChangeParams({
                          flangeThicknessMm: fromDisplayLength(Number(e.target.value) || 4, unitSystem),
                        })
                      }
                      className="w-full px-2 py-1 text-xs font-mono tabular-nums border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">
                      Esp. alma ({ul.length})
                    </label>
                    <input
                      type="number"
                      min={unitSystem === 'SI' ? 3 : 0.1}
                      max={unitSystem === 'SI' ? 30 : 1.2}
                      step={unitSystem === 'SI' ? 1 : 0.05}
                      value={Number(toDisplayLength(params.webThicknessMm, unitSystem).toFixed(2))}
                      onChange={(e) =>
                        onChangeParams({
                          webThicknessMm: fromDisplayLength(Number(e.target.value) || 4, unitSystem),
                        })
                      }
                      className="w-full px-2 py-1 text-xs font-mono tabular-nums border border-slate-300 rounded"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Live Section Properties Readout */}
          <div className="bg-slate-50 border border-slate-200 rounded p-2.5 grid grid-cols-2 gap-y-1.5 gap-x-2 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px]">Área transversal A</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {formatEng(toDisplayArea(result.section.areaMm2, unitSystem), 1)} {ul.area}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Momento Inercia Iz</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {formatEng(toDisplayInertia(result.section.inertiaZMm4, unitSystem), 0)} {ul.inertia}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Inercia Polar J</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {formatEng(toDisplayInertia(result.section.polarInertiaJmm4, unitSystem), 0)} {ul.inertia}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Masa estimada</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {formatEng(toDisplayMass(result.section.massKg, unitSystem), 2)} {ul.mass}
              </span>
            </div>
          </div>
        </section>

        {/* Loads & Boundary Conditions */}
        <section className="pt-3 border-t border-slate-200 space-y-3">
          <h3 className="text-[11px] font-semibold text-slate-800">
            Cargas y Condiciones de Apoyo
          </h3>

          {params.moduleId === 'M1_AXIAL' && (
            <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 rounded border border-slate-200">
              {(['TENSION', 'COMPRESSION'] as LoadMode[]).map((lm) => (
                <button
                  key={lm}
                  type="button"
                  onClick={() => onChangeParams({ loadMode: lm })}
                  className={`py-1 px-2 text-[11px] font-medium rounded cursor-pointer ${
                    params.loadMode === lm
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600'
                  }`}
                >
                  {lm === 'TENSION' ? 'Tracción (+)' : 'Compresión (-)'}
                </button>
              ))}
            </div>
          )}

          {params.moduleId === 'M2_SHEAR' && (
            <>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Planos de Corte</label>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 rounded border border-slate-200">
                  {[
                    { planes: 1 as const, sup: 'SINGLE_SHEAR' as SupportCondition, label: 'Cortante Simple (1)' },
                    { planes: 2 as const, sup: 'DOUBLE_SHEAR' as SupportCondition, label: 'Cortante Doble (2)' },
                  ].map((opt) => (
                    <button
                      key={opt.planes}
                      type="button"
                      onClick={() =>
                        onChangeParams({ shearPlanes: opt.planes, supportCondition: opt.sup })
                      }
                      className={`py-1 px-1.5 text-[11px] font-medium rounded cursor-pointer ${
                        params.shearPlanes === opt.planes
                          ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                          : 'text-slate-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[11px] text-slate-600">Espesor placa contacto (t)</label>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    {formatEng(toDisplayLength(params.thicknessMm, unitSystem), 1)} {ul.length}
                  </span>
                </div>
                <input
                  type="range"
                  min={unitSystem === 'SI' ? 4 : 0.15}
                  max={unitSystem === 'SI' ? 60 : 2.5}
                  step={unitSystem === 'SI' ? 1 : 0.1}
                  value={toDisplayLength(params.thicknessMm, unitSystem)}
                  onChange={(e) =>
                    onChangeParams({
                      thicknessMm: fromDisplayLength(Number(e.target.value), unitSystem),
                    })
                  }
                  className="w-full cae-slider"
                />
              </div>
            </>
          )}

          {(params.moduleId === 'M3_BENDING' ||
            params.moduleId === 'M5_COMBINED' ||
            params.moduleId === 'M6_SAFETY') && (
            <>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Condición de Apoyo</label>
                <select
                  value={params.supportCondition}
                  onChange={(e) =>
                    onChangeParams({ supportCondition: e.target.value as SupportCondition })
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900"
                >
                  <option value="PINNED_ROLLER">Simplemente apoyada (Articulado-Rodillo)</option>
                  <option value="FIXED_FREE">Voladizo (Empotrado-Libre)</option>
                  <option value="FIXED_FIXED">Doblemente empotrada</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">Distribución de Carga</label>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 rounded border border-slate-200">
                  {(['POINT_LOAD', 'DISTRIBUTED_LOAD'] as LoadMode[]).map((lm) => (
                    <button
                      key={lm}
                      type="button"
                      onClick={() => onChangeParams({ loadMode: lm })}
                      className={`py-1 px-2 text-[11px] font-medium rounded cursor-pointer ${
                        params.loadMode === lm
                          ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                          : 'text-slate-600'
                      }`}
                    >
                      {lm === 'POINT_LOAD' ? 'Carga Puntual' : 'Distribuida'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {params.moduleId === 'M4_TORSION' && (
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Sentido de Giro</label>
              <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 rounded border border-slate-200">
                {(['TORQUE_CCW', 'TORQUE_CW'] as LoadMode[]).map((lm) => (
                  <button
                    key={lm}
                    type="button"
                    onClick={() => onChangeParams({ loadMode: lm })}
                    className={`py-1 px-2 text-[11px] font-medium rounded cursor-pointer ${
                      params.loadMode === lm
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                        : 'text-slate-600'
                    }`}
                  >
                    {lm === 'TORQUE_CCW' ? 'Antihorario (+T)' : 'Horario (-T)'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Force / Distributed Load / Torque inputs */}
          {params.moduleId !== 'M4_TORSION' && params.loadMode !== 'DISTRIBUTED_LOAD' && (
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[11px] text-slate-600">Magnitud de Fuerza (F)</label>
                <span className="font-mono tabular-nums font-medium text-slate-900">
                  {formatEng(toDisplayForce(params.forceN, unitSystem), 0)} {ul.force}
                </span>
              </div>
              <input
                type="range"
                min={unitSystem === 'SI' ? 500 : 100}
                max={unitSystem === 'SI' ? 120000 : 27000}
                step={unitSystem === 'SI' ? 500 : 100}
                value={toDisplayForce(params.forceN, unitSystem)}
                onChange={(e) =>
                  onChangeParams({ forceN: fromDisplayForce(Number(e.target.value), unitSystem) })
                }
                className="w-full cae-slider"
              />
            </div>
          )}

          {params.loadMode === 'DISTRIBUTED_LOAD' &&
            (params.moduleId === 'M3_BENDING' ||
              params.moduleId === 'M5_COMBINED' ||
              params.moduleId === 'M6_SAFETY') && (
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[11px] text-slate-600">Carga Distribuida (w)</label>
                  <span className="font-mono tabular-nums font-medium text-slate-900">
                    {formatEng(toDisplayDistLoad(params.distributedLoadNPerMm, unitSystem), 1)}{' '}
                    {ul.distLoad}
                  </span>
                </div>
                <input
                  type="range"
                  min={unitSystem === 'SI' ? 1 : 5}
                  max={unitSystem === 'SI' ? 100 : 570}
                  step={unitSystem === 'SI' ? 1 : 5}
                  value={toDisplayDistLoad(params.distributedLoadNPerMm, unitSystem)}
                  onChange={(e) =>
                    onChangeParams({
                      distributedLoadNPerMm: fromDisplayDistLoad(
                        Number(e.target.value),
                        unitSystem,
                      ),
                    })
                  }
                  className="w-full cae-slider"
                />
              </div>
            )}

          {params.loadMode === 'POINT_LOAD' &&
            (params.moduleId === 'M3_BENDING' ||
              params.moduleId === 'M5_COMBINED' ||
              params.moduleId === 'M6_SAFETY') && (
              <>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-[11px] text-slate-600">Ubicación de Carga (a/L)</label>
                    <span className="font-mono tabular-nums font-medium text-slate-900">
                      {(params.loadPositionRatio * 100).toFixed(0)}% (
                      {formatEng(
                        toDisplayLength(params.loadPositionRatio * params.lengthMm, unitSystem),
                        0,
                      )}{' '}
                      {ul.length})
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={0.95}
                    step={0.05}
                    value={params.loadPositionRatio}
                    onChange={(e) =>
                      onChangeParams({ loadPositionRatio: Number(e.target.value) })
                    }
                    className="w-full cae-slider"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-[11px] text-slate-600">Dirección de Carga (°)</label>
                    <span className="font-mono tabular-nums font-medium text-slate-900">
                      {params.loadAngleDeg}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-45}
                    max={45}
                    step={5}
                    value={params.loadAngleDeg}
                    onChange={(e) => onChangeParams({ loadAngleDeg: Number(e.target.value) })}
                    className="w-full cae-slider"
                  />
                </div>
              </>
            )}

          {(params.moduleId === 'M4_TORSION' ||
            ((params.moduleId === 'M5_COMBINED' || params.moduleId === 'M6_SAFETY') &&
              params.includeTorsionInCombined)) && (
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[11px] text-slate-600">Torque Aplicado (T)</label>
                <span className="font-mono tabular-nums font-medium text-slate-900">
                  {formatEng(toDisplayTorque(params.torqueNm, unitSystem), 0)} {ul.torque}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={unitSystem === 'SI' ? 6000 : 53000}
                step={unitSystem === 'SI' ? 50 : 250}
                value={toDisplayTorque(params.torqueNm, unitSystem)}
                onChange={(e) =>
                  onChangeParams({
                    torqueNm: fromDisplayTorque(Number(e.target.value), unitSystem),
                  })
                }
                className="w-full cae-slider"
              />
            </div>
          )}

          {(params.moduleId === 'M5_COMBINED' || params.moduleId === 'M6_SAFETY') && (
            <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-700">
                Solicitaciones Activas
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={params.includeAxialInCombined}
                    onChange={(e) =>
                      onChangeParams({ includeAxialInCombined: e.target.checked })
                    }
                  />
                  <span>Carga Axial</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={params.includeBendingInCombined}
                    onChange={(e) =>
                      onChangeParams({ includeBendingInCombined: e.target.checked })
                    }
                  />
                  <span>Flexión</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={params.includeTorsionInCombined}
                    onChange={(e) =>
                      onChangeParams({ includeTorsionInCombined: e.target.checked })
                    }
                  />
                  <span>Torsión</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={params.includeShearInCombined}
                    onChange={(e) =>
                      onChangeParams({ includeShearInCombined: e.target.checked })
                    }
                  />
                  <span>Cortante</span>
                </label>
              </div>
            </div>
          )}

          {/* Motion Restrictions Summary */}
          <div className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 rounded p-2">
            <span className="font-semibold text-slate-800 block">Restricciones de movimiento:</span>
            <span>{restrictionsText}</span>
          </div>

          {result.warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded p-2 text-[11px] text-amber-900 space-y-1">
              {result.warnings.map((w, idx) => (
                <div key={idx}>{w}</div>
              ))}
            </div>
          )}
        </section>
      </div>
    </aside>
  );
};
