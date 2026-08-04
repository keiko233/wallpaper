import { Color4 } from "@babylonjs/core/Maths/math.color";
import { AnimatePresence, motion as Motion } from "motion/react";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
  type SetStateAction,
} from "react";
import { cn } from "@wallpaper/ui/utils";
import {
  MmdActionsContext,
  MmdCanvasContext,
  MmdPerformanceContext,
  MmdStateContext,
  type MmdActions,
  type MmdState,
  type MmdStatus,
} from "./mmd-context";
import {
  DEFAULT_MMD_RENDER_SETTINGS,
  type MmdMaterialRenderMode,
  type MmdPhysicsBackend,
  type MmdPlaylistItem,
  type MmdQualityPreset,
  type MmdRenderSettings,
  type ModelList,
  type MotionList,
  type PlayerPersistence,
  type PlanarReflectionTextureSize,
  type ShadowFilteringMode,
  type SkyboxList,
  type SsrQualityLevel,
  type StageList,
  type TextureAnisotropyLevel,
} from "../types";
import {
  DEFAULT_MODELS,
  DEFAULT_MOTIONS,
  DEFAULT_SKYBOXES,
  DEFAULT_STAGES,
} from "../defaults";
import { MmdController } from "../lib/babylon/MmdController";
import { PerformanceOverlay } from "../components/performance-overlay";
import { OVERLAY_VISIBLE_STORAGE_KEY } from "../lib/overlay-storage";
import { useLocalStorage } from "react-use";

const TRANSITION_COVER_DELAY_MS = 120;
const PLAYBACK_START_DELAY_MS = 160;
const PERSISTENCE_WRITE_DELAY_MS = 120;

export interface MmdProviderProps {
  children: ReactNode;
  models?: readonly ModelList[];
  motions?: readonly MotionList[];
  skyboxes?: readonly SkyboxList[];
  stages?: readonly StageList[];
  initialModelIndex?: number;
  initialMotionIndex?: number;
  initialBackground?: string;
  initialVolume?: number;
  initialPlaybackRate?: number;
  persistence?: PlayerPersistence;
}

function assertIndex(index: number, length: number, resource: string): void {
  if (!Number.isInteger(index) || index < 0 || index >= length) {
    throw new RangeError(`Invalid ${resource} index: ${index}`);
  }
}

function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeHexColor(color: string): string {
  const match = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.exec(color.trim());
  if (match === null) {
    throw new TypeError(
      `Invalid background color "${color}". Use #RGB, #RGBA, #RRGGBB or #RRGGBBAA.`,
    );
  }

  let channels = match[1];
  if (channels.length <= 4) {
    channels = [...channels].map((channel) => channel.repeat(2)).join("");
  }
  if (channels.length === 6) channels += "ff";
  return `#${channels.toUpperCase()}`;
}

function normalizeRgbHexColor(color: string, fallback: string): string {
  try {
    return normalizeHexColor(color).slice(0, 7);
  } catch {
    return fallback;
  }
}

function normalizeNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  const number = Number(value);
  return Number.isFinite(number) ? clamp(number, min, max) : fallback;
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeMaterialRenderMode(
  value: unknown,
): MmdMaterialRenderMode {
  return value === "balanced" || value === "performance" || value === "mmd"
    ? value
    : DEFAULT_MMD_RENDER_SETTINGS.materialRenderMode;
}

function normalizeQualityPreset(value: unknown): MmdQualityPreset {
  return value === "performance" ||
    value === "balanced" ||
    value === "ultra"
    ? value
    : DEFAULT_MMD_RENDER_SETTINGS.qualityPreset;
}

function normalizeShadowFiltering(value: unknown): ShadowFilteringMode {
  return value === "pcss" ? "pcss" : "pcf";
}

function normalizeSsrQuality(value: unknown): SsrQualityLevel {
  return value === "low" || value === "high"
    ? value
    : DEFAULT_MMD_RENDER_SETTINGS.ssrQuality;
}

function normalizePhysicsBackend(value: unknown): MmdPhysicsBackend {
  return value === "havok" ? "havok" : "ammo";
}

function normalizePhysicsStepRate(value: unknown): number {
  return value === 30 || value === 120 ? value : 60;
}

function normalizeTextureAnisotropy(
  value: unknown,
): TextureAnisotropyLevel {
  return value === 1 || value === 4 || value === 8 || value === 16
    ? value
    : DEFAULT_MMD_RENDER_SETTINGS.textureAnisotropy;
}

function normalizePlanarReflectionTextureSize(
  value: unknown,
): PlanarReflectionTextureSize {
  return value === 0 ||
    value === 256 ||
    value === 512 ||
    value === 1_024 ||
    value === 2_048
    ? value
    : DEFAULT_MMD_RENDER_SETTINGS.planarReflectionTextureSize;
}

