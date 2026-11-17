/* ==========================================================================
   MECHPLANT - DESPIECE EXPLOSIVO Y MODO RAYOS X 3D (exploded-view.js)
   Permite separar subconjuntos y transparentar carcasas en tiempo real
   ========================================================================== */

window.MECHPLANT_3D_EXPLODE = (function () {
  let targetFactor = 0;   // 0.0 (ensamblado) a 1.0 (despiece máximo)
  let currentFactor = 0;
  let xrayEnabled = false;

  function setExplodePercentage(pct) {
    const clamped = Math.max(0, Math.min(100, Number(pct) || 0));
    targetFactor = clamped / 100;
  }

  function toggleXRay(forceState) {
    xrayEnabled = typeof forceState === "boolean" ? forceState : !xrayEnabled;
    const parts = window.MECHPLANT_3D_LOADER ? window.MECHPLANT_3D_LOADER.getParts() : [];

    parts.forEach(mesh => {
      if (!mesh.material) return;
      if (xrayEnabled) {
        // Transparentar principalmente carcasas/bastidores exteriores
        const isHousing = (mesh.userData.meta?.nombre || "").toLowerCase().includes("carcasa") ||
                          (mesh.userData.meta?.nombre || "").toLowerCase().includes("tapa") ||
                          (mesh.userData.meta?.nombre || "").toLowerCase().includes("bastidor");
        mesh.material = mesh.userData.originalMaterial.clone();
        mesh.material.transparent = true;
        mesh.material.opacity = isHousing ? 0.22 : 0.88;
        mesh.material.wireframe = isHousing;
      } else {
        mesh.material = mesh.userData.originalMaterial;
      }
    });

    return xrayEnabled;
  }

  // Actualización interpolada en cada frame de SceneManager
  function update() {
    if (Math.abs(targetFactor - currentFactor) < 0.001) return;
    currentFactor += (targetFactor - currentFactor) * 0.12;

    const parts = window.MECHPLANT_3D_LOADER ? window.MECHPLANT_3D_LOADER.getParts() : [];
    parts.forEach(mesh => {
      if (mesh.userData.originPos && mesh.userData.explodeVector) {
        mesh.position.copy(mesh.userData.originPos).addScaledVector(mesh.userData.explodeVector, currentFactor);
      }
    });
  }

  return {
    setExplodePercentage,
    toggleXRay,
    update
  };
})();
