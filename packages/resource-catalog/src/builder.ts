import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { createReadStream } from "node:fs";
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import {
  basename,
  dirname,
  extname,
  relative,
  resolve,
  sep,
} from "node:path";
import {
  BlobWriter,
  Uint8ArrayReader,
  ZipWriter,
  configure,
} from "@zip.js/zip.js";
import {
  ResourceCatalogV3Schema,
  ResourceManifestSchema,
  RESOURCE_PACKAGE_FILES_DIRECTORY,
  ResourceSiteSchema,
  WallpaperEngineBundleSchema,
  resolveArtifactEntrypoints,
  validateDependencyGraph,
  type CatalogResource,
  type ResourceDefinition,
  type ResolvedArtifactEntrypoint,
  type ResourceSite,
  type WallpaperEngineBundle,
} from "@wallpaper/resource-schema";

configure({ useWebWorkers: false });

const IMMUTABLE_CACHE_CONTROL =
  "public, max-age=31536000, immutable";
const CATALOG_CACHE_CONTROL =
  "public, max-age=300, stale-while-revalidate=86400";
export const ZIP_ENTRY_DATE = new Date("1980-01-01T00:00:00.000Z");
const IGNORED_FILESYSTEM_ENTRIES = new Set([".DS_Store", ".git"]);

export function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(
        ([key, entry]) =>
          `${JSON.stringify(key)}:${stableJson(entry)}`,
      )
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function sha256File(path: string): Promise<string> {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
}

export function normalizeRelativePath(root: string, path: string): string {
  return relative(root, path).split(sep).join("/");
}

export function resolveR2BucketName(
  bucketOverride: string | undefined,
  envValue: string | undefined,
): string {
  const bucket = (bucketOverride ?? envValue ?? "").trim();
  if (bucket.length === 0) {
    throw new Error(
      "Missing required R2 bucket name. Provide it with --bucket <name> or set R2_BUCKET_NAME.",
    );
  }
  if (
    bucket.length < 3 ||
    bucket.length > 63 ||
    !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/u.test(bucket)
  ) {
    throw new Error(
      `Invalid R2 bucket name: ${bucket}. Use 3-63 lowercase letters, numbers, or hyphens, starting and ending with a letter or number.`,
    );
  }
  return bucket;
}

export function normalizeR2Prefix(prefix: string | undefined): string {
  const input = prefix?.trim();
  if (input === undefined || input.length === 0) {
    return "";
  }

  if (input.includes("\\")) {
    throw new Error(`R2 prefix must not contain backslashes: ${input}`);
  }
  if (input.includes("?") || input.includes("#")) {
    throw new Error(
      `R2 prefix must not contain query or fragment characters: ${input}`,
    );
  }
  if (
    input.split("").some((character) => {
      const code = character.charCodeAt(0);
      return code <= 0x1F || code === 0x7F;
    })
  ) {
    throw new Error(`R2 prefix must not contain control characters: ${input}`);
  }

  const stripped = input.replace(/^\/+/, "").replace(/\/+$/, "");
  if (stripped.length === 0) {
    return "";
  }

  const segments = stripped.split("/");
  for (const segment of segments) {
    if (segment.length === 0) {
      throw new Error(
        `R2 prefix must not contain empty path segments: ${input}`,
      );
    }
    if (segment === "." || segment === "..") {
      throw new Error(
        `R2 prefix must not contain relative path segments: ${input}`,
      );
    }
  }

  return segments.join("/");
}

export function r2ObjectKey(
  prefix: string | undefined,
  relativePath: string,
): string {
  const normalizedPrefix = normalizeR2Prefix(prefix);
  const normalizedPath = relativePath.replaceAll("\\", "/");
  const segments = normalizedPath.split("/");
  if (
    normalizedPath.length === 0 ||
    normalizedPath.startsWith("/") ||
    segments.some(
      (segment) =>
        segment.length === 0 || segment === "." || segment === "..",
    )
  ) {
    throw new Error(`Invalid relative R2 object path: ${relativePath}`);
  }
  if (normalizedPrefix.length === 0) {
    return normalizedPath;
  }
  return `${normalizedPrefix}/${normalizedPath}`;
}

