/* ==========================================================================
   MECHPLANT - INICIALIZADOR GLOBAL DE APLICACIÓN (app-init.js)
   Orquesta utilidades compartidas, pestañas de temas y registro de visita
   ========================================================================== */

window.MECHPLANT_APP = (function () {
  const root = document.body.getAttribute("data-root") || "";
  const section = document.body.getAttribute("data-section") || "inicio";
  const pageTitle = document.body.getAttribute("data-breadcrumb") || document.title;

  // Resuelve una ruta relativa a la raíz del proyecto desde cualquier subnivel
  function resolvePath(relativePath) {
    if (!relativePath) return root + "index.html";
    if (relativePath.startsWith("http") || relativePath.startsWith("#")) return relativePath;
    return root + relativePath;
  }

  // Guarda la última lección o equipo visitado para retomarlo desde index.html
  function recordLastVisited() {
    if (section === "modulos" || section === "equipos" || section === "casos") {
      const currentHref = window.location.pathname.split("/mechplant/").pop() || "";
      if (currentHref && !currentHref.endsWith("index.html")) {
        localStorage.setItem("mp_last_visit", JSON.stringify({
          title: pageTitle,
          section: section,
          url: currentHref,
          timestamp: Date.now()
        }));
      }
    }
  }

  // Inicializa navegación por pestañas (Secciones A -> I de temas o bloques de equipos)
  function initTabs() {
    const tabGroups = document.querySelectorAll("[data-tab-group]");
    tabGroups.forEach(group => {
      const buttons = group.querySelectorAll(".mp-tab-btn");
      const targetContainerId = group.getAttribute("data-tab-group");
      const container = document.getElementById(targetContainerId);
      if (!container) return;

      buttons.forEach(btn => {
        btn.addEventListener("click", () => {
          const targetId = btn.getAttribute("data-tab-target");
          buttons.forEach(b => b.classList.remove("is-active"));
          btn.classList.add("is-active");

          const panels = container.querySelectorAll("[data-tab-panel]");
          panels.forEach(panel => {
            if (targetId === "all" || panel.getAttribute("data-tab-panel") === targetId) {
              panel.style.display = "";
            } else {
              panel.style.display = "none";
            }
          });
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    recordLastVisited();
    initTabs();
  });

  return {
    root,
    section,
    resolvePath
  };
})();
