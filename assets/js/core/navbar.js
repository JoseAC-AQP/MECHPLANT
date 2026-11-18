/* ==========================================================================
   MECHPLANT - COMPONENTE DE NAVEGACIÓN DINÁMICA COMÚN (navbar.js)
   Se inyecta en <header id="mp-global-header"></header> en todas las páginas
   ========================================================================== */

(function () {
  const body = document.body;
  const root = body.getAttribute("data-root") || "";
  const activeSection = body.getAttribute("data-section") || "inicio";
  const breadcrumbLabel = body.getAttribute("data-breadcrumb") || "Panel Principal de Ingeniería";
  const db = window.MECHPLANT_DB;

  // Recuperar progreso y unidad preferida desde LocalStorage
  const savedUnit = localStorage.getItem("mp_unit_system") || "SI";
  const progressData = JSON.parse(localStorage.getItem("mp_progress") || '{"completedModules": [], "simsRun": 0}');
  const progressPct = Math.round((progressData.completedModules.length / 8) * 100);

  // Construir tarjetas del mega-menú de Módulos
  const modulesDropdownHTML = db.modules.map(m => `
    <a href="${root}${m.folder}" class="mp-drop-card">
      <span class="mp-drop-card__code">${m.code}</span>
      <span class="mp-drop-card__title">${m.title}</span>
      <span class="mp-drop-card__meta">Normas: ${m.normas.slice(0, 2).join(", ")}</span>
    </a>
  `).join("");

  // Construir tarjetas del mega-menú de Equipos
  const allEquipos = [
    ...db.equiposPorCategoria.minerales,
    ...db.equiposPorCategoria.auxiliares.slice(0, 2),
    ...db.equiposPorCategoria.manufactureros.slice(0, 1)
  ];
  const equiposDropdownHTML = allEquipos.map(eq => `
    <a href="${root}${eq.urlFicha}" class="mp-drop-card">
      <span class="mp-drop-card__code">${eq.code} • ${eq.proceso}</span>
      <span class="mp-drop-card__title">${eq.name}</span>
      <span class="mp-drop-card__meta">Módulos: ${eq.modulosRelacionados.join(", ")}</span>
    </a>
  `).join("");

  // Construir tarjetas del mega-menú de Simuladores (primeros 8 + enlace a todos)
  const simsDropdownHTML = db.simuladores.slice(0, 8).map(s => `
    <a href="${root}${s.url}" class="mp-drop-card">
      <span class="mp-drop-card__code">${s.code} • ${s.mod}</span>
      <span class="mp-drop-card__title">${s.name}</span>
    </a>
  `).join("") + `
    <a href="${root}simuladores/index.html" class="mp-drop-card" style="background: var(--color-cyan-100);">
      <span class="mp-drop-card__code">VER CATÁLOGO COMPLETO</span>
      <span class="mp-drop-card__title">Los 14 Simuladores de Ingeniería →</span>
    </a>
  `;

  // HTML de la Barra Global
  const headerHTML = `
    <nav class="mp-navbar" aria-label="Navegación principal MECHPLANT">
      <a href="${root}index.html" class="mp-brand">
        <div class="mp-brand__icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </div>
        <div class="mp-brand__text">
          <span class="mp-brand__title">MECHPLANT</span>
          <span class="mp-brand__sub">DISEÑO & MANTENIMIENTO</span>
        </div>
      </a>

      <ul class="mp-nav-list" id="mp-nav-menu">
        <li class="mp-nav-item">
          <a href="${root}modulos/index.html" class="mp-nav-link ${activeSection === 'modulos' ? 'is-active' : ''}">
            Ruta Académica ▾
          </a>
          <div class="mp-dropdown mp-dropdown--wide">
            ${modulesDropdownHTML}
          </div>
        </li>

        <li class="mp-nav-item">
          <a href="${root}equipos/index.html" class="mp-nav-link ${activeSection === 'equipos' ? 'is-active' : ''}">
            Equipos de Planta ▾
          </a>
          <div class="mp-dropdown mp-dropdown--wide">
            ${equiposDropdownHTML}
          </div>
        </li>

        <li class="mp-nav-item">
          <a href="${root}simuladores/index.html" class="mp-nav-link ${activeSection === 'simuladores' ? 'is-active' : ''}">
            Simuladores ▾
          </a>
          <div class="mp-dropdown mp-dropdown--wide">
            ${simsDropdownHTML}
          </div>
        </li>

        <li class="mp-nav-item">
          <a href="${root}lab-3d/index.html" class="mp-nav-link ${activeSection === 'lab3d' ? 'is-active' : ''}">
            Laboratorio 3D
          </a>
        </li>

        <li class="mp-nav-item">
          <a href="${root}casos-estudio/index.html" class="mp-nav-link ${activeSection === 'casos' ? 'is-active' : ''}">
            Casos de Falla
          </a>
        </li>

        <li class="mp-nav-item">
          <a href="${root}referencias/normativa-internacional.html" class="mp-nav-link ${activeSection === 'referencias' ? 'is-active' : ''}">
            Normas y Ref.
          </a>
        </li>
      </ul>

      <div class="mp-tools">
        <div class="mp-search-box">
          <span class="mp-search-icon">🔍</span>
          <input 
            type="search" 
            id="mp-global-search" 
            class="mp-search-input" 
            placeholder="Buscar tema, norma ISO, equipo..." 
            autocomplete="off"
          />
          <div id="mp-search-dropdown" class="mp-search-results"></div>
        </div>

        <button id="mp-unit-btn" class="mp-unit-toggle" title="Cambiar sistema de unidades global">
          ${savedUnit}
        </button>

        <div class="mp-progress-pill" title="Avance académico registrado en este navegador">
          <span>Avance:</span>
          <strong id="mp-nav-progress">${progressPct}%</strong>
        </div>

        <button id="mp-mobile-toggle" class="mp-mobile-btn" aria-label="Abrir menú">☰</button>
      </div>
    </nav>

    <div class="mp-subbar">
      <div class="mp-subbar__inner">
        <div class="mp-breadcrumb">
          <a href="${root}index.html">MECHPLANT</a>
          <span>/</span>
          <strong>${breadcrumbLabel}</strong>
        </div>
        <div class="mp-context-links">
          <a href="${root}simuladores/sim-04-diseno-ejes.html" class="mp-context-chip">⚡ Calc. Ejes</a>
          <a href="${root}simuladores/sim-07-seleccion-vida-rodamientos.html" class="mp-context-chip">⚡ Vida L10</a>
          <a href="${root}lab-3d/visor-3d.html?eq=chancadora-conica" class="mp-context-chip">🧊 Visor 3D</a>
        </div>
      </div>
    </div>
  `;

  const headerContainer = document.getElementById("mp-global-header");
  if (headerContainer) {
    headerContainer.innerHTML = headerHTML;
  }

  // Evento: Menú Móvil
  const mobileBtn = document.getElementById("mp-mobile-toggle");
  const navMenu = document.getElementById("mp-nav-menu");
  if (mobileBtn && navMenu) {
    mobileBtn.addEventListener("click", () => {
      navMenu.classList.toggle("is-mobile-open");
    });
  }

  // Evento: Cambio de Unidades SI <-> IPS
  const unitBtn = document.getElementById("mp-unit-btn");
  if (unitBtn) {
    unitBtn.addEventListener("click", () => {
      const current = localStorage.getItem("mp_unit_system") || "SI";
      const next = current === "SI" ? "IPS" : "SI";
      localStorage.setItem("mp_unit_system", next);
      unitBtn.textContent = next;
      window.dispatchEvent(new CustomEvent("mechplant:unitChange", { detail: { unit: next } }));
    });
  }

  // Evento: Buscador Técnico Predictivo
  const searchInput = document.getElementById("mp-global-search");
  const searchDropdown = document.getElementById("mp-search-dropdown");

  if (searchInput && searchDropdown) {
    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (q.length < 2) {
        searchDropdown.classList.remove("is-open");
        return;
      }

      const matches = [];

      // Buscar en módulos y normas
      db.modules.forEach(m => {
        const text = `${m.code} ${m.title} ${m.topics.join(" ")} ${m.normas.join(" ")}`.toLowerCase();
        if (text.includes(q)) {
          matches.push({ type: m.code, title: m.title, sub: `Normas: ${m.normas.join(", ")}`, url: root + m.folder });
        }
      });

      // Buscar en equipos
      Object.values(db.equiposPorCategoria).flat().forEach(eq => {
        const text = `${eq.name} ${eq.proceso} ${eq.componentes.join(" ")}`.toLowerCase();
        if (text.includes(q)) {
          matches.push({ type: "EQUIPO", title: eq.name, sub: eq.proceso, url: root + eq.urlFicha });
        }
      });

      // Buscar en simuladores
      db.simuladores.forEach(sim => {
        if (`${sim.code} ${sim.name}`.toLowerCase().includes(q)) {
          matches.push({ type: "SIMULADOR", title: sim.name, sub: `Asociado a ${sim.mod}`, url: root + sim.url });
        }
      });

      if (matches.length === 0) {
        searchDropdown.innerHTML = `<div class="mp-search-item"><small>Sin resultados técnicos para "${e.target.value}"</small></div>`;
      } else {
        searchDropdown.innerHTML = matches.slice(0, 7).map(item => `
          <a href="${item.url}" class="mp-search-item">
            <span class="tech-badge tech-badge--cyan">${item.type}</span>
            <div style="font-weight:700; font-size:0.86rem; margin-top:3px;">${item.title}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${item.sub}</div>
          </a>
        `).join("");
      }
      searchDropdown.classList.add("is-open");
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".mp-search-box")) {
        searchDropdown.classList.remove("is-open");
      }
    });
  }
