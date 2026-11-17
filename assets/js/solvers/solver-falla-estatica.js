/* ==========================================================================
   MECHPLANT - MOTOR DE TEORÍAS DE FALLA ESTÁTICA (solver-falla-estatica.js)
   Soporta Materiales Dúctiles (Von Mises, Tresca) y Frágiles (Coulomb-Mohr)
   ========================================================================== */

window.MECHPLANT_SOLVER_FALLA_ESTATICA = (function () {
  /**
   * @param {Object} p - { tipoMaterial, sigma_x, sigma_y, tau_xy, Sy_MPa, Sut_MPa, Suc_MPa }
   */
  function evaluarFallaEstatica(p) {
    const tipo = p.tipoMaterial || "ductil"; // "ductil" o "fragil"
    const sx = Number(p.sigma_x) || 0;
    const sy = Number(p.sigma_y) || 0;
    const txy = Number(p.tau_xy) || 0;
    const Sy = Number(p.Sy_MPa) || 530;
    const Sut = Number(p.Sut_MPa) || 214;
    const Suc = Number(p.Suc_MPa) || 752;

    // 1. Esfuerzos principales en el plano (Círculo de Mohr)
    const sigma_avg = (sx + sy) / 2;
    const R = Math.sqrt(Math.pow((sx - sy) / 2, 2) + Math.pow(txy, 2));
    const s1 = sigma_avg + R;
    const s2 = sigma_avg - R;

    // Ordenar sA >= sB para evaluación 2D (s3 = 0)
    const vals = [s1, s2, 0].sort((a, b) => b - a);
    const sigma_A = vals[0];
    const sigma_B = vals[2];

    if (tipo === "ductil") {
      // Teoría de Von Mises (Energía de Distorsión)
      const sigma_vm = Math.sqrt(Math.pow(s1, 2) - s1 * s2 + Math.pow(s2, 2));
      const n_vm = sigma_vm > 0 ? Sy / sigma_vm : Infinity;

      // Teoría de Tresca (Esfuerzo Cortante Máximo)
      const tau_max_abs = (sigma_A - sigma_B) / 2;
      const n_tresca = tau_max_abs > 0 ? (Sy / 2) / tau_max_abs : Infinity;

      return {
        tipo: "ductil",
        s1,
        s2,
        tau_max_abs,
        sigma_vm,
        n_principal: n_vm,
        n_secundario: n_tresca,
        steps: [
          {
            titulo: "Esfuerzos principales en el plano (Círculo de Mohr)",
            formula: `σ1 = ${s1.toFixed(2)} MPa | σ2 = ${s2.toFixed(2)} MPa | τ_max(3D) = ${tau_max_abs.toFixed(2)} MPa`
          },
          {
            titulo: "Esfuerzo equivalente de Von Mises (Energía de Distorsión)",
            formula: `σ' = √(σ1² - σ1·σ2 + σ2²) = ${sigma_vm.toFixed(2)} MPa`
          },
          {
            titulo: "Factores de Seguridad Estáticos (Dúctil)",
            formula: `n_VonMises = Sy / σ' = ${n_vm.toFixed(2)} | n_Tresca (conservador) = (Sy/2) / τ_max = ${n_tresca.toFixed(2)}`
          }
        ]
      };
    } else {
      // Material frágil: Teoría de Coulomb-Mohr (Shigley Ec. 5-31)
      let inv_n = 0;
      if (s1 >= 0 && s2 >= 0) {
        inv_n = s1 / Sut;
      } else if (s1 >= 0 && s2 < 0) {
        inv_n = (s1 / Sut) - (s2 / Suc);
      } else {
        inv_n = -s2 / Suc;
      }
      const n_cm = inv_n > 0 ? 1 / inv_n : Infinity;

      return {
        tipo: "fragil",
        s1,
        s2,
        n_principal: n_cm,
        steps: [
          {
            titulo: "Esfuerzos principales en el plano",
            formula: `σ1 = ${s1.toFixed(2)} MPa | σ2 = ${s2.toFixed(2)} MPa`
          },
          {
            titulo: "Criterio de Coulomb-Mohr para materiales frágiles (Sut ≠ Suc)",
            formula: `1/n = (σ1/Sut) - (σ2/Suc) → n_CoulombMohr = ${n_cm.toFixed(2)}`
          }
        ]
      };
    }
  }

  return {
    evaluarFallaEstatica
  };
})();
