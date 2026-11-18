/**
 * MECHPLANT — Barra de Navegación Global Auto-Adaptativa (Raíz y Subcarpetas)
 * Ruta: assets/js/components/navbar.js
 */
(function () {
  "use strict";

  // Detecta la ruta raíz del proyecto a partir de la ubicación de este script
  const scriptTag = document.currentScript;
  let rootPrefix = "./";

  if (scriptTag && scriptTag.src) {
    // Si el script se cargó como "../assets/js/components/navbar.js", extrae "../"
    const rawAttr = scriptTag.getAttribute("src") || "";
    const match = rawAttr.match(/^(\.\.\/)+/);
    if (match) {
      rootPrefix = match[0];
    }
  }

  const NAV_ITEMS = [
    { label: "Inicio", href: "index.html", section: "inicio" },
    { label: "Módulos", href: "modulos/index.html", section: "modulos" },
    { label: "Equipos (19)", href: "equipos/index.html", section: "equipos" },
    { label: "Simuladores (14)", href: "simuladores/index.html", section: "simuladores" },
    { label: "Lab 3D", href: "lab-3d/index.html", section: "lab-3d" },
    { label: "Casos ABP", href: "casos-estudio/index.html", section: "casos-estudio" },
    { label: "Referencias", href: "referencias/index.html", section: "referencias" }
  ];

  function detectActiveSection() {
    const path = window.location.pathname.toLowerCase();
    for (const item of NAV_ITEMS) {
      if (item.section !== "inicio" && path.includes("/" + item.section + "/")) {
        return item.section;
      }
    }
    return "inicio";
  }

  function renderNavbar() {
    const host =
      document.getElementById("global-navbar") ||
      document.querySelector("header.mp-navbar") ||
      document.querySelector("header");

    if (!host) return;

    const activeSection = detectActiveSection();

    const linksHtml = NAV_ITEMS.map((item) => {
      const isActive = item.section === activeSection;
      return `
        <a href="${rootPrefix}${item.href}"
           class="mp-nav-link ${isActive ? "is-active" : ""}"
           ${isActive ? 'aria-current="page"' : ""}>
          ${item.label}
        </a>
      `;
    }).join("");

    host.classList.add("mp-navbar");
    host.innerHTML = `
      <div class="mp-navbar-inner">
        <a href="${rootPrefix}index.html" class="mp-brand">
          <span class="mp-brand-badge">MP</span>
          <span class="mp-brand-text">MECHPLANT</span>
        </a>

        <button type="button" class="mp-nav-toggle" aria-label="Abrir menú" aria-expanded="false">
          ☰
        </button>

        <nav class="mp-nav-menu" aria-label="Navegación principal">
          ${linksHtml}
        </nav>
      </div>
    `;

    const toggleBtn = host.querySelector(".mp-nav-toggle");
    const menu = host.querySelector(".mp-nav-menu");
    if (toggleBtn && menu) {
      toggleBtn.addEventListener("click", () => {
        const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
        toggleBtn.setAttribute("aria-expanded", String(!expanded));
        menu.classList.toggle("is-open", !expanded);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderNavbar);
  } else {
    renderNavbar();
  }
})();
