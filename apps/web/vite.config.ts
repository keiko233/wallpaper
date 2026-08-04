import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { bundledAssets } from "./build/bundled-assets-vite-plugin.js";
import { localResourceSource } from "./build/local-resource-source-vite-plugin.js";

const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));
const appRoot = fileURLToPath(new URL(".", import.meta.url));
const siteConfigPath = resolve(workspaceRoot, "resource-site.json");

// https://vite.dev/config/
export default defineConfig({
  clearScreen: false,
  publicDir: false,
  build: {
    emptyOutDir: true,
    outDir: resolve(appRoot, "dist", "web"),
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
      resourcesDirectory: resolve(workspaceRoot, "resources"),
      resourcePaths: [],
    }),
    localResourceSource({
      siteConfigPath,
    }),
  ],
  server: {
    port: 5173,
  },
});
