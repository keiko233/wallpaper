import { describe, expect, it } from "vitest";
import { parseArgs } from "../src/cli";

describe("resource catalog CLI arguments", () => {
  it("parses explicit R2 upload options", () => {
    expect(
      parseArgs([
        "publish-r2",
        "--",
        "--bucket",
        "wallpaper-assets",
        "--prefix",
        "wallpaper",
      ]),
    ).toMatchObject({
      command: "publish-r2",
      bucket: "wallpaper-assets",
      prefix: "wallpaper",
    });
  });

  it("parses the short R2 upload options", () => {
    expect(
      parseArgs(["publish-r2", "-b", "wallpaper-assets", "-p", "repo"]),
    ).toMatchObject({
      bucket: "wallpaper-assets",
      prefix: "repo",
    });
  });

  it("rejects an option whose value is another option", () => {
    expect(() =>
      parseArgs(["publish-r2", "--bucket", "--prefix", "repo"]),
    ).toThrow(/Missing value for --bucket/u);
  });

  it("rejects R2 options for other commands", () => {
    expect(() => parseArgs(["build", "--bucket", "wallpaper-assets"])).toThrow(
      /only valid for publish-r2/u,
    );
  });
});
