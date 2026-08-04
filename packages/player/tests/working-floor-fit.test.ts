import { describe, expect, it } from "vitest";
import {
  fitWorkingFloorToMeshes,
  inferWorkingFloorFit,
  mergeMeshBounds,
} from "../src/lib/babylon/working-floor-fit";

function bounds(
  min: [number, number, number],
  max: [number, number, number],
) {
  return {
    min: { x: min[0], y: min[1], z: min[2] },
    max: { x: max[0], y: max[1], z: max[2] },
  };
}

describe("WorkingFloor stage fitting", () => {
  it("merges actual geometry bounds without introducing a culling margin", () => {
    expect(
      mergeMeshBounds([
        bounds([-5, -0.6, -4], [2, -0.5, 6]),
        bounds([-2, -0.4, -8], [8, 10, 3]),
      ]),
    ).toEqual(bounds([-5, -0.6, -8], [8, 10, 6]));
  });

  it("uses the main floor height and combined extent of preferred meshes", () => {
    const fit = fitWorkingFloorToMeshes([
      bounds([-54.4, -0.565, -52.4], [54.4, -0.565, 56.5]),
      bounds([-55.2, -0.62, -53.1], [55.2, -0.564, 57.2]),
      bounds([-58.5, -0.443, 12.1], [58.5, -0.443, 28.4]),
    ]);

    expect(fit).toEqual({
      minX: -58.5,
      maxX: 58.5,
      minZ: -53.1,
      maxZ: 57.2,
      y: -0.565,
    });
  });

  it("places the reflector above all broad pieces in the main floor band", () => {
    const fit = inferWorkingFloorFit(
      bounds([-60, -1, -60], [60, 40, 60]),
      [
        bounds([-54, -0.565, -52], [54, -0.565, 56]),
        bounds([-55, -0.62, -53], [55, -0.564, 57]),
        bounds([-58, -0.443, 12], [58, -0.443, 28]),
        bounds([-35, -0.55, -27], [35, -0.443, 28]),
        // A smaller raised platform is not part of the main floor band.
        bounds([-8, 8, -8], [8, 8, 8]),
      ],
    );

    expect(fit).toEqual({
      minX: -58,
      maxX: 58,
      minZ: -53,
      maxZ: 57,
      y: -0.443,
    });
  });

  it("falls back to the stage footprint when no floor candidate exists", () => {
    const stageBounds = bounds([-5, 2, -6], [7, 12, 8]);
    const fit = inferWorkingFloorFit(stageBounds, [
      bounds([-2, 5, -2], [2, 10, 2]),
    ]);

    expect(fit).toEqual({
      minX: -5,
      maxX: 7,
      minZ: -6,
      maxZ: 8,
      y: 2,
    });
  });
});
