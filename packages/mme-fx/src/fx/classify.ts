import type { EffectIR, OffscreenRenderTargetDecl } from "./ir.ts";

export interface DefaultEffectRule {
  target: string;
  value: string;
}

export interface WorkingFloorClassification {
  present: boolean;
  offscreenTargets: OffscreenRenderTargetDecl[];
  defaultEffect: string | null;
  rules: DefaultEffectRule[];
  routesSelf: boolean;
  routesPmd: boolean;
  routesPmx: boolean;
  routesX: boolean;
  routesVac: boolean;
  routesAll: boolean;
  subEffectPmd: string | null;
  subEffectPmx: string | null;
  subEffectAll: string | null;
}

export interface AlternativeFullClassification {
  present: boolean;
  includePath: string | null;
  normalMapPath: string | null;
  thresholdTexturePath: string | null;
  softShadow: boolean;
  softShadowParam: number | null;
  anisotropy: number | null;
}

export type MmePostProcessKind =
  | "bleach-bypass"
  | "like-hdr"
  | "pixel-blur"
  | "process-color"
  | "unknown";

export interface MmePostProcessClassification {
  present: boolean;
  kind: MmePostProcessKind;
  sceneColorTarget: string | null;
}

export interface MmeAlphaTestClassification {
  present: boolean;
  alphaReference: number | null;
}

function defineValue(ir: EffectIR, name: string): string | null {
  return ir.defines.find((define) => define.name === name)?.value ?? null;
}

function stringDefine(ir: EffectIR, name: string): string | null {
  const value = defineValue(ir, name);
  const match = value === null ? null : /^"((?:[^"\\]|\\.)*)"$/u.exec(value);
  return match === null ? null : match[1]!.replaceAll('\\"', '"').replaceAll("\\\\", "\\");
}

function numericDefine(ir: EffectIR, name: string): number | null {
  const value = defineValue(ir, name);
  if (value === null) return null;
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : null;
}

export function classifyAlternativeFull(
  ir: EffectIR,
  source: string,
): AlternativeFullClassification {
  const includePath = /#\s*include\s*[<"]([^>"]*AlternativeFull\.fxsub)[>"]/iu.exec(source)?.[1] ?? null;
  const normalMapPath = stringDefine(ir, "TEXTURE_NORMALMAP");
  return {
    present: includePath !== null || (
      ir.parameters.some((parameter) => parameter.semantic === "MATERIALTEXTURE") &&
      ir.techniques.some((technique) => technique.mmdPass === "object")
    ),
    includePath,
    normalMapPath,
    thresholdTexturePath: stringDefine(ir, "TEXTURE_THRESHOLD"),
    softShadow: ir.defines.some((define) => define.name === "USE_SOFT_SHADOW"),
    softShadowParam:
      ir.parameters.find((parameter) => parameter.name === "SoftShadowParam")?.initializer === null
        ? null
        : Number.parseFloat(
            ir.parameters.find((parameter) => parameter.name === "SoftShadowParam")?.initializer ?? "",
          ) || null,
    anisotropy: numericDefine(ir, "MAX_ANISOTROPY"),
  };
}

function annotationString(
  ir: EffectIR,
  parameterName: string,
  annotationName: string,
): string | null {
  const annotation = ir.parameters
    .find((parameter) => parameter.name === parameterName)
    ?.annotations.find(
      (candidate) =>
        candidate.name.toLowerCase() === annotationName.toLowerCase() &&
        candidate.value.kind === "string",
    );
  return annotation?.value.kind === "string" ? annotation.value.value : null;
}

export function classifyMmePostProcess(
  ir: EffectIR,
): MmePostProcessClassification {
  const scriptClass = annotationString(ir, "Script", "ScriptClass");
  const scriptOrder = annotationString(ir, "Script", "ScriptOrder");
  const functionNames = new Set(ir.functions.map((fn) => fn.name));
  let kind: MmePostProcessKind = "unknown";
  if (functionNames.has("PS_passBleachBypass")) kind = "bleach-bypass";
  else if (functionNames.has("PS_passAutoTone")) kind = "like-hdr";
  else if (functionNames.has("PS_passBlur")) kind = "pixel-blur";
  else if (functionNames.has("PS_passRGBtoCMYK")) kind = "process-color";
  const sceneColorTarget =
    ir.parameters.find(
      (parameter) =>
        parameter.semantic?.toUpperCase() === "RENDERCOLORTARGET",
    )?.name ?? null;
  return {
    present:
      scriptClass?.toLowerCase() === "scene" &&
      scriptOrder?.toLowerCase() === "postprocess" &&
      sceneColorTarget !== null,
    kind,
    sceneColorTarget,
  };
}

export function classifyMmeAlphaTest(
  ir: EffectIR,
): MmeAlphaTestClassification {
  const alphaReference = numericDefine(ir, "ALPHA_REF");
  const objectPasses = ir.techniques
    .filter((technique) => technique.mmdPass === "object")
    .flatMap((technique) => technique.passes);
  return {
    present:
      alphaReference !== null &&
      ir.parameters.some(
        (parameter) => parameter.semantic?.toUpperCase() === "MATERIALTEXTURE",
      ) &&
      objectPasses.some((pass) =>
        pass.renderStates.some(
          (state) =>
            state.name.toLowerCase() === "alphafunc" &&
            state.value.toLowerCase() === "greater",
        )
      ),
    alphaReference,
  };
}

export function parseDefaultEffectRules(effectText: string | null): DefaultEffectRule[] {
  if (!effectText) {
    return [];
  }
  const rules: DefaultEffectRule[] = [];
  for (const part of effectText.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) {
      continue;
    }
    const equals = trimmed.indexOf("=");
    if (equals === -1) {
      continue;
    }
    rules.push({
      target: trimmed.slice(0, equals).trim(),
      value: trimmed.slice(equals + 1).trim(),
    });
  }
  return rules;
}

function routeValue(rules: DefaultEffectRule[], target: string): string | null {
  for (const rule of rules) {
    if (rule.target === target) {
      return rule.value;
    }
  }
  return null;
}

function isRouted(value: string | null): boolean {
  if (value == null || value === "") {
    return false;
  }
  const normalized = value.toLowerCase();
  return normalized !== "hide" && normalized !== "none";
}

export function classifyWorkingFloor(ir: EffectIR): WorkingFloorClassification {
  const offscreenTargets = ir.offscreenRenderTargets;
  const defaultEffect = offscreenTargets.length > 0 ? offscreenTargets[0]!.defaultEffect : null;
  const rules = parseDefaultEffectRules(defaultEffect);
  const pmd = routeValue(rules, "*.pmd");
  const pmx = routeValue(rules, "*.pmx");
  const x = routeValue(rules, "*.x");
  const vac = routeValue(rules, "*.vac");
  const all = routeValue(rules, "*");
  const self = routeValue(rules, "self");

  const present =
    offscreenTargets.length > 0 &&
    defaultEffect != null &&
    (isRouted(pmd) || isRouted(pmx) || isRouted(all));

  return {
    present,
    offscreenTargets,
    defaultEffect,
    rules,
    routesSelf: self != null,
    routesPmd: isRouted(pmd) || isRouted(all),
    routesPmx: isRouted(pmx) || isRouted(all),
    routesX: isRouted(x) || isRouted(all),
    routesVac: isRouted(vac) || isRouted(all),
    routesAll: isRouted(all),
    subEffectPmd: isRouted(pmd) ? pmd : isRouted(all) ? all : null,
    subEffectPmx: isRouted(pmx) ? pmx : isRouted(all) ? all : null,
    subEffectAll: isRouted(all) ? all : null,
  };
}
