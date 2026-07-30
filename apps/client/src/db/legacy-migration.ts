import type {
  MmdPlaylistItem,
  PersistedPlayerState,
} from "@wallpaper/player/types";
import type { WallpaperClientDatabase } from "./database";
import type { PlaylistItemRecord, SettingRecord } from "./models";

export const DEFAULT_PLAYLIST_ID = "default";
export const LEGACY_IMPORT_METADATA_KEY = "legacy-player-v1-imported";

const LEGACY_KEYS = {
  playlist: "mmd-playlist-v1",
  playlistIndex: "mmd-playlist-index-v1",
  background: "mmd-background-v1",
  volume: "mmd-volume-v1",
  playbackRate: "mmd-playback-rate-v1",
  renderSettings: "mmd-render-settings-v1",
} as const;

export interface LegacyStorage {
  getItem(key: string): string | null;
}

export interface PlayerResourceIds {
  models: readonly string[];
  motions: readonly string[];
  audios?: readonly string[];
  stages: readonly string[];
}

interface LegacyPlaylistItem extends Partial<MmdPlaylistItem> {
  modelIndex?: number;
  motionIndex?: number;
  stageIndex?: number;
}

function readLegacyValue(
  storage: LegacyStorage | undefined,
  key: string,
): unknown {
  if (storage === undefined) return undefined;

  try {
    const value = storage.getItem(key);
    if (value === null) return undefined;

    try {
      return JSON.parse(value) as unknown;
    } catch {
      return value;
    }
  } catch {
    return undefined;
  }
}

function normalizeLegacyPlaylist(
  value: unknown,
  resources: PlayerResourceIds,
): MmdPlaylistItem[] {
  if (!Array.isArray(value) || resources.stages.length === 0) return [];

  const modelIds = new Set(resources.models);
  const motionIds = new Set(resources.motions);
  const audioIds = new Set(resources.audios ?? []);
  const stageIds = new Set(resources.stages);
  const itemIds = new Set<string>();

  return value.flatMap((valueItem, index): MmdPlaylistItem[] => {
    if (typeof valueItem !== "object" || valueItem === null) return [];
    const item = valueItem as LegacyPlaylistItem;
    const modelId =
      typeof item.modelId === "string" && modelIds.has(item.modelId)
        ? item.modelId
        : Number.isInteger(item.modelIndex)
          ? resources.models[item.modelIndex!]
          : undefined;
    const motionId =
      typeof item.motionId === "string" && motionIds.has(item.motionId)
        ? item.motionId
        : Number.isInteger(item.motionIndex)
          ? resources.motions[item.motionIndex!]
          : undefined;
    const stageId =
      typeof item.stageId === "string" && stageIds.has(item.stageId)
        ? item.stageId
        : Number.isInteger(item.stageIndex)
          ? resources.stages[item.stageIndex!]
          : resources.stages[0];
    const legacyAudioId =
      motionId === undefined ? undefined : `${motionId}:audio`;
    const audioId =
      typeof item.audioId === "string" && audioIds.has(item.audioId)
        ? item.audioId
        : legacyAudioId !== undefined && audioIds.has(legacyAudioId)
          ? legacyAudioId
          : resources.audios?.[0];

    if (
      modelId === undefined ||
      motionId === undefined ||
      stageId === undefined
    ) {
      return [];
    }

    const baseId =
      typeof item.id === "string" && item.id.length > 0
        ? item.id
        : `legacy-${index}`;
    let id = baseId;
    let suffix = 1;
    while (itemIds.has(id)) id = `${baseId}-${suffix++}`;
    itemIds.add(id);

    return [{ id, modelId, motionId, audioId, stageId }];
  });
}

function readLegacyState(
  storage: LegacyStorage | undefined,
  resources: PlayerResourceIds,
): PersistedPlayerState {
  const state: PersistedPlayerState = {};
  const playlist = normalizeLegacyPlaylist(
    readLegacyValue(storage, LEGACY_KEYS.playlist),
    resources,
  );
  if (playlist.length > 0) state.playlist = playlist;

  const playlistIndex = readLegacyValue(
    storage,
    LEGACY_KEYS.playlistIndex,
  );
  if (Number.isInteger(playlistIndex)) {
    state.playlistIndex = playlistIndex as number;
  }

  const background = readLegacyValue(storage, LEGACY_KEYS.background);
  if (typeof background === "string") state.background = background;

  const volume = readLegacyValue(storage, LEGACY_KEYS.volume);
  if (typeof volume === "number") state.volume = volume;

  const playbackRate = readLegacyValue(
    storage,
    LEGACY_KEYS.playbackRate,
  );
  if (typeof playbackRate === "number") state.playbackRate = playbackRate;

  const renderSettings = readLegacyValue(
    storage,
    LEGACY_KEYS.renderSettings,
  );
  if (typeof renderSettings === "object" && renderSettings !== null) {
    state.renderSettings =
      renderSettings as PersistedPlayerState["renderSettings"];
  }

  return state;
}

function toSettingRecords(
  state: PersistedPlayerState,
  updatedAt: string,
): SettingRecord[] {
  return (
    [
      ["background", state.background],
      ["volume", state.volume],
      ["playbackRate", state.playbackRate],
      ["renderSettings", state.renderSettings],
    ] as const
  ).flatMap(([key, value]) =>
    value === undefined ? [] : [{ key, value, updatedAt }],
  );
}

export async function migrateLegacyPlayerState(
  database: WallpaperClientDatabase,
  resources: PlayerResourceIds,
  storage: LegacyStorage | undefined,
  now = new Date(),
): Promise<void> {
  await database.transaction(
    "rw",
    database.meta,
    database.settings,
    database.playlists,
    database.playlistItems,
    async () => {
      if (
        (await database.meta.get(LEGACY_IMPORT_METADATA_KEY)) !== undefined
      ) {
        return;
      }

      const importedAt = now.toISOString();
      const state = readLegacyState(storage, resources);
      const playlist = state.playlist ?? [];

      if (playlist.length > 0) {
        const safeIndex = Math.min(
          Math.max(state.playlistIndex ?? 0, 0),
          playlist.length - 1,
        );
        await database.playlists.put({
          id: DEFAULT_PLAYLIST_ID,
          name: "Default",
          currentItemId: playlist[safeIndex].id,
          createdAt: importedAt,
          updatedAt: importedAt,
        });
        const records: PlaylistItemRecord[] = playlist.map(
          (item, position) => ({
            ...item,
            playlistId: DEFAULT_PLAYLIST_ID,
            position,
          }),
        );
        await database.playlistItems.bulkPut(records);
      }

      const settings = toSettingRecords(state, importedAt);
      if (settings.length > 0) await database.settings.bulkPut(settings);

      await database.meta.put({
        key: LEGACY_IMPORT_METADATA_KEY,
        value: true,
        updatedAt: importedAt,
      });
    },
  );
}
