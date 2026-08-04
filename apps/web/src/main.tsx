import WallpaperClientApp from "./app/app";
import { initI18n } from "@wallpaper/i18n";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import {
  DEFAULT_RESOURCE_SOURCE_URL,
  WEB_SYSTEM_RESOURCES,
} from "./config";

initI18n();

document.documentElement.classList.toggle(
  "dark",
  window.matchMedia("(prefers-color-scheme: dark)").matches,
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WallpaperClientApp
      bundledResources={WEB_SYSTEM_RESOURCES}
      defaultSourceUrl={DEFAULT_RESOURCE_SOURCE_URL}
    />
  </StrictMode>,
);
