/* ==========================================================================
   MECHPLANT - MOTOR DE CÁLCULO DE UNIONES Y CHAVETAS (solver-uniones.js)
   Basado en Shigley Cap. 8 (SAE J429 / ISO 898-1) y DIN 6885-1
   ========================================================================== */

window.MECHPLANT_SOLVER_UNIONES = (function () {
  /**
   * Cálculo de precarga, torque de apriete y seguridad de unión empernada
   * @param {Object} p - { d_mm, At_mm2, Sp_MPa, K_nut, condicion, P_ext_N, C_rigidez }
   */
  function calcularUnionEmpernada(p) {
    const d = Number(p.d_mm);
    const At = Number(p.At_mm2);
    const Sp = Number(p.Sp_MPa);
    const K = Number(p.K_nut) || 0.20;
    const P_ext = Number(p.P_ext_N) || 0;
    const C = Number(p.C_rigidez) || 0.25;
    const factorPrecarga = p.condicion === "permanente" ? 0.90 : 0.75;

    if (d <= 0 || At <= 0 || Sp <= 0) {
      return { error: "Ingrese valores positivos para diámetro, área de esfuerzo At y resistencia Sp." };
    }

    // Carga de prueba Fp y precarga recomendada Fi (Shigley Ec. 8-31 / 8-32)
    const Fp_N = At * Sp;
    const Fi_N = factorPrecarga * Fp_N;

    // Torque de apriete T = K * Fi * d (en N·m)
    const Torque_Nm = (K * Fi_N * (d / 1000));

    // Carga resultante en el perno Fb = Fi + C * P_ext
    const Fb_N = Fi_N + C * P_ext;
    const sigma_b = Fb_N / At;

    // Factor de seguridad por fluencia/prueba np y factor de separación n0
    const n_prueba = Fp_N / Fb_N;
    const n_separacion = P_ext > 0 ? Fi_N / (P_ext * (1 - C)) : Infinity;

    return {
      Fp_kN: Fp_N / 1000,
      Fi_kN: Fi_N / 1000,
      Torque_Nm,
      Fb_kN: Fb_N / 1000,
      sigma_b,
      n_prueba,
      n_separacion,
      steps: [
        {
          titulo: "Carga de prueba (Fp) y Precarga inicial recomendada (Fi)",
          formula: `Fp = At·Sp = ${(Fp_N / 1000).toFixed(2)} kN → Fi = ${factorPrecarga}·Fp = ${(Fi_N / 1000).toFixed(2)} kN`
        },
        {
          titulo: "Torque de apriete nominal (T = K · Fi · d)",
          formula: `T = ${K} × ${Fi_N.toFixed(0)} N × ${(d / 1000).toFixed(4)} m = ${Torque_Nm.toFixed(1)} N·m`
        },
        {
          titulo: "Carga total en el perno bajo carga externa (Fb)",
          formula: `Fb = Fi + C·P = ${(Fi_N / 1000).toFixed(2)} + ${C}·${(P_ext / 1000).toFixed(2)} = ${(Fb_N / 1000).toFixed(2)} kN (σb = ${sigma_b.toFixed(1)} MPa)`
        },
        {
          titulo: "Verificación de Seguridad (Prueba y Separación de Junta)",
          formula: `n_prueba = Fp / Fb = ${n_prueba.toFixed(2)} | n_separación = Fi / [P·(1 - C)] = ${isFinite(n_separacion) ? n_separacion.toFixed(2) : "∞"}`
        }
      ]
    };
  }

  /**
   * Verificación de chaveta paralela DIN 6885 por corte y aplastamiento
   * @param {Object} p - { d_eje_mm, T_Nm, b_mm, h_mm, L_mm, Sy_chaveta_MPa }
   */
  function calcularChavetaParalela(p) {
    const d = Number(p.d_eje_mm);
    const T = Number(p.T_Nm);
    const b = Number(p.b_mm);
    const h = Number(p.h_mm);
    const L = Number(p.L_mm);
    const Sy = Number(p.Sy_chaveta_MPa) || 370;

    if (d <= 0 || b <= 0 || h <= 0 || L <= 0) {
      return { error: "Todas las dimensiones geométricas deben ser mayores a cero." };
    }

    const F_N = (2 * T * 1000) / d; // Fuerza tangencial en la superficie del eje
    const tau_MPa = F_N / (b * L);
    const sigma_aplast_MPa = F_N / ((h / 2) * L);

    // Resistencia al corte por Von Mises Ssy = 0.577 * Sy
    const Ssy = 0.577 * Sy;
    const n_corte = Ssy / tau_MPa;
    const n_aplast = Sy / sigma_aplast_MPa;

    return {
      F_kN: F_N / 1000,
      tau_MPa,
      sigma_aplast_MPa,
      n_corte,
      n_aplast,
      steps: [
        {
          titulo: "Fuerza tangencial transmitida en el radio del eje",
          formula: `F = 2·T / d = 2 × ${T} N·m / ${(d / 1000).toFixed(3)} m = ${(F_N / 1000).toFixed(2)} kN`
        },
        {
          titulo: "Esfuerzo cortante en el plano neutro de la chaveta",
          formula: `τ = F / (b·L) = ${F_N.toFixed(0)} / (${b} × ${L}) = ${tau_MPa.toFixed(1)} MPa → n_corte = ${n_corte.toFixed(2)}`
        },
        {
          titulo: "Esfuerzo de aplastamiento en flanco lateral (h/2)",
          formula: `σ_aplast = F / [(h/2)·L] = ${F_N.toFixed(0)} / (${(h / 2).toFixed(1)} × ${L}) = ${sigma_aplast_MPa.toFixed(1)} MPa → n_aplast = ${n_aplast.toFixed(2)}`
        }
      ]
    };
  }

  return {
    calcularUnionEmpernada,
    calcularChavetaParalela
  };
})();
