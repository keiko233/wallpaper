import {
  DEFAULT_SKYBOXES,
  DEFAULT_STAGES,
} from "@wallpaper/player/defaults";
import type { BundledPlayerResources } from "./app/types";

export const DEFAULT_RESOURCE_SOURCE_URL =
  import.meta.env.VITE_DEFAULT_RESOURCE_SOURCE_URL?.trim() ||
  import.meta.env.VITE_RESOURCE_CATALOG_URL?.trim() ||
  null;

export const WALLPAPER_ENGINE_BUNDLED_RESOURCES: BundledPlayerResources =
  {
    ...__WALLPAPER_ENGINE_BUNDLED_RESOURCES__,
    skyboxes: [
      ...DEFAULT_SKYBOXES,
      ...__WALLPAPER_ENGINE_BUNDLED_RESOURCES__.skyboxes,
    ],
    stages: [
      ...DEFAULT_STAGES,
      ...__WALLPAPER_ENGINE_BUNDLED_RESOURCES__.stages,
    ],
  };
