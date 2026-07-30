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
  // Normal browser windows already end above the taskbar. Only reserve the
  // work-area difference when the content covers the complete monitor, as a
  // Wallpaper Engine web wallpaper does.
  const coversFullScreen = viewportWidth >= screenWidth - 1 &&
    viewportHeight >= screenHeight - 1;
  if (!coversFullScreen) {
    return EMPTY_SAFE_AREA;
  }

  const left = clamp(availLeft - screenX, 0, viewportWidth);
  const top = clamp(availTop - screenY, 0, viewportHeight);

  return {
    top,
    left,
    right: clamp(screenWidth - left - availWidth, 0, viewportWidth),
    bottom: clamp(screenHeight - top - availHeight, 0, viewportHeight),
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
