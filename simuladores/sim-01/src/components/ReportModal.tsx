import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Download, FileSpreadsheet, FileText, X } from 'lucide-react';
import {
  AnalysisResult,
  ComponentDefinition,
  MaterialSpec,
  SimulationParams,
  UnitSystem,
} from '../types/engineering';
import {
  formatEng,
  toDisplayArea,
  toDisplayForce,
  toDisplayInertia,
  toDisplayLength,
  toDisplayStress,
  toDisplayTorque,
  unitLabels,
} from '../engine/units';

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  params: SimulationParams;
  component: ComponentDefinition;
  material: MaterialSpec;
  result: AnalysisResult;
  unitSystem: UnitSystem;
  snapshotDataUrl: string | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  open,
  onClose,
  params,
  component,
  material,
  result,
  unitSystem,
  snapshotDataUrl,
}) => {
  const [studentName, setStudentName] = useState('Estudiante de Ingeniería');
  const [conclusions, setConclusions] = useState(
    result.engineeringInterpretation,
  );

  if (!open) return null;

  const ul = unitLabels(unitSystem);
  const todayStr = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleExportCSV = () => {
    const rows: string[][] = [
      ['STRESSLAB 3D - REPORTE DE DATOS DE SIMULACIÓN'],
      ['Estudiante', studentName],
      ['Fecha', todayStr],
      ['Componente', component.name],
      ['Módulo', params.moduleId],
      ['Material', `${material.name} (${material.standard})`],
      ['Sistema de Unidades', unitSystem],
      [],
      ['PARÁMETROS GEOMÉTRICOS Y CARGAS'],
      ['Longitud', `${formatEng(toDisplayLength(params.lengthMm, unitSystem), 2)} ${ul.length}`],
      ['Área Transversal A', `${formatEng(toDisplayArea(result.section.areaMm2, unitSystem), 2)} ${ul.area}`],
      ['Momento Inercia Iz', `${formatEng(toDisplayInertia(result.section.inertiaZMm4, unitSystem), 1)} ${ul.inertia}`],
      ['Fuerza F', `${formatEng(toDisplayForce(params.forceN, unitSystem), 1)} ${ul.force}`],
      ['Torque T', `${formatEng(toDisplayTorque(params.torqueNm, unitSystem), 2)} ${ul.torque}`],
      [],
      ['RESULTADOS PRINCIPALES'],
      ['Esfuerzo Normal', `${formatEng(toDisplayStress(result.normalStressMPa, unitSystem), 2)} ${ul.stress}`],
      ['Esfuerzo Cortante', `${formatEng(toDisplayStress(result.shearStressMPa, unitSystem), 2)} ${ul.stress}`],
      ['Esfuerzo Von Mises', `${formatEng(toDisplayStress(result.vonMisesMPa, unitSystem), 2)} ${ul.stress}`],
      ['Esfuerzo Tresca', `${formatEng(toDisplayStress(result.trescaMPa, unitSystem), 2)} ${ul.stress}`],
      ['Deformación Máxima', `${formatEng(toDisplayLength(result.maxDisplacementMm, unitSystem), 4)} ${ul.length}`],
      ['Factor de Seguridad Activo', result.activeSafetyFactor.toFixed(3)],
      ['Estado', result.safetyStatusLabel],
      [],
      ['PERFIL LONGITUDINAL (x, V, M, Deflexión, Von Mises)'],
      [`x (${ul.length})`, `Cortante (${ul.force})`, `Momento (${ul.torque})`, `Deflexión (${ul.length})`, `Von Mises (${ul.stress})`],
      ...result.beamProfile.map((pt) => [
        toDisplayLength(pt.xMm, unitSystem).toFixed(2),
        toDisplayForce(pt.shearN, unitSystem).toFixed(2),
        toDisplayTorque(pt.momentNm, unitSystem).toFixed(2),
        toDisplayLength(pt.deflectionMm, unitSystem).toFixed(4),
        toDisplayStress(pt.vonMisesMPa, unitSystem).toFixed(2),
      ]),
    ];

    const csvContent = rows
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stresslab3d_${component.id}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let y = 16;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('STRESSLAB 3D — INFORME TÉCNICO DE ANÁLISIS DE ESFUERZOS', 14, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Estudiante: ${studentName}   |   Fecha: ${todayStr}   |   Unidades: ${unitSystem}`, 14, y);
    y += 4;
    doc.line(14, y, 196, y);
    y += 7;

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('1. Datos del Componente y Material', 14, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const linesInfo = [
      `Componente: ${component.name} (${component.industrialContext})`,
      `Módulo Activo: ${params.moduleId}   |   Sección: ${params.sectionType}   |   Apoyo: ${params.supportCondition}`,
      `Geometría: L = ${formatEng(toDisplayLength(params.lengthMm, unitSystem), 1)} ${ul.length}, A = ${formatEng(toDisplayArea(result.section.areaMm2, unitSystem), 1)} ${ul.area}, Iz = ${formatEng(toDisplayInertia(result.section.inertiaZMm4, unitSystem), 0)} ${ul.inertia}`,
      `Material: ${material.name} (${material.standard}) — E = ${formatEng(toDisplayStress(material.elasticModulusMPa, unitSystem), 0)} ${ul.stress}, Sy = ${formatEng(toDisplayStress(material.yieldStrengthMPa, unitSystem), 0)} ${ul.stress}`,
      `Cargas: F = ${formatEng(toDisplayForce(params.forceN, unitSystem), 0)} ${ul.force}, T = ${formatEng(toDisplayTorque(params.torqueNm, unitSystem), 1)} ${ul.torque}`,
    ];
    linesInfo.forEach((line) => {
      const wrapped = doc.splitTextToSize(line, 180);
      doc.text(wrapped, 14, y);
      y += wrapped.length * 4.5;
    });

    if (snapshotDataUrl) {
      y += 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('2. Captura del Modelo Tridimensional y Mapa de Esfuerzos', 14, y);
      y += 3;
      doc.addImage(snapshotDataUrl, 'PNG', 14, y, 130, 68);
      y += 73;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('3. Ecuaciones Utilizadas y Desarrollo de Cálculos', 14, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    result.steps.forEach((st) => {
      if (y > 265) {
        doc.addPage();
        y = 16;
      }
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${st.label}: ${st.formula}`, 14, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.text(`  ${st.substitution}  =>  ${st.result}`, 14, y);
      y += 5;
    });

    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('4. Resultados y Factor de Seguridad', 14, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const resLines = [
      `Esfuerzo Equivalente (${params.failureCriterion}): ${formatEng(toDisplayStress(result.equivalentStressMPa, unitSystem), 2)} ${ul.stress}`,
      `Deformación Máxima: ${formatEng(toDisplayLength(result.maxDisplacementMm, unitSystem), 4)} ${ul.length}   |   Ángulo Torsión: ${result.twistAngleDeg.toFixed(3)}°`,
      `Factor de Seguridad: FS = ${result.activeSafetyFactor.toFixed(2)} — ${result.safetyStatusLabel}`,
      `FEM 1D Simplificado: ${result.fem.available ? `${result.fem.numElements} elementos, diferencia vs. analítico ${result.fem.analyticalDiffPercent.toFixed(3)}%` : 'Solución analítica localizada'}`,
    ];
    resLines.forEach((l) => {
      doc.text(l, 14, y);
      y += 4.8;
    });

    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('5. Interpretación Técnica y Conclusiones', 14, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const concWrapped = doc.splitTextToSize(conclusions, 180);
    doc.text(concWrapped, 14, y);
    y += concWrapped.length * 4.5 + 6;

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      'Aviso educativo: Los cálculos de STRESSLAB 3D tienen fines académicos y referenciales. No constituyen certificación de seguridad estructural.',
      14,
      Math.min(286, y),
    );

    doc.save(`informe_stresslab3d_${component.id}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-lg">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Generar Informe Técnico de Análisis
            </h2>
            <p className="text-[11px] text-slate-500">
              Exporta el reporte completo con captura 3D en PDF o los datos numéricos en CSV.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto cae-scroll p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nombre del Estudiante / Analista
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fecha de Emisión</label>
              <input
                type="text"
                readOnly
                value={todayStr}
                className="w-full px-3 py-1.5 border border-slate-200 rounded bg-slate-50 text-slate-600"
              />
            </div>
          </div>

          {snapshotDataUrl && (
            <div>
              <span className="block font-semibold text-slate-700 mb-1">
                Captura del Modelo 3D
              </span>
              <img
                src={snapshotDataUrl}
                alt="Captura del modelo 3D analizado"
                className="w-full max-h-56 object-contain bg-slate-900 rounded border border-slate-200"
              />
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1.5">
            <div className="font-semibold text-slate-900">Desarrollo de Cálculos</div>
            {result.steps.map((st, idx) => (
              <div key={idx} className="font-mono text-[11px] text-slate-700">
                <strong>{st.label}:</strong> {st.formula} → {st.substitution} ={' '}
                <strong className="text-slate-900">{st.result}</strong>
              </div>
            ))}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Interpretación Técnica y Conclusiones
            </label>
            <textarea
              rows={3}
              value={conclusions}
              onChange={(e) => setConclusions(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
            />
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-medium bg-white border border-slate-300 rounded text-slate-800 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Descargar CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportPDF}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Informe PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
