import {
  DEFAULT_SKYBOXES,
  DEFAULT_STAGES,
} from "@wallpaper/player/defaults";
import type { BundledPlayerResources } from "./app/types";

export const CLIENT_TARGET =
  import.meta.env.VITE_CLIENT_TARGET === "wallpaper-engine"
    ? "wallpaper-engine"
    : "web";

export const DEFAULT_RESOURCE_SOURCE_URL =
  import.meta.env.VITE_DEFAULT_RESOURCE_SOURCE_URL?.trim() ||
  import.meta.env.VITE_RESOURCE_CATALOG_URL?.trim() ||
  (import.meta.env.DEV && typeof globalThis.location !== "undefined"
    ? `${globalThis.location.origin}/resource-source/`
    : null);

const WEB_SYSTEM_RESOURCES: BundledPlayerResources = {
  models: [],
  motions: [],
  skyboxes: DEFAULT_SKYBOXES,
  stages: DEFAULT_STAGES,
};

export const WALLPAPER_ENGINE_BUNDLED_RESOURCES: BundledPlayerResources =
  CLIENT_TARGET === "wallpaper-engine"
    ? {
        ...__WALLPAPER_ENGINE_BUNDLED_RESOURCES__,
        skyboxes: [
          ...DEFAULT_SKYBOXES,
          ...__WALLPAPER_ENGINE_BUNDLED_RESOURCES__.skyboxes,
        ],
        stages: [
          ...DEFAULT_STAGES,
          ...__WALLPAPER_ENGINE_BUNDLED_RESOURCES__.stages,
        ],
      }
    : WEB_SYSTEM_RESOURCES;
