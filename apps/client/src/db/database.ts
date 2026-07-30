import Dexie, {
  type DexieOptions,
  type Table,
  type Transaction,
} from "dexie";
import type {
  ArtifactBlobRecord,
  ArtifactFileRecord,
  ArtifactMetadataRecord,
  CachedResourceRecord,
  CachedResourceVersionRecord,
  LibraryItemRecord,
  MetadataRecord,
  PlaylistItemRecord,
  PlaylistRecord,
  ResourceSourceRecord,
  SettingRecord,
  SourceCatalogRecord,
} from "./models";

export const CLIENT_DATABASE_NAME = "wallpaper-client";
export const CLIENT_CACHE_DATABASE_NAME = "wallpaper-cache";

export const CLIENT_DB_V1_STORES = {
  meta: "key, updatedAt",
  devices: "id, createdAt, lastSeenAt",
  settings: "key, updatedAt",
  resources: "id, kind, updatedAt, [kind+updatedAt], *tags",
  resourceVersions: "id, resourceId, [resourceId+publishedAt], sha256",
  libraryItems: "resourceId, kind, addedAt",
  playlists: "id, updatedAt",
  playlistItems:
    "id, playlistId, [playlistId+position], modelId, motionId, stageId",
} as const;

const CLIENT_DB_V2_STORES = {
  ...CLIENT_DB_V1_STORES,
  libraryItems: "resourceId, kind, source, addedAt",
  artifactMetadata:
    "sha256, resourceVersionId, storage, lastAccessedAt",
} as const;

const CLIENT_DB_V3_STORES = {
  ...CLIENT_DB_V2_STORES,
  libraryItems:
    "resourceId, resourceVersionId, kind, source, addedAt",
  credentials: "serverOrigin, expiresAt, installationId",
} as const;

const CLIENT_DB_V4_STORES = {
  ...CLIENT_DB_V3_STORES,
  credentials: null,
} as const;

export const CLIENT_DB_V5_STORES = {
  ...CLIENT_DB_V4_STORES,
  devices: null,
} as const;

export const CLIENT_DB_V6_STORES = {
  ...CLIENT_DB_V5_STORES,
  resourceSources:
    "id, baseUrl, catalogUrl, name, enabled, isDefault, updatedAt",
  sourceCatalogs: "sourceId, revision, refreshedAt",
} as const;

export const CLIENT_DB_V7_STORES = {
  ...CLIENT_DB_V6_STORES,
  resources:
    "id, sourceId, [sourceId+upstreamId], kind, updatedAt, *tags",
  resourceVersions:
    "id, sourceId, [sourceId+upstreamId], resourceId, sha256, publishedAt",
  libraryItems:
    "resourceId, [resourceId+resourceVersionId], sourceId, kind, source, addedAt",
  artifactMetadata:
    "sha256, resourceVersionId, storage, lastAccessedAt",
} as const;

const CACHE_DB_V1_STORES = {
  queries: "key, catalogVersion, expiresAt",
  artifactBlobs: "sha256, lastAccessedAt",
} as const;

const CACHE_DB_V2_STORES = {
  ...CACHE_DB_V1_STORES,
  artifactFiles:
    "[sha256+path], sha256, path, lastAccessedAt",
} as const;

const CACHE_DB_V3_STORES = {
  ...CACHE_DB_V2_STORES,
} as const;

const CACHE_DB_V4_STORES = {
  ...CACHE_DB_V3_STORES,
  queries: null,
} as const;

export class WallpaperClientDatabase extends Dexie {
  meta!: Table<MetadataRecord, string>;
  settings!: Table<SettingRecord, string>;
  resources!: Table<CachedResourceRecord, string>;
  resourceVersions!: Table<CachedResourceVersionRecord, string>;
  libraryItems!: Table<LibraryItemRecord, string>;
  playlists!: Table<PlaylistRecord, string>;
  playlistItems!: Table<PlaylistItemRecord, string>;
  artifactMetadata!: Table<ArtifactMetadataRecord, string>;
  resourceSources!: Table<ResourceSourceRecord, string>;
  sourceCatalogs!: Table<SourceCatalogRecord, string>;

