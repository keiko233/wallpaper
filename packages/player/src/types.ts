export interface MotionList {
  id: string;
  name: string;
  motionPath: string[];
  audioPath: string;
  cameraPath?: string;
  cameraDelaySeconds?: number;
  /** Display group (source resource) when the motion has selectable variants. */
  group?: string;
  remark?: string;
}

export interface ModelList {
  id: string;
  name: string;
  modelPath: string;
  /** Display group (source resource) when the model has selectable variants. */
  group?: string;
  remark?: string;
}

/**
 * Runtime stage render profile. Structurally identical to the resource
 * catalog's StageRenderProfileSchema; kept local to avoid widening the
 * player's dependency ownership.
 */
export interface StageRenderProfile {
  materials?: {
    materialNames: string[];
    kind: "pbr";
    metallic: number;
    roughness: number;
    environmentIntensity: number;
    directIntensity: number;
    clearCoat?: {
      intensity: number;
      roughness: number;
    };
  }[];
  environment?: {
    texturePath: string;
    intensity: number;
    rotationY: number;
  };
  lighting?: {
    hemispheric?: {
      color: string;
      groundColor: string;
      intensityMultiplier: number;
    };
    directional?: {
      direction: [number, number, number];
      color: string;
      intensityMultiplier: number;
    };
    pointLights?: {
      name: string;
      position: [number, number, number];
      color: string;
      intensity: number;
      range: number;
    }[];
  };
  shadow?: {
    orthoScale: number;
    bias: number;
    normalBias: number;
    contactHardeningLightSizeUVRatio: number;
    excludedCasterMaterialNames?: string[];
  };
  reflection?: {
    materialNames: string[];
    textureSize: number;
    strength: number;
    blurKernel: number;
    planeOffset: number;
  };
  emissive?: {
    materialNames: string[];
    color: string;
    intensity: number;
  }[];
  bloom?: {
    intensityMultiplier: number;
    thresholdOffset: number;
  };
}

export interface StageList {
  id: string;
  name: string;
  stagePath: string | null;
  /** Display group (source resource) when the stage has selectable variants. */
  group?: string;
  remark?: string;
  render?: StageRenderProfile;
}

export interface SkyboxList {
  id: string;
  name: string;
  skyboxPath: string | null;
  /** Display group (source resource) when the skybox has selectable variants. */
  group?: string;
  remark?: string;
}

export interface MmdPlaylistItem {
  id: string;
  modelId: string;
  motionId: string;
  stageId: string;
  skyboxId: string;
}

export interface PersistedPlayerState {
  playlist?: readonly MmdPlaylistItem[];
  playlistIndex?: number;
  background?: string;
  volume?: number;
  playbackRate?: number;
  renderSettings?: MmdRenderSettings;
}

export interface PlayerPersistence {
  load(): Promise<PersistedPlayerState>;
  save(state: PersistedPlayerState): Promise<void>;
}

export type MmdMaterialRenderMode = "mmd" | "balanced" | "performance";

export type MmdQualityPreset = "performance" | "balanced" | "quality" | "ultra";

export type ShadowFilteringMode = "pcf" | "pcss";

export type SsrQualityLevel = "low" | "medium" | "high";

export type TextureAnisotropyLevel = 1 | 4 | 8 | 16;

/** Renderer frame rate cap in FPS (0 disables the cap). */
export type MmdFpsLimit = 0 | 30 | 60 | 120 | 144;

/**
 * Physics backend. "ammo" (Bullet via Ammo.js) reproduces the original
 * MMD physics: PMX joint springs and per-body damping are honored, which
 * is what video renders use. "havok" loads faster but drops those
 * parameters and clamps small joint limits, which can cause clipping.
 */
export type MmdPhysicsBackend = "ammo" | "havok";

