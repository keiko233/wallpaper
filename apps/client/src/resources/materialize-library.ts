import type {
  WallpaperCacheDatabase,
  WallpaperClientDatabase,
} from "../db";
import {
  createVirtualResourceUrl,
  registerPlayerResourceUrl,
} from "@wallpaper/player/resource-url";
import type {
  ModelList,
  MotionList,
  StageList,
} from "@wallpaper/player/types";
import type { BundledPlayerResources } from "../app/types";

export interface MaterializedPlayerResources {
  models: ModelList[];
  motions: MotionList[];
  stages: StageList[];
  dispose(): void;
}

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/").replace(/^\.\/+/u, "");
}

function entrypointValues(
  entrypoints: Record<string, string | string[]>,
  keys: string[],
): string[] {
  for (const key of keys) {
    const value = entrypoints[key];
    if (typeof value === "string") return [normalizePath(value)];
    if (Array.isArray(value)) return value.map(normalizePath);
  }
  return [];
}

function inferPaths(
  paths: string[],
  extensions: string[],
  multiple = false,
): string[] {
  const matches = paths.filter((path) =>
    extensions.some((extension) =>
      path.toLowerCase().endsWith(extension),
    ),
  );
  return multiple ? matches : matches.slice(0, 1);
}

function resolvePaths(
  entrypoints: Record<string, string | string[]>,
  keys: string[],
  paths: string[],
  extensions: string[],
  multiple = false,
): string[] {
  const configured = entrypointValues(entrypoints, keys);
  const resolved =
    configured.length > 0
      ? configured
      : inferPaths(paths, extensions, multiple);
  const available = new Set(paths);
  const missing = resolved.find((path) => !available.has(path));
  if (missing !== undefined) {
    throw new Error(`Artifact entrypoint does not exist: ${missing}`);
  }
  if (resolved.length === 0) {
    throw new Error(
      `Artifact has no compatible ${keys.join("/")} entrypoint.`,
    );
  }
  return resolved;
}

interface VersionFiles {
  versionId: string;
  sha256: string;
  paths: string[];
  virtualUrls: Map<string, string>;
  entrypoints: Record<string, string | string[]>;
}

function resolveVirtualUrl(
  files: VersionFiles,
  keys: string[],
  extensions: string[],
): string {
  const [path] = resolvePaths(
    files.entrypoints,
    keys,
    files.paths,
    extensions,
  );
  const virtualUrl = files.virtualUrls.get(path);
  if (virtualUrl === undefined) {
    throw new Error(`Missing virtual URL for entrypoint ${keys.join("/")}.`);
  }
  return virtualUrl;
}

