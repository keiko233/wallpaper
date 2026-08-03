# @wallpaper/ammo-wasm

Loads the Bullet physics engine (ammo.js) for the MMD player.

## Source of the physics builds

The WebAssembly build comes from the upstream
[kripken/ammo.js](https://github.com/kripken/ammo.js) repository, installed
as a git dependency pinned by commit:

```
"ammo.js": "github:kripken/ammo.js#0f92865b2f2cff3602ff2cf203101cde0edf2c37"
```

No binaries are committed to the wallpaper repository. The install pulls the
whole upstream repo into `node_modules` (includes the C++ sources; this is a
dev-time cost only).

## Patching

The raw emscripten build cannot be imported from strict-mode ESM:

1. The UMD tail references bare `exports`/`module`.
2. `this.Ammo = b` — `this` is `undefined` in strict mode.

Both are fixed by `patches/ammo.js@0.0.2.patch`, applied automatically
through pnpm's `patchedDependencies` (recorded in `pnpm-lock.yaml`). To
regenerate the patch after changing the pinned commit, run `pnpm patch
ammo.js`, apply the two replacements, and `pnpm patch-commit`.

The layout contract tests in `src/index.test.ts` guard the parts of the
build that `babylon-mmd`'s `MmdAmmoPhysics` depends on directly:

- `btContactSolverInfo.m_numIterations` (used for solver iterations).
- `m_additionalDamping` at `HEAP32[ptr / 4 + 113]` on `btRigidBody`.

If the upstream build layout ever changes, babylon-mmd's memory hack may
corrupt memory — keep the pinned commit in sync with the `babylon-mmd`
version in use.

## Usage

```ts
import { loadAmmo } from "@wallpaper/ammo-wasm";

const ammo = await loadAmmo();
// ammo is the Bullet module (btVector3, btDiscreteDynamicsWorld, ...)
```

`loadAmmo` prefers the WebAssembly build (resolved through Vite's `?url`
asset handling) and falls back to the asm.js build from `ammojs-typed` if
the WASM build cannot be instantiated.

## License

The bundled builds are from kripken/ammo.js, distributed under the
[zlib license](https://github.com/kripken/ammo.js/blob/master/LICENSE).
