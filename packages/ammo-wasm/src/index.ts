// The patched kripken/ammo.js build is typed by src/ammo-js-module.d.ts in
// this project; downstream projects compile this file without that ambient
// declaration, so the directive suppresses their TS7016 instead.
// @ts-ignore -- declaration is provided by src/ammo-js-module.d.ts
import ammoWasmFactory from "ammo.js/builds/ammo.wasm.js";
import ammoWasmBinaryUrl from "ammo.js/builds/ammo.wasm.wasm?url";
import type { AmmoModule } from "./types";

export type { AmmoModule } from "./types";

/**
 * Loads the Bullet physics engine (ammo.js). Prefers the WebAssembly build
 * from the patched kripken/ammo.js git dependency; falls back to the asm.js
 * build from ammojs-typed if the WASM build cannot be instantiated.
 */
export async function loadAmmo(): Promise<AmmoModule> {
  try {
    return (await ammoWasmFactory({
      locateFile: () => ammoWasmBinaryUrl,
    })) as AmmoModule;
  } catch (error) {
    console.warn(
      "Failed to load the ammo.js WASM build; falling back to the asm.js build.",
      error,
    );
    const { default: asmFactory } = await import("ammojs-typed");
    return await asmFactory();
  }
}
