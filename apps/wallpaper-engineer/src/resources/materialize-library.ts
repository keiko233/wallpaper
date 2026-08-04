import type {
  WallpaperCacheDatabase,
  WallpaperClientDatabase,
} from "../db";
import {
  createVirtualResourceUrl,
  registerPlayerResourceUrl,
} from "@wallpaper/player/resource-url";
import {
  resolveArtifactEntrypoints,
  type ArtifactEntrypoints,
  type ResolvedArtifactEntrypoint,
  type StageRenderProfile,
} from "@wallpaper/resource-schema";
import type {
  ModelList,
  MotionList,
  SkyboxList,
  StageList,
} from "@wallpaper/player/types";
import type { BundledPlayerResources } from "../app/types";

export interface MaterializedPlayerResources {
  models: ModelList[];
  motions: MotionList[];
  skyboxes: SkyboxList[];
  stages: StageList[];
  dispose(): void;
}

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/").replace(/^\.\/+/u, "");
}

function entrypointValues(
  entrypoints: ArtifactEntrypoints,
  keys: string[],
): string[] {
  return (
    configuredEntrypointOptions(entrypoints, keys).find(
      (entrypoint) => entrypoint.isDefault,
    )?.paths ?? []
  );
}

function configuredEntrypointOptions(
  entrypoints: ArtifactEntrypoints,
  keys: string[],
): ResolvedArtifactEntrypoint[] {
  return resolveArtifactEntrypoints(entrypoints, keys).map((entrypoint) => ({
    ...entrypoint,
    paths: entrypoint.paths.map(normalizePath),
  }));
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
  entrypoints: ArtifactEntrypoints,
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

function resolveVariantEntrypoints(
  entrypoints: ArtifactEntrypoints,
  keys: string[],
  paths: string[],
  extensions: string[],
  multiple: boolean,
): ResolvedArtifactEntrypoint[] {
  const configured = configuredEntrypointOptions(entrypoints, keys);
  const resolved =
    configured.length > 0
      ? configured
      : [
          {
            id: null,
            name: null,
            paths: inferPaths(paths, extensions, multiple),
            isDefault: true,
          },
        ];
  const available = new Set(paths);
  for (const entrypoint of resolved) {
    const missing = entrypoint.paths.find((path) => !available.has(path));
    if (missing !== undefined) {
      throw new Error(`Artifact entrypoint does not exist: ${missing}`);
    }
  }
  if (resolved.length === 0) {
    throw new Error(
      `Artifact has no compatible ${keys.join("/")} entrypoint.`,
    );
  }
  return resolved;
}

function resolveSelectableEntrypoints(
  entrypoints: ArtifactEntrypoints,
  keys: string[],
  paths: string[],
  extensions: string[],
): ResolvedArtifactEntrypoint[] {
  const configured = configuredEntrypointOptions(entrypoints, keys);
  const resolved =
    configured.length > 0
      ? configured
      : [
          {
            id: null,
            name: null,
            paths: inferPaths(paths, extensions),
            isDefault: true,
          },
        ];
  const available = new Set(paths);
  for (const entrypoint of resolved) {
    if (entrypoint.paths.length !== 1) {
      throw new Error(
        `${keys.join("/")} entrypoint ${entrypoint.id ?? "default"} must contain exactly one path.`,
      );
    }
    const missing = entrypoint.paths.find((path) => !available.has(path));
    if (missing !== undefined) {
      throw new Error(`Artifact entrypoint does not exist: ${missing}`);
    }
  }
  if (resolved[0]?.paths.length !== 1) {
    throw new Error(
      `Artifact has no compatible ${keys.join("/")} entrypoint.`,
    );
  }
  return resolved;
}

function playerIdForEntrypoint(
  id: string,
  entrypoint: ResolvedArtifactEntrypoint,
): string {
  return entrypoint.isDefault || entrypoint.id === null
    ? id
    : `${id}:${entrypoint.id}`;
}

function bundledSkyboxPlayerId(
  id: string,
  entrypoint: ResolvedArtifactEntrypoint,
): string {
  return entrypoint.isDefault || entrypoint.id === null
    ? `${id}:skybox`
    : `${id}:skybox:${entrypoint.id}`;
}

interface VersionFiles {
  versionId: string;
  sha256: string;
  paths: string[];
  virtualUrls: Map<string, string>;
  entrypoints: ArtifactEntrypoints;
  render: StageRenderProfile | undefined;
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
    skyboxes: [...bundled.skyboxes],
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
        render: version.render,
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
        for (const entrypoint of resolveSelectableEntrypoints(
          files.entrypoints,
          ["model"],
          files.paths,
          [".pmx"],
        )) {
          resources.models.push({
            id: playerIdForEntrypoint(id, entrypoint),
            name: entrypoint.name ?? resource.name,
            modelPath: files.virtualUrls.get(entrypoint.paths[0]!)!,
            ...(entrypoint.id === null
              ? {}
              : { group: resource.name }),
            remark: entrypoint.remark ?? resource.description ?? undefined,
          });
        }
        break;
      }
      case "motion": {
        const motionOptions = resolveVariantEntrypoints(
          files.entrypoints,
          ["motions", "motion"],
          files.paths,
          [".vmd", ".bvmd"],
          true,
        );

        let audioPath: string | undefined;
        let cameraFiles: VersionFiles | undefined;
        let cameraOptions: ResolvedArtifactEntrypoint[] | undefined;

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
            cameraFiles = dependencyFiles;
            cameraOptions = resolveVariantEntrypoints(
              dependencyFiles.entrypoints,
              ["camera"],
              dependencyFiles.paths,
              [".vmd", ".bvmd"],
              false,
            ).map((entrypoint) => ({
              ...entrypoint,
              paths: entrypoint.paths.slice(0, 1),
            }));
          }
        }

        if (audioPath === undefined) {
          console.error(
            `Motion ${resource.id} is missing its bound audio dependency; skipping.`,
          );
          continue;
        }

        const cameraOptionsOrNull = cameraOptions ?? [null];
        for (const motionOption of motionOptions) {
          const motionPath = motionOption.paths.map(
            (path) => files.virtualUrls.get(path)!,
          );
          for (const cameraOption of cameraOptionsOrNull) {
            const variantIds = [
              motionOption.id,
              cameraOption?.id ?? null,
            ].filter((id): id is string => id !== null);
            const hasVariants = variantIds.length > 0;
            resources.motions.push({
              id: hasVariants
                ? `${id}:${variantIds.join(":")}`
                : id,
              name:
                motionOption.id !== null &&
                cameraOption !== null &&
                cameraOption.id !== null
                  ? `${motionOption.name ?? resource.name} · ${cameraOption.name ?? ""}`
                  : (motionOption.name ??
                    cameraOption?.name ??
                    resource.name),
              motionPath,
              audioPath,
              cameraPath:
                cameraOption === null
                  ? undefined
                  : cameraFiles?.virtualUrls.get(
                      cameraOption.paths[0]!,
                    ),
              ...(hasVariants ? { group: resource.name } : {}),
              remark:
                motionOption.remark ??
                cameraOption?.remark ??
                resource.description ??
                undefined,
            });
          }
        }
        break;
      }
      case "stage": {
        for (const entrypoint of resolveSelectableEntrypoints(
          files.entrypoints,
          ["stage"],
          files.paths,
          [".pmx"],
        )) {
          resources.stages.push({
            id: playerIdForEntrypoint(id, entrypoint),
            name: entrypoint.name ?? resource.name,
            stagePath: files.virtualUrls.get(entrypoint.paths[0]!)!,
            ...(entrypoint.id === null
              ? {}
              : { group: resource.name }),
            remark: entrypoint.remark ?? resource.description ?? undefined,
            ...(files.render === undefined
              ? {}
              : { render: files.render }),
          });
        }
        if (files.entrypoints["skybox"] !== undefined) {
          for (const entrypoint of resolveSelectableEntrypoints(
            files.entrypoints,
            ["skybox"],
            files.paths,
            [".pmx"],
          )) {
            resources.skyboxes.push({
              id: bundledSkyboxPlayerId(id, entrypoint),
              name: entrypoint.name ?? `${resource.name} (Sky)`,
              skyboxPath: files.virtualUrls.get(entrypoint.paths[0]!)!,
              ...(entrypoint.id === null
                ? {}
                : { group: resource.name }),
              remark: entrypoint.remark ?? resource.description ?? undefined,
            });
          }
        }
        break;
      }
      case "skybox": {
        for (const entrypoint of resolveSelectableEntrypoints(
          files.entrypoints,
          ["skybox"],
          files.paths,
          [".pmx"],
        )) {
          resources.skyboxes.push({
            id: playerIdForEntrypoint(id, entrypoint),
            name: entrypoint.name ?? resource.name,
            skyboxPath: files.virtualUrls.get(entrypoint.paths[0]!)!,
            ...(entrypoint.id === null
              ? {}
              : { group: resource.name }),
            remark: entrypoint.remark ?? resource.description ?? undefined,
          });
        }
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
