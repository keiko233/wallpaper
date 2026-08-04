import {
  CircleAlert,
  LoaderCircle,
  Pause,
  Play,
  RotateCw,
  Settings2,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion as Motion, useReducedMotion } from "motion/react";
import { m } from "@wallpaper/i18n";
import { Button } from "@wallpaper/ui/button";
import { SheetTrigger } from "@wallpaper/ui/sheet";
import { cn } from "@wallpaper/ui/utils";
import { useMmdActions, useMmdState } from "../providers/mmd-context";

const FADE_AFTER_MS = 2200;
const INITIAL_VISIBLE_MS = 4000;

const ISLAND_TRANSITION = {
  type: "spring",
  stiffness: 440,
  damping: 38,
  mass: 0.82,
} as const;

const STATUS_TEXT = {
  idle: () => m.player_status_waiting(),
  loading: () => m.player_status_loading(),
  ready: () => m.player_status_playing(),
  error: () => m.player_status_load_failed(),
} as const;

export function PlaybackControls() {
  const {
    error,
    isPlaying,
    isPreloading,
    model,
    motion,
    stage,
    skybox,
    playlist,
    playlistIndex,
    status,
  } = useMmdState();
  const {
    nextPlaylistItem,
    previousPlaylistItem,
    reload,
    togglePlayback,
  } = useMmdActions();

  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [visible, setVisible] = useState(true);
  const hasInteracted = useRef(false);
  const fadeTimer = useRef<number | null>(null);
  const expanded = isHovered || hasFocus;

  const clearFadeTimer = useCallback(() => {
    if (fadeTimer.current !== null) {
      window.clearTimeout(fadeTimer.current);
      fadeTimer.current = null;
    }
  }, []);

  const scheduleFade = useCallback(
    (delay: number) => {
      clearFadeTimer();
      fadeTimer.current = window.setTimeout(() => {
        fadeTimer.current = null;
        setVisible(false);
      }, delay);
    },
    [clearFadeTimer],
  );

  const reveal = useCallback(() => {
    hasInteracted.current = true;
    clearFadeTimer();
    setVisible(true);
  }, [clearFadeTimer]);

  useEffect(() => {
    if (expanded) {
      clearFadeTimer();
      setVisible(true);
    } else {
      scheduleFade(
        hasInteracted.current ? FADE_AFTER_MS : INITIAL_VISIBLE_MS,
      );
    }

    return clearFadeTimer;
  }, [clearFadeTimer, expanded, scheduleFade]);

  const isLoading = status === "loading";
  const canControlPlayback = status === "ready" || isPlaying;
  const hasMultipleItems = playlist.length > 1;
  const statusText =
    status === "ready"
      ? !isPlaying
        ? m.player_status_paused()
        : isPreloading
          ? m.player_status_preparing_next()
          : STATUS_TEXT.ready()
      : STATUS_TEXT[status]();

  return (
    <Motion.div
      animate={{
        opacity: visible ? 1 : 0,
        y: visible || prefersReducedMotion ? 0 : 12,
      }}
      className="pointer-events-none absolute inset-x-0 bottom-[calc(var(--desktop-safe-area-bottom,0px)+0.75rem)] z-20 flex justify-center px-3"
      initial={false}
      transition={
        prefersReducedMotion
          ? { duration: 0.01 }
          : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
      }
    >
      <div
        className="pointer-events-auto flex h-24 w-full max-w-[34rem] items-end justify-center pb-1"
        data-state={expanded ? "expanded" : visible ? "collapsed" : "hidden"}
        onBlur={(event) => {
          if (
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            setHasFocus(false);
          }
        }}
        onFocus={reveal}
        onFocusCapture={() => setHasFocus(true)}
        onMouseEnter={() => {
          reveal();
          setIsHovered(true);
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Motion.div
          animate={{
            borderRadius: expanded ? 16 : 999,
            height: expanded ? 52 : 6,
            width: expanded ? "auto" : 80,
          }}
          className="relative flex max-w-full shrink-0 items-center justify-center overflow-hidden"
          initial={false}
          transition={
            prefersReducedMotion
              ? { duration: 0.01 }
              : {
                  borderRadius: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
                  height: ISLAND_TRANSITION,
                  width: ISLAND_TRANSITION,
                }
          }
        >
          <Motion.div
            animate={{ opacity: expanded ? 1 : 0 }}
            className="pointer-events-none absolute inset-0 rounded-[inherit] border border-border/80 bg-popover/86 shadow-2xl shadow-overlay backdrop-blur-2xl"
            initial={false}
            transition={{
              duration: prefersReducedMotion ? 0.01 : expanded ? 0.16 : 0.12,
            }}
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
            <Motion.div
              animate={{
                opacity: expanded ? 0 : 1,
                scaleX: expanded ? 0.72 : 1,
              }}
              className="h-1.5 w-20 rounded-full bg-white/90 shadow-[0_1px_10px_rgba(0,0,0,0.4),0_0_2px_rgba(255,255,255,0.7)]"
              initial={false}
              transition={
                prefersReducedMotion
                  ? { duration: 0.01 }
                  : expanded
                    ? { duration: 0.1, ease: "easeOut" }
                    : { delay: 0.12, duration: 0.18, ease: "easeOut" }
              }
            />
          </div>

          <Motion.div
            animate={{
              filter:
                expanded || prefersReducedMotion ? "blur(0px)" : "blur(3px)",
              opacity: expanded ? 1 : 0,
              scale: expanded || prefersReducedMotion ? 1 : 0.98,
              y: expanded || prefersReducedMotion ? 0 : 2,
            }}
            aria-hidden={!expanded}
            className="relative flex min-w-max items-center gap-1 p-1.5"
            inert={!expanded}
            initial={false}
            style={{ originX: 0.5, originY: 1 }}
            transition={
              prefersReducedMotion
                ? { duration: 0.01 }
                : {
                    filter: {
                      delay: expanded ? 0.08 : 0,
                      duration: expanded ? 0.18 : 0.1,
                    },
                    opacity: {
                      delay: expanded ? 0.08 : 0,
                      duration: expanded ? 0.18 : 0.08,
                    },
                    scale: {
                      delay: expanded ? 0.06 : 0,
                      duration: 0.18,
                      ease: [0.22, 1, 0.36, 1],
                    },
                    y: {
                      delay: expanded ? 0.06 : 0,
                      duration: 0.18,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  }
            }
          >
            <div className="hidden w-52 min-w-0 px-2 sm:block">
              <p className="truncate text-sm font-medium">{motion.name}</p>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    status === "ready" && "bg-success",
                    status === "loading" && "animate-pulse bg-warning",
                    status === "idle" && "bg-muted-foreground",
                    status === "error" && "bg-destructive",
                  )}
                />
                <span className="truncate" aria-live="polite">
                  {status === "error"
                    ? error?.message || statusText
                    : statusText}
                </span>
                <span aria-hidden="true">·</span>
                <span className="shrink-0 tabular-nums">
                  {playlistIndex + 1}/{playlist.length}
                </span>
              </div>
              <span className="sr-only">
                {m.player_sr_only_combination({
                  model: model.name,
                  stage: stage.name,
                  skybox: skybox.name,
                })}
              </span>
            </div>

            <div className="hidden h-7 w-px bg-border sm:block" />

            <Button
              aria-label={m.player_previous_playlist_item()}
              disabled={!hasMultipleItems}
              onClick={previousPlaylistItem}
              size="icon"
              title={m.common_previous()}
              variant="ghost"
            >
              <SkipBack />
            </Button>

            <Button
              aria-label={isPlaying ? m.player_pause_playback() : m.player_play()}
              className="rounded-xl"
              disabled={!canControlPlayback}
              onClick={() => void togglePlayback()}
              size="icon-lg"
              title={isPlaying ? m.player_pause() : m.player_play()}
            >
              {isLoading && !isPlaying ? (
                <LoaderCircle className="animate-spin" />
              ) : isPlaying ? (
                <Pause />
              ) : (
                <Play className="translate-x-px" />
              )}
            </Button>

            <Button
              aria-label={m.player_next_playlist_item()}
              disabled={!hasMultipleItems}
              onClick={nextPlaylistItem}
              size="icon"
              title={m.common_next()}
              variant="ghost"
            >
              <SkipForward />
            </Button>

            <div className="mx-0.5 h-7 w-px bg-border" />

            <Button
              aria-label={
                status === "error"
                  ? m.player_retry_loading()
                  : m.player_reload_current_item()
              }
              disabled={isLoading || status === "idle"}
              onClick={reload}
              size="icon"
              title={status === "error" ? m.player_retry() : m.player_reload()}
              variant={status === "error" ? "destructive-outline" : "ghost"}
            >
              {status === "error" ? (
                <CircleAlert />
              ) : (
                <RotateCw className={cn(isLoading && "animate-spin")} />
              )}
            </Button>

            <SheetTrigger
              aria-label={m.player_open_mmd_settings()}
              render={
                <Button size="icon" title={m.player_settings()} variant="ghost" />
              }
            >
              <Settings2 />
            </SheetTrigger>
          </Motion.div>
        </Motion.div>
      </div>
    </Motion.div>
  );
}
