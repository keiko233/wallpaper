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
import type { ArtifactFileRecord, ResourceSourceRecord } from "../db";
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
    const resourceIds = resources.map((resource) => resource.id);
    const versions = await this.database.resourceVersions
      .where("sourceId")
      .equals(sourceId)
      .toArray();
    const versionIds = new Set(
      versions.map((version) => version.id),
    );
    const sha256s = [
      ...new Set(versions.map((version) => version.sha256)),
    ];

    const libraryItems = await this.database.libraryItems
      .where("resourceId")
      .anyOf(resourceIds)
      .toArray();
    const runtimeIds = new Set(
      libraryItems.map((item) => `remote:${item.resourceId}`),
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
            runtimeIds.has(item.modelId) ||
            runtimeIds.has(item.motionId) ||
            runtimeIds.has(item.stageId),
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

        await this.database.resources
          .where("sourceId")
          .equals(sourceId)
          .delete();
        await this.database.resourceVersions
          .where("sourceId")
          .equals(sourceId)
          .delete();
        await this.database.libraryItems
          .where("sourceId")
          .equals(sourceId)
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

    await Promise.all(
      sha256s.map((sha256) => this.syncArtifactPin(sha256)),
    );

    await this.sourceService.remove(sourceId);
    await pruneArtifactCache(this.database, this.cache);
  }

  private async syncArtifactPin(sha256: string): Promise<void> {
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
  }
}