function normalizeRenderSettings(value: unknown): MmdRenderSettings {
  const candidate =
    typeof value === "object" && value !== null
      ? (value as Partial<MmdRenderSettings>)
      : {};
  const defaults = DEFAULT_MMD_RENDER_SETTINGS;

  return {
    ambientLightIntensity: normalizeNumber(
      candidate.ambientLightIntensity,
      defaults.ambientLightIntensity,
      0,
      1,
    ),
    hemisphericLightIntensity: normalizeNumber(
      candidate.hemisphericLightIntensity,
      defaults.hemisphericLightIntensity,
      0,
      1.5,
    ),
    directionalLightIntensity: normalizeNumber(
      candidate.directionalLightIntensity,
      defaults.directionalLightIntensity,
      0,
      2,
    ),
    directionalLightColor: normalizeRgbHexColor(
      candidate.directionalLightColor ?? defaults.directionalLightColor,
      defaults.directionalLightColor,
    ),
    shadowOpacity: normalizeNumber(
      candidate.shadowOpacity,
      defaults.shadowOpacity,
      0,
      1,
    ),
    exposure: normalizeNumber(candidate.exposure, defaults.exposure, 0.25, 2),
    contrast: normalizeNumber(candidate.contrast, defaults.contrast, 0.5, 2),
    bloomEnabled: normalizeBoolean(
      candidate.bloomEnabled,
      defaults.bloomEnabled,
    ),
    bloomIntensity: normalizeNumber(
      candidate.bloomIntensity,
      defaults.bloomIntensity,
      0,
      1,
    ),
    bloomThreshold: normalizeNumber(
      candidate.bloomThreshold,
      defaults.bloomThreshold,
      0,
      1,
    ),
    depthOfFieldEnabled: normalizeBoolean(
      candidate.depthOfFieldEnabled,
      defaults.depthOfFieldEnabled,
    ),
    depthOfFieldFocusDistance: normalizeNumber(
      candidate.depthOfFieldFocusDistance,
      defaults.depthOfFieldFocusDistance,
      100,
      10000,
    ),
    depthOfFieldAperture: normalizeNumber(
      candidate.depthOfFieldAperture,
      defaults.depthOfFieldAperture,
      1,
      16,
    ),
    vignetteEnabled: normalizeBoolean(
      candidate.vignetteEnabled,
      defaults.vignetteEnabled,
    ),
    vignetteWeight: normalizeNumber(
      candidate.vignetteWeight,
      defaults.vignetteWeight,
      0,
      5,
    ),
    toneMappingEnabled: normalizeBoolean(
      candidate.toneMappingEnabled,
      defaults.toneMappingEnabled,
    ),
    colorSaturation: normalizeNumber(
      candidate.colorSaturation,
      defaults.colorSaturation,
      -100,
      100,
    ),
    materialRenderMode: normalizeMaterialRenderMode(
      candidate.materialRenderMode,
    ),
    stageEffectsEnabled: normalizeBoolean(
      candidate.stageEffectsEnabled,
      defaults.stageEffectsEnabled,
    ),
    planarReflectionEnabled: normalizeBoolean(
      candidate.planarReflectionEnabled,
      defaults.planarReflectionEnabled,
    ),
    planarReflectionTextureSize: normalizePlanarReflectionTextureSize(
      candidate.planarReflectionTextureSize,
    ),
    applyAmbientColorToDiffuse: normalizeBoolean(
      candidate.applyAmbientColorToDiffuse,
      defaults.applyAmbientColorToDiffuse,
    ),
    ignoreDiffuseWhenToonTextureIsNull: normalizeBoolean(
      candidate.ignoreDiffuseWhenToonTextureIsNull,
      defaults.ignoreDiffuseWhenToonTextureIsNull,
    ),
    sphereTextureEnabled: normalizeBoolean(
      candidate.sphereTextureEnabled,
      defaults.sphereTextureEnabled,
    ),
    toonTextureEnabled: normalizeBoolean(
      candidate.toonTextureEnabled,
      defaults.toonTextureEnabled,
    ),
    qualityPreset: normalizeQualityPreset(candidate.qualityPreset),
    msaaSamples: normalizeNumber(
      candidate.msaaSamples,
      defaults.msaaSamples,
      1,
      8,
    ),
    textureAnisotropy: normalizeTextureAnisotropy(
      candidate.textureAnisotropy,
    ),
    fxaaEnabled: normalizeBoolean(
      candidate.fxaaEnabled,
      defaults.fxaaEnabled,
    ),
    supersamplingScale: normalizeNumber(
      candidate.supersamplingScale,
      defaults.supersamplingScale,
      1,
      2,
    ),
    shadowMapSize: normalizeNumber(
      candidate.shadowMapSize,
      defaults.shadowMapSize,
      1024,
      4096,
    ),
    shadowFiltering: normalizeShadowFiltering(candidate.shadowFiltering),
    ssaoEnabled: normalizeBoolean(candidate.ssaoEnabled, defaults.ssaoEnabled),
    ssaoRadius: normalizeNumber(
      candidate.ssaoRadius,
      defaults.ssaoRadius,
      0.0001,
      0.01,
    ),
    ssaoStrength: normalizeNumber(
      candidate.ssaoStrength,
      defaults.ssaoStrength,
      0,
      2,
    ),
    ssrEnabled: normalizeBoolean(candidate.ssrEnabled, defaults.ssrEnabled),
    ssrStrength: normalizeNumber(
      candidate.ssrStrength,
      defaults.ssrStrength,
      0,
      2,
    ),
    ssrQuality: normalizeSsrQuality(candidate.ssrQuality),
    physicsConstraintLimitDegrees: normalizeNumber(
      candidate.physicsConstraintLimitDegrees,
      defaults.physicsConstraintLimitDegrees,
      5,
      30,
    ),
    rimLightEnabled: normalizeBoolean(
      candidate.rimLightEnabled,
      defaults.rimLightEnabled,
    ),
    rimLightIntensity: normalizeNumber(
      candidate.rimLightIntensity,
      defaults.rimLightIntensity,
      0,
      1,
    ),
    physicsBackend: normalizePhysicsBackend(candidate.physicsBackend),
    physicsSolverIterations: normalizeNumber(
      candidate.physicsSolverIterations,
      defaults.physicsSolverIterations,
      5,
      30,
    ),
    physicsStepRate: normalizePhysicsStepRate(candidate.physicsStepRate),
    physicsStrength: normalizeNumber(
      candidate.physicsStrength,
      defaults.physicsStrength,
      0.5,
      3,
    ),
  };
}

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function createDefaultPlaylist(
  models: readonly ModelList[],
  motions: readonly MotionList[],
  stages: readonly StageList[],
  skyboxes: readonly SkyboxList[],
): MmdPlaylistItem[] {
  return models.flatMap((_, modelIndex) =>
    motions.map((__, motionIndex) => ({
      id: `default-${modelIndex}-${motionIndex}`,
      modelId: models[modelIndex].id,
      motionId: motions[motionIndex].id,
      stageId: stages[0].id,
      skyboxId: skyboxes[0].id,
    })),
  );
}

