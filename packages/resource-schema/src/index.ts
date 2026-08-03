import { z } from "zod";

export const RESOURCE_CATALOG_SCHEMA_VERSION = 1 as const;
export const RESOURCE_CATALOG_SCHEMA_VERSION_V2 = 2 as const;
export const RESOURCE_CATALOG_SCHEMA_VERSION_V3 = 3 as const;
export const RESOURCE_PACKAGE_FILES_DIRECTORY = "files" as const;

export const RESOURCE_KINDS = [
  "model",
  "motion",
  "stage",
  "skybox",
  "audio",
  "camera",
  "video",
] as const;

export const ARTIFACT_FORMATS = ["raw", "zip"] as const;

export const RESOURCE_PLATFORMS = [
  "web",
  "wallpaper-engine",
] as const;

export const RelativePathSchema = z
  .string()
  .trim()
  .min(1)
  .max(1_024)
  .refine(
    (value) => {
      const normalized = value.replaceAll("\\", "/");
      return (
        normalized === value &&
        !normalized.startsWith("/") &&
        !/^[a-z]:\//iu.test(normalized) &&
        !normalized.includes("\0") &&
        normalized
          .split("/")
          .every(
            (segment) =>
              segment.length > 0 && segment !== "." && segment !== "..",
          )
      );
    },
    { message: "Expected a safe POSIX path relative to the resource root." },
  );

export const ResourceIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u);

export const SemanticVersionSchema = z
  .string()
  .trim()
  .regex(
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/u,
    "Expected a semantic version.",
  );

export const ResourceKindSchema = z.enum(RESOURCE_KINDS);
export const ArtifactFormatSchema = z.enum(ARTIFACT_FORMATS);
export const ResourcePlatformSchema = z.enum(RESOURCE_PLATFORMS);

export const ResourceVisibilitySchema = z.enum(["public", "dependency-only"]);

export const ResourceDependencySchema = z
  .object({
    id: ResourceIdSchema,
    version: SemanticVersionSchema,
    binding: z.string().trim().min(1).max(64),
  })
  .strict();

const stageHexColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-f]{6}$/iu, "Expected a #RRGGBB hex color.");

const stageMaterialNamesSchema = z
  .array(z.string().trim().min(1).max(256))
  .min(1)
  .max(32);

const stageVec3Schema = z.tuple([z.number(), z.number(), z.number()]);

const stageEnvironmentSchema = z
  .object({
    texturePath: RelativePathSchema,
    intensity: z.number().min(0).max(5).default(1),
    rotationY: z.number().min(-6.2832).max(6.2832).default(0),
  })
  .strict();

const stageHemisphericLightingSchema = z
  .object({
    color: stageHexColorSchema.default("#FFFFFF"),
    groundColor: stageHexColorSchema.default("#FFFFFF"),
    intensityMultiplier: z.number().min(0).max(5).default(1),
  })
  .strict();

const stageDirectionalLightingSchema = z
  .object({
    direction: stageVec3Schema.default([0.5, -1, 1]),
    color: stageHexColorSchema.default("#FFFFFF"),
    intensityMultiplier: z.number().min(0).max(5).default(1),
  })
  .strict();

const stagePointLightSchema = z
  .object({
    name: z.string().trim().min(1).max(64),
    position: stageVec3Schema,
    color: stageHexColorSchema,
    intensity: z.number().min(0).max(100),
    range: z.number().min(0.1).max(1_000),
  })
  .strict();

const stageLightingSchema = z
  .object({
    hemispheric: stageHemisphericLightingSchema.optional(),
    directional: stageDirectionalLightingSchema.optional(),
    pointLights: z
      .array(stagePointLightSchema)
      .min(1)
      .max(8)
      .optional(),
  })
  .strict();

