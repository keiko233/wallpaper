import type { ResourceCatalog } from "@wallpaper/resource-schema";
import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { describe, expect, it } from "vitest";
import { WallpaperClientDatabase } from "../src/db/database";
import {
  DEFAULT_SOURCE_SEEDED_KEY,
  type ResourceSourceServiceOptions,
  deriveSourceDisplayName,
  deriveSourceId,
  ResourceSourceService,
} from "../src/resources/resource-sources";

function createDatabaseOptions() {
  return {
    indexedDB: new IDBFactory(),
    IDBKeyRange,
  };
}

function createService(
  database: WallpaperClientDatabase,
  options: ResourceSourceServiceOptions = {},
) {
  return new ResourceSourceService(database, options);
}

const emptyV1Catalog: ResourceCatalog = {
  schemaVersion: 1,
  revision: "a".repeat(64),
  resources: [],
};

const emptyV2Catalog: ResourceCatalog = {
  schemaVersion: 2,
  repository: {
    name: "Test Repository",
    description: "A test repository.",
    homepage: "https://example.com",
  },
  revision: "b".repeat(64),
  resources: [],
};

describe("deriveSourceId", () => {
  it("returns a stable SHA-256 hex id for the same catalog URL", async () => {
    const id1 = await deriveSourceId(
      "https://example.com/catalog.json",
    );
    const id2 = await deriveSourceId(
      "https://example.com/catalog.json",
    );
    expect(id1).toBe(id2);
    expect(id1).toMatch(/^[a-f0-9]{64}$/u);
  });

  it("uses the canonical catalog URL as the source identity", async () => {
    const rootId = await deriveSourceId("https://example.com");
    const catalogId = await deriveSourceId(
      "https://example.com/catalog.json",
    );
    expect(rootId).toBe(catalogId);
  });

  it("returns different ids for different catalog URLs", async () => {
    const id1 = await deriveSourceId(
      "https://example.com/catalog.json",
    );
    const id2 = await deriveSourceId(
      "https://other.example.com/catalog.json",
    );
    expect(id1).not.toBe(id2);
  });
});

describe("deriveSourceDisplayName", () => {
  it("uses the hostname for a root catalog URL", () => {
    expect(
      deriveSourceDisplayName("https://example.com/catalog.json"),
    ).toBe("example.com");
  });

  it("includes the path for a subpath catalog URL", () => {
    expect(
      deriveSourceDisplayName(
        "https://example.com/foo/bar/catalog.json",
      ),
    ).toBe("example.com/foo/bar");
  });

  it("keeps the port in a local source display name", () => {
    expect(
      deriveSourceDisplayName(
        "http://localhost:4173/repo/catalog.json",
      ),
    ).toBe("localhost:4173/repo");
  });
});

