/* ==========================================================================
   MECHPLANT - MOTOR DE ALINEAMIENTO DE EJES ROTATIVOS (solver-alineamiento.js)
   Cálculo de Offset, Angularidad, Shims de Motor y Tolerancias API 686
   ========================================================================== */

window.MECHPLANT_SOLVER_ALINEAMIENTO = (function () {
  /**
   * @param {Object} p - { rpm, D_acopl_mm, L1_patas_del_mm, L2_patas_tras_mm, offset_V_mm, gap_V_mm, offset_H_mm, gap_H_mm }
   */
  function calcularAlineamientoEjes(p) {
    const rpm = Number(p.rpm) || 1780;
    const D = Number(p.D_acopl_mm) || 200;       // Diámetro del acoplamiento (mm)
    const L1 = Number(p.L1_patas_del_mm) || 350; // Distancia centro acoplamiento a patas delanteras (mm)
    const L2 = Number(p.L2_patas_tras_mm) || 850;// Distancia centro acoplamiento a patas traseras (mm)

    const offV = Number(p.offset_V_mm) || 0;     // Offset vertical en acoplamiento (mm)
    const gapV = Number(p.gap_V_mm) || 0;        // Apertura angular vertical en diámetro D (mm)
    const offH = Number(p.offset_H_mm) || 0;     // Offset horizontal (mm)
    const gapH = Number(p.gap_H_mm) || 0;        // Apertura angular horizontal en diámetro D (mm)

    if (D <= 0 || L2 <= L1) {
      return { error: "Verifique que D > 0 y que L2 (patas traseras) sea mayor que L1 (patas delanteras)." };
    }

    // Angularidad en mm / 100 mm (mrad)
    const angV_mm100 = (gapV / D) * 100;
    const angH_mm100 = (gapH / D) * 100;

    // Cálculo de calzas (Shims) en plano vertical para llevar motor a cero
    // Desplazamiento vertical actual de patas delanteras y traseras:
    const pos_patas_del = offV + (gapV / D) * L1;
    const pos_patas_tras = offV + (gapV / D) * L2;

    // Corrección necesaria (signo opuesto a la desviación actual)
    const shim_del_mm = -pos_patas_del;
    const shim_tras_mm = -pos_patas_tras;

    // Tolerancias referenciales industriales según RPM (API 686 / estándar láser)
    let tol_offset_mm = 0.05;
    let tol_ang_mm100 = 0.05;
    if (rpm <= 1200) {
      tol_offset_mm = 0.08;
      tol_ang_mm100 = 0.07;
    } else if (rpm > 2500) {
      tol_offset_mm = 0.03;
      tol_ang_mm100 = 0.03;
    }

    const cumpleV = Math.abs(offV) <= tol_offset_mm && Math.abs(angV_mm100) <= tol_ang_mm100;
    const cumpleH = Math.abs(offH) <= tol_offset_mm && Math.abs(angH_mm100) <= tol_ang_mm100;
    const estadoGlobal = cumpleV && cumpleH ? "ok" : "danger";

    return {
      angV_mm100,
      angH_mm100,
      shim_del_mm,
      shim_tras_mm,
      tol_offset_mm,
      tol_ang_mm100,
      estadoGlobal,
      steps: [
        {
          titulo: "Angularidad en planos Vertical y Horizontal (mm / 100 mm)",
          formula: `Ang_V = (${gapV} / ${D}) × 100 = ${angV_mm100.toFixed(3)} mm/100mm | Ang_H = ${angH_mm100.toFixed(3)} mm/100mm`
        },
        {
          titulo: `Tolerancias Máximas Permitidas a ${rpm} rpm (API 686 / ANSI S2.75)`,
          formula: `Offset máx = ±${tol_offset_mm.toFixed(2)} mm | Angularidad máx = ±${tol_ang_mm100.toFixed(2)} mm/100mm → ${estadoGlobal === "ok" ? "✔ DENTRO DE TOLERANCIA" : "✖ FUERA DE TOLERANCIA (ALINEAR)"}`
        },
        {
          titulo: "Cálculo de Calzas (Shims) en Patas del Motor (+ Agregar / - Retirar)",
          formula: `Patas Delanteras (L1=${L1} mm): ${shim_del_mm >= 0 ? "+" : ""}${shim_del_mm.toFixed(2)} mm | Patas Traseras (L2=${L2} mm): ${shim_tras_mm >= 0 ? "+" : ""}${shim_tras_mm.toFixed(2)} mm`
        }
      ]
    };
  }

  return {
    calcularAlineamientoEjes
  };
})();
