import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve, sep } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  ResourceManifestSchema,
  ResourceSiteSchema,
} from "@wallpaper/resource-schema";
import {
  buildRepository,
  buildWallpaperEngineBundle,
  loadCollections,
  loadManifests,
  loadPublishState,
  publishStateFilePath,
  resolveOutputRoot,
  savePublishState,
  sourceFiles,
  validateArtifactFiles,
  validateDependencies,
  type LoadedSite,
} from "../src/builder";

const temporaryDirectories: string[] = [];

type TestSite = LoadedSite & {
  writeResource(
    id: string,
    manifest: Record<string, unknown>,
    files: Record<string, string>,
    siblings?: Record<string, string>,
  ): Promise<void>;
};

async function makeSite(): Promise<TestSite> {
  const siteDir = await mkdtemp(resolve(tmpdir(), "wallpaper-catalog-"));
  temporaryDirectories.push(siteDir);
  const manifestDir = resolve(siteDir, "resource-manifests");

  async function writeResource(
    id: string,
    manifest: Record<string, unknown>,
    files: Record<string, string>,
    siblings: Record<string, string> = {},
  ) {
    const resourceDirectory = resolve(manifestDir, id);
    for (const [path, value] of Object.entries(files)) {
      const target = resolve(resourceDirectory, "files", path);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, value);
    }
    for (const [path, value] of Object.entries(siblings)) {
      const target = resolve(resourceDirectory, path);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, value);
    }
    await writeFile(
      resolve(resourceDirectory, "manifest.json"),
      JSON.stringify(manifest),
    );
  }

  await writeResource(
    "example-audio",
    {
      id: "example-audio",
      version: "1.0.0",
      kind: "audio",
      name: "Example audio",
      artifact: {
        sources: ["example.wav"],
        fileName: "example.wav",
        format: "raw",
        entrypoints: { audio: "example.wav" },
      },
    },
    { "example.wav": "audio" },
  );
  await writeResource(
    "example-model",
    {
      id: "example-model",
      version: "1.0.0",
      kind: "model",
      name: "Example model",
      cover: { source: "cover.webp", alt: "Model preview" },
      artifact: {
        fileName: "example-model.zip",
        format: "zip",
        entrypoints: {
          model: [
            {
              id: "original",
              name: "Example model",
              path: "model.pmx",
              default: true,
            },
            {
              id: "toon-change",
              name: "Example model (Toon change)",
              path: "model-toon.pmx",
            },
          ],
        },
      },
    },
    {
      "model.pmx": "model",
      "model-toon.pmx": "model-toon",
      "textures/body.png": "texture",
    },
    { "cover.webp": "cover" },
  );
  await writeResource(
    "example-camera",
    {
      id: "example-camera",
      version: "1.0.0",
      kind: "camera",
      name: "Example camera",
      visibility: "dependency-only",
      artifact: {
        sources: ["camera.vmd"],
        fileName: "camera.vmd",
        format: "raw",
        entrypoints: { camera: "camera.vmd" },
      },
    },
    { "camera.vmd": "camera" },
  );
  await writeResource(
    "example-motion",
    {
      id: "example-motion",
      version: "1.0.0",
      kind: "motion",
      name: "Example motion",
      dependencies: [
        { id: "example-audio", version: "1.0.0", binding: "audio" },
        { id: "example-camera", version: "1.0.0", binding: "camera" },
      ],
      artifact: {
        sources: ["motion.vmd"],
        fileName: "example-motion.zip",
        format: "zip",
        entrypoints: {
          motions: ["motion.vmd"],
        },
      },
    },
    {
      "motion.vmd": "motion",
    },
  );
  await writeResource(
    "example-stage",
    {
      id: "example-stage",
      version: "1.0.0",
      kind: "stage",
      name: "Example stage",
      artifact: {
        fileName: "example-stage.zip",
        format: "zip",
        entrypoints: {
          stage: [
            {
              id: "day",
              name: "Example stage (Day)",
              path: "stage.pmx",
              default: true,
            },
            {
              id: "night",
              name: "Example stage (Night)",
              path: "stage-night.pmx",
            },
          ],
        },
      },
    },
    {
      "stage.pmx": "stage",
      "stage-night.pmx": "stage-night",
      "textures/stage.png": "texture",
    },
  );
  await writeResource(
    "example-skybox",
    {
      id: "example-skybox",
      version: "1.0.0",
      kind: "skybox",
      name: "Example skybox",
      artifact: {
        fileName: "example-skybox.zip",
        format: "zip",
        entrypoints: {
          skybox: [
            {
              id: "day",
              name: "Example skybox (Day)",
              path: "skybox.pmx",
              default: true,
            },
            {
              id: "sunset",
              name: "Example skybox (Sunset)",
              path: "skybox-sunset.pmx",
            },
          ],
        },
      },
    },
    {
      "skybox.pmx": "skybox",
      "skybox-sunset.pmx": "skybox-sunset",
      "textures/sky.png": "texture",
    },
  );

  return {
    site: ResourceSiteSchema.parse({
      schemaVersion: 1,
      repository: { name: "Example" },
      manifestRoot: "resource-manifests",
      outputDirectory: "dist/resource-publish",
    }),
    siteDir,
    manifestDir,
    writeResource,
  };
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true })
    ),
  );
});

