import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@wallpaper/ui/utils";
import { lineAtTime, parseLrc } from "../lib/lyrics";
import { resolvePlayerResourceUrl } from "../lib/resource-url";
import {
  getControlBarState,
  subscribeControlBarState,
} from "../lib/control-bar-visibility";
import {
  LYRICS_DARK_THEME,
  LYRICS_LIGHT_THEME,
  type LyricsColorMode,
  type LyricsFontFamily,
  type SceneColorSample,
} from "../types";
import {
  useMmdPerformance,
  useMmdPlayback,
  useMmdState,
} from "../providers/mmd-context";

const FONT_FAMILY_CSS: Record<LyricsFontFamily, string> = {
  system:
    'system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
  sans: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
  serif: '"Songti SC", "SimSun", "Noto Serif CJK SC", "STSong", serif',
  monospace: '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace',
};

const ALIGN_CLASSES = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
} as const;

const TEXT_ALIGN_CLASSES = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

/**
 * Distance from the bottom edge while the playback control bar is fully
 * expanded (plus the desktop safe area): the bar occupies ~0.75rem margin +
 * a 6rem hover zone, so lyrics stay clear of it.
 */
const LYRICS_LIFTED_BOTTOM_REM = 7.25;

/** Distance from the bottom edge while the bar is collapsed into its pill. */
const LYRICS_PILL_BOTTOM_REM = 2.5;

/** Distance from the bottom edge while the control bar is fully hidden. */
const LYRICS_BOTTOM_REM = 2;

const LYRICS_BOTTOM_TRANSITION =
  "bottom 0.35s cubic-bezier(0.22, 1, 0.36, 1)";

const SCENE_TEXT_THRESHOLD = 0.55;

function contrastTextColor(backgroundHex: string): string {
  const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})/iu.exec(
    backgroundHex,
  );
  if (match === null) return LYRICS_DARK_THEME.fontColor;
  const [r, g, b] = [match[1], match[2], match[3]].map((channel) =>
    Number.parseInt(channel, 16),
  );
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > SCENE_TEXT_THRESHOLD
    ? LYRICS_LIGHT_THEME.fontColor
    : LYRICS_DARK_THEME.fontColor;
}

function rgbToHsv(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; v: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  if (delta > 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : delta / max, v: max };
}