const stageMaterialPbrSchema = z
  .object({
    materialNames: stageMaterialNamesSchema,
    kind: z.literal("pbr"),
    metallic: z.number().min(0).max(1).default(0),
    roughness: z.number().min(0).max(1).default(0.7),
    environmentIntensity: z.number().min(0).max(5).default(1),
    directIntensity: z.number().min(0).max(5).default(1),
    clearCoat: z
      .object({
        intensity: z.number().min(0).max(1).default(0),
        roughness: z.number().min(0).max(1).default(0),
      })
      .strict()
      .optional(),
  })
  .strict();

/**
 * Optional native render profile carried by stage resources. The player uses
 * it to approximate a stage author's intended look (reflective floors,
 * emissive glow, bloom tuning) with Babylon-native effects.
 */
export const StageRenderProfileSchema = z
  .object({
    materials: z.array(stageMaterialPbrSchema).min(1).max(32).optional(),
    reflection: z
      .object({
        materialNames: stageMaterialNamesSchema,
        textureSize: z.number().int().min(128).max(1_024).default(512),
        strength: z.number().min(0).max(1).default(0.5),
        blurKernel: z.number().int().min(0).max(64).default(12),
        planeOffset: z.number().min(-5).max(5).default(0),
      })
      .strict()
      .optional(),
    emissive: z
      .array(
        z
          .object({
            materialNames: stageMaterialNamesSchema,
            color: stageHexColorSchema,
            intensity: z.number().min(0).max(5).default(1),
          })
          .strict(),
      )
      .min(1)
      .max(8)
      .optional(),
    bloom: z
      .object({
        intensityMultiplier: z.number().min(0).max(5).default(1),
        thresholdOffset: z.number().min(-1).max(1).default(0),
      })
      .strict()
      .optional(),
    environment: stageEnvironmentSchema.optional(),
    lighting: stageLightingSchema.optional(),
  })
  .strict();

export const LegacyEntrypointsSchema = z.record(
  z.string().trim().min(1).max(64),
  z.union([
    RelativePathSchema,
    z.array(RelativePathSchema).min(1).max(100),
  ]),
);

export const ArtifactEntrypointVariantSchema = z
  .object({
    id: z
      .string()
      .trim()
      .min(1)
      .max(64)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u),
    name: z.string().trim().min(1).max(160),
    path: z.union([
      RelativePathSchema,
      z.array(RelativePathSchema).min(1).max(100),
    ]),
    default: z.boolean().optional(),
    remark: z.string().trim().max(4_000).optional(),
  })
  .strict();