describe("resource catalog builder", () => {
  it("persists and reloads the publish state per bucket", async () => {
    const loaded = await makeSite();
    const statePath = publishStateFilePath(loaded.siteDir);

    await expect(loadPublishState(statePath)).resolves.toEqual({});

    await savePublishState(statePath, {
      "wallpaper-assets": {
        "objects/model/example-model/1.0.0/abc/example.zip": "abc",
      },
    });
    await expect(loadPublishState(statePath)).resolves.toEqual({
      "wallpaper-assets": {
        "objects/model/example-model/1.0.0/abc/example.zip": "abc",
      },
    });

    await expect(
      savePublishState(statePath, { "wallpaper-assets": {} }),
    ).resolves.toBeUndefined();
    await expect(loadPublishState(statePath)).resolves.toEqual({
      "wallpaper-assets": {},
    });

    await expect(
      writeFile(statePath, JSON.stringify({ "wallpaper-assets": ["bad"] })),
    ).resolves.toBeUndefined();
    await expect(loadPublishState(statePath)).rejects.toThrow(/Invalid/u);

    await expect(
      writeFile(statePath, JSON.stringify("bad")),
    ).resolves.toBeUndefined();
    await expect(loadPublishState(statePath)).rejects.toThrow(/Invalid/u);
  });

  it("resolves configured output relative to the site and rejects overlap", async () => {
    const loaded = await makeSite();
    expect(resolveOutputRoot(loaded, loaded.site.outputDirectory)).toBe(
      resolve(loaded.siteDir, "dist/resource-publish"),
    );
    expect(() =>
      resolveOutputRoot(loaded, "resource-manifests/output")
    ).toThrow(/must not overlap/u);
  });

  it("ignores Git metadata in manifest and resource directories", async () => {
    const loaded = await makeSite();
    await mkdir(resolve(loaded.manifestDir, ".git"), { recursive: true });
    await writeFile(resolve(loaded.manifestDir, ".git/HEAD"), "ref: main");

    const modelDirectory = resolve(loaded.manifestDir, "example-model");
    await mkdir(resolve(modelDirectory, "files/.git"), { recursive: true });
    await writeFile(resolve(modelDirectory, "files/.git/HEAD"), "ref: nested");

    const manifests = await loadManifests(loaded);
    expect(manifests).toHaveLength(6);

    const model = manifests.find(
      ({ definition }) => definition.id === "example-model",
    );
    const { root, files } = await sourceFiles(
      model!.definition,
      model!.directory,
    );
    expect(
      files.map((file) => file.slice(root.length + 1).split(sep).join("/")),
    ).toEqual([
      "model-toon.pmx",
      "model.pmx",
      "textures/body.png",
    ]);
  });

  it("validates dependency graphs at build time", async () => {
    const loaded = await makeSite();
    const manifests = await loadManifests(loaded);
    expect(() => validateDependencies(manifests)).not.toThrow();

    const missingTarget = [
      ...manifests,
      {
        definition: ResourceManifestSchema.parse({
          id: "orphan-motion",
          version: "1.0.0",
          kind: "motion",
          name: "Orphan",
          dependencies: [
            { id: "missing", version: "1.0.0", binding: "audio" },
          ],
          artifact: {
            sources: ["motion.vmd"],
            fileName: "motion.vmd",
            format: "raw",
            entrypoints: { motions: ["motion.vmd"] },
          },
        }),
        directory: loaded.manifestDir,
      },
    ];
    expect(() => validateDependencies(missingTarget)).toThrow(
      /Dependency target not found/u,
    );

    const duplicateBinding = manifests.map((manifest) =>
      manifest.definition.id === "example-motion"
        ? {
            ...manifest,
            definition: {
              ...manifest.definition,
              dependencies: [
                { id: "example-audio", version: "1.0.0", binding: "audio" },
                { id: "example-camera", version: "1.0.0", binding: "audio" },
              ],
            },
          }
        : manifest,
    );
    expect(() => validateDependencies(duplicateBinding)).toThrow(
      /Duplicate dependency binding/u,
    );

    const kindMismatch = manifests.map((manifest) =>
      manifest.definition.id === "example-motion"
        ? {
            ...manifest,
            definition: {
              ...manifest.definition,
              dependencies: [
                { id: "example-audio", version: "1.0.0", binding: "camera" },
              ],
            },
          }
        : manifest,
    );
    expect(() => validateDependencies(kindMismatch)).toThrow(
      /binding "camera" requires "camera"/u,
    );

    const cycle = [
      {
        definition: ResourceManifestSchema.parse({
          id: "a",
          version: "1.0.0",
          kind: "motion",
          name: "A",
          dependencies: [
            { id: "b", version: "1.0.0", binding: "loop" },
          ],
          artifact: {
            sources: ["a.vmd"],
            fileName: "a.vmd",
            format: "raw",
            entrypoints: { motions: ["a.vmd"] },
          },
        }),
        directory: loaded.manifestDir,
      },
      {
        definition: ResourceManifestSchema.parse({
          id: "b",
          version: "1.0.0",
          kind: "audio",
          name: "B",
          visibility: "dependency-only",
          dependencies: [
            { id: "a", version: "1.0.0", binding: "loop" },
          ],
          artifact: {
            sources: ["b.wav"],
            fileName: "b.wav",
            format: "raw",
            entrypoints: { audio: "b.wav" },
          },
        }),
        directory: loaded.manifestDir,
      },
    ];
    expect(() => validateDependencies(cycle)).toThrow(
      /Cyclic dependency detected/u,
    );
  });

  it("rejects raw multi-file, BPMX, and legacy artifacts", () => {
    const parsed = ResourceManifestSchema.parse({
      id: "example-model",
      version: "1.0.0",
      kind: "model",
      name: "Example",
      artifact: {
        fileName: "example.zip",
        format: "zip",
        entrypoints: { model: "model.pmx" },
      },
    });
    expect(() =>
      validateArtifactFiles(parsed, "/tmp/example", [
        "/tmp/example/model.pmx",
        "/tmp/example/model.bpmx",
      ])
    ).toThrow(/BPMX/u);
    expect(() =>
      validateArtifactFiles(
        {
          ...parsed,
          artifact: {
            ...parsed.artifact,
            sources: ["legacy-assets/model.pmx"],
          },
        },
        "/tmp/example",
        ["/tmp/example/legacy-assets/model.pmx"],
      )
    ).toThrow(/legacy-assets/u);
    expect(() =>
      validateArtifactFiles(
        {
          ...parsed,
          artifact: {
            ...parsed.artifact,
            format: "raw",
          },
        },
        "/tmp/example",
        ["/tmp/example/model.pmx", "/tmp/example/texture.png"],
      )
    ).toThrow(/exactly one file/u);
  });

  it("validates files referenced by stage MME effects", () => {
    const parsed = ResourceManifestSchema.parse({
      id: "effect-stage",
      version: "1.0.0",
      kind: "stage",
      name: "Effect stage",
      render: {
        effects: [
          {
            kind: "mme",
            sourcePath: "effects/WorkingFloor2.fx",
            accessoryPath: "effects/WorkingFloor2.x",
          },
        ],
      },
      artifact: {
        fileName: "effect-stage.zip",
        format: "zip",
        entrypoints: { stage: "stage.pmx" },
      },
    });

    expect(() =>
      validateArtifactFiles(parsed, "/tmp/effect-stage", [
        "/tmp/effect-stage/stage.pmx",
        "/tmp/effect-stage/effects/WorkingFloor2.fx",
      ])
    ).toThrow(/WorkingFloor2\.x/u);
    expect(() =>
      validateArtifactFiles(parsed, "/tmp/effect-stage", [
        "/tmp/effect-stage/stage.pmx",
        "/tmp/effect-stage/effects/WorkingFloor2.fx",
        "/tmp/effect-stage/effects/WorkingFloor2.x",
      ])
    ).not.toThrow();
  });

  it("builds directly into a portable site path and removes stale bundle files", async () => {
    const loaded = await makeSite();
    const stalePath = resolve(
      loaded.siteDir,
      "dist/resource-publish/wallpaper-engine-assets/stale.txt",
    );
    await mkdir(resolve(stalePath, ".."), { recursive: true });
    await writeFile(stalePath, "stale");

    await buildWallpaperEngineBundle(
      loaded,
      loaded.site.outputDirectory,
    );

    await expect(access(stalePath)).rejects.toThrow();
    const bundle = JSON.parse(
      await readFile(
        resolve(loaded.siteDir, "dist/resource-publish/wallpaper-engine.json"),
        "utf8",
      ),
    ) as {
      resources: {
        audios: Array<{ audioPath: string }>;
        models: Array<{ id: string; name: string; modelPath: string }>;
        motions: Array<{
          motionPath: string[];
          audioPath: string;
          cameraPath?: string;
        }>;
        stages: Array<{ id: string; name: string; stagePath: string }>;
        skyboxes: Array<{ id: string; name: string; skyboxPath: string }>;
      };
    };
    expect(bundle.resources.audios).toHaveLength(1);
    expect(bundle.resources.audios[0]?.audioPath).toBe(
      "/resources/audios/example-audio/example.wav",
    );
    expect(bundle.resources.models[0]?.modelPath).toBe(
      "/resources/models/example-model/model.pmx",
    );
    expect(bundle.resources.models[0]?.id).toBe(
      "builtin:model:example-model",
    );
    expect(bundle.resources.models[1]).toEqual(
      expect.objectContaining({
        id: "builtin:model:example-model:toon-change",
        name: "Example model (Toon change)",
        modelPath: "/resources/models/example-model/model-toon.pmx",
      }),
    );
    expect(bundle.resources.motions[0]?.motionPath).toEqual([
      "/resources/motions/example-motion/motion.vmd",
    ]);
    expect(bundle.resources.motions[0]?.audioPath).toBe(
      "/resources/audios/example-audio/example.wav",
    );
    expect(bundle.resources.motions[0]?.cameraPath).toBe(
      "/resources/cameras/example-camera/camera.vmd",
    );
    expect(bundle.resources.stages[0]?.stagePath).toBe(
      "/resources/stages/example-stage/stage.pmx",
    );
    expect(bundle.resources.stages[0]?.id).toBe(
      "builtin:stage:example-stage",
    );
    expect(bundle.resources.stages[1]).toEqual(
      expect.objectContaining({
        id: "builtin:stage:example-stage:night",
        name: "Example stage (Night)",
        stagePath: "/resources/stages/example-stage/stage-night.pmx",
      }),
    );
    expect(bundle.resources.skyboxes[0]?.skyboxPath).toBe(
      "/resources/skyboxes/example-skybox/skybox.pmx",
    );
    expect(bundle.resources.skyboxes[0]?.id).toBe(
      "builtin:skybox:example-skybox",
    );
    expect(bundle.resources.skyboxes[1]).toEqual(
      expect.objectContaining({
        id: "builtin:skybox:example-skybox:sunset",
        name: "Example skybox (Sunset)",
        skyboxPath:
          "/resources/skyboxes/example-skybox/skybox-sunset.pmx",
      }),
    );
    await expect(
      access(
        resolve(
          loaded.siteDir,
          "dist/resource-publish/wallpaper-engine-assets/resources/audios/example-audio/example.wav",
        ),
      ),
    ).resolves.toBeUndefined();
    await expect(
      access(
        resolve(
          loaded.siteDir,
          "dist/resource-publish/wallpaper-engine-assets/resources/skyboxes/example-skybox/textures/sky.png",
        ),
      ),
    ).resolves.toBeUndefined();
    await expect(
      access(
        resolve(
          loaded.siteDir,
          "dist/resource-publish/wallpaper-engine-assets/resources/models/example-model/textures/body.png",
        ),
      ),
    ).resolves.toBeUndefined();
  });

  it("builds deterministic objects and a package-relative cover", async () => {
    const loaded = await makeSite();

    const first = await buildRepository(
      loaded,
      loaded.site.outputDirectory,
    );
    const firstCatalog = JSON.parse(
      await readFile(first.catalogPath, "utf8"),
    ) as {
      revision: string;
      resources: Array<{
        id: string;
        artifact: { path: string };
        cover: { path: string } | null;
      }>;
    };
    const firstModel = firstCatalog.resources.find(
      (resource) => resource.id === "example-model",
    );

    const second = await buildRepository(
      loaded,
      loaded.site.outputDirectory,
    );
    const secondCatalog = JSON.parse(
      await readFile(second.catalogPath, "utf8"),
    ) as typeof firstCatalog;
    const secondModel = secondCatalog.resources.find(
      (resource) => resource.id === "example-model",
    );

    expect(second.catalogRevision).toBe(first.catalogRevision);
    expect(secondModel).toEqual(firstModel);
    await expect(
      access(
        resolve(
          loaded.siteDir,
          "dist/resource-publish",
          firstModel!.artifact.path,
        ),
      ),
    ).resolves.toBeUndefined();
    await expect(
      access(
        resolve(
          loaded.siteDir,
          "dist/resource-publish",
          firstModel!.cover!.path,
        ),
      ),
    ).resolves.toBeUndefined();
  });

  it("detects collection layouts and builds one catalog per collection", async () => {
    const loaded = await makeSite();
    const defaultsDirectory = resolve(loaded.manifestDir, "defaults");
    const privateDirectory = resolve(loaded.manifestDir, "private");
    await mkdir(defaultsDirectory, { recursive: true });
    await mkdir(privateDirectory, { recursive: true });

    const collectionOf: Record<string, string> = {
      "example-audio": "defaults",
      "example-camera": "defaults",
      "example-motion": "defaults",
      "example-model": "private",
      "example-skybox": "private",
      "example-stage": "private",
    };
    for (const [id, collection] of Object.entries(collectionOf)) {
      await rename(
        resolve(loaded.manifestDir, id),
        resolve(loaded.manifestDir, collection, id),
      );
    }

    const collections = await loadCollections(loaded);
    expect(collections.map((collection) => collection.name)).toEqual([
      "defaults",
      "private",
    ]);

    const defaultsManifests = await loadManifests(loaded, collections[0]);
    expect(
      defaultsManifests.map(({ definition }) => definition.id),
    ).toEqual(["example-audio", "example-camera", "example-motion"]);

    const built = await buildRepository(
      loaded,
      loaded.site.outputDirectory,
    );
    expect(built.collections.map((result) => result.name)).toEqual([
      "defaults",
      "private",
    ]);

    const defaultsCatalog = JSON.parse(
      await readFile(
        resolve(
          loaded.siteDir,
          "dist/resource-publish/defaults/catalog.json",
        ),
        "utf8",
      ),
    ) as { resources: Array<{ id: string }> };
    expect(defaultsCatalog.resources.map((resource) => resource.id)).toEqual([
      "example-audio",
      "example-camera",
      "example-motion",
    ]);

    const privateCatalog = JSON.parse(
      await readFile(
        resolve(
          loaded.siteDir,
          "dist/resource-publish/private/catalog.json",
        ),
        "utf8",
      ),
    ) as { resources: Array<{ id: string }> };
    expect(privateCatalog.resources.map((resource) => resource.id)).toEqual([
      "example-model",
      "example-skybox",
      "example-stage",
    ]);

    await expect(
      access(
        resolve(
          loaded.siteDir,
          "dist/resource-publish/defaults/objects/audio/example-audio/1.0.0",
        ),
      ),
    ).resolves.toBeUndefined();
    await expect(
      access(
        resolve(
          loaded.siteDir,
          "dist/resource-publish/private/objects/model/example-model/1.0.0",
        ),
      ),
    ).resolves.toBeUndefined();
  });

  it("bundles Wallpaper Engine resources from the defaults collection", async () => {
    const loaded = await makeSite();
    const defaultsDirectory = resolve(loaded.manifestDir, "defaults");
    const privateDirectory = resolve(loaded.manifestDir, "private");
    await mkdir(defaultsDirectory, { recursive: true });
    await mkdir(privateDirectory, { recursive: true });

    const collectionOf: Record<string, string> = {
      "example-audio": "defaults",
      "example-camera": "defaults",
      "example-motion": "defaults",
      "example-model": "private",
      "example-skybox": "private",
      "example-stage": "private",
    };
    for (const [id, collection] of Object.entries(collectionOf)) {
      await rename(
        resolve(loaded.manifestDir, id),
        resolve(loaded.manifestDir, collection, id),
      );
    }

    await buildWallpaperEngineBundle(
      loaded,
      loaded.site.outputDirectory,
    );
    const bundle = JSON.parse(
      await readFile(
        resolve(
          loaded.siteDir,
          "dist/resource-publish/wallpaper-engine.json",
        ),
        "utf8",
      ),
    ) as {
      resources: {
        audios: Array<{ audioPath: string }>;
        models: Array<{ id: string }>;
      };
    };
    expect(bundle.resources.audios.map((audio) => audio.audioPath)).toEqual([
      "/resources/audios/example-audio/example.wav",
    ]);
    expect(bundle.resources.models).toEqual([]);
  });

  it("carries stage render profiles into the catalog and Wallpaper Engine bundle", async () => {
    const loaded = await makeSite();
    await loaded.writeResource(
      "render-stage",
      {
        id: "render-stage",
        version: "1.0.0",
        kind: "stage",
        name: "Render stage",
        render: {
          reflection: { materialNames: ["地板", "水纹"] },
          emissive: [
            {
              materialNames: ["月亮"],
              color: "#CFE8FF",
              intensity: 1.2,
            },
          ],
          bloom: { intensityMultiplier: 2.2, thresholdOffset: -0.12 },
        },
        artifact: {
          fileName: "render-stage.zip",
          format: "zip",
          entrypoints: { stage: "stage.pmx" },
        },
      },
      { "stage.pmx": "stage" },
    );

    await buildRepository(loaded, loaded.site.outputDirectory);
    const catalog = JSON.parse(
      await readFile(
        resolve(
          loaded.siteDir,
          "dist/resource-publish/catalog.json",
        ),
        "utf8",
      ),
    ) as {
      resources: Array<{ id: string; render?: unknown }>;
    };
    expect(
      catalog.resources.find(
        (resource) => resource.id === "render-stage",
      )?.render,
    ).toEqual({
      reflection: {
        materialNames: ["地板", "水纹"],
        textureSize: 512,
        strength: 0.5,
        blurKernel: 12,
        planeOffset: 0,
      },
      emissive: [
        {
          materialNames: ["月亮"],
          color: "#CFE8FF",
          intensity: 1.2,
        },
      ],
      bloom: { intensityMultiplier: 2.2, thresholdOffset: -0.12 },
    });

    await buildWallpaperEngineBundle(
      loaded,
      loaded.site.outputDirectory,
    );
    const bundle = JSON.parse(
      await readFile(
        resolve(
          loaded.siteDir,
          "dist/resource-publish/wallpaper-engine.json",
        ),
        "utf8",
      ),
    ) as {
      resources: { stages: Array<{ id: string; render?: unknown }> };
    };
    expect(
      bundle.resources.stages.find(
        (stage) => stage.id === "builtin:stage:render-stage",
      )?.render,
    ).toBeDefined();
  });

  it("bundles a skybox declared by a stage resource", async () => {
    const loaded = await makeSite();
    await loaded.writeResource(
      "bundled-sky-stage",
      {
        id: "bundled-sky-stage",
        version: "1.0.0",
        kind: "stage",
        name: "Bundled sky stage",
        artifact: {
          fileName: "bundled-sky-stage.zip",
          format: "zip",
          entrypoints: {
            stage: "stage.pmx",
            skybox: "sky.pmx",
          },
        },
      },
      { "stage.pmx": "stage", "sky.pmx": "sky" },
    );

    await buildRepository(loaded, loaded.site.outputDirectory);
    await buildWallpaperEngineBundle(loaded, loaded.site.outputDirectory);
    const bundle = JSON.parse(
      await readFile(
        resolve(
          loaded.siteDir,
          "dist/resource-publish/wallpaper-engine.json",
        ),
        "utf8",
      ),
    ) as {
      resources: {
        stages: Array<{ id: string; stagePath: string }>;
        skyboxes: Array<{ id: string; name: string; skyboxPath: string }>;
      };
    };
    expect(
      bundle.resources.stages.find(
        (stage) => stage.id === "builtin:stage:bundled-sky-stage",
      ),
    ).toMatchObject({
      stagePath: "/resources/stages/bundled-sky-stage/stage.pmx",
    });
    expect(bundle.resources.skyboxes).toContainEqual({
      id: "builtin:stage:bundled-sky-stage:skybox",
      name: "Bundled sky stage (Sky)",
      skyboxPath: "/resources/stages/bundled-sky-stage/sky.pmx",
    });
  });

  it("rejects render profiles on non-stage manifests", async () => {
    const loaded = await makeSite();
    await loaded.writeResource(
      "render-model",
      {
        id: "render-model",
        version: "1.0.0",
        kind: "model",
        name: "Render model",
        render: { reflection: { materialNames: ["地板"] } },
        artifact: {
          fileName: "render-model.zip",
          format: "zip",
          entrypoints: { model: "model.pmx" },
        },
      },
      { "model.pmx": "model" },
    );

    await expect(
      buildRepository(loaded, loaded.site.outputDirectory),
    ).rejects.toThrow(/only for stage resources/u);
  });

  it("rejects wallpaper-engine bundles with platform-incompatible dependencies", async () => {
    const loaded = await makeSite();

    await loaded.writeResource(
      "incompatible-audio",
      {
        id: "incompatible-audio",
        version: "1.0.0",
        kind: "audio",
        name: "Incompatible audio",
        compatibility: { platforms: ["web"], features: [] },
        artifact: {
          sources: ["audio.wav"],
          fileName: "audio.wav",
          format: "raw",
          entrypoints: { audio: "audio.wav" },
        },
      },
      { "audio.wav": "audio" },
    );

    await loaded.writeResource(
      "incompatible-motion",
      {
        id: "incompatible-motion",
        version: "1.0.0",
        kind: "motion",
        name: "Incompatible motion",
        dependencies: [
          {
            id: "incompatible-audio",
            version: "1.0.0",
            binding: "audio",
          },
        ],
        artifact: {
          sources: ["motion.vmd"],
          fileName: "motion.vmd",
          format: "raw",
          entrypoints: { motions: ["motion.vmd"] },
        },
      },
      { "motion.vmd": "motion" },
    );

    await expect(
      buildWallpaperEngineBundle(
        loaded,
        loaded.site.outputDirectory,
      ),
    ).rejects.toThrow(
      /depends on incompatible-audio@1\.0\.0, which is not compatible with wallpaper-engine/u,
    );
  });
});
