import {
  dependencyClosure,
  resourceIdentity,
  resolveCatalogAssetUrl,
  type CatalogResource,
  type ResourceKind,
} from "@wallpaper/resource-schema";
import {
  WallpaperCacheDatabase,
  WallpaperClientDatabase,
  pruneArtifactCache,
} from "../db";
import type {
  ArtifactFileRecord,
  CachedResourceRecord,
  ResourceSourceRecord,
} from "../db";
import { ResourceSourceService } from "./resource-sources";
import {
  BlobReader,
  BlobWriter,
  ZipReader,
  configure,
} from "@zip.js/zip.js";
import { createSHA256 } from "hash-wasm";

configure({ useWebWorkers: false });

const MAX_ARCHIVE_ENTRIES = 10_000;
const MAX_EXTRACTED_BYTES = 4 * 1024 ** 3;

export interface CatalogSearchInput {
  query?: string;
  kind?: ResourceKind;
  categories?: readonly string[];
  tags?: readonly string[];
  cursor?: string;
  limit?: number;
  includeDependencies?: boolean;
}

export interface CatalogSearchSourceInfo {
  sourceId: string;
  sourceName: string;
  status: "ok" | "stale" | "error" | "idle";
  catalogRevision: string | null;
  stale: boolean;
  error: string | null;
}

export interface ResourceSummary extends CatalogResource {
  sourceId: string;
  sourceName: string;
  sourceCatalogUrl: string;
  sourceBaseUrl: string;
  catalogRevision: string;
  localResourceId: string;
  localVersionId: string;
  artifactUrl: string;
  coverUrl: string | null;
}

export interface CatalogSearchOutput {
  items: ResourceSummary[];
  nextCursor: string | null;
  catalogRevision: string;
  sources: CatalogSearchSourceInfo[];
}

export interface InstalledResourceSummary {
  localResourceId: string;
  localVersionId: string;
  upstreamId: string;
  name: string;
  kind: ResourceKind;
  version: string;
  description: string | null;
  categories: string[];
  tags: string[];
  sourceId: string;
  sourceName: string;
  sourceAvailable: boolean;
  coverUrl: string | null;
  addedAt: string;
  ready: boolean;
}

export interface InstalledUpdateSummary {
  installed: InstalledResourceSummary;
  update: ResourceSummary;
}

export function makeLocalResourceId(
  sourceId: string,
  upstreamId: string,
): string {
  return `${sourceId}:${upstreamId}`;
}

export function makeLocalVersionId(
  sourceId: string,
  upstreamId: string,
  upstreamVersion: string,
): string {
  return `${sourceId}:${upstreamId}@${upstreamVersion}`;
}

export function toResourceSummary(
  source: ResourceSourceRecord,
  catalog: { revision: string },
  resource: CatalogResource,
): ResourceSummary {
  const localResourceId = makeLocalResourceId(source.id, resource.id);
  const localVersionId = makeLocalVersionId(
    source.id,
    resource.id,
    resource.version,
  );
  return {
    ...resource,
    sourceId: source.id,
    sourceName: source.name,
    sourceCatalogUrl: source.catalogUrl,
    sourceBaseUrl: source.baseUrl,
    catalogRevision: catalog.revision,
    localResourceId,
    localVersionId,
    artifactUrl: resolveCatalogAssetUrl(
      source.catalogUrl,
      resource.artifact.path,
    ).href,
    coverUrl:
      resource.cover === null
        ? null
        : resolveCatalogAssetUrl(source.catalogUrl, resource.cover.path).href,
  };
}

function includesSearchText(
  resource: ResourceSummary,
  query: string,
): boolean {
  if (query.length === 0) return true;
  const text = [
    resource.name,
    resource.description ?? "",
    ...resource.categories,
    ...resource.tags,
    ...resource.authors.map((author) => author.name),
    resource.sourceName,
    resource.sourceCatalogUrl,
  ]
    .join("\n")
    .toLocaleLowerCase();
  return text.includes(query);
}