const ArtifactEntrypointVariantsSchema = z
  .array(ArtifactEntrypointVariantSchema)
  .min(2)
  .max(100)
  .superRefine((variants, context) => {
    const ids = new Set<string>();
    let defaultCount = 0;
    for (const [index, variant] of variants.entries()) {
      if (ids.has(variant.id)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate entrypoint variant ID: ${variant.id}`,
          path: [index, "id"],
        });
      }
      ids.add(variant.id);
      if (variant.default === true) defaultCount += 1;
    }
    if (defaultCount !== 1) {
      context.addIssue({
        code: "custom",
        message: "Entrypoint variants must contain exactly one default.",
        path: [],
      });
    }
  });

export const EntrypointsSchema = z.record(
  z.string().trim().min(1).max(64),
  z.union([
    RelativePathSchema,
    z.array(RelativePathSchema).min(1).max(100),
    ArtifactEntrypointVariantsSchema,
  ]),
);

const webUrlSchema = z
  .url()
  .refine((value) => /^https?:\/\//u.test(value), {
    message: "Expected an HTTP or HTTPS URL.",
  });

const authorSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    url: webUrlSchema.nullable().default(null),
  })
  .strict();

const licenseSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    url: webUrlSchema.nullable().default(null),
    attribution: z.string().trim().max(2_000).nullable().default(null),
  })
  .strict();

const compatibilitySchema = z
  .object({
    platforms: z
      .array(ResourcePlatformSchema)
      .min(1)
      .max(RESOURCE_PLATFORMS.length)
      .default([...RESOURCE_PLATFORMS]),
    features: z
      .array(z.string().trim().min(1).max(64))
      .max(30)
      .default([]),
  })
  .strict()
  .default({
    platforms: [...RESOURCE_PLATFORMS],
    features: [],
  });

export const ResourceCatalogRepositoryMetadataSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    description: z.string().trim().max(4_000).nullable().default(null),
    homepage: webUrlSchema.nullable().default(null),
  })
  .strict();

const metadataShape = {
  id: ResourceIdSchema,
  version: SemanticVersionSchema,
  kind: ResourceKindSchema,
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(4_000).nullable().default(null),
  authors: z.array(authorSchema).max(30).default([]),
  license: licenseSchema.nullable().default(null),
  categories: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(64)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u),
    )
    .max(20)
    .default([]),
  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(64)
        .transform((value) => value.toLowerCase()),
    )
    .max(50)
    .default([]),
  compatibility: compatibilitySchema,
  visibility: ResourceVisibilitySchema.default("public"),
  dependencies: z.array(ResourceDependencySchema).max(50).default([]),
  render: StageRenderProfileSchema.optional(),
} as const;

function validateStageRenderProfile(
  value: {
    kind: z.infer<typeof ResourceKindSchema>;
    render?: z.infer<typeof StageRenderProfileSchema>;
  },
  context: z.RefinementCtx,
): void {
  if (value.kind !== "stage" && value.render !== undefined) {
    context.addIssue({
      code: "custom",
      message: "Stage render profiles are supported only for stage resources.",
      path: ["render"],
    });
  }
}

function validateEntrypointVariantKinds(
  value: {
    kind: z.infer<typeof ResourceKindSchema>;
    artifact: { entrypoints: z.infer<typeof EntrypointsSchema> };
  },
  context: z.RefinementCtx,
): void {
  for (const [key, entrypoint] of Object.entries(
    value.artifact.entrypoints,
  )) {
    const first = Array.isArray(entrypoint) ? entrypoint[0] : undefined;
    if (
      typeof first === "object" &&
      value.kind !== "model" &&
      value.kind !== "stage" &&
      value.kind !== "skybox"
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Selectable entrypoint variants are currently supported only for model, stage, and skybox resources.",
        path: ["artifact", "entrypoints", key],
      });
      continue;
    }
    if (typeof first === "object") {
      for (const [index, variant] of (
        entrypoint as ArtifactEntrypointVariant[]
      ).entries()) {
        if (Array.isArray(variant.path)) {
          context.addIssue({
            code: "custom",
            message:
              "Selectable model, stage, and skybox entrypoints must contain exactly one path.",
            path: ["artifact", "entrypoints", key, index, "path"],
          });
        }
      }
    }
  }
}

export const ResourceDefinitionSchema = z
  .object({
    ...metadataShape,
    cover: z
      .object({
        source: RelativePathSchema,
        alt: z.string().trim().max(300).nullable().default(null),
      })
      .strict()
      .nullable()
      .default(null),
    artifact: z
      .object({
        sources: z.array(RelativePathSchema).min(1).max(1_000).optional(),
        fileName: z.string().trim().min(1).max(255),
        format: ArtifactFormatSchema,
        contentType: z.string().trim().min(1).max(255).optional(),
        entrypoints: EntrypointsSchema,
      })
      .strict(),
  })
  .strict()
  .superRefine(validateEntrypointVariantKinds)
  .superRefine(validateStageRenderProfile);

export const ResourceDefinitionsSchema = z
  .object({
    schemaVersion: z.literal(RESOURCE_CATALOG_SCHEMA_VERSION),
    resources: z.array(ResourceDefinitionSchema).min(1),
  })
  .strict()
  .superRefine((value, context) => {
    const identities = new Set<string>();
    for (const [index, resource] of value.resources.entries()) {
      const identity = `${resource.id}@${resource.version}`;
      if (identities.has(identity)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate resource version: ${identity}`,
          path: ["resources", index],
        });
      }
      identities.add(identity);
    }
  });

