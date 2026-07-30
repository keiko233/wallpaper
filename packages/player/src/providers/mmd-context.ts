import { createContext, useContext, type SetStateAction } from "react";
import type {
  AudioList,
  MmdPlaylistItem,
  MmdRenderSettings,
  ModelList,
  MotionList,
  StageList,
} from "../types";

export type MmdStatus = "idle" | "loading" | "ready" | "error";

export interface MmdState {
  models: readonly ModelList[];
  motions: readonly MotionList[];
  stages: readonly StageList[];
  audios: readonly AudioList[];
  modelIndex: number;
  motionIndex: number;
  stageIndex: number;
  audioIndex: number;
  model: ModelList;
  motion: MotionList;
  stage: StageList;
  audio: AudioList;
  playlist: readonly MmdPlaylistItem[];
  playlistIndex: number;
  isPreloading: boolean;
  background: string;
  status: MmdStatus;
  error: Error | null;
  isPlaying: boolean;
  volume: number;
  playbackRate: number;
  renderSettings: MmdRenderSettings;
}

export interface MmdActions {
  selectModel: (index: number) => void;
  selectMotion: (index: number) => void;
  selectStage: (index: number) => void;
  selectAudio: (index: number) => void;
  previousModel: () => void;
  nextModel: () => void;
  previousMotion: () => void;
  nextMotion: () => void;
  previousStage: () => void;
  nextStage: () => void;
  previousAudio: () => void;
  nextAudio: () => void;
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
