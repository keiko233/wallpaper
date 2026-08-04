import { describe, expect, it } from "vitest";
import {
  ResourceCatalogSchema,
  ResourceCatalogV2Schema,
  ResourceCatalogV3Schema,
  ResourceDefinitionsSchema,
  ResourceManifestSchema,
  ResourceSiteSchema,
  WallpaperEngineBundleSchema,
  WallpaperEngineSelectionSchema,
  normalizeResourceSourceUrl,
  resolveArtifactEntrypoints,
  resolveCatalogAssetUrl,
} from "../src";

const definition = {
  id: "example-model",
  version: "1.0.0",
  kind: "model",
  name: "Example model",
  description: null,
  tags: ["Miku"],
  artifact: {
    fileName: "example.zip",
    format: "zip",
    entrypoints: {
      model: "model.pmx",
    },
  },
};

describe("resource schema", () => {
  it("normalizes definitions and applies platform defaults", () => {
    const parsed = ResourceDefinitionsSchema.parse({
      schemaVersion: 1,
      resources: [definition],
    });

    expect(parsed.resources[0]?.tags).toEqual(["miku"]);
    expect(parsed.resources[0]?.compatibility.platforms).toEqual([
      "web",
      "wallpaper-engine",
    ]);
  });

  it("rejects duplicate versions and unsafe paths", () => {
    expect(() =>
      ResourceDefinitionsSchema.parse({
        schemaVersion: 1,
        resources: [definition, definition],
      }),
    ).toThrow(/Duplicate resource version/u);
    expect(() =>
      ResourceDefinitionsSchema.parse({
        schemaVersion: 1,
        resources: [
          {
            ...definition,
            artifact: {
              ...definition.artifact,
              sources: ["../models"],
            },
          },
        ],
      }),
    ).toThrow();
  });

  it("resolves relative object paths against the catalog URL", () => {
    expect(
      resolveCatalogAssetUrl(
        "https://assets.example.com/catalog.json",
        "objects/model/example.zip",
      ).href,
    ).toBe("https://assets.example.com/objects/model/example.zip");
  });

  it("validates a generated catalog", () => {
    expect(
      ResourceCatalogSchema.parse({
        schemaVersion: 1,
        revision: "a".repeat(64),
        resources: [
          {
            ...definition,
            authors: [],
            license: null,
            categories: [],
            tags: ["miku"],
            compatibility: {
              platforms: ["web", "wallpaper-engine"],
              features: [],
            },
            cover: null,
            artifact: {
              path: "objects/model/example.zip",
              fileName: "example.zip",
              format: "zip",
              contentType: "application/zip",
              byteSize: 123,
              sha256: "b".repeat(64),
              entrypoints: {
                model: "model.pmx",
              },
            },
          },
        ],
      }),
    ).toBeDefined();
  });

  it("validates Wallpaper Engine selections and generated resources", () => {
    expect(
      WallpaperEngineSelectionSchema.parse({
        schemaVersion: 1,
        resources: [
          {
            id: "example-model",
            version: "1.0.0",
            runtimeId: "builtin:model:example-model",
          },
        ],
      }),
    ).toBeDefined();
    expect(
      WallpaperEngineBundleSchema.parse({
        schemaVersion: 1,
        resources: {
          audios: [],
          models: [
            {
              id: "builtin:model:example-model",
              name: "Example model",
              modelPath: "/resources/models/example/model.pmx",
            },
          ],
          motions: [],
          skyboxes: [],
          stages: [],
        },
      }),
    ).toBeDefined();
  });

  it("validates a v2 catalog with repository metadata", () => {
    const catalog = ResourceCatalogV2Schema.parse({
      schemaVersion: 2,
      repository: {
        name: "Example Repository",
        description: "A test repository.",
        homepage: "https://example.com",
      },
      revision: "a".repeat(64),
      resources: [],
    });
    expect(catalog).toBeDefined();
    expect(catalog.repository.name).toBe("Example Repository");
  });

  it("requires catalog v3 for selectable entrypoint variants", () => {
    const resource = {
      ...definition,
      authors: [],
      license: null,
      categories: [],
      tags: ["miku"],
      compatibility: {
        platforms: ["web", "wallpaper-engine"],
        features: [],
      },
      visibility: "public",
      dependencies: [],
      cover: null,
      artifact: {
        path: "objects/model/example.zip",
        fileName: "example.zip",
        format: "zip",
        contentType: "application/zip",
        byteSize: 123,
        sha256: "b".repeat(64),
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
    };
    const catalog = {
      schemaVersion: 3,
      repository: { name: "Example" },
      revision: "c".repeat(64),
      resources: [resource],
    };

    expect(ResourceCatalogV3Schema.parse(catalog)).toBeDefined();
    expect(() =>
      ResourceCatalogV2Schema.parse({ ...catalog, schemaVersion: 2 }),
    ).toThrow(/schemaVersion 3/u);
  });

  it("accepts v1, v2, and v3 catalogs through ResourceCatalogSchema", () => {
    expect(
      ResourceCatalogSchema.parse({
        schemaVersion: 1,
        revision: "a".repeat(64),
        resources: [],
      }),
    ).toBeDefined();
    expect(
      ResourceCatalogSchema.parse({
        schemaVersion: 2,
        repository: { name: "Example" },
        revision: "b".repeat(64),
        resources: [],
      }),
    ).toBeDefined();
    expect(
      ResourceCatalogSchema.parse({
        schemaVersion: 3,
        repository: { name: "Example" },
        revision: "c".repeat(64),
        resources: [],
      }),
    ).toBeDefined();
  });

  it("validates resource site and per-resource manifest schemas", () => {
    expect(
      ResourceSiteSchema.parse({
        schemaVersion: 1,
        repository: {
          name: "Example Site",
          description: null,
          homepage: null,
        },
        manifestRoot: "resource-manifests",
        outputDirectory: "dist/resource-publish",
        wallpaperEngine: {
          runtimeIdOverrides: {
            "example-model@1.0.0": "builtin:model:example-model",
          },
        },
      }),
    ).toBeDefined();
    expect(ResourceManifestSchema.parse(definition)).toBeDefined();
  });

  it("defaults visibility to public and parses dependencies", () => {
    const parsed = ResourceManifestSchema.parse({
      ...definition,
      kind: "motion",
      dependencies: [
        { id: "example-audio", version: "1.0.0", binding: "audio" },
      ],
    });
    expect(parsed.visibility).toBe("public");
    expect(parsed.dependencies).toEqual([
      { id: "example-audio", version: "1.0.0", binding: "audio" },
    ]);
  });

  it("accepts camera resources and dependency-only visibility", () => {
    const parsed = ResourceManifestSchema.parse({
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
    });
    expect(parsed.kind).toBe("camera");
    expect(parsed.visibility).toBe("dependency-only");
  });

  it("normalizes selectable model entrypoints with one stable default", () => {
    const parsed = ResourceManifestSchema.parse({
      ...definition,
      artifact: {
        ...definition.artifact,
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
    });

    expect(
      resolveArtifactEntrypoints(parsed.artifact.entrypoints, ["model"]),
    ).toEqual([
      {
        id: "original",
        name: "Example model",
        paths: ["model.pmx"],
        isDefault: true,
      },
      {
        id: "toon-change",
        name: "Example model (Toon change)",
        paths: ["model-toon.pmx"],
        isDefault: false,
      },
    ]);
  });

  it("accepts selectable skybox entrypoints", () => {
    const parsed = ResourceManifestSchema.parse({
      ...definition,
      kind: "skybox",
      artifact: {
        ...definition.artifact,
        entrypoints: {
          skybox: [
            {
              id: "day",
              name: "Cloud sky (Day)",
              path: "sky-day.pmx",
              default: true,
            },
            {
              id: "sunset",
              name: "Cloud sky (Sunset)",
              path: "sky-sunset.pmx",
            },
          ],
        },
      },
    });

    expect(
      resolveArtifactEntrypoints(parsed.artifact.entrypoints, ["skybox"]),
    ).toHaveLength(2);
  });

  it("validates stage render profiles and applies their defaults", () => {
    const parsed = ResourceManifestSchema.parse({
      ...definition,
      kind: "stage",
      render: {
        reflection: {
          materialNames: ["地板", "水纹"],
        },
        emissive: [
          {
            materialNames: ["月亮"],
            color: "#CFE8FF",
          },
        ],
        bloom: {
          intensityMultiplier: 2.2,
          thresholdOffset: -0.12,
        },
      },
    });

    expect(parsed.render).toEqual({
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
          intensity: 1,
        },
      ],
      bloom: {
        intensityMultiplier: 2.2,
        thresholdOffset: -0.12,
      },
    });
  });

  it("rejects render profiles on non-stage resources", () => {
    expect(() =>
      ResourceManifestSchema.parse({
        ...definition,
        render: {
          emissive: [{ materialNames: ["月亮"], color: "#FFFFFF" }],
        },
      }),
    ).toThrow(/only for stage resources/u);
  });

  it("applies defaults to stage material PBR overrides", () => {
    const parsed = ResourceManifestSchema.parse({
      ...definition,
      kind: "stage",
      render: {
        materials: [
          {
            materialNames: ["地板", "水纹"],
            kind: "pbr",
          },
        ],
      },
    });

    expect(parsed.render).toEqual({
      materials: [
        {
          materialNames: ["地板", "水纹"],
          kind: "pbr",
          metallic: 0,
          roughness: 0.7,
          environmentIntensity: 1,
          directIntensity: 1,
        },
      ],
    });
  });

  it("applies clear coat defaults to stage material PBR overrides", () => {
    const parsed = ResourceManifestSchema.parse({
      ...definition,
      kind: "stage",
      render: {
        materials: [
          {
            materialNames: ["玻璃"],
            kind: "pbr",
            metallic: 0.5,
            roughness: 0.3,
            clearCoat: {},
          },
        ],
      },
    });

    expect(parsed.render).toEqual({
      materials: [
        {
          materialNames: ["玻璃"],
          kind: "pbr",
          metallic: 0.5,
          roughness: 0.3,
          environmentIntensity: 1,
          directIntensity: 1,
          clearCoat: { intensity: 0, roughness: 0 },
        },
      ],
    });
  });

  it("rejects invalid stage material PBR override values", () => {
    const stage = {
      ...definition,
      kind: "stage",
    };
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: { materials: [] },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          materials: [{ materialNames: [], kind: "pbr" }],
        },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          materials: [{ materialNames: ["地板"], kind: "standard" }],
        },
      }),
    ).toThrow(/Invalid input: expected/u);
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          materials: [
            { materialNames: ["地板"], kind: "pbr", unknownKey: 1 },
          ],
        },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          materials: [{ materialNames: ["地板"], kind: "pbr", metallic: 2 }],
        },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          materials: [{ materialNames: ["地板"], kind: "pbr", roughness: -1 }],
        },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          materials: [
            {
              materialNames: ["地板"],
              kind: "pbr",
              environmentIntensity: 6,
            },
          ],
        },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          materials: [
            {
              materialNames: ["地板"],
              kind: "pbr",
              directIntensity: -1,
            },
          ],
        },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          materials: [
            {
              materialNames: ["地板"],
              kind: "pbr",
              clearCoat: { intensity: 2 },
            },
          ],
        },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          materials: [
            {
              materialNames: ["地板"],
              kind: "pbr",
              clearCoat: { roughness: 1.5 },
            },
          ],
        },
      }),
    ).toThrow();
  });

  it("applies defaults to stage environment and lighting profiles", () => {
    const parsed = ResourceManifestSchema.parse({
      ...definition,
      kind: "stage",
      render: {
        environment: {
          texturePath: "env/sky.dds",
        },
        lighting: {
          hemispheric: {},
          directional: {},
        },
      },
    });

    expect(parsed.render?.environment).toEqual({
      texturePath: "env/sky.dds",
      intensity: 1,
      rotationY: 0,
    });
    expect(parsed.render?.lighting).toEqual({
      hemispheric: {
        color: "#FFFFFF",
        groundColor: "#FFFFFF",
        intensityMultiplier: 1,
      },
      directional: {
        direction: [0.5, -1, 1],
        color: "#FFFFFF",
        intensityMultiplier: 1,
      },
    });
  });

  it("applies point light values and rejects empty point light arrays", () => {
    const parsed = ResourceManifestSchema.parse({
      ...definition,
      kind: "stage",
      render: {
        lighting: {
          pointLights: [
            {
              name: "主灯",
              position: [0, 12, -8],
              color: "#FFFFFF",
              intensity: 2,
              range: 40,
            },
          ],
        },
      },
    });

    expect(parsed.render?.lighting?.pointLights).toEqual([
      {
        name: "主灯",
        position: [0, 12, -8],
        color: "#FFFFFF",
        intensity: 2,
        range: 40,
      },
    ]);

    expect(() =>
      ResourceManifestSchema.parse({
        ...definition,
        kind: "stage",
        render: { lighting: { pointLights: [] } },
      }),
    ).toThrow();
  });

  it("rejects invalid environment and lighting profile values", () => {
    const stage = {
      ...definition,
      kind: "stage",
    };
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: { environment: { texturePath: "../env/sky.dds" } },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: { environment: { texturePath: "env/sky.dds", intensity: 6 } },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          environment: { texturePath: "env/sky.dds", rotationY: 7 },
        },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          lighting: { hemispheric: { color: "white" } },
        },
      }),
    ).toThrow(/hex color/u);
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          lighting: {
            hemispheric: { intensityMultiplier: 6 },
          },
        },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          lighting: {
            directional: { direction: [0, 1] },
          },
        },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          lighting: {
            pointLights: [
              {
                name: "灯",
                position: [0, 1, 2],
                color: "#FFFFFF",
                intensity: 200,
                range: 10,
              },
            ],
          },
        },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          lighting: {
            pointLights: [
              {
                name: "灯",
                position: [0, 1, 2],
                color: "#FFFFFF",
                intensity: 1,
                range: 0,
              },
            ],
          },
        },
      }),
    ).toThrow();
  });

  it("rejects invalid stage render profile values", () => {
    const stage = {
      ...definition,
      kind: "stage",
    };
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          reflection: { materialNames: ["地板"], textureSize: 2048 },
        },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          reflection: { materialNames: ["地板"], blurKernel: 65 },
        },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          emissive: [
            { materialNames: ["月亮"], color: "white", intensity: 1 },
          ],
        },
      }),
    ).toThrow(/hex color/u);
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          emissive: [
            { materialNames: ["月亮"], color: "#FFFFFF", intensity: 6 },
          ],
        },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: { reflection: { materialNames: [] } },
      }),
    ).toThrow();
  });

  it("applies defaults to stage environment profiles", () => {
    const parsed = ResourceManifestSchema.parse({
      ...definition,
      kind: "stage",
      render: {
        environment: {
          texturePath: "textures/env.dds",
        },
      },
    });

    expect(parsed.render?.environment).toEqual({
      texturePath: "textures/env.dds",
      intensity: 1,
      rotationY: 0,
    });
  });

  it("applies defaults to stage lighting profiles", () => {
    const parsed = ResourceManifestSchema.parse({
      ...definition,
      kind: "stage",
      render: {
        lighting: {
          hemispheric: {},
          directional: {},
        },
      },
    });

    expect(parsed.render?.lighting).toEqual({
      hemispheric: {
        color: "#FFFFFF",
        groundColor: "#FFFFFF",
        intensityMultiplier: 1,
      },
      directional: {
        direction: [0.5, -1, 1],
        color: "#FFFFFF",
        intensityMultiplier: 1,
      },
    });
  });

  it("validates stage point light entries", () => {
    const parsed = ResourceManifestSchema.parse({
      ...definition,
      kind: "stage",
      render: {
        lighting: {
          pointLights: [
            {
              name: "路灯",
              position: [1, 2, 3],
              color: "#FFCC66",
              intensity: 4,
              range: 50,
            },
          ],
        },
      },
    });

    expect(parsed.render?.lighting?.pointLights).toEqual([
      {
        name: "路灯",
        position: [1, 2, 3],
        color: "#FFCC66",
        intensity: 4,
        range: 50,
      },
    ]);
  });

  it("rejects invalid stage environment and lighting values", () => {
    const stage = {
      ...definition,
      kind: "stage",
    };
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          environment: {
            texturePath: "../outside.dds",
          },
        },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          environment: {
            texturePath: "env.dds",
            intensity: 6,
          },
        },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          environment: {
            texturePath: "env.dds",
            rotationY: 7,
          },
        },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          lighting: {
            hemispheric: { color: "white" },
          },
        },
      }),
    ).toThrow(/hex color/u);
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          lighting: {
            directional: { direction: [0, 0] },
          },
        },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          lighting: { pointLights: [] },
        },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          lighting: {
            pointLights: [
              {
                name: "灯",
                position: [0, 0, 0],
                color: "#FFFFFF",
                intensity: 101,
                range: 0.5,
              },
            ],
          },
        },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: {
          lighting: {
            pointLights: [
              {
                name: "灯",
                position: [0, 0, 0],
                color: "#FFFFFF",
                intensity: 1,
                range: 0.05,
              },
            ],
          },
        },
      }),
    ).toThrow();
  });

  it("applies defaults to stage shadow profiles", () => {
    const parsed = ResourceManifestSchema.parse({
      ...definition,
      kind: "stage",
      render: {
        shadow: {},
      },
    });

    expect(parsed.render?.shadow).toEqual({
      orthoScale: 0.1,
      bias: 0.0005,
      normalBias: 0.02,
      contactHardeningLightSizeUVRatio: 0.05,
    });
  });

  it("carries excluded caster material names in stage shadow profiles", () => {
    const parsed = ResourceManifestSchema.parse({
      ...definition,
      kind: "stage",
      render: {
        shadow: {
          excludedCasterMaterialNames: ["地板", "窗户"],
        },
      },
    });

    expect(parsed.render?.shadow).toEqual({
      orthoScale: 0.1,
      bias: 0.0005,
      normalBias: 0.02,
      contactHardeningLightSizeUVRatio: 0.05,
      excludedCasterMaterialNames: ["地板", "窗户"],
    });
  });

  it("rejects invalid stage shadow profile values", () => {
    const stage = {
      ...definition,
      kind: "stage",
    };
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: { shadow: { orthoScale: 1.5 } },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: { shadow: { bias: 0.06 } },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: { shadow: { normalBias: 1.1 } },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: { shadow: { contactHardeningLightSizeUVRatio: -0.1 } },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: { shadow: { excludedCasterMaterialNames: [] } },
      }),
    ).toThrow();
    expect(() =>
      ResourceManifestSchema.parse({
        ...stage,
        render: { shadow: { unknownKey: 1 } },
      }),
    ).toThrow(/unrecognized_keys/u);
  });

  it("accepts render profiles in catalogs only for stage resources", () => {
    const resource = {
      ...definition,
      kind: "stage",
      authors: [],
      license: null,
      categories: [],
      tags: ["miku"],
      compatibility: {
        platforms: ["web", "wallpaper-engine"],
        features: [],
      },
      visibility: "public",
      dependencies: [],
      cover: null,
      render: { reflection: { materialNames: ["地板"] } },
      artifact: {
        path: "objects/stage/example-stage.zip",
        fileName: "example-stage.zip",
        format: "zip",
        contentType: "application/zip",
        byteSize: 123,
        sha256: "b".repeat(64),
        entrypoints: { stage: "stage.pmx" },
      },
    };
    const catalog = {
      schemaVersion: 3,
      repository: { name: "Example" },
      revision: "c".repeat(64),
      resources: [resource],
    };

    expect(ResourceCatalogV3Schema.parse(catalog)).toBeDefined();
    expect(() =>
      ResourceCatalogV3Schema.parse({
        ...catalog,
        resources: [
          {
            ...resource,
            kind: "model",
            artifact: {
              ...resource.artifact,
              entrypoints: { model: "model.pmx" },
            },
          },
        ],
      }),
    ).toThrow(/only for stage resources/u);
  });

  it("carries stage render profiles through the Wallpaper Engine bundle schema", () => {
    const parsed = WallpaperEngineBundleSchema.parse({
      schemaVersion: 1,
      resources: {
        audios: [],
        models: [],
        motions: [],
        skyboxes: [],
        stages: [
          {
            id: "builtin:stage:example-stage",
            name: "Example stage",
            stagePath: "/resources/stages/example-stage/stage.pmx",
            render: {
              reflection: { materialNames: ["地板"] },
            },
          },
        ],
      },
    });

    expect(parsed.resources.stages[0]?.render?.reflection).toEqual({
      materialNames: ["地板"],
      textureSize: 512,
      strength: 0.5,
      blurKernel: 12,
      planeOffset: 0,
    });
  });

  it("rejects ambiguous or unsupported selectable entrypoints", () => {
    const variants = [
      { id: "a", name: "A", path: "a.pmx" },
      { id: "b", name: "B", path: "b.pmx" },
    ];
    expect(() =>
      ResourceManifestSchema.parse({
        ...definition,
        artifact: {
          ...definition.artifact,
          entrypoints: { model: variants },
        },
      }),
    ).toThrow(/exactly one default/u);
    expect(() =>
      ResourceManifestSchema.parse({
        ...definition,
        kind: "audio",
        artifact: {
          ...definition.artifact,
          entrypoints: {
            audio: [
              { ...variants[0], default: true },
              variants[1],
            ],
          },
        },
      }),
    ).toThrow(
      /only for model, stage, skybox, motion, and camera/u,
    );
  });

  it("accepts selectable entrypoint variants for motion and camera", () => {
    const motionVariants = [
      { id: "default", name: "Default", path: "motion.vmd", default: true },
      { id: "tda", name: "Tda式", path: "motion Tda式.vmd" },
    ];
    const cameraVariants = [
      { id: "140cm", name: "140cm", path: "camera 140cm.vmd", default: true },
      { id: "160cm", name: "160cm", path: "camera 160cm.vmd" },
    ];
    expect(
      ResourceManifestSchema.parse({
        ...definition,
        artifact: {
          ...definition.artifact,
          entrypoints: { motions: motionVariants },
        },
      }),
    ).toBeDefined();
    expect(
      ResourceManifestSchema.parse({
        ...definition,
        kind: "camera",
        artifact: {
          ...definition.artifact,
          entrypoints: { camera: cameraVariants },
        },
      }),
    ).toBeDefined();
  });
});

