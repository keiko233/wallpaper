import { describe, expect, it } from "vitest";
import {
  createVirtualResourceUrl,
  registerPlayerResourceUrl,
  resolvePlayerResourceUrl,
} from "../src/lib/resource-url";

describe("player virtual resource URLs", () => {
  it("maps normalized virtual paths to local object URLs", () => {
    const virtual = createVirtualResourceUrl(
      "sha",
      "model\\textures/body.png",
    );
    const unregister = registerPlayerResourceUrl(
      virtual,
      "blob:local-texture",
    );

    expect(virtual).toBe(
      "/__wallpaper_resources/sha/model/textures/body.png",
    );
    expect(
      resolvePlayerResourceUrl(
        "https://example.test/__wallpaper_resources/sha/model/textures/body.png",
      ),
    ).toBe("blob:local-texture");
    unregister();
    expect(resolvePlayerResourceUrl(virtual)).toBe(virtual);
  });
});
