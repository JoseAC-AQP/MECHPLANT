/* ==========================================================================
   MECHPLANT - MOTOR DE AJUSTES Y TOLERANCIAS ISO 286 (solver-tolerancias.js)
   Basado en ISO 286-1 / 286-2 (Sistema Agujero Base H7)
   ========================================================================== */

window.MECHPLANT_SOLVER_TOLERANCIAS = (function () {
  // Tabla simplificada de desviaciones en micras (µm) para diámetros nominales estándar (mm)
  // Formato: [rangoMin, rangoMax, IT7, IT6, f7_sup, f7_inf, g6_sup, g6_inf, h6_sup, h6_inf, js6_sym, k6_inf, k6_sup, m6_inf, m6_sup, p6_inf, p6_sup]
  const ISO286_TABLE = [
    { min: 10,  max: 18,  IT7: 18, IT6: 11, f7: [-16, -34], g6: [-6, -17],  h6: [0, -11], js6: [5.5, -5.5], k6: [1, 12],  m6: [7, 18],  p6: [18, 29] },
    { min: 18,  max: 30,  IT7: 21, IT6: 13, f7: [-20, -41], g6: [-7, -20],  h6: [0, -13], js6: [6.5, -6.5], k6: [2, 15],  m6: [8, 21],  p6: [22, 35] },
    { min: 30,  max: 50,  IT7: 25, IT6: 16, f7: [-25, -50], g6: [-9, -25],  h6: [0, -16], js6: [8.0, -8.0], k6: [2, 18],  m6: [9, 25],  p6: [26, 42] },
    { min: 50,  max: 80,  IT7: 30, IT6: 19, f7: [-30, -60], g6: [-10, -29], h6: [0, -19], js6: [9.5, -9.5], k6: [2, 21],  m6: [11, 30], p6: [32, 51] },
    { min: 80,  max: 120, IT7: 35, IT6: 22, f7: [-36, -71], g6: [-12, -34], h6: [0, -22], js6: [11.0, -11.0], k6: [3, 25], m6: [13, 35], p6: [37, 59] },
    { min: 120, max: 180, IT7: 40, IT6: 25, f7: [-43, -83], g6: [-14, -39], h6: [0, -25], js6: [12.5, -12.5], k6: [3, 28], m6: [15, 40], p6: [43, 68] }
  ];

  function calcularAjusteISO286(p) {
    const D = Number(p.diametro_nominal_mm);
    const ejeClase = (p.clase_eje || "k6").toLowerCase(); // f7, g6, h6, js6, k6, m6, p6

    if (D <= 10 || D > 180) {
      return { error: "Ingrese un diámetro nominal entre 10 mm y 180 mm." };
    }

    const row = ISO286_TABLE.find(r => D > r.min && D <= r.max);
    if (!row || !row[ejeClase]) {
      return { error: "Clase de tolerancia de eje no soportada en la tabla ISO 286." };
    }

    // Agujero Base H7: EI = 0, ES = +IT7 (en µm)
    const H7_inf_um = 0;
    const H7_sup_um = row.IT7;

    // Eje (en µm)
    let eje_sup_um, eje_inf_um;
    if (ejeClase === "k6" || ejeClase === "m6" || ejeClase === "p6") {
      eje_inf_um = row[ejeClase][0];
      eje_sup_um = row[ejeClase][1];
    } else {
      eje_sup_um = row[ejeClase][0];
      eje_inf_um = row[ejeClase][1];
    }

    // Límites dimensionales en mm
    const D_max_mm = D + H7_sup_um / 1000;
    const D_min_mm = D + H7_inf_um / 1000;
    const d_max_mm = D + eje_sup_um / 1000;
    const d_min_mm = D + eje_inf_um / 1000;

    // Diferencias extremas (en µm): positivo = Juego, negativo = Interferencia (Apriete)
    const dif_max_um = H7_sup_um - eje_inf_um; // Juego máximo o apriete mínimo
    const dif_min_um = H7_inf_um - eje_sup_um; // Juego mínimo o apriete máximo

    let tipoAjuste = "Ajuste Indeterminado / de Transición";
    let recomendacion = "Adecuado para cubos de poleas, acoplamientos y aros interiores de rodamientos con carga rotativa moderada.";

    if (dif_min_um >= 0) {
      tipoAjuste = "Ajuste con Juego (Holgura)";
      recomendacion = "Adecuado para bujes deslizantes, espaciadores y alojamientos de rodamientos flotantes.";
    } else if (dif_max_um <= 0) {
      tipoAjuste = "Ajuste con Interferencia (Apriete Forzado)";
      recomendacion = "Requiere montaje térmico (calentador de inducción) o prensa hidráulica. Ideal para engranajes y rodamientos altamente cargados.";
    }

    return {
      D,
      ejeClase,
      D_max_mm,
      D_min_mm,
      d_max_mm,
      d_min_mm,
      dif_max_um,
      dif_min_um,
      tipoAjuste,
      recomendacion,
      steps: [
        {
          titulo: `Límites del Agujero Base (${D} H7)`,
          formula: `EI = 0 µm | ES = +${H7_sup_um} µm → Ø Agujero: [${D_min_mm.toFixed(3)} mm ; ${D_max_mm.toFixed(3)} mm]`
        },
        {
          titulo: `Límites del Eje (${D} ${ejeClase})`,
          formula: `ei = ${eje_inf_um > 0 ? "+" : ""}${eje_inf_um} µm | es = ${eje_sup_um > 0 ? "+" : ""}${eje_sup_um} µm → Ø Eje: [${d_min_mm.toFixed(3)} mm ; ${d_max_mm.toFixed(3)} mm]`
        },
        {
          titulo: "Valores Extremos de Ajuste (Juego + / Interferencia -)",
          formula: `Extremo Superior = ${dif_max_um > 0 ? "+" : ""}${dif_max_um} µm | Extremo Inferior = ${dif_min_um > 0 ? "+" : ""}${dif_min_um} µm → ${tipoAjuste}`
        }
      ]
    };
  }

  return {
    calcularAjusteISO286
  };
})();