export interface AggregateSearchSource {
  source: ResourceSourceRecord;
  catalog: { revision: string; resources: readonly CatalogResource[] };
  stale: boolean;
}

export function aggregateSearchResults(
  sources: readonly AggregateSearchSource[],
  input: CatalogSearchInput,
): { items: ResourceSummary[]; nextCursor: string | null } {
  const query = input.query?.trim().toLocaleLowerCase() ?? "";
  const categories = new Set(input.categories ?? []);
  const tags = new Set(
    (input.tags ?? []).map((tag) => tag.toLocaleLowerCase()),
  );
  const filtered = sources
    .flatMap(({ source, catalog }) =>
      catalog.resources.map((resource) =>
        toResourceSummary(source, catalog, resource),
      ),
    )
    .filter(
      (resource) =>
        (input.includeDependencies === true ||
          resource.visibility !== "dependency-only") &&
        (input.kind === undefined || resource.kind === input.kind) &&
        [...categories].every((category) =>
          resource.categories.includes(category),
        ) &&
        [...tags].every((tag) =>
          resource.tags.some(
            (resourceTag) => resourceTag.toLocaleLowerCase() === tag,
          ),
        ) &&
        includesSearchText(resource, query),
    );

  filtered.sort((left, right) => {
    const bySource = left.sourceCatalogUrl.localeCompare(
      right.sourceCatalogUrl,
    );
    if (bySource !== 0) return bySource;
    const byId = left.id.localeCompare(right.id);
    if (byId !== 0) return byId;
    return left.version.localeCompare(right.version);
  });

  const offset =
    input.cursor === undefined ? 0 : Number.parseInt(input.cursor, 10);
  if (!Number.isSafeInteger(offset) || offset < 0) {
    throw new Error("Invalid resource catalog cursor.");
  }
  const limit = Math.min(Math.max(input.limit ?? 24, 1), 100);
  const end = Math.min(offset + limit, filtered.length);
  return {
    items: filtered.slice(offset, end),
    nextCursor: end < filtered.length ? String(end) : null,
  };
}

export function deriveAggregateRevision(
  revisions: readonly string[],
): string {
  const sorted = [...revisions].sort();
  let hash = 0;
  for (const revision of sorted) {
    for (let index = 0; index < revision.length; index++) {
      hash = (hash << 5) - hash + revision.charCodeAt(index);
      hash |= 0;
    }
  }
  return hash === 0
    ? ""
    : Math.abs(hash).toString(16).padStart(16, "0");
}

export function normalizeArtifactPath(value: string): string {
  const path = value.replaceAll("\\", "/").replace(/^\.\/+/u, "");
  if (
    path.length === 0 ||
    path.startsWith("/") ||
    /^[a-z]:\//iu.test(path) ||
    path.includes("\0")
  ) {
    throw new Error(`Unsafe artifact path: ${value}`);
  }
  const segments = path.split("/");
  if (
    segments.some(
      (segment) =>
        segment.length === 0 || segment === "." || segment === "..",
    )
  ) {
    throw new Error(`Unsafe artifact path: ${value}`);
  }
  return segments.join("/");
}

function inferContentType(path: string): string {
  const extension = path.split(".").at(-1)?.toLowerCase();
  switch (extension) {
    case "bmp":
      return "image/bmp";
    case "gif":
      return "image/gif";
    case "jpeg":
    case "jpg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "mp3":
      return "audio/mpeg";
    case "ogg":
      return "audio/ogg";
    case "wav":
      return "audio/wav";
    case "mp4":
      return "video/mp4";
    case "zip":
      return "application/zip";
    default:
      return "application/octet-stream";
  }
}

