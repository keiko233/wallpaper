import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { WallpaperEngineBundleSchema } from "@wallpaper/resource-schema";
import { defineConfig } from "vite";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { bundledAssets } from "./build/bundled-assets-vite-plugin.js";

const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));
const appRoot = fileURLToPath(new URL(".", import.meta.url));
const bundle = WallpaperEngineBundleSchema.parse(
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
);

// https://vite.dev/config/
export default defineConfig({
  clearScreen: false,
  publicDir: false,
  build: {
    emptyOutDir: true,
    outDir: resolve(appRoot, "dist", "wallpaper-engine"),
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
    paraglideVitePlugin({
      project: resolve(workspaceRoot, "packages/i18n/project.inlang"),
      outdir: resolve(workspaceRoot, "packages/i18n/src/paraglide"),
      strategy: ["localStorage", "preferredLanguage", "baseLocale"],
      // Keep the plugin's output byte-identical to `pnpm i18n:compile`
      // (which is what gets committed) so `vite dev`/`vite build` never
      // clobbers the checked-in generated files.
      emitTsDeclarations: true,
      isServer: "typeof window === 'undefined'",
      outputStructure: "message-modules",
    }),
    tailwindcss(),
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
    bundledAssets({
      resourcesDirectory: resolve(
        workspaceRoot,
        "dist",
        "resource-publish",
        "wallpaper-engine-assets",
        "resources",
      ),
      resourcePaths: ["/resources"],
    }),
  ],
  server: {
    port: 5174,
  },
});
