import {
  BlobWriter,
  TextReader,
  ZipWriter,
  configure,
} from "@zip.js/zip.js";
import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { describe, expect, it } from "vitest";
import type { CatalogResource } from "@wallpaper/resource-schema";
import { createSHA256 } from "hash-wasm";
import {
  WallpaperCacheDatabase,
  WallpaperClientDatabase,
} from "../src/db";
import {
  ResourceClient,
  aggregateSearchResults,
  extractArtifactFiles,
  makeLocalResourceId,
  makeLocalVersionId,
  normalizeArtifactPath,
  toResourceSummary,
} from "../src/resources/resource-client";
import { ResourceSourceService } from "../src/resources/resource-sources";

configure({ useWebWorkers: false });

function createDatabaseOptions() {
  return {
    indexedDB: new IDBFactory(),
    IDBKeyRange,
  };
}

function createSourceService(
  database: WallpaperClientDatabase,
  fetcher?: typeof fetch,
  defaultSourceUrl?: string | null,
) {
  return new ResourceSourceService(database, {
    fetcher,
    defaultSourceUrl,
  });
}

function createClient(
  database: WallpaperClientDatabase,
  cache: WallpaperCacheDatabase,
  sourceService: ResourceSourceService,
  fetcher?: typeof fetch,
) {
  return new ResourceClient(database, cache, sourceService, fetcher);
}

async function sha256Hex(blob: Blob): Promise<string> {
  const hash = await createSHA256();
  hash.init();
  const reader = blob.stream().getReader();
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    hash.update(chunk.value);
  }
  return hash.digest("hex");
}

function makeResource(
  id: string,
  version: string,
  kind: CatalogResource["kind"],
  name: string,
  sha256: string,
  byteSize: number,
  dependencies: CatalogResource["dependencies"] = [],
): CatalogResource {
  return {
    id,
    version,
    kind,
    name,
    description: null,
    authors: [],
    license: null,
    categories: [],
    tags: [],
    compatibility: { platforms: ["web"], features: [] },
    visibility: "public",
    dependencies,
    cover: null,
    artifact: {
      path: `objects/${id}.bin`,
      fileName: `${id}.bin`,
      format: "raw",
      contentType: "application/octet-stream",
      byteSize,
      sha256,
      entrypoints: {},
    },
  };
}

describe("client artifact extraction", () => {
  it("rejects absolute and parent-relative archive paths", () => {
    expect(() => normalizeArtifactPath("../model.pmx")).toThrow(
      "Unsafe artifact path",
    );
    expect(() => normalizeArtifactPath("/model.pmx")).toThrow(
      "Unsafe artifact path",
    );
    expect(() => normalizeArtifactPath("C:\\model.pmx")).toThrow(
      "Unsafe artifact path",
    );
  });

  it("extracts ZIP files with stable normalized paths", async () => {
    const writer = new ZipWriter(new BlobWriter("application/zip"));
    await writer.add("model/model.pmx", new TextReader("model"));
    await writer.add("model/texture.png", new TextReader("texture"));
    const archive = await writer.close();

    const files = await extractArtifactFiles(
      "zip",
      "model.zip",
      "sha",
      archive,
      "2026-07-30T00:00:00.000Z",
    );

    expect(files.map((file) => file.path)).toEqual([
      "model/model.pmx",
      "model/texture.png",
    ]);
    expect(files[1].contentType).toBe("image/png");
  });
});