const publishedFileSchema = z
  .object({
    path: RelativePathSchema,
    contentType: z.string().trim().min(1).max(255),
    byteSize: z.number().int().nonnegative(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/u),
  })
  .strict();

const catalogResourceShape = {
  ...metadataShape,
  cover: publishedFileSchema
    .extend({
      alt: z.string().trim().max(300).nullable(),
    })
    .strict()
    .nullable(),
} as const;

export const CatalogResourceSchema = z
  .object({
    ...catalogResourceShape,
    artifact: publishedFileSchema
      .extend({
        fileName: z.string().trim().min(1).max(255),
        format: ArtifactFormatSchema,
        entrypoints: EntrypointsSchema,
      })
      .strict(),
  })
  .strict()
  .superRefine(validateEntrypointVariantKinds)
  .superRefine(validateStageRenderProfile);

function validateLegacyCatalogEntrypoints(
  value: { resources: readonly z.infer<typeof CatalogResourceSchema>[] },
  context: z.RefinementCtx,
): void {
  for (const [resourceIndex, resource] of value.resources.entries()) {
    for (const [key, entrypoint] of Object.entries(
      resource.artifact.entrypoints,
    )) {
      const first = Array.isArray(entrypoint) ? entrypoint[0] : undefined;
      if (typeof first === "object") {
        context.addIssue({
          code: "custom",
          message:
            "Selectable entrypoint variants require resource catalog schemaVersion 3.",
          path: [
            "resources",
            resourceIndex,
            "artifact",
            "entrypoints",
            key,
          ],
        });
      }
    }
  }
}

export const ResourceCatalogV1Schema = z
  .object({
    schemaVersion: z.literal(RESOURCE_CATALOG_SCHEMA_VERSION),
    revision: z.string().regex(/^[a-f0-9]{64}$/u),
    resources: z.array(CatalogResourceSchema),
  })
  .strict()
  .superRefine(validateLegacyCatalogEntrypoints)
  .superRefine(validateCatalogDependencyGraph);

export const ResourceCatalogV2Schema = z
  .object({
    schemaVersion: z.literal(RESOURCE_CATALOG_SCHEMA_VERSION_V2),
    repository: ResourceCatalogRepositoryMetadataSchema,
    revision: z.string().regex(/^[a-f0-9]{64}$/u),
    resources: z.array(CatalogResourceSchema),
  })
  .strict()
  .superRefine(validateLegacyCatalogEntrypoints)
  .superRefine(validateCatalogDependencyGraph);

export const ResourceCatalogV3Schema = z
  .object({
    schemaVersion: z.literal(RESOURCE_CATALOG_SCHEMA_VERSION_V3),
    repository: ResourceCatalogRepositoryMetadataSchema,
    revision: z.string().regex(/^[a-f0-9]{64}$/u),
    resources: z.array(CatalogResourceSchema),
  })
  .strict()
  .superRefine(validateCatalogDependencyGraph);

export const ResourceCatalogSchema = z.union([
  ResourceCatalogV1Schema,
  ResourceCatalogV2Schema,
  ResourceCatalogV3Schema,
]);

export const ResourceManifestSchema = ResourceDefinitionSchema;

export const ResourceSiteSchema = z
  .object({
    schemaVersion: z.literal(RESOURCE_CATALOG_SCHEMA_VERSION),
    repository: ResourceCatalogRepositoryMetadataSchema,
    manifestRoot: RelativePathSchema,
    outputDirectory: RelativePathSchema,
    wallpaperEngine: z
      .object({
        runtimeIdOverrides: z
          .record(z.string(), z.string().trim().min(1).max(200))
          .default({}),
      })
      .strict()
      .default({ runtimeIdOverrides: {} }),
  })
  .strict();

const runtimeIdSchema = z.string().trim().min(1).max(200);
const bundledPublicPathSchema = z
  .string()
  .trim()
  .startsWith("/resources/")
  .refine((value) => !value.includes("\\") && !value.includes("\0"));

