/// <reference types="vite/client" />

import type { WallpaperEngineBundle } from "@wallpaper/resource-schema";

declare global {
  const __WALLPAPER_ENGINE_BUNDLED_RESOURCES__: WallpaperEngineBundle["resources"];
}

interface ImportMetaEnv {
  readonly VITE_DEFAULT_RESOURCE_SOURCE_URL?: string;
  readonly VITE_RESOURCE_CATALOG_URL?: string;
}

export {};
