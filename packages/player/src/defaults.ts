import type {
  ModelList,
  MotionList,
  SkyboxList,
  StageList,
} from "./types.ts";

export const DEFAULT_MODELS: readonly ModelList[] = [];
export const DEFAULT_MOTIONS: readonly MotionList[] = [];
export const DEFAULT_STAGES: readonly StageList[] = [
  {
    id: "builtin:stage:solid-color",
    name: "Solid color",
    stagePath: null,
  },
];

export const DEFAULT_SKYBOXES: readonly SkyboxList[] = [
  {
    id: "builtin:skybox:none",
    name: "No skybox",
    skyboxPath: null,
  },
];