export const WallpaperEngineSelectionSchema = z
  .object({
    schemaVersion: z.literal(RESOURCE_CATALOG_SCHEMA_VERSION),
    resources: z
      .array(
        z
          .object({
            id: ResourceIdSchema,
            version: SemanticVersionSchema,
            runtimeId: runtimeIdSchema,
          })
          .strict(),
      )
      .min(1),
  })
  .strict()
  .superRefine((value, context) => {
    const resourceIds = new Set<string>();
    const runtimeIds = new Set<string>();
    for (const [index, resource] of value.resources.entries()) {
      if (resourceIds.has(resource.id)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate Wallpaper Engine resource: ${resource.id}`,
          path: ["resources", index, "id"],
        });
      }
      if (runtimeIds.has(resource.runtimeId)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate Wallpaper Engine runtime ID: ${resource.runtimeId}`,
          path: ["resources", index, "runtimeId"],
        });
      }
      resourceIds.add(resource.id);
      runtimeIds.add(resource.runtimeId);
    }
  });

const bundledResourceBaseShape = {
  id: runtimeIdSchema,
  name: z.string().trim().min(1).max(160),
  remark: z.string().max(4_000).optional(),
} as const;

export const WallpaperEngineBundleSchema = z
  .object({
    schemaVersion: z.literal(RESOURCE_CATALOG_SCHEMA_VERSION),
    resources: z
      .object({
        audios: z.array(
          z
            .object({
              ...bundledResourceBaseShape,
              audioPath: bundledPublicPathSchema,
            })
            .strict(),
        ),
        models: z.array(
          z
            .object({
              ...bundledResourceBaseShape,
              modelPath: bundledPublicPathSchema,
            })
            .strict(),
        ),
        motions: z.array(
          z
            .object({
              ...bundledResourceBaseShape,
              motionPath: z.array(bundledPublicPathSchema).min(1),
              audioPath: bundledPublicPathSchema,
              cameraPath: bundledPublicPathSchema.optional(),
            })
            .strict(),
        ),
        stages: z.array(
          z
            .object({
              ...bundledResourceBaseShape,
              stagePath: bundledPublicPathSchema,
              render: StageRenderProfileSchema.optional(),
            })
            .strict(),
        ),
        skyboxes: z.array(
          z
            .object({
              ...bundledResourceBaseShape,
              skyboxPath: bundledPublicPathSchema,
            })
            .strict(),
        ),
      })
      .strict(),
  })
  .strict();

export interface NormalizedResourceSourceUrl {
  baseUrl: string;
  catalogUrl: string;
}

const LOCAL_HTTP_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "[::1]",
]);

