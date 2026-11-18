import React, { useState } from 'react';
import { Award, CheckCircle2, Play, RotateCcw, XCircle } from 'lucide-react';
import { LEARNING_QUESTIONS } from '../data/learningData';
import { AnalysisResult, LearningQuestion, SimulationParams } from '../types/engineering';

interface LearningViewProps {
  currentParams: SimulationParams;
  currentResult: AnalysisResult;
  onLoadPresetInSimulator: (patch: Partial<SimulationParams>) => void;
}

interface AnswerRecord {
  correct: boolean;
  feedback: string;
}

export const LearningView: React.FC<LearningViewProps> = ({
  currentParams,
  currentResult,
  onLoadPresetInSimulator,
}) => {
  const [activeLevel, setActiveLevel] = useState<1 | 2 | 3>(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [numericInputs, setNumericInputs] = useState<Record<string, string>>({});
  const [records, setRecords] = useState<Record<string, AnswerRecord>>(() => {
    try {
      const saved = localStorage.getItem('stresslab_learning_records');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Guided Level 1 Step Wizard state
  const [guidedStep, setGuidedStep] = useState<1 | 2 | 3>(1);

  const saveRecord = (id: string, rec: AnswerRecord) => {
    const next = { ...records, [id]: rec };
    setRecords(next);
    try {
      localStorage.setItem('stresslab_learning_records', JSON.stringify(next));
    } catch {
      // ignore storage quota errors
    }
  };

  const evaluateQuestion = (q: LearningQuestion) => {
    if (q.type === 'MULTIPLE_CHOICE') {
      const chosen = selectedOptions[q.id];
      if (chosen === undefined) return;
      const ok = chosen === q.correctOptionIndex;
      saveRecord(q.id, {
        correct: ok,
        feedback: ok
          ? `Correcto. ${q.explanation}`
          : `Revisa el concepto: ${q.explanation}`,
      });
    } else if (q.type === 'NUMERIC') {
      const raw = Number(numericInputs[q.id]);
      if (!Number.isFinite(raw) || q.numericTarget === undefined) return;
      const tol = ((q.numericTolerancePercent ?? 2) / 100) * Math.abs(q.numericTarget);
      const ok = Math.abs(raw - q.numericTarget) <= Math.max(0.05, tol);
      saveRecord(q.id, {
        correct: ok,
        feedback: ok
          ? `Cálculo validado (${raw} ${q.numericUnit} ≈ ${q.numericTarget} ${q.numericUnit}). ${q.explanation}`
          : `Valor ingresado: ${raw} ${q.numericUnit}. Valor esperado: ${q.numericTarget} ${q.numericUnit}. ${q.explanation}`,
      });
    } else if (q.type === 'SIMULATION_CHALLENGE' && q.challengeCondition) {
      const minFS = q.challengeCondition.minSafetyFactor;
      const expectedComp = q.presetParams?.componentId;
      const sameComponent = !expectedComp || currentParams.componentId === expectedComp;
      const ok = sameComponent && currentResult.activeSafetyFactor >= minFS;
      saveRecord(q.id, {
        correct: ok,
        feedback: ok
          ? `Reto superado en el Simulador 3D: FS actual = ${currentResult.activeSafetyFactor.toFixed(2)} (meta ≥ ${minFS.toFixed(2)}). ${q.explanation}`
          : !sameComponent
            ? `Carga primero el reto en el Simulador 3D para verificar el componente correspondiente.`
            : `FS actual = ${currentResult.activeSafetyFactor.toFixed(2)} aún no alcanza la meta (FS ≥ ${minFS.toFixed(2)}). Ajusta dimensiones o material en el Simulador 3D y vuelve a verificar.`,
      });
    }
  };

  const totalQuestions = LEARNING_QUESTIONS.length;
  const correctCount = Object.values(records).filter((r) => r.correct).length;
  const scorePct = Math.round((correctCount / totalQuestions) * 100);

  const filtered = LEARNING_QUESTIONS.filter((q) => q.level === activeLevel);

  return (
    <div className="flex-1 overflow-y-auto cae-scroll bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header & Scoreboard */}
        <div className="bg-white border border-slate-200 rounded p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Entorno de Aprendizaje Progresivo</h1>
            <p className="text-xs text-slate-600 mt-1">
              Tres niveles formativos integrados con el Simulador 3D: comprensión conceptual, cálculo autónomo y retos de mantenimiento industrial.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded px-3.5 py-2">
              <Award className="w-5 h-5 text-blue-600" />
              <div className="text-xs">
                <span className="text-slate-500 block">Puntuación acumulada</span>
                <span className="font-mono tabular-nums font-bold text-slate-900 text-sm">
                  {correctCount} / {totalQuestions} ({scorePct}%)
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setRecords({});
                localStorage.removeItem('stresslab_learning_records');
              }}
              className="px-2.5 py-2 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded bg-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar</span>
            </button>
          </div>
        </div>

        {/* 3-Level Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              lvl: 1 as const,
              title: 'Nivel 1: Aprendizaje Guiado',
              desc: 'Instrucciones paso a paso para identificar cargas, apoyos, materiales y lectura de esfuerzos.',
            },
            {
              lvl: 2 as const,
              title: 'Nivel 2: Práctica Autónoma',
              desc: 'Ejercicios numéricos evaluados automáticamente con verificación directa en el modelo 3D.',
            },
            {
              lvl: 3 as const,
              title: 'Nivel 3: Retos Industriales',
              desc: 'Diagnóstico de fallas reales de planta y rediseño en el Simulador 3D bajo criterios de seguridad.',
            },
          ].map((item) => {
            const active = activeLevel === item.lvl;
            return (
              <button
                key={item.lvl}
                type="button"
                onClick={() => setActiveLevel(item.lvl)}
                className={`text-left p-4 rounded border transition-colors cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold">{item.title}</div>
                <div className={`text-[11px] mt-1 ${active ? 'text-slate-300' : 'text-slate-500'}`}>
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Guided Interactive Wizard for Level 1 */}
        {activeLevel === 1 && (
          <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900">
                Guía Paso a Paso: Flujo de Trabajo en Análisis de Esfuerzos
              </h2>
              <div className="flex items-center gap-1 text-xs">
                {[1, 2, 3].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setGuidedStep(step as 1 | 2 | 3)}
                    className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                      guidedStep === step
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Paso {step}
                  </button>
                ))}
              </div>
            </div>

            {guidedStep === 1 && (
              <div className="text-xs text-slate-700 space-y-2">
                <p className="font-semibold text-slate-900">
                  Paso 1: Identificar Geometría, Cargas y Condiciones de Apoyo
                </p>
                <p>
                  Antes de calcular cualquier esfuerzo, determina qué solicitación domina: tracción/compresión (σ = F/A), corte directo en pernos/chavetas (τ = F/A), flexión en vigas (σ = M·y/I) o torsión en ejes (τ = T·r/J).
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onLoadPresetInSimulator({
                      componentId: 'viga',
                      moduleId: 'M3_BENDING',
                      materialId: 'astm-a36',
                      supportCondition: 'PINNED_ROLLER',
                      loadMode: 'POINT_LOAD',
                      forceN: 18000,
                    })
                  }
                  className="mt-2 px-3 py-1.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Cargar Viga de Ejemplo en Visor 3D</span>
                </button>
              </div>
            )}

            {guidedStep === 2 && (
              <div className="text-xs text-slate-700 space-y-2">
                <p className="font-semibold text-slate-900">
                  Paso 2: Seleccionar Material y Verificar Límite Elástico (Sy)
                </p>
                <p>
                  Compara el esfuerzo equivalente obtenido (Von Mises o Tresca) contra la resistencia a la fluencia Sy del material. El acero ASTM A36 (Sy = 250 MPa) y el AISI 4140 (Sy = 655 MPa) responden igual en rigidez (E ≈ 200 GPa), pero toleran esfuerzos muy distintos antes de deformarse plásticamente.
                </p>
              </div>
            )}

            {guidedStep === 3 && (
              <div className="text-xs text-slate-700 space-y-2">
                <p className="font-semibold text-slate-900">
                  Paso 3: Interpretar Mapa de Colores y Factor de Seguridad
                </p>
                <p>
                  En el visor 3D, las zonas rojas indican concentración máxima de esfuerzo (fibras extremas en flexión o superficie exterior en torsión). Un Factor de Seguridad FS = Sy / σ_eq ≥ 1.50 ofrece margen frente a incertidumbre de carga en servicio industrial.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Questions / Exercises List */}
        <div className="space-y-4">
          {filtered.map((q) => {
            const rec = records[q.id];
            return (
              <div key={q.id} className="bg-white border border-slate-200 rounded p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-mono text-blue-700 font-semibold">
                      {q.context}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{q.title}</h3>
                  </div>

                  {q.presetParams && (
                    <button
                      type="button"
                      onClick={() => onLoadPresetInSimulator(q.presetParams!)}
                      className="px-3 py-1.5 text-xs font-medium bg-slate-100 border border-slate-300 rounded text-slate-800 hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3 h-3" />
                      <span>Abrir escenario en Simulador 3D</span>
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{q.prompt}</p>

                {q.type === 'MULTIPLE_CHOICE' && q.options && (
                  <div className="space-y-1.5">
                    {q.options.map((opt, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center gap-2.5 p-2.5 rounded border text-xs cursor-pointer ${
                          selectedOptions[q.id] === idx
                            ? 'bg-blue-50 border-blue-500 text-slate-900'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          checked={selectedOptions[q.id] === idx}
                          onChange={() =>
                            setSelectedOptions((prev) => ({ ...prev, [q.id]: idx }))
                          }
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'NUMERIC' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={numericInputs[q.id] ?? ''}
                      onChange={(e) =>
                        setNumericInputs((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      placeholder="Ingresa tu resultado numérico..."
                      className="w-56 px-3 py-1.5 text-xs font-mono tabular-nums border border-slate-300 rounded"
                    />
                    <span className="text-xs font-mono text-slate-600">{q.numericUnit}</span>
                  </div>
                )}

                {q.type === 'SIMULATION_CHALLENGE' && q.challengeCondition && (
                  <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="font-semibold text-slate-800 block">
                        Condición de evaluación automática:
                      </span>
                      <span className="text-slate-600">{q.challengeCondition.description}</span>
                    </div>
                    <div className="font-mono tabular-nums text-xs">
                      Estado actual en visor: <strong>FS = {currentResult.activeSafetyFactor.toFixed(2)}</strong>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => evaluateQuestion(q)}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 cursor-pointer"
                  >
                    {q.type === 'SIMULATION_CHALLENGE'
                      ? 'Verificar Diseño Actual en Simulador'
                      : 'Comprobar Respuesta'}
                  </button>
                </div>

                {rec && (
                  <div
                    className={`p-3 rounded border text-xs flex items-start gap-2 ${
                      rec.correct
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-red-50 border-red-200 text-red-900'
                    }`}
                  >
                    {rec.correct ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <span>{rec.feedback}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