function normalizePlaylist(
  value: unknown,
  models: readonly ModelList[],
  motions: readonly MotionList[],
  stages: readonly StageList[],
  skyboxes: readonly SkyboxList[],
): MmdPlaylistItem[] {
  if (!Array.isArray(value)) {
    return createDefaultPlaylist(models, motions, stages, skyboxes);
  }

  const modelIds = new Set(models.map((model) => model.id));
  const motionIds = new Set(motions.map((motion) => motion.id));
  const stageIds = new Set(stages.map((stage) => stage.id));
  const skyboxIds = new Set(skyboxes.map((skybox) => skybox.id));
  const seenIds = new Set<string>();
  const normalized = value.flatMap((item, index): MmdPlaylistItem[] => {
    if (typeof item !== "object" || item === null) return [];

    const candidate = item as Partial<MmdPlaylistItem> & {
      modelIndex?: number;
      motionIndex?: number;
      stageIndex?: number;
      skyboxIndex?: number;
    };
    const modelId =
      typeof candidate.modelId === "string"
        ? candidate.modelId
        : Number.isInteger(candidate.modelIndex)
          ? models[candidate.modelIndex!]?.id
          : undefined;
    const motionId =
      typeof candidate.motionId === "string"
        ? candidate.motionId
        : Number.isInteger(candidate.motionIndex)
          ? motions[candidate.motionIndex!]?.id
          : undefined;
    const stageId =
      typeof candidate.stageId === "string"
        ? candidate.stageId
        : Number.isInteger(candidate.stageIndex)
          ? stages[candidate.stageIndex!]?.id
          : stages[0].id;
    const skyboxId =
      typeof candidate.skyboxId === "string"
        ? candidate.skyboxId
        : Number.isInteger(candidate.skyboxIndex)
          ? skyboxes[candidate.skyboxIndex!]?.id
          : skyboxes[0].id;
    if (
      modelId === undefined ||
      motionId === undefined ||
      stageId === undefined ||
      skyboxId === undefined ||
      !modelIds.has(modelId) ||
      !motionIds.has(motionId) ||
      !stageIds.has(stageId) ||
      !skyboxIds.has(skyboxId)
    ) {
      return [];
    }

    const baseId =
      typeof candidate.id === "string" && candidate.id.length > 0
        ? candidate.id
        : `restored-${index}`;
    let id = baseId;
    let suffix = 1;
    while (seenIds.has(id)) id = `${baseId}-${suffix++}`;
    seenIds.add(id);

    return [
      {
        id,
        modelId,
        motionId,
        stageId,
        skyboxId,
      },
    ];
  });

  return normalized.length > 0
    ? normalized
    : createDefaultPlaylist(models, motions, stages, skyboxes);
}

function getResourceKey(
  item: MmdPlaylistItem,
  models: readonly ModelList[],
  motions: readonly MotionList[],
  stages: readonly StageList[],
  skyboxes: readonly SkyboxList[],
): string {
  const model = models.find((candidate) => candidate.id === item.modelId)!;
  const motion = motions.find((candidate) => candidate.id === item.motionId)!;
  const stage = stages.find((candidate) => candidate.id === item.stageId)!;
  const skybox = skyboxes.find(
    (candidate) => candidate.id === item.skyboxId,
  )!;
  return `${item.id}|${model.modelPath}|${stage.stagePath ?? "solid-color"}|${skybox.skyboxPath ?? "no-skybox"}|${motion.audioPath}|${motion.cameraPath ?? "default-camera"}|${motion.motionPath.join("|")}|camera-delay-${motion.cameraDelaySeconds ?? 0}|stage-render-${JSON.stringify(stage.render ?? null)}`;
}

