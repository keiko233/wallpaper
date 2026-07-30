import type {
  ModelList,
  MotionList,
  StageList,
} from "@wallpaper/player/types";

export interface BundledPlayerResources {
  models: readonly ModelList[];
  motions: readonly MotionList[];
  stages: readonly StageList[];
}

export interface WallpaperClientAppProps {
  bundledResources?: BundledPlayerResources;
  defaultSourceUrl: string | null;
}