export function resolveBelow(root: string, path: string): string {
  const resolvedRoot = resolve(root);
  const resolvedPath = resolve(resolvedRoot, path);
  if (
    resolvedPath !== resolvedRoot &&
    !resolvedPath.startsWith(`${resolvedRoot}${sep}`)
  ) {
    throw new Error(`Path escapes ${resolvedRoot}: ${path}`);
  }
  return resolvedPath;
}

function pathContainsSegment(path: string, segment: string): boolean {
  return path.replaceAll("\\", "/").split("/").includes(segment);
}

function pathsOverlap(left: string, right: string): boolean {
  const resolvedLeft = resolve(left);
  const resolvedRight = resolve(right);
  return (
    resolvedLeft === resolvedRight ||
    resolvedLeft.startsWith(`${resolvedRight}${sep}`) ||
    resolvedRight.startsWith(`${resolvedLeft}${sep}`)
  );
}

export function resolveOutputRoot(
  loaded: LoadedSite,
  outputDirectory: string,
): string {
  const outputRoot = resolve(loaded.siteDir, outputDirectory);
  for (const protectedPath of [loaded.manifestDir]) {
    if (pathsOverlap(outputRoot, protectedPath)) {
      throw new Error(
        `Output directory must not overlap source directory ${protectedPath}: ${outputRoot}`,
      );
    }
  }
  return outputRoot;
}

export function contentType(path: string): string {
  switch (extname(path).toLowerCase()) {
    case ".bmp":
      return "image/bmp";
    case ".gif":
      return "image/gif";
    case ".jpeg":
    case ".jpg":
      return "image/jpeg";
    case ".json":
      return "application/json; charset=utf-8";
    case ".mp3":
      return "audio/mpeg";
    case ".mp4":
      return "video/mp4";
    case ".ogg":
      return "audio/ogg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".wav":
      return "audio/wav";
    case ".zip":
      return "application/zip";
    default:
      return "application/octet-stream";
  }
}

export async function listFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, {
    withFileTypes: true,
  })) {
    if (IGNORED_FILESYSTEM_ENTRIES.has(entry.name)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(path)));
    } else if (entry.isFile()) {
      files.push(path);
    }
  }
  return files.sort();
}

export async function sourceFiles(
  definition: ResourceDefinition,
  resourceDirectory: string,
): Promise<{ root: string; files: string[] }> {
  const root = resolveBelow(
    resourceDirectory,
    RESOURCE_PACKAGE_FILES_DIRECTORY,
  );
  let rootStats;
  try {
    rootStats = await stat(root);
  } catch (error) {
    throw new Error(
      `Missing or unreadable files directory for ${definition.id}: ${root}`,
      { cause: error },
    );
  }
  if (!rootStats.isDirectory()) {
    throw new Error(
      `Resource files path is not a directory for ${definition.id}: ${root}`,
    );
  }

  if (definition.artifact.sources === undefined) {
    return { root, files: await listFiles(root) };
  }

  const files: string[] = [];
  for (const source of definition.artifact.sources) {
    const path = resolveBelow(root, source);
    const sourceStats = await stat(path);
    if (sourceStats.isDirectory()) {
      files.push(...(await listFiles(path)));
    } else if (sourceStats.isFile()) {
      files.push(path);
    } else {
      throw new Error(`Unsupported artifact source: ${path}`);
    }
  }
  return { root, files: [...new Set(files)].sort() };
}

export function entrypointPaths(
  definition: ResourceDefinition,
): string[] {
  return Object.keys(definition.artifact.entrypoints).flatMap((key) =>
    resolveArtifactEntrypoints(definition.artifact.entrypoints, [key]).flatMap(
      (entrypoint) => entrypoint.paths,
    ),
  );
}

export function validateEntrypoints(
  definition: ResourceDefinition,
  root: string,
  files: string[],
): void {
  const available = new Set(
    files.map((file) => normalizeRelativePath(root, file)),
  );
  for (const entrypoint of entrypointPaths(definition)) {
    if (!available.has(entrypoint)) {
      throw new Error(
        `Artifact entrypoint does not exist for ${definition.id}: ${entrypoint}`,
      );
    }
  }
}

