import { describe, expect, it } from "vitest";
import {
  normalizeR2Prefix,
  resolveR2BucketName,
  r2ObjectKey,
} from "../src/builder";

describe("R2 prefix normalization", () => {
  it("accepts empty or undefined as root", () => {
    expect(normalizeR2Prefix(undefined)).toBe("");
    expect(normalizeR2Prefix("")).toBe("");
    expect(normalizeR2Prefix("   ")).toBe("");
    expect(normalizeR2Prefix("/")).toBe("");
  });

  it("normalizes leading and trailing slashes", () => {
    expect(normalizeR2Prefix("wallpaper")).toBe("wallpaper");
    expect(normalizeR2Prefix("/wallpaper")).toBe("wallpaper");
    expect(normalizeR2Prefix("wallpaper/")).toBe("wallpaper");
    expect(normalizeR2Prefix("/wallpaper/")).toBe("wallpaper");
    expect(normalizeR2Prefix("  /wallpaper/  ")).toBe("wallpaper");
    expect(normalizeR2Prefix("/a/b/c/")).toBe("a/b/c");
  });

  it("composes prefixed object keys", () => {
    expect(r2ObjectKey("", "objects/model/x/1.0.0/hash/file.zip")).toBe(
      "objects/model/x/1.0.0/hash/file.zip",
    );
    expect(r2ObjectKey("wallpaper", "objects/model/x/1.0.0/hash/file.zip")).toBe(
      "wallpaper/objects/model/x/1.0.0/hash/file.zip",
    );
    expect(r2ObjectKey("wallpaper", "catalog.json")).toBe(
      "wallpaper/catalog.json",
    );
    expect(r2ObjectKey("/wallpaper/", "catalog.json")).toBe(
      "wallpaper/catalog.json",
    );
  });

  it("rejects unsafe relative object paths", () => {
    expect(() => r2ObjectKey("", "")).toThrow(/relative R2 object path/u);
    expect(() => r2ObjectKey("", "/catalog.json")).toThrow(
      /relative R2 object path/u,
    );
    expect(() => r2ObjectKey("", "../catalog.json")).toThrow(
      /relative R2 object path/u,
    );
    expect(() => r2ObjectKey("", "objects//file.zip")).toThrow(
      /relative R2 object path/u,
    );
  });

  it("rejects traversal segments", () => {
    expect(() => normalizeR2Prefix(".")).toThrow(/relative path segments/u);
    expect(() => normalizeR2Prefix("..")).toThrow(/relative path segments/u);
    expect(() => normalizeR2Prefix("foo/./bar")).toThrow(
      /relative path segments/u,
    );
    expect(() => normalizeR2Prefix("foo/../bar")).toThrow(
      /relative path segments/u,
    );
    expect(() => normalizeR2Prefix("../wallpaper")).toThrow(
      /relative path segments/u,
    );
  });

  it("rejects backslashes", () => {
    expect(() => normalizeR2Prefix("foo\\bar")).toThrow(/backslashes/u);
    expect(() => normalizeR2Prefix("wallpaper\\")).toThrow(/backslashes/u);
  });

  it("rejects empty internal segments", () => {
    expect(() => normalizeR2Prefix("foo//bar")).toThrow(
      /empty path segments/u,
    );
    expect(() => normalizeR2Prefix("foo///bar")).toThrow(
      /empty path segments/u,
    );
    expect(() => normalizeR2Prefix("a//b/c")).toThrow(/empty path segments/u);
  });

  it("rejects query and fragment characters", () => {
    expect(() => normalizeR2Prefix("foo?bar")).toThrow(
      /query or fragment characters/u,
    );
    expect(() => normalizeR2Prefix("foo#bar")).toThrow(
      /query or fragment characters/u,
    );
  });

  it("rejects control and NUL characters", () => {
    expect(() => normalizeR2Prefix("foo\x00bar")).toThrow(/control characters/u);
    expect(() => normalizeR2Prefix("foo\nbar")).toThrow(/control characters/u);
    expect(() => normalizeR2Prefix("foo\x7Fbar")).toThrow(
      /control characters/u,
    );
  });
});

describe("R2 bucket name resolution", () => {
  it("prefers the CLI override over the environment variable", () => {
    expect(resolveR2BucketName("from-arg", "from-env")).toBe("from-arg");
  });

  it("falls back to the environment variable when no override is given", () => {
    expect(resolveR2BucketName(undefined, "from-env")).toBe("from-env");
  });

  it("trims whitespace from the chosen bucket name", () => {
    expect(resolveR2BucketName("  bucket  ", undefined)).toBe("bucket");
    expect(resolveR2BucketName(undefined, "  env-bucket  ")).toBe("env-bucket");
  });

  it("throws when no bucket name is provided", () => {
    expect(() => resolveR2BucketName(undefined, undefined)).toThrow(
      /R2 bucket name/u,
    );
    expect(() => resolveR2BucketName("", undefined)).toThrow(/R2 bucket name/u);
    expect(() => resolveR2BucketName(undefined, "   ")).toThrow(
      /R2 bucket name/u,
    );
  });

  it("rejects bucket names Wrangler cannot create", () => {
    for (const bucket of [
      "ab",
      "a".repeat(64),
      "-bucket",
      "bucket-",
      "UPPERCASE",
      "under_score",
    ]) {
      expect(() => resolveR2BucketName(bucket, undefined)).toThrow(
        /Invalid R2 bucket name/u,
      );
    }
  });
});
