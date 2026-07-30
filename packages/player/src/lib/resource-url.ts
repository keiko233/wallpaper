import { Tools } from "@babylonjs/core/Misc/tools";

const VIRTUAL_RESOURCE_PREFIX = "/__wallpaper_resources/";
const resourceUrls = new Map<string, string>();
let installed = false;

function canonicalResourceUrl(value: string): string {
  if (value.startsWith("blob:") || value.startsWith("data:")) {
    return value;
  }

  try {
    const url = new URL(value, "https://wallpaper.invalid");
    return decodeURIComponent(url.pathname)
      .replaceAll("\\", "/")
      .replace(/\/+/gu, "/");
  } catch {
    return value.replaceAll("\\", "/").replace(/\/+/gu, "/");
  }
}

function ensureResolverInstalled(): void {
  if (installed) return;
  installed = true;
  const previousResolver = Tools.PreprocessUrl;
  Tools.PreprocessUrl = (url) => {
    const previousResult = previousResolver(url);
    return (
      resourceUrls.get(canonicalResourceUrl(previousResult)) ??
      resourceUrls.get(canonicalResourceUrl(url)) ??
      previousResult
    );
  };
}

export function createVirtualResourceUrl(
  sha256: string,
  path: string,
): string {
  const encodedPath = path
    .replaceAll("\\", "/")
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
  return `${VIRTUAL_RESOURCE_PREFIX}${encodeURIComponent(
    sha256,
  )}/${encodedPath}`;
}

export function registerPlayerResourceUrl(
  virtualUrl: string,
  objectUrl: string,
): () => void {
  ensureResolverInstalled();
  const key = canonicalResourceUrl(virtualUrl);
  resourceUrls.set(key, objectUrl);
  return () => {
    if (resourceUrls.get(key) === objectUrl) resourceUrls.delete(key);
  };
}

export function resolvePlayerResourceUrl(url: string): string {
  ensureResolverInstalled();
  return resourceUrls.get(canonicalResourceUrl(url)) ?? url;
}
