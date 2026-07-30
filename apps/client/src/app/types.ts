import type {
  AudioList,
  ModelList,
  MotionList,
  StageList,
} from "@wallpaper/player/types";

export interface BundledPlayerResources {
  audios: readonly AudioList[];
  models: readonly ModelList[];
  motions: readonly MotionList[];
  stages: readonly StageList[];
}

export interface WallpaperClientAppProps {
  bundledResources?: BundledPlayerResources;
  defaultSourceUrl: string | null;
}