export function normalizeResourceSourceUrl(
  rawUrl: string,
): NormalizedResourceSourceUrl {
  const trimmed = rawUrl.trim();
  if (trimmed.length === 0) {
    throw new Error("Resource source URL is required.");
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(`Invalid resource source URL: ${rawUrl}`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Resource source must use HTTP or HTTPS.");
  }

  if (
    url.protocol === "http:" &&
    !LOCAL_HTTP_HOSTNAMES.has(url.hostname)
  ) {
    throw new Error(
      "Plain HTTP resource sources are only allowed on localhost, 127.0.0.1, or [::1].",
    );
  }

  if (url.username !== "" || url.password !== "") {
    throw new Error("Resource source URL must not contain credentials.");
  }

  if (url.search !== "" || url.hash !== "") {
    throw new Error(
      "Resource source URL must not contain query strings or fragments.",
    );
  }

  const lowerPathname = url.pathname.toLowerCase();
  const isDirectCatalog = lowerPathname.endsWith("/catalog.json");

  let basePathname: string;
  if (isDirectCatalog) {
    basePathname = url.pathname.slice(0, -"catalog.json".length);
  } else if (url.pathname.endsWith("/")) {
    basePathname = url.pathname;
  } else {
    basePathname = `${url.pathname}/`;
  }

  const baseUrl = new URL(basePathname, url.origin).href;
  const catalogUrl = new URL("catalog.json", baseUrl).href;

  return { baseUrl, catalogUrl };
}

export function resolveCatalogAssetUrl(
  catalogUrl: string | URL,
  assetPath: string,
): URL {
  const path = RelativePathSchema.parse(assetPath);
  return new URL(path, new URL(catalogUrl));
}

export type ResourceIdentity = string;

export function resourceIdentity(
  id: string,
  version: string,
): ResourceIdentity {
  return `${id}@${version}`;
}

export interface ResolvedArtifactEntrypoint {
  id: string | null;
  name: string | null;
  paths: string[];
  isDefault: boolean;
  remark?: string;
}

export function resolveArtifactEntrypoints(
  entrypoints: z.infer<typeof EntrypointsSchema>,
  keys: readonly string[],
): ResolvedArtifactEntrypoint[] {
  for (const key of keys) {
    const value = entrypoints[key];
    if (typeof value === "string") {
      return [
        {
          id: null,
          name: null,
          paths: [value],
          isDefault: true,
        },
      ];
    }
    if (!Array.isArray(value) || value.length === 0) continue;
    if (typeof value[0] === "string") {
      return [
        {
          id: null,
          name: null,
          paths: value as string[],
          isDefault: true,
        },
      ];
    }
    return (value as ArtifactEntrypointVariant[]).map((variant) => ({
      id: variant.id,
      name: variant.name,
      paths:
        typeof variant.path === "string" ? [variant.path] : variant.path,
      isDefault: variant.default === true,
      ...(variant.remark === undefined ? {} : { remark: variant.remark }),
    }));
  }
  return [];
}

export interface DependencyGraphNode {
  id: string;
  version: string;
  kind: ResourceKind;
  dependencies: readonly ResourceDependency[];
}

function buildIdentityMap(
  nodes: readonly DependencyGraphNode[],
): Map<ResourceIdentity, DependencyGraphNode> {
  const byIdentity = new Map<ResourceIdentity, DependencyGraphNode>();
  for (const node of nodes) {
    const identity = resourceIdentity(node.id, node.version);
    if (byIdentity.has(identity)) {
      throw new Error(`Duplicate resource identity: ${identity}`);
    }
    byIdentity.set(identity, node);
  }
  return byIdentity;
}

function validateDirectEdges(
  byIdentity: ReadonlyMap<ResourceIdentity, DependencyGraphNode>,
): void {
  for (const [parentIdentity, node] of byIdentity) {
    const bindings = new Set<string>();
    for (const dependency of node.dependencies) {
      const dependencyIdentity = resourceIdentity(
        dependency.id,
        dependency.version,
      );
      const target = byIdentity.get(dependencyIdentity);
      if (target === undefined) {
        throw new Error(
          `Dependency target not found for ${parentIdentity}: ${dependencyIdentity}`,
        );
      }

      if (bindings.has(dependency.binding)) {
        throw new Error(
          `Duplicate dependency binding "${dependency.binding}" for ${parentIdentity}`,
        );
      }
      bindings.add(dependency.binding);

      const expectedKind =
        dependency.binding === "audio"
          ? "audio"
          : dependency.binding === "camera"
            ? "camera"
            : undefined;
      if (
        expectedKind !== undefined &&
        target.kind !== expectedKind
      ) {
        throw new Error(
          `Dependency ${dependencyIdentity} has kind "${target.kind}" but binding "${dependency.binding}" requires "${expectedKind}" for ${parentIdentity}`,
        );
      }
    }
  }
}

function detectCycles(
  byIdentity: ReadonlyMap<ResourceIdentity, DependencyGraphNode>,
  roots: Iterable<ResourceIdentity>,
): void {
  const visiting = new Set<ResourceIdentity>();
  const visited = new Set<ResourceIdentity>();
  function visit(identity: ResourceIdentity, path: ResourceIdentity[]): void {
    if (visiting.has(identity)) {
      const cycle = path.slice(path.indexOf(identity)).concat(identity);
      throw new Error(
        `Cyclic dependency detected: ${cycle.join(" -> ")}`,
      );
    }
    if (visited.has(identity)) return;
    const node = byIdentity.get(identity);
    if (node === undefined) return;

    visiting.add(identity);
    path.push(identity);
    for (const dependency of node.dependencies) {
      visit(resourceIdentity(dependency.id, dependency.version), path);
    }
    path.pop();
    visiting.delete(identity);
    visited.add(identity);
  }

  for (const identity of roots) {
    if (!visited.has(identity)) {
      visit(identity, []);
    }
  }
}

export function validateDependencyGraph(
  nodes: readonly DependencyGraphNode[],
): void {
  const byIdentity = buildIdentityMap(nodes);
  validateDirectEdges(byIdentity);
  detectCycles(byIdentity, byIdentity.keys());
}

export function dependencyClosure(
  nodes: readonly DependencyGraphNode[],
  rootIdentity: ResourceIdentity,
): DependencyGraphNode[] {
  const byIdentity = buildIdentityMap(nodes);
  validateDirectEdges(byIdentity);

  const visiting = new Set<ResourceIdentity>();
  const visited = new Set<ResourceIdentity>();
  const order: DependencyGraphNode[] = [];
  function visit(identity: ResourceIdentity, path: ResourceIdentity[]): void {
    if (visiting.has(identity)) {
      const cycle = path.slice(path.indexOf(identity)).concat(identity);
      throw new Error(
        `Cyclic dependency detected: ${cycle.join(" -> ")}`,
      );
    }
    if (visited.has(identity)) return;

    const node = byIdentity.get(identity);
    if (node === undefined) {
      throw new Error(
        `Dependency target not found: ${identity} required by ${path[path.length - 1] ?? rootIdentity}`,
      );
    }

    visiting.add(identity);
    path.push(identity);
    for (const dependency of node.dependencies) {
      visit(resourceIdentity(dependency.id, dependency.version), path);
    }
    path.pop();
    visiting.delete(identity);
    visited.add(identity);
    order.push(node);
  }

  visit(rootIdentity, []);
  return order;
}

function validateCatalogDependencyGraph(
  value: { resources: readonly DependencyGraphNode[] },
  context: z.RefinementCtx,
): void {
  try {
    validateDependencyGraph(value.resources);
  } catch (error) {
    context.addIssue({
      code: "custom",
      message: error instanceof Error ? error.message : String(error),
      path: ["resources"],
    });
  }
}

export type ArtifactFormat = z.infer<typeof ArtifactFormatSchema>;
export type ArtifactEntrypoints = z.infer<typeof EntrypointsSchema>;
export type ArtifactEntrypointVariant = z.infer<
  typeof ArtifactEntrypointVariantSchema
>;
export type CatalogResource = z.infer<typeof CatalogResourceSchema>;
export type ResourceCatalog = z.infer<typeof ResourceCatalogSchema>;
export type ResourceCatalogV1 = z.infer<typeof ResourceCatalogV1Schema>;
export type ResourceCatalogV2 = z.infer<typeof ResourceCatalogV2Schema>;
export type ResourceCatalogV3 = z.infer<typeof ResourceCatalogV3Schema>;
export type ResourceDefinition = z.infer<typeof ResourceDefinitionSchema>;
export type ResourceDefinitions = z.infer<typeof ResourceDefinitionsSchema>;
export type ResourceKind = z.infer<typeof ResourceKindSchema>;
export type ResourceManifest = z.infer<typeof ResourceManifestSchema>;
export type ResourceSite = z.infer<typeof ResourceSiteSchema>;
export type ResourceVisibility = z.infer<typeof ResourceVisibilitySchema>;
export type ResourceDependency = z.infer<typeof ResourceDependencySchema>;
export type StageRenderProfile = z.infer<typeof StageRenderProfileSchema>;
export type WallpaperEngineBundle = z.infer<
  typeof WallpaperEngineBundleSchema
>;
export type WallpaperEngineSelection = z.infer<
  typeof WallpaperEngineSelectionSchema
>;