export interface MmdRenderSettings {
  ambientLightIntensity: number;
  hemisphericLightIntensity: number;
  directionalLightIntensity: number;
  directionalLightColor: string;
  shadowOpacity: number;
  exposure: number;
  contrast: number;
  bloomEnabled: boolean;
  bloomIntensity: number;
  bloomThreshold: number;
  depthOfFieldEnabled: boolean;
  depthOfFieldFocusDistance: number;
  depthOfFieldAperture: number;
  vignetteEnabled: boolean;
  vignetteWeight: number;
  toneMappingEnabled: boolean;
  colorSaturation: number;
  materialRenderMode: MmdMaterialRenderMode;
  stageEffectsEnabled: boolean;
  applyAmbientColorToDiffuse: boolean;
  ignoreDiffuseWhenToonTextureIsNull: boolean;
  sphereTextureEnabled: boolean;
  toonTextureEnabled: boolean;
  /** Quality preset that last applied the batch below; recomputed from values. */
  qualityPreset: MmdQualityPreset;
  /** MSAA samples used by the rendering pipeline (1, 2, 4 or 8). */
  msaaSamples: number;
  /** Anisotropic filtering level for MMD diffuse and sphere textures. */
  textureAnisotropy: TextureAnisotropyLevel;
  /** Fast FXAA post-process applied on top of MSAA. */
  fxaaEnabled: boolean;
  /**
   * Render resolution multiplier (1, 1.5 or 2). Values above 1 supersample
   * the whole frame for stronger edge smoothing at a GPU cost.
   */
  supersamplingScale: number;
  /** Shadow map resolution (1024, 2048 or 4096). */
  shadowMapSize: number;
  /** Shadow filter: PCF (cheap, crisp) or PCSS (soft penumbra, contact-like). */
  shadowFiltering: ShadowFilteringMode;
  /** Screen-space ambient occlusion. Changing requires a reload. */
  ssaoEnabled: boolean;
  /** SSAO sample radius in world units. */
  ssaoRadius: number;
  /** SSAO occlusion strength. */
  ssaoStrength: number;
  /** Screen-space reflections. Changing requires a reload. */
  ssrEnabled: boolean;
  /** SSR reflection strength. */
  ssrStrength: number;
  /** SSR ray-marching budget. */
  ssrQuality: SsrQualityLevel;
  /**
   * MMD joint angular limit clamp in degrees. Lower values keep more of the
   * model's original joint motion (softer hair/skirt physics) at the cost of
   * constraint-solver stability. Changing requires a reload.
   */
  physicsConstraintLimitDegrees: number;
  /** Back light that separates the model silhouette from the background. */
  rimLightEnabled: boolean;
  rimLightIntensity: number;
  /** Physics engine: "ammo" is MMD-accurate, "havok" is lighter. */
  physicsBackend: MmdPhysicsBackend;
  /**
   * Bullet constraint solver iterations (5-30, ammo backend only). More
   * iterations resolve interpenetration more reliably at a CPU cost.
   */
  physicsSolverIterations: number;
  /** Physics simulation rate in Hz (30, 60 or 120). */
  physicsStepRate: number;
  /**
   * Renderer frame rate cap in FPS (0 disables the cap). Skips frames to
   * lower GPU usage, fan noise and power draw on high-refresh displays.
   */
  fpsLimit: MmdFpsLimit;
  /**
   * Global multiplier for PMX joint spring stiffness (0.5-3). Values below
   * 1 make hair and skirts softer and droopier; above 1 makes them stiffer.
   * Changing requires a reload.
   */
  physicsStrength: number;
}

/** Settings tuned by each quality preset. */
export interface RenderQualityPresetSettings {
  msaaSamples: number;
  textureAnisotropy: TextureAnisotropyLevel;
  shadowMapSize: number;
  shadowFiltering: ShadowFilteringMode;
  ssaoEnabled: boolean;
  ssaoRadius: number;
  ssaoStrength: number;
  ssrEnabled: boolean;
  ssrStrength: number;
  ssrQuality: SsrQualityLevel;
  physicsConstraintLimitDegrees: number;
  rimLightEnabled: boolean;
  rimLightIntensity: number;
  physicsBackend: MmdPhysicsBackend;
  physicsSolverIterations: number;
  physicsStepRate: number;
  physicsStrength: number;
}

export const RENDER_QUALITY_PRESETS: Record<
  MmdQualityPreset,
  RenderQualityPresetSettings
