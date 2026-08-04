import { VertexBuffer } from "@babylonjs/core/Buffers/buffer";
import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";
import { describe, expect, it } from "vitest";
import { getMeshGeometryBounds } from "../src/lib/babylon/mesh-geometry-bounds";

describe("mesh geometry bounds", () => {
  it("ignores padded loader bounds and uses referenced world-space vertices", () => {
    const engine = new NullEngine();
    const scene = new Scene(engine);
    const mesh = new Mesh("floor", scene);
    mesh.setVerticesData(VertexBuffer.PositionKind, [
      -5, -0.565, -4,
      5, -0.565, -4,
      5, -0.565, 6,
      -5, -0.565, 6,
      100, 100, 100,
    ]);
    mesh.setIndices([0, 1, 2, 0, 2, 3]);
    mesh.position.y = 2;

    // Mirrors babylon-mmd's culling margin without mutating the geometry.
    mesh.getBoundingInfo().reConstruct(
      new Vector3(-15, -10.565, -14),
      new Vector3(15, 109.435, 110),
    );

    expect(getMeshGeometryBounds(mesh)).toEqual({
      min: new Vector3(-5, 1.435, -4),
      max: new Vector3(5, 1.435, 6),
    });

    scene.dispose();
    engine.dispose();
  });
});