export function validateArtifactFiles(
  definition: ResourceDefinition,
  root: string,
  files: string[],
): void {
  if (basename(definition.artifact.fileName) !== definition.artifact.fileName) {
    throw new Error(
      `Artifact fileName must not contain directories: ${definition.artifact.fileName}`,
    );
  }
  const referencedPaths = [
    ...(definition.artifact.sources ?? []),
    ...entrypointPaths(definition),
  ];
  if (
    referencedPaths.some((path) =>
      pathContainsSegment(path, "legacy-assets")
    ) ||
    files.some((file) =>
      pathContainsSegment(normalizeRelativePath(root, file), "legacy-assets")
    )
  ) {
    throw new Error(
      `legacy-assets is not supported: ${definition.id}`,
    );
  }
  if (files.length === 0) {
    throw new Error(`Artifact has no source files: ${definition.id}`);
  }
  if (
    definition.artifact.fileName.toLowerCase().endsWith(".bpmx") ||
    files.some((file) => file.toLowerCase().endsWith(".bpmx"))
  ) {
    throw new Error(`BPMX is not supported: ${definition.id}`);
  }
  validateEntrypoints(definition, root, files);
  if (definition.artifact.format === "raw" && files.length !== 1) {
    throw new Error(
      `Raw artifact must contain exactly one file: ${definition.id}`,
    );
  }
}

export async function writeZip(
  root: string,
  files: string[],
  outputPath: string,
): Promise<void> {
  const writer = new ZipWriter(
    new BlobWriter("application/zip"),
  );
  for (const file of files) {
    await writer.add(
      normalizeRelativePath(root, file),
      new Uint8ArrayReader(await readFile(file)),
      { lastModDate: ZIP_ENTRY_DATE, level: 0 },
    );
  }
  const blob = await writer.close();
  await writeFile(
    outputPath,
    new Uint8Array(await blob.arrayBuffer()),
  );
}

export function objectPath(
  definition: ResourceDefinition,
  hash: string,
  fileName: string,
): string {
  return [
    "objects",
    definition.kind,
    definition.id,
    definition.version,
    hash,
    fileName,
  ].join("/");
}

export interface BuildPaths {
  outputRoot: string;
  temporaryRoot: string;
  resourceDirectory: string;
}

export async function buildArtifact(
  definition: ResourceDefinition,
  paths: BuildPaths,
): Promise<CatalogResource["artifact"]> {
  const { root, files } = await sourceFiles(
    definition,
    paths.resourceDirectory,
  );
  validateArtifactFiles(definition, root, files);

  await mkdir(paths.temporaryRoot, { recursive: true });
  const temporaryPath = resolve(
    paths.temporaryRoot,
    `${definition.id}-${definition.artifact.fileName}`,
  );
  if (definition.artifact.format === "zip") {
    await writeZip(root, files, temporaryPath);
  } else {
    await copyFile(files[0]!, temporaryPath);
  }

  const artifactStats = await stat(temporaryPath);
  const artifactSha256 = await sha256File(temporaryPath);
  const path = objectPath(
    definition,
    artifactSha256,
    definition.artifact.fileName,
  );
  const target = resolveBelow(paths.outputRoot, path);
  await mkdir(dirname(target), { recursive: true });
  await rename(temporaryPath, target);

  return {
    path,
    fileName: definition.artifact.fileName,
    format: definition.artifact.format,
    contentType:
      definition.artifact.contentType ??
      contentType(definition.artifact.fileName),
    byteSize: artifactStats.size,
    sha256: artifactSha256,
    entrypoints: definition.artifact.entrypoints,
  };
}

export async function buildCover(
  definition: ResourceDefinition,
  paths: BuildPaths,
): Promise<CatalogResource["cover"]> {
  if (definition.cover === null) return null;
  const source = resolveBelow(
    paths.resourceDirectory,
    definition.cover.source,
  );
  const sourceStats = await stat(source);
  if (!sourceStats.isFile()) {
    throw new Error(`Cover is not a file for ${definition.id}: ${source}`);
  }
  const coverSha256 = await sha256File(source);
  const fileName = basename(source);
  const path = objectPath(
    definition,
    coverSha256,
    `cover-${fileName}`,
  );
  const target = resolveBelow(paths.outputRoot, path);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(source, target);
  return {
    path,
    contentType: contentType(source),
    byteSize: sourceStats.size,
    sha256: coverSha256,
    alt: definition.cover.alt,
  };
}

