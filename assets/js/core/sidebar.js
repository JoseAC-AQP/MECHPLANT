/* ==========================================================================
   MECHPLANT - PANEL LATERAL CONTEXTUAL DINÁMICO (sidebar.js)
   Se inyecta en <aside id="mp-contextual-sidebar" class="mp-sidebar"></aside>
   ========================================================================== */

(function () {
  const sidebarEl = document.getElementById("mp-contextual-sidebar");
  if (!sidebarEl) return;

  const body = document.body;
  const root = body.getAttribute("data-root") || "";
  const section = body.getAttribute("data-section") || "";
  const activeId = body.getAttribute("data-active-id") || "";
  const db = window.MECHPLANT_DB || {};

  let kicker = "NAVEGACIÓN";
  let title = "Índice Técnico";
  let linksHTML = "";

  // 1. Sidebar para RUTA ACADÉMICA (8 Módulos)
  if (section === "modulos" && db.modules) {
    kicker = "RUTA ACADÉMICA";
    title = "Módulos de Diseño";
    const progress = JSON.parse(localStorage.getItem("mp_progress") || '{"completedModules": []}');

    linksHTML = db.modules.map(m => {
      const isCurrent = activeId === m.id;
      const isDone = progress.completedModules.includes(m.id);
      return `
        <a href="${root}${m.folder}" class="mp-sidebar__link ${isCurrent ? 'is-active' : ''}">
          <span><strong>${m.code.replace("MÓDULO ", "M")}</strong>: ${m.title}</span>
          <span>${isDone ? "✔" : "→"}</span>
        </a>
      `;
    }).join("");
  }

  // 2. Sidebar para BIBLIOTECA DE EQUIPOS INDUSTRIALES
  else if (section === "equipos" && db.equiposPorCategoria) {
    kicker = "PLANTA INDUSTRIAL";
    title = "Equipos por Proceso";
    const allEq = [
      ...db.equiposPorCategoria.minerales,
      ...db.equiposPorCategoria.auxiliares,
      ...db.equiposPorCategoria.manufactureros
    ];

    linksHTML = allEq.map(eq => {
      const isCurrent = activeId === eq.id;
      return `
        <a href="${root}${eq.urlFicha}" class="mp-sidebar__link ${isCurrent ? 'is-active' : ''}">
          <span>${eq.name}</span>
          <span style="font-family:var(--font-mono); font-size:0.7rem;">${eq.code.split("-")[1]}</span>
        </a>
      `;
    }).join("");
  }

  // 3. Sidebar para LABORATORIO DE SIMULADORES (14 Calculadoras)
  else if (section === "simuladores" && db.simuladores) {
    kicker = "LABORATORIO DE CÁLCULO";
    title = "14 Simuladores";

    linksHTML = db.simuladores.map(sim => {
      const isCurrent = activeId === sim.id;
      return `
        <a href="${root}${sim.url}" class="mp-sidebar__link ${isCurrent ? 'is-active' : ''}">
          <span><strong>${sim.code}</strong>: ${sim.name}</span>
          <span class="tech-badge" style="font-size:0.65rem;">${sim.mod}</span>
        </a>
      `;
    }).join("");
  }

  // 4. Sidebar para CASOS DE ESTUDIO ABP
  else if (section === "casos") {
    kicker = "MANTENIMIENTO ABP";
    title = "Reportes de Falla";
    const casos = [
      { id: "caso-01", code: "OT-01", name: "Rodamiento Chancadora", url: "casos-estudio/caso-01-falla-rodamiento-chancadora.html" },
      { id: "caso-02", code: "OT-02", name: "Rotura Eje Transportador", url: "casos-estudio/caso-02-rotura-eje-transportador.html" },
      { id: "caso-03", code: "OT-03", name: "Desgaste Fajas Ventilador", url: "casos-estudio/caso-03-desgaste-prematuro-fajas.html" },
      { id: "caso-04", code: "OT-04", name: "Picadura Engranajes Reductor", url: "casos-estudio/caso-04-falla-engranajes-reductor.html" },
      { id: "caso-05", code: "OT-05", name: "Aflojamiento Pernos Molino", url: "casos-estudio/caso-05-aflojamiento-uniones-empernadas.html" }
    ];

    linksHTML = casos.map(c => `
      <a href="${root}${c.url}" class="mp-sidebar__link ${activeId === c.id ? 'is-active' : ''}">
        <span><strong>${c.code}</strong>: ${c.name}</span>
      </a>
    `).join("");
  }

  // 5. Sidebar para CENTRO NORMATIVO Y BIBLIOGRAFÍA
  else if (section === "referencias") {
    kicker = "DOCUMENTACIÓN TÉCNICA";
    title = "Normas y Bibliografía";
    const refs = [
      { id: "normas", name: "Normativa Internacional (ISO/ASME/SAE)", url: "referencias/normativa-internacional.html" },
      { id: "bibliografia", name: "Metodología Shigley vs. Norton", url: "referencias/bibliografia-shigley-norton.html" },
      { id: "glosario", name: "Glosario de Ingeniería y Fallas", url: "referencias/glosario-ingenieria.html" }
    ];

    linksHTML = refs.map(r => `
      <a href="${root}${r.url}" class="mp-sidebar__link ${activeId === r.id ? 'is-active' : ''}">
        <span>${r.name}</span>
      </a>
    `).join("");
  }

  sidebarEl.innerHTML = `
    <div class="mp-sidebar__header">
      <span class="mp-sidebar__kicker">${kicker}</span>
      <div class="mp-sidebar__title">${title}</div>
    </div>
    <nav class="mp-sidebar__nav" aria-label="${title}">
      ${linksHTML}
    </nav>
  `;
})();
