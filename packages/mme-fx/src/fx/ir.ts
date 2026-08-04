import type { Diagnostic, SourceLocation } from "../diagnostics.ts";

export type ShaderStage =
  | "vertex"
  | "pixel"
  | "geometry"
  | "hull"
  | "domain"
  | "compute"
  | "unknown";

export type ParameterKind = "parameter" | "texture" | "static";

export type AnnotationValue =
  | { kind: "string"; value: string }
  | { kind: "number"; value: number }
  | { kind: "boolean"; value: boolean }
  | { kind: "vector"; value: number[] }
  | { kind: "identifier"; value: string }
  | { kind: "raw"; value: string };

export interface Annotation {
  type: string;
  name: string;
  value: AnnotationValue;
}

export interface ParameterDecl {
  kind: ParameterKind;
  qualifiers: string[];
  type: string;
  name: string;
  semantic: string | null;
  annotations: Annotation[];
  initializer: string | null;
  location: SourceLocation | null;
}

export interface OffscreenRenderTargetDecl {
  name: string;
  description: string | null;
  viewportRatio: [number, number] | null;
  clearColor: [number, number, number, number] | null;
  clearDepth: number | null;
  antiAlias: boolean | null;
  defaultEffect: string | null;
  annotations: Annotation[];
  location: SourceLocation | null;
}

export interface SamplerStateDecl {
  name: string;
  value: string;
}

export interface SamplerDecl {
  name: string;
  register: string | null;
  stateBlock: string | null;
  states: SamplerStateDecl[];
  texture: string | null;
  location: SourceLocation | null;
}

export interface ShaderBinding {
  stage: ShaderStage;
  profile: string | null;
  entryPoint: string | null;
  args: string[] | null;
  raw: string;
}

export interface RenderStateDecl {
  name: string;
  value: string;
}

export interface PassShaderDecl {
  assignment: string;
  binding: ShaderBinding;
}

export interface PassDecl {
  name: string;
  annotations: Annotation[];
  renderStates: RenderStateDecl[];
  shaders: PassShaderDecl[];
  location: SourceLocation | null;
}

export interface TechniqueDecl {
  name: string;
  annotations: Annotation[];
  passes: PassDecl[];
  mmdPass: string | null;
  location: SourceLocation | null;
}

export interface StructMemberDecl {
  type: string;
  name: string;
  semantic: string | null;
}

export interface StructDecl {
  name: string;
  members: StructMemberDecl[];
  location: SourceLocation | null;
}

export interface FunctionParamDecl {
  type: string;
  name: string | null;
  semantic: string | null;
  initializer: string | null;
}

export interface FunctionDecl {
  returnType: string;
  name: string;
  params: FunctionParamDecl[];
  hasBody: boolean;
  location: SourceLocation | null;
}

export interface DefineDecl {
  name: string;
  value: string | null;
  location: SourceLocation | null;
}

export interface EffectIR {
  version: 1;
  sourceName: string | null;
  includes: string[];
  defines: DefineDecl[];
  parameters: ParameterDecl[];
  offscreenRenderTargets: OffscreenRenderTargetDecl[];
  samplers: SamplerDecl[];
  structs: StructDecl[];
  functions: FunctionDecl[];
  techniques: TechniqueDecl[];
}

export interface CompileMmeOptions {
  sourceName?: string;
}

export interface CompileMmeResult {
  ir: EffectIR;
  diagnostics: Diagnostic[];
  ok: boolean;
}
