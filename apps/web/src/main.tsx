import WallpaperClientApp from "./app/app";
import { initI18n } from "@wallpaper/i18n";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useMediaQuery } from "@wallpaper/ui/use-media-query";
import "./styles.css";
import {
  DEFAULT_RESOURCE_SOURCE_URL,
  WEB_SYSTEM_RESOURCES,
} from "./config";

initI18n();

function RootThemeClass() {
  const dark = useMediaQuery("(prefers-color-scheme: dark)");
  document.documentElement.classList.toggle("dark", dark);
  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootThemeClass />
    <WallpaperClientApp
      bundledResources={WEB_SYSTEM_RESOURCES}
      defaultSourceUrl={DEFAULT_RESOURCE_SOURCE_URL}
    />
  </StrictMode>,
);
