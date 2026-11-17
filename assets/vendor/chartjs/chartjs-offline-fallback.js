/**
 * MECHPLANT — Cargador Resiliente de Chart.js (Local Vendor + Fallback CDN)
 * Ruta: assets/js/vendor/chartjs/chartjs-offline-fallback.js
 * Garantiza que window.Chart esté disponible antes de montar sim-renderer.js.
 */
(function (global) {
  "use strict";

  const currentScript = document.currentScript;
  const basePath =
    currentScript && currentScript.src
      ? currentScript.src.replace(/chartjs-offline-fallback\.js(\?.*)?$/, "")
      : "../assets/js/vendor/chartjs/";

  const DEPENDENCIES = [
    {
      name: "Chart.js v4 UMD",
      isLoaded: () => typeof global.Chart === "function",
      localUrl: basePath + "chart.umd.min.js",
      cdnUrl: "https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"
    },
    {
      name: "Chart.js Annotation Plugin",
      isLoaded: () => Boolean(global.ChartAnnotation),
      localUrl: basePath + "chartjs-plugin-annotation.min.js",
      cdnUrl: "https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation@3.0.1/dist/chartjs-plugin-annotation.min.js",
      optional: true
    }
  ];

  function injectScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.crossOrigin = "anonymous";
      script.onload = () => resolve(src);
      script.onerror = () => {
        script.remove();
        reject(new Error(`[MECHPLANT Chart.js] Fallo al cargar: ${src}`));
      };
      document.head.appendChild(script);
    });
  }

  async function loadDependency(dep) {
    if (dep.isLoaded()) return { name: dep.name, source: "preloaded" };

    try {
      await injectScript(dep.localUrl);
      if (dep.isLoaded()) return { name: dep.name, source: "local" };
    } catch (_localErr) {
      // Continúa al espejo CDN
    }

    try {
      await injectScript(dep.cdnUrl);
      if (dep.isLoaded()) return { name: dep.name, source: "cdn" };
    } catch (cdnErr) {
      if (!dep.optional) throw cdnErr;
    }

    return { name: dep.name, source: "skipped" };
  }

  async function bootChartStack() {
    const report = [];
    for (const dep of DEPENDENCIES) {
      report.push(await loadDependency(dep));
    }

    global.MECHPLANT_CHARTJS_STATUS = {
      ready: true,
      modules: report
    };

    global.dispatchEvent(
      new CustomEvent("mechplant:chartjs-ready", { detail: global.MECHPLANT_CHARTJS_STATUS })
    );

    return global.MECHPLANT_CHARTJS_STATUS;
  }

  if (!global.MECHPLANT_CHARTJS_READY) {
    global.MECHPLANT_CHARTJS_READY = bootChartStack();
  }
})(typeof window !== "undefined" ? window : this);
