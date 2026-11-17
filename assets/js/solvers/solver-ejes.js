/* ==========================================================================
   MECHPLANT - MOTOR DE DISEÑO DE EJES POR FATIGA (solver-ejes.js)
   Criterio DE-Goodman Modificado (Shigley 11ª Ed. Cap. 7)
   ========================================================================== */

window.MECHPLANT_SOLVER_EJES = (function () {
  /**
   * Estima el límite de resistencia a la fatiga corregido Se (Marin)
   */
  function estimarLimiteFatigaSe(Sut_MPa, acabado = "maquinado", d_mm = 40, confiabilidad = 0.99) {
    const Se_prima = Sut_MPa <= 1400 ? 0.5 * Sut_MPa : 700;

    // Factor de superficie ka = a * Sut^b (Shigley Tabla 6-2)
    const surfMap = {
      rectificado: { a: 1.58, b: -0.085 },
      maquinado:   { a: 4.51, b: -0.265 },
      laminado:    { a: 57.7, b: -0.718 }
    };
    const sCoef = surfMap[acabado] || surfMap.maquinado;
    const ka = Math.min(1.0, sCoef.a * Math.pow(Sut_MPa, sCoef.b));

    // Factor de tamaño kb (Shigley Ec. 6-20)
    let kb = 1.0;
    if (d_mm >= 2.79 && d_mm <= 51) {
      kb = 1.24 * Math.pow(d_mm, -0.107);
    } else if (d_mm > 51 && d_mm <= 254) {
      kb = 1.51 * Math.pow(d_mm, -0.157);
    }

    // Factor de confiabilidad ke (Shigley Tabla 6-5)
    const relMap = { "0.50": 1.000, "0.90": 0.897, "0.99": 0.814, "0.999": 0.753 };
    const ke = relMap[String(confiabilidad)] || 0.814;

    const Se = ka * kb * ke * Se_prima;
    return { Se_prima, ka, kb, ke, Se };
  }

  /**
   * Calcula el diámetro mínimo requerido y verifica el diámetro propuesto por DE-Goodman
   * @param {Object} p - { Ma_Nm, Tm_Nm, Sut_MPa, Sy_MPa, Kf, Kfs, acabado, d_propuesto_mm, n_objetivo }
   */
  function disenarEjeGoodman(p) {
    const Ma = Number(p.Ma_Nm) || 0;
    const Tm = Number(p.Tm_Nm) || 0;
    const Sut = Number(p.Sut_MPa) || 625;
    const Sy = Number(p.Sy_MPa) || 530;
    const Kf = Number(p.Kf) || 1.6;
    const Kfs = Number(p.Kfs) || 1.4;
    const d_prop = Number(p.d_propuesto_mm) || 50;
    const n_obj = Number(p.n_objetivo) || 2.0;

    const marin = estimarLimiteFatigaSe(Sut, p.acabado || "maquinado", d_prop, 0.99);
    const Se = marin.Se;

    // Ecuación DE-Goodman (Shigley Ec. 7-8) para diámetro mínimo d_min (en mm)
    const termA = (2 * Kf * Ma * 1000) / Se;
    const termB = (Math.sqrt(3) * Kfs * Tm * 1000) / Sut;
    const d_min_mm = Math.pow((16 * n_obj / Math.PI) * (termA + termB), 1 / 3);

    // Verificación del diámetro propuesto d_prop
    const sigma_a_prima = (32 * Kf * Ma * 1000) / (Math.PI * Math.pow(d_prop, 3));
    const sigma_m_prima = Math.sqrt(3) * (16 * Kfs * Tm * 1000) / (Math.PI * Math.pow(d_prop, 3));

    const inv_n = (sigma_a_prima / Se) + (sigma_m_prima / Sut);
    const n_fatiga = inv_n > 0 ? 1 / inv_n : Infinity;

    // Verificación de fluencia en primer ciclo (Langer)
    const sigma_max_vm = sigma_a_prima + sigma_m_prima;
    const n_fluencia = sigma_max_vm > 0 ? Sy / sigma_max_vm : Infinity;

    return {
      Se,
      marin,
      d_min_mm,
      sigma_a_prima,
      sigma_m_prima,
      n_fatiga,
      n_fluencia,
      steps: [
        {
          titulo: "Límite de resistencia a la fatiga corregido (Ecuación de Marin)",
          formula: `Se' = ${marin.Se_prima.toFixed(0)} MPa | ka=${marin.ka.toFixed(2)}, kb=${marin.kb.toFixed(2)}, ke=${marin.ke.toFixed(2)} → Se = ${Se.toFixed(1)} MPa`
        },
        {
          titulo: "Esfuerzos equivalentes de Von Mises (Alternante σ'a y Medio σ'm)",
          formula: `σ'a = ${sigma_a_prima.toFixed(2)} MPa | σ'm = ${sigma_m_prima.toFixed(2)} MPa`
        },
        {
          titulo: "Diámetro mínimo requerido para Factor de Seguridad objetivo",
          formula: `d_min (DE-Goodman, n=${n_obj}) = ${d_min_mm.toFixed(2)} mm`
        },
        {
          titulo: "Factores de Seguridad reales para el diámetro seleccionado",
          formula: `n_fatiga (Goodman) = ${n_fatiga.toFixed(2)} | n_fluencia (Langer) = ${n_fluencia.toFixed(2)}`
        }
      ]
    };
  }

  return {
    estimarLimiteFatigaSe,
    disenarEjeGoodman
  };
})();
