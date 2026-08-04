import {
  DEFAULT_SKYBOXES,
  DEFAULT_STAGES,
} from "@wallpaper/player/defaults";
import type { BundledPlayerResources } from "./app/types";

export const DEFAULT_RESOURCE_SOURCE_URL =
  import.meta.env.VITE_DEFAULT_RESOURCE_SOURCE_URL?.trim() ||
  import.meta.env.VITE_RESOURCE_CATALOG_URL?.trim() ||
  (import.meta.env.DEV && typeof globalThis.location !== "undefined"
    ? `${globalThis.location.origin}/resource-source/`
    : null);

export const WEB_SYSTEM_RESOURCES: BundledPlayerResources = {
  models: [],
  motions: [],
  skyboxes: DEFAULT_SKYBOXES,
  stages: DEFAULT_STAGES,
};
