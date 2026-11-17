/* ==========================================================================
   MECHPLANT - MOTOR DE TRANSMISIÓN POR CADENAS ANSI B29.1 (solver-cadenas.js)
   Basado en Shigley Cap. 17 y ANSI/ASME B29.1
   ========================================================================== */

window.MECHPLANT_SOLVER_CADENAS = (function () {
  /**
   * @param {Object} p - { paso_mm, Z1, Z2, rpm1, C_mm, P_motor_kW, Ks, hileras }
   */
  function calcularTransmisionCadena(p) {
    const paso = Number(p.paso_mm) || 25.4; // ej. #80 = 25.4 mm
    const Z1 = Number(p.Z1) || 19;
    const Z2 = Number(p.Z2) || 57;
    const n1 = Number(p.rpm1) || 300;
    const C = Number(p.C_mm) || 900;
    const P_kW = Number(p.P_motor_kW) || 22;
    const Ks = Number(p.Ks) || 1.3;
    const hileras = Number(p.hileras) || 1;

    if (Z1 < 9 || Z2 < Z1 || n1 <= 0 || paso <= 0) {
      return { error: "Verifique el número de dientes (Z1 >= 9, Z2 >= Z1) y la velocidad." };
    }

    const i_rel = Z2 / Z1;
    const n2 = n1 / i_rel;

    // Diámetros primitivos d = p / sin(180° / Z)
    const d1_mm = paso / Math.sin(Math.PI / Z1);
    const d2_mm = paso / Math.sin(Math.PI / Z2);

    // Velocidad lineal promedio v = (Z1 * p * n1) / 60,000 (m/s)
    const v_ms = (Z1 * paso * n1) / 60000;

    // Variación de velocidad por efecto poligonal (%) = (1 - cos(180°/Z1)) * 100
    const var_poligonal_pct = (1 - Math.cos(Math.PI / Z1)) * 100;

    // Longitud en pasos (eslabones) redondeada a número par (Shigley Ec. 17-33)
    const Cp = C / paso;
    const Lp_exacto = 2 * Cp + (Z1 + Z2) / 2 + Math.pow(Z2 - Z1, 2) / (4 * Math.pow(Math.PI, 2) * Cp);
    const Lp_par = Math.ceil(Lp_exacto / 2) * 2;

    // Potencia de diseño y fuerza de tracción útil Ft
    const P_diseno_kW = P_kW * Ks;
    const Ft_kN = P_diseno_kW / v_ms;
    const Ft_por_hilera_kN = Ft_kN / hileras;

    // Régimen de lubricación recomendado según velocidad lineal v
    let lubricacion = "Tipo I: Manual o goteo (v < 3.3 m/s)";
    if (v_ms >= 3.3 && v_ms < 7.6) lubricacion = "Tipo II: Baño de aceite o disco salpicador (3.3 - 7.6 m/s)";
    if (v_ms >= 7.6) lubricacion = "Tipo III: Chorros de aceite a presión con bomba (v >= 7.6 m/s)";

    return {
      i_rel,
      n2,
      d1_mm,
      d2_mm,
      v_ms,
      var_poligonal_pct,
      Lp_par,
      P_diseno_kW,
      Ft_kN,
      Ft_por_hilera_kN,
      lubricacion,
      steps: [
        {
          titulo: "Diámetros primitivos y velocidad lineal de la cadena",
          formula: `d1 = ${d1_mm.toFixed(1)} mm | d2 = ${d2_mm.toFixed(1)} mm | v = (Z1·p·n1)/60,000 = ${v_ms.toFixed(2)} m/s`
        },
        {
          titulo: "Efecto poligonal (fluctuación cordal de velocidad)",
          formula: `Δv/v = 1 - cos(180°/${Z1}) = ${var_poligonal_pct.toFixed(2)}% ${Z1 < 17 ? "(⚠ Z1 < 17 aumenta vibración)" : "(✔ Rango suave)"}`
        },
        {
          titulo: "Longitud total en eslabones (número par)",
          formula: `Lp = ${Lp_exacto.toFixed(1)} pasos → Seleccionar ${Lp_par} eslabones`
        },
        {
          titulo: "Tracción de diseño y régimen de lubricación ANSI B29.1",
          formula: `P_dis = ${P_diseno_kW.toFixed(1)} kW | Ft = ${Ft_kN.toFixed(2)} kN | ${lubricacion}`
        }
      ]
    };
  }

  return {
    calcularTransmisionCadena
  };
})();