export function configuredEntrypoints(
  definition: ResourceDefinition,
  keys: string[],
): string[] {
  const entrypoints = configuredEntrypointOptions(definition, keys);
  return entrypoints.find((entrypoint) => entrypoint.isDefault)!.paths;
}

export function configuredEntrypointOptions(
  definition: ResourceDefinition,
  keys: string[],
): ResolvedArtifactEntrypoint[] {
  const entrypoints = resolveArtifactEntrypoints(
    definition.artifact.entrypoints,
    keys,
  );
  if (entrypoints.length === 0) {
    throw new Error(
      `Missing ${keys.join("/")} entrypoint for ${definition.id}.`,
    );
  }
  return entrypoints;
}

export function bundledPath(
  definition: ResourceDefinition,
  entrypoint: string,
): string {
  return `/resources/${resourceDirectory(definition.kind)}/${definition.id}/${entrypoint}`;
}

export function resourceDirectory(
  kind: ResourceDefinition["kind"],
): string {
  return kind === "skybox" ? "skyboxes" : `${kind}s`;
}

export function defaultRuntimeId(definition: ResourceDefinition): string {
  return `builtin:${definition.kind}:${definition.id}`;
}

export function resolveRuntimeId(
  definition: ResourceDefinition,
  overrides: Record<string, string>,
): string {
  return overrides[`${definition.id}@${definition.version}`] ??
    defaultRuntimeId(definition);
}

function runtimeIdForEntrypoint(
  runtimeId: string,
  entrypoint: ResolvedArtifactEntrypoint,
): string {
  return entrypoint.isDefault || entrypoint.id === null
    ? runtimeId
    : `${runtimeId}:${entrypoint.id}`;
}

function bundledSkyboxRuntimeId(
  runtimeId: string,
  entrypoint: ResolvedArtifactEntrypoint,
): string {
  return entrypoint.isDefault || entrypoint.id === null
    ? `${runtimeId}:skybox`
    : `${runtimeId}:skybox:${entrypoint.id}`;
}

function singleEntrypointPath(
  definition: ResourceDefinition,
  entrypoint: ResolvedArtifactEntrypoint,
): string {
  if (entrypoint.paths.length !== 1) {
    throw new Error(
      `${definition.kind} entrypoint ${entrypoint.id ?? "default"} for ${definition.id} must contain exactly one path.`,
    );
  }
  return entrypoint.paths[0]!;
}

export interface LoadedSite {
  site: ResourceSite;
  siteDir: string;
  manifestDir: string;
}

export interface LoadedManifest {
  definition: ResourceDefinition;
  directory: string;
}

export async function loadSite(configPath: string): Promise<LoadedSite> {
  const site = ResourceSiteSchema.parse(
    JSON.parse(await readFile(configPath, "utf8")),
  );
  const siteDir = resolve(dirname(resolve(configPath)));
  const manifestDir = resolve(siteDir, site.manifestRoot);
  return { site, siteDir, manifestDir };
}

export async function loadManifests(
  loaded: LoadedSite,
): Promise<LoadedManifest[]> {
  const entries = await readdir(loaded.manifestDir, { withFileTypes: true });
  const manifests: LoadedManifest[] = [];
  for (const entry of entries) {
    if (IGNORED_FILESYSTEM_ENTRIES.has(entry.name)) continue;
    if (!entry.isDirectory()) continue;
    const directory = resolve(loaded.manifestDir, entry.name);
    const manifestPath = resolve(directory, "manifest.json");
    const manifest = ResourceManifestSchema.parse(
      JSON.parse(await readFile(manifestPath, "utf8")),
    );
    if (manifest.id !== entry.name) {
      throw new Error(
        `Manifest directory name ${entry.name} does not match manifest.id ${manifest.id}`,
      );
    }
    manifests.push({ definition: manifest, directory });
  }
  return manifests.sort((left, right) =>
    left.definition.id < right.definition.id
      ? -1
      : left.definition.id > right.definition.id
        ? 1
        : 0
  );
}

export function validateDependencies(
  manifests: readonly LoadedManifest[],
): void {
  validateDependencyGraph(
    manifests.map(({ definition }) => ({
      id: definition.id,
      version: definition.version,
      kind: definition.kind,
      dependencies: definition.dependencies,
    })),
  );
}