describe("aggregate search", () => {
  const baseSource = {
    id: "source-1",
    baseUrl: "https://a.example.com/",
    catalogUrl: "https://a.example.com/catalog.json",
    name: "Source A",
    description: null,
    homepage: null,
    enabled: true,
    isDefault: true,
    status: "ok" as const,
    schemaVersion: 1 as const,
    revision: "rev-a",
    lastError: null,
    lastErrorAt: null,
    createdAt: "2026-07-30T00:00:00.000Z",
    updatedAt: "2026-07-30T00:00:00.000Z",
    lastAttemptedAt: null,
    lastSuccessfulAt: null,
  };

  const otherSource = {
    ...baseSource,
    id: "source-2",
    baseUrl: "https://b.example.com/",
    catalogUrl: "https://b.example.com/catalog.json",
    name: "Source B",
    isDefault: false,
  };

  const resource: CatalogResource = {
    id: "shared-id",
    version: "1.0.0",
    kind: "model",
    name: "Shared Model",
    description: null,
    authors: [],
    license: null,
    categories: ["character"],
    tags: ["miku"],
    compatibility: { platforms: ["web"], features: [] },
    visibility: "public",
    dependencies: [],
    cover: null,
    artifact: {
      path: "objects/shared-id.bin",
      fileName: "shared-id.bin",
      format: "raw",
      contentType: "application/octet-stream",
      byteSize: 4,
      sha256: "a".repeat(64),
      entrypoints: {},
    },
  };

  it("keeps identical upstream id/version from different sources independent", () => {
    const result = aggregateSearchResults(
      [
        { source: baseSource, catalog: { revision: "r1", resources: [resource] }, stale: false },
        { source: otherSource, catalog: { revision: "r2", resources: [resource] }, stale: false },
      ],
      {},
    );

    expect(result.items).toHaveLength(2);
    const [first, second] = result.items;
    expect(first.sourceId).toBe("source-1");
    expect(second.sourceId).toBe("source-2");
    expect(first.localResourceId).toBe(
      makeLocalResourceId("source-1", "shared-id"),
    );
    expect(second.localResourceId).toBe(
      makeLocalResourceId("source-2", "shared-id"),
    );
    expect(first.localVersionId).toBe(
      makeLocalVersionId("source-1", "shared-id", "1.0.0"),
    );
    expect(second.localVersionId).toBe(
      makeLocalVersionId("source-2", "shared-id", "1.0.0"),
    );
    expect(first.localResourceId).not.toBe(second.localResourceId);
    expect(first.artifactUrl).toBe(
      "https://a.example.com/objects/shared-id.bin",
    );
    expect(second.artifactUrl).toBe(
      "https://b.example.com/objects/shared-id.bin",
    );
  });

  it("includes source name and catalog URL in search text", () => {
    const result = aggregateSearchResults(
      [
        { source: baseSource, catalog: { revision: "r1", resources: [resource] }, stale: false },
        { source: otherSource, catalog: { revision: "r2", resources: [resource] }, stale: false },
      ],
      { query: "Source B" },
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0].sourceName).toBe("Source B");
  });

  it("paginates the deterministic aggregate with numeric cursors", () => {
    const first = aggregateSearchResults(
      [
        { source: baseSource, catalog: { revision: "r1", resources: [resource] }, stale: false },
        { source: otherSource, catalog: { revision: "r2", resources: [resource] }, stale: false },
      ],
      { limit: 1 },
    );
    expect(first.items).toHaveLength(1);
    expect(first.nextCursor).toBe("1");

    const second = aggregateSearchResults(
      [
        { source: baseSource, catalog: { revision: "r1", resources: [resource] }, stale: false },
        { source: otherSource, catalog: { revision: "r2", resources: [resource] }, stale: false },
      ],
      { limit: 1, cursor: first.nextCursor! },
    );
    expect(second.items).toHaveLength(1);
    expect(second.nextCursor).toBeNull();
    expect(second.items[0].sourceId).not.toBe(first.items[0].sourceId);
  });
});

