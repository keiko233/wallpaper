import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ResourceManifestSchema, ResourceSiteSchema } from "../src";
import {
  buildRepository,
  buildWallpaperEngineBundle,
  resolveOutputRoot,
  validateArtifactFiles,
  type LoadedSite,
} from "../src/builder";

const temporaryDirectories: string[] = [];

async function makeSite(): Promise<LoadedSite> {
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
        entrypoints: { model: "model.pmx" },
      },
    },
    {
      "model.pmx": "model",
      "textures/body.png": "texture",
    },
    { "cover.webp": "cover" },
  );
  await writeResource(
    "example-motion",
    {
      id: "example-motion",
      version: "1.0.0",
      kind: "motion",
      name: "Example motion",
      artifact: {
        sources: ["motion.vmd", "camera.vmd"],
        fileName: "example-motion.zip",
        format: "zip",
        entrypoints: {
          motions: ["motion.vmd", "camera.vmd"],
        },
      },
    },
    {
      "motion.vmd": "motion",
      "camera.vmd": "camera",
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
        entrypoints: { stage: "stage.pmx" },
      },
    },
    {
      "stage.pmx": "stage",
      "textures/stage.png": "texture",
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
  it("resolves configured output relative to the site and rejects overlap", async () => {
    const loaded = await makeSite();
    expect(resolveOutputRoot(loaded, loaded.site.outputDirectory)).toBe(
      resolve(loaded.siteDir, "dist/resource-publish"),
    );
    expect(() =>
      resolveOutputRoot(loaded, "resource-manifests/output")
    ).toThrow(/must not overlap/u);
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
        models: Array<{ modelPath: string }>;
        motions: Array<{ motionPath: string[] }>;
        stages: Array<{ stagePath: string }>;
      };
    };
    expect(bundle.resources.audios).toHaveLength(1);
    expect(bundle.resources.audios[0]?.audioPath).toBe(
      "/resources/audios/example-audio/example.wav",
    );
    expect(bundle.resources.models[0]?.modelPath).toBe(
      "/resources/models/example-model/model.pmx",
    );
    expect(bundle.resources.motions[0]?.motionPath).toEqual([
      "/resources/motions/example-motion/motion.vmd",
      "/resources/motions/example-motion/camera.vmd",
    ]);
    expect(bundle.resources.stages[0]?.stagePath).toBe(
      "/resources/stages/example-stage/stage.pmx",
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
});
