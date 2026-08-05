import { createReadStream, watch } from "node:fs";
import { link, mkdir, readdir, realpath, rename, rm, stat } from "node:fs/promises";
import { resolve, sep } from "node:path";
import type { Dirent } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import {
  buildRepository,
  contentType,
  loadSite,
  type LoadedSite,
} from "@wallpaper/resource-catalog";

const RESOURCE_SOURCE_PREFIX = "/resource-source";
const RESOURCE_SOURCE_ROOT = `${RESOURCE_SOURCE_PREFIX}/`;

export interface LocalResourceSourceOptions {
  /** Absolute path to the resource site configuration file. */
  siteConfigPath: string;
}

export function parseSingleByteRange(
  rangeHeader: string,
  size: number,
): { start: number; end: number } | null {
  if (!Number.isFinite(size) || size <= 0) return null;
  const match = /^bytes=(\d*)-(\d*)$/iu.exec(rangeHeader.trim());
  if (match === null) return null;

  const startText = match[1];
  const endText = match[2];
  if (startText === "" && endText === "") return null;

  let start: number;
  let end: number;

  if (startText === "") {
    // Suffix range: `bytes=-N` requests the last N bytes.
    const suffix = Number.parseInt(endText, 10);
    if (!Number.isFinite(suffix) || suffix <= 0) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number.parseInt(startText, 10);
    if (!Number.isFinite(start) || start < 0 || start >= size) return null;
    if (endText === "") {
      end = size - 1;
    } else {
      end = Number.parseInt(endText, 10);
      if (!Number.isFinite(end) || end < start || end >= size) return null;
    }
  }

  return { start, end };
}

export function isSafeRelativePath(relativePath: string): boolean {
  if (
    relativePath.length === 0 ||
    relativePath.startsWith("/") ||
    relativePath.includes("\0") ||
    relativePath.includes("\\")
  ) {
    return false;
  }
  for (const segment of relativePath.split("/")) {
    if (segment === ".." || segment === ".") return false;
  }
  return true;
}

export function isAllowedRelativePath(relativePath: string): boolean {
  if (!isSafeRelativePath(relativePath)) return false;
  if (relativePath.endsWith("/")) return false;
  return (
    relativePath === "catalog.json" ||
    relativePath.startsWith("objects/")
  );
}

function isNodeError(value: unknown): value is NodeJS.ErrnoException {
  return value instanceof Error && "code" in value;
}

function logBuildError(error: unknown): void {
  console.error(
    "[wallpaper-local-resource-source] Repository rebuild failed:",
    error,
  );
}

function sendMethodNotAllowed(response: ServerResponse): void {
  response.statusCode = 405;
  response.setHeader("Allow", "GET, HEAD");
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.end("Method Not Allowed");
}

function sendNotFound(response: ServerResponse): void {
  response.statusCode = 404;
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.end("Not Found");
}

function sendRangeNotSatisfiable(
  response: ServerResponse,
  size: number,
): void {
  response.statusCode = 416;
  response.setHeader("Content-Range", `bytes */${size}`);
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.end("Range Not Satisfiable");
}

function isHiddenResourceEntry(entry: Dirent): boolean {
  return entry.name === ".DS_Store" || entry.name.startsWith(".");
}

async function listManifestSourceFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (isHiddenResourceEntry(entry)) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listManifestSourceFiles(path)));
    } else if (entry.isFile()) {
      files.push(path);
    }
  }
  return files.sort();
}

async function mirrorManifestRootExcludingHidden(
  sourceDir: string,
  targetDir: string,
): Promise<void> {
  await rm(targetDir, { recursive: true, force: true });
  await mkdir(targetDir, { recursive: true });
  for (const entry of await readdir(sourceDir, { withFileTypes: true })) {
    if (isHiddenResourceEntry(entry)) continue;
    const sourcePath = resolve(sourceDir, entry.name);
    const targetPath = resolve(targetDir, entry.name);
    if (entry.isDirectory()) {
      await mirrorManifestRootExcludingHidden(sourcePath, targetPath);
    } else if (entry.isFile()) {
      await link(sourcePath, targetPath);
    } else if (entry.isSymbolicLink()) {
      const realPath = await realpath(sourcePath);
      const realStats = await stat(realPath);
      if (realStats.isDirectory()) {
        await mirrorManifestRootExcludingHidden(realPath, targetPath);
      } else {
        await link(realPath, targetPath);
      }
    }
  }
}