export async function validateSite(loaded: LoadedSite): Promise<void> {
  const manifests = await loadManifests(loaded);
  const identities = new Set<string>();
  for (const { definition, directory } of manifests) {
    const identity = `${definition.id}@${definition.version}`;
    if (identities.has(identity)) {
      throw new Error(`Duplicate resource version: ${identity}`);
    }
    identities.add(identity);

    const { root, files } = await sourceFiles(definition, directory);
    validateArtifactFiles(definition, root, files);
    if (definition.cover !== null) {
      if (pathContainsSegment(definition.cover.source, "legacy-assets")) {
        throw new Error(
          `legacy-assets is not supported: ${definition.cover.source}`,
        );
      }
      const coverPath = resolveBelow(directory, definition.cover.source);
      const coverStats = await stat(coverPath);
      if (!coverStats.isFile()) {
        throw new Error(
          `Cover is not a file for ${definition.id}: ${coverPath}`,
        );
      }
    }
  }

  validateDependencies(manifests);
}

export async function buildRepository(
  loaded: LoadedSite,
  outputDir: string,
): Promise<{ catalogPath: string; catalogRevision: string }> {
  const outputRoot = resolveOutputRoot(loaded, outputDir);
  const temporaryRoot = resolve(outputRoot, ".tmp");
  await validateSite(loaded);
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });

  const manifests = await loadManifests(loaded);
  const resources: CatalogResource[] = [];
  for (const [index, manifest] of manifests.entries()) {
    const { definition, directory } = manifest;
    const paths: BuildPaths = {
      outputRoot,
      temporaryRoot,
      resourceDirectory: directory,
    };
    const [artifact, cover] = await Promise.all([
      buildArtifact(definition, paths),
      buildCover(definition, paths),
    ]);
    resources.push({
      id: definition.id,
      version: definition.version,
      kind: definition.kind,
      name: definition.name,
      description: definition.description,
      authors: definition.authors,
      license: definition.license,
      categories: definition.categories,
      tags: definition.tags,
      compatibility: definition.compatibility,
      visibility: definition.visibility,
      dependencies: definition.dependencies,
      ...(definition.render === undefined
        ? {}
        : { render: definition.render }),
      cover,
      artifact,
    });
    console.log(
      `[${index + 1}/${manifests.length}] Built ${definition.id}@${definition.version}`,
    );
  }
  resources.sort((left, right) =>
    left.id < right.id ? -1 : left.id > right.id ? 1 : 0
  );

  const catalog = ResourceCatalogV3Schema.parse({
    schemaVersion: 3,
    repository: loaded.site.repository,
    revision: sha256(
      stableJson({
        schemaVersion: 3,
        repository: loaded.site.repository,
        resources,
      }),
    ),
    resources,
  });
  const catalogPath = resolve(outputRoot, "catalog.json");
  await writeFile(
    catalogPath,
    `${JSON.stringify(catalog, null, 2)}\n`,
  );
  await rm(temporaryRoot, { recursive: true, force: true });
  console.log(
    `Generated catalog ${catalog.revision.slice(0, 12)} with ${resources.length} resources in ${outputRoot}`,
  );
  return { catalogPath, catalogRevision: catalog.revision };
}

