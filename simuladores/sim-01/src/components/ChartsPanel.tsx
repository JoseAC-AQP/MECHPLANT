import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import {
  AnalysisResult,
  MaterialSpec,
  SimulationParams,
  UnitSystem,
} from '../types/engineering';
import {
  formatEng,
  toDisplayForce,
  toDisplayLength,
  toDisplayStress,
  toDisplayTorque,
  unitLabels,
} from '../engine/units';
import { analyzeComponent } from '../engine/analyticalSolver';

interface ChartsPanelProps {
  params: SimulationParams;
  result: AnalysisResult;
  materials: MaterialSpec[];
  unitSystem: UnitSystem;
  mode: 'DIAGRAMS' | 'MOHR' | 'COMPARISON';
}

export const ChartsPanel: React.FC<ChartsPanelProps> = ({
  params,
  result,
  materials,
  unitSystem,
  mode,
}) => {
  const canvasPrimaryRef = useRef<HTMLCanvasElement | null>(null);
  const canvasSecondaryRef = useRef<HTMLCanvasElement | null>(null);

  const ul = unitLabels(unitSystem);

  useEffect(() => {
    const c1 = canvasPrimaryRef.current;
    const c2 = canvasSecondaryRef.current;
    let chart1: Chart | null = null;
    let chart2: Chart | null = null;

    if (mode === 'DIAGRAMS') {
      if (params.moduleId === 'M4_TORSION' && c1) {
        chart1 = new Chart(c1, {
          type: 'line',
          data: {
            labels: result.radialProfile.map((p) =>
              formatEng(toDisplayLength(p.rMm, unitSystem), 1),
            ),
            datasets: [
              {
                label: `Esfuerzo cortante radial τ(r) [${ul.stress}]`,
                data: result.radialProfile.map((p) =>
                  toDisplayStress(p.shearStressMPa, unitSystem),
                ),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.12)',
                fill: true,
                tension: 0.1,
                pointRadius: 3,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, labels: { boxWidth: 12, font: { size: 11 } } },
            },
            scales: {
              x: { title: { display: true, text: `Radio r (${ul.length})`, font: { size: 11 } } },
              y: { title: { display: true, text: `τ (${ul.stress})`, font: { size: 11 } }, beginAtZero: true },
            },
          },
        });

        if (c2) {
          chart2 = new Chart(c2, {
            type: 'line',
            data: {
              labels: result.beamProfile.map((p) =>
                formatEng(toDisplayLength(p.xMm, unitSystem), 0),
              ),
              datasets: [
                {
                  label: 'Ángulo de torsión θ(x) [grados]',
                  data: result.beamProfile.map((p) => p.deflectionMm),
                  borderColor: '#059669',
                  backgroundColor: 'rgba(5, 150, 105, 0.12)',
                  fill: true,
                  tension: 0.1,
                  pointRadius: 2,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: true, labels: { boxWidth: 12, font: { size: 11 } } },
              },
              scales: {
                x: { title: { display: true, text: `Posición x (${ul.length})`, font: { size: 11 } } },
                y: { title: { display: true, text: 'θ (°)', font: { size: 11 } }, beginAtZero: true },
              },
            },
          });
        }
      } else if (c1) {
        // Shear Force V(x) & Bending Moment M(x) or Axial Stress/Displacement
        const isAxialOrShear = params.moduleId === 'M1_AXIAL' || params.moduleId === 'M2_SHEAR';
        chart1 = new Chart(c1, {
          type: 'line',
          data: {
            labels: result.beamProfile.map((p) =>
              formatEng(toDisplayLength(p.xMm, unitSystem), 0),
            ),
            datasets: isAxialOrShear
              ? [
                  {
                    label: `Esfuerzo equivalente (${ul.stress})`,
                    data: result.beamProfile.map((p) =>
                      toDisplayStress(p.vonMisesMPa, unitSystem),
                    ),
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.12)',
                    fill: true,
                    pointRadius: 2,
                  },
                ]
              : [
                  {
                    label: `Fuerza cortante V(x) [${ul.force}]`,
                    data: result.beamProfile.map((p) => toDisplayForce(p.shearN, unitSystem)),
                    borderColor: '#0284c7',
                    backgroundColor: 'rgba(2, 132, 199, 0.12)',
                    fill: true,
                    stepped: params.loadMode !== 'DISTRIBUTED_LOAD',
                    pointRadius: 1.5,
                  },
                ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, labels: { boxWidth: 12, font: { size: 11 } } },
            },
            scales: {
              x: { title: { display: true, text: `Posición x (${ul.length})`, font: { size: 11 } } },
              y: {
                title: {
                  display: true,
                  text: isAxialOrShear ? ul.stress : ul.force,
                  font: { size: 11 },
                },
              },
            },
          },
        });

        if (c2) {
          chart2 = new Chart(c2, {
            type: 'line',
            data: {
              labels: result.beamProfile.map((p) =>
                formatEng(toDisplayLength(p.xMm, unitSystem), 0),
              ),
              datasets: isAxialOrShear
                ? [
                    {
                      label: `Desplazamiento δ(x) [${ul.length}]`,
                      data: result.beamProfile.map((p) =>
                        toDisplayLength(p.deflectionMm, unitSystem),
                      ),
                      borderColor: '#059669',
                      backgroundColor: 'rgba(5, 150, 105, 0.12)',
                      fill: true,
                      pointRadius: 2,
                    },
                  ]
                : [
                    {
                      label: `Momento flector M(x) [${ul.torque}]`,
                      data: result.beamProfile.map((p) =>
                        toDisplayTorque(p.momentNm, unitSystem),
                      ),
                      borderColor: '#dc2626',
                      backgroundColor: 'rgba(220, 38, 38, 0.10)',
                      fill: true,
                      tension: 0.2,
                      pointRadius: 1.5,
                    },
                  ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: true, labels: { boxWidth: 12, font: { size: 11 } } },
              },
              scales: {
                x: { title: { display: true, text: `Posición x (${ul.length})`, font: { size: 11 } } },
                y: {
                  title: {
                    display: true,
                    text: isAxialOrShear ? ul.length : ul.torque,
                    font: { size: 11 },
                  },
                },
              },
            },
          });
        }
      }
    } else if (mode === 'MOHR' && c1) {
      const m = result.mohr;
      const circlePts: { x: number; y: number }[] = [];
      const R = Math.max(0.5, toDisplayStress(m.radiusR, unitSystem));
      const C = toDisplayStress(m.centerSigma, unitSystem);
      for (let deg = 0; deg <= 360; deg += 6) {
        const rad = (deg * Math.PI) / 180;
        circlePts.push({
          x: C + R * Math.cos(rad),
          y: R * Math.sin(rad),
        });
      }
      const sx = toDisplayStress(m.sigmaX, unitSystem);
      const sy = toDisplayStress(m.sigmaY, unitSystem);
      const txy = toDisplayStress(m.tauXY, unitSystem);

      chart1 = new Chart(c1, {
        type: 'scatter',
        data: {
          datasets: [
            {
              label: 'Círculo de Mohr (σ, τ)',
              data: circlePts,
              showLine: true,
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
              pointRadius: 0,
              borderWidth: 2,
            },
            {
              label: 'Estado plano (σx, τxy) y (σy, -τxy)',
              data: [
                { x: sx, y: txy },
                { x: sy, y: -txy },
              ],
              showLine: true,
              borderColor: '#d97706',
              backgroundColor: '#d97706',
              pointRadius: 5,
              borderWidth: 1.5,
            },
            {
              label: 'Esfuerzos principales (σ₁, σ₂)',
              data: [
                { x: toDisplayStress(m.sigma1, unitSystem), y: 0 },
                { x: toDisplayStress(m.sigma2, unitSystem), y: 0 },
              ],
              borderColor: '#dc2626',
              backgroundColor: '#dc2626',
              pointRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, labels: { boxWidth: 10, font: { size: 11 } } },
          },
          scales: {
            x: { title: { display: true, text: `Esfuerzo normal σ (${ul.stress})`, font: { size: 11 } } },
            y: { title: { display: true, text: `Esfuerzo cortante τ (${ul.stress})`, font: { size: 11 } } },
          },
        },
      });
    } else if (mode === 'COMPARISON' && c1) {
      const compRows = materials.map((mat) => {
        const res = analyzeComponent(params, mat);
        return {
          name: mat.name.replace('Acero ', '').replace('Polímero de ingeniería ', 'Polímero '),
          fs: Math.min(10, Number(res.activeSafetyFactor.toFixed(2))),
          disp: toDisplayLength(res.maxDisplacementMm, unitSystem),
        };
      });

      chart1 = new Chart(c1, {
        type: 'bar',
        data: {
          labels: compRows.map((r) => r.name),
          datasets: [
            {
              label: 'Factor de seguridad (FS) [tope visual 10]',
              data: compRows.map((r) => r.fs),
              backgroundColor: compRows.map((r) =>
                r.fs < 1 ? '#dc2626' : r.fs < 1.5 ? '#d97706' : '#059669',
              ),
              borderRadius: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, labels: { boxWidth: 12, font: { size: 11 } } },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Factor de Seguridad', font: { size: 11 } },
            },
          },
        },
      });

      if (c2) {
        chart2 = new Chart(c2, {
          type: 'bar',
          data: {
            labels: compRows.map((r) => r.name),
            datasets: [
              {
                label: `Deformación máxima δ (${ul.length})`,
                data: compRows.map((r) => Number(r.disp.toFixed(4))),
                backgroundColor: '#2563eb',
                borderRadius: 3,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, labels: { boxWidth: 12, font: { size: 11 } } },
            },
            scales: {
              y: {
                beginAtZero: true,
                title: { display: true, text: ul.length, font: { size: 11 } },
              },
            },
          },
        });
      }
    }

    return () => {
      if (chart1) chart1.destroy();
      if (chart2) chart2.destroy();
    };
  }, [params, result, materials, unitSystem, mode, ul]);

  if (mode === 'MOHR') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-52">
        <div className="lg:col-span-2 h-full bg-white border border-slate-200 rounded p-2">
          <canvas ref={canvasPrimaryRef} />
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded p-3 flex flex-col justify-between text-xs">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Invariantes de Esfuerzo Plano</h4>
            <dl className="space-y-1.5 font-mono tabular-nums">
              <div className="flex justify-between">
                <dt className="text-slate-500 font-sans">Esfuerzo principal σ₁:</dt>
                <dd className="font-semibold text-slate-900">
                  {formatEng(toDisplayStress(result.mohr.sigma1, unitSystem), 2)} {ul.stress}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 font-sans">Esfuerzo principal σ₂:</dt>
                <dd className="font-semibold text-slate-900">
                  {formatEng(toDisplayStress(result.mohr.sigma2, unitSystem), 2)} {ul.stress}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 font-sans">Cortante máx. plano R:</dt>
                <dd className="font-semibold text-slate-900">
                  {formatEng(toDisplayStress(result.mohr.radiusR, unitSystem), 2)} {ul.stress}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 font-sans">Centro C = (σx+σy)/2:</dt>
                <dd className="text-slate-800">
                  {formatEng(toDisplayStress(result.mohr.centerSigma, unitSystem), 2)} {ul.stress}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 font-sans">Ángulo principal θp:</dt>
                <dd className="text-slate-800">{result.mohr.principalAngleDeg.toFixed(1)}°</dd>
              </div>
            </dl>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug pt-2 border-t border-slate-200">
            El círculo de Mohr permite visualizar los planos principales donde el esfuerzo cortante se anula (τ = 0).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-52">
      <div className="h-full bg-white border border-slate-200 rounded p-2">
        <canvas ref={canvasPrimaryRef} />
      </div>
      <div className="h-full bg-white border border-slate-200 rounded p-2">
        <canvas ref={canvasSecondaryRef} />
      </div>
    </div>
  );
};