export function MmdProvider({
  children,
  models = DEFAULT_MODELS,
  motions = DEFAULT_MOTIONS,
  skyboxes = DEFAULT_SKYBOXES,
  stages = DEFAULT_STAGES,
  initialModelIndex = 0,
  initialMotionIndex = 0,
  initialBackground = "#FFFFFFFF",
  initialVolume = 0.3,
  initialPlaybackRate = 1,
  persistence,
}: MmdProviderProps) {
  if (
    models.length === 0 ||
    motions.length === 0 ||
    stages.length === 0 ||
    skyboxes.length === 0
  ) {
    throw new Error(
      "MmdProvider requires at least one model, motion, stage, and skybox option.",
    );
  }

  assertIndex(initialModelIndex, models.length, "initial model");
  assertIndex(initialMotionIndex, motions.length, "initial motion");

  const defaultPlaylist = useMemo(
    () => createDefaultPlaylist(models, motions, stages, skyboxes),
    [models, motions, stages, skyboxes],
  );
  const [storedPlaylist, setStoredPlaylist] = useState<MmdPlaylistItem[]>(
    defaultPlaylist,
  );
  const playlist = useMemo(
    () =>
      normalizePlaylist(
        storedPlaylist,
        models,
        motions,
        stages,
        skyboxes,
      ),
    [storedPlaylist, models, motions, stages, skyboxes],
  );
  const [storedPlaylistIndex, setStoredPlaylistIndex] = useState(0);
  const [background, setBackgroundState] = useState(() =>
    normalizeHexColor(initialBackground),
  );
  const [volume, setVolumeState] = useState(() =>
    clamp(initialVolume, 0, 1),
  );
  const [playbackRate, setPlaybackRateState] = useState(() =>
    clamp(initialPlaybackRate, 0.07, 16),
  );
  const [renderSettings, setStoredRenderSettings] =
    useState<MmdRenderSettings>(() => ({
      ...DEFAULT_MMD_RENDER_SETTINGS,
    }));
  const [isPersistenceReady, setIsPersistenceReady] = useState(
    persistence === undefined,
  );
  const [persistenceRevision, setPersistenceRevision] = useState(0);
  const markPersistenceDirty = useCallback(() => {
    setPersistenceRevision((revision) => revision + 1);
  }, []);

  useEffect(() => {
    let active = true;

    if (persistence === undefined) {
      setIsPersistenceReady(true);
      return;
    }

    setIsPersistenceReady(false);
    void persistence
      .load()
      .then((state) => {
        if (!active) return;

        if (state.playlist !== undefined) {
          setStoredPlaylist(
            normalizePlaylist(
              state.playlist,
              models,
              motions,
              stages,
              skyboxes,
            ),
          );
        }
        if (Number.isInteger(state.playlistIndex)) {
          setStoredPlaylistIndex(state.playlistIndex!);
        }
        if (typeof state.background === "string") {
          try {
            setBackgroundState(normalizeHexColor(state.background));
          } catch {
            setBackgroundState(normalizeHexColor(initialBackground));
          }
        }
        if (state.volume !== undefined) {
          setVolumeState(normalizeNumber(state.volume, initialVolume, 0, 1));
        }
        if (state.playbackRate !== undefined) {
          setPlaybackRateState(
            normalizeNumber(state.playbackRate, initialPlaybackRate, 0.07, 16),
          );
        }
        if (state.renderSettings !== undefined) {
          setStoredRenderSettings(
            normalizeRenderSettings(state.renderSettings),
          );
        }
      })
      .catch((persistenceError: unknown) => {
        console.error("Unable to restore player state.", persistenceError);
      })
      .finally(() => {
        if (active) setIsPersistenceReady(true);
      });

    return () => {
      active = false;
    };
  }, [
    persistence,
    models,
    motions,
    stages,
    skyboxes,
    initialBackground,
    initialVolume,
    initialPlaybackRate,
  ]);

  useEffect(() => {
    if (
      persistence === undefined ||
      !isPersistenceReady ||
      persistenceRevision === 0
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void persistence
        .save({
          playlist,
          playlistIndex: storedPlaylistIndex,
          background,
          volume,
          playbackRate,
          renderSettings,
        })
        .catch((persistenceError: unknown) => {
          console.error("Unable to persist player state.", persistenceError);
        });
    }, PERSISTENCE_WRITE_DELAY_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    persistence,
    isPersistenceReady,
    persistenceRevision,
    playlist,
    storedPlaylistIndex,
    background,
    volume,
    playbackRate,
    renderSettings,
  ]);

  const safePlaylistIndex = wrapIndex(storedPlaylistIndex, playlist.length);
  const playlistItem = playlist[safePlaylistIndex];
  const modelIndex = models.findIndex(
    (candidate) => candidate.id === playlistItem.modelId,
  );
  const motionIndex = motions.findIndex(
    (candidate) => candidate.id === playlistItem.motionId,
  );
  const stageIndex = stages.findIndex(
    (candidate) => candidate.id === playlistItem.stageId,
  );
  const skyboxIndex = skyboxes.findIndex(
    (candidate) => candidate.id === playlistItem.skyboxId,
  );
  const model = models[modelIndex];
  const motion = motions[motionIndex];
  const stage = stages[stageIndex];
  const skybox = skyboxes[skyboxIndex];

  const [canvases, setCanvases] = useState<
    [HTMLCanvasElement | null, HTMLCanvasElement | null]
  >([null, null]);
  const [activeSlot, setActiveSlot] = useState(0);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [statsRevision, setStatsRevision] = useState(0);
  const [overlayVisibleStored, setOverlayVisible] = useLocalStorage(
    OVERLAY_VISIBLE_STORAGE_KEY,
    false,
  );
  const overlayVisible = overlayVisibleStored === true;
  const [status, setStatus] = useState<MmdStatus>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);

  const controllersRef = useRef<[MmdController, MmdController] | null>(null);
  if (controllersRef.current === null) {
    controllersRef.current = [new MmdController(), new MmdController()];
  }
  const controllers = controllersRef.current;
  const activeSlotRef = useRef(activeSlot);
  const backgroundRef = useRef(background);
  const volumeRef = useRef(volume);
  const playbackRateRef = useRef(playbackRate);
  const renderSettingsRef = useRef(renderSettings);
  const playlistRef = useRef(playlist);
  const slotKeysRef = useRef<[string | null, string | null]>([null, null]);
  const loadingKeysRef = useRef<[string | null, string | null]>([null, null]);
  const loadingPromisesRef = useRef<
    [Promise<boolean> | null, Promise<boolean> | null]
  >([null, null]);
  const transitionRequestRef = useRef(0);
  const handleTrackEndRef = useRef<() => void>(() => undefined);

  backgroundRef.current = background;
  volumeRef.current = volume;
  playbackRateRef.current = playbackRate;
  renderSettingsRef.current = renderSettings;
  playlistRef.current = playlist;

  useEffect(() => {
    if (JSON.stringify(storedPlaylist) !== JSON.stringify(playlist)) {
      setStoredPlaylist(playlist);
      markPersistenceDirty();
    }
  }, [storedPlaylist, playlist, markPersistenceDirty]);

  useEffect(() => {
    if (storedPlaylistIndex !== safePlaylistIndex) {
      setStoredPlaylistIndex(safePlaylistIndex);
      markPersistenceDirty();
    }
  }, [storedPlaylistIndex, safePlaylistIndex, markPersistenceDirty]);

  useEffect(() => {
    return () => {
      controllers[0].dispose();
      controllers[1].dispose();
    };
  }, [controllers]);

  const setCanvas = useCallback(
    (slot: number, canvas: HTMLCanvasElement | null) => {
      setCanvases((current) => {
        if (current[slot] === canvas) return current;
        const next = [...current] as [
          HTMLCanvasElement | null,
          HTMLCanvasElement | null,
        ];
        next[slot] = canvas;
        return next;
      });
    },
    [],
  );

  const setPlaylist = useCallback(
    (value: SetStateAction<MmdPlaylistItem[]>): void => {
      markPersistenceDirty();
      setStoredPlaylist((current) => {
        const normalizedCurrent = normalizePlaylist(
          current,
          models,
          motions,
          stages,
          skyboxes,
        );
        const next =
          typeof value === "function" ? value(normalizedCurrent) : value;
        return normalizePlaylist(next, models, motions, stages, skyboxes);
      });
    },
    [models, motions, stages, skyboxes, markPersistenceDirty],
  );

  const loadSlot = useCallback(
    (
      slot: number,
      key: string,
      item: MmdPlaylistItem,
    ): Promise<boolean> => {
      if (slotKeysRef.current[slot] === key) return Promise.resolve(true);
      if (
        loadingKeysRef.current[slot] === key &&
        loadingPromisesRef.current[slot] !== null
      ) {
        return loadingPromisesRef.current[slot]!;
      }

      const canvas = canvases[slot];
      if (canvas === null) return Promise.resolve(false);

      const targetController = controllers[slot];
      const targetModel = models.find(
        (candidate) => candidate.id === item.modelId,
      )!;
      const targetMotion = motions.find(
        (candidate) => candidate.id === item.motionId,
      )!;
      const targetStage = stages.find(
        (candidate) => candidate.id === item.stageId,
      )!;
      const targetSkybox = skyboxes.find(
        (candidate) => candidate.id === item.skyboxId,
      )!;
      targetController.setOnEnded(null);
      slotKeysRef.current[slot] = null;
      loadingKeysRef.current[slot] = key;

      const promise = targetController
        .load(canvas, {
          modelPath: targetModel.modelPath,
          stagePath: targetStage.stagePath,
          skyboxPath: targetSkybox.skyboxPath,
          motionPath: targetMotion.motionPath,
          audioPath: targetMotion.audioPath,
          cameraPath: targetMotion.cameraPath,
          cameraDelaySeconds: targetMotion.cameraDelaySeconds,
          backgroundColor: Color4.FromHexString(backgroundRef.current),
          renderSettings: renderSettingsRef.current,
          stageRenderProfile: targetStage.render ?? null,
        })
        .then((loaded) => {
          if (loaded && loadingKeysRef.current[slot] === key) {
            slotKeysRef.current[slot] = key;
            // A new stats sampler now exists for this slot; bump the revision
            // so consumers resubscribe even when the active slot is unchanged
            // (e.g. an in-place reload).
            setStatsRevision((revision) => revision + 1);
          }
          return loaded;
        })
        .finally(() => {
          if (loadingKeysRef.current[slot] === key) {
            loadingKeysRef.current[slot] = null;
            loadingPromisesRef.current[slot] = null;
          }
        });

      loadingPromisesRef.current[slot] = promise;
      return promise;
    },
    [canvases, controllers, models, motions, stages, skyboxes],
  );

  handleTrackEndRef.current = () => {
    const currentPlaylist = playlistRef.current;
    if (currentPlaylist.length <= 1) {
      const controller = controllers[activeSlotRef.current];
      void controller.seek(0).then(() => controller.play());
      return;
    }
    setIsPlaying(false);
    markPersistenceDirty();
    setStoredPlaylistIndex((index) =>
      wrapIndex(index + 1, currentPlaylist.length),
    );
  };

  const desiredKey = `${getResourceKey(
    playlistItem,
    models,
    motions,
    stages,
    skyboxes,
  )}|reload-${reloadVersion}`;

  useEffect(() => {
    if (
      !isPersistenceReady ||
      canvases[0] === null ||
      canvases[1] === null
    ) {
      setStatus("idle");
      return;
    }

    const request = ++transitionRequestRef.current;
    setIsPreloading(false);
    setStatus("loading");
    setError(null);
    setIsPlaying(false);

    const previousSlot = activeSlotRef.current;
    const previousController = controllers[previousSlot];
    previousController.setOnEnded(null);
    previousController.deactivate();

    void (async () => {
      // Let React paint the transition cover and release the previous render
      // loop before model parsing and GPU uploads begin.
      await delay(TRANSITION_COVER_DELAY_MS);
      if (request !== transitionRequestRef.current) return;

      let targetSlot = slotKeysRef.current.findIndex(
        (key) => key === desiredKey,
      );
      if (targetSlot < 0) {
        const currentSlot = activeSlotRef.current;
        targetSlot =
          slotKeysRef.current[currentSlot] === null ? currentSlot : 1 - currentSlot;
        const loaded = await loadSlot(targetSlot, desiredKey, playlistItem);
        if (!loaded) return;
      }

      if (request !== transitionRequestRef.current) return;

      const targetController = controllers[targetSlot];

      targetController.setRenderSettings(renderSettingsRef.current);
      targetController.setVolume(volumeRef.current);
      targetController.setPlaybackRate(playbackRateRef.current);
      const activated = targetController.activate();
      if (!activated || request !== transitionRequestRef.current) return;

      activeSlotRef.current = targetSlot;
      setActiveSlot(targetSlot);

      // Give the target canvas time to present its first frame before audio and
      // animation resume. This keeps decoding/upload spikes out of playback.
      await delay(PLAYBACK_START_DELAY_MS);
      if (request !== transitionRequestRef.current) return;

      const played = await targetController.play();
      if (!played || request !== transitionRequestRef.current) return;

      targetController.setOnEnded(() => handleTrackEndRef.current());
      setStatus("ready");
      setIsPlaying(true);
    })().catch((loadError: unknown) => {
      if (request !== transitionRequestRef.current) return;
      setStatus("error");
      setError(toError(loadError));
      setIsPlaying(false);
    });
  }, [
    isPersistenceReady,
    canvases,
    controllers,
    desiredKey,
    loadSlot,
    playlistItem,
  ]);

  useEffect(() => {
    if (
      !isPersistenceReady ||
      status !== "ready" ||
      playlist.length < 2
    ) {
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      const nextIndex = wrapIndex(safePlaylistIndex + 1, playlist.length);
      const nextItem = playlist[nextIndex];
      const nextKey = `${getResourceKey(
        nextItem,
        models,
        motions,
        stages,
        skyboxes,
      )}|reload-${reloadVersion}`;
      if (slotKeysRef.current.includes(nextKey)) return;

      const targetSlot = 1 - activeSlotRef.current;
      setIsPreloading(true);
      void loadSlot(targetSlot, nextKey, nextItem)
        .catch(() => {
          // A failed speculative load is retried as a visible load on navigation.
        })
        .finally(() => {
          if (!cancelled) setIsPreloading(false);
        });
    }, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [
    status,
    isPersistenceReady,
    safePlaylistIndex,
    playlist,
    models,
    motions,
    stages,
    skyboxes,
    reloadVersion,
    loadSlot,
  ]);

  const updateCurrentItem = useCallback(
    (
      update: Partial<
        Pick<
          MmdPlaylistItem,
          "modelId" | "motionId" | "stageId" | "skyboxId"
        >
      >,
    ) => {
      setPlaylist((current) =>
        current.map((item, index) =>
          index === safePlaylistIndex ? { ...item, ...update } : item,
        ),
      );
    },
    [safePlaylistIndex, setPlaylist],
  );

  const selectModel = useCallback(
    (index: number): void => {
      assertIndex(index, models.length, "model");
      updateCurrentItem({ modelId: models[index].id });
    },
    [models, updateCurrentItem],
  );
  const selectMotion = useCallback(
    (index: number): void => {
      assertIndex(index, motions.length, "motion");
      updateCurrentItem({ motionId: motions[index].id });
    },
    [motions, updateCurrentItem],
  );
  const selectStage = useCallback(
    (index: number): void => {
      assertIndex(index, stages.length, "stage");
      updateCurrentItem({ stageId: stages[index].id });
    },
    [stages, updateCurrentItem],
  );
  const selectSkybox = useCallback(
    (index: number): void => {
      assertIndex(index, skyboxes.length, "skybox");
      updateCurrentItem({ skyboxId: skyboxes[index].id });
    },
    [skyboxes, updateCurrentItem],
  );
  const previousModel = useCallback(() => {
    selectModel(wrapIndex(modelIndex - 1, models.length));
  }, [modelIndex, models.length, selectModel]);
  const nextModel = useCallback(() => {
    selectModel(wrapIndex(modelIndex + 1, models.length));
  }, [modelIndex, models.length, selectModel]);
  const previousMotion = useCallback(() => {
    selectMotion(wrapIndex(motionIndex - 1, motions.length));
  }, [motionIndex, motions.length, selectMotion]);
  const nextMotion = useCallback(() => {
    selectMotion(wrapIndex(motionIndex + 1, motions.length));
  }, [motionIndex, motions.length, selectMotion]);
  const previousStage = useCallback(() => {
    selectStage(wrapIndex(stageIndex - 1, stages.length));
  }, [selectStage, stageIndex, stages.length]);
  const nextStage = useCallback(() => {
    selectStage(wrapIndex(stageIndex + 1, stages.length));
  }, [selectStage, stageIndex, stages.length]);
  const previousSkybox = useCallback(() => {
    selectSkybox(wrapIndex(skyboxIndex - 1, skyboxes.length));
  }, [selectSkybox, skyboxIndex, skyboxes.length]);
  const nextSkybox = useCallback(() => {
    selectSkybox(wrapIndex(skyboxIndex + 1, skyboxes.length));
  }, [selectSkybox, skyboxIndex, skyboxes.length]);
  const selectPlaylistItem = useCallback(
    (index: number) => {
      assertIndex(index, playlist.length, "playlist");
      markPersistenceDirty();
      setStoredPlaylistIndex(index);
    },
    [playlist.length, markPersistenceDirty],
  );
  const previousPlaylistItem = useCallback(() => {
    markPersistenceDirty();
    setStoredPlaylistIndex((index) => wrapIndex(index - 1, playlist.length));
  }, [playlist.length, markPersistenceDirty]);
  const nextPlaylistItem = useCallback(() => {
    markPersistenceDirty();
    setStoredPlaylistIndex((index) => wrapIndex(index + 1, playlist.length));
  }, [playlist.length, markPersistenceDirty]);
  const resetPlaylist = useCallback(() => {
    markPersistenceDirty();
    setStoredPlaylist(defaultPlaylist);
    setStoredPlaylistIndex(0);
  }, [defaultPlaylist, markPersistenceDirty]);
  const setBackground = useCallback(
    (color: string): void => {
      const normalizedColor = normalizeHexColor(color);
      markPersistenceDirty();
      backgroundRef.current = normalizedColor;
      setBackgroundState(normalizedColor);
      const babylonColor = Color4.FromHexString(normalizedColor);
      controllers[0].setBackgroundColor(babylonColor);
      controllers[1].setBackgroundColor(babylonColor);
    },
    [controllers, markPersistenceDirty],
  );
  const reload = useCallback(() => {
    setReloadVersion((version) => version + 1);
  }, []);
  const play = useCallback(async (): Promise<void> => {
    const played = await controllers[activeSlotRef.current].play();
    if (played) setIsPlaying(true);
  }, [controllers]);
  const pause = useCallback((): void => {
    const paused = controllers[activeSlotRef.current].pause();
    if (paused) setIsPlaying(false);
  }, [controllers]);
  const togglePlayback = useCallback(async (): Promise<void> => {
    if (isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [isPlaying, pause, play]);
  const seek = useCallback(
    async (seconds: number): Promise<void> => {
      await controllers[activeSlotRef.current].seek(seconds);
    },
    [controllers],
  );
  const setVolume = useCallback(
    (nextVolume: number): void => {
      const normalizedVolume = clamp(nextVolume, 0, 1);
      markPersistenceDirty();
      volumeRef.current = normalizedVolume;
      setVolumeState(normalizedVolume);
      controllers[activeSlotRef.current].setVolume(normalizedVolume);
    },
    [controllers, markPersistenceDirty],
  );
  const setPlaybackRate = useCallback(
    (rate: number): void => {
      const normalizedRate = clamp(rate, 0.07, 16);
      markPersistenceDirty();
      playbackRateRef.current = normalizedRate;
      setPlaybackRateState(normalizedRate);
      controllers[activeSlotRef.current].setPlaybackRate(normalizedRate);
    },
    [controllers, markPersistenceDirty],
  );
  const setRenderSettings = useCallback(
    (settings: Partial<MmdRenderSettings>): void => {
      const current = renderSettingsRef.current;
      const next = normalizeRenderSettings({ ...current, ...settings });
      const requiresReload =
        next.materialRenderMode !== current.materialRenderMode ||
        next.stageEffectsEnabled !== current.stageEffectsEnabled ||
        next.planarReflectionEnabled !== current.planarReflectionEnabled ||
        next.planarReflectionTextureSize !==
          current.planarReflectionTextureSize ||
        next.ssaoEnabled !== current.ssaoEnabled ||
        next.ssrEnabled !== current.ssrEnabled ||
        next.physicsConstraintLimitDegrees !==
          current.physicsConstraintLimitDegrees ||
        next.physicsBackend !== current.physicsBackend ||
        next.physicsStrength !== current.physicsStrength;

      markPersistenceDirty();
      renderSettingsRef.current = next;
      setStoredRenderSettings(next);
      controllers[0].setRenderSettings(next);
      controllers[1].setRenderSettings(next);

      if (requiresReload) {
        setReloadVersion((version) => version + 1);
      }
    },
    [controllers, markPersistenceDirty],
  );
  const resetRenderSettings = useCallback((): void => {
    setRenderSettings({ ...DEFAULT_MMD_RENDER_SETTINGS });
  }, [setRenderSettings]);

  const state = useMemo<MmdState>(
    () => ({
      models,
      motions,
      stages,
      skyboxes,
      modelIndex,
      motionIndex,
      stageIndex,
      skyboxIndex,
      model,
      motion,
      stage,
      skybox,
      playlist,
      playlistIndex: safePlaylistIndex,
      isPreloading,
      background,
      status,
      error,
      isPlaying,
      volume,
      playbackRate,
      renderSettings,
    }),
    [
      models,
      motions,
      stages,
      skyboxes,
      modelIndex,
      motionIndex,
      stageIndex,
      skyboxIndex,
      model,
      motion,
      stage,
      skybox,
      playlist,
      safePlaylistIndex,
      isPreloading,
      background,
      status,
      error,
      isPlaying,
      volume,
      playbackRate,
      renderSettings,
    ],
  );
  const actions = useMemo<MmdActions>(
    () => ({
      selectModel,
      selectMotion,
      selectStage,
      selectSkybox,
      previousModel,
      nextModel,
      previousMotion,
      nextMotion,
      previousStage,
      nextStage,
      previousSkybox,
      nextSkybox,
      selectPlaylistItem,
      previousPlaylistItem,
      nextPlaylistItem,
      setPlaylist,
      resetPlaylist,
      setBackground,
      reload,
      play,
      pause,
      togglePlayback,
      seek,
      setVolume,
      setPlaybackRate,
      setRenderSettings,
      resetRenderSettings,
    }),
    [
      selectModel,
      selectMotion,
      selectStage,
      selectSkybox,
      previousModel,
      nextModel,
      previousMotion,
      nextMotion,
      previousStage,
      nextStage,
      previousSkybox,
      nextSkybox,
      selectPlaylistItem,
      previousPlaylistItem,
      nextPlaylistItem,
      setPlaylist,
      resetPlaylist,
      setBackground,
      reload,
      play,
      pause,
      togglePlayback,
      seek,
      setVolume,
      setPlaybackRate,
      setRenderSettings,
      resetRenderSettings,
    ],
  );
  const canvasState = useMemo(
    () => ({ activeSlot, isTransitioning: status === "loading", setCanvas }),
    [activeSlot, status, setCanvas],
  );
  const performanceState = useMemo(
    () => ({
      activeSlot,
      statsRevision,
      overlayVisible,
      setOverlayVisible,
      getStats: (slot: number) => controllers[slot].getStats() ?? null,
    }),
    [activeSlot, controllers, statsRevision, overlayVisible, setOverlayVisible],
  );

  return (
    <MmdCanvasContext value={canvasState}>
      <MmdStateContext value={state}>
        <MmdActionsContext value={actions}>
          <MmdPerformanceContext value={performanceState}>
            {children}
          </MmdPerformanceContext>
        </MmdActionsContext>
      </MmdStateContext>
    </MmdCanvasContext>
  );
}

export function MmdCanvas({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  const context = useContext(MmdCanvasContext);
  if (context === null) {
    throw new Error("MmdCanvas must be rendered within MmdProvider.");
  }

  const { activeSlot, isTransitioning, setCanvas } = context;
  const setFirstCanvas = useCallback(
    (canvas: HTMLCanvasElement | null) => setCanvas(0, canvas),
    [setCanvas],
  );
  const setSecondCanvas = useCallback(
    (canvas: HTMLCanvasElement | null) => setCanvas(1, canvas),
    [setCanvas],
  );

  return (
    <div className={cn("relative overflow-hidden", className)} {...props}>
      <canvas
        aria-hidden={activeSlot !== 0}
        className={cn(
          "absolute inset-0 size-full transition-opacity duration-500 ease-out",
          activeSlot === 0
            ? "z-10 opacity-100"
            : "pointer-events-none z-0 opacity-0",
        )}
        ref={setFirstCanvas}
      />
      <canvas
        aria-hidden={activeSlot !== 1}
        className={cn(
          "absolute inset-0 size-full transition-opacity duration-500 ease-out",
          activeSlot === 1
            ? "z-10 opacity-100"
            : "pointer-events-none z-0 opacity-0",
        )}
        ref={setSecondCanvas}
      />
      <PerformanceOverlay />
      <AnimatePresence>
        {isTransitioning && (
          <Motion.div
            animate={{ opacity: 1 }}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            transition={{
              duration: 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Motion.div
              animate={{ opacity: [0.35, 0.75, 0.35], scale: [0.92, 1, 0.92] }}
              className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground/90 shadow-lg shadow-primary/40"
              transition={{
                duration: 1.1,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
