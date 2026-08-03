/**
 * Global ambient declaration for the patched kripken/ammo.js git dependency
 * (github:kripken/ammo.js#0f92865b2f2cff3602ff2cf203101cde0edf2c37).
 *
 * Must stay free of top-level imports/exports so this is a global ambient
 * module declaration. The build is patched via pnpm patchedDependencies
 * (patches/ammo.js@0.0.2.patch) so it can be imported from strict-mode ESM:
 * the UMD tail is made null-safe and `this.Ammo = b` becomes
 * `globalThis.Ammo = b`.
 */
declare module "ammo.js/builds/ammo.wasm.js" {
  const ammoWasmFactory: (
    moduleArg?: { locateFile?: (path: string) => string },
  ) => Promise<unknown>;
  export default ammoWasmFactory;
}
