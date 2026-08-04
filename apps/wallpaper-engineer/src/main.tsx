import WallpaperClientApp from "./app/app";
import { initI18n } from "@wallpaper/i18n";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useMediaQuery } from "@wallpaper/ui/use-media-query";
import { initializeDesktopSafeArea } from "./lib/desktop-safe-area";
import { initializeUiScale } from "./lib/ui-scale";
import "./styles.css";
import {
  DEFAULT_RESOURCE_SOURCE_URL,
  WALLPAPER_ENGINE_BUNDLED_RESOURCES,
} from "./config";

initI18n();
initializeUiScale();
initializeDesktopSafeArea();

function RootThemeClass() {
  const dark = useMediaQuery("(prefers-color-scheme: dark)");
  document.documentElement.classList.toggle("dark", dark);
  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootThemeClass />
    <WallpaperClientApp
      bundledResources={WALLPAPER_ENGINE_BUNDLED_RESOURCES}
      defaultSourceUrl={DEFAULT_RESOURCE_SOURCE_URL}
    />
  </StrictMode>,
);
