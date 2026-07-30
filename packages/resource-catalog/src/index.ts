import { z } from "zod";

export const RESOURCE_CATALOG_SCHEMA_VERSION = 1 as const;
export const RESOURCE_CATALOG_SCHEMA_VERSION_V2 = 2 as const;
export const RESOURCE_PACKAGE_FILES_DIRECTORY = "files" as const;

export const RESOURCE_KINDS = [
  "model",
  "motion",
  "stage",
  "audio",
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

export const EntrypointsSchema = z.record(
  z.string().trim().min(1).max(64),
  z.union([
    RelativePathSchema,
    z.array(RelativePathSchema).min(1).max(100),
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
} as const;

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
  .strict();

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

export const CatalogResourceSchema = z
  .object({
    ...metadataShape,
    cover: publishedFileSchema
      .extend({
        alt: z.string().trim().max(300).nullable(),
      })
      .strict()
      .nullable(),
    artifact: publishedFileSchema
      .extend({
        fileName: z.string().trim().min(1).max(255),
        format: ArtifactFormatSchema,
        entrypoints: EntrypointsSchema,
      })
      .strict(),
  })
  .strict();

export const ResourceCatalogV1Schema = z
  .object({
    schemaVersion: z.literal(RESOURCE_CATALOG_SCHEMA_VERSION),
    revision: z.string().regex(/^[a-f0-9]{64}$/u),
    resources: z.array(CatalogResourceSchema),
  })
  .strict();

export const ResourceCatalogV2Schema = z
  .object({
    schemaVersion: z.literal(RESOURCE_CATALOG_SCHEMA_VERSION_V2),
    repository: ResourceCatalogRepositoryMetadataSchema,
    revision: z.string().regex(/^[a-f0-9]{64}$/u),
    resources: z.array(CatalogResourceSchema),
  })
  .strict();

export const ResourceCatalogSchema = z.union([
  ResourceCatalogV1Schema,
  ResourceCatalogV2Schema,
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
            })
            .strict(),
        ),
        stages: z.array(
          z
            .object({
              ...bundledResourceBaseShape,
              stagePath: bundledPublicPathSchema,
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

export type ArtifactFormat = z.infer<typeof ArtifactFormatSchema>;
export type CatalogResource = z.infer<typeof CatalogResourceSchema>;
export type ResourceCatalog = z.infer<typeof ResourceCatalogSchema>;
export type ResourceCatalogV1 = z.infer<typeof ResourceCatalogV1Schema>;
export type ResourceCatalogV2 = z.infer<typeof ResourceCatalogV2Schema>;
export type ResourceDefinition = z.infer<typeof ResourceDefinitionSchema>;
export type ResourceDefinitions = z.infer<typeof ResourceDefinitionsSchema>;
export type ResourceKind = z.infer<typeof ResourceKindSchema>;
export type ResourceManifest = z.infer<typeof ResourceManifestSchema>;
export type ResourceSite = z.infer<typeof ResourceSiteSchema>;
export type WallpaperEngineBundle = z.infer<
  typeof WallpaperEngineBundleSchema
>;
export type WallpaperEngineSelection = z.infer<
  typeof WallpaperEngineSelectionSchema
>;
