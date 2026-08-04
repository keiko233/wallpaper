import type { Diagnostic } from "../diagnostics.ts";

export interface BoundingBox3 {
  min: [number, number, number];
  max: [number, number, number];
}

export interface DirectXTextMesh {
  headerVersion: string;
  positions: [number, number, number][];
  indices: number[];
  uvs: [number, number][] | null;
  bounds: BoundingBox3;
  vertexCount: number;
  faceCount: number;
  triangleCount: number;
}

export interface ParseDirectXTextMeshResult {
  mesh: DirectXTextMesh | null;
  diagnostics: Diagnostic[];
}
