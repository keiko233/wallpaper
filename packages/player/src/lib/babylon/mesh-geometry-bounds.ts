import { VertexBuffer } from "@babylonjs/core/Buffers/buffer";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { MeshBounds } from "./working-floor-fit";

/**
 * Computes bounds from the vertices actually referenced by a mesh. Babylon MMD
 * deliberately pads mesh bounding boxes for animated culling, so those boxes
 * cannot be used to locate authored stage surfaces such as WorkingFloor.
 */
export function getMeshGeometryBounds(mesh: Mesh): MeshBounds | null {
  const positions = mesh.getVerticesData(VertexBuffer.PositionKind);
  if (positions === null || positions.length < 3) return null;

  const indices = mesh.getIndices();
  const vertexIndices =
    indices === null || indices.length === 0
      ? Array.from({ length: positions.length / 3 }, (_, index) => index)
      : indices;
  if (vertexIndices.length === 0) return null;

  const world = mesh.computeWorldMatrix(true);
  const point = new Vector3();
  const min = new Vector3(Infinity, Infinity, Infinity);
  const max = new Vector3(-Infinity, -Infinity, -Infinity);
  for (const vertexIndex of vertexIndices) {
    const offset = vertexIndex * 3;
    if (offset < 0 || offset + 2 >= positions.length) continue;
    Vector3.TransformCoordinatesFromFloatsToRef(
      positions[offset],
      positions[offset + 1],
      positions[offset + 2],
      world,
      point,
    );
    min.minimizeInPlace(point);
    max.maximizeInPlace(point);
  }

  if (!Number.isFinite(min.x) || !Number.isFinite(max.x)) return null;
  return { min, max };
}
