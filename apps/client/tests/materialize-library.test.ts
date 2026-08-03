import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { describe, expect, it } from "vitest";
import {
  WallpaperCacheDatabase,
  WallpaperClientDatabase,
} from "../src/db/database";
import { materializeLibrary } from "../src/resources/materialize-library";

function createDatabaseOptions() {
  return {
    indexedDB: new IDBFactory(),
    IDBKeyRange,
  };
}

describe("materializeLibrary", () => {
  it("exposes every selectable model and skybox entrypoint", async () => {
    const options = createDatabaseOptions();
    const database = new WallpaperClientDatabase(
      "materialize-entrypoints",
      options,
    );
    const cache = new WallpaperCacheDatabase(
      "materialize-entrypoints-cache",
      options,
    );
    const now = "2026-07-31T00:00:00.000Z";
    const modelSha = "a".repeat(64);
    const stageSha = "b".repeat(64);

    await database.resources.bulkPut([
      {
        id: "source:model-pack",
        sourceId: "source",
        sourceName: "Test",
        upstreamId: "model-pack",
        kind: "model",
        name: "Model pack",
        description: "Shared model files",
        categories: [],
        tags: [],
        visibility: "public",
        publishedVersionId: "source:model-pack@1.0.0",
        currentVersion: "1.0.0",
        coverUrl: null,
        catalogRevision: "revision",
        updatedAt: now,
      },
      {
        id: "source:sky-pack",
        sourceId: "source",
        sourceName: "Test",
        upstreamId: "sky-pack",
        kind: "skybox",
        name: "Sky pack",
        description: null,
        categories: [],
        tags: [],
        visibility: "public",
        publishedVersionId: "source:sky-pack@1.0.0",
        currentVersion: "1.0.0",
        coverUrl: null,
        catalogRevision: "revision",
        updatedAt: now,
      },
    ]);
    await database.resourceVersions.bulkPut([
      {
        id: "source:model-pack@1.0.0",
        sourceId: "source",
        upstreamId: "model-pack",
        upstreamVersion: "1.0.0",
        resourceId: "source:model-pack",
        artifactId: "source:model-pack@1.0.0",
        format: "zip",
        fileName: "model-pack.zip",
        contentType: "application/zip",
        sha256: modelSha,
        byteSize: 3,
        entrypoints: {
          model: [
            {
              id: "original",
              name: "Original model",
              path: "model.pmx",
              default: true,
            },
            {
              id: "toon-change",
              name: "Toon-change model",
              path: "model-toon.pmx",
            },
          ],
        },
        publishedAt: now,
      },
      {
        id: "source:sky-pack@1.0.0",
        sourceId: "source",
        upstreamId: "sky-pack",
        upstreamVersion: "1.0.0",
        resourceId: "source:sky-pack",
        artifactId: "source:sky-pack@1.0.0",
        format: "zip",
        fileName: "sky-pack.zip",
        contentType: "application/zip",
        sha256: stageSha,
        byteSize: 2,
        entrypoints: {
          skybox: [
            {
              id: "sky-1",
              name: "Cloud sky 1",
              path: "sky-1.pmx",
              default: true,
            },
            {
              id: "sky-2",
              name: "Cloud sky 2",
              path: "sky-2.pmx",
            },
          ],
        },
        publishedAt: now,
      },
    ]);
    await database.libraryItems.bulkPut([
      {
        resourceId: "source:model-pack",
        resourceVersionId: "source:model-pack@1.0.0",
        sourceId: "source",
        kind: "model",
        source: "remote",
        addedAt: now,
      },
      {
        resourceId: "source:sky-pack",
        resourceVersionId: "source:sky-pack@1.0.0",
        sourceId: "source",
        kind: "skybox",
        source: "remote",
        addedAt: now,
      },
    ]);
    await cache.artifactFiles.bulkPut([
      {
        sha256: modelSha,
        path: "model.pmx",
        contentType: "application/octet-stream",
        byteSize: 1,
        lastAccessedAt: now,
        blob: new Blob(["a"]),
      },
      {
        sha256: modelSha,
        path: "model-toon.pmx",
        contentType: "application/octet-stream",
        byteSize: 1,
        lastAccessedAt: now,
        blob: new Blob(["b"]),
      },
      {
        sha256: modelSha,
        path: "tex/shared.png",
        contentType: "image/png",
        byteSize: 1,
        lastAccessedAt: now,
        blob: new Blob(["c"]),
      },
      {
        sha256: stageSha,
        path: "sky-1.pmx",
        contentType: "application/octet-stream",
        byteSize: 1,
        lastAccessedAt: now,
        blob: new Blob(["d"]),
      },
      {
        sha256: stageSha,
        path: "sky-2.pmx",
        contentType: "application/octet-stream",
        byteSize: 1,
        lastAccessedAt: now,
        blob: new Blob(["e"]),
      },
    ]);

    const resources = await materializeLibrary(database, cache, {
      models: [],
      motions: [],
      skyboxes: [],
      stages: [],
    });

    expect(resources.models).toEqual([
      expect.objectContaining({
        id: "remote:source:model-pack",
        name: "Original model",
        modelPath: `/__wallpaper_resources/${modelSha}/model.pmx`,
      }),
      expect.objectContaining({
        id: "remote:source:model-pack:toon-change",
        name: "Toon-change model",
        modelPath: `/__wallpaper_resources/${modelSha}/model-toon.pmx`,
      }),
    ]);
    expect(resources.skyboxes).toEqual([
      expect.objectContaining({
        id: "remote:source:sky-pack",
        name: "Cloud sky 1",
        skyboxPath: `/__wallpaper_resources/${stageSha}/sky-1.pmx`,
      }),
      expect.objectContaining({
        id: "remote:source:sky-pack:sky-2",
        name: "Cloud sky 2",
        skyboxPath: `/__wallpaper_resources/${stageSha}/sky-2.pmx`,
      }),
    ]);

    resources.dispose();
    database.close();
    cache.close();
  });

  it("carries stage render profiles from remote and bundled resources", async () => {
    const options = createDatabaseOptions();
    const database = new WallpaperClientDatabase(
      "materialize-render",
      options,
    );
    const cache = new WallpaperCacheDatabase(
      "materialize-render-cache",
      options,
    );
    const now = "2026-07-31T00:00:00.000Z";
    const sha = "c".repeat(64);
    const render = {
      reflection: {
        materialNames: ["地板", "水纹"],
        textureSize: 512,
        strength: 0.5,
        blurKernel: 12,
        planeOffset: 0,
      },
    };

    await database.resources.bulkPut([
      {
        id: "source:render-stage",
        sourceId: "source",
        sourceName: "Test",
        upstreamId: "render-stage",
        kind: "stage",
        name: "Render stage",
        description: null,
        categories: [],
        tags: [],
        visibility: "public",
        publishedVersionId: "source:render-stage@1.0.0",
        currentVersion: "1.0.0",
        coverUrl: null,
        catalogRevision: "revision",
        updatedAt: now,
      },
    ]);
    await database.resourceVersions.bulkPut([
      {
        id: "source:render-stage@1.0.0",
        sourceId: "source",
        upstreamId: "render-stage",
        upstreamVersion: "1.0.0",
        resourceId: "source:render-stage",
        artifactId: "source:render-stage@1.0.0",
        format: "zip",
        fileName: "render-stage.zip",
        contentType: "application/zip",
        sha256: sha,
        byteSize: 1,
        entrypoints: {
          stage: "stage.pmx",
        },
        render,
        publishedAt: now,
      },
    ]);
    await database.libraryItems.bulkPut([
      {
        resourceId: "source:render-stage",
        resourceVersionId: "source:render-stage@1.0.0",
        sourceId: "source",
        kind: "stage",
        source: "remote",
        addedAt: now,
      },
    ]);
    await cache.artifactFiles.bulkPut([
      {
        sha256: sha,
        path: "stage.pmx",
        contentType: "application/octet-stream",
        byteSize: 1,
        lastAccessedAt: now,
        blob: new Blob(["s"]),
      },
    ]);

    const resources = await materializeLibrary(database, cache, {
      models: [],
      motions: [],
      skyboxes: [],
      stages: [
        {
          id: "builtin:stage:bundled",
          name: "Bundled stage",
          stagePath: "/resources/stages/bundled/stage.pmx",
          render,
        },
      ],
    });

    expect(resources.stages).toEqual([
      expect.objectContaining({
        id: "builtin:stage:bundled",
        render,
      }),
      expect.objectContaining({
        id: "remote:source:render-stage",
        render,
      }),
    ]);

    resources.dispose();
    database.close();
    cache.close();
  });
});