  constructor(
    name = CLIENT_DATABASE_NAME,
    options?: DexieOptions,
  ) {
    super(name, options);

    this.version(1).stores(CLIENT_DB_V1_STORES);
    this.version(2)
      .stores(CLIENT_DB_V2_STORES)
      .upgrade(async (transaction: Transaction) => {
        await transaction
          .table<LibraryItemRecord, string>("libraryItems")
          .toCollection()
          .modify((item) => {
            item.source ??= "remote";
          });
      });
    this.version(3)
      .stores(CLIENT_DB_V3_STORES)
      .upgrade(async (transaction: Transaction) => {
        await Promise.all([
          transaction
            .table<LibraryItemRecord, string>("libraryItems")
            .toCollection()
            .modify((item) => {
              item.resourceVersionId ??= null;
            }),
          transaction
            .table<CachedResourceVersionRecord, string>(
              "resourceVersions",
            )
            .toCollection()
            .modify((version) => {
              version.fileName ??= `${version.id}.${
                version.format === "zip" ? "zip" : "bin"
              }`;
              version.contentType ??= "application/octet-stream";
              version.entrypoints ??= {};
            }),
          transaction
            .table<ArtifactMetadataRecord, string>(
              "artifactMetadata",
            )
            .toCollection()
            .modify((artifact) => {
              artifact.pinned ??= true;
            }),
        ]);
      });
    this.version(4)
      .stores(CLIENT_DB_V4_STORES)
      .upgrade(async (transaction: Transaction) => {
        const resources = transaction.table<
          CachedResourceRecord,
          string
        >("resources");
        await resources.toCollection().modify((resource) => {
          resource.categories ??= [];
          resource.currentVersion ??= "0.0.0";
          resource.coverUrl ??= null;
        });

        const versions = transaction.table<
          Omit<CachedResourceVersionRecord, "format"> & {
            format: "raw" | "zip" | "bpmx";
          },
          string
        >("resourceVersions");
        const obsoleteVersions = await versions
          .filter((version) => version.format === "bpmx")
          .toArray();
        for (const obsolete of obsoleteVersions) {
          await Promise.all([
            versions.delete(obsolete.id),
            transaction
              .table<LibraryItemRecord, string>("libraryItems")
              .where("resourceVersionId")
              .equals(obsolete.id)
              .delete(),
            transaction
              .table<ArtifactMetadataRecord, string>(
                "artifactMetadata",
              )
              .delete(obsolete.sha256),
          ]);
        }
      });
    this.version(5).stores(CLIENT_DB_V5_STORES);
    this.version(6).stores(CLIENT_DB_V6_STORES);
    this.version(7)
      .stores(CLIENT_DB_V7_STORES)
      .upgrade(async (transaction: Transaction) => {
        await Promise.all([
          transaction.table("resources").clear(),
          transaction.table("resourceVersions").clear(),
          transaction.table("libraryItems").clear(),
          transaction.table("artifactMetadata").clear(),
          transaction.table("playlists").clear(),
          transaction.table("playlistItems").clear(),
        ]);
      });

    this.on("versionchange", () => {
      this.close();
    });
  }
}

export class WallpaperCacheDatabase extends Dexie {
  artifactBlobs!: Table<ArtifactBlobRecord, string>;
  artifactFiles!: Table<ArtifactFileRecord, [string, string]>;

  constructor(
    name = CLIENT_CACHE_DATABASE_NAME,
    options?: DexieOptions,
  ) {
    super(name, options);
    this.version(1).stores(CACHE_DB_V1_STORES);
    this.version(2).stores(CACHE_DB_V2_STORES);
    this.version(3)
      .stores(CACHE_DB_V3_STORES)
      .upgrade((transaction: Transaction) =>
        transaction.table("queries").clear(),
      );
    this.version(4).stores(CACHE_DB_V4_STORES);

    this.on("versionchange", () => {
      this.close();
    });
  }
}
