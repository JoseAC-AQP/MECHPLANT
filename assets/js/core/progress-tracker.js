/* ==========================================================================
   MECHPLANT - GESTOR DE PROGRESO ACADÉMICO LOCAL (progress-tracker.js)
   Persistencia en LocalStorage para avance modular, quizzes y simulaciones
   ========================================================================== */

window.MECHPLANT_PROGRESS = (function () {
  const STORAGE_KEY = "mp_progress";

  function getState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {
          completedModules: [],
          quizScores: {},
          simsRun: 0,
          casesSolved: []
        };
      }
      return JSON.parse(raw);
    } catch (e) {
      return { completedModules: [], quizScores: {}, simsRun: 0, casesSolved: [] };
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateNavbarPill(state);
  }

  function updateNavbarPill(state) {
    const pillEl = document.getElementById("mp-nav-progress");
    if (pillEl) {
      const pct = Math.round((state.completedModules.length / 8) * 100);
      pillEl.textContent = `${pct}%`;
    }
  }

  // Marca un módulo (ej. "m1") como completado
  function completeModule(moduleId) {
    const state = getState();
    if (!state.completedModules.includes(moduleId)) {
      state.completedModules.push(moduleId);
      saveState(state);
    }
    return state;
  }

  // Registra el resultado de una evaluación de módulo
  function saveQuizScore(moduleId, score, total) {
    const state = getState();
    state.quizScores[moduleId] = {
      score,
      total,
      pct: Math.round((score / total) * 100),
      date: new Date().toISOString().split("T")[0]
    };
    if (score / total >= 0.7 && !state.completedModules.includes(moduleId)) {
      state.completedModules.push(moduleId);
    }
    saveState(state);
    return state;
  }

  // Incrementa el contador cada vez que el estudiante ejecuta un simulador
  function incrementSimulationCount() {
    const state = getState();
    state.simsRun = (state.simsRun || 0) + 1;
    saveState(state);
    return state.simsRun;
  }

  // Marca un caso de estudio ABP como resuelto
  function markCaseSolved(caseId) {
    const state = getState();
    if (!state.casesSolved.includes(caseId)) {
      state.casesSolved.push(caseId);
      saveState(state);
    }
    return state;
  }

  function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("mp_last_visit");
    updateNavbarPill({ completedModules: [] });
  }

  return {
    getState,
    completeModule,
    saveQuizScore,
    incrementSimulationCount,
    markCaseSolved,
    resetAll
  };
})();
