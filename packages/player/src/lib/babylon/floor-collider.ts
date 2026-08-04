import type { FloorFit } from "./working-floor-fit";

export const MMD_PHYSICS_COLLISION_MASK = 0xffff;

export interface FloorColliderBox {
  readonly centerX: number;
  readonly centerY: number;
  readonly centerZ: number;
  readonly width: number;
  readonly height: number;
  readonly depth: number;
}

/**
 * Builds a thin box whose top face matches the authored stage floor. A box is
 * used instead of a zero-thickness plane so fast MMD rigid bodies cannot cross
 * the floor between physics steps as easily.
 */
export function createFloorColliderBox(
  floor: FloorFit,
  minimumSize = 100,
  height = 2,
): FloorColliderBox {
  const width = Math.max(minimumSize, floor.maxX - floor.minX);
  const depth = Math.max(minimumSize, floor.maxZ - floor.minZ);
  return {
    centerX: (floor.minX + floor.maxX) * 0.5,
    centerY: floor.y - height * 0.5,
    centerZ: (floor.minZ + floor.maxZ) * 0.5,
    width,
    height,
    depth,
  };
}
