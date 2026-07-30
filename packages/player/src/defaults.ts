import type {
  ModelList,
  MotionList,
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
