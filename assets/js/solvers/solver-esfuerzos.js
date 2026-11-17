/* ==========================================================================
   MECHPLANT - MOTOR DE CÁLCULO DE ESFUERZOS Y FALLA ESTÁTICA (solver-esfuerzos.js)
   Basado en Shigley 11ª Ed. (Caps. 3 y 5) y Norton 6ª Ed. (Cap. 4 y 5)
   ========================================================================== */

window.MECHPLANT_SOLVER_ESFUERZOS = (function () {
  /**
   * Calcula esfuerzos en un eje circular macizo bajo carga axial, flexión y torsión
   * @param {Object} p - { d_mm, F_axial_N, M_flector_Nm, T_torsor_Nm, Sy_MPa }
   */
  function calcularEstadoPlanoEje(p) {
    const d = Number(p.d_mm);
    const F = Number(p.F_axial_N) || 0;
    const M = Number(p.M_flector_Nm) || 0;
    const T = Number(p.T_torsor_Nm) || 0;
    const Sy = Number(p.Sy_MPa) || 250;

    if (d <= 0) return { error: "El diámetro del eje debe ser mayor que cero." };

    const area_mm2 = (Math.PI * Math.pow(d, 2)) / 4;
    const I_mm4 = (Math.PI * Math.pow(d, 4)) / 64;
    const J_mm4 = (Math.PI * Math.pow(d, 4)) / 32;
    const c_mm = d / 2;

    const sigma_axial = F / area_mm2; // MPa
    const sigma_flex = (M * 1000 * c_mm) / I_mm4; // MPa
    const sigma_x = sigma_axial + sigma_flex; // MPa
    const tau_xy = (T * 1000 * c_mm) / J_mm4; // MPa

    // Esfuerzos principales en el plano
    const sigma_med = sigma_x / 2;
    const radio_mohr = Math.sqrt(Math.pow(sigma_x / 2, 2) + Math.pow(tau_xy, 2));
    const sigma_1 = sigma_med + radio_mohr;
    const sigma_2 = sigma_med - radio_mohr;

    // Esfuerzo equivalente de Von Mises (Energía de Distorsión)
    const sigma_vm = Math.sqrt(Math.pow(sigma_x, 2) + 3 * Math.pow(tau_xy, 2));

    // Factor de seguridad por Von Mises (n_vm) y Tresca (n_tresca)
    const n_vm = sigma_vm > 0 ? Sy / sigma_vm : Infinity;
    const n_tresca = radio_mohr > 0 ? (Sy / 2) / radio_mohr : Infinity;

    return {
      area_mm2,
      sigma_axial,
      sigma_flex,
      sigma_x,
      tau_xy,
      sigma_1,
      sigma_2,
      tau_max: radio_mohr,
      sigma_vm,
      n_vm,
      n_tresca,
      steps: [
        {
          titulo: "Propiedades geométricas de la sección circular",
          formula: `A = π·d²/4 = ${area_mm2.toFixed(1)} mm² | I = π·d⁴/64 = ${I_mm4.toFixed(0)} mm⁴ | J = ${J_mm4.toFixed(0)} mm⁴`
        },
        {
          titulo: "Esfuerzo normal total (Axial + Flexión)",
          formula: `σ_x = (F/A) + (32·M)/(π·d³) = ${sigma_axial.toFixed(2)} + ${sigma_flex.toFixed(2)} = ${sigma_x.toFixed(2)} MPa`
        },
        {
          titulo: "Esfuerzo cortante por torsión",
          formula: `τ_xy = (16·T)/(π·d³) = ${tau_xy.toFixed(2)} MPa`
        },
        {
          titulo: "Esfuerzo equivalente de Von Mises y Factor de Seguridad",
          formula: `σ' = √(σ_x² + 3·τ_xy²) = ${sigma_vm.toFixed(2)} MPa → n (Von Mises) = Sy / σ' = ${n_vm.toFixed(2)}`
        }
      ]
    };
  }

  return {
    calcularEstadoPlanoEje
  };
})();