> = {
  performance: {
    msaaSamples: 1,
    textureAnisotropy: 1,
    shadowMapSize: 1024,
    shadowFiltering: "pcf",
    ssaoEnabled: false,
    ssaoRadius: 0.0006,
    ssaoStrength: 0.8,
    ssrEnabled: false,
    ssrStrength: 0.7,
    ssrQuality: "low",
    physicsConstraintLimitDegrees: 15,
    rimLightEnabled: false,
    rimLightIntensity: 0.3,
    physicsBackend: "havok",
    physicsSolverIterations: 6,
    physicsStepRate: 30,
    physicsStrength: 1,
  },
  balanced: {
    msaaSamples: 2,
    textureAnisotropy: 4,
    shadowMapSize: 1024,
    shadowFiltering: "pcf",
    ssaoEnabled: true,
    ssaoRadius: 0.0008,
    ssaoStrength: 0.9,
    ssrEnabled: false,
    ssrStrength: 0.7,
    ssrQuality: "low",
    physicsConstraintLimitDegrees: 10,
    rimLightEnabled: false,
    rimLightIntensity: 0.3,
    physicsBackend: "ammo",
    physicsSolverIterations: 10,
    physicsStepRate: 60,
    physicsStrength: 1,
  },
  quality: {
    msaaSamples: 4,
    textureAnisotropy: 8,
    shadowMapSize: 2048,
    shadowFiltering: "pcss",
    ssaoEnabled: true,
    ssaoRadius: 0.001,
    ssaoStrength: 1,
    ssrEnabled: false,
    ssrStrength: 0.7,
    ssrQuality: "medium",
    physicsConstraintLimitDegrees: 5,
    rimLightEnabled: true,
    rimLightIntensity: 0.3,
    physicsBackend: "ammo",
    physicsSolverIterations: 12,
    physicsStepRate: 60,
    physicsStrength: 1,
  },
  ultra: {
    msaaSamples: 8,
    textureAnisotropy: 16,
    shadowMapSize: 4096,
    shadowFiltering: "pcss",
    ssaoEnabled: true,
    ssaoRadius: 0.0012,
    ssaoStrength: 1.2,
    ssrEnabled: true,
    ssrStrength: 1,
    ssrQuality: "high",
    physicsConstraintLimitDegrees: 5,
    rimLightEnabled: true,
    rimLightIntensity: 0.4,
    physicsBackend: "ammo",
    physicsSolverIterations: 16,
    physicsStepRate: 120,
    physicsStrength: 1,
  },
};

export const RENDER_QUALITY_PRESET_KEYS: readonly (keyof RenderQualityPresetSettings)[] =
  [
    "msaaSamples",
    "textureAnisotropy",
    "shadowMapSize",
    "shadowFiltering",
    "ssaoEnabled",
    "ssaoRadius",
    "ssaoStrength",
    "ssrEnabled",
    "ssrStrength",
    "ssrQuality",
    "physicsConstraintLimitDegrees",
    "rimLightEnabled",
    "rimLightIntensity",
    "physicsBackend",
    "physicsSolverIterations",
    "physicsStepRate",
    "physicsStrength",
  ];

export const DEFAULT_MMD_RENDER_SETTINGS: MmdRenderSettings = {
  ambientLightIntensity: 0.5,
  hemisphericLightIntensity: 0.3,
  directionalLightIntensity: 0.7,
  directionalLightColor: "#FFFFFF",
  shadowOpacity: 0.4,
  exposure: 1,
  contrast: 1,
  bloomEnabled: true,
  bloomIntensity: 0.18,
  bloomThreshold: 0.72,
  depthOfFieldEnabled: false,
  depthOfFieldFocusDistance: 2000,
  depthOfFieldAperture: 2.8,
  vignetteEnabled: true,
  vignetteWeight: 1.3,
  toneMappingEnabled: true,
  colorSaturation: 8,
  materialRenderMode: "mmd",
  stageEffectsEnabled: true,
  applyAmbientColorToDiffuse: true,
  ignoreDiffuseWhenToonTextureIsNull: true,
  sphereTextureEnabled: true,
  toonTextureEnabled: true,
  qualityPreset: "quality",
  msaaSamples: 4,
  textureAnisotropy: 8,
  fxaaEnabled: true,
  supersamplingScale: 1,
  shadowMapSize: 2048,
  shadowFiltering: "pcss",
  ssaoEnabled: true,
  ssaoRadius: 0.001,
  ssaoStrength: 1,
  ssrEnabled: false,
  ssrStrength: 0.7,
  ssrQuality: "medium",
  physicsConstraintLimitDegrees: 5,
  rimLightEnabled: true,
  rimLightIntensity: 0.3,
  physicsBackend: "ammo",
  physicsSolverIterations: 12,
  physicsStepRate: 60,
  fpsLimit: 0,
  physicsStrength: 1,
};

/** Returns the preset whose tuned values match the given settings, or "custom". */
export function getRenderQualityPreset(
  settings: MmdRenderSettings,
): MmdQualityPreset | "custom" {
  for (const preset of RENDER_QUALITY_PRESET_KEYS) {
    const presetValue = RENDER_QUALITY_PRESETS[settings.qualityPreset][preset];
    if (settings[preset] !== presetValue) return "custom";
  }
  return settings.qualityPreset;
}

export function applyRenderQualityPreset(
  settings: MmdRenderSettings,
  preset: MmdQualityPreset,
): MmdRenderSettings {
  return {
    ...settings,
    ...RENDER_QUALITY_PRESETS[preset],
    qualityPreset: preset,
  };
}