export async function materializeLibrary(
  database: WallpaperClientDatabase,
  cache: WallpaperCacheDatabase,
  bundled: BundledPlayerResources,
): Promise<MaterializedPlayerResources> {
  const resources: MaterializedPlayerResources = {
    models: [...bundled.models],
    motions: [...bundled.motions],
    stages: [...bundled.stages],
    dispose: () => undefined,
  };
  const objectUrls: string[] = [];
  const unregisterCallbacks: (() => void)[] = [];
  const libraryItems = await database.libraryItems
    .where("source")
    .equals("remote")
    .toArray();

  const fileMap = new Map<string, VersionFiles>();
  const resourceMap = new Map<
    string,
    { resource: { id: string; kind: string; name: string; description: string | null; visibility: string }; versionId: string }
  >();

  for (const libraryItem of libraryItems) {
    if (libraryItem.resourceVersionId === null) continue;
    const [resource, version] = await Promise.all([
      database.resources.get(libraryItem.resourceId),
      database.resourceVersions.get(libraryItem.resourceVersionId),
    ]);
    if (resource === undefined || version === undefined) continue;

    const objectUrlStart = objectUrls.length;
    const unregisterStart = unregisterCallbacks.length;
    try {
      const files = await cache.artifactFiles
        .where("sha256")
        .equals(version.sha256)
        .toArray();
      if (files.length === 0) continue;
      const paths = files.map((file) => normalizePath(file.path));
      const virtualUrls = new Map<string, string>();
      for (const file of files) {
        const path = normalizePath(file.path);
        const virtualUrl = createVirtualResourceUrl(
          version.sha256,
          path,
        );
        const objectUrl = URL.createObjectURL(file.blob);
        objectUrls.push(objectUrl);
        unregisterCallbacks.push(
          registerPlayerResourceUrl(virtualUrl, objectUrl),
        );
        virtualUrls.set(path, virtualUrl);
      }

      fileMap.set(version.id, {
        versionId: version.id,
        sha256: version.sha256,
        paths,
        virtualUrls,
        entrypoints: version.entrypoints,
      });
      resourceMap.set(version.id, { resource, versionId: version.id });

      const accessedAt = new Date().toISOString();
      await Promise.all([
        cache.artifactFiles
          .where("sha256")
          .equals(version.sha256)
          .modify({ lastAccessedAt: accessedAt }),
        cache.artifactBlobs.update(version.sha256, {
          lastAccessedAt: accessedAt,
        }),
        database.artifactMetadata.update(version.sha256, {
          lastAccessedAt: accessedAt,
        }),
      ]);
    } catch (error) {
      for (const unregister of unregisterCallbacks.splice(
        unregisterStart,
      )) {
        unregister();
      }
      for (const objectUrl of objectUrls.splice(objectUrlStart)) {
        URL.revokeObjectURL(objectUrl);
      }
      console.error(
        `Unable to materialize resource ${resource.id} from source ${resource.sourceName ?? resource.sourceId ?? "unknown"}.`,
        error,
      );
    }
  }

  for (const { resource, versionId } of resourceMap.values()) {
    if (resource.visibility === "dependency-only") continue;

    const files = fileMap.get(versionId);
    if (files === undefined) continue;
    const id = `remote:${resource.id}`;

    switch (resource.kind) {
      case "model": {
        const [modelPath] = resolvePaths(
          files.entrypoints,
          ["model"],
          files.paths,
          [".pmx"],
        ).map((path) => files.virtualUrls.get(path)!);
        resources.models.push({
          id,
          name: resource.name,
          modelPath,
          remark: resource.description ?? undefined,
        });
        break;
      }
      case "motion": {
        const motionPath = resolvePaths(
          files.entrypoints,
          ["motions", "motion"],
          files.paths,
          [".vmd", ".bvmd"],
          true,
        ).map((path) => files.virtualUrls.get(path)!);

        let audioPath: string | undefined;
        let cameraPath: string | undefined;

        const dependencyRows = await database.resourceDependencies
          .where("parentVersionId")
          .equals(versionId)
          .toArray();
        for (const dependency of dependencyRows) {
          const dependencyFiles = fileMap.get(
            dependency.dependencyVersionId,
          );
          if (dependencyFiles === undefined) continue;
          if (dependency.binding === "audio") {
            audioPath = resolveVirtualUrl(
              dependencyFiles,
              ["audio"],
              [".mp3", ".ogg", ".wav", ".m4a", ".aac", ".flac"],
            );
          } else if (dependency.binding === "camera") {
            cameraPath = resolveVirtualUrl(
              dependencyFiles,
              ["camera"],
              [".vmd", ".bvmd"],
            );
          }
        }

        if (audioPath === undefined) {
          console.error(
            `Motion ${resource.id} is missing its bound audio dependency; skipping.`,
          );
          continue;
        }

        resources.motions.push({
          id,
          name: resource.name,
          motionPath,
          audioPath,
          cameraPath,
          remark: resource.description ?? undefined,
        });
        break;
      }
      case "stage": {
        const [stagePath] = resolvePaths(
          files.entrypoints,
          ["stage"],
          files.paths,
          [".pmx"],
        ).map((path) => files.virtualUrls.get(path)!);
        resources.stages.push({
          id,
          name: resource.name,
          stagePath,
          remark: resource.description ?? undefined,
        });
        break;
      }
    }
  }

  resources.dispose = () => {
    for (const unregister of unregisterCallbacks) unregister();
    for (const objectUrl of objectUrls) URL.revokeObjectURL(objectUrl);
  };
  return resources;
}
