import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  WallpaperEngineBundleSchema,
  type WallpaperEngineBundle,
} from "@wallpaper/resource-schema";
import { defineConfig, loadEnv } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { bundledAssets } from "./build/bundled-assets-vite-plugin.js";
import { localResourceSource } from "./build/local-resource-source-vite-plugin.js";

const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));
const appRoot = fileURLToPath(new URL(".", import.meta.url));
const siteConfigPath = resolve(workspaceRoot, "resource-site.json");
const emptyBundle: WallpaperEngineBundle = {
  schemaVersion: 1,
  resources: {
    audios: [],
    models: [],
    motions: [],
    skyboxes: [],
    stages: [],
  },
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, appRoot, "");
  const isWallpaperEngine =
    environment.VITE_CLIENT_TARGET === "wallpaper-engine";
  const bundle = isWallpaperEngine
    ? WallpaperEngineBundleSchema.parse(
        JSON.parse(
          readFileSync(
            resolve(
              workspaceRoot,
              "dist",
              "resource-publish",
              "wallpaper-engine.json",
            ),
            "utf8",
          ),
        ),
      )
    : emptyBundle;

  return {
    clearScreen: false,
    publicDir: false,
    build: {
      emptyOutDir: true,
      outDir: resolve(
        appRoot,
        "dist",
        isWallpaperEngine ? "wallpaper-engine" : "web",
      ),
    },
    define: {
      __WALLPAPER_ENGINE_BUNDLED_RESOURCES__: JSON.stringify(
        bundle.resources,
      ),
    },
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
      tailwindcss(),
      react(),
      babel({
        presets: [reactCompilerPreset()],
      }),
      bundledAssets({
        resourcesDirectory: isWallpaperEngine
          ? resolve(
              workspaceRoot,
              "dist",
              "resource-publish",
              "wallpaper-engine-assets",
              "resources",
            )
          : resolve(workspaceRoot, "resources"),
        resourcePaths: isWallpaperEngine ? ["/resources"] : [],
      }),
      ...(isWallpaperEngine
        ? []
        : [
            localResourceSource({
              siteConfigPath,
            }),
          ]),
    ],
  };
});