export async function extractArtifactFiles(
  format: "raw" | "zip",
  fileName: string,
  sha256: string,
  blob: Blob,
  now: string,
): Promise<ArtifactFileRecord[]> {
  if (format !== "zip") {
    const path = normalizeArtifactPath(fileName);
    return [
      {
        sha256,
        path,
        contentType: blob.type || inferContentType(path),
        byteSize: blob.size,
        lastAccessedAt: now,
        blob,
      },
    ];
  }

  const reader = new ZipReader(new BlobReader(blob), {
    checkOverlappingEntry: true,
    strictness: "strict",
  });
  try {
    const entries = await reader.getEntries({
      checkAmbiguity: true,
      strictness: "strict",
    });
    if (entries.length > MAX_ARCHIVE_ENTRIES) {
      throw new Error(
        `ZIP contains ${entries.length} entries; the limit is ${MAX_ARCHIVE_ENTRIES}.`,
      );
    }

    const files: ArtifactFileRecord[] = [];
    const paths = new Set<string>();
    let extractedBytes = 0;
    for (const entry of entries) {
      if (entry.directory) continue;
      const path = normalizeArtifactPath(entry.filename);
      if (paths.has(path)) {
        throw new Error(`ZIP contains a duplicate path: ${path}`);
      }
      paths.add(path);
      extractedBytes += entry.uncompressedSize;
      if (extractedBytes > MAX_EXTRACTED_BYTES) {
        throw new Error(
          "ZIP expands beyond the 4 GiB client safety limit.",
        );
      }

      const contentType = inferContentType(path);
      const extracted = await entry.getData(
        new BlobWriter(contentType),
        {
          checkOverlappingEntry: true,
          checkSignature: true,
        },
      );
      if (extracted === undefined) {
        throw new Error(`Unable to extract ${path}.`);
      }
      files.push({
        sha256,
        path,
        contentType,
        byteSize: extracted.size,
        lastAccessedAt: now,
        blob: extracted,
      });
    }
    if (files.length === 0) {
      throw new Error("ZIP does not contain any files.");
    }
    return files;
  } finally {
    await reader.close();
  }
}

