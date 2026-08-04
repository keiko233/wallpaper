import { describe, expect, it } from "vitest";
import {
  createFloorColliderBox,
  MMD_PHYSICS_COLLISION_MASK,
} from "../src/lib/babylon/floor-collider";

describe("MMD floor collider", () => {
  it("places the top face on the inferred floor", () => {
    const box = createFloorColliderBox({
      minX: -120,
      maxX: 80,
      minZ: -40,
      maxZ: 60,
      y: 3.5,
    });

    expect(box).toEqual({
      centerX: -20,
      centerY: 2.5,
      centerZ: 10,
      width: 200,
      height: 2,
      depth: 100,
    });
    expect(box.centerY + box.height * 0.5).toBe(3.5);
  });

  it("keeps a useful collision area for small or solid-color stages", () => {
    const box = createFloorColliderBox({
      minX: -1,
      maxX: 1,
      minZ: -2,
      maxZ: 2,
      y: 0,
    });

    expect(box.width).toBe(100);
    expect(box.depth).toBe(100);
  });

  it("collides with all sixteen PMX rigid-body groups", () => {
    expect(MMD_PHYSICS_COLLISION_MASK).toBe(0xffff);
    for (let group = 0; group < 16; group += 1) {
      expect(MMD_PHYSICS_COLLISION_MASK & (1 << group)).not.toBe(0);
    }
  });
});
