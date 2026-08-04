import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { describe, expect, it } from "vitest";
import { createFloorMirrorPlane } from "../src/lib/babylon/mirror-plane";

describe("floor mirror plane", () => {
  it("keeps geometry above the floor on Babylon's non-positive clip side", () => {
    const plane = createFloorMirrorPlane(3);

    expect(plane.signedDistanceTo(new Vector3(0, 4, 0))).toBeLessThan(0);
    expect(plane.signedDistanceTo(new Vector3(0, 3, 0))).toBeCloseTo(0);
    expect(plane.signedDistanceTo(new Vector3(0, 2, 0))).toBeGreaterThan(0);
  });
});
