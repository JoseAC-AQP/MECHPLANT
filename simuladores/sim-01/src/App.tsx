import React, { useMemo, useRef, useState } from 'react';
import {
  BookmarkCheck,
  HelpCircle,
  PanelLeft,
  PanelRight,
  RotateCcw,
  Save,
} from 'lucide-react';
import { COMPONENT_LIBRARY, getComponentById } from './data/components';
import { DEFAULT_MATERIALS } from './data/materials';
import { analyzeComponent } from './engine/analyticalSolver';
import {
  AnalysisModuleId,
  ComponentDefinition,
  MaterialSpec,
  SimulationParams,
  UnitSystem,
  ViewportOptions,
} from './types/engineering';
import { ComponentLibrary } from './components/ComponentLibrary';
import { PropertiesPanel } from './components/PropertiesPanel';
import { Viewport3D, Viewport3DHandle } from './components/Viewport3D';
import { ResultsSummaryBar } from './components/ResultsSummaryBar';
import { ModulesOverviewView } from './components/ModulesOverviewView';
import { IndustrialCasesView } from './components/IndustrialCasesView';
import { LearningView } from './components/LearningView';
import { MaterialsView } from './components/MaterialsView';
import { ReportModal } from './components/ReportModal';
import { HelpModal } from './components/HelpModal';

type AppView = 'SIMULATOR' | 'MODULES' | 'CASES' | 'LEARNING' | 'MATERIALS';

