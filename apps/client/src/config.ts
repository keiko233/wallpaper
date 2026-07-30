import { DEFAULT_STAGES } from "@wallpaper/player/defaults";
import type { BundledPlayerResources } from "./app/types";

export const CLIENT_TARGET =
  import.meta.env.VITE_CLIENT_TARGET === "wallpaper-engine"
    ? "wallpaper-engine"
    : "web";

export const DEFAULT_RESOURCE_SOURCE_URL =
  import.meta.env.VITE_DEFAULT_RESOURCE_SOURCE_URL?.trim() ||
  import.meta.env.VITE_RESOURCE_CATALOG_URL?.trim() ||
  null;

const WEB_SYSTEM_RESOURCES: BundledPlayerResources = {
  audios: [],
  models: [],
  motions: [],
  stages: DEFAULT_STAGES,
};

export const WALLPAPER_ENGINE_BUNDLED_RESOURCES: BundledPlayerResources =
  CLIENT_TARGET === "wallpaper-engine"
    ? {
        ...__WALLPAPER_ENGINE_BUNDLED_RESOURCES__,
        stages: [
          ...DEFAULT_STAGES,
          ...__WALLPAPER_ENGINE_BUNDLED_RESOURCES__.stages,
        ],
      }
    : WEB_SYSTEM_RESOURCES;
