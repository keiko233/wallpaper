import Dexie from "dexie";
import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { describe, expect, it } from "vitest";
import {
  CLIENT_DB_V1_STORES,
  CLIENT_DB_V5_STORES,
  CLIENT_DB_V6_STORES,
  WallpaperCacheDatabase,
  WallpaperClientDatabase,
} from "../src/db/database";
import { pruneArtifactCache } from "../src/db/artifact-cache";
import {
  DEFAULT_PLAYLIST_ID,
  LEGACY_IMPORT_METADATA_KEY,
  migrateLegacyPlayerState,
  type LegacyStorage,
  type PlayerResourceIds,
} from "../src/db/legacy-migration";
import { DexiePlayerPersistence } from "../src/db/player-persistence";

const RESOURCES: PlayerResourceIds = {
  models: ["model-a", "model-b"],
  motions: ["motion-a", "motion-b"],
  stages: ["stage-a", "stage-b"],
  skyboxes: ["skybox-none", "skybox-a"],
};

function createDatabaseOptions() {
  return {
    indexedDB: new IDBFactory(),
    IDBKeyRange,
  };
}

class MapStorage implements LegacyStorage {
  private readonly values: Map<string, string>;

  constructor(values = new Map<string, string>()) {
    this.values = values;
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  set(key: string, value: unknown): void {
    this.values.set(key, JSON.stringify(value));
  }
}

describe("WallpaperClientDatabase", () => {
  it("migrates legacy v1 data to the current source-aware schema", async () => {
    const options = createDatabaseOptions();
    const oldDatabase = new Dexie("client-db-upgrade", options);
    oldDatabase.version(1).stores(CLIENT_DB_V1_STORES);
    await oldDatabase.table("libraryItems").put({
      resourceId: "remote-model",
      kind: "model",
      addedAt: "2026-07-30T00:00:00.000Z",
    });
    oldDatabase.close();

    const database = new WallpaperClientDatabase(
      "client-db-upgrade",
      options,
    );
    const libraryItem = await database.libraryItems.get("remote-model");

    expect(database.verno).toBe(8);
    expect(libraryItem).toBeUndefined();
    expect(database.artifactMetadata).toBeDefined();
    expect(database.resourceSources).toBeDefined();
    expect(database.sourceCatalogs).toBeDefined();
    expect(
      database.tables.some((table) => table.name === "credentials"),
    ).toBe(false);
    expect(
      database.tables.some((table) => table.name === "devices"),
    ).toBe(false);
    database.close();
  });

  it("adds source tables and preserves existing v5 settings", async () => {
    const options = createDatabaseOptions();
    const oldDatabase = new Dexie("client-db-v5-upgrade", options);
    oldDatabase.version(5).stores(CLIENT_DB_V5_STORES);
    await oldDatabase.table("settings").put({
      key: "theme",
      value: "dark",
      updatedAt: "2026-07-30T00:00:00.000Z",
    });
    oldDatabase.close();

    const database = new WallpaperClientDatabase(
      "client-db-v5-upgrade",
      options,
    );

    expect(database.verno).toBe(8);
    expect((await database.settings.get("theme"))?.value).toBe("dark");
    expect(await database.resourceSources.count()).toBe(0);
    expect(await database.sourceCatalogs.count()).toBe(0);
    database.close();
  });

  it("clears incompatible v6 installed data while preserving settings, sources, and catalogs", async () => {
    const options = createDatabaseOptions();
    const oldDatabase = new Dexie("client-db-v6-upgrade", options);
    oldDatabase.version(6).stores(CLIENT_DB_V6_STORES);
    await oldDatabase.table("settings").put({
      key: "theme",
      value: "light",
      updatedAt: "2026-07-30T00:00:00.000Z",
    });
    await oldDatabase.table("resources").put({
      id: "old-resource",
      kind: "model",
      name: "Old",
      description: null,
      categories: [],
      tags: [],
      publishedVersionId: "old@1.0.0",
      currentVersion: "1.0.0",
      coverUrl: null,
      catalogRevision: "old",
      updatedAt: "2026-07-30T00:00:00.000Z",
    });
    await oldDatabase.table("resourceVersions").put({
      id: "old@1.0.0",
      resourceId: "old-resource",
      artifactId: "old@1.0.0",
      format: "raw",
      fileName: "old.bin",
      contentType: "application/octet-stream",
      sha256: "f".repeat(64),
      byteSize: 4,
      entrypoints: {},
      publishedAt: "2026-07-30T00:00:00.000Z",
    });
    await oldDatabase.table("libraryItems").put({
      resourceId: "old-resource",
      resourceVersionId: "old@1.0.0",
      kind: "model",
      source: "remote",
      addedAt: "2026-07-30T00:00:00.000Z",
    });
    await oldDatabase.table("artifactMetadata").put({
      sha256: "f".repeat(64),
      resourceVersionId: "old@1.0.0",
      storage: "indexeddb",
      byteSize: 4,
      pinned: true,
      lastAccessedAt: "2026-07-30T00:00:00.000Z",
    });
    await oldDatabase.table("playlists").put({
      id: "playlist",
      name: "Old",
      currentItemId: "item",
      createdAt: "2026-07-30T00:00:00.000Z",
      updatedAt: "2026-07-30T00:00:00.000Z",
    });
    await oldDatabase.table("playlistItems").put({
      id: "item",
      playlistId: "playlist",
      position: 0,
      modelId: "remote:old-resource",
      motionId: "motion",
      stageId: "stage",
    });
    await oldDatabase.table("resourceSources").put({
      id: "source",
      baseUrl: "https://example.com/",
      catalogUrl: "https://example.com/catalog.json",
      name: "Example",
      description: null,
      homepage: null,
      enabled: true,
      isDefault: true,
      status: "ok",
      schemaVersion: 1,
      revision: "a".repeat(64),
      lastError: null,
      lastErrorAt: null,
      createdAt: "2026-07-30T00:00:00.000Z",
      updatedAt: "2026-07-30T00:00:00.000Z",
      lastAttemptedAt: null,
      lastSuccessfulAt: null,
    });
    await oldDatabase.table("sourceCatalogs").put({
      sourceId: "source",
      catalog: {
        schemaVersion: 1,
        revision: "a".repeat(64),
        resources: [],
      },
      revision: "a".repeat(64),
      refreshedAt: "2026-07-30T00:00:00.000Z",
    });
    oldDatabase.close();

    const database = new WallpaperClientDatabase(
      "client-db-v6-upgrade",
      options,
    );

    expect(database.verno).toBe(8);
    expect((await database.settings.get("theme"))?.value).toBe("light");
    expect((await database.resources.count())).toBe(0);
    expect((await database.resourceVersions.count())).toBe(0);
    expect((await database.libraryItems.count())).toBe(0);
    expect((await database.artifactMetadata.count())).toBe(0);
    expect((await database.playlists.count())).toBe(0);
    expect((await database.playlistItems.count())).toBe(0);
    expect((await database.resourceSources.count())).toBe(1);
    expect((await database.sourceCatalogs.count())).toBe(1);
    expect((await database.resourceSources.get("source"))?.name).toBe(
      "Example",
    );
    database.close();
  });

  it("imports legacy localStorage once using stable resource IDs", async () => {
    const database = new WallpaperClientDatabase(
      "legacy-import",
      createDatabaseOptions(),
    );
    const storage = new MapStorage();
    storage.set("mmd-playlist-v1", [
      {
        id: "same-id",
        modelIndex: 1,
        motionIndex: 0,
        stageIndex: 1,
      },
      {
        id: "same-id",
        modelIndex: 0,
        motionIndex: 1,
        stageIndex: 0,
      },
      { id: "invalid", modelIndex: 99, motionIndex: 0 },
    ]);
    storage.set("mmd-playlist-index-v1", 1);
    storage.set("mmd-background-v1", "#102030FF");
    storage.set("mmd-volume-v1", 0.65);

    await migrateLegacyPlayerState(
      database,
      RESOURCES,
      storage,
      new Date("2026-07-30T01:00:00.000Z"),
    );

    const playlist = await database.playlists.get(DEFAULT_PLAYLIST_ID);
    const items = await database.playlistItems
      .where("playlistId")
      .equals(DEFAULT_PLAYLIST_ID)
      .sortBy("position");
    expect(items).toMatchObject([
      {
        id: "same-id",
        modelId: "model-b",
        motionId: "motion-a",
        stageId: "stage-b",
        skyboxId: "skybox-none",
      },
      {
        id: "same-id-1",
        modelId: "model-a",
        motionId: "motion-b",
        stageId: "stage-a",
        skyboxId: "skybox-none",
      },
    ]);
    expect(items.every((item) => !("audioId" in item))).toBe(true);
    expect(playlist?.currentItemId).toBe("same-id-1");
    expect((await database.settings.get("volume"))?.value).toBe(0.65);
    expect(
      await database.meta.get(LEGACY_IMPORT_METADATA_KEY),
    ).toBeDefined();

    storage.set("mmd-volume-v1", 0.1);
    await migrateLegacyPlayerState(database, RESOURCES, storage);
    expect((await database.settings.get("volume"))?.value).toBe(0.65);
    database.close();
  });

  it("round-trips player state", async () => {
    const database = new WallpaperClientDatabase(
      "player-persistence",
      createDatabaseOptions(),
    );
    const persistence = new DexiePlayerPersistence({
      database,
      resources: RESOURCES,
      storage: new MapStorage(),
    });
    await persistence.save({
      playlist: [
        {
          id: "playlist-item",
          modelId: "model-a",
          motionId: "motion-b",
          stageId: "stage-a",
          skyboxId: "skybox-a",
        },
      ],
      playlistIndex: 0,
      background: "#112233FF",
      volume: 0.4,
      playbackRate: 1.25,
    });
    const restored = await persistence.load();

    expect(restored).toMatchObject({
      playlist: [
        {
          id: "playlist-item",
          modelId: "model-a",
          motionId: "motion-b",
          stageId: "stage-a",
          skyboxId: "skybox-a",
        },
      ],
      playlistIndex: 0,
      background: "#112233FF",
      volume: 0.4,
      playbackRate: 1.25,
    });
    database.close();
  });
});

describe("WallpaperCacheDatabase", () => {
  it("evicts only unpinned artifacts in least-recently-used order", async () => {
    const options = createDatabaseOptions();
    const database = new WallpaperClientDatabase(
      "artifact-prune-main",
      options,
    );
    const cache = new WallpaperCacheDatabase(
      "artifact-prune-cache",
      options,
    );
    await database.artifactMetadata.bulkPut([
      {
        sha256: "pinned",
        resourceVersionId: "version-pinned",
        storage: "indexeddb",
        byteSize: 4,
        pinned: true,
        lastAccessedAt: "2026-07-30T00:00:00.000Z",
      },
      {
        sha256: "old",
        resourceVersionId: "version-old",
        storage: "indexeddb",
        byteSize: 4,
        pinned: false,
        lastAccessedAt: "2026-07-30T01:00:00.000Z",
      },
    ]);
    await cache.artifactBlobs.bulkPut([
      {
        sha256: "pinned",
        byteSize: 4,
        lastAccessedAt: "2026-07-30T00:00:00.000Z",
        blob: new Blob(["data"]),
      },
      {
        sha256: "old",
        byteSize: 4,
        lastAccessedAt: "2026-07-30T01:00:00.000Z",
        blob: new Blob(["data"]),
      },
    ]);

    await expect(
      pruneArtifactCache(database, cache, 4),
    ).resolves.toEqual({
      evictedSha256: ["old"],
      remainingBytes: 4,
    });
    expect(await cache.artifactBlobs.get("pinned")).toBeDefined();
    expect(await cache.artifactBlobs.get("old")).toBeUndefined();
    expect(await database.artifactMetadata.get("old")).toBeUndefined();
    database.close();
    cache.close();
  });

  it("keeps artifact files while removing the obsolete query store", async () => {
    const database = new WallpaperCacheDatabase(
      "artifact-files",
      createDatabaseOptions(),
    );
    await database.artifactFiles.put({
      sha256: "sha",
      path: "model/model.pmx",
      contentType: "application/octet-stream",
      byteSize: 4,
      lastAccessedAt: "2026-07-30T00:00:00.000Z",
      blob: new Blob(["data"]),
    });
    expect(database.verno).toBe(4);
    expect(
      await database.artifactFiles.get(["sha", "model/model.pmx"]),
    ).toMatchObject({ byteSize: 4 });
    expect(
      database.tables.some((table) => table.name === "queries"),
    ).toBe(false);
    database.close();
  });
});