export async function buildWallpaperEngineBundle(
  loaded: LoadedSite,
  outputDir: string,
): Promise<void> {
  const outputRoot = resolveOutputRoot(loaded, outputDir);
  const wallpaperEngineAssetsRoot = resolve(
    outputRoot,
    "wallpaper-engine-assets",
  );
  const wallpaperEngineAssetRoot = resolve(
    wallpaperEngineAssetsRoot,
    "resources",
  );
  const wallpaperEngineBundlePath = resolve(
    outputRoot,
    "wallpaper-engine.json",
  );
  await validateSite(loaded);
  await rm(wallpaperEngineAssetsRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });

  const manifests = await loadManifests(loaded);
  const resources: WallpaperEngineBundle["resources"] = {
    audios: [],
    models: [],
    motions: [],
    stages: [],
    skyboxes: [],
  };
  const runtimeIds = new Set<string>();
  const resourceIds = new Set<string>();
  const manifestByIdentity = new Map<string, ResourceDefinition>();
  for (const { definition } of manifests) {
    manifestByIdentity.set(
      `${definition.id}@${definition.version}`,
      definition,
    );
  }

  for (const { definition, directory } of manifests) {
    if (!definition.compatibility.platforms.includes("wallpaper-engine")) {
      continue;
    }
    if (
      definition.kind !== "model" &&
      definition.kind !== "motion" &&
      definition.kind !== "audio" &&
      definition.kind !== "camera" &&
      definition.kind !== "stage" &&
      definition.kind !== "skybox"
    ) {
      continue;
    }

    const runtimeId = resolveRuntimeId(
      definition,
      loaded.site.wallpaperEngine.runtimeIdOverrides,
    );
    if (resourceIds.has(definition.id)) {
      throw new Error(
        `Duplicate Wallpaper Engine resource: ${definition.id}`,
      );
    }
    if (runtimeIds.has(runtimeId)) {
      throw new Error(
        `Duplicate Wallpaper Engine runtime ID: ${runtimeId}`,
      );
    }
    resourceIds.add(definition.id);
    runtimeIds.add(runtimeId);

    const { root, files } = await sourceFiles(definition, directory);
    validateArtifactFiles(definition, root, files);
    for (const file of files) {
      const target = resolveBelow(
        wallpaperEngineAssetRoot,
        [
          resourceDirectory(definition.kind),
          definition.id,
          normalizeRelativePath(root, file),
        ].join("/"),
      );
      await mkdir(dirname(target), { recursive: true });
      await copyFile(file, target);
    }

    const base = {
      id: runtimeId,
      name: definition.name,
      ...(definition.description === null
        ? {}
        : { remark: definition.description }),
    };

    const isDependencyOnly = definition.visibility === "dependency-only";

    switch (definition.kind) {
      case "audio": {
        if (isDependencyOnly) break;
        const [entrypoint] = configuredEntrypoints(definition, ["audio"]);
        resources.audios.push({
          ...base,
          audioPath: bundledPath(definition, entrypoint!),
        });
        break;
      }
      case "model": {
        if (isDependencyOnly) break;
        for (const entrypoint of configuredEntrypointOptions(definition, [
          "model",
        ])) {
          const entrypointRuntimeId = runtimeIdForEntrypoint(
            runtimeId,
            entrypoint,
          );
          if (!entrypoint.isDefault) {
            if (runtimeIds.has(entrypointRuntimeId)) {
              throw new Error(
                `Duplicate Wallpaper Engine runtime ID: ${entrypointRuntimeId}`,
              );
            }
            runtimeIds.add(entrypointRuntimeId);
          }
          resources.models.push({
            ...base,
            id: entrypointRuntimeId,
            name: entrypoint.name ?? definition.name,
            ...(entrypoint.remark === undefined
              ? {}
              : { remark: entrypoint.remark }),
            modelPath: bundledPath(
              definition,
              singleEntrypointPath(definition, entrypoint),
            ),
          });
        }
        break;
      }
      case "motion": {
        const motionPath = configuredEntrypoints(definition, [
          "motions",
          "motion",
        ]).map((entrypoint) => bundledPath(definition, entrypoint));

        const audioDependency = definition.dependencies.find(
          (dependency) => dependency.binding === "audio",
        );
        const cameraDependency = definition.dependencies.find(
          (dependency) => dependency.binding === "camera",
        );

        function resolveDependencyPath(
          dependency: { id: string; version: string; binding: string },
          entrypointKeys: string[],
        ): string | undefined {
          const target = manifestByIdentity.get(
            `${dependency.id}@${dependency.version}`,
          );
          if (target === undefined) {
            throw new Error(
              `Motion ${definition.id}@${definition.version} references missing ${dependency.binding} dependency ${dependency.id}@${dependency.version}.`,
            );
          }
          if (!target.compatibility.platforms.includes("wallpaper-engine")) {
            throw new Error(
              `Motion ${definition.id}@${definition.version} depends on ${dependency.id}@${dependency.version}, which is not compatible with wallpaper-engine.`,
            );
          }
          return bundledPath(
            target,
            configuredEntrypoints(target, entrypointKeys)[0]!,
          );
        }

        const audioPath =
          audioDependency === undefined
            ? undefined
            : resolveDependencyPath(audioDependency, ["audio"]);
        const cameraPath =
          cameraDependency === undefined
            ? undefined
            : resolveDependencyPath(cameraDependency, ["camera"]);

        if (audioPath === undefined) {
          throw new Error(
            `Motion ${definition.id}@${definition.version} is missing an "audio" dependency required for the Wallpaper Engine bundle.`,
          );
        }

        resources.motions.push({
          ...base,
          motionPath,
          audioPath,
          cameraPath,
        });
        break;
      }
      case "stage": {
        if (isDependencyOnly) break;
        for (const entrypoint of configuredEntrypointOptions(definition, [
          "stage",
        ])) {
          const entrypointRuntimeId = runtimeIdForEntrypoint(
            runtimeId,
            entrypoint,
          );
          if (!entrypoint.isDefault) {
            if (runtimeIds.has(entrypointRuntimeId)) {
              throw new Error(
                `Duplicate Wallpaper Engine runtime ID: ${entrypointRuntimeId}`,
              );
            }
            runtimeIds.add(entrypointRuntimeId);
          }
          resources.stages.push({
            ...base,
            id: entrypointRuntimeId,
            name: entrypoint.name ?? definition.name,
            ...(entrypoint.remark === undefined
              ? {}
              : { remark: entrypoint.remark }),
            ...(definition.render === undefined
              ? {}
              : { render: definition.render }),
            stagePath: bundledPath(
              definition,
              singleEntrypointPath(definition, entrypoint),
            ),
          });
        }
        if (definition.artifact.entrypoints["skybox"] !== undefined) {
          for (const entrypoint of configuredEntrypointOptions(definition, [
            "skybox",
          ])) {
            const entrypointRuntimeId = bundledSkyboxRuntimeId(
              runtimeId,
              entrypoint,
            );
            if (runtimeIds.has(entrypointRuntimeId)) {
              throw new Error(
                `Duplicate Wallpaper Engine runtime ID: ${entrypointRuntimeId}`,
              );
            }
            runtimeIds.add(entrypointRuntimeId);
            resources.skyboxes.push({
              ...base,
              id: entrypointRuntimeId,
              name: entrypoint.name ?? `${definition.name} (Sky)`,
              ...(entrypoint.remark === undefined
                ? {}
                : { remark: entrypoint.remark }),
              skyboxPath: bundledPath(
                definition,
                singleEntrypointPath(definition, entrypoint),
              ),
            });
          }
        }
        break;
      }
      case "skybox": {
        if (isDependencyOnly) break;
        for (const entrypoint of configuredEntrypointOptions(definition, [
          "skybox",
        ])) {
          const entrypointRuntimeId = runtimeIdForEntrypoint(
            runtimeId,
            entrypoint,
          );
          if (!entrypoint.isDefault) {
            if (runtimeIds.has(entrypointRuntimeId)) {
              throw new Error(
                `Duplicate Wallpaper Engine runtime ID: ${entrypointRuntimeId}`,
              );
            }
            runtimeIds.add(entrypointRuntimeId);
          }
          resources.skyboxes.push({
            ...base,
            id: entrypointRuntimeId,
            name: entrypoint.name ?? definition.name,
            ...(entrypoint.remark === undefined
              ? {}
              : { remark: entrypoint.remark }),
            skyboxPath: bundledPath(
              definition,
              singleEntrypointPath(definition, entrypoint),
            ),
          });
        }
        break;
      }
    }
  }

  const bundle = WallpaperEngineBundleSchema.parse({
    schemaVersion: 1,
    resources,
  });
  await writeFile(
    wallpaperEngineBundlePath,
    `${JSON.stringify(bundle, null, 2)}\n`,
  );
  console.log(
    `Prepared ${Object.values(bundle.resources).flat().length} bundled Wallpaper Engine resources`,
  );
}

