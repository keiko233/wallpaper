import type {
  WallpaperCacheDatabase,
  WallpaperClientDatabase,
} from "./database";

export const DEFAULT_ARTIFACT_CACHE_LIMIT_BYTES = 1024 ** 3;

export interface ArtifactCachePruneResult {
  evictedSha256: string[];
  remainingBytes: number;
}

export async function pruneArtifactCache(
  database: WallpaperClientDatabase,
  cache: WallpaperCacheDatabase,
  maxBytes = DEFAULT_ARTIFACT_CACHE_LIMIT_BYTES,
): Promise<ArtifactCachePruneResult> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) {
    throw new RangeError(
      "Artifact cache limit must be a nonnegative integer.",
    );
  }

  const [metadata, blobs, files] = await Promise.all([
    database.artifactMetadata.toArray(),
    cache.artifactBlobs.toArray(),
    cache.artifactFiles.toArray(),
  ]);
  const metadataBySha = new Map(
    metadata.map((artifact) => [artifact.sha256, artifact]),
  );
  const bytesBySha = new Map<string, number>();
  const lastAccessedBySha = new Map<string, string>();

  for (const artifact of [...blobs, ...files]) {
    bytesBySha.set(
      artifact.sha256,
      (bytesBySha.get(artifact.sha256) ?? 0) + artifact.byteSize,
    );
    const previous = lastAccessedBySha.get(artifact.sha256);
    if (
      previous === undefined ||
      artifact.lastAccessedAt < previous
    ) {
      lastAccessedBySha.set(
        artifact.sha256,
        artifact.lastAccessedAt,
      );
    }
  }

  let remainingBytes = [...bytesBySha.values()].reduce(
    (total, byteSize) => total + byteSize,
    0,
  );
  const candidates = [...bytesBySha.keys()]
    .filter((sha256) => metadataBySha.get(sha256)?.pinned !== true)
    .sort((left, right) =>
      (lastAccessedBySha.get(left) ?? "").localeCompare(
        lastAccessedBySha.get(right) ?? "",
      ),
    );
  const evictedSha256: string[] = [];

  for (const sha256 of candidates) {
    if (remainingBytes <= maxBytes) break;
    await Promise.all([
      cache.artifactBlobs.delete(sha256),
      cache.artifactFiles.where("sha256").equals(sha256).delete(),
    ]);
    await database.artifactMetadata.delete(sha256);
    remainingBytes -= bytesBySha.get(sha256) ?? 0;
    evictedSha256.push(sha256);
  }

  return {
    evictedSha256,
    remainingBytes,
  };
}
