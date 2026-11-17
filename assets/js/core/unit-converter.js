/* ==========================================================================
   MECHPLANT - CONVERSOR DE UNIDADES DE INGENIERÍA SI <-> IPS (unit-converter.js)
   Factores exactos basados en NIST SP 811 y tablas de conversión de Shigley
   ========================================================================== */

window.MECHPLANT_UNITS = (function () {
  const FACTORS = {
    // Longitud: mm <-> in
    length_mm_to_in: 1 / 25.4,
    length_in_to_mm: 25.4,

    // Fuerza: N <-> lbf
    force_N_to_lbf: 1 / 4.4482216152605,
    force_lbf_to_N: 4.4482216152605,

    // Esfuerzo / Presión: MPa (N/mm²) <-> ksi (1000 psi)
    stress_MPa_to_ksi: 0.1450377377,
    stress_ksi_to_MPa: 6.8947572932,

    // Torque / Momento: N·m <-> lbf·in
    torque_Nm_to_lbfin: 8.8507457913,
    torque_lbfin_to_Nm: 0.112984829,

    // Potencia: kW <-> HP (mecánico 550 ft·lbf/s)
    power_kW_to_HP: 1.3410220896,
    power_HP_to_kW: 0.7456998716,

    // Velocidad lineal: m/s <-> ft/min (fpm)
    vel_ms_to_fpm: 196.8503937,
    vel_fpm_to_ms: 0.00508
  };

  function getCurrentSystem() {
    return localStorage.getItem("mp_unit_system") || "SI";
  }

  function convert(value, conversionKey, decimals = 3) {
    const factor = FACTORS[conversionKey];
    if (typeof value !== "number" || isNaN(value) || !factor) return NaN;
    return Number((value * factor).toFixed(decimals));
  }

  // Etiquetas estándar de unidades según el sistema activo
  function getLabels(system = getCurrentSystem()) {
    if (system === "IPS") {
      return {
        length: "in",
        force: "lbf",
        stress: "ksi",
        torque: "lbf·in",
        power: "HP",
        velocity: "ft/min",
        speed: "rpm"
      };
    }
    return {
      length: "mm",
      force: "N",
      stress: "MPa",
      torque: "N·m",
      power: "kW",
      velocity: "m/s",
      speed: "rpm"
    };
  }

  return {
    FACTORS,
    getCurrentSystem,
    convert,
    getLabels
  };
})();