function buildParamsFromComponent(comp: ComponentDefinition): SimulationParams {
  return {
    componentId: comp.id,
    moduleId: comp.defaultModule,
    materialId: comp.defaultMaterialId,
    sectionType: comp.defaultSection,
    supportCondition: comp.defaultSupport,
    loadMode: comp.defaultLoadMode,
    failureCriterion: 'VON_MISES',
    lengthMm: comp.defaults.lengthMm,
    widthMm: comp.defaults.widthMm,
    heightMm: comp.defaults.heightMm,
    diameterMm: comp.defaults.diameterMm,
    innerDiameterMm: comp.defaults.innerDiameterMm,
    thicknessMm: comp.defaults.thicknessMm,
    flangeThicknessMm: comp.defaults.flangeThicknessMm,
    webThicknessMm: comp.defaults.webThicknessMm,
    forceN: comp.defaults.forceN,
    torqueNm: comp.defaults.torqueNm,
    distributedLoadNPerMm: comp.defaults.distributedLoadNPerMm,
    loadPositionRatio: comp.defaults.loadPositionRatio,
    loadAngleDeg: comp.defaults.loadAngleDeg,
    shearPlanes: comp.defaults.shearPlanes,
    includeAxialInCombined: comp.defaultModule === 'M5_COMBINED',
    includeBendingInCombined: true,
    includeTorsionInCombined: true,
    includeShearInCombined: false,
  };
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('SIMULATOR');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('SI');
  const [materials, setMaterials] = useState<MaterialSpec[]>(() => {
    try {
      const saved = localStorage.getItem('stresslab_materials');
      return saved ? JSON.parse(saved) : DEFAULT_MATERIALS;
    } catch {
      return DEFAULT_MATERIALS;
    }
  });

  const [params, setParams] = useState<SimulationParams>(() => {
    const initialComp = getComponentById('viga');
    return buildParamsFromComponent(initialComp);
  });

  const [viewportOptions, setViewportOptions] = useState<ViewportOptions>({
    showOriginalGhost: false,
    showDeformed: true,
    showLoads: true,
    showSupports: true,
    showMesh: false,
    animateDeformation: false,
    amplificationFactor: 45,
    stressField: 'VON_MISES',
    cameraPreset: 'ISO',
    darkViewport: true,
  });

  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [hasSavedConfig, setHasSavedConfig] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('stresslab_saved_config'));
    } catch {
      return false;
    }
  });

  const viewportRef = useRef<Viewport3DHandle | null>(null);

  const activeComponent = useMemo(
    () => getComponentById(params.componentId),
    [params.componentId],
  );
  const activeMaterial = useMemo(
    () => materials.find((m) => m.id === params.materialId) ?? materials[0],
    [materials, params.materialId],
  );

  const analysisResult = useMemo(
    () => analyzeComponent(params, activeMaterial),
    [params, activeMaterial],
  );

  const notify = (msg: string) => {
    setStatusNotice(msg);
    window.setTimeout(() => setStatusNotice(null), 3200);
  };

  const handleSelectComponent = (comp: ComponentDefinition) => {
    setParams(buildParamsFromComponent(comp));
    setActiveView('SIMULATOR');
  };

  const handleDropComponent = (componentId: string) => {
    const comp = COMPONENT_LIBRARY.find((c) => c.id === componentId);
    if (comp) {
      setParams(buildParamsFromComponent(comp));
      notify(`Componente cargado: ${comp.name}`);
    }
  };

  const handleResetSimulation = () => {
    setParams(buildParamsFromComponent(activeComponent));
    viewportRef.current?.resetCamera();
    notify('Parámetros restablecidos a configuración nominal');
  };

  const handleSaveConfig = () => {
    try {
      localStorage.setItem('stresslab_saved_config', JSON.stringify(params));
      setHasSavedConfig(true);
      notify('Configuración guardada en este navegador');
    } catch {
      notify('No se pudo guardar en almacenamiento local');
    }
  };

  const handleLoadConfig = () => {
    try {
      const raw = localStorage.getItem('stresslab_saved_config');
      if (raw) {
        setParams(JSON.parse(raw));
        setActiveView('SIMULATOR');
        notify('Configuración guardada restaurada');
      }
    } catch {
      notify('Error al leer la configuración guardada');
    }
  };

  const handleOpenReport = () => {
    const snap = viewportRef.current?.captureSnapshot() ?? null;
    setSnapshotUrl(snap);
    setReportOpen(true);
  };

  const handleUpdateMaterial = (updated: MaterialSpec) => {
    setMaterials((prev) => {
      const next = prev.map((m) => (m.id === updated.id ? updated : m));
      try {
        localStorage.setItem('stresslab_materials', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleAddMaterial = (mat: MaterialSpec) => {
    setMaterials((prev) => {
      const next = [...prev, mat];
      try {
        localStorage.setItem('stresslab_materials', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    notify(`Material agregado: ${mat.name}`);
  };

  const handleResetMaterials = () => {
    setMaterials(DEFAULT_MATERIALS);
    try {
      localStorage.removeItem('stresslab_materials');
    } catch {
      // ignore
    }
    notify('Propiedades de materiales restauradas');
  };

  const handleActivateModule = (
    moduleId: AnalysisModuleId,
    preset: Partial<SimulationParams>,
  ) => {
    const comp = preset.componentId ? getComponentById(preset.componentId) : activeComponent;
    const base = buildParamsFromComponent(comp);
    setParams({ ...base, ...preset, moduleId });
    setActiveView('SIMULATOR');
  };

  const handleLoadCaseInSimulator = (caseParams: SimulationParams) => {
    setParams(caseParams);
    setActiveView('SIMULATOR');
    notify('Caso industrial cargado en el Simulador 3D');
  };

  const handleLoadLearningPreset = (patch: Partial<SimulationParams>) => {
    const comp = patch.componentId ? getComponentById(patch.componentId) : activeComponent;
    const base = buildParamsFromComponent(comp);
    setParams({ ...base, ...patch });
    setActiveView('SIMULATOR');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
      {/* Zone-3 Top Navigation Bar */}
      <header className="h-13 shrink-0 bg-white border-b border-slate-200 px-5 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Wordmark */}
        <a
          href="#simulador"
          onClick={(e) => {
            e.preventDefault();
            setActiveView('SIMULATOR');
          }}
          className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          STRESSLAB 3D
        </a>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
          {(
            [
              { id: 'SIMULATOR', label: 'Simulador 3D' },
              { id: 'MODULES', label: 'Módulos' },
              { id: 'CASES', label: 'Casos de Planta' },
              { id: 'LEARNING', label: 'Aprendizaje' },
              { id: 'MATERIALS', label: 'Materiales' },
            ] as { id: AppView; label: string }[]
          ).map((nav) => {
            const active = activeView === nav.id;
            return (
              <button
                key={nav.id}
                type="button"
                onClick={() => setActiveView(nav.id)}
                className={`py-3.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {nav.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleOpenReport}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Informe Técnico
          </button>
        </div>
      </header>

      {/* Mobile Navigation Selector */}
      <div className="md:hidden bg-white border-b border-slate-200 px-3 py-1.5 flex items-center gap-1 overflow-x-auto text-xs">
        {(
          [
            { id: 'SIMULATOR', label: 'Simulador 3D' },
            { id: 'MODULES', label: 'Módulos' },
            { id: 'CASES', label: 'Casos Planta' },
            { id: 'LEARNING', label: 'Aprendizaje' },
            { id: 'MATERIALS', label: 'Materiales' },
          ] as { id: AppView; label: string }[]
        ).map((nav) => (
          <button
            key={nav.id}
            type="button"
            onClick={() => setActiveView(nav.id)}
            className={`px-2.5 py-1 rounded whitespace-nowrap shrink-0 font-medium ${
              activeView === nav.id ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            {nav.label}
          </button>
        ))}
      </div>

      {/* Workspace CAE Utility Toolbar */}
      <div className="h-9 shrink-0 bg-slate-100 border-b border-slate-200 px-4 flex items-center justify-between gap-3 text-[11px] overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          {activeView === 'SIMULATOR' && (
            <>
              <button
                type="button"
                onClick={() => setShowLeftPanel((v) => !v)}
                className="px-2 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                title="Mostrar u ocultar biblioteca de componentes"
              >
                <PanelLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Componentes</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRightPanel((v) => !v)}
                className="px-2 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                title="Mostrar u ocultar panel de propiedades"
              >
                <PanelRight className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Parámetros</span>
              </button>
              <span className="text-slate-300">|</span>
            </>
          )}

          {/* Unit System Selector */}
          <div className="flex items-center gap-1 bg-white border border-slate-300 rounded p-0.5">
            <button
              type="button"
              onClick={() => setUnitSystem('SI')}
              className={`px-2 py-0.5 rounded font-medium cursor-pointer whitespace-nowrap ${
                unitSystem === 'SI'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SI (mm, N, MPa)
            </button>
            <button
              type="button"
              onClick={() => setUnitSystem('IMPERIAL')}
              className={`px-2 py-0.5 rounded font-medium cursor-pointer whitespace-nowrap ${
                unitSystem === 'IMPERIAL'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inglés (in, lbf, psi)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {statusNotice && (
            <span className="text-blue-700 font-medium px-2 whitespace-nowrap">
              {statusNotice}
            </span>
          )}

          <button
            type="button"
            onClick={handleResetSimulation}
            className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restablecer</span>
          </button>

          <button
            type="button"
            onClick={handleSaveConfig}
            className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <Save className="w-3 h-3" />
            <span>Guardar</span>
          </button>

          {hasSavedConfig && (
            <button
              type="button"
              onClick={handleLoadConfig}
              className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <BookmarkCheck className="w-3 h-3 text-emerald-600" />
              <span>Cargar</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Ayuda y Validación</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeView === 'SIMULATOR' && (
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {showLeftPanel && (
            <ComponentLibrary
              selectedComponentId={params.componentId}
              onSelectComponent={handleSelectComponent}
            />
          )}

          <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 relative">
              <Viewport3D
                ref={viewportRef}
                params={params}
                component={activeComponent}
                material={activeMaterial}
                result={analysisResult}
                options={viewportOptions}
                unitSystem={unitSystem}
                onDropComponent={handleDropComponent}
              />
            </div>

            <ResultsSummaryBar
              params={params}
              material={activeMaterial}
              materials={materials}
              result={analysisResult}
              unitSystem={unitSystem}
              viewportOptions={viewportOptions}
              onChangeViewport={(patch) =>
                setViewportOptions((prev) => ({ ...prev, ...patch }))
              }
            />
          </main>

          {showRightPanel && (
            <PropertiesPanel
              params={params}
              component={activeComponent}
              materials={materials}
              result={analysisResult}
              unitSystem={unitSystem}
              onChangeParams={(patch) =>
                setParams((prev) => ({ ...prev, ...patch }))
              }
            />
          )}
        </div>
      )}

      {activeView === 'MODULES' && (
        <ModulesOverviewView
          activeModuleId={params.moduleId}
          onActivateModule={handleActivateModule}
        />
      )}

      {activeView === 'CASES' && (
        <IndustrialCasesView
          materials={materials}
          unitSystem={unitSystem}
          onLoadCaseInSimulator={handleLoadCaseInSimulator}
        />
      )}

      {activeView === 'LEARNING' && (
        <LearningView
          currentParams={params}
          currentResult={analysisResult}
          onLoadPresetInSimulator={handleLoadLearningPreset}
        />
      )}

      {activeView === 'MATERIALS' && (
        <MaterialsView
          materials={materials}
          unitSystem={unitSystem}
          selectedMaterialId={params.materialId}
          onUpdateMaterial={handleUpdateMaterial}
          onAddMaterial={handleAddMaterial}
          onResetMaterials={handleResetMaterials}
          onSelectForSimulator={(matId) => {
            setParams((prev) => ({ ...prev, materialId: matId }));
            setActiveView('SIMULATOR');
          }}
        />
      )}

      {/* Modals */}
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        params={params}
        component={activeComponent}
        material={activeMaterial}
        result={analysisResult}
        unitSystem={unitSystem}
        snapshotDataUrl={snapshotUrl}
      />

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
