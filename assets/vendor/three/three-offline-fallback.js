/**
 * MECHPLANT — Cargador Resiliente de Three.js (Local Vendor + Fallback CDN)
 * Ruta: assets/js/vendor/three/three-offline-fallback.js
 * Garantiza que window.THREE, THREE.OrbitControls y THREE.GLTFLoader estén
 * disponibles antes de montar scene-manager.js y model-loader.js.
 */
(function (global) {
  "use strict";

  // Detecta dinámicamente el directorio base donde vive este script
  const currentScript = document.currentScript;
  const basePath =
    currentScript && currentScript.src
      ? currentScript.src.replace(/three-offline-fallback\.js(\?.*)?$/, "")
      : "../assets/js/vendor/three/";

  const DEPENDENCIES = [
    {
      name: "THREE Core (r128)",
      isLoaded: () => typeof global.THREE !== "undefined" && typeof global.THREE.WebGLRenderer === "function",
      localUrl: basePath + "three.min.js",
      cdnUrl: "https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"
    },
    {
      name: "THREE.OrbitControls",
      isLoaded: () => global.THREE && typeof global.THREE.OrbitControls === "function",
      localUrl: basePath + "OrbitControls.js",
      cdnUrl: "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"
    },
    {
      name: "THREE.GLTFLoader",
      isLoaded: () => global.THREE && typeof global.THREE.GLTFLoader === "function",
      localUrl: basePath + "GLTFLoader.js",
      cdnUrl: "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"
    }
  ];

  /**
   * Inyecta una etiqueta <script> secuencial y resuelve cuando termina de ejecutarse.
   */
  function injectScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.crossOrigin = "anonymous";

      script.onload = () => resolve(src);
      script.onerror = () => {
        script.remove();
        reject(new Error(`[MECHPLANT 3D] Fallo al cargar script: ${src}`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Carga cada dependencia probando primero el archivo local y luego el CDN.
   */
  async function loadDependency(dep) {
    if (dep.isLoaded()) {
      return { name: dep.name, source: "preloaded" };
    }

    try {
      await injectScript(dep.localUrl);
      if (dep.isLoaded()) {
        return { name: dep.name, source: "local" };
      }
    } catch (_localError) {
      // Silencioso: pasa al respaldo CDN si el archivo local no existe
    }

    try {
      await injectScript(dep.cdnUrl);
      if (dep.isLoaded()) {
        return { name: dep.name, source: "cdn" };
      }
    } catch (cdnError) {
      console.error(`[MECHPLANT 3D] No se pudo cargar ${dep.name} ni localmente ni desde CDN.`, cdnError);
      throw cdnError;
    }

    throw new Error(`[MECHPLANT 3D] ${dep.name} se descargó pero no registró su símbolo en window.THREE.`);
  }

  /**
   * Inicializa toda la pila 3D en orden estricto (Core -> Controls -> Loader).
   */
  async function bootThreeStack() {
    const report = [];
    for (const dep of DEPENDENCIES) {
      const status = await loadDependency(dep);
      report.push(status);
    }

    global.MECHPLANT_THREE_STATUS = {
      ready: true,
      timestamp: Date.now(),
      modules: report
    };

    global.dispatchEvent(
      new CustomEvent("mechplant:three-ready", {
        detail: global.MECHPLANT_THREE_STATUS
      })
    );

    return global.MECHPLANT_THREE_STATUS;
  }

  // Expone la promesa global para que visor-3d.html o scene-manager.js puedan hacer `await window.MECHPLANT_THREE_READY`
  if (!global.MECHPLANT_THREE_READY) {
    global.MECHPLANT_THREE_READY = bootThreeStack();
  }
})(typeof window !== "undefined" ? window : this);
