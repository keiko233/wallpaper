import type {
  MmdPlaylistItem,
  PersistedPlayerState,
  PlayerPersistence,
} from "@wallpaper/player/types";
import { WallpaperClientDatabase } from "./database";
import {
  DEFAULT_PLAYLIST_ID,
  migrateLegacyPlayerState,
  type LegacyStorage,
  type PlayerResourceIds,
} from "./legacy-migration";
import type { SettingRecord } from "./models";

const PLAYER_SETTING_KEYS = [
  "background",
  "volume",
  "playbackRate",
  "renderSettings",
] as const;

export interface DexiePlayerPersistenceOptions {
  database?: WallpaperClientDatabase;
  resources: PlayerResourceIds;
  storage?: LegacyStorage;
}

function getDefaultStorage(): LegacyStorage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export class DexiePlayerPersistence implements PlayerPersistence {
  readonly database: WallpaperClientDatabase;
  private readonly resources: PlayerResourceIds;
  private readonly storage: LegacyStorage | undefined;
  private initialization: Promise<void> | undefined;

  constructor(options: DexiePlayerPersistenceOptions) {
    this.database = options.database ?? new WallpaperClientDatabase();
    this.resources = options.resources;
    this.storage = options.storage ?? getDefaultStorage();
  }

  private initialize(): Promise<void> {
    this.initialization ??= migrateLegacyPlayerState(
      this.database,
      this.resources,
      this.storage,
    );
    return this.initialization;
  }

  async load(): Promise<PersistedPlayerState> {
    await this.initialize();

    const [playlist, playlistItems, settings] = await Promise.all([
      this.database.playlists.get(DEFAULT_PLAYLIST_ID),
      this.database.playlistItems
        .where("playlistId")
        .equals(DEFAULT_PLAYLIST_ID)
        .sortBy("position"),
      this.database.settings.bulkGet([...PLAYER_SETTING_KEYS]),
    ]);

    const state: PersistedPlayerState = {};
    if (playlist !== undefined && playlistItems.length > 0) {
      state.playlist = playlistItems.map<MmdPlaylistItem>((item) => ({
        id: item.id,
        modelId: item.modelId,
        motionId: item.motionId,
        stageId: item.stageId,
        skyboxId: item.skyboxId ?? this.resources.skyboxes[0]!,
      }));
      const selectedIndex = playlistItems.findIndex(
        (item) => item.id === playlist.currentItemId,
      );
      state.playlistIndex = selectedIndex < 0 ? 0 : selectedIndex;
    }

    for (const setting of settings) {
      if (setting === undefined) continue;
      switch (setting.key) {
        case "background":
          if (typeof setting.value === "string") {
            state.background = setting.value;
          }
          break;
        case "volume":
          if (typeof setting.value === "number") state.volume = setting.value;
          break;
        case "playbackRate":
          if (typeof setting.value === "number") {
            state.playbackRate = setting.value;
          }
          break;
        case "renderSettings":
          if (typeof setting.value === "object" && setting.value !== null) {
            state.renderSettings =
              setting.value as PersistedPlayerState["renderSettings"];
          }
          break;
      }
    }

    return state;
  }

  async save(state: PersistedPlayerState): Promise<void> {
    await this.initialize();
    const updatedAt = new Date().toISOString();
    const playlist = state.playlist ?? [];
    const safeIndex =
      playlist.length === 0
        ? 0
        : Math.min(Math.max(state.playlistIndex ?? 0, 0), playlist.length - 1);

    await this.database.transaction(
      "rw",
      this.database.settings,
      this.database.playlists,
      this.database.playlistItems,
      async () => {
        const current = await this.database.playlists.get(
          DEFAULT_PLAYLIST_ID,
        );
        await this.database.playlists.put({
          id: DEFAULT_PLAYLIST_ID,
          name: current?.name ?? "Default",
          currentItemId:
            playlist.length === 0 ? null : playlist[safeIndex].id,
          createdAt: current?.createdAt ?? updatedAt,
          updatedAt,
        });
        await this.database.playlistItems
          .where("playlistId")
          .equals(DEFAULT_PLAYLIST_ID)
          .delete();
        if (playlist.length > 0) {
          await this.database.playlistItems.bulkPut(
            playlist.map((item, position) => ({
              ...item,
              playlistId: DEFAULT_PLAYLIST_ID,
              position,
            })),
          );
        }

        const settings: SettingRecord[] = (
          [
            ["background", state.background],
            ["volume", state.volume],
            ["playbackRate", state.playbackRate],
            ["renderSettings", state.renderSettings],
          ] as const
        ).flatMap(([key, value]) =>
          value === undefined ? [] : [{ key, value, updatedAt }],
        );
        if (settings.length > 0) {
          await this.database.settings.bulkPut(settings);
        }
      },
    );
  }
}

export function createPlayerPersistence(
  options: DexiePlayerPersistenceOptions,
): DexiePlayerPersistence {
  return new DexiePlayerPersistence(options);
}
