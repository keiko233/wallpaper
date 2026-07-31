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
import { Button } from "@wallpaper/ui/button";
import { SheetTrigger } from "@wallpaper/ui/sheet";
import { cn } from "@wallpaper/ui/utils";
import { useMmdActions, useMmdState } from "../providers/mmd-context";

const STATUS_TEXT = {
  idle: "Waiting",
  loading: "Loading",
  ready: "Playing",
  error: "Load failed",
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

  const isLoading = status === "loading";
  const canControlPlayback = status === "ready" || isPlaying;
  const hasMultipleItems = playlist.length > 1;
  const statusText =
    status === "ready"
      ? !isPlaying
        ? "Paused"
        : isPreloading
          ? "Preparing next"
          : STATUS_TEXT.ready
      : STATUS_TEXT[status];

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[calc(var(--desktop-safe-area-bottom,0px)+0.75rem)] z-20 flex justify-center px-3">
      <div className="pointer-events-auto flex min-w-0 items-center gap-1 rounded-2xl border border-border/80 bg-popover/65 p-1.5 opacity-55 shadow-2xl shadow-overlay backdrop-blur-2xl transition-[opacity,background-color] duration-200 hover:bg-popover/90 hover:opacity-100 focus-within:bg-popover/90 focus-within:opacity-100">
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
              {status === "error" ? error?.message || statusText : statusText}
            </span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0 tabular-nums">
              {playlistIndex + 1}/{playlist.length}
            </span>
          </div>
          <span className="sr-only">
            Model: {model.name}. Stage: {stage.name}. Skybox: {skybox.name}.
          </span>
        </div>

        <div className="hidden h-7 w-px bg-border sm:block" />

        <Button
          aria-label="Previous playlist item"
          disabled={!hasMultipleItems}
          onClick={previousPlaylistItem}
          size="icon"
          title="Previous"
          variant="ghost"
        >
          <SkipBack />
        </Button>

        <Button
          aria-label={isPlaying ? "Pause playback" : "Play"}
          className="rounded-xl"
          disabled={!canControlPlayback}
          onClick={() => void togglePlayback()}
          size="icon-lg"
          title={isPlaying ? "Pause" : "Play"}
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
          aria-label="Next playlist item"
          disabled={!hasMultipleItems}
          onClick={nextPlaylistItem}
          size="icon"
          title="Next"
          variant="ghost"
        >
          <SkipForward />
        </Button>

        <div className="mx-0.5 h-7 w-px bg-border" />

        <Button
          aria-label={status === "error" ? "Retry loading" : "Reload current item"}
          disabled={isLoading || status === "idle"}
          onClick={reload}
          size="icon"
          title={status === "error" ? "Retry" : "Reload"}
          variant={status === "error" ? "destructive-outline" : "ghost"}
        >
          {status === "error" ? (
            <CircleAlert />
          ) : (
            <RotateCw className={cn(isLoading && "animate-spin")} />
          )}
        </Button>

        <SheetTrigger
          aria-label="Open MMD settings"
          render={<Button size="icon" title="Settings" variant="ghost" />}
        >
          <Settings2 />
        </SheetTrigger>
      </div>
    </div>
  );
}