export async function publishFile(
  bucketName: string,
  objectKey: string,
  path: string,
  cacheControl: string,
  workingDirectory: string,
): Promise<void> {
  const { spawn } = await import("node:child_process");
  const requireFromWorkingDirectory = createRequire(
    resolve(workingDirectory, "package.json"),
  );
  const wranglerPackagePath = requireFromWorkingDirectory.resolve(
    "wrangler/package.json",
  );
  const wranglerCliPath = resolve(
    dirname(wranglerPackagePath),
    "bin",
    "wrangler.js",
  );
  const child = spawn(
    process.execPath,
    [
      wranglerCliPath,
      "r2",
      "object",
      "put",
      `${bucketName}/${objectKey}`,
      "--remote",
      "--file",
      path,
      "--content-type",
      contentType(path),
      "--cache-control",
      cacheControl,
      "--force",
    ],
    {
      cwd: workingDirectory,
      env: process.env,
      stdio: "inherit",
    },
  );
  await new Promise<void>((resolvePromise, rejectPromise) => {
    child.once("error", rejectPromise);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(
          new Error(
            `Wrangler failed with ${signal === null ? `exit code ${code}` : `signal ${signal}`}.`,
          ),
        );
      }
    });
  });
}

export async function publishR2(
  loaded: LoadedSite,
  outputDir: string,
  options?: { bucket?: string; prefix?: string; force?: boolean },
): Promise<void> {
  const bucketName = resolveR2BucketName(
    options?.bucket,
    process.env["R2_BUCKET_NAME"],
  );
  const prefix = normalizeR2Prefix(options?.prefix);
  const outputRoot = resolveOutputRoot(loaded, outputDir);
  const { catalogPath } = await buildRepository(loaded, outputRoot);
  const statePath = publishStateFilePath(loaded.siteDir);
  const state = await loadPublishState(statePath);
  const bucketState = (state[bucketName] ??= {});
  const isUpToDate = (key: string, sha: string): boolean =>
    !options?.force && bucketState[key] === sha;

  const files = await listFiles(resolve(outputRoot, "objects"));
  let uploaded = 0;
  let skipped = 0;
  for (const [index, file] of files.entries()) {
    const key = r2ObjectKey(prefix, normalizeRelativePath(outputRoot, file));
    const sha = await sha256File(file);
    if (isUpToDate(key, sha)) {
      console.log(`[${index + 1}/${files.length}] Skipping ${key} (unchanged)`);
      skipped++;
      continue;
    }
    console.log(`[${index + 1}/${files.length}] Uploading ${key}`);
    await publishFile(
      bucketName,
      key,
      file,
      IMMUTABLE_CACHE_CONTROL,
      loaded.siteDir,
    );
    bucketState[key] = sha;
    await savePublishState(statePath, state);
    uploaded++;
  }
  const catalogKey = r2ObjectKey(prefix, "catalog.json");
  const catalogSha = await sha256File(catalogPath);
  if (isUpToDate(catalogKey, catalogSha)) {
    console.log(`Skipping ${catalogKey} (unchanged)`);
    skipped++;
  } else {
    console.log(`Uploading ${catalogKey} last`);
    await publishFile(
      bucketName,
      catalogKey,
      catalogPath,
      CATALOG_CACHE_CONTROL,
      loaded.siteDir,
    );
    bucketState[catalogKey] = catalogSha;
    await savePublishState(statePath, state);
  }
  console.log(
    `Published catalog from ${outputRoot} (${uploaded} uploaded, ${skipped} skipped)`,
  );
}

