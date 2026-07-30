import type {
  ResourceCatalog,
  ResourceKind,
} from "@wallpaper/resource-catalog";

export type IsoDateTime = string;

export type ResourceSourceStatus = "idle" | "ok" | "stale" | "error";

export interface MetadataRecord {
  key: string;
  value: unknown;
  updatedAt: IsoDateTime;
}

export interface SettingRecord {
  key: string;
  value: unknown;
  updatedAt: IsoDateTime;
}

export interface CachedResourceRecord {
  id: string;
  sourceId: string;
  sourceName: string;
  upstreamId: string;
  kind: ResourceKind;
  name: string;
  description: string | null;
  categories: string[];
  tags: string[];
  publishedVersionId: string;
  currentVersion: string;
  coverUrl: string | null;
  catalogRevision: string;
  updatedAt: IsoDateTime;
}

export interface CachedResourceVersionRecord {
  id: string;
  sourceId: string;
  upstreamId: string;
  upstreamVersion: string;
  resourceId: string;
  artifactId: string;
  format: "raw" | "zip";
  fileName: string;
  contentType: string;
  sha256: string;
  byteSize: number;
  entrypoints: Record<string, string | string[]>;
  publishedAt: IsoDateTime;
}

export interface LibraryItemRecord {
  resourceId: string;
  resourceVersionId: string | null;
  sourceId: string | null;
  kind: ResourceKind;
  source: "bundled" | "remote";
  addedAt: IsoDateTime;
}

export interface PlaylistRecord {
  id: string;
  name: string;
  currentItemId: string | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
}

export interface PlaylistItemRecord {
  id: string;
  playlistId: string;
  position: number;
  modelId: string;
  motionId: string;
  audioId?: string;
  stageId: string;
}

export interface ArtifactMetadataRecord {
  sha256: string;
  resourceVersionId: string;
  storage: "cache-storage" | "indexeddb" | "bundled";
  byteSize: number;
  pinned: boolean;
  lastAccessedAt: IsoDateTime;
}

export interface ArtifactBlobRecord {
  sha256: string;
  byteSize: number;
  lastAccessedAt: IsoDateTime;
  blob: Blob;
}

export interface ArtifactFileRecord {
  sha256: string;
  path: string;
  contentType: string;
  byteSize: number;
  lastAccessedAt: IsoDateTime;
  blob: Blob;
}

export interface ResourceSourceRecord {
  id: string;
  baseUrl: string;
  catalogUrl: string;
  name: string;
  description: string | null;
  homepage: string | null;
  enabled: boolean;
  isDefault: boolean;
  status: ResourceSourceStatus;
  schemaVersion: 1 | 2 | null;
  revision: string | null;
  lastError: string | null;
  lastErrorAt: IsoDateTime | null;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  lastAttemptedAt: IsoDateTime | null;
  lastSuccessfulAt: IsoDateTime | null;
}

export interface SourceCatalogRecord {
  sourceId: string;
  catalog: ResourceCatalog;
  revision: string;
  refreshedAt: IsoDateTime;
}
