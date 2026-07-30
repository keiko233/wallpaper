import { describe, expect, it } from "vitest";
import {
  ResourceCatalogSchema,
  ResourceCatalogV2Schema,
  ResourceDefinitionsSchema,
  ResourceManifestSchema,
  ResourceSiteSchema,
  WallpaperEngineBundleSchema,
  WallpaperEngineSelectionSchema,
  normalizeResourceSourceUrl,
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

  it("accepts both v1 and v2 catalogs through ResourceCatalogSchema", () => {
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
