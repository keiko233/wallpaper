export interface DesktopSafeArea {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface DesktopGeometry {
  viewportWidth: number;
  viewportHeight: number;
  screenWidth: number;
  screenHeight: number;
  screenX: number;
  screenY: number;
  availWidth: number;
  availHeight: number;
  availLeft: number;
  availTop: number;
}

interface DesktopScreen extends Screen {
  readonly availLeft?: number;
  readonly availTop?: number;
}

const EMPTY_SAFE_AREA: DesktopSafeArea = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

/**
 * Fullscreen detection tolerance. The CEF viewport of a Wallpaper Engine
 * wallpaper is never smaller than the monitor it covers, and a regular
 * maximized window always ends short of it on the taskbar axis, so a 2%
 * slack keeps this from misfiring on either side.
 */
const FULLSCREEN_TOLERANCE = 0.02;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getDesktopSafeArea({
  viewportWidth,
  viewportHeight,
  screenWidth,
  screenHeight,
  screenX,
  screenY,
  availWidth,
  availHeight,
  availLeft,
  availTop,
}: DesktopGeometry): DesktopSafeArea {
  // Wallpaper Engine can force its CEF viewport to DPR 1 while the OS still
  // reports the monitor in device-independent pixels, leaving the CSS
  // viewport a constant factor larger than screen.width/height. Raw size
  // comparisons are therefore meaningless here; instead, compare the
  // per-axis scale factors, which stay equal for any fullscreen window.
  const scaleX = viewportWidth / screenWidth;
  const scaleY = viewportHeight / screenHeight;
  const coversFullScreen =
    scaleX >= 1 - FULLSCREEN_TOLERANCE &&
    scaleY >= 1 - FULLSCREEN_TOLERANCE;
  if (!coversFullScreen) {
    return EMPTY_SAFE_AREA;
  }

  // The work area excludes the taskbar and similar docks. Reserve an inset
  // on every edge where the monitor extends past the work area, converted
  // from screen units into viewport units via the per-axis scale so the
  // control bar and lyrics never end up underneath the taskbar.
  const left = clamp((availLeft - screenX) * scaleX, 0, viewportWidth);
  const top = clamp((availTop - screenY) * scaleY, 0, viewportHeight);
  const right = clamp(
    (screenX + screenWidth - (availLeft + availWidth)) * scaleX,
    0,
    viewportWidth,
  );
  const bottom = clamp(
    (screenY + screenHeight - (availTop + availHeight)) * scaleY,
    0,
    viewportHeight,
  );

  return {
    top,
    right,
    bottom,
    left,
  };
}

export function initializeDesktopSafeArea(): () => void {
  const root = document.documentElement;
  const desktopScreen = window.screen as DesktopScreen;
  let animationFrame = 0;

  const update = (): void => {
    animationFrame = 0;
    const safeArea = getDesktopSafeArea({
      viewportWidth: root.clientWidth,
      viewportHeight: root.clientHeight,
      screenWidth: desktopScreen.width,
      screenHeight: desktopScreen.height,
      screenX: window.screenX,
      screenY: window.screenY,
      availWidth: desktopScreen.availWidth,
      availHeight: desktopScreen.availHeight,
      availLeft: desktopScreen.availLeft ?? window.screenX,
      availTop: desktopScreen.availTop ?? window.screenY,
    });

    for (const [edge, inset] of Object.entries(safeArea)) {
      root.style.setProperty(`--desktop-safe-area-${edge}`, `${inset}px`);
    }
  };

  const scheduleUpdate = (): void => {
    if (animationFrame !== 0) cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(update);
  };

  update();
  window.addEventListener("resize", scheduleUpdate);
  window.visualViewport?.addEventListener("resize", scheduleUpdate);

  return () => {
    if (animationFrame !== 0) cancelAnimationFrame(animationFrame);
    window.removeEventListener("resize", scheduleUpdate);
    window.visualViewport?.removeEventListener("resize", scheduleUpdate);
  };
}
