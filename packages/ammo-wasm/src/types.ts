import type Ammo from "ammojs-typed";

/** The resolved Bullet (ammo.js) module namespace. */
export type AmmoModule = Awaited<ReturnType<typeof Ammo>>;
