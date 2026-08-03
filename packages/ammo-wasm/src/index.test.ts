import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import ammoWasmFactory from "ammo.js/builds/ammo.wasm.js";
import type { AmmoModule } from "./types";

// In the browser the loader resolves the wasm through Vite's ?url asset;
// in the test environment resolve the real on-disk path so Node's fs-based
// wasm loading works.
const require = createRequire(import.meta.url);
const wasmPath = require.resolve("ammo.js/builds/ammo.wasm.wasm");

async function loadAmmoForTest(): Promise<AmmoModule> {
  return (await ammoWasmFactory({
    locateFile: () => wasmPath,
  })) as AmmoModule;
}

describe("ammo.wasm", () => {
  it("loads the Bullet WASM build and exposes the physics API", async () => {
    const ammo = await loadAmmoForTest();
    const vector = new ammo.btVector3(1, 2, 3);
    expect(vector.x()).toBe(1);
    expect(vector.y()).toBe(2);
    expect(vector.z()).toBe(3);
    ammo.destroy(vector);
  });

  it("keeps the babylon-mmd memory layout contract", async () => {
    // babylon-mmd's MmdAmmoPhysics patches the m_additionalDamping field of
    // btRigidBody at HEAP32[ptr / 4 + 113]. Verify the field exists and
    // round-trips so the upstream build stays compatible.
    const ammo = await loadAmmoForTest();
    const shape = new ammo.btSphereShape(0.5);
    const motionState = new ammo.btDefaultMotionState(new ammo.btTransform());
    const info = new ammo.btRigidBodyConstructionInfo(
      1,
      motionState,
      shape,
      new ammo.btVector3(0, 0, 0),
    );
    const body = new ammo.btRigidBody(info);
    const { getPointer } = ammo as unknown as {
      getPointer: (object: unknown) => number;
    };
    const pointer = getPointer(body);
    const field = ammo.HEAP32[pointer / 4 + 113];
    expect(field).toBe(0);
    ammo.HEAP32[pointer / 4 + 113] = 0xffffffff;
    expect(ammo.HEAP32[pointer / 4 + 113]).toBe(-1);
    ammo.destroy(body);
    ammo.destroy(info);
    ammo.destroy(motionState);
    ammo.destroy(shape);
  });
});
