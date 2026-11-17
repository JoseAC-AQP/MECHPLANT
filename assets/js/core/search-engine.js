/* ==========================================================================
   MECHPLANT - MOTOR DE BÚSQUEDA TÉCNICA UNIFICADO (search-engine.js)
   Indexa Módulos, Equipos, Normas, Materiales y Simuladores
   ========================================================================== */

window.MECHPLANT_SEARCH = (function () {
  function normalizeText(str) {
    return (str || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function queryAll(rawQuery, rootPrefix = "") {
    const q = normalizeText(rawQuery).trim();
    if (q.length < 2) return [];

    const results = [];
    const db = window.MECHPLANT_DB || {};
    const normas = window.MECHPLANT_NORMAS || [];
    const comp = window.MECHPLANT_COMPONENTES || {};

    // 1. Módulos académicos
    (db.modules || []).forEach(m => {
      const haystack = normalizeText(`${m.code} ${m.title} ${m.topics.join(" ")} ${m.normas.join(" ")} ${m.equipos.join(" ")}`);
      if (haystack.includes(q)) {
        results.push({
          category: "MÓDULO",
          badge: m.code,
          title: m.title,
          subtitle: `Equipos: ${m.equipos.slice(0, 3).join(", ")}`,
          url: rootPrefix + m.folder,
          score: normalizeText(m.title).includes(q) ? 10 : 5
        });
      }
    });

    // 2. Equipos industriales
    Object.values(db.equiposPorCategoria || {}).flat().forEach(eq => {
      const haystack = normalizeText(`${eq.code} ${eq.name} ${eq.proceso} ${eq.componentes.join(" ")}`);
      if (haystack.includes(q)) {
        results.push({
          category: "EQUIPO",
          badge: eq.code,
          title: eq.name,
          subtitle: eq.proceso,
          url: rootPrefix + eq.urlFicha,
          score: normalizeText(eq.name).includes(q) ? 10 : 6
        });
      }
    });

    // 3. Simuladores de cálculo
    (db.simuladores || []).forEach(sim => {
      const haystack = normalizeText(`${sim.code} ${sim.name} ${sim.mod}`);
      if (haystack.includes(q)) {
        results.push({
          category: "SIMULADOR",
          badge: sim.code,
          title: sim.name,
          subtitle: `Herramienta de cálculo (${sim.mod})`,
          url: rootPrefix + sim.url,
          score: 9
        });
      }
    });

    // 4. Normativa internacional
    normas.forEach(n => {
      const haystack = normalizeText(`${n.codigo} ${n.organismo} ${n.titulo} ${n.aplicacion}`);
      if (haystack.includes(q)) {
        results.push({
          category: "NORMA",
          badge: n.codigo,
          title: `${n.codigo} — ${n.titulo}`,
          subtitle: `${n.tipo} • Módulos: ${n.modulos.join(", ")}`,
          url: `${rootPrefix}referencias/normativa-internacional.html?q=${encodeURIComponent(n.codigo)}`,
          score: normalizeText(n.codigo).includes(q) ? 12 : 4
        });
      }
    });

    // 5. Materiales de ingeniería
    (comp.materiales || []).forEach(mat => {
      const haystack = normalizeText(`${mat.designacion} ${mat.norma} ${mat.aplicacionTipica}`);
      if (haystack.includes(q)) {
        results.push({
          category: "MATERIAL",
          badge: mat.norma,
          title: mat.designacion,
          subtitle: `Sy: ${mat.Sy_MPa} MPa | Sut: ${mat.Sut_MPa} MPa`,
          url: `${rootPrefix}simuladores/sim-02-factor-seguridad.html`,
          score: 7
        });
      }
    });

    return results.sort((a, b) => b.score - a.score);
  }

  return {
    queryAll
  };
})();
