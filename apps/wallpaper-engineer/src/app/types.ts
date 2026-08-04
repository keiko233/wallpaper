import type {
  ModelList,
  MotionList,
  SkyboxList,
  StageList,
} from "@wallpaper/player/types";

export interface BundledPlayerResources {
  models: readonly ModelList[];
  motions: readonly MotionList[];
  skyboxes: readonly SkyboxList[];
  stages: readonly StageList[];
}

export interface WallpaperClientAppProps {
  bundledResources?: BundledPlayerResources;
  defaultSourceUrl: string | null;
}
