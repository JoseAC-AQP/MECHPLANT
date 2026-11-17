/* ==========================================================================
   MECHPLANT - MOTOR DE DIAGNÓSTICO PREDICTIVO Y CONFIABILIDAD (solver-vibraciones.js)
   Basado en ISO 20816-3 (Vibraciones) e ISO 14224 (Confiabilidad)
   ========================================================================== */

window.MECHPLANT_SOLVER_VIBRACIONES = (function () {
  /**
   * Evalúa severidad vibratoria RMS (mm/s) según ISO 20816-3 (Grupos 1 y 2)
   * @param {Object} p - { v_rms_mms, grupo, cimentacion, rpm }
   */
  function evaluarVibracionISO20816(p) {
    const v = Number(p.v_rms_mms);
    const grupo = p.grupo || "grupo2"; // grupo1 (>300 kW), grupo2 (15-300 kW)
    const base = p.cimentacion || "rigida"; // rigida o flexible
    const rpm = Number(p.rpm) || 1780;

    if (v < 0 || isNaN(v)) return { error: "Ingrese un valor válido de velocidad RMS (mm/s)." };

    // Límites referenciales ISO 20816-3 [AB, BC, CD] en mm/s RMS
    const limitesMap = {
      "grupo2-rigida":   [1.4, 2.8, 4.5],
      "grupo2-flexible": [2.3, 4.5, 7.1],
      "grupo1-rigida":   [2.3, 4.5, 7.1],
      "grupo1-flexible": [3.5, 7.1, 11.0]
    };

    const [limAB, limBC, limCD] = limitesMap[`${grupo}-${base}`] || limitesMap["grupo2-rigida"];

    let zona = "ZONA A (Máquina nueva / Óptima)";
    let estado = "ok";
    let accion = "Operación normal. Mantener monitoreo predictivo rutinario.";

    if (v > limAB && v <= limBC) {
      zona = "ZONA B (Aceptable para operación continua)";
      estado = "ok";
      accion = "Apta para servicio continuo sin restricciones. Registrar tendencia.";
    } else if (v > limBC && v <= limCD) {
      zona = "ZONA C (Insatisfactoria — Alarma)";
      estado = "warn";
      accion = "Operación limitada. Analizar espectro FFT (1X desbalanceo, 2X desalineamiento, BPFO/BPFI rodamientos) y programar intervención.";
    } else if (v > limCD) {
      zona = "ZONA D (Peligro — Daño mecánico inminente)";
      estado = "danger";
      accion = "Detención inmediata recomendada para evitar rotura catastrófica de eje, rodamientos o carcasa.";
    }

    const freq_1X_Hz = rpm / 60;

    return {
      v,
      zona,
      estado,
      accion,
      limites: { limAB, limBC, limCD },
      freq_1X_Hz,
      steps: [
        {
          titulo: "Frecuencia fundamental de giro (1X RPM)",
          formula: `f_1X = ${rpm} rpm / 60 = ${freq_1X_Hz.toFixed(2)} Hz (2X = ${(freq_1X_Hz * 2).toFixed(2)} Hz)`
        },
        {
          titulo: "Umbrales normativos ISO 20816-3 aplicables",
          formula: `Límite A/B = ${limAB} mm/s | Límite B/C = ${limBC} mm/s | Límite C/D = ${limCD} mm/s`
        },
        {
          titulo: "Clasificación de Severidad y Diagnóstico",
          formula: `Valor medido = ${v.toFixed(2)} mm/s RMS → ${zona}`
        }
      ]
    };
  }

  /**
   * Calcula indicadores de confiabilidad ISO 14224: MTBF, MTTR, Tasa de Fallas y Disponibilidad
   */
  function calcularConfiabilidadISO14224(p) {
    const tiempoTotal_h = Number(p.tiempoTotal_h);
    const numFallas = Number(p.numFallas);
    const tiempoReparacionTotal_h = Number(p.tiempoReparacionTotal_h) || 0;

    if (tiempoTotal_h <= 0 || numFallas <= 0) {
      return { error: "El tiempo calendario y el número de fallas deben ser mayores a cero." };
    }

    const tiempoOperativo_h = Math.max(0, tiempoTotal_h - tiempoReparacionTotal_h);
    const mtbf_h = tiempoOperativo_h / numFallas;
    const mttr_h = tiempoReparacionTotal_h / numFallas;
    const tasaFallas_lambda = 1 / mtbf_h;
    const disponibilidad_pct = (mtbf_h / (mtbf_h + mttr_h)) * 100;

    return {
      tiempoOperativo_h,
      mtbf_h,
      mttr_h,
      tasaFallas_lambda,
      disponibilidad_pct,
      steps: [
        {
          titulo: "Tiempo operativo neto (Uptime)",
          formula: `T_op = ${tiempoTotal_h} h - ${tiempoReparacionTotal_h} h = ${tiempoOperativo_h.toFixed(1)} h`
        },
        {
          titulo: "Tiempo Medio Entre Fallas (MTBF) y Tiempo Medio de Reparación (MTTR)",
          formula: `MTBF = ${tiempoOperativo_h.toFixed(1)} / ${numFallas} = ${mtbf_h.toFixed(1)} h | MTTR = ${mttr_h.toFixed(2)} h`
        },
        {
          titulo: "Disponibilidad Inherente (Ai)",
          formula: `Ai = MTBF / (MTBF + MTTR) = ${disponibilidad_pct.toFixed(2)}%`
        }
      ]
    };
  }

  return {
    evaluarVibracionISO20816,
    calcularConfiabilidadISO14224
  };
})();