describe("normalizeResourceSourceUrl", () => {
  it("accepts a root URL and appends catalog.json", () => {
    expect(
      normalizeResourceSourceUrl("https://assets.example.com"),
    ).toEqual({
      baseUrl: "https://assets.example.com/",
      catalogUrl: "https://assets.example.com/catalog.json",
    });
  });

  it("accepts a subpath URL and appends catalog.json", () => {
    expect(
      normalizeResourceSourceUrl("https://assets.example.com/foo/bar/"),
    ).toEqual({
      baseUrl: "https://assets.example.com/foo/bar/",
      catalogUrl: "https://assets.example.com/foo/bar/catalog.json",
    });
  });

  it("accepts a direct catalog.json URL", () => {
    expect(
      normalizeResourceSourceUrl(
        "https://assets.example.com/foo/catalog.json",
      ),
    ).toEqual({
      baseUrl: "https://assets.example.com/foo/",
      catalogUrl: "https://assets.example.com/foo/catalog.json",
    });
  });

  it("normalizes a subpath without a trailing slash", () => {
    expect(
      normalizeResourceSourceUrl("https://assets.example.com/foo"),
    ).toEqual({
      baseUrl: "https://assets.example.com/foo/",
      catalogUrl: "https://assets.example.com/foo/catalog.json",
    });
  });

  it("rejects invalid and non-HTTP(S) protocols", () => {
    expect(() =>
      normalizeResourceSourceUrl("ftp://assets.example.com/catalog.json"),
    ).toThrow("Resource source must use HTTP or HTTPS");
    expect(() =>
      normalizeResourceSourceUrl("not-a-url"),
    ).toThrow("Invalid resource source URL");
  });

  it("rejects credentials, query strings, and fragments", () => {
    expect(() =>
      normalizeResourceSourceUrl(
        "https://user:pass@assets.example.com/catalog.json",
      ),
    ).toThrow("must not contain credentials");
    expect(() =>
      normalizeResourceSourceUrl(
        "https://assets.example.com/catalog.json?version=1",
      ),
    ).toThrow("must not contain query strings or fragments");
    expect(() =>
      normalizeResourceSourceUrl(
        "https://assets.example.com/catalog.json#section",
      ),
    ).toThrow("must not contain query strings or fragments");
  });

  it("rejects plain HTTP except for localhost/127.0.0.1/[::1]", () => {
    expect(() =>
      normalizeResourceSourceUrl("http://assets.example.com/catalog.json"),
    ).toThrow("Plain HTTP resource sources");
    expect(
      normalizeResourceSourceUrl("http://localhost/catalog.json"),
    ).toEqual({
      baseUrl: "http://localhost/",
      catalogUrl: "http://localhost/catalog.json",
    });
    expect(
      normalizeResourceSourceUrl("http://127.0.0.1/catalog.json"),
    ).toEqual({
      baseUrl: "http://127.0.0.1/",
      catalogUrl: "http://127.0.0.1/catalog.json",
    });
    expect(
      normalizeResourceSourceUrl("http://[::1]/catalog.json"),
    ).toEqual({
      baseUrl: "http://[::1]/",
      catalogUrl: "http://[::1]/catalog.json",
    });
  });
});
