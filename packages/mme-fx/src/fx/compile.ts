import { lexFxSource } from "./lexer.ts";
import { preprocessFx } from "./preprocessor.ts";
import { EffectParser } from "./parser.ts";
import {
  classifyAlternativeFull,
  classifyMmeAlphaTest,
  classifyMmePostProcess,
  classifyWorkingFloor,
} from "./classify.ts";
import type {
  AlternativeFullClassification,
  MmeAlphaTestClassification,
  MmePostProcessClassification,
  WorkingFloorClassification,
} from "./classify.ts";
import type { CompileMmeOptions, CompileMmeResult } from "./ir.ts";

export interface CompiledMmeEffect extends CompileMmeResult {
  classification: WorkingFloorClassification;
  alternativeFull: AlternativeFullClassification;
  postProcess: MmePostProcessClassification;
  alphaTest: MmeAlphaTestClassification;
}

export function compileMmeEffect(source: string, options?: CompileMmeOptions): CompiledMmeEffect {
  const lexed = lexFxSource(source);
  const diagnostics = lexed.diagnostics;
  const preprocessed = preprocessFx(lexed.tokens, diagnostics);
  const parser = new EffectParser(
    preprocessed.tokens,
    preprocessed.macros,
    preprocessed.defines,
    preprocessed.includes,
    diagnostics,
    options?.sourceName ?? null,
  );
  const ir = parser.parseProgram();
  return {
    ir,
    diagnostics,
    ok: diagnostics.every((diagnostic) => diagnostic.severity !== "error"),
    classification: classifyWorkingFloor(ir),
    alternativeFull: classifyAlternativeFull(ir, source),
    postProcess: classifyMmePostProcess(ir),
    alphaTest: classifyMmeAlphaTest(ir),
  };
}
