import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { describe, expect, it } from "vitest";
import { createVirtualResourceUrl } from "@wallpaper/player/resource-url";
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

  it("exposes selectable motion and camera entrypoint combinations", async () => {
    const options = createDatabaseOptions();
    const database = new WallpaperClientDatabase(
      "materialize-motion-variants",
      options,
    );
    const cache = new WallpaperCacheDatabase(
      "materialize-motion-variants-cache",
      options,
    );
    const now = "2026-07-31T00:00:00.000Z";
    const motionSha = "f".repeat(64);
    const cameraSha = "e".repeat(64);
    const audioSha = "d".repeat(64);

    await database.resources.bulkPut([
      {
        id: "source:icw",
        sourceId: "source",
        sourceName: "Test",
        upstreamId: "icw",
        kind: "motion",
        name: "I Can't Wait",
        description: "Dance",
        categories: ["dance"],
        tags: [],
        visibility: "public",
        publishedVersionId: "source:icw@1.0.0",
        currentVersion: "1.0.0",
        coverUrl: null,
        catalogRevision: "revision",
        updatedAt: now,
      },
      {
        id: "source:icw-camera",
        sourceId: "source",
        sourceName: "Test",
        upstreamId: "icw-camera",
        kind: "camera",
        name: "I Can't Wait camera",
        description: null,
        categories: [],
        tags: [],
        visibility: "dependency-only",
        publishedVersionId: "source:icw-camera@1.0.0",
        currentVersion: "1.0.0",
        coverUrl: null,
        catalogRevision: "revision",
        updatedAt: now,
      },
      {
        id: "source:icw-audio",
        sourceId: "source",
        sourceName: "Test",
        upstreamId: "icw-audio",
        kind: "audio",
        name: "I Can't Wait audio",
        description: null,
        categories: [],
        tags: [],
        visibility: "dependency-only",
        publishedVersionId: "source:icw-audio@1.0.0",
        currentVersion: "1.0.0",
        coverUrl: null,
        catalogRevision: "revision",
        updatedAt: now,
      },
    ]);
    await database.resourceVersions.bulkPut([
      {
        id: "source:icw@1.0.0",
        sourceId: "source",
        upstreamId: "icw",
        upstreamVersion: "1.0.0",
        resourceId: "source:icw",
        artifactId: "source:icw@1.0.0",
        format: "zip",
        fileName: "icw.zip",
        contentType: "application/zip",
        sha256: motionSha,
        byteSize: 3,
        entrypoints: {
          motions: [
            {
              id: "default",
              name: "Default",
              path: "motion.vmd",
              default: true,
            },
            {
              id: "tda",
              name: "Tda式",
              path: "motion Tda式.vmd",
            },
          ],
        },
        publishedAt: now,
      },
      {
        id: "source:icw-camera@1.0.0",
        sourceId: "source",
        upstreamId: "icw-camera",
        upstreamVersion: "1.0.0",
        resourceId: "source:icw-camera",
        artifactId: "source:icw-camera@1.0.0",
        format: "zip",
        fileName: "icw-camera.zip",
        contentType: "application/zip",
        sha256: cameraSha,
        byteSize: 3,
        entrypoints: {
          camera: [
            {
              id: "140cm",
              name: "140cm",
              path: "camera 140cm.vmd",
              default: true,
            },
            {
              id: "160cm",
              name: "160cm",
              path: "camera 160cm.vmd",
            },
            {
              id: "180cm",
              name: "180cm",
              path: "camera 180cm.vmd",
            },
          ],
        },
        publishedAt: now,
      },
      {
        id: "source:icw-audio@1.0.0",
        sourceId: "source",
        upstreamId: "icw-audio",
        upstreamVersion: "1.0.0",
        resourceId: "source:icw-audio",
        artifactId: "source:icw-audio@1.0.0",
        format: "zip",
        fileName: "icw.wav",
        contentType: "audio/wav",
        sha256: audioSha,
        byteSize: 1,
        entrypoints: { audio: "song.wav" },
        publishedAt: now,
      },
    ]);
    await database.libraryItems.bulkPut([
      {
        resourceId: "source:icw",
        resourceVersionId: "source:icw@1.0.0",
        sourceId: "source",
        kind: "motion",
        source: "remote",
        addedAt: now,
      },
      {
        resourceId: "source:icw-camera",
        resourceVersionId: "source:icw-camera@1.0.0",
        sourceId: "source",
        kind: "camera",
        source: "remote",
        addedAt: now,
      },
      {
        resourceId: "source:icw-audio",
        resourceVersionId: "source:icw-audio@1.0.0",
        sourceId: "source",
        kind: "audio",
        source: "remote",
        addedAt: now,
      },
    ]);
    await database.resourceDependencies.bulkPut([
      {
        parentVersionId: "source:icw@1.0.0",
        binding: "audio",
        dependencyVersionId: "source:icw-audio@1.0.0",
      },
      {
        parentVersionId: "source:icw@1.0.0",
        binding: "camera",
        dependencyVersionId: "source:icw-camera@1.0.0",
      },
    ]);
    await cache.artifactFiles.bulkPut([
      {
        sha256: motionSha,
        path: "motion.vmd",
        contentType: "application/octet-stream",
        byteSize: 1,
        lastAccessedAt: now,
        blob: new Blob(["m1"]),
      },
      {
        sha256: motionSha,
        path: "motion Tda式.vmd",
        contentType: "application/octet-stream",
        byteSize: 1,
        lastAccessedAt: now,
        blob: new Blob(["m2"]),
      },
      {
        sha256: cameraSha,
        path: "camera 140cm.vmd",
        contentType: "application/octet-stream",
        byteSize: 1,
        lastAccessedAt: now,
        blob: new Blob(["c1"]),
      },
      {
        sha256: cameraSha,
        path: "camera 160cm.vmd",
        contentType: "application/octet-stream",
        byteSize: 1,
        lastAccessedAt: now,
        blob: new Blob(["c2"]),
      },
      {
        sha256: cameraSha,
        path: "camera 180cm.vmd",
        contentType: "application/octet-stream",
        byteSize: 1,
        lastAccessedAt: now,
        blob: new Blob(["c3"]),
      },
      {
        sha256: audioSha,
        path: "song.wav",
        contentType: "audio/wav",
        byteSize: 1,
        lastAccessedAt: now,
        blob: new Blob(["a"]),
      },
    ]);

    const resources = await materializeLibrary(database, cache, {
      models: [],
      motions: [],
      skyboxes: [],
      stages: [],
    });

    const motionBase = `/__wallpaper_resources/${motionSha}`;
    const cameraBase = `/__wallpaper_resources/${cameraSha}`;
    const audioPath = createVirtualResourceUrl(audioSha, "song.wav");
    const defaultMotion = expect.objectContaining({
      id: "remote:source:icw:default:140cm",
      name: "Default · 140cm",
      group: "I Can't Wait",
      motionPath: [`${motionBase}/motion.vmd`],
      audioPath,
      cameraPath: `${cameraBase}/camera%20140cm.vmd`,
      remark: "Dance",
    });
    expect(resources.motions).toEqual([
      defaultMotion,
      expect.objectContaining({
        id: "remote:source:icw:default:160cm",
        name: "Default · 160cm",
        group: "I Can't Wait",
        cameraPath: `${cameraBase}/camera%20160cm.vmd`,
      }),
      expect.objectContaining({
        id: "remote:source:icw:default:180cm",
        name: "Default · 180cm",
        group: "I Can't Wait",
        cameraPath: `${cameraBase}/camera%20180cm.vmd`,
      }),
      expect.objectContaining({
        id: "remote:source:icw:tda:140cm",
        name: "Tda式 · 140cm",
        group: "I Can't Wait",
        motionPath: [`${motionBase}/motion%20Tda%E5%BC%8F.vmd`],
      }),
      expect.objectContaining({
        id: "remote:source:icw:tda:160cm",
        name: "Tda式 · 160cm",
        group: "I Can't Wait",
      }),
      expect.objectContaining({
        id: "remote:source:icw:tda:180cm",
        name: "Tda式 · 180cm",
        group: "I Can't Wait",
      }),
    ]);

    resources.dispose();
    database.close();
    cache.close();
  });

  it("loads multiple motion paths together when no variants are configured", async () => {
    const options = createDatabaseOptions();
    const database = new WallpaperClientDatabase(
      "materialize-motion-multi",
      options,
    );
    const cache = new WallpaperCacheDatabase(
      "materialize-motion-multi-cache",
      options,
    );
    const now = "2026-07-31T00:00:00.000Z";
    const motionSha = "9".repeat(64);
    const audioSha = "8".repeat(64);

    await database.resources.bulkPut([
      {
        id: "source:melt",
        sourceId: "source",
        sourceName: "Test",
        upstreamId: "melt",
        kind: "motion",
        name: "Melt",
        description: null,
        categories: [],
        tags: [],
        visibility: "public",
        publishedVersionId: "source:melt@1.0.0",
        currentVersion: "1.0.0",
        coverUrl: null,
        catalogRevision: "revision",
        updatedAt: now,
      },
      {
        id: "source:melt-audio",
        sourceId: "source",
        sourceName: "Test",
        upstreamId: "melt-audio",
        kind: "audio",
        name: "Melt audio",
        description: null,
        categories: [],
        tags: [],
        visibility: "dependency-only",
        publishedVersionId: "source:melt-audio@1.0.0",
        currentVersion: "1.0.0",
        coverUrl: null,
        catalogRevision: "revision",
        updatedAt: now,
      },
    ]);
    await database.resourceVersions.bulkPut([
      {
        id: "source:melt@1.0.0",
        sourceId: "source",
        upstreamId: "melt",
        upstreamVersion: "1.0.0",
        resourceId: "source:melt",
        artifactId: "source:melt@1.0.0",
        format: "zip",
        fileName: "melt.zip",
        contentType: "application/zip",
        sha256: motionSha,
        byteSize: 2,
        entrypoints: {
          motions: ["Melt.vmd", "FACIAL_Melt.vmd"],
        },
        publishedAt: now,
      },
      {
        id: "source:melt-audio@1.0.0",
        sourceId: "source",
        upstreamId: "melt-audio",
        upstreamVersion: "1.0.0",
        resourceId: "source:melt-audio",
        artifactId: "source:melt-audio@1.0.0",
        format: "zip",
        fileName: "melt.wav",
        contentType: "audio/wav",
        sha256: audioSha,
        byteSize: 1,
        entrypoints: { audio: "song.wav" },
        publishedAt: now,
      },
    ]);
    await database.libraryItems.bulkPut([
      {
        resourceId: "source:melt",
        resourceVersionId: "source:melt@1.0.0",
        sourceId: "source",
        kind: "motion",
        source: "remote",
        addedAt: now,
      },
      {
        resourceId: "source:melt-audio",
        resourceVersionId: "source:melt-audio@1.0.0",
        sourceId: "source",
        kind: "audio",
        source: "remote",
        addedAt: now,
      },
    ]);
    await database.resourceDependencies.bulkPut([
      {
        parentVersionId: "source:melt@1.0.0",
        binding: "audio",
        dependencyVersionId: "source:melt-audio@1.0.0",
      },
    ]);
    await cache.artifactFiles.bulkPut([
      {
        sha256: motionSha,
        path: "Melt.vmd",
        contentType: "application/octet-stream",
        byteSize: 1,
        lastAccessedAt: now,
        blob: new Blob(["m1"]),
      },
      {
        sha256: motionSha,
        path: "FACIAL_Melt.vmd",
        contentType: "application/octet-stream",
        byteSize: 1,
        lastAccessedAt: now,
        blob: new Blob(["m2"]),
      },
      {
        sha256: audioSha,
        path: "song.wav",
        contentType: "audio/wav",
        byteSize: 1,
        lastAccessedAt: now,
        blob: new Blob(["a"]),
      },
    ]);

    const resources = await materializeLibrary(database, cache, {
      models: [],
      motions: [],
      skyboxes: [],
      stages: [],
    });

    expect(resources.motions).toEqual([
      expect.objectContaining({
        id: "remote:source:melt",
        name: "Melt",
        motionPath: [
          createVirtualResourceUrl(motionSha, "Melt.vmd"),
          createVirtualResourceUrl(motionSha, "FACIAL_Melt.vmd"),
        ],
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