async function calculateBlobSha256(blob: Blob): Promise<string> {
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

async function downloadArtifact(
  url: string,
  expectedBytes: number,
  onProgress: (progress: InstallProgress) => void,
  fetcher: typeof fetch,
): Promise<Blob> {
  const response = await fetcher(url, { credentials: "omit" });
  if (!response.ok) {
    throw new Error(
      `Artifact download failed (${response.status} ${response.statusText}).`,
    );
  }
  if (response.body === null) {
    const blob = await response.blob();
    onProgress({
      phase: "downloading",
      loaded: blob.size,
      total: expectedBytes,
    });
    return blob;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let loaded = 0;
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    const bytes = new Uint8Array(chunk.value);
    chunks.push(bytes);
    loaded += bytes.byteLength;
    onProgress({
      phase: "downloading",
      loaded,
      total: expectedBytes,
    });
  }
  return new Blob(chunks, {
    type: response.headers.get("content-type") ?? "",
  });
}

export interface InstallProgress {
  phase: "catalog" | "downloading" | "verifying" | "extracting";
  loaded?: number;
  total?: number;
}

export class ResourceClient {
  readonly database: WallpaperClientDatabase;
  readonly cache: WallpaperCacheDatabase;
  readonly sourceService: ResourceSourceService;
  private readonly fetcher: typeof fetch;
  private seeded = false;

  constructor(
    database: WallpaperClientDatabase,
    cache: WallpaperCacheDatabase,
    sourceService: ResourceSourceService,
    fetcher?: typeof fetch,
  ) {
    this.database = database;
    this.cache = cache;
    this.sourceService = sourceService;
    this.fetcher = fetcher ?? globalThis.fetch.bind(globalThis);
  }

  private async seedDefault(): Promise<void> {
    if (this.seeded) return;
    this.seeded = true;
    await this.sourceService.seedDefault();
  }

  async search(
    input: CatalogSearchInput,
  ): Promise<CatalogSearchOutput> {
    await this.seedDefault();
    const refreshResults = await this.sourceService.refreshAll();
    const usableSources: AggregateSearchSource[] = [];
    const sourceInfos: CatalogSearchSourceInfo[] = [];
    const errors: Error[] = [];

    for (const [sourceId, result] of refreshResults) {
      const source = await this.database.resourceSources.get(sourceId);
      if (source === undefined) continue;

      if (result instanceof Error) {
        const cached = await this.database.sourceCatalogs.get(sourceId);
        if (cached !== undefined) {
          usableSources.push({
            source,
            catalog: cached.catalog,
            stale: true,
          });
          sourceInfos.push({
            sourceId: source.id,
            sourceName: source.name,
            status: "stale",
            catalogRevision: cached.catalog.revision,
            stale: true,
            error: result.message,
          });
        } else {
          sourceInfos.push({
            sourceId: source.id,
            sourceName: source.name,
            status: "error",
            catalogRevision: null,
            stale: false,
            error: result.message,
          });
          errors.push(result);
        }
        continue;
      }

      usableSources.push(result);
      sourceInfos.push({
        sourceId: result.source.id,
        sourceName: result.source.name,
        status: result.stale ? "stale" : "ok",
        catalogRevision: result.catalog.revision,
        stale: result.stale,
        error: result.stale ? result.source.lastError : null,
      });
    }

    if (usableSources.length === 0) {
      if (refreshResults.size === 0) {
        return {
          items: [],
          nextCursor: null,
          catalogRevision: "",
          sources: [],
        };
      }
      throw new AggregateError(
        errors,
        "No usable resource catalogs are available.",
      );
    }

    const { items, nextCursor } = aggregateSearchResults(
      usableSources,
      input,
    );
    const revisions = usableSources.map(({ catalog }) => catalog.revision);
    return {
      items,
      nextCursor,
      catalogRevision: deriveAggregateRevision(revisions),
      sources: sourceInfos,
    };
  }

  private async resolveDependencyClosure(
    summary: ResourceSummary,
  ): Promise<ResourceSummary[]> {
    const sourceCatalog = await this.database.sourceCatalogs.get(
      summary.sourceId,
    );
    if (sourceCatalog === undefined) {
      return [];
    }
    const catalog = sourceCatalog.catalog;
    const byIdentity = new Map<string, CatalogResource>();
    for (const resource of catalog.resources) {
      byIdentity.set(
        resourceIdentity(resource.id, resource.version),
        resource,
      );
    }

    const source: ResourceSourceRecord = {
      id: summary.sourceId,
      name: summary.sourceName,
      catalogUrl: summary.sourceCatalogUrl,
      baseUrl: summary.sourceBaseUrl,
      description: null,
      homepage: null,
      enabled: true,
      isDefault: false,
      status: "ok",
      schemaVersion: catalog.schemaVersion,
      revision: catalog.revision,
      lastError: null,
      lastErrorAt: null,
      createdAt: "",
      updatedAt: "",
      lastAttemptedAt: null,
      lastSuccessfulAt: null,
    };

    const closure = dependencyClosure(
      catalog.resources.map((resource) => ({
        id: resource.id,
        version: resource.version,
        kind: resource.kind,
        dependencies: resource.dependencies,
      })),
      resourceIdentity(summary.id, summary.version),
    );

    return closure.map((node) => {
      const resource = byIdentity.get(
        resourceIdentity(node.id, node.version),
      );
      if (resource === undefined) {
        throw new Error(
          `Catalog resource not found for ${node.id}@${node.version}.`,
        );
      }
      return toResourceSummary(source, catalog, resource);
    });
  }

  async install(
    summary: ResourceSummary,
    onProgress: (progress: InstallProgress) => void,
  ): Promise<void> {
    const closure = await this.resolveDependencyClosure(summary);
    const rootSummary = closure[closure.length - 1];
    if (rootSummary === undefined) {
      throw new Error(
        `Unable to resolve install closure for ${summary.id}@${summary.version}.`,
      );
    }

    for (const item of closure) {
      await this.installSingle(item, onProgress);
    }

    await this.database.transaction(
      "rw",
      this.database.resourceDependencies,
      async () => {
        const versionIds = closure.map((item) => item.localVersionId);
        await this.database.resourceDependencies
          .where("parentVersionId")
          .anyOf(versionIds)
          .delete();
        for (const item of closure) {
          for (const dependency of item.dependencies) {
            const dependencySummary = closure.find(
              (candidate) =>
                candidate.id === dependency.id &&
                candidate.version === dependency.version,
            );
            if (dependencySummary === undefined) continue;
            await this.database.resourceDependencies.put({
              parentVersionId: item.localVersionId,
              binding: dependency.binding,
              dependencyVersionId: dependencySummary.localVersionId,
            });
          }
        }
      },
    );
  }

  private async installSingle(
    summary: ResourceSummary,
    onProgress: (progress: InstallProgress) => void,
  ): Promise<void> {
    onProgress({ phase: "catalog" });
    const download = summary.artifact;

    let blobRecord = await this.cache.artifactBlobs.get(
      download.sha256,
    );
    if (
      blobRecord !== undefined &&
      blobRecord.byteSize !== download.byteSize
    ) {
      await this.cache.artifactBlobs.delete(download.sha256);
      blobRecord = undefined;
    }

    let blob: Blob;
    if (blobRecord === undefined) {
      onProgress({
        phase: "downloading",
        loaded: 0,
        total: download.byteSize,
      });
      blob = await downloadArtifact(
        summary.artifactUrl,
        download.byteSize,
        onProgress,
        this.fetcher,
      );
      if (blob.size !== download.byteSize) {
        throw new Error(
          `Artifact size mismatch: expected ${download.byteSize}, received ${blob.size}.`,
        );
      }
      onProgress({
        phase: "verifying",
        loaded: blob.size,
        total: blob.size,
      });
      const actualSha256 = await calculateBlobSha256(blob);
      if (actualSha256 !== download.sha256) {
        throw new Error("Artifact SHA-256 verification failed.");
      }
      await this.cache.artifactBlobs.put({
        sha256: download.sha256,
        byteSize: blob.size,
        lastAccessedAt: new Date().toISOString(),
        blob,
      });
    } else {
      blob = blobRecord.blob;
    }

    const now = new Date().toISOString();
    let files = await this.cache.artifactFiles
      .where("sha256")
      .equals(download.sha256)
      .toArray();
    if (files.length === 0) {
      onProgress({ phase: "extracting" });
      files = await extractArtifactFiles(
        download.format,
        download.fileName,
        download.sha256,
        blob,
        now,
      );
      await this.cache.artifactFiles.bulkPut(files);
    }

    const previousLibraryItem = await this.database.libraryItems.get(
      summary.localResourceId,
    );
    const previousVersion =
      previousLibraryItem?.resourceVersionId === null ||
      previousLibraryItem?.resourceVersionId === undefined
        ? undefined
        : await this.database.resourceVersions.get(
            previousLibraryItem.resourceVersionId,
          );

    await this.database.transaction(
      "rw",
      this.database.resources,
      this.database.resourceVersions,
      this.database.libraryItems,
      this.database.artifactMetadata,
      async () => {
        await this.database.resources.put({
          id: summary.localResourceId,
          sourceId: summary.sourceId,
          sourceName: summary.sourceName,
          upstreamId: summary.id,
          kind: summary.kind,
          name: summary.name,
          description: summary.description,
          categories: [...summary.categories],
          tags: [...summary.tags],
          visibility: summary.visibility,
          publishedVersionId: summary.localVersionId,
          currentVersion: summary.version,
          coverUrl: summary.coverUrl,
          catalogRevision: summary.catalogRevision,
          updatedAt: now,
        });
        await this.database.resourceVersions.put({
          id: summary.localVersionId,
          sourceId: summary.sourceId,
          upstreamId: summary.id,
          upstreamVersion: summary.version,
          resourceId: summary.localResourceId,
          artifactId: summary.localVersionId,
          format: download.format,
          fileName: download.fileName,
          contentType: download.contentType,
          sha256: download.sha256,
          byteSize: download.byteSize,
          entrypoints: download.entrypoints,
          ...(summary.render === undefined
            ? {}
            : { render: summary.render }),
          publishedAt: now,
        });
        await this.database.libraryItems.put({
          resourceId: summary.localResourceId,
          resourceVersionId: summary.localVersionId,
          sourceId: summary.sourceId,
          kind: summary.kind,
          source: "remote",
          addedAt: previousLibraryItem?.addedAt ?? now,
        });
        await this.database.artifactMetadata.put({
          sha256: download.sha256,
          resourceVersionId: summary.localVersionId,
          storage: "indexeddb",
          byteSize: download.byteSize,
          pinned: true,
          lastAccessedAt: now,
        });
      },
    );
    if (
      previousVersion !== undefined &&
      previousVersion.sha256 !== download.sha256
    ) {
      await this.syncArtifactPin(previousVersion.sha256);
    }
    await pruneArtifactCache(this.database, this.cache);
  }

  private async isVersionInstalled(
    versionId: string,
    visiting = new Set<string>(),
  ): Promise<boolean> {
    if (visiting.has(versionId)) return false;

    const item = await this.database.libraryItems
      .where("resourceVersionId")
      .equals(versionId)
      .first();
    if (item === undefined) return false;

    const dependencies = await this.database.resourceDependencies
      .where("parentVersionId")
      .equals(versionId)
      .toArray();
    if (dependencies.length === 0) return true;

    visiting.add(versionId);
    for (const dependency of dependencies) {
      if (
        !(await this.isVersionInstalled(
          dependency.dependencyVersionId,
          visiting,
        ))
      ) {
        visiting.delete(versionId);
        return false;
      }
    }
    visiting.delete(versionId);
    return true;
  }

  async isInstalled(summary: ResourceSummary): Promise<boolean> {
    return this.isVersionInstalled(summary.localVersionId);
  }

  async listInstalled(): Promise<InstalledResourceSummary[]> {
    const libraryItems = await this.database.libraryItems
      .where("source")
      .equals("remote")
      .toArray();
    const installed = await Promise.all(
      libraryItems.map(async (item) => {
        if (item.resourceVersionId === null) return null;
        const [resource, version, source] = await Promise.all([
          this.database.resources.get(item.resourceId),
          this.database.resourceVersions.get(item.resourceVersionId),
          item.sourceId === null
            ? Promise.resolve(undefined)
            : this.database.resourceSources.get(item.sourceId),
        ]);
        if (
          resource === undefined ||
          version === undefined ||
          resource.visibility === "dependency-only"
        ) {
          return null;
        }
        return {
          localResourceId: resource.id,
          localVersionId: version.id,
          upstreamId: resource.upstreamId,
          name: resource.name,
          kind: resource.kind,
          version: version.upstreamVersion,
          description: resource.description,
          categories: [...resource.categories],
          tags: [...resource.tags],
          sourceId: resource.sourceId,
          sourceName: resource.sourceName,
          sourceAvailable: source !== undefined,
          coverUrl: resource.coverUrl,
          addedAt: item.addedAt,
          ready: await this.isVersionInstalled(version.id),
        } satisfies InstalledResourceSummary;
      }),
    );
    return installed
      .filter(
        (item): item is InstalledResourceSummary => item !== null,
      )
      .sort(
        (left, right) =>
          right.addedAt.localeCompare(left.addedAt) ||
          left.name.localeCompare(right.name),
      );
  }

  async listAvailableUpdates(): Promise<InstalledUpdateSummary[]> {
    const installed = await this.listInstalled();
    const sourceIds = [
      ...new Set(installed.map((item) => item.sourceId)),
    ];
    const catalogs =
      sourceIds.length === 0
        ? []
        : await this.database.sourceCatalogs
            .where("sourceId")
            .anyOf(sourceIds)
            .toArray();
    const catalogBySource = new Map(
      catalogs.map((catalog) => [catalog.sourceId, catalog.catalog]),
    );
    const updates: InstalledUpdateSummary[] = [];
    for (const item of installed) {
      const catalog = catalogBySource.get(item.sourceId);
      if (catalog === undefined) continue;
      const catalogResource = catalog.resources.find(
        (resource) =>
          resource.id === item.upstreamId &&
          resource.visibility !== "dependency-only",
      );
      if (catalogResource === undefined) continue;
      if (catalogResource.version === item.version) continue;
      const source = await this.database.resourceSources.get(
        item.sourceId,
      );
      if (source === undefined) continue;
      updates.push({
        installed: item,
        update: toResourceSummary(
          source,
          { revision: catalog.revision },
          catalogResource,
        ),
      });
    }
    return updates.sort((left, right) =>
      left.installed.name.localeCompare(right.installed.name),
    );
  }

  async uninstall(resourceId: string): Promise<void> {
    const resource = await this.database.resources.get(resourceId);
    if (resource === undefined) {
      throw new Error(`Installed resource not found: ${resourceId}`);
    }
    await this.deleteInstalledResources([resource]);
  }

  async removeSource(
    sourceId: string,
    mode: "keep-installed" | "delete-installed",
  ): Promise<void> {
    if (mode === "keep-installed") {
      await this.sourceService.remove(sourceId);
      return;
    }

    const resources = await this.database.resources
      .where("sourceId")
      .equals(sourceId)
      .toArray();
    await this.deleteInstalledResources(resources);
    await this.sourceService.remove(sourceId);
  }

  private async deleteInstalledResources(
    resources: readonly CachedResourceRecord[],
  ): Promise<void> {
    const requestedResourceIds = new Set(
      resources.map((resource) => resource.id),
    );
    if (requestedResourceIds.size === 0) return;

    const [allResources, allVersions, allLibraryItems, allDependencies] =
      await Promise.all([
        this.database.resources.toArray(),
        this.database.resourceVersions.toArray(),
        this.database.libraryItems.toArray(),
        this.database.resourceDependencies.toArray(),
      ]);
    const resourceById = new Map(
      allResources.map((resource) => [resource.id, resource]),
    );
    const dependenciesByParent = new Map<string, string[]>();
    for (const dependency of allDependencies) {
      const current =
        dependenciesByParent.get(dependency.parentVersionId) ?? [];
      current.push(dependency.dependencyVersionId);
      dependenciesByParent.set(dependency.parentVersionId, current);
    }

    const reachableVersionIds = new Set<string>();
    const pendingVersionIds = allLibraryItems.flatMap((item) => {
      const resource = resourceById.get(item.resourceId);
      return item.resourceVersionId !== null &&
        !requestedResourceIds.has(item.resourceId) &&
        resource?.visibility !== "dependency-only"
        ? [item.resourceVersionId]
        : [];
    });
    while (pendingVersionIds.length > 0) {
      const versionId = pendingVersionIds.pop();
      if (
        versionId === undefined ||
        reachableVersionIds.has(versionId)
      ) {
        continue;
      }
      reachableVersionIds.add(versionId);
      pendingVersionIds.push(
        ...(dependenciesByParent.get(versionId) ?? []),
      );
    }

    for (const item of allLibraryItems) {
      const resource = resourceById.get(item.resourceId);
      if (
        resource?.visibility === "dependency-only" &&
        (item.resourceVersionId === null ||
          !reachableVersionIds.has(item.resourceVersionId))
      ) {
        requestedResourceIds.add(item.resourceId);
      }
    }

    const resourceIds = [...requestedResourceIds];
    const versions = allVersions.filter((version) =>
      requestedResourceIds.has(version.resourceId),
    );
    const versionIds = new Set(
      versions.map((version) => version.id),
    );
    const sha256s = [
      ...new Set(versions.map((version) => version.sha256)),
    ];

    const libraryItems = allLibraryItems.filter((item) =>
      requestedResourceIds.has(item.resourceId),
    );
    const runtimeIds = libraryItems.map(
      (item) => `remote:${item.resourceId}`,
    );
    const usesRemovedRuntime = (id: string | undefined): boolean =>
      id !== undefined && runtimeIds.some(
        (runtimeId) => id === runtimeId || id.startsWith(`${runtimeId}:`),
      );

    await this.database.transaction(
      "rw",
      [
        this.database.resources,
        this.database.resourceVersions,
        this.database.resourceDependencies,
        this.database.libraryItems,
        this.database.playlists,
        this.database.playlistItems,
      ],
      async () => {
        const allPlaylistItems =
          await this.database.playlistItems.toArray();
        const itemsToRemove = allPlaylistItems.filter(
          (item) =>
            usesRemovedRuntime(item.modelId) ||
            usesRemovedRuntime(item.motionId) ||
            usesRemovedRuntime(item.stageId) ||
            usesRemovedRuntime(item.skyboxId),
        );
        const removedItemIds = new Set(
          itemsToRemove.map((item) => item.id),
        );
        const affectedPlaylistIds = new Set(
          itemsToRemove.map((item) => item.playlistId),
        );

        await this.database.playlistItems
          .where("id")
          .anyOf([...removedItemIds])
          .delete();

        for (const playlistId of affectedPlaylistIds) {
          const playlist = await this.database.playlists.get(
            playlistId,
          );
          if (
            playlist === undefined ||
            playlist.currentItemId === null
          ) {
            continue;
          }
          if (removedItemIds.has(playlist.currentItemId)) {
            const remaining = await this.database.playlistItems
              .where("playlistId")
              .equals(playlistId)
              .sortBy("position");
            await this.database.playlists.update(playlistId, {
              currentItemId:
                remaining.length > 0 ? remaining[0].id : null,
              updatedAt: new Date().toISOString(),
            });
          }
        }

        await this.database.resources.bulkDelete(resourceIds);
        await this.database.resourceVersions
          .where("resourceId")
          .anyOf(resourceIds)
          .delete();
        await this.database.libraryItems
          .where("resourceId")
          .anyOf(resourceIds)
          .delete();
        await this.database.resourceDependencies
          .where("parentVersionId")
          .anyOf([...versionIds])
          .delete();
        await this.database.resourceDependencies
          .where("dependencyVersionId")
          .anyOf([...versionIds])
          .delete();
      },
    );

    const artifactPins = await Promise.all(
      sha256s.map(async (sha256) => ({
        sha256,
        pinned: await this.syncArtifactPin(sha256),
      })),
    );
    await Promise.all(
      artifactPins
        .filter((artifact) => !artifact.pinned)
        .map((artifact) =>
          Promise.all([
            this.cache.artifactBlobs.delete(artifact.sha256),
            this.cache.artifactFiles
              .where("sha256")
              .equals(artifact.sha256)
              .delete(),
            this.database.artifactMetadata.delete(artifact.sha256),
          ]),
        ),
    );
    await pruneArtifactCache(this.database, this.cache);
  }

  private async syncArtifactPin(sha256: string): Promise<boolean> {
    const versions = await this.database.resourceVersions
      .where("sha256")
      .equals(sha256)
      .toArray();
    const versionIds = new Set(versions.map((version) => version.id));
    const installedReference = (
      await this.database.libraryItems.toArray()
    ).find(
      (item) =>
        item.resourceVersionId !== null &&
        versionIds.has(item.resourceVersionId),
    );
    await this.database.artifactMetadata.update(sha256, {
      pinned: installedReference !== undefined,
      ...(installedReference?.resourceVersionId === null ||
      installedReference?.resourceVersionId === undefined
        ? {}
        : { resourceVersionId: installedReference.resourceVersionId }),
    });
    return installedReference !== undefined;
  }
}
