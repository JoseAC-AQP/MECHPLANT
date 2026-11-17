/* ==========================================================================
   MECHPLANT - MOTOR DE CÁLCULO DE ENGRANAJES Y REDUCTORES (solver-engranajes.js)
   Basado en Shigley Cap. 13/14 y ANSI/AGMA 2001-D04
   ========================================================================== */

window.MECHPLANT_SOLVER_ENGRANAJES = (function () {
  /**
   * Calcula cinemática, fuerzas Wt, Wr, Wa y esfuerzo de flexión Lewis/AGMA básico
   * @param {Object} p - { modulo_mm, Z1, Z2, ancho_b_mm, phi_n_deg, psi_deg, P_kW, rpm1, Kv, Ko, Y_lewis }
   */
  function calcularEngranaje(p) {
    const m = Number(p.modulo_mm) || 4;
    const Z1 = Number(p.Z1) || 20;
    const Z2 = Number(p.Z2) || 60;
    const b = Number(p.ancho_b_mm) || 45;
    const phi_n = ((Number(p.phi_n_deg) || 20) * Math.PI) / 180;
    const psi = ((Number(p.psi_deg) || 0) * Math.PI) / 180; // 0 = recto, >0 = helicoidal
    const P_kW = Number(p.P_kW) || 15;
    const n1 = Number(p.rpm1) || 1480;
    const Kv = Number(p.Kv) || 1.25;
    const Ko = Number(p.Ko) || 1.25;
    const Y = Number(p.Y_lewis) || 0.32;

    if (m <= 0 || Z1 < 12 || Z2 < Z1 || b <= 0 || n1 <= 0) {
      return { error: "Verifique módulo, número de dientes (Z1 >= 12), ancho de cara y rpm." };
    }

    // Módulo transversal mt = mn / cos(psi)
    const mt = m / Math.cos(psi);
    const d1_mm = mt * Z1;
    const d2_mm = mt * Z2;
    const distancia_centros_mm = (d1_mm + d2_mm) / 2;
    const mg = Z2 / Z1;
    const n2 = n1 / mg;

    // Velocidad en línea de paso V (m/s) y Torque piñón T1 (N·m)
    const V_ms = (Math.PI * d1_mm * n1) / 60000;
    const T1_Nm = (P_kW * 1000) / ((2 * Math.PI * n1) / 60);

    // Componentes de fuerza en el diente (Shigley Cap. 13)
    const Wt_N = (2 * T1_Nm * 1000) / d1_mm;
    const phi_t = Math.atan(Math.tan(phi_n) / Math.cos(psi));
    const Wr_N = Wt_N * Math.tan(phi_t);
    const Wa_N = Wt_N * Math.tan(psi);

    // Esfuerzo de flexión en raíz del diente (Fórmula de Lewis con factores Ko y Kv)
    const sigma_flex_MPa = (Wt_N * Ko * Kv) / (b * m * Y);

    return {
      mt,
      d1_mm,
      d2_mm,
      distancia_centros_mm,
      mg,
      n2,
      V_ms,
      T1_Nm,
      Wt_N,
      Wr_N,
      Wa_N,
      sigma_flex_MPa,
      steps: [
        {
          titulo: "Geometría primitiva y relación de transmisión (mg)",
          formula: `d1 = ${d1_mm.toFixed(1)} mm | d2 = ${d2_mm.toFixed(1)} mm | C = ${distancia_centros_mm.toFixed(1)} mm | mg = ${mg.toFixed(2)} (n2 = ${n2.toFixed(0)} rpm)`
        },
        {
          titulo: "Torque en piñón (T1) y velocidad en línea de paso (V)",
          formula: `T1 = ${T1_Nm.toFixed(1)} N·m | V = ${V_ms.toFixed(2)} m/s`
        },
        {
          titulo: "Descomposición de fuerzas en el diente (Wt, Wr, Wa)",
          formula: `Wt = ${Wt_N.toFixed(0)} N | Wr = ${Wr_N.toFixed(0)} N | Wa = ${Wa_N.toFixed(0)} N`
        },
        {
          titulo: "Esfuerzo de flexión en la raíz del diente",
          formula: `σ_flex = (Wt · Ko · Kv) / (b · m · Y) = ${sigma_flex_MPa.toFixed(1)} MPa`
        }
      ]
    };
  }

  return {
    calcularEngranaje
  };
})();
