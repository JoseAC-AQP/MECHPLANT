/* ==========================================================================
   MECHPLANT - MOTOR DE CÁLCULO DE RODAMIENTOS ISO 281 / ISO 76 (solver-rodamientos.js)
   Calcula carga dinámica equivalente P, vida L10, L10h y factor estático s0
   ========================================================================== */

window.MECHPLANT_SOLVER_RODAMIENTOS = (function () {
  /**
   * @param {Object} p - { tipo, C_kN, C0_kN, Fr_kN, Fa_kN, X, Y, rpm, fd_aplicacion }
   */
  function calcularVidaRodamiento(p) {
    const tipo = p.tipo || "bolas"; // "bolas" (p=3) o "rodillos" (p=10/3)
    const C = Number(p.C_kN);
    const C0 = Number(p.C0_kN) || C * 0.65;
    const Fr = Number(p.Fr_kN) || 0;
    const Fa = Number(p.Fa_kN) || 0;
    const X = Number(p.X) || 1.0;
    const Y = Number(p.Y) || 0.0;
    const rpm = Number(p.rpm) || 1000;
    const fd = Number(p.fd_aplicacion) || 1.2;

    if (C <= 0 || rpm <= 0 || (Fr <= 0 && Fa <= 0)) {
      return { error: "Verifique que C, rpm y las cargas sean mayores a cero." };
    }

    const exp_p = tipo === "rodillos" ? (10 / 3) : 3.0;

    // Carga dinámica equivalente P = fd * (X * Fr + Y * Fa)
    const P_sin_fd = X * Fr + Y * Fa;
    const P_kN = fd * P_sin_fd;

    // Vida nominal en millones de revoluciones (ISO 281)
    const L10_rev = Math.pow(C / P_kN, exp_p);

    // Vida nominal en horas de operación
    const L10h = (L10_rev * 1e6) / (60 * rpm);

    // Capacidad dinámica mínima requerida para 25,000 horas de referencia industrial
    const L10_req_25k = (60 * rpm * 25000) / 1e6;
    const C_req_25k = P_kN * Math.pow(L10_req_25k, 1 / exp_p);

    // Factor de seguridad estático s0 = C0 / P0 (ISO 76)
    const P0_kN = Math.max(Fr, 0.6 * Fr + 0.5 * Fa);
    const s0 = P0_kN > 0 ? C0 / P0_kN : Infinity;

    return {
      exp_p,
      P_kN,
      L10_rev,
      L10h,
      C_req_25k,
      s0,
      steps: [
        {
          titulo: "Carga dinámica equivalente de diseño (P)",
          formula: `P = fd · (X·Fr + Y·Fa) = ${fd} · (${X}×${Fr} + ${Y}×${Fa}) = ${P_kN.toFixed(2)} kN`
        },
        {
          titulo: "Vida nominal básica en millones de revoluciones (ISO 281)",
          formula: `L10 = (C / P)^p = (${C} / ${P_kN.toFixed(2)})^${exp_p.toFixed(2)} = ${L10_rev.toFixed(1)} × 10⁶ rev`
        },
        {
          titulo: "Vida nominal en horas de servicio (L10h)",
          formula: `L10h = (L10 × 10⁶) / (60 × ${rpm} rpm) = ${Math.round(L10h).toLocaleString()} horas`
        },
        {
          titulo: "Verificación estática ISO 76 (s0) y Capacidad sugerida para 25,000 h",
          formula: `s0 = C0 / P0 = ${s0.toFixed(2)} | C_req (25,000 h) = ${C_req_25k.toFixed(2)} kN`
        }
      ]
    };
  }

  return {
    calcularVidaRodamiento
  };
})();
