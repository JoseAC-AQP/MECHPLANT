/**
 * MECHPLANT — Cargador Resiliente de KaTeX (Local Vendor + Fallback CDN + Auto-Render)
 * Ruta: assets/js/vendor/katex/katex-offline-fallback.js
 * Garantiza que katex.min.css, katex.min.js y auto-render.min.js estén disponibles
 * tanto en entornos 100% offline como con conexión CDN, y renderiza automáticamente
 * las ecuaciones ($$ ... $$, $ ... $, \[ ... \], \( ... \)) en el DOM.
 */
(function (global) {
  "use strict";

  const currentScript = document.currentScript;
  const basePath =
    currentScript && currentScript.src
      ? currentScript.src.replace(/katex-offline-fallback\.js(\?.*)?$/, "")
      : "../assets/js/vendor/katex/";

  const KATEX_VERSION = "0.16.11";
  const CDN_BASE = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist`;

  const DELIMITERS = [
    { left: "$$", right: "$$", display: true },
    { left: "\\[", right: "\\]", display: true },
    { left: "$", right: "$", display: false },
    { left: "\\(", right: "\\)", display: false }
  ];

  const IGNORED_TAGS = new Set(["SCRIPT", "NOSCRIPT", "STYLE", "TEXTAREA", "PRE", "CODE"]);

  /**
   * Inyecta hoja de estilos CSS local con respaldo CDN si no existe previamente.
   */
  function ensureStylesheet(localHref, cdnHref) {
    return new Promise((resolve) => {
      const existing = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(
        (link) => link.href && link.href.includes("katex.min.css")
      );
      if (existing) {
        resolve("preloaded");
        return;
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = localHref;

      link.onload = () => resolve("local");
      link.onerror = () => {
        link.remove();
        const fallbackLink = document.createElement("link");
        fallbackLink.rel = "stylesheet";
        fallbackLink.href = cdnHref;
        fallbackLink.crossOrigin = "anonymous";
        fallbackLink.onload = () => resolve("cdn");
        fallbackLink.onerror = () => resolve("failed");
        document.head.appendChild(fallbackLink);
      };

      document.head.appendChild(link);
    });
  }

  /**
   * Inyecta un script secuencial probando primero la ruta local y luego el espejo CDN.
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
        reject(new Error(`[MECHPLANT KaTeX] Fallo al cargar: ${src}`));
      };

      document.head.appendChild(script);
    });
  }

  async function ensureScript(checkFn, localUrl, cdnUrl) {
    if (checkFn()) return "preloaded";

    try {
      await injectScript(localUrl);
      if (checkFn()) return "local";
    } catch (_err) {
      // Continúa al respaldo CDN si el archivo local no existe
    }

    try {
      await injectScript(cdnUrl);
      if (checkFn()) return "cdn";
    } catch (cdnErr) {
      console.warn(`[MECHPLANT KaTeX] No se pudo cargar ${localUrl} ni ${cdnUrl}`, cdnErr);
    }

    return "unavailable";
  }

  /**
   * Renderizador automático integrado de respaldo por si auto-render.min.js no está presente.
   */
  function builtinAutoRender(rootElement) {
    if (!global.katex || typeof global.katex.renderToString !== "function") return;

    const walker = document.createTreeWalker(rootElement, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || (!node.nodeValue.includes("$") && !node.nodeValue.includes("\\(") && !node.nodeValue.includes("\\["))) {
          return NodeFilter.FILTER_REJECT;
        }
        let parent = node.parentNode;
        while (parent) {
          if (IGNORED_TAGS.has(parent.nodeName) || (parent.classList && parent.classList.contains("katex"))) {
            return NodeFilter.FILTER_REJECT;
          }
          parent = parent.parentNode;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const textNodes = [];
    let current;
    while ((current = walker.nextNode())) {
      textNodes.push(current);
    }

    const tokenRegex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\$(?!\s)([^$\n]+?)(?<!\s)\$|\\\(([\s\S]+?)\\\))/g;

    textNodes.forEach((textNode) => {
      const text = textNode.nodeValue;
      let lastIndex = 0;
      let match;
      let hasMatch = false;
      const frag = document.createDocumentFragment();

      tokenRegex.lastIndex = 0;
      while ((match = tokenRegex.exec(text)) !== null) {
        hasMatch = true;
        if (match.index > lastIndex) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
        }

        const raw = match[0];
        let expr = raw;
        let displayMode = false;

        if (raw.startsWith("$$") && raw.endsWith("$$")) {
          expr = raw.slice(2, -2);
          displayMode = true;
        } else if (raw.startsWith("\\[") && raw.endsWith("\\]")) {
          expr = raw.slice(2, -2);
          displayMode = true;
        } else if (raw.startsWith("$") && raw.endsWith("$")) {
          expr = raw.slice(1, -1);
          displayMode = false;
        } else if (raw.startsWith("\\(") && raw.endsWith("\\)")) {
          expr = raw.slice(2, -2);
          displayMode = false;
        }

        const wrapper = document.createElement("span");
        wrapper.innerHTML = global.katex.renderToString(expr.trim(), {
          displayMode,
          throwOnError: false
        });
        frag.appendChild(wrapper);
        lastIndex = match.index + raw.length;
      }

      if (hasMatch) {
        if (lastIndex < text.length) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex)));
        }
        textNode.parentNode.replaceChild(frag, textNode);
      }
    });
  }

  /**
   * Expone helper global para re-renderizar contenedores dinámicos (resultados de simuladores).
   */
  function renderMathInContainer(target = document.body) {
    if (!target) return;
    if (typeof global.renderMathInElement === "function") {
      global.renderMathInElement(target, {
        delimiters: DELIMITERS,
        throwOnError: false
      });
    } else {
      builtinAutoRender(target);
    }
  }

  async function bootKatexStack() {
    const cssSource = await ensureStylesheet(
      basePath + "katex.min.css",
      `${CDN_BASE}/katex.min.css`
    );

    const coreSource = await ensureScript(
      () => global.katex && typeof global.katex.renderToString === "function",
      basePath + "katex.min.js",
      `${CDN_BASE}/katex.min.js`
    );

    const autoRenderSource = await ensureScript(
      () => typeof global.renderMathInElement === "function",
      basePath + "auto-render.min.js",
      `${CDN_BASE}/contrib/auto-render.min.js`
    );

    const status = {
      ready: coreSource !== "unavailable",
      css: cssSource,
      core: coreSource,
      autoRender: autoRenderSource,
      renderMath: renderMathInContainer
    };

    global.MECHPLANT_KATEX_STATUS = status;
    global.renderMechplantMath = renderMathInContainer;

    const runInitialRender = () => renderMathInContainer(document.body);
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", runInitialRender, { once: true });
    } else {
      runInitialRender();
    }

    global.dispatchEvent(new CustomEvent("mechplant:katex-ready", { detail: status }));
    return status;
  }

  if (!global.MECHPLANT_KATEX_READY) {
    global.MECHPLANT_KATEX_READY = bootKatexStack();
  }
})(typeof window !== "undefined" ? window : this);
