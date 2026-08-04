const BASE_FONT_SIZE = 16;
const MIN_UI_SCALE = 1;
const MAX_UI_SCALE = 2;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function interpolate(
  value: number,
  inputStart: number,
  inputEnd: number,
  outputStart: number,
  outputEnd: number,
): number {
  const progress = (value - inputStart) / (inputEnd - inputStart);
  return outputStart + progress * (outputEnd - outputStart);
}

/**
 * Returns the UI density expected for a monitor's physical short edge.
 * Using the short edge keeps ultrawide and multi-monitor wallpapers from
 * becoming oversized merely because their canvas is very wide.
 */
export function getRecommendedDisplayScale(shortEdge: number): number {
  if (shortEdge <= 1080) return 1;
  if (shortEdge <= 1440) {
    return interpolate(shortEdge, 1080, 1440, 1, 1.25);
  }
  if (shortEdge <= 2160) {
    return interpolate(shortEdge, 1440, 2160, 1.25, 1.5);
  }

  return interpolate(shortEdge, 2160, 4320, 1.5, MAX_UI_SCALE);
}

export function getUiScale(
  viewportWidth: number,
  viewportHeight: number,
  devicePixelRatio: number,
): number {
  const dpr = Math.max(devicePixelRatio || 1, 1);
  const physicalShortEdge = Math.min(viewportWidth, viewportHeight) * dpr;
  const recommendedScale = getRecommendedDisplayScale(physicalShortEdge);

  // A regular browser already applies Windows display scaling through DPR.
  // Wallpaper Engine's CEF viewport can report DPR 1, so only add the portion
  // of the recommended scaling that the host has not applied for us.
  return clamp(recommendedScale / dpr, MIN_UI_SCALE, MAX_UI_SCALE);
}

export function initializeUiScale(): () => void {
  const root = document.documentElement;
  let animationFrame = 0;

  const update = (): void => {
    animationFrame = 0;
    const scale = getUiScale(
      root.clientWidth,
      root.clientHeight,
      window.devicePixelRatio,
    );

    root.style.setProperty(
      "--ui-root-font-size",
      `${(BASE_FONT_SIZE * scale).toFixed(2)}px`,
    );
  };

  const scheduleUpdate = (): void => {
    if (animationFrame !== 0) {
      cancelAnimationFrame(animationFrame);
    }
    animationFrame = requestAnimationFrame(update);
  };

  update();
  window.addEventListener("resize", scheduleUpdate);
  window.visualViewport?.addEventListener("resize", scheduleUpdate);

  return () => {
    if (animationFrame !== 0) {
      cancelAnimationFrame(animationFrame);
    }
    window.removeEventListener("resize", scheduleUpdate);
    window.visualViewport?.removeEventListener("resize", scheduleUpdate);
  };
}
