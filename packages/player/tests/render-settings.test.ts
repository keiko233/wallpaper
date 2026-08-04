import { describe, expect, it } from "vitest";
import {
  applyRenderQualityPreset,
  DEFAULT_MMD_RENDER_SETTINGS,
  getRenderQualityPreset,
  RENDER_QUALITY_PRESETS,
} from "../src/types";

describe("render quality texture filtering", () => {
  it("increases anisotropic filtering across quality presets", () => {
    expect(
      Object.values(RENDER_QUALITY_PRESETS).map(
        ({ textureAnisotropy }) => textureAnisotropy,
      ),
    ).toEqual([1, 4, 8, 16]);
  });

  it("includes texture filtering when matching a preset", () => {
    const quality = applyRenderQualityPreset(
      DEFAULT_MMD_RENDER_SETTINGS,
      "quality",
    );
    expect(getRenderQualityPreset(quality)).toBe("quality");

    expect(
      getRenderQualityPreset({ ...quality, textureAnisotropy: 4 }),
    ).toBe("custom");
  });
});