describe("ResourceClient multi-source search", () => {
  it("returns an empty catalog when no source is configured", async () => {
    const options = createDatabaseOptions();
    const database = new WallpaperClientDatabase(
      "no-source-client",
      options,
    );
    const cache = new WallpaperCacheDatabase(
      "no-source-cache",
      options,
    );
    const service = createSourceService(database, undefined, null);
    const client = createClient(database, cache, service);

    await expect(client.search({})).resolves.toEqual({
      items: [],
      nextCursor: null,
      catalogRevision: "",
      sources: [],
    });

    database.close();
    cache.close();
  });

  it("falls back to the last valid catalog when refresh fails", async () => {
    const options = createDatabaseOptions();
    const database = new WallpaperClientDatabase(
      "static-catalog-client",
      options,
    );
    const cache = new WallpaperCacheDatabase(
      "static-catalog-cache",
      options,
    );
    const catalog = {
      schemaVersion: 1 as const,
      revision: "a".repeat(64),
      resources: [
        {
          id: "model-a",
          version: "1.0.0",
          kind: "model" as const,
          name: "Model A",
          description: null,
          authors: [],
          license: null,
          categories: ["character"],
          tags: ["miku"],
          compatibility: { platforms: ["web"], features: [] },
          visibility: "public" as const,
          dependencies: [],
          cover: null,
          artifact: {
            path: "objects/model-a.zip",
            fileName: "model-a.zip",
            format: "zip" as const,
            contentType: "application/zip",
            byteSize: 10,
            sha256: "b".repeat(64),
            entrypoints: { model: "model.pmx" },
          },
        },
      ],
    };
    let online = true;
    const fetcher = (() =>
      online
        ? Promise.resolve(
            new Response(JSON.stringify(catalog), {
              headers: { "content-type": "application/json" },
            }),
          )
        : Promise.reject(new Error("offline"))) as typeof fetch;

    const onlineService = createSourceService(
      database,
      fetcher,
      "https://assets.example.com/",
    );
    const onlineClient = createClient(database, cache, onlineService, fetcher);
    await expect(onlineClient.search({})).resolves.toMatchObject({
      items: [{ id: "model-a" }],
    });

    online = false;
    const offlineService = createSourceService(
      database,
      fetcher,
      "https://assets.example.com/",
    );
    const offlineClient = createClient(
      database,
      cache,
      offlineService,
      fetcher,
    );
    const offlineResult = await offlineClient.search({});
    expect(offlineResult.items).toMatchObject([{ id: "model-a" }]);
    expect(offlineResult.sources[0]?.status).toBe("stale");
    expect(offlineResult.sources[0]?.error).toBe("offline");
    database.close();
    cache.close();
  });

  it("keeps the browser fetch receiver when using the default fetcher", async () => {
    const originalFetch = globalThis.fetch;
    const options = createDatabaseOptions();
    const database = new WallpaperClientDatabase(
      "bound-fetch-client",
      options,
    );
    const cache = new WallpaperCacheDatabase(
      "bound-fetch-cache",
      options,
    );
    const catalog = {
      schemaVersion: 1 as const,
      revision: "c".repeat(64),
      resources: [],
    };
    globalThis.fetch = function (this: unknown) {
      if (this !== globalThis) {
        throw new TypeError("Illegal invocation");
      }
      return Promise.resolve(
        new Response(JSON.stringify(catalog), {
          headers: { "content-type": "application/json" },
        }),
      );
    } as typeof fetch;

    try {
      const service = createSourceService(
        database,
        undefined,
        "https://assets.example.com/",
      );
      const client = createClient(database, cache, service);
      await expect(client.search({})).resolves.toMatchObject({
        items: [],
      });
    } finally {
      globalThis.fetch = originalFetch;
      database.close();
      cache.close();
    }
  });

  it("does not hide successful or cached sources when another source fails", async () => {
    const options = createDatabaseOptions();
    const database = new WallpaperClientDatabase(
      "mixed-source-client",
      options,
    );
    const cache = new WallpaperCacheDatabase(
      "mixed-source-cache",
      options,
    );
    const goodCatalog = {
      schemaVersion: 1 as const,
      revision: "d".repeat(64),
      resources: [
        {
          id: "model-a",
          version: "1.0.0",
          kind: "model" as const,
          name: "Model A",
          description: null,
          authors: [],
          license: null,
          categories: [],
          tags: [],
          compatibility: { platforms: ["web"], features: [] },
          visibility: "public" as const,
          dependencies: [],
          cover: null,
          artifact: {
            path: "objects/model-a.bin",
            fileName: "model-a.bin",
            format: "raw" as const,
            contentType: "application/octet-stream",
            byteSize: 4,
            sha256: "e".repeat(64),
            entrypoints: {},
          },
        },
      ],
    };
    const fetcher = ((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes("good")) {
        return Promise.resolve(
          new Response(JSON.stringify(goodCatalog), {
            headers: { "content-type": "application/json" },
          }),
        );
      }
      return Promise.reject(new Error("bad source"));
    }) as typeof fetch;

    const service = createSourceService(database, fetcher, null);
    const { source: good } = await service.add("https://good.example.com");
    const { source: bad } = await service.add("https://bad.example.com");
    await service.disable(good.id);

    // Pre-seed bad source catalog so it can fall back.
    await database.sourceCatalogs.put({
      sourceId: bad.id,
      catalog: {
        schemaVersion: 1,
        revision: "f".repeat(64),
        resources: [],
      },
      revision: "f".repeat(64),
      refreshedAt: new Date().toISOString(),
    });

    await service.enable(good.id);
    const client = createClient(database, cache, service, fetcher);
    const result = await client.search({});

    const goodSource = result.sources.find(
      (source) => source.sourceId === good.id,
    );
    const badSource = result.sources.find(
      (source) => source.sourceId === bad.id,
    );
    expect(goodSource?.status).toBe("ok");
    expect(badSource?.status).toBe("stale");
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe("model-a");
    database.close();
    cache.close();
  });
});

