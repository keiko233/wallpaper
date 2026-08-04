import type { Diagnostic } from "../diagnostics.ts";

export interface EmdMaterialBinding {
  materialIndex: number;
  effectPath: string | null;
}

export interface EmdEffectMap {
  version: number | null;
  objectEffectPath: string | null;
  objectVisible: boolean;
  materials: EmdMaterialBinding[];
}

export interface ParseEmdResult {
  effectMap: EmdEffectMap | null;
  diagnostics: Diagnostic[];
}
