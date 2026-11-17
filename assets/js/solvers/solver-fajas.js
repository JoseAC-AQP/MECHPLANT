/* ==========================================================================
   MECHPLANT - MOTOR DE TRANSMISIÓN POR FAJAS Y POLEAS (solver-fajas.js)
   Basado en Shigley Cap. 17 y estándares RMA / ISO 4184
   ========================================================================== */

window.MECHPLANT_SOLVER_FAJAS = (function () {
  /**
   * @param {Object} p - { P_motor_kW, rpm1, d1_mm, d2_mm, C_mm, f_friccion, beta_deg, masa_lineal_kgm, T_adm_faja_N, Ks }
   */
  function calcularTransmisionFajas(p) {
    const P_kW = Number(p.P_motor_kW);
    const n1 = Number(p.rpm1);
    const d1 = Number(p.d1_mm);
    const d2 = Number(p.d2_mm);
    const C = Number(p.C_mm);
    const f = Number(p.f_friccion) || 0.30;
    const beta_rad = ((Number(p.beta_deg) || 36) * Math.PI) / 180;
    const m_lin = Number(p.masa_lineal_kgm) || 0.25; // kg/m típico perfil 5V
    const T_max = Number(p.T_adm_faja_N) || 950;
    const Ks = Number(p.Ks) || 1.3;

    if (d1 <= 0 || d2 <= 0 || C <= (d1 + d2) / 2 || n1 <= 0) {
      return { error: "Verifique diámetros de poleas y distancia entre centros C > (d1+d2)/2." };
    }

    const i_rel = d2 / d1;
    const n2 = n1 / i_rel;
    const v_ms = (Math.PI * d1 * n1) / 60000;

    // Longitud primitiva aproximada de la faja (Shigley Ec. 17-1)
    const L_mm = 2 * C + (Math.PI / 2) * (d2 + d1) + Math.pow(d2 - d1, 2) / (4 * C);

    // Ángulo de contacto en polea menor theta_1 (rad)
    const theta1_rad = Math.PI - 2 * Math.asin((d2 - d1) / (2 * C));
    const theta1_deg = (theta1_rad * 180) / Math.PI;

    // Coeficiente de fricción efectivo en ranura en V: f_eff = f / sin(beta/2)
    const f_eff = f / Math.sin(beta_rad / 2);

    // Tensión centrífuga Fc = m * v²
    const Fc_N = m_lin * Math.pow(v_ms, 2);

    // Relación de tensiones Euler-Eytelwein: (T1 - Fc) / (T2 - Fc) = exp(f_eff * theta1)
    const expFactor = Math.exp(f_eff * theta1_rad);
    const T1_faja = T_max;
    const T2_faja = Fc_N + (T1_faja - Fc_N) / expFactor;

    // Potencia transmitida por 1 faja (kW)
    const P_por_faja_kW = ((T1_faja - T2_faja) * v_ms) / 1000;

    // Potencia de diseño y número mínimo de fajas
    const P_diseno_kW = P_kW * Ks;
    const num_fajas = Math.max(1, Math.ceil(P_diseno_kW / P_por_faja_kW));

    // Carga radial resultante sobre el eje de la polea
    const F_eje_kN = (num_fajas * (T1_faja + T2_faja)) / 1000;

    return {
      i_rel,
      n2,
      v_ms,
      L_mm,
      theta1_deg,
      Fc_N,
      T1_faja,
      T2_faja,
      P_por_faja_kW,
      P_diseno_kW,
      num_fajas,
      F_eje_kN,
      steps: [
        {
          titulo: "Cinemática y velocidad lineal de la faja",
          formula: `i = ${i_rel.toFixed(2)} | n2 = ${n2.toFixed(0)} rpm | v = π·d1·n1/60,000 = ${v_ms.toFixed(2)} m/s`
        },
        {
          titulo: "Longitud primitiva (L) y arco de contacto en polea menor (θ1)",
          formula: `L = ${L_mm.toFixed(0)} mm | θ1 = ${theta1_deg.toFixed(1)}° (${theta1_rad.toFixed(3)} rad)`
        },
        {
          titulo: "Tensiones por faja (T1, T2) y efecto centrífugo (Fc)",
          formula: `Fc = m·v² = ${Fc_N.toFixed(1)} N | T1 = ${T1_faja.toFixed(0)} N | T2 = ${T2_faja.toFixed(0)} N`
        },
        {
          titulo: "Capacidad por faja y número de correas requeridas",
          formula: `P_faja = ${P_por_faja_kW.toFixed(2)} kW | P_diseño = ${P_diseno_kW.toFixed(1)} kW → ${num_fajas} fajas (Carga radial eje: ${F_eje_kN.toFixed(2)} kN)`
        }
      ]
    };
  }

  return {
    calcularTransmisionFajas
  };
})();
