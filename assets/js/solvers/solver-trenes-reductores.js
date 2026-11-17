/* ==========================================================================
   MECHPLANT - MOTOR DE TRENES DE ENGRANAJES Y REDUCTORES (solver-trenes-reductores.js)
   Cubre SIM-11 (Trenes compuestos) y SIM-12 (Selección mecánica y térmica)
   ========================================================================== */

window.MECHPLANT_SOLVER_TRENES = (function () {
  /**
   * SIM-11: Calcula tren compuesto de 2 etapas (Z1->Z2 y Z3->Z4)
   */
  function calcularTrenCompuesto(p) {
    const Z1 = Number(p.Z1) || 18;
    const Z2 = Number(p.Z2) || 54;
    const Z3 = Number(p.Z3) || 20;
    const Z4 = Number(p.Z4) || 80;
    const n_in = Number(p.rpm_entrada) || 1780;
    const P_kW = Number(p.P_kW) || 45;
    const eta_etapa = Number(p.eficiencia_etapa) || 0.985;

    if (Z1 < 12 || Z2 < 12 || Z3 < 12 || Z4 < 12 || n_in <= 0) {
      return { error: "Todos los engranajes deben tener al menos 12 dientes y velocidad positiva." };
    }

    const i1 = Z2 / Z1;
    const i2 = Z4 / Z3;
    const i_total = i1 * i2;

    const n_intermedia = n_in / i1;
    const n_salida = n_in / i_total;
    const eta_total = Math.pow(eta_etapa, 2);

    const T_in_Nm = (P_kW * 1000) / ((2 * Math.PI * n_in) / 60);
    const P_out_kW = P_kW * eta_total;
    const T_out_Nm = (P_out_kW * 1000) / ((2 * Math.PI * n_salida) / 60);

    return {
      i1,
      i2,
      i_total,
      n_intermedia,
      n_salida,
      eta_total,
      T_in_Nm,
      T_out_Nm,
      sentidoGiro: "Mismo sentido que el eje de entrada (2 inversiones de signo: (-1)² = +1)",
      steps: [
        {
          titulo: "Relaciones de transmisión parciales y total (e = 1 / i_total)",
          formula: `i1 = Z2/Z1 = ${i1.toFixed(2)} | i2 = Z4/Z3 = ${i2.toFixed(2)} → i_total = i1 × i2 = ${i_total.toFixed(2)} : 1`
        },
        {
          titulo: "Velocidades angulares por eje",
          formula: `n_entrada = ${n_in} rpm → n_intermedio = ${n_intermedia.toFixed(1)} rpm → n_salida = ${n_salida.toFixed(2)} rpm`
        },
        {
          titulo: "Multiplicación de Torque y Eficiencia Global",
          formula: `η_total = ${(eta_total * 100).toFixed(1)}% | T_entrada = ${T_in_Nm.toFixed(1)} N·m → T_salida = ${T_out_Nm.toFixed(1)} N·m`
        }
      ]
    };
  }

  /**
   * SIM-12: Verificación de selección mecánica y térmica de reductor industrial
   */
  function verificarReductorIndustrial(p) {
    const P_motor_kW = Number(p.P_motor_kW) || 75;
    const Fs_AGMA = Number(p.Fs_AGMA) || 1.5; // Factor de servicio por aplicación
    const P_cat_mec_kW = Number(p.P_catalogo_mecanica_kW) || 120;
    const P_cat_term_kW = Number(p.P_catalogo_termica_kW) || 85;
    const ft_temp = Number(p.factor_temperatura) || 0.90; // Corrección por T° ambiente > 20°C

    const P_req_mecanica = P_motor_kW * Fs_AGMA;
    const P_term_corregida = P_cat_term_kW * ft_temp;

    const cumpleMecanico = P_cat_mec_kW >= P_req_mecanica;
    const cumpleTermico = P_term_corregida >= P_motor_kW;

    return {
      P_req_mecanica,
      P_term_corregida,
      cumpleMecanico,
      cumpleTermico,
      steps: [
        {
          titulo: "Verificación de Capacidad Mecánica (Potencia Equivalente AGMA)",
          formula: `P_req = P_motor × Fs = ${P_motor_kW} × ${Fs_AGMA} = ${P_req_mecanica.toFixed(1)} kW vs Catálogo (${P_cat_mec_kW} kW) → ${cumpleMecanico ? "✔ CUMPLE" : "✖ INSUFICIENTE"}`
        },
        {
          titulo: "Verificación de Capacidad Térmica (Disipación de Calor sin Enfriador)",
          formula: `P_term_corr = ${P_cat_term_kW} × ${ft_temp} = ${P_term_corregida.toFixed(1)} kW vs P_motor (${P_motor_kW} kW) → ${cumpleTermico ? "✔ CUMPLE" : "⚠ REQUIERE INTERCAMBIADOR DE CALOR"}`
        }
      ]
    };
  }

  return {
    calcularTrenCompuesto,
    verificarReductorIndustrial
  };
})();
