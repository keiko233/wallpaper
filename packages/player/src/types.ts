export interface MotionList {
  id: string;
  name: string;
  motionPath: string[];
  audioPath: string;
  cameraPath?: string;
  cameraDelaySeconds?: number;
  remark?: string;
}

export interface ModelList {
  id: string;
  name: string;
  modelPath: string;
  remark?: string;
}

export interface StageList {
  id: string;
  name: string;
  stagePath: string | null;
  remark?: string;
}

export interface SkyboxList {
  id: string;
  name: string;
  skyboxPath: string | null;
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
  applyAmbientColorToDiffuse: boolean;
  ignoreDiffuseWhenToonTextureIsNull: boolean;
  sphereTextureEnabled: boolean;
  toonTextureEnabled: boolean;
}

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
  applyAmbientColorToDiffuse: true,
  ignoreDiffuseWhenToonTextureIsNull: true,
  sphereTextureEnabled: true,
  toonTextureEnabled: true,
};