export const PUBLISH_STATE_FILE_NAME = ".resource-publish-state.json";

export function publishStateFilePath(siteDir: string): string {
  return resolve(siteDir, PUBLISH_STATE_FILE_NAME);
}

export async function loadPublishState(
  path: string,
): Promise<Record<string, Record<string, string>>> {
  let raw: string;
  try {
    raw = await readFile(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }
    throw error;
  }
  const parsed: unknown = JSON.parse(raw);
  if (
    parsed === null ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    throw new Error(`Invalid publish state file: ${path}`);
  }
  const result: Record<string, Record<string, string>> = {};
  for (const [bucket, keys] of Object.entries(parsed)) {
    if (
      keys === null ||
      typeof keys !== "object" ||
      Array.isArray(keys)
    ) {
      throw new Error(
        `Invalid publish state for bucket ${bucket} in ${path}`,
      );
    }
    const bucketState: Record<string, string> = {};
    for (const [key, hash] of Object.entries(keys)) {
      if (typeof hash !== "string" || hash.length === 0) {
        throw new Error(
          `Invalid publish state entry for ${key} in ${path}`,
        );
      }
      bucketState[key] = hash;
    }
    result[bucket] = bucketState;
  }
  return result;
}

export async function savePublishState(
  path: string,
  state: Readonly<Record<string, Readonly<Record<string, string>>>>,
): Promise<void> {
  await writeFile(path, `${JSON.stringify(state, null, 2)}\n`);
}

export { IMMUTABLE_CACHE_CONTROL, CATALOG_CACHE_CONTROL };
