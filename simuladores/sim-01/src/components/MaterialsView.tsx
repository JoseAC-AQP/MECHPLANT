import React, { useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { MaterialSpec, UnitSystem } from '../types/engineering';
import {
  formatEng,
  fromDisplayStress,
  toDisplayDensity,
  toDisplayStress,
  unitLabels,
} from '../engine/units';

interface MaterialsViewProps {
  materials: MaterialSpec[];
  unitSystem: UnitSystem;
  selectedMaterialId: string;
  onUpdateMaterial: (updated: MaterialSpec) => void;
  onAddMaterial: (mat: MaterialSpec) => void;
  onResetMaterials: () => void;
  onSelectForSimulator: (materialId: string) => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  materials,
  unitSystem,
  selectedMaterialId,
  onUpdateMaterial,
  onAddMaterial,
  onResetMaterials,
  onSelectForSimulator,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newStandard, setNewStandard] = useState('Especificación personalizada');
  const [newSyMPa, setNewSyMPa] = useState('300');
  const [newEMPa, setNewEMPa] = useState('200000');

  const ul = unitLabels(unitSystem);

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const E = Math.max(500, Number(newEMPa) || 200000);
    const Sy = Math.max(10, Number(newSyMPa) || 300);
    const nu = 0.29;
    const G = Math.round(E / (2 * (1 + nu)));
    onAddMaterial({
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      standard: newStandard.trim() || 'Definido por usuario',
      condition: 'Condición personalizada',
      elasticModulusMPa: E,
      shearModulusMPa: G,
      poissonRatio: nu,
      yieldStrengthMPa: Sy,
      ultimateStrengthMPa: Math.round(Sy * 1.35),
      densityKgM3: 7850,
      colorHex: '#475569',
      notes: 'Material agregado por el usuario para ensayos comparativos en el laboratorio.',
      isCustom: true,
    });
    setNewName('');
  };

  return (
    <div className="flex-1 overflow-y-auto cae-scroll bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Biblioteca Editable de Materiales de Ingeniería
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Propiedades mecánicas referenciales con trazabilidad a normas ASTM, SAE/AISI e ISO. Haz clic en cualquier valor numérico para calibrarlo o crea una variante experimental.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetMaterials}
            className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar valores ASTM/SAE</span>
          </button>
        </div>

        {/* Material Table */}
        <div className="bg-white border border-slate-200 rounded overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                <th className="py-2.5 px-3 font-semibold">Material y Trazabilidad</th>
                <th className="py-2.5 px-3 font-semibold text-right">Módulo E ({ul.stress})</th>
                <th className="py-2.5 px-3 font-semibold text-right">Módulo G ({ul.stress})</th>
                <th className="py-2.5 px-3 font-semibold text-right">Poisson (ν)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Fluencia Sy ({ul.stress})</th>
                <th className="py-2.5 px-3 font-semibold text-right">Última Su ({ul.stress})</th>
                <th className="py-2.5 px-3 font-semibold text-right">Densidad ({ul.density})</th>
                <th className="py-2.5 px-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {materials.map((mat) => {
                const isEditing = editingId === mat.id;
                const isActive = selectedMaterialId === mat.id;
                return (
                  <tr
                    key={mat.id}
                    className={isActive ? 'bg-blue-50/60' : 'hover:bg-slate-50'}
                  >
                    <td className="py-2.5 px-3 max-w-xs">
                      <div className="font-semibold text-slate-900">{mat.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {mat.standard} · {mat.condition}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {isEditing ? (
                        <input
                          type="number"
                          value={Math.round(toDisplayStress(mat.elasticModulusMPa, unitSystem))}
                          onChange={(e) =>
                            onUpdateMaterial({
                              ...mat,
                              elasticModulusMPa: fromDisplayStress(
                                Number(e.target.value) || 1000,
                                unitSystem,
                              ),
                            })
                          }
                          className="w-24 px-1.5 py-0.5 text-right border border-blue-400 rounded bg-white"
                        />
                      ) : (
                        formatEng(toDisplayStress(mat.elasticModulusMPa, unitSystem), 0)
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {isEditing ? (
                        <input
                          type="number"
                          value={Math.round(toDisplayStress(mat.shearModulusMPa, unitSystem))}
                          onChange={(e) =>
                            onUpdateMaterial({
                              ...mat,
                              shearModulusMPa: fromDisplayStress(
                                Number(e.target.value) || 500,
                                unitSystem,
                              ),
                            })
                          }
                          className="w-24 px-1.5 py-0.5 text-right border border-blue-400 rounded bg-white"
                        />
                      ) : (
                        formatEng(toDisplayStress(mat.shearModulusMPa, unitSystem), 0)
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0.1"
                          max="0.49"
                          value={mat.poissonRatio}
                          onChange={(e) =>
                            onUpdateMaterial({
                              ...mat,
                              poissonRatio: Number(e.target.value) || 0.29,
                            })
                          }
                          className="w-16 px-1.5 py-0.5 text-right border border-blue-400 rounded bg-white"
                        />
                      ) : (
                        mat.poissonRatio.toFixed(2)
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {isEditing ? (
                        <input
                          type="number"
                          value={Math.round(toDisplayStress(mat.yieldStrengthMPa, unitSystem))}
                          onChange={(e) =>
                            onUpdateMaterial({
                              ...mat,
                              yieldStrengthMPa: fromDisplayStress(
                                Number(e.target.value) || 50,
                                unitSystem,
                              ),
                            })
                          }
                          className="w-20 px-1.5 py-0.5 text-right border border-blue-400 rounded bg-white"
                        />
                      ) : (
                        formatEng(toDisplayStress(mat.yieldStrengthMPa, unitSystem), 0)
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {isEditing ? (
                        <input
                          type="number"
                          value={Math.round(toDisplayStress(mat.ultimateStrengthMPa, unitSystem))}
                          onChange={(e) =>
                            onUpdateMaterial({
                              ...mat,
                              ultimateStrengthMPa: fromDisplayStress(
                                Number(e.target.value) || 80,
                                unitSystem,
                              ),
                            })
                          }
                          className="w-20 px-1.5 py-0.5 text-right border border-blue-400 rounded bg-white"
                        />
                      ) : (
                        formatEng(toDisplayStress(mat.ultimateStrengthMPa, unitSystem), 0)
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      {formatEng(
                        toDisplayDensity(mat.densityKgM3, unitSystem),
                        unitSystem === 'SI' ? 0 : 3,
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingId(isEditing ? null : mat.id)}
                        className="px-2 py-1 text-[11px] font-medium border border-slate-300 rounded bg-white hover:bg-slate-100 cursor-pointer"
                      >
                        {isEditing ? 'Listo' : 'Editar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onSelectForSimulator(mat.id)}
                        className="px-2 py-1 text-[11px] font-medium rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                      >
                        Aplicar en 3D
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add Custom Material Form */}
        <form
          onSubmit={handleCreateCustom}
          className="bg-white border border-slate-200 rounded p-4 flex flex-wrap items-end gap-3 text-xs"
        >
          <div className="flex-1 min-w-48">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Nuevo Material Experimental (Nombre)
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej. Acero AISI 4340 Bonificado"
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
            />
          </div>
          <div className="w-48">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Norma / Referencia
            </label>
            <input
              type="text"
              value={newStandard}
              onChange={(e) => setNewStandard(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
            />
          </div>
          <div className="w-36">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Módulo E (MPa)
            </label>
            <input
              type="number"
              value={newEMPa}
              onChange={(e) => setNewEMPa(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono tabular-nums"
            />
          </div>
          <div className="w-36">
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Fluencia Sy (MPa)
            </label>
            <input
              type="number"
              value={newSyMPa}
              onChange={(e) => setNewSyMPa(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono tabular-nums"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-slate-900 text-white rounded font-medium hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar Material</span>
          </button>
        </form>
      </div>
    </div>
  );
};
