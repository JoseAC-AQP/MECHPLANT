export type UnitSystem = 'SI' | 'IMPERIAL';

export type AnalysisModuleId =
  | 'M1_AXIAL'
  | 'M2_SHEAR'
  | 'M3_BENDING'
  | 'M4_TORSION'
  | 'M5_COMBINED'
  | 'M6_SAFETY';

export type ComponentCategory = 'STRUCTURAL' | 'MACHINE' | 'INDUSTRIAL';

export type CrossSectionType = 'RECTANGULAR' | 'CIRCULAR' | 'TUBULAR' | 'I_BEAM';

export type SupportCondition =
  | 'FIXED_FREE' // Voladizo / Empotrado-Libre
  | 'PINNED_ROLLER' // Simplemente apoyada
  | 'FIXED_FIXED' // Doblemente empotrada / Doble cortante
  | 'SINGLE_SHEAR' // Cortante simple (1 plano)
  | 'DOUBLE_SHEAR'; // Cortante doble (2 planos)

export type LoadMode =
  | 'TENSION'
  | 'COMPRESSION'
  | 'POINT_LOAD'
  | 'DISTRIBUTED_LOAD'
  | 'TORQUE_CW'
  | 'TORQUE_CCW';

export type FailureCriterion = 'VON_MISES' | 'TRESCA';

export type StressFieldView = 'VON_MISES' | 'NORMAL' | 'SHEAR' | 'DISPLACEMENT';

export type CameraPreset = 'ISO' | 'FRONT' | 'SIDE' | 'TOP';

export interface MaterialSpec {
  id: string;
  name: string;
  standard: string;
  condition: string;
  elasticModulusMPa: number; // E (MPa)
  shearModulusMPa: number; // G (MPa)
  poissonRatio: number; // nu
  yieldStrengthMPa: number; // Sy (MPa)
  ultimateStrengthMPa: number; // Su (MPa)
  densityKgM3: number; // rho (kg/m3)
  colorHex: string;
  notes: string;
  isCustom?: boolean;
}

export interface ComponentDefinition {
  id: string;
  name: string;
  category: ComponentCategory;
  defaultModule: AnalysisModuleId;
  allowedModules: AnalysisModuleId[];
  defaultSection: CrossSectionType;
  defaultSupport: SupportCondition;
  defaultLoadMode: LoadMode;
  defaultMaterialId: string;
  description: string;
  industrialContext: string;
  geometryType:
    | 'CYLINDER_BAR'
    | 'RECT_BAR'
    | 'BEAM_PROFILE'
    | 'PLATE'
    | 'I_BEAM'
    | 'TRANSMISSION_SHAFT'
    | 'STEPPED_SHAFT'
    | 'KEY_JOINT'
    | 'BOLT_JOINT'
    | 'BEARING_SUPPORT'
    | 'LEVER_ARM'
    | 'BRACKET'
    | 'CONVEYOR_SHAFT'
    | 'MOTOR_MOUNT'
    | 'HOPPER_FRAME'
    | 'PULLEY_SUPPORT'
    | 'CRUSHER_ARM'
    | 'MACHINE_FRAME';
  defaults: {
    lengthMm: number;
    widthMm: number;
    heightMm: number;
    diameterMm: number;
    innerDiameterMm: number;
    thicknessMm: number;
    flangeThicknessMm: number;
    webThicknessMm: number;
    forceN: number;
    torqueNm: number;
    distributedLoadNPerMm: number;
    loadPositionRatio: number; // 0..1
    loadAngleDeg: number;
    shearPlanes: 1 | 2;
  };
}

export interface SimulationParams {
  componentId: string;
  moduleId: AnalysisModuleId;
  materialId: string;
  sectionType: CrossSectionType;
  supportCondition: SupportCondition;
  loadMode: LoadMode;
  failureCriterion: FailureCriterion;

  // Dimensions stored internally in canonical SI (mm, N, N·m, N/mm)
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  diameterMm: number;
  innerDiameterMm: number;
  thicknessMm: number;
  flangeThicknessMm: number;
  webThicknessMm: number;

  // Loads
  forceN: number;
  torqueNm: number;
  distributedLoadNPerMm: number;
  loadPositionRatio: number; // 0.05..0.95
  loadAngleDeg: number; // 0 = vertical downward / axial, etc.
  shearPlanes: 1 | 2;