function hsvToCss(h: number, s: number, l: number): string {
  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

/**
 * Derives a vivid gradient from the sampled frame color. Neutral (low
 * saturation) scenes fall back to the dark/light theme pair by luminance.
 */
function highlightFromSample(sample: SceneColorSample): {
  from: string;
  to: string;
} {
  const { h, s } = rgbToHsv(sample.r, sample.g, sample.b);
  if (s < 0.25) {
    return sample.luminance > SCENE_TEXT_THRESHOLD
      ? {
          from: LYRICS_LIGHT_THEME.karaokeFrom,
          to: LYRICS_LIGHT_THEME.karaokeTo,
        }
      : {
          from: LYRICS_DARK_THEME.karaokeFrom,
          to: LYRICS_DARK_THEME.karaokeTo,
        };
  }
  const saturation = Math.min(1, s + 0.15);
  return { from: hsvToCss(h, saturation, 0.62), to: hsvToCss(h, saturation, 0.42) };
}

function themeFromSample(sample: SceneColorSample): {
  fontColor: string;
  karaokeFrom: string;
  karaokeTo: string;
} {
  const highlight = highlightFromSample(sample);
  return {
    fontColor:
      sample.luminance > SCENE_TEXT_THRESHOLD
        ? LYRICS_LIGHT_THEME.fontColor
        : LYRICS_DARK_THEME.fontColor,
    karaokeFrom: highlight.from,
    karaokeTo: highlight.to,
  };
}

function themeColorForMode(
  mode: LyricsColorMode,
  manual: string,
  scene: string | undefined,
  dark: string,
  light: string,
): string {
  switch (mode) {
    case "manual":
      return manual;
    case "scene":
      return scene ?? dark;
    case "dark":
      return dark;
    case "light":
      return light;
  }
}

/**
 * Time-synced lyric (LRC) overlay. Fetches the motion's lyrics document,
 * reads the audio clock each animation frame and only re-renders React when
 * the active line changes; the karaoke fill progress is applied
 * imperatively for smooth sub-line highlighting.
 *
 * Scene-sampled colors (text contrast and highlight theme) are captured
 * exactly once when the first line of the track becomes active, then locked
 * for the rest of the track so the colors never drift while playing.
 */
export function LyricsOverlay({ className }: { className?: string }) {
  const { motion, background, lyricsVisible, lyricsSettings } = useMmdState();
  const { activeSlot } = useMmdPerformance();
  const { getCurrentTime, getFrameColorSample } = useMmdPlayback();
  const lyricsPath = lyricsVisible ? motion.lyricsPath : undefined;
  const controlBarState = useSyncExternalStore(
    subscribeControlBarState,
    getControlBarState,
  );

  const [lyricsText, setLyricsText] = useState<string | undefined>(undefined);
  useEffect(() => {
    let active = true;
    if (lyricsPath === undefined) {
      setLyricsText(undefined);
      return;
    }
    // Virtual resource URLs (/__wallpaper_resources/...) resolve only through
    // the Babylon URL resolver; map them to their blob URLs before fetching.
    void fetch(resolvePlayerResourceUrl(lyricsPath))
      .then((response) => (response.ok ? response.text() : ""))
      .then((text) => {
        if (active) setLyricsText(text.length > 0 ? text : undefined);
      })
      .catch(() => {
        if (active) setLyricsText(undefined);
      });
    return () => {
      active = false;
    };
  }, [lyricsPath]);

  const lines = useMemo(
    () => (lyricsText === undefined ? [] : parseLrc(lyricsText)),
    [lyricsText],
  );

  const [activeIndex, setActiveIndex] = useState(-1);
  const [sceneTheme, setSceneTheme] = useState<{
    fontColor: string;
    karaokeFrom: string;
    karaokeTo: string;
  } | null>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const activeIndexRef = useRef(activeIndex);
  /** Lyrics path that already had its scene theme sampled and locked. */
  const sampledLyricsRef = useRef<string | null>(null);
  activeIndexRef.current = activeIndex;

  const karaokeEnabled = lyricsSettings.karaoke && lyricsText !== undefined;

  useEffect(() => {
    if (lines.length === 0 || lyricsPath === undefined) return;
    let frame = 0;

    const tick = (): void => {
      const active = lineAtTime(lines, getCurrentTime(activeSlot));
      if (active === null) {
        if (activeIndexRef.current !== -1) setActiveIndex(-1);
      } else {
        if (active.index !== activeIndexRef.current) {
          // The first line of this track becomes active: sample the scene
          // theme once and lock it for the whole track.
          if (
            activeIndexRef.current === -1 &&
            sampledLyricsRef.current !== lyricsPath
          ) {
            const sample = getFrameColorSample(activeSlot);
            if (sample !== null) {
              sampledLyricsRef.current = lyricsPath;
              setSceneTheme(themeFromSample(sample));
            }
          }
          activeIndexRef.current = active.index;
          setActiveIndex(active.index);
        }
        if (karaokeEnabled) {
          const fill = fillRef.current;
          if (fill !== null) {
            const percentage = `${active.progress * 100}%`;
            if (fill.style.backgroundSize !== `${percentage} 100%`) {
              fill.style.backgroundSize = `${percentage} 100%`;
            }
          }
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [
    lines,
    lyricsPath,
    activeSlot,
    getCurrentTime,
    getFrameColorSample,
    karaokeEnabled,
  ]);

  if (lines.length === 0) return null;

  const activeLine = activeIndex >= 0 ? lines[activeIndex] : null;
  const sceneFontColor =
    sceneTheme?.fontColor ?? contrastTextColor(background);
  const fontColor = themeColorForMode(
    lyricsSettings.colorMode,
    lyricsSettings.fontColor,
    sceneFontColor,
    LYRICS_DARK_THEME.fontColor,
    LYRICS_LIGHT_THEME.fontColor,
  );
  const karaokeFrom = themeColorForMode(
    lyricsSettings.karaokeMode,
    lyricsSettings.karaokeFrom,
    sceneTheme?.karaokeFrom ?? LYRICS_DARK_THEME.karaokeFrom,
    LYRICS_DARK_THEME.karaokeFrom,
    LYRICS_LIGHT_THEME.karaokeFrom,
  );
  const karaokeTo = themeColorForMode(
    lyricsSettings.karaokeMode,
    lyricsSettings.karaokeTo,
    sceneTheme?.karaokeTo ?? LYRICS_DARK_THEME.karaokeTo,
    LYRICS_DARK_THEME.karaokeTo,
    LYRICS_LIGHT_THEME.karaokeTo,
  );

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 z-30 flex px-6",
        ALIGN_CLASSES[lyricsSettings.align],
        className,
      )}
      style={{
        bottom: `calc(var(--desktop-safe-area-bottom, 0px) + ${
          controlBarState === "expanded"
            ? LYRICS_LIFTED_BOTTOM_REM + lyricsSettings.bottomOffset
            : controlBarState === "pill"
              ? LYRICS_PILL_BOTTOM_REM
              : LYRICS_BOTTOM_REM
        }rem)`,
        transition: LYRICS_BOTTOM_TRANSITION,
      }}
    >
      <p
        className={cn(
          "animate-lyrics-in relative max-w-[min(80vw,48rem)] text-2xl font-bold leading-snug tracking-wide",
          lyricsSettings.shadow &&
            "drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]",
          TEXT_ALIGN_CLASSES[lyricsSettings.align],
        )}
        key={activeLine?.time ?? "idle"}
        style={{
          color: fontColor,
          fontFamily: FONT_FAMILY_CSS[lyricsSettings.fontFamily],
          fontSize: `calc(1.5rem * ${lyricsSettings.fontSize})`,
          fontWeight: lyricsSettings.fontWeight,
          letterSpacing: `${lyricsSettings.letterSpacing}px`,
          opacity: lyricsSettings.opacity,
        }}
      >
        {activeLine?.text ?? "\u00a0"}
        {karaokeEnabled && (
          <span
            aria-hidden
            className="absolute inset-0 bg-clip-text text-transparent"
            ref={fillRef}
            style={{
              backgroundImage: `linear-gradient(to right, ${karaokeFrom} 0%, ${karaokeTo} 100%)`,
              backgroundPosition: "left top",
              backgroundRepeat: "no-repeat",
              backgroundSize: "0% 100%",
              WebkitBackgroundClip: "text",
            }}
          >
            {activeLine?.text ?? "\u00a0"}
          </span>
        )}
      </p>
    </div>
  );
}
