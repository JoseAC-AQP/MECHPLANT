/* ==========================================================================
   MECHPLANT - INSPECTOR INTERACTIVO DE PIEZAS 3D (hotspot-inspector.js)
   Detecta clics sobre mallas 3D (Raycaster) y muestra ficha técnica vinculada
   ========================================================================== */

window.MECHPLANT_3D_INSPECTOR = (function () {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let selectedMesh = null;
  let inspectorPanelId = null;

  function init(panelId) {
    inspectorPanelId = panelId;
    const ctx = window.MECHPLANT_3D_SCENE ? window.MECHPLANT_3D_SCENE.getContext() : null;
    if (!ctx || !ctx.renderer) return;

    ctx.renderer.domElement.addEventListener("pointerdown", onPointerDown);
  }

  function onPointerDown(event) {
    const ctx = window.MECHPLANT_3D_SCENE.getContext();
    if (!ctx || !ctx.renderer || !ctx.camera) return;

    const rect = ctx.renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, ctx.camera);
    const parts = window.MECHPLANT_3D_LOADER ? window.MECHPLANT_3D_LOADER.getParts() : [];
    const intersects = raycaster.intersectObjects(parts, false);

    if (intersects.length > 0) {
      selectPart(intersects[0].object);
    }
  }

  function selectPart(mesh) {
    // Restaurar pieza previamente seleccionada
    if (selectedMesh && selectedMesh.userData.originalMaterial) {
      selectedMesh.material = selectedMesh.userData.originalMaterial;
    }

    selectedMesh = mesh;

    // Resaltar pieza seleccionada en Cian Ingeniería
    if (mesh && mesh.userData.originalMaterial) {
      const highlightMat = mesh.userData.originalMaterial.clone();
      highlightMat.emissive = new THREE.Color(0x0095D9);
      highlightMat.emissiveIntensity = 0.42;
      mesh.material = highlightMat;
    }

    renderPartDetails(mesh ? mesh.userData.meta : null);
  }

  function renderPartDetails(meta) {
    const panel = document.getElementById(inspectorPanelId);
    if (!panel) return;

    if (!meta) {
      panel.innerHTML = `
        <div class="mp-callout mp-callout--norma">
          <div class="mp-callout__title">🖱 Haz clic en cualquier componente 3D</div>
          <p style="font-size:0.84rem;">Selecciona un eje, engranaje, rodamiento o carcasa en el visor para inspeccionar su material, norma internacional, modo de falla y simulador.</p>
        </div>
      `;
      return;
    }

    panel.innerHTML = `
      <div style="border-bottom:1px solid var(--border-subtle); padding-bottom:10px; margin-bottom:12px;">
        <span class="tech-badge tech-badge--cyan">${meta.modulo}</span>
        <h3 style="font-size:1.12rem; color:var(--color-navy-800); margin-top:6px;">${meta.nombre}</h3>
        <div style="font-size:0.82rem; color:var(--text-muted);">${meta.elemento}</div>
      </div>

      <div style="display:grid; gap:10px; font-size:0.85rem; margin-bottom:16px;">
        <div>
          <strong>Material Típico:</strong><br/>
          <span style="font-family:var(--font-mono); font-size:0.8rem; color:var(--color-navy-700);">${meta.material}</span>
        </div>
        <div>
          <strong>Normativa Aplicable:</strong><br/>
          <span class="tech-badge">${meta.norma}</span>
        </div>
        <div class="mp-callout mp-callout--warning" style="margin:4px 0; padding:10px 12px;">
          <strong style="font-size:0.8rem;">⚠ Modo de Falla Frecuente en Planta:</strong>
          <p style="font-size:0.8rem; margin-top:2px;">${meta.fallaTipica}</p>
        </div>
      </div>

      <a href="${meta.simulador}" class="btn btn--primary" style="width:100%; font-size:0.84rem;">
        ⚡ Abrir Simulador de Cálculo
      </a>
    `;
  }

  return {
    init,
    selectPart,
    renderPartDetails
  };
})();
