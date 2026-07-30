import {
  cp,
  mkdir,
  readFile,
  stat,
} from "node:fs/promises";
import { basename, dirname, extname, resolve, sep } from "node:path";
import type { Plugin } from "vite";

const COMMON_PUBLIC_PATHS = ["/favicon.svg", "/icons.svg"] as const;

interface BundledAssetsPluginOptions {
  resourcesDirectory: string;
  resourcePaths: readonly string[];
}

function normalizePublicPath(value: string): string {
  const path = value.replaceAll("\\", "/");
  if (
    !path.startsWith("/") ||
    path.includes("\0") ||
    path.split("/").includes("..")
  ) {
    throw new Error(`Invalid bundled public path: ${value}`);
  }
  return path.replace(/\/+/gu, "/");
}

function contentType(path: string): string {
  switch (extname(path).toLowerCase()) {
    case ".bmp":
      return "image/bmp";
    case ".gif":
      return "image/gif";
    case ".jpeg":
    case ".jpg":
      return "image/jpeg";
    case ".mp3":
      return "audio/mpeg";
    case ".png":
      return "image/png";
    case ".svg":
      return "image/svg+xml";
    case ".wav":
      return "audio/wav";
    default:
      return "application/octet-stream";
  }
}

export function bundledAssets(
  options: BundledAssetsPluginOptions,
): Plugin {
  const resourcePaths = [
    ...new Set(options.resourcePaths.map(normalizePublicPath)),
  ];
  const servedPaths = [...COMMON_PUBLIC_PATHS, ...resourcePaths];
  let root = process.cwd();
  let publicDirectory = resolve(root, "public");
  const resourcesDirectory = resolve(options.resourcesDirectory);

  function resolveSourceFile(publicPath: string): string {
    const isResource =
      publicPath === "/resources" ||
      publicPath.startsWith("/resources/");
    const sourceRoot = isResource
      ? resourcesDirectory
      : publicDirectory;
    const relativePath = isResource
      ? publicPath.replace(/^\/resources\/?/u, "")
      : publicPath.replace(/^\/+/u, "");
    const file = resolve(sourceRoot, relativePath);
    if (
      file !== sourceRoot &&
      !file.startsWith(`${sourceRoot}${sep}`)
    ) {
      throw new Error(`Public path escapes its root: ${publicPath}`);
    }
    return file;
  }

  return {
    name: "wallpaper-bundled-assets",
    configResolved(config) {
      root = config.root;
      publicDirectory = resolve(root, "public");
    },
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (request.url === undefined) return next();
        let path: string;
        try {
          path = decodeURIComponent(
            new URL(request.url, "http://wallpaper.local").pathname,
          );
        } catch {
          return next();
        }
        const isAllowed = servedPaths.some(
          (allowed) =>
            path === allowed || path.startsWith(`${allowed}/`),
        );
        if (!isAllowed) return next();

        try {
          const source = resolveSourceFile(path);
          const sourceStats = await stat(source);
          if (!sourceStats.isFile()) return next();
          const body = await readFile(source);
          response.statusCode = 200;
          response.setHeader("content-type", contentType(path));
          response.setHeader(
            "cache-control",
            "public, max-age=3600",
          );
          response.end(body);
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            return next();
          }
          next(error);
        }
      });
    },
    async writeBundle(outputOptions) {
      if (outputOptions.dir === undefined) return;
      const outputDirectory = resolve(outputOptions.dir);

      for (const publicPath of [
        ...COMMON_PUBLIC_PATHS,
        ...resourcePaths,
      ]) {
        const source = resolveSourceFile(publicPath);
        const target = resolve(
          outputDirectory,
          publicPath.replace(/^\/+/u, ""),
        );
        await mkdir(dirname(target), { recursive: true });
        const sourceStats = await stat(source);
        await cp(source, target, {
          recursive: sourceStats.isDirectory(),
          filter: (candidate) => basename(candidate) !== ".DS_Store",
        });
      }
    },
  };
}