describe("ResourceSourceService", () => {
  it("creates v8 source tables", async () => {
    const database = new WallpaperClientDatabase(
      "source-tables",
      createDatabaseOptions(),
    );
    expect(database.verno).toBe(8);
    expect(database.resourceSources).toBeDefined();
    expect(database.sourceCatalogs).toBeDefined();
    database.close();
  });

  it("lists sources by name", async () => {
    const database = new WallpaperClientDatabase(
      "source-list",
      createDatabaseOptions(),
    );
    const service = createService(database);
    await service.add("https://z.example.com");
    await service.add("https://a.example.com");
    const sources = await service.list();
    expect(sources.map((source) => source.name)).toEqual([
      "a.example.com",
      "z.example.com",
    ]);
    database.close();
  });

  it("adds and deduplicates sources by normalized catalog URL", async () => {
    const database = new WallpaperClientDatabase(
      "source-dedup",
      createDatabaseOptions(),
    );
    const service = createService(database);

    const { source: first, isNew: firstIsNew } =
      await service.add("https://example.com");
    expect(firstIsNew).toBe(true);
    expect(first.catalogUrl).toBe("https://example.com/catalog.json");
    expect(first.baseUrl).toBe("https://example.com/");
    expect(first.status).toBe("idle");
    expect(first.schemaVersion).toBeNull();

    const { source: second, isNew: secondIsNew } =
      await service.add("https://example.com/catalog.json");
    expect(secondIsNew).toBe(false);
    expect(second.id).toBe(first.id);

    const sources = await service.list();
    expect(sources).toHaveLength(1);
    database.close();
  });

  it("seeds the configured default source exactly once", async () => {
    const database = new WallpaperClientDatabase(
      "source-seed",
      createDatabaseOptions(),
    );
    const service = createService(database, {
      defaultSourceUrl: "https://default.example.com/repo",
    });

    const first = await service.seedDefault();
    expect(first).toBeDefined();
    expect(first?.isDefault).toBe(true);
    expect(first?.catalogUrl).toBe(
      "https://default.example.com/repo/catalog.json",
    );
    expect(
      (await database.meta.get(DEFAULT_SOURCE_SEEDED_KEY))?.value,
    ).toBe(true);

    const second = await service.seedDefault();
    expect(second).toBeNull();

    await service.remove(first!.id);
    expect(await service.list()).toHaveLength(0);

    const third = await service.seedDefault();
    expect(third).toBeNull();
    database.close();
  });

  it("marks an existing source as default instead of creating a duplicate", async () => {
    const database = new WallpaperClientDatabase(
      "source-seed-existing",
      createDatabaseOptions(),
    );
    const service = createService(database, {
      defaultSourceUrl: "https://default.example.com/repo",
    });
    const { source: added } = await service.add(
      "https://default.example.com/repo",
    );
    expect(added.isDefault).toBe(false);

    const seeded = await service.seedDefault();
    expect(seeded?.id).toBe(added.id);
    expect(seeded?.isDefault).toBe(true);

    const sources = await service.list();
    expect(sources).toHaveLength(1);
    database.close();
  });

  it("serializes concurrent attempts to seed the default source", async () => {
    const database = new WallpaperClientDatabase(
      "source-seed-concurrent",
      createDatabaseOptions(),
    );
    const service = createService(database, {
      defaultSourceUrl: "https://default.example.com/repo",
    });

    const results = await Promise.all([
      service.seedDefault(),
      service.seedDefault(),
    ]);

    expect(results.filter((result) => result !== null)).toHaveLength(1);
    expect(await service.list()).toHaveLength(1);
    database.close();
  });

  it("enables and disables sources", async () => {
    const database = new WallpaperClientDatabase(
      "source-enable",
      createDatabaseOptions(),
    );
    const service = createService(database);
    const { source: added } = await service.add("https://example.com");
    expect(added.enabled).toBe(true);

    await service.disable(added.id);
    let updated = await database.resourceSources.get(added.id);
    expect(updated?.enabled).toBe(false);

    await service.enable(added.id);
    updated = await database.resourceSources.get(added.id);
    expect(updated?.enabled).toBe(true);
    database.close();
  });

  it("removes a source and its cached catalog", async () => {
    const database = new WallpaperClientDatabase(
      "source-remove",
      createDatabaseOptions(),
    );
    const service = createService(database);
    const { source: added } = await service.add("https://example.com");
    await database.sourceCatalogs.put({
      sourceId: added.id,
      catalog: emptyV1Catalog,
      revision: emptyV1Catalog.revision,
      refreshedAt: new Date().toISOString(),
    });

    await service.remove(added.id);
    expect(await database.resourceSources.get(added.id)).toBeUndefined();
    expect(
      await database.sourceCatalogs.get(added.id),
    ).toBeUndefined();
    database.close();
  });

  it("refreshes a v2 source and stores the catalog and metadata", async () => {
    const database = new WallpaperClientDatabase(
      "source-refresh-v2",
      createDatabaseOptions(),
    );
    const fetcher = () =>
      Promise.resolve(
        new Response(JSON.stringify(emptyV2Catalog), {
          headers: { "content-type": "application/json" },
        }),
      );
    const service = createService(database, { fetcher });
    const { source: added } = await service.add("https://example.com");

    const result = await service.refresh(added.id);
    expect(result.stale).toBe(false);
    expect(result.catalog.revision).toBe(emptyV2Catalog.revision);

    const updated = await database.resourceSources.get(added.id);
    expect(updated?.status).toBe("ok");
    expect(updated?.name).toBe("Test Repository");
    expect(updated?.description).toBe("A test repository.");
    expect(updated?.homepage).toBe("https://example.com");
    expect(updated?.schemaVersion).toBe(2);
    expect(updated?.revision).toBe(emptyV2Catalog.revision);
    expect(updated?.lastAttemptedAt).toBeDefined();
    expect(updated?.lastSuccessfulAt).toBeDefined();
    expect(updated?.lastErrorAt).toBeNull();

    const cached = await database.sourceCatalogs.get(added.id);
    expect(cached?.catalog.revision).toBe(emptyV2Catalog.revision);
    database.close();
  });

  it("uses browser HTTP caching without sending credentials", async () => {
    const database = new WallpaperClientDatabase(
      "source-fetch-options",
      createDatabaseOptions(),
    );
    let receivedUrl: RequestInfo | URL | undefined;
    let receivedInit: RequestInit | undefined;
    const fetcher = (input: RequestInfo | URL, init?: RequestInit) => {
      receivedUrl = input;
      receivedInit = init;
      return Promise.resolve(
        new Response(JSON.stringify(emptyV1Catalog)),
      );
    };
    const service = createService(database, { fetcher });
    const { source } = await service.add("https://example.com/repo");

    await service.refresh(source.id);

    expect(receivedUrl?.toString()).toBe(
      "https://example.com/repo/catalog.json",
    );
    expect(receivedInit).toMatchObject({
      cache: "default",
      credentials: "omit",
    });
    database.close();
  });

  it("refreshes a v1 source with a deterministic display name", async () => {
    const database = new WallpaperClientDatabase(
      "source-refresh-v1",
      createDatabaseOptions(),
    );
    const fetcher = () =>
      Promise.resolve(
        new Response(JSON.stringify(emptyV1Catalog), {
          headers: { "content-type": "application/json" },
        }),
      );
    const service = createService(database, { fetcher });
    const { source: added } = await service.add(
      "https://example.com/foo",
    );

    await service.refresh(added.id);
    const updated = await database.resourceSources.get(added.id);
    expect(updated?.name).toBe("example.com/foo");
    expect(updated?.schemaVersion).toBe(1);
    database.close();
  });

  it("falls back to a cached catalog when refresh fails and marks stale", async () => {
    const database = new WallpaperClientDatabase(
      "source-fallback",
      createDatabaseOptions(),
    );
    const fetcher = () =>
      Promise.reject(new Error("Network unavailable"));
    const service = createService(database, { fetcher });
    const { source: added } = await service.add("https://example.com");
    await database.sourceCatalogs.put({
      sourceId: added.id,
      catalog: emptyV1Catalog,
      revision: emptyV1Catalog.revision,
      refreshedAt: new Date().toISOString(),
    });

    const result = await service.refresh(added.id);
    expect(result.stale).toBe(true);
    expect(result.catalog.revision).toBe(emptyV1Catalog.revision);

    const updated = await database.resourceSources.get(added.id);
    expect(updated?.status).toBe("stale");
    expect(updated?.lastError).toBe("Network unavailable");
    expect(updated?.lastAttemptedAt).toBeDefined();
    expect(updated?.lastSuccessfulAt).toBeNull();
    expect(updated?.lastErrorAt).toBeDefined();
    database.close();
  });

  it("marks a source as error and throws when refresh fails with no cache", async () => {
    const database = new WallpaperClientDatabase(
      "source-error",
      createDatabaseOptions(),
    );
    const fetcher = () =>
      Promise.reject(new Error("Network unavailable"));
    const service = createService(database, { fetcher });
    const { source: added } = await service.add("https://example.com");

    await expect(service.refresh(added.id)).rejects.toThrow(
      "Network unavailable",
    );
    const updated = await database.resourceSources.get(added.id);
    expect(updated?.status).toBe("error");
    expect(updated?.lastError).toBe("Network unavailable");
    expect(updated?.lastAttemptedAt).toBeDefined();
    expect(updated?.lastSuccessfulAt).toBeNull();
    expect(updated?.lastErrorAt).toBeDefined();
    database.close();
  });

  it("refreshes all enabled sources concurrently with mixed results", async () => {
    const database = new WallpaperClientDatabase(
      "source-refresh-all",
      createDatabaseOptions(),
    );
    const fetcher = (
      input: RequestInfo | URL,
    ) => {
      const url = input.toString();
      if (url.includes("good")) {
        return Promise.resolve(
          new Response(JSON.stringify(emptyV1Catalog)),
        );
      }
      return Promise.reject(new Error("bad source"));
    };
    const service = createService(database, { fetcher });
    const { source: good } = await service.add(
      "https://good.example.com",
    );
    const { source: bad } = await service.add(
      "https://bad.example.com",
    );
    const { source: disabled } = await service.add(
      "https://disabled.example.com",
    );
    await service.disable(disabled.id);

    const results = await service.refreshAll();
    expect(results.size).toBe(2);

    const goodResult = results.get(good.id);
    expect(goodResult).not.toBeInstanceOf(Error);
    expect(
      !(goodResult instanceof Error) && goodResult?.stale,
    ).toBe(false);

    const badResult = results.get(bad.id);
    expect(badResult).toBeInstanceOf(Error);

    const goodSource = await database.resourceSources.get(good.id);
    expect(goodSource?.status).toBe("ok");
    const badSource = await database.resourceSources.get(bad.id);
    expect(badSource?.status).toBe("error");
    database.close();
  });
});
