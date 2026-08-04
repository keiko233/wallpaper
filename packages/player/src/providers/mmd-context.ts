import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type SetStateAction,
} from "react";
import type { PerformanceSnapshot, PerformanceStats } from "../lib/performance-stats";
import type {
  LyricsSettings,
  MmdPlaylistItem,
  MmdRenderSettings,
  ModelList,
  MotionList,
  SceneColorSample,
  SkyboxList,
  StageList,
} from "../types";

export type MmdStatus = "idle" | "loading" | "ready" | "error";

export interface MmdState {
  models: readonly ModelList[];
  motions: readonly MotionList[];
  stages: readonly StageList[];
  skyboxes: readonly SkyboxList[];
  modelIndex: number;
  motionIndex: number;
  stageIndex: number;
  skyboxIndex: number;
  model: ModelList;
  motion: MotionList;
  stage: StageList;
  skybox: SkyboxList;
  playlist: readonly MmdPlaylistItem[];
  playlistIndex: number;
  isPreloading: boolean;
  background: string;
  status: MmdStatus;
  error: Error | null;
  isPlaying: boolean;
  volume: number;
  playbackRate: number;
  /** Whether time-synced lyrics are shown over the wallpaper. */
  lyricsVisible: boolean;
  lyricsSettings: LyricsSettings;
  renderSettings: MmdRenderSettings;
}

export interface MmdActions {
  selectModel: (index: number) => void;
  selectMotion: (index: number) => void;
  selectStage: (index: number) => void;
  selectSkybox: (index: number) => void;
  previousModel: () => void;
  nextModel: () => void;
  previousMotion: () => void;
  nextMotion: () => void;
  previousStage: () => void;
  nextStage: () => void;
  previousSkybox: () => void;
  nextSkybox: () => void;
  selectPlaylistItem: (index: number) => void;
  previousPlaylistItem: () => void;
  nextPlaylistItem: () => void;
  setPlaylist: (value: SetStateAction<MmdPlaylistItem[]>) => void;
  resetPlaylist: () => void;
  setBackground: (color: string) => void;
  reload: () => void;
  play: () => Promise<void>;
  pause: () => void;
  togglePlayback: () => Promise<void>;
  seek: (seconds: number) => Promise<void>;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  setLyricsVisible: (visible: boolean) => void;
  setLyricsSettings: (settings: Partial<LyricsSettings>) => void;
  setRenderSettings: (settings: Partial<MmdRenderSettings>) => void;
  resetRenderSettings: () => void;
}

export const MmdStateContext = createContext<MmdState | null>(null);
export const MmdActionsContext = createContext<MmdActions | null>(null);
export interface MmdCanvasState {
  activeSlot: number;
  isTransitioning: boolean;
  setCanvas: (slot: number, canvas: HTMLCanvasElement | null) => void;
}

export const MmdCanvasContext = createContext<MmdCanvasState | null>(null);

export interface MmdPerformanceState {
  activeSlot: number;
  /**
   * Bumped whenever a controller slot finishes loading a new scene and its
   * stats sampler is replaced, so consumers can resubscribe.
   */
  statsRevision: number;
  /** Whether the FPS overlay is shown over the wallpaper. */
  overlayVisible: boolean;
  setOverlayVisible: (visible: boolean) => void;
  /** Resolves the frame-time sampler of a controller slot. */
  getStats: (slot: number) => PerformanceStats | null;
}

/**
 * Playback clock of the active controller. Exposes the audio time and the
 * sampled frame color so time-synced UI (e.g. lyrics) can track playback
 * without re-rendering on every animation frame.
 */
export interface MmdPlaybackState {
  /** Seconds of audio already played by the slot's controller. */
  getCurrentTime: (slot: number) => number;
  /** Last sampled average color of the frame behind the lyrics. */
  getFrameColorSample: (slot: number) => SceneColorSample | null;
}

export const MmdPerformanceContext =
  createContext<MmdPerformanceState | null>(null);
export const MmdPlaybackContext = createContext<MmdPlaybackState | null>(null);

export function useMmdPerformance(): MmdPerformanceState {
  const context = useContext(MmdPerformanceContext);
  if (context === null) {
    throw new Error("useMmdPerformance must be used within MmdProvider.");
  }
  return context;
}

export function useMmdPlayback(): MmdPlaybackState {
  const context = useContext(MmdPlaybackContext);
  if (context === null) {
    throw new Error("useMmdPlayback must be used within MmdProvider.");
  }
  return context;
}

/**
 * Subscribes to the active controller's frame-time sampler and returns the
 * latest snapshot. Re-subscribes automatically when the sampler is replaced
 * (scene load / slot switch).
 */
export function useLivePerformanceSnapshot(): PerformanceSnapshot | null {
  const { activeSlot, getStats } = useMmdPerformance();
  const stats = getStats(activeSlot);
  const subscribe = useCallback(
    (listener: () => void): (() => void) => {
      if (stats === null) return () => undefined;
      return stats.subscribe(listener);
    },
    [stats],
  );
  const getSnapshot = useCallback(
    (): PerformanceSnapshot | null => stats?.getSnapshot() ?? null,
    [stats],
  );
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useMmdState(): MmdState {
  const context = useContext(MmdStateContext);
  if (context === null) {
    throw new Error("useMmdState must be used within MmdProvider.");
  }
  return context;
}

export function useMmdActions(): MmdActions {
  const context = useContext(MmdActionsContext);
  if (context === null) {
    throw new Error("useMmdActions must be used within MmdProvider.");
  }
  return context;
}

export function useMmd(): MmdState & MmdActions {
  return { ...useMmdState(), ...useMmdActions() };
}
