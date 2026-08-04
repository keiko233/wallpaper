import WallpaperClientApp from "./app/app";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initializeDesktopSafeArea } from "./lib/desktop-safe-area";
import { initializeUiScale } from "./lib/ui-scale";
import "./styles.css";
import {
  DEFAULT_RESOURCE_SOURCE_URL,
  WALLPAPER_ENGINE_BUNDLED_RESOURCES,
} from "./config";

initializeUiScale();
initializeDesktopSafeArea();

document.documentElement.classList.toggle(
  "dark",
  window.matchMedia("(prefers-color-scheme: dark)").matches,
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WallpaperClientApp
      bundledResources={WALLPAPER_ENGINE_BUNDLED_RESOURCES}
      defaultSourceUrl={DEFAULT_RESOURCE_SOURCE_URL}
    />
  </StrictMode>,
);