  // Combined module toggles
  includeAxialInCombined: boolean;
  includeBendingInCombined: boolean;
  includeTorsionInCombined: boolean;
  includeShearInCombined: boolean;
}

export interface SectionProperties {
  areaMm2: number;
  inertiaZMm4: number;
  polarInertiaJmm4: number;
  sectionModulusMm3: number;
  yMaxMm: number;
  bearingAreaMm2: number;
  massKg: number;
}

export interface CalculationStep {
  label: string;
  formula: string;
  substitution: string;
  result: string;
}

export interface DiagramPoint {
  xMm: number;
  shearN: number;
  momentNm: number;
  deflectionMm: number;
  normalStressMPa: number;
  vonMisesMPa: number;
}

export interface RadialPoint {
  rMm: number;
  shearStressMPa: number;
}

export interface MohrCircleData {
  sigmaX: number;
  sigmaY: number;
  tauXY: number;
  centerSigma: number;
  radiusR: number;
  sigma1: number;
  sigma2: number;
  tauMaxAbs: number;
  principalAngleDeg: number;
}

export interface FemNodeResult {
  nodeIndex: number;
  xMm: number;
  displacementMm: number;
  rotationRad: number;
  axialOrShearStressMPa: number;
  bendingStressMPa: number;
  vonMisesMPa: number;
}

export interface FemSolution {
  available: boolean;
  methodLabel: string;
  elementType: string;
  numElements: number;
  numNodes: number;
  totalDofs: number;
  nodes: FemNodeResult[];
  maxDisplacementMm: number;
  maxStressMPa: number;
  analyticalDiffPercent: number;
  stiffnessMatrixNote: string;
}

export type SafetyStatus = 'SAFE' | 'REVIEW' | 'FAIL';

export interface AnalysisResult {
  section: SectionProperties;
  normalStressMPa: number;
  tensileMaxMPa: number;
  compressiveMaxMPa: number;
  shearStressMPa: number;
  bearingStressMPa: number;
  vonMisesMPa: number;
  trescaMPa: number;
  equivalentStressMPa: number;
  maxDisplacementMm: number;
  strainMicro: number;
  twistAngleDeg: number;
  torsionalStiffnessNmPerRad: number;
  reactionAN: number;
  reactionBN: number;
  reactionMomentANm: number;
  maxBendingMomentNm: number;
  maxShearForceN: number;
  safetyFactorVM: number;
  safetyFactorTresca: number;
  activeSafetyFactor: number;
  safetyStatus: SafetyStatus;
  safetyStatusLabel: string;
  maxStressLocationLabel: string;
  mohr: MohrCircleData;
  beamProfile: DiagramPoint[];
  radialProfile: RadialPoint[];
  steps: CalculationStep[];
  warnings: string[];
  fem: FemSolution;
  engineeringInterpretation: string;
}

export interface ViewportOptions {
  showOriginalGhost: boolean;
  showDeformed: boolean;
  showLoads: boolean;
  showSupports: boolean;
  showMesh: boolean;
  animateDeformation: boolean;
  amplificationFactor: number;
  stressField: StressFieldView;
  cameraPreset: CameraPreset;
  darkViewport: boolean;
}

export interface IndustrialCase {
  id: string;
  code: string;
  title: string;
  equipment: string;
  componentFunction: string;
  maintenanceProblem: string;
  actingLoadsSummary: string;
  geometrySummary: string;
  supportSummary: string;
  failureCauses: string[];
  maintenanceRecommendations: string[];
  redesignChallenge: string;
  targetSafetyFactor: number;
  params: SimulationParams;
}

export interface LearningQuestion {
  id: string;
  level: 1 | 2 | 3;
  title: string;
  context: string;
  type: 'MULTIPLE_CHOICE' | 'NUMERIC' | 'SIMULATION_CHALLENGE';
  prompt: string;
  options?: string[];
  correctOptionIndex?: number;
  numericTarget?: number;
  numericUnit?: string;
  numericTolerancePercent?: number;
  explanation: string;
  presetParams?: Partial<SimulationParams>;
  challengeCondition?: {
    minSafetyFactor: number;
    maxMassKg?: number;
    description: string;
  };
}