export function shouldTriggerRebuild(filename: string | null): boolean {
  if (filename === null) return true;
  const normalized = filename.replaceAll("\\", "/");
  return (
    !normalized.startsWith(".git/") && !normalized.includes("/.git/")
  );
}

export function localResourceSource(
  options: LocalResourceSourceOptions,
): Plugin {
  const siteConfigPath = resolve(options.siteConfigPath);

  return {
    name: "wallpaper-local-resource-source",
    apply: "serve",

    async configureServer(server) {
      let loadedSite: LoadedSite | undefined;
      let outputRoot: string | undefined;
      let servedRoot: string | undefined;
      const watchers: ReturnType<typeof watch>[] = [];
      let debounceTimer: ReturnType<typeof setTimeout> | null = null;
      let currentBuild: Promise<void> | null = null;
      let pendingBuild = false;
      let pendingForce = false;
      let pendingInitial = false;
      let pendingSiteReload = false;
      let scheduledSiteReload = false;

      async function detectServedRoot(): Promise<string | undefined> {
        if (outputRoot === undefined) return undefined;
        const rootCatalogPath = resolve(outputRoot, "catalog.json");
        const rootCatalogStats = await stat(rootCatalogPath).catch(
          () => null,
        );
        if (rootCatalogStats !== null && rootCatalogStats.isFile()) {
          return outputRoot;
        }
        const entries = await readdir(outputRoot, {
          withFileTypes: true,
        }).catch(() => []);
        const collectionEntries = entries.filter(
          (entry) => entry.isDirectory() && !entry.name.startsWith("."),
        );
        collectionEntries.sort((left, right) => {
          if (left.name === "defaults") return -1;
          if (right.name === "defaults") return 1;
          return left.name < right.name ? -1 : left.name > right.name ? 1 : 0;
        });
        for (const entry of collectionEntries) {
          const stats = await stat(
            resolve(outputRoot, entry.name, "catalog.json"),
          ).catch(() => null);
          if (stats !== null && stats.isFile()) {
            return resolve(outputRoot, entry.name);
          }
        }
        return outputRoot;
      }

      async function refreshSite(): Promise<void> {
        loadedSite = await loadSite(siteConfigPath);
        outputRoot = resolve(
          loadedSite.siteDir,
          loadedSite.site.outputDirectory,
        );
        servedRoot = await detectServedRoot();
      }

      async function catalogExists(): Promise<boolean> {
        const root = servedRoot ?? outputRoot;
        if (root === undefined) return false;
        const catalogPath = resolve(root, "catalog.json");
        const catalogStats = await stat(catalogPath).catch(() => null);
        return catalogStats !== null && catalogStats.isFile();
      }

      async function isOutputStale(): Promise<boolean> {
        const root = servedRoot ?? outputRoot;
        if (loadedSite === undefined || root === undefined) {
          return true;
        }
        const catalogPath = resolve(root, "catalog.json");
        const catalogStats = await stat(catalogPath).catch(() => null);
        if (catalogStats === null) return true;

        const catalogMtime = Math.max(
          catalogStats.mtimeMs,
          catalogStats.ctimeMs,
        );
        const siteStats = await stat(siteConfigPath).catch(() => null);
        if (
          siteStats !== null &&
          Math.max(siteStats.mtimeMs, siteStats.ctimeMs) > catalogMtime
        ) {
          return true;
        }

        const sourceFiles = await listManifestSourceFiles(
          loadedSite.manifestDir,
        );
        for (const file of sourceFiles) {
          const fileStats = await stat(file).catch(() => null);
          if (
            fileStats !== null &&
            Math.max(fileStats.mtimeMs, fileStats.ctimeMs) > catalogMtime
          ) {
            return true;
          }
        }
        return false;
      }

      async function buildIntoStaging(): Promise<void> {
        if (loadedSite === undefined || outputRoot === undefined) {
          throw new Error(
            "Cannot build local resource source before site is loaded.",
          );
        }
        const filteredManifestDir = `${loadedSite.manifestDir}.local-dev-filtered`;
        const stagingDirectory = `${outputRoot}.local-dev-staging`;
        const backupDirectory = `${outputRoot}.local-dev-backup`;
        let backupCreated = false;
        let preserveBackup = false;

        try {
          await mirrorManifestRootExcludingHidden(
            loadedSite.manifestDir,
            filteredManifestDir,
          );
          await rm(stagingDirectory, { recursive: true, force: true });
          await rm(backupDirectory, { recursive: true, force: true });

          const buildSite: LoadedSite = {
            ...loadedSite,
            manifestDir: filteredManifestDir,
          };
          await buildRepository(buildSite, stagingDirectory);

          // Move the previous output out of the way so the staging directory
          // can be activated at outputRoot. If there is no previous output,
          // ignore ENOENT.
          try {
            await rename(outputRoot, backupDirectory);
            backupCreated = true;
          } catch (error) {
            if (!isNodeError(error) || error.code !== "ENOENT") {
              throw error;
            }
          }

          try {
            await rename(stagingDirectory, outputRoot);
            servedRoot = await detectServedRoot();
          } catch (activationError) {
            // Activation failed. Restore the previous output if we have one.
            if (backupCreated) {
              try {
                await rename(backupDirectory, outputRoot);
                backupCreated = false;
              } catch (restoreError) {
                preserveBackup = true;
                throw new Error(
                  `Failed to activate new repository and could not restore the previous one: ${restoreError instanceof Error ? restoreError.message : String(restoreError)}`,
                  { cause: activationError },
                );
              }
            }
            throw activationError;
          }
        } finally {
          await rm(stagingDirectory, { recursive: true, force: true });
          if (!preserveBackup) {
            await rm(backupDirectory, { recursive: true, force: true });
          }
          await rm(filteredManifestDir, { recursive: true, force: true });
        }
      }

      async function runBuildQueue(): Promise<void> {
        while (pendingBuild) {
          const force = pendingForce;
          const initial = pendingInitial;
          const reloadSite = pendingSiteReload;
          pendingBuild = false;
          pendingForce = false;
          pendingInitial = false;
          pendingSiteReload = false;

          if (reloadSite) {
            await refreshSite();
            resetWatchers();
          }

          const stale = await isOutputStale();
          if (!force && !stale) continue;

          const previousCatalogExists = await catalogExists();
          try {
            await buildIntoStaging();
          } catch (error) {
            if (initial && !previousCatalogExists) {
              throw new Error(
                `Local resource source is missing and initial build failed: ${error instanceof Error ? error.message : String(error)}`,
                { cause: error },
              );
            }
            logBuildError(error);
          }
        }
      }

      async function ensureBuilt(
        force: boolean,
        initial = false,
        reloadSite = false,
      ): Promise<void> {
        pendingBuild = true;
        pendingForce ||= force;
        pendingInitial ||= initial;
        pendingSiteReload ||= reloadSite;

        if (currentBuild !== null) {
          return currentBuild;
        }

        currentBuild = runBuildQueue();
        try {
          await currentBuild;
        } finally {
          currentBuild = null;
        }
      }

      function scheduleBuild(reloadSite = false): void {
        scheduledSiteReload ||= reloadSite;
        if (debounceTimer !== null) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          debounceTimer = null;
          const shouldReloadSite = scheduledSiteReload;
          scheduledSiteReload = false;
          ensureBuilt(true, false, shouldReloadSite).catch((error) => {
            console.error(
              "[wallpaper-local-resource-source] Scheduled rebuild failed:",
              error,
            );
          });
        }, 300);
      }

      function closeWatchers(): void {
        for (const watcher of watchers) {
          try {
            watcher.close();
          } catch {
            // Ignore cleanup errors.
          }
        }
        watchers.length = 0;
      }

      function startWatchers(): void {
        if (loadedSite === undefined) return;
        try {
          watchers.push(
            watch(siteConfigPath, (_eventType, filename) => {
              if (shouldTriggerRebuild(filename)) scheduleBuild(true);
            }),
          );
        } catch (error) {
          console.warn(
            "[wallpaper-local-resource-source] Unable to watch site config:",
            error,
          );
        }
        try {
          watchers.push(
            watch(
              loadedSite.manifestDir,
              { recursive: true },
              (_eventType, filename) => {
                if (shouldTriggerRebuild(filename)) scheduleBuild(false);
              },
            ),
          );
        } catch (error) {
          console.warn(
            "[wallpaper-local-resource-source] Unable to watch manifest root:",
            error,
          );
        }
      }

      function resetWatchers(): void {
        closeWatchers();
        startWatchers();
      }

      function cleanup(): void {
        if (debounceTimer !== null) clearTimeout(debounceTimer);
        closeWatchers();
      }

      function serveResource(
        request: IncomingMessage,
        response: ServerResponse,
        next: (error?: unknown) => void,
        relativePath: string,
      ): void {
        const root = servedRoot ?? outputRoot;
        if (root === undefined) {
          return next();
        }
        const resolvedRoot = resolve(root);
        const file = resolve(resolvedRoot, relativePath);
        if (
          file !== resolvedRoot &&
          !file.startsWith(`${resolvedRoot}${sep}`)
        ) {
          return sendNotFound(response);
        }

        stat(file)
          .then((fileStats) => {
            if (!fileStats.isFile()) {
              return sendNotFound(response);
            }

            const size = fileStats.size;
            const method = request.method;
            const type = contentType(file);
            response.setHeader("Content-Type", type);
            response.setHeader("Accept-Ranges", "bytes");
            response.setHeader("Cache-Control", "no-store");

            if (method === "HEAD") {
              response.setHeader("Content-Length", String(size));
              response.statusCode = 200;
              response.end();
              return;
            }

            const rangeHeader = request.headers.range;
            if (rangeHeader !== undefined) {
              const range = parseSingleByteRange(rangeHeader, size);
              if (range === null) {
                return sendRangeNotSatisfiable(response, size);
              }
              response.statusCode = 206;
              response.setHeader(
                "Content-Range",
                `bytes ${range.start}-${range.end}/${size}`,
              );
              response.setHeader(
                "Content-Length",
                String(range.end - range.start + 1),
              );
              const stream = createReadStream(file, {
                start: range.start,
                end: range.end,
              });
              stream.on("error", next);
              stream.pipe(response);
              return;
            }

            response.setHeader("Content-Length", String(size));
            response.statusCode = 200;
            const stream = createReadStream(file);
            stream.on("error", next);
            stream.pipe(response);
          })
          .catch((error: unknown) => {
            if (isNodeError(error) && error.code === "ENOENT") {
              return sendNotFound(response);
            }
            return next(error);
          });
      }

      server.middlewares.use(
        (request: IncomingMessage, response: ServerResponse, next) => {
          const rawUrl = request.url ?? "/";
          let pathname: string;
          try {
            pathname = decodeURIComponent(
              new URL(rawUrl, "http://wallpaper.local").pathname,
            );
          } catch {
            return next();
          }
          if (!pathname.startsWith(RESOURCE_SOURCE_ROOT)) {
            if (pathname === RESOURCE_SOURCE_PREFIX) {
              return sendNotFound(response);
            }
            return next();
          }
          const method = request.method;
          if (method !== "GET" && method !== "HEAD") {
            return sendMethodNotAllowed(response);
          }
          const relativePath = pathname.slice(RESOURCE_SOURCE_ROOT.length);
          if (!isAllowedRelativePath(relativePath)) {
            return sendNotFound(response);
          }
          serveResource(request, response, next, relativePath);
        },
      );

      await refreshSite();
      await ensureBuilt(false, true);
      startWatchers();

      return cleanup;
    },
  };
}