describe("ResourceClient install and source removal", () => {
  async function installFromSource(
    database: WallpaperClientDatabase,
    cache: WallpaperCacheDatabase,
    catalogUrl: string,
    resource: CatalogResource,
    fetcher: typeof fetch,
  ) {
    const service = createSourceService(database, fetcher, null);
    const { source } = await service.add(catalogUrl);
    const catalog = {
      schemaVersion: 1 as const,
      revision: "a".repeat(64),
      resources: [resource],
    };
    await database.sourceCatalogs.put({
      sourceId: source.id,
      catalog,
      revision: catalog.revision,
      refreshedAt: new Date().toISOString(),
    });
    await database.resourceSources.update(source.id, {
      status: "ok",
      revision: catalog.revision,
    });

    const client = createClient(database, cache, service, fetcher);
    const result = await client.search({});
    const summary = result.items.find(
      (item) => item.sourceId === source.id,
    );
    if (summary === undefined) {
      throw new Error("Resource summary not found for source.");
    }
    await client.install(summary, () => undefined);
    return { source, summary, client };
  }

  it("installs the same upstream id/version from two sources independently", async () => {
    const options = createDatabaseOptions();
    const database = new WallpaperClientDatabase(
      "independent-installs",
      options,
    );
    const cache = new WallpaperCacheDatabase(
      "independent-installs-cache",
      options,
    );

    const blob = new Blob(["payload-a"]);
    const sha = await sha256Hex(blob);
    const resource = makeResource("shared", "1.0.0", "model", "Shared", sha, blob.size);

    const fetcher = ((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.endsWith(".bin")) {
        return Promise.resolve(new Response(blob));
      }
      return Promise.resolve(
        new Response(
          JSON.stringify({
            schemaVersion: 1,
            revision: "b".repeat(64),
            resources: [resource],
          }),
          { headers: { "content-type": "application/json" } },
        ),
      );
    }) as typeof fetch;

    const service = createSourceService(database, fetcher, null);
    const { source: sourceA } = await service.add(
      "https://a.example.com/",
    );
    const { source: sourceB } = await service.add(
      "https://b.example.com/",
    );

    const client = createClient(database, cache, service, fetcher);
    const result = await client.search({});
    expect(result.items).toHaveLength(2);

    const summaryA = result.items.find(
      (item) => item.sourceId === sourceA.id,
    )!;
    const summaryB = result.items.find(
      (item) => item.sourceId === sourceB.id,
    )!;

    await client.install(summaryA, () => undefined);
    await client.install(summaryB, () => undefined);

    expect(await client.isInstalled(summaryA)).toBe(true);
    expect(await client.isInstalled(summaryB)).toBe(true);

    const resources = await database.resources.toArray();
    expect(resources).toHaveLength(2);
    expect(resources.map((r) => r.id).sort()).toEqual(
      [summaryA.localResourceId, summaryB.localResourceId].sort(),
    );

    database.close();
    cache.close();
  });

  it("removes a source in keep-installed mode while retaining installed resources", async () => {
    const options = createDatabaseOptions();
    const database = new WallpaperClientDatabase(
      "keep-installed",
      options,
    );
    const cache = new WallpaperCacheDatabase(
      "keep-installed-cache",
      options,
    );

    const blob = new Blob(["payload-b"]);
    const sha = await sha256Hex(blob);
    const resource = makeResource("keep", "1.0.0", "model", "Keep", sha, blob.size);
    const catalogUrl = "https://keep.example.com/";
    const fetcher = ((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.endsWith(".bin")) return Promise.resolve(new Response(blob));
      return Promise.resolve(
        new Response(
          JSON.stringify({
            schemaVersion: 1,
            revision: "c".repeat(64),
            resources: [resource],
          }),
          { headers: { "content-type": "application/json" } },
        ),
      );
    }) as typeof fetch;

    const { source, summary, client } = await installFromSource(
      database,
      cache,
      catalogUrl,
      resource,
      fetcher,
    );

    await client.removeSource(source.id, "keep-installed");

    expect(await database.resourceSources.get(source.id)).toBeUndefined();
    expect(await database.sourceCatalogs.get(source.id)).toBeUndefined();
    expect(await database.resources.get(summary.localResourceId)).toMatchObject(
      { sourceId: source.id, sourceName: source.name },
    );
    expect(
      await database.resourceVersions.get(summary.localVersionId),
    ).toBeDefined();
    expect(
      await database.libraryItems.get(summary.localResourceId),
    ).toBeDefined();

    expect(await client.listInstalled()).toEqual([
      expect.objectContaining({
        localResourceId: summary.localResourceId,
        localVersionId: summary.localVersionId,
        name: "Keep",
        sourceAvailable: false,
        ready: true,
      }),
    ]);

    await database.playlists.put({
      id: "keep-playlist",
      name: "Keep",
      currentItemId: "keep-item",
      createdAt: "2026-07-31T00:00:00.000Z",
      updatedAt: "2026-07-31T00:00:00.000Z",
    });
    await database.playlistItems.put({
      id: "keep-item",
      playlistId: "keep-playlist",
      position: 0,
      modelId: `remote:${summary.localResourceId}`,
      motionId: "motion:built-in",
      stageId: "stage:built-in",
      skyboxId: "skybox:built-in",
    });

    await client.uninstall(summary.localResourceId);
    expect(await client.listInstalled()).toEqual([]);
    expect(
      await database.resources.get(summary.localResourceId),
    ).toBeUndefined();
    expect(
      await database.resourceVersions.get(summary.localVersionId),
    ).toBeUndefined();
    expect(await cache.artifactBlobs.get(sha)).toBeUndefined();
    expect(
      await cache.artifactFiles.where("sha256").equals(sha).count(),
    ).toBe(0);
    expect(await database.artifactMetadata.get(sha)).toBeUndefined();
    expect(await database.playlistItems.get("keep-item")).toBeUndefined();
    expect(
      (await database.playlists.get("keep-playlist"))?.currentItemId,
    ).toBeNull();

    database.close();
    cache.close();
  });

  it("removes a source in delete-installed mode, cleans playlists, and retains shared-SHA pins", async () => {
    const options = createDatabaseOptions();
    const database = new WallpaperClientDatabase(
      "delete-installed",
      options,
    );
    const cache = new WallpaperCacheDatabase(
      "delete-installed-cache",
      options,
    );

    const blob = new Blob(["shared-payload"]);
    const sha = await sha256Hex(blob);
    const resource = makeResource("shared", "1.0.0", "model", "Shared", sha, blob.size);
    const catalogUrl = "https://shared.example.com/";
    const fetcher = ((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.endsWith(".bin")) return Promise.resolve(new Response(blob));
      return Promise.resolve(
        new Response(
          JSON.stringify({
            schemaVersion: 1,
            revision: "d".repeat(64),
            resources: [resource],
          }),
          { headers: { "content-type": "application/json" } },
        ),
      );
    }) as typeof fetch;

    const { source, summary, client } = await installFromSource(
      database,
      cache,
      catalogUrl,
      resource,
      fetcher,
    );

    await database.playlists.put({
      id: "playlist",
      name: "Test",
      currentItemId: "item-1",
      createdAt: "2026-07-30T00:00:00.000Z",
      updatedAt: "2026-07-30T00:00:00.000Z",
    });
    await database.playlistItems.bulkPut([
      {
        id: "item-1",
        playlistId: "playlist",
        position: 0,
        modelId: `remote:${summary.localResourceId}`,
        motionId: "motion:built-in",
        stageId: "stage:built-in",
        skyboxId: "skybox:built-in",
      },
      {
        id: "item-2",
        playlistId: "playlist",
        position: 1,
        modelId: "model:built-in",
        motionId: "motion:built-in",
        stageId: "stage:built-in",
        skyboxId: "skybox:built-in",
      },
    ]);

    await client.removeSource(source.id, "delete-installed");

    expect(await database.resourceSources.get(source.id)).toBeUndefined();
    expect(await database.sourceCatalogs.get(source.id)).toBeUndefined();
    expect(await database.resources.get(summary.localResourceId)).toBeUndefined();
    expect(
      await database.resourceVersions.get(summary.localVersionId),
    ).toBeUndefined();
    expect(
      await database.libraryItems.get(summary.localResourceId),
    ).toBeUndefined();
    expect(await database.playlistItems.get("item-1")).toBeUndefined();
    expect(await database.playlistItems.get("item-2")).toBeDefined();
    const playlist = await database.playlists.get("playlist");
    expect(playlist?.currentItemId).toBe("item-2");
    expect(await cache.artifactBlobs.get(sha)).toBeUndefined();
    expect(await database.artifactMetadata.get(sha)).toBeUndefined();

    database.close();
    cache.close();
  });

  it("keeps an artifact pinned while another installed source references the same SHA", async () => {
    const options = createDatabaseOptions();
    const database = new WallpaperClientDatabase(
      "shared-sha-pin",
      options,
    );
    const cache = new WallpaperCacheDatabase(
      "shared-sha-pin-cache",
      options,
    );

    const blob = new Blob(["shared-payload"]);
    const sha = await sha256Hex(blob);
    const resource = makeResource("shared", "1.0.0", "model", "Shared", sha, blob.size);
    const fetcher = ((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.endsWith(".bin")) return Promise.resolve(new Response(blob));
      return Promise.resolve(
        new Response(
          JSON.stringify({
            schemaVersion: 1,
            revision: "e".repeat(64),
            resources: [resource],
          }),
          { headers: { "content-type": "application/json" } },
        ),
      );
    }) as typeof fetch;

    const { source: sourceA, client } = await installFromSource(
      database,
      cache,
      "https://a.example.com/",
      resource,
      fetcher,
    );
    const { source: sourceB, summary: summaryB } = await installFromSource(
      database,
      cache,
      "https://b.example.com/",
      resource,
      fetcher,
    );

    await client.removeSource(sourceA.id, "delete-installed");

    const metadata = await database.artifactMetadata.get(sha);
    expect(metadata?.pinned).toBe(true);
    expect(
      await database.resourceVersions.get(summaryB.localVersionId),
    ).toBeDefined();

    await client.removeSource(sourceB.id, "delete-installed");
    const after = await database.artifactMetadata.get(sha);
    expect(after).toBeUndefined();
    expect(await cache.artifactBlobs.get(sha)).toBeUndefined();

    database.close();
    cache.close();
  });

  it("deletes an old artifact after the final shared install is removed", async () => {
    const options = createDatabaseOptions();
    const database = new WallpaperClientDatabase(
      "shared-sha-upgrade",
      options,
    );
    const cache = new WallpaperCacheDatabase(
      "shared-sha-upgrade-cache",
      options,
    );
    const oldBlob = new Blob(["old-shared"]);
    const newBlob = new Blob(["new-version"]);
    const oldSha = await sha256Hex(oldBlob);
    const newSha = await sha256Hex(newBlob);
    const oldResource = makeResource(
      "shared",
      "1.0.0",
      "model",
      "Shared",
      oldSha,
      oldBlob.size,
    );
    const newResource = {
      ...makeResource(
        "shared",
        "2.0.0",
        "model",
        "Shared",
        newSha,
        newBlob.size,
      ),
      artifact: {
        ...makeResource(
          "shared",
          "2.0.0",
          "model",
          "Shared",
          newSha,
          newBlob.size,
        ).artifact,
        path: "objects/shared-v2.bin",
      },
    };
    const fetcher = ((input: RequestInfo | URL) => {
      const url = input.toString();
      return Promise.resolve(
        new Response(url.endsWith("shared-v2.bin") ? newBlob : oldBlob),
      );
    }) as typeof fetch;
    const service = createSourceService(database, fetcher, null);
    const { source: sourceA } = await service.add(
      "https://a.example.com/",
    );
    const { source: sourceB } = await service.add(
      "https://b.example.com/",
    );
    const client = createClient(database, cache, service, fetcher);
    const revision = "a".repeat(64);

    const catalog = {
      schemaVersion: 1 as const,
      revision,
      resources: [oldResource, newResource],
    };
    await database.sourceCatalogs.put({
      sourceId: sourceA.id,
      catalog,
      revision,
      refreshedAt: new Date().toISOString(),
    });
    await database.sourceCatalogs.put({
      sourceId: sourceB.id,
      catalog,
      revision,
      refreshedAt: new Date().toISOString(),
    });

    await client.install(
      toResourceSummary(sourceA, { revision }, oldResource),
      () => undefined,
    );
    await client.install(
      toResourceSummary(sourceB, { revision }, oldResource),
      () => undefined,
    );
    await client.install(
      toResourceSummary(sourceA, { revision }, newResource),
      () => undefined,
    );

    expect((await database.artifactMetadata.get(oldSha))?.pinned).toBe(
      true,
    );
    await client.removeSource(sourceB.id, "delete-installed");
    expect(await database.artifactMetadata.get(oldSha)).toBeUndefined();
    expect(await cache.artifactBlobs.get(oldSha)).toBeUndefined();

    database.close();
    cache.close();
  });

  it("hides dependency-only resources from default search", async () => {
    const options = createDatabaseOptions();
    const database = new WallpaperClientDatabase(
      "hidden-dependencies",
      options,
    );
    const cache = new WallpaperCacheDatabase(
      "hidden-dependencies-cache",
      options,
    );
    const publicResource = makeResource(
      "public-motion",
      "1.0.0",
      "motion",
      "Public Motion",
      "a".repeat(64),
      4,
    );
    const dependencyResource = makeResource(
      "dep-audio",
      "1.0.0",
      "audio",
      "Dependency Audio",
      "b".repeat(64),
      4,
    );
    dependencyResource.visibility = "dependency-only";

    const fetcher = ((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.endsWith(".bin")) {
        return Promise.resolve(new Response(new Blob(["data"])));
      }
      return Promise.resolve(
        new Response(
          JSON.stringify({
            schemaVersion: 1,
            revision: "a".repeat(64),
            resources: [publicResource, dependencyResource],
          }),
          { headers: { "content-type": "application/json" } },
        ),
      );
    }) as typeof fetch;

    const service = createSourceService(database, fetcher, null);
    await service.add("https://hidden.example.com/");
    const client = createClient(database, cache, service, fetcher);
    const defaultSearch = await client.search({});
    expect(defaultSearch.items).toHaveLength(1);
    expect(defaultSearch.items[0].id).toBe("public-motion");

    const includeSearch = await client.search({ includeDependencies: true });
    expect(includeSearch.items).toHaveLength(2);
    expect(
      includeSearch.items.some((item) => item.id === "dep-audio"),
    ).toBe(true);

    database.close();
    cache.close();
  });

  it("removes only dependencies orphaned by an uninstall", async () => {
    const options = createDatabaseOptions();
    const database = new WallpaperClientDatabase(
      "recursive-install",
      options,
    );
    const cache = new WallpaperCacheDatabase(
      "recursive-install-cache",
      options,
    );

    const audioBlob = new Blob(["audio-payload"]);
    const cameraBlob = new Blob(["camera-payload"]);
    const motionBlob = new Blob(["motion-payload"]);
    const sharedMotionBlob = new Blob(["shared-motion-payload"]);
    const audioSha = await sha256Hex(audioBlob);
    const cameraSha = await sha256Hex(cameraBlob);
    const motionSha = await sha256Hex(motionBlob);
    const sharedMotionSha = await sha256Hex(sharedMotionBlob);

    const audioResource = makeResource(
      "rec-audio",
      "1.0.0",
      "audio",
      "Rec Audio",
      audioSha,
      audioBlob.size,
    );
    audioResource.visibility = "dependency-only";
    const cameraResource = makeResource(
      "rec-camera",
      "1.0.0",
      "camera",
      "Rec Camera",
      cameraSha,
      cameraBlob.size,
    );
    cameraResource.visibility = "dependency-only";
    const motionResource = makeResource(
      "rec-motion",
      "1.0.0",
      "motion",
      "Rec Motion",
      motionSha,
      motionBlob.size,
      [
        { id: "rec-audio", version: "1.0.0", binding: "audio" },
        { id: "rec-camera", version: "1.0.0", binding: "camera" },
      ],
    );
    const sharedMotionResource = makeResource(
      "rec-motion-shared",
      "1.0.0",
      "motion",
      "Rec Motion Shared",
      sharedMotionSha,
      sharedMotionBlob.size,
      [{ id: "rec-audio", version: "1.0.0", binding: "audio" }],
    );

    const blobs: Record<string, Blob> = {
      "objects/rec-audio.bin": audioBlob,
      "objects/rec-camera.bin": cameraBlob,
      "objects/rec-motion.bin": motionBlob,
      "objects/rec-motion-shared.bin": sharedMotionBlob,
    };

    const fetcher = ((input: RequestInfo | URL) => {
      const url = input.toString();
      const pathname = new URL(url).pathname.replace(/^\//u, "");
      const blob = blobs[pathname];
      if (blob !== undefined) return Promise.resolve(new Response(blob));
      return Promise.resolve(
        new Response(
          JSON.stringify({
            schemaVersion: 1,
            revision: "a".repeat(64),
            resources: [
              audioResource,
              cameraResource,
              motionResource,
              sharedMotionResource,
            ],
          }),
          { headers: { "content-type": "application/json" } },
        ),
      );
    }) as typeof fetch;

    const service = createSourceService(database, fetcher, null);
    await service.add("https://recursive.example.com/");
    const client = createClient(database, cache, service, fetcher);
    const result = await client.search({});
    const motionSummary = result.items.find(
      (item) => item.id === "rec-motion",
    );
    const sharedMotionSummary = result.items.find(
      (item) => item.id === "rec-motion-shared",
    );
    expect(motionSummary).toBeDefined();
    expect(sharedMotionSummary).toBeDefined();

    await client.install(motionSummary!, () => undefined);
    await client.install(sharedMotionSummary!, () => undefined);

    expect(await client.isInstalled(motionSummary!)).toBe(true);
    expect(await client.isInstalled(sharedMotionSummary!)).toBe(true);

    const installedVersions = await database.resourceVersions.toArray();
    expect(installedVersions).toHaveLength(4);
    const motionVersion = installedVersions.find(
      (version) => version.upstreamId === "rec-motion",
    );
    expect(motionVersion).toBeDefined();

    const dependencies = await database.resourceDependencies
      .where("parentVersionId")
      .equals(motionVersion!.id)
      .toArray();
    expect(dependencies).toHaveLength(2);
    expect(dependencies.map((dep) => dep.binding).sort()).toEqual([
      "audio",
      "camera",
    ]);

    const dependencyLibraryItems = await database.libraryItems
      .where("resourceVersionId")
      .anyOf(
        dependencies.map(
          (dependency) => dependency.dependencyVersionId,
        ),
      )
      .toArray();
    expect(dependencyLibraryItems).toHaveLength(2);

    await client.uninstall(motionSummary!.localResourceId);
    expect(
      (await database.resources.toArray())
        .map((resource) => resource.upstreamId)
        .sort(),
    ).toEqual(["rec-audio", "rec-motion-shared"]);
    expect(await cache.artifactBlobs.get(audioSha)).toBeDefined();
    expect(await cache.artifactBlobs.get(cameraSha)).toBeUndefined();
    expect(await cache.artifactBlobs.get(motionSha)).toBeUndefined();
    expect(await client.isInstalled(sharedMotionSummary!)).toBe(true);

    await client.uninstall(sharedMotionSummary!.localResourceId);
    expect(await database.libraryItems.count()).toBe(0);
    expect(await database.resources.count()).toBe(0);
    expect(await database.resourceVersions.count()).toBe(0);
    expect(await database.resourceDependencies.count()).toBe(0);
    expect(await database.artifactMetadata.count()).toBe(0);
    expect(await cache.artifactBlobs.count()).toBe(0);
    expect(await cache.artifactFiles.count()).toBe(0);

    database.close();
    cache.close();
  });

  it("reports a motion as not installed when a dependency is missing", async () => {
    const options = createDatabaseOptions();
    const database = new WallpaperClientDatabase(
      "missing-dependency",
      options,
    );
    const cache = new WallpaperCacheDatabase(
      "missing-dependency-cache",
      options,
    );

    const audioBlob = new Blob(["audio-payload"]);
    const motionBlob = new Blob(["motion-payload"]);
    const audioSha = await sha256Hex(audioBlob);
    const motionSha = await sha256Hex(motionBlob);

    const audioResource = makeResource(
      "dep-audio",
      "1.0.0",
      "audio",
      "Dep Audio",
      audioSha,
      audioBlob.size,
    );
    audioResource.visibility = "dependency-only";
    const motionResource = makeResource(
      "dep-motion",
      "1.0.0",
      "motion",
      "Dep Motion",
      motionSha,
      motionBlob.size,
      [{ id: "dep-audio", version: "1.0.0", binding: "audio" }],
    );

    const blobs: Record<string, Blob> = {
      "objects/dep-audio.bin": audioBlob,
      "objects/dep-motion.bin": motionBlob,
    };

    const fetcher = ((input: RequestInfo | URL) => {
      const url = input.toString();
      const pathname = new URL(url).pathname.replace(/^\//u, "");
      const blob = blobs[pathname];
      if (blob !== undefined) return Promise.resolve(new Response(blob));
      return Promise.resolve(
        new Response(
          JSON.stringify({
            schemaVersion: 1,
            revision: "a".repeat(64),
            resources: [audioResource, motionResource],
          }),
          { headers: { "content-type": "application/json" } },
        ),
      );
    }) as typeof fetch;

    const service = createSourceService(database, fetcher, null);
    await service.add("https://missing.example.com/");
    const client = createClient(database, cache, service, fetcher);
    const result = await client.search({});
    const motionSummary = result.items.find(
      (item) => item.id === "dep-motion",
    )!;

    await client.install(motionSummary, () => undefined);
    expect(await client.isInstalled(motionSummary)).toBe(true);

    const dependencies = await database.resourceDependencies
      .where("parentVersionId")
      .equals(motionSummary.localVersionId)
      .toArray();
    const audioDependencyVersionId =
      dependencies[0]!.dependencyVersionId;
    await database.libraryItems
      .where("resourceVersionId")
      .equals(audioDependencyVersionId)
      .delete();

    expect(await client.isInstalled(motionSummary)).toBe(false);

    database.close();
    cache.close();
  });

  it("reports a motion as not installed when a transitive dependency is missing", async () => {
    const options = createDatabaseOptions();
    const database = new WallpaperClientDatabase(
      "missing-transitive",
      options,
    );
    const cache = new WallpaperCacheDatabase(
      "missing-transitive-cache",
      options,
    );

    const deepAudioBlob = new Blob(["deep-audio-payload"]);
    const directAudioBlob = new Blob(["direct-audio-payload"]);
    const motionBlob = new Blob(["motion-payload"]);
    const deepAudioSha = await sha256Hex(deepAudioBlob);
    const directAudioSha = await sha256Hex(directAudioBlob);
    const motionSha = await sha256Hex(motionBlob);

    const deepAudioResource = makeResource(
      "deep-audio",
      "1.0.0",
      "audio",
      "Deep Audio",
      deepAudioSha,
      deepAudioBlob.size,
    );
    deepAudioResource.visibility = "dependency-only";
    const directAudioResource = makeResource(
      "direct-audio",
      "1.0.0",
      "audio",
      "Direct Audio",
      directAudioSha,
      directAudioBlob.size,
      [
        {
          id: "deep-audio",
          version: "1.0.0",
          binding: "audio",
        },
      ],
    );
    directAudioResource.visibility = "dependency-only";
    const motionResource = makeResource(
      "transitive-motion",
      "1.0.0",
      "motion",
      "Transitive Motion",
      motionSha,
      motionBlob.size,
      [{ id: "direct-audio", version: "1.0.0", binding: "audio" }],
    );

    const blobs: Record<string, Blob> = {
      "objects/deep-audio.bin": deepAudioBlob,
      "objects/direct-audio.bin": directAudioBlob,
      "objects/transitive-motion.bin": motionBlob,
    };

    const fetcher = ((input: RequestInfo | URL) => {
      const url = input.toString();
      const pathname = new URL(url).pathname.replace(/^\//u, "");
      const blob = blobs[pathname];
      if (blob !== undefined) return Promise.resolve(new Response(blob));
      return Promise.resolve(
        new Response(
          JSON.stringify({
            schemaVersion: 1,
            revision: "a".repeat(64),
            resources: [
              deepAudioResource,
              directAudioResource,
              motionResource,
            ],
          }),
          { headers: { "content-type": "application/json" } },
        ),
      );
    }) as typeof fetch;

    const service = createSourceService(database, fetcher, null);
    await service.add("https://transitive.example.com/");
    const client = createClient(database, cache, service, fetcher);
    const result = await client.search({});
    const motionSummary = result.items.find(
      (item) => item.id === "transitive-motion",
    )!;

    await client.install(motionSummary, () => undefined);
    expect(await client.isInstalled(motionSummary)).toBe(true);

    const directDependencies = await database.resourceDependencies
      .where("parentVersionId")
      .equals(motionSummary.localVersionId)
      .toArray();
    const directAudioVersionId = directDependencies[0]!.dependencyVersionId;

    const deepDependencies = await database.resourceDependencies
      .where("parentVersionId")
      .equals(directAudioVersionId)
      .toArray();
    const deepAudioVersionId = deepDependencies[0]!.dependencyVersionId;

    await database.libraryItems
      .where("resourceVersionId")
      .equals(deepAudioVersionId)
      .delete();

    expect(await client.isInstalled(motionSummary)).toBe(false);

    database.close();
    cache.close();
  });
});
