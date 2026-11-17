/* ==========================================================================
   MECHPLANT - MOTOR DE CHAVETAS DIN 6885-1 Y PASADORES (solver-chavetas.js)
   Selección normativa automática según diámetro de eje y verificación de carga
   ========================================================================== */

window.MECHPLANT_SOLVER_CHAVETAS = (function () {
  // Tabla normalizada DIN 6885-1 [d_min, d_max, b_mm, h_mm, t1_eje_mm]
  const DIN6885_TABLE = [
    { min: 17, max: 22,  b: 6,  h: 6,  t1: 3.5 },
    { min: 22, max: 30,  b: 8,  h: 7,  t1: 4.0 },
    { min: 30, max: 38,  b: 10, h: 8,  t1: 5.0 },
    { min: 38, max: 44,  b: 12, h: 8,  t1: 5.0 },
    { min: 44, max: 50,  b: 14, h: 9,  t1: 5.5 },
    { min: 50, max: 58,  b: 16, h: 10, t1: 6.0 },
    { min: 58, max: 65,  b: 18, h: 11, t1: 7.0 },
    { min: 65, max: 75,  b: 20, h: 12, t1: 7.5 },
    { min: 75, max: 85,  b: 22, h: 14, t1: 9.0 },
    { min: 85, max: 95,  b: 25, h: 14, t1: 9.0 },
    { min: 95, max: 110, b: 28, h: 16, t1: 10.0 },
    { min: 110, max: 130, b: 32, h: 18, t1: 11.0 }
  ];

  function obtenerSeccionDIN6885(d_eje_mm) {
    return DIN6885_TABLE.find(r => d_eje_mm > r.min && d_eje_mm <= r.max) || null;
  }

  function calcularChavetaDIN6885(p) {
    const d = Number(p.d_eje_mm);
    const T_Nm = Number(p.T_Nm);
    const L_mm = Number(p.L_mm);
    const Sy = Number(p.Sy_MPa) || 450; // SAE 1045 estirado en frío típico
    const n_req = Number(p.n_objetivo) || 2.0;

    const norma = obtenerSeccionDIN6885(d);
    if (!norma) {
      return { error: "Ingrese un diámetro de eje entre 18 mm y 130 mm para selección DIN 6885-1." };
    }

    const F_N = (2 * T_Nm * 1000) / d;
    const Ssy = 0.577 * Sy;

    // Esfuerzos reales para longitud L_mm
    const tau_MPa = F_N / (norma.b * L_mm);
    const sigma_aplast_MPa = F_N / ((norma.h / 2) * L_mm);

    const n_corte = Ssy / tau_MPa;
    const n_aplast = Sy / sigma_aplast_MPa;

    // Longitud mínima recomendada para cumplir n_req
    const L_min_corte = (F_N * n_req) / (norma.b * Ssy);
    const L_min_aplast = (F_N * n_req) / ((norma.h / 2) * Sy);
    const L_min_sugerida = Math.ceil(Math.max(L_min_corte, L_min_aplast));

    return {
      norma,
      F_kN: F_N / 1000,
      tau_MPa,
      sigma_aplast_MPa,
      n_corte,
      n_aplast,
      L_min_sugerida,
      steps: [
        {
          titulo: `Sección Normalizada DIN 6885-1 para Ø ${d} mm`,
          formula: `Ancho b = ${norma.b} mm × Altura h = ${norma.h} mm (Profundidad en eje t1 = ${norma.t1} mm)`
        },
        {
          titulo: "Fuerza tangencial en periferia del eje",
          formula: `F = 2·T / d = 2 × ${T_Nm} / ${(d / 1000).toFixed(3)} = ${(F_N / 1000).toFixed(2)} kN`
        },
        {
          titulo: "Verificación de Corte y Aplastamiento",
          formula: `τ = ${tau_MPa.toFixed(1)} MPa (n_corte = ${n_corte.toFixed(2)}) | σ_aplast = ${sigma_aplast_MPa.toFixed(1)} MPa (n_aplast = ${n_aplast.toFixed(2)})`
        },
        {
          titulo: `Longitud mínima sugerida para n = ${n_req}`,
          formula: `L_min = máx(${L_min_corte.toFixed(1)}, ${L_min_aplast.toFixed(1)}) → ${L_min_sugerida} mm (Recomendación práctica: L ≤ 1.5·d = ${(1.5 * d).toFixed(0)} mm)`
        }
      ]
    };
  }

  return {
    obtenerSeccionDIN6885,
    calcularChavetaDIN6885
  };
})();
