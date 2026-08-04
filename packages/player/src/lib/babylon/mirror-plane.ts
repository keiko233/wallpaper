import { Plane } from "@babylonjs/core/Maths/math.plane";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

/**
 * Babylon discards the positive side of a MirrorTexture clip plane. A floor
 * mirror must therefore point down so geometry above the floor is retained.
 */
export function createFloorMirrorPlane(y: number): Plane {
  return Plane.FromPositionAndNormal(
    new Vector3(0, y, 0),
    new Vector3(0, -1, 0),
  );
}
