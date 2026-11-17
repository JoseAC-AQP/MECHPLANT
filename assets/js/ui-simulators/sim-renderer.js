/* ==========================================================================
   MECHPLANT - RENDERIZADOR COMÚN DE SIMULADORES (sim-renderer.js)
   Estándar visual para KPIs, semáforos de seguridad y memoria paso a paso
   ========================================================================== */

window.MECHPLANT_SIM_UI = (function () {
  /**
   * Renderiza los resultados de un simulador en un contenedor estándar
   * @param {string} containerId - ID del div de resultados
   * @param {Object} config - { kpis: [{ label, value, status }], steps: [{ titulo, formula }], notaNormativa }
   */
  function renderResults(containerId, config) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (config.error) {
      container.innerHTML = `
        <div class="mp-callout mp-callout--danger">
          <div class="mp-callout__title">⚠ Error en parámetros de entrada</div>
          <p>${config.error}</p>
        </div>
      `;
      return;
    }

    // Registrar ejecución en progreso académico
    if (window.MECHPLANT_PROGRESS) {
      window.MECHPLANT_PROGRESS.incrementSimulationCount();
    }

    const kpisHTML = (config.kpis || []).map(k => {
      const modClass = k.status ? `mp-kpi-card--${k.status}` : "";
      return `
        <div class="mp-kpi-card ${modClass}">
          <div class="mp-kpi-card__label">${k.label}</div>
          <div class="mp-kpi-card__value">${k.value}</div>
        </div>
      `;
    }).join("");

    const stepsHTML = (config.steps || []).map(s => `
      <div class="mp-calc-step">
        <div class="mp-calc-step__title">${s.titulo}</div>
        <div class="mp-calc-step__math">${s.formula}</div>
      </div>
    `).join("");

    const notaHTML = config.notaNormativa
      ? `<div class="mp-callout mp-callout--norma" style="margin-top:16px;">
           <div class="mp-callout__title">📐 Criterio Normativo y de Mantenimiento</div>
           <p style="font-size:0.86rem;">${config.notaNormativa}</p>
         </div>`
      : "";

    container.innerHTML = `
      <div class="mp-kpi-grid">${kpisHTML}</div>
      <h4 style="font-size:0.95rem; color:var(--color-navy-800); margin: 14px 0 8px;">
        Memoria de Cálculo Paso a Paso
      </h4>
      <div class="mp-calc-steps">${stepsHTML}</div>
      ${notaHTML}
      <div style="margin-top:16px; display:flex; justify-content:flex-end;">
        <button type="button" class="btn btn--outline-dark" onclick="window.print()" style="font-size:0.8rem;">
          🖨 Imprimir / Exportar Memoria PDF
        </button>
      </div>
    `;
  }

  return {
    renderResults
  };
})();
