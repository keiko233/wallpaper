import { tmpdir } from "node:os";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { ViteDevServer } from "vite";
import {
  isAllowedRelativePath,
  isSafeRelativePath,
  localResourceSource,
  parseSingleByteRange,
  shouldTriggerRebuild,
} from "../build/local-resource-source-vite-plugin.js";

async function createTempSiteRoot(): Promise<{
  root: string;
  siteConfigPath: string;
}> {
  const root = await mkdtemp(
    resolve(tmpdir(), "local-resource-source-"),
  );
  const siteConfigPath = resolve(root, "resource-site.json");
  await writeFile(
    siteConfigPath,
    JSON.stringify({
      schemaVersion: 1,
      repository: {
        name: "Test Repository",
        description: null,
        homepage: null,
      },
      manifestRoot: "manifests",
      outputDirectory: "output",
    }),
  );
  return { root, siteConfigPath };
}

function createFakeServer(): {
  middlewares: { use: (handler: unknown) => void };
} {
  return {
    middlewares: {
      use: () => undefined,
    },
  };
}

describe("parseSingleByteRange", () => {
  it("returns null for non-finite or zero size", () => {
    expect(parseSingleByteRange("bytes=0-9", 0)).toBeNull();
    expect(parseSingleByteRange("bytes=0-9", Number.NaN)).toBeNull();
  });

  it("parses a closed byte range", () => {
    expect(parseSingleByteRange("bytes=0-9", 100)).toEqual({
      start: 0,
      end: 9,
    });
    expect(parseSingleByteRange("bytes=10-19", 100)).toEqual({
      start: 10,
      end: 19,
    });
  });

  it("parses an open-ended byte range", () => {
    expect(parseSingleByteRange("bytes=90-", 100)).toEqual({
      start: 90,
      end: 99,
    });
    expect(parseSingleByteRange("bytes=0-", 1)).toEqual({ start: 0, end: 0 });
  });

  it("parses a suffix byte range", () => {
    expect(parseSingleByteRange("bytes=-5", 100)).toEqual({
      start: 95,
      end: 99,
    });
    expect(parseSingleByteRange("bytes=-100", 10)).toEqual({
      start: 0,
      end: 9,
    });
  });

  it("rejects ranges that extend past the resource", () => {
    expect(parseSingleByteRange("bytes=0-100", 100)).toBeNull();
    expect(parseSingleByteRange("bytes=100-105", 100)).toBeNull();
    expect(parseSingleByteRange("bytes=-0", 100)).toBeNull();
  });

  it("rejects multiple or malformed ranges", () => {
    expect(parseSingleByteRange("bytes=0-9,20-29", 100)).toBeNull();
    expect(parseSingleByteRange("bytes=-", 100)).toBeNull();
    expect(parseSingleByteRange("letters=0-9", 100)).toBeNull();
    expect(parseSingleByteRange("", 100)).toBeNull();
  });
});

describe("isSafeRelativePath", () => {
  it("accepts ordinary relative paths", () => {
    expect(isSafeRelativePath("catalog.json")).toBe(true);
    expect(isSafeRelativePath("objects/model/x/1.0.0/hash/file.zip")).toBe(
      true,
    );
  });

  it("rejects traversal and absolute paths", () => {
    expect(isSafeRelativePath("../catalog.json")).toBe(false);
    expect(isSafeRelativePath("objects/../../catalog.json")).toBe(false);
    expect(isSafeRelativePath("/etc/passwd")).toBe(false);
    expect(isSafeRelativePath("catalog.json\0.txt")).toBe(false);
    expect(isSafeRelativePath("objects\\model\\file.zip")).toBe(false);
    expect(isSafeRelativePath("./catalog.json")).toBe(false);
    expect(isSafeRelativePath("")).toBe(false);
  });
});

describe("isAllowedRelativePath", () => {
  it("allows the catalog and objects tree", () => {
    expect(isAllowedRelativePath("catalog.json")).toBe(true);
    expect(
      isAllowedRelativePath("objects/audio/song/1.0.0/abc/song.mp3"),
    ).toBe(true);
  });

  it("rejects paths outside the allowed set", () => {
    expect(isAllowedRelativePath("index.html")).toBe(false);
    expect(isAllowedRelativePath("objects")).toBe(false);
    expect(isAllowedRelativePath("objects/")).toBe(false);
    expect(isAllowedRelativePath("../catalog.json")).toBe(false);
  });
});

describe("shouldTriggerRebuild", () => {
  it("ignores events inside the manifest .git directory", () => {
    expect(shouldTriggerRebuild(".git/HEAD")).toBe(false);
    expect(shouldTriggerRebuild("objects/.git/config")).toBe(false);
  });

  it("accepts normal manifest or site-config paths", () => {
    expect(shouldTriggerRebuild("resource-site.json")).toBe(true);
    expect(shouldTriggerRebuild("bibbidiba/manifest.json")).toBe(true);
    expect(shouldTriggerRebuild(null)).toBe(true);
  });
});

describe("localResourceSource configureServer", () => {
  it("fails startup when no usable catalog exists and the build fails", async () => {
    const { root, siteConfigPath } = await createTempSiteRoot();
    await mkdir(resolve(root, "manifests", "bad-resource"), {
      recursive: true,
    });

    const plugin = localResourceSource({ siteConfigPath });
    const fakeServer = createFakeServer();
    const configureServer = plugin.configureServer as unknown as (
      server: ViteDevServer,
    ) => Promise<() => void>;

    await expect(configureServer(fakeServer as ViteDevServer)).rejects.toThrow(
      "initial build failed",
    );

    await rm(root, { recursive: true, force: true });
  });

  it("registers a middleware and resolves when an up-to-date catalog exists", async () => {
    const { root, siteConfigPath } = await createTempSiteRoot();
    await mkdir(resolve(root, "manifests"), { recursive: true });
    await mkdir(resolve(root, "output"), { recursive: true });
    await writeFile(
      resolve(root, "output", "catalog.json"),
      JSON.stringify({
        schemaVersion: 2,
        repository: {
          name: "Test Repository",
          description: null,
          homepage: null,
        },
        revision: "a".repeat(64),
        resources: [],
      }),
    );

    const plugin = localResourceSource({ siteConfigPath });
    const registered: unknown[] = [];
    const fakeServer = {
      middlewares: {
        use: (handler: unknown): void => {
          registered.push(handler);
        },
      },
    };

    const configureServer = plugin.configureServer as unknown as (
      server: ViteDevServer,
    ) => Promise<() => void>;
    const cleanup = await configureServer(fakeServer as ViteDevServer);
    expect(registered.length).toBeGreaterThan(0);
    cleanup?.();

    await rm(root, { recursive: true, force: true });
  });
});
