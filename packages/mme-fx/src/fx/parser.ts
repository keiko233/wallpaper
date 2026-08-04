import { makeDiagnostic } from "../diagnostics.ts";
import type { Diagnostic, SourceLocation } from "../diagnostics.ts";
import type { FxToken } from "./lexer.ts";
import type { Macro } from "./preprocessor.ts";
import type {
  Annotation,
  AnnotationValue,
  DefineDecl,
  EffectIR,
  FunctionDecl,
  FunctionParamDecl,
  OffscreenRenderTargetDecl,
  ParameterDecl,
  ParameterKind,
  PassDecl,
  PassShaderDecl,
  RenderStateDecl,
  SamplerDecl,
  SamplerStateDecl,
  ShaderBinding,
  ShaderStage,
  StructDecl,
  StructMemberDecl,
  TechniqueDecl,
} from "./ir.ts";

const QUALIFIERS = new Set([
  "static", "uniform", "const", "inline", "extern", "precise",
  "volatile", "row_major", "column_major", "shared", "export",
]);

const INTEGER_QUALIFIERS = new Set(["unsigned", "signed", "long", "short"]);

function isQualifier(text: string): boolean {
  return QUALIFIERS.has(text);
}

function profileStage(profile: string): ShaderStage {
  const match = /^(vs|vp|ps|fp|gs|hs|ds|cs)/i.exec(profile);
  switch (match?.[1]?.toLowerCase()) {
    case "vs":
    case "vp":
      return "vertex";
    case "ps":
    case "fp":
      return "pixel";
    case "gs":
      return "geometry";
    case "hs":
      return "hull";
    case "ds":
      return "domain";
    case "cs":
      return "compute";
    default:
      return "unknown";
  }
}

export function findStringAnnotation(annotations: Annotation[], name: string): string | null {
  for (const annotation of annotations) {
    if (annotation.name.toLowerCase() === name.toLowerCase() && annotation.value.kind === "string") {
      return annotation.value.value;
    }
  }
  return null;
}

function findNumberAnnotation(annotations: Annotation[], name: string): number | null {
  for (const annotation of annotations) {
    if (annotation.name.toLowerCase() === name.toLowerCase() && annotation.value.kind === "number") {
      return annotation.value.value;
    }
  }
  return null;
}

function findBooleanAnnotation(annotations: Annotation[], name: string): boolean | null {
  for (const annotation of annotations) {
    if (annotation.name.toLowerCase() === name.toLowerCase() && annotation.value.kind === "boolean") {
      return annotation.value.value;
    }
  }
  return null;
}

function findVectorAnnotation(annotations: Annotation[], name: string, size: number): number[] | null {
  for (const annotation of annotations) {
    if (
      annotation.name.toLowerCase() === name.toLowerCase() &&
      annotation.value.kind === "vector" &&
      annotation.value.value.length === size
    ) {
      return annotation.value.value;
    }
  }
  return null;
}

export class EffectParser {
  private readonly tokens: FxToken[];
  private readonly macros: Map<string, Macro>;
  private readonly defines: DefineDecl[];
  private readonly includes: string[];
  private readonly diagnostics: Diagnostic[];
  private readonly sourceName: string | null;
  private readonly userTypes: Set<string>;
  private pos = 0;

  constructor(
    tokens: FxToken[],
    macros: Map<string, Macro>,
    defines: DefineDecl[],
    includes: string[],
    diagnostics: Diagnostic[],
    sourceName: string | null,
  ) {
    this.tokens = tokens;
    this.macros = macros;
    this.defines = defines;
    this.includes = includes;
    this.diagnostics = diagnostics;
    this.sourceName = sourceName;
    this.userTypes = new Set([
      "float", "float2", "float3", "float4", "float2x2", "float3x3", "float4x4",
      "half", "half2", "half3", "half4", "double", "bool", "bool2", "bool3", "bool4",
      "int", "int2", "int3", "int4", "uint", "uint2", "uint3", "uint4", "dword",
      "string", "texture", "sampler", "sampler_state", "matrix", "vector",
    ]);
  }

  parseProgram(): EffectIR {
    const parameters: ParameterDecl[] = [];
    const samplers: SamplerDecl[] = [];
    const structs: StructDecl[] = [];
    const functions: FunctionDecl[] = [];
    const techniques: TechniqueDecl[] = [];

    while (!this.atEnd()) {
      this.skipEmptyStatements();
      if (this.atEnd()) break;
      const token = this.peek();
      if (token?.kind === "identifier") {
        if (token.text === "technique") {
          techniques.push(this.parseTechnique());
        } else if (token.text === "struct") {
          structs.push(this.parseStruct());
        } else if (token.text === "sampler") {
          samplers.push(this.parseSampler());
        } else if (token.text === "typedef") {
          this.parseTypedef();
        } else {
          const decl = this.parseDeclaration();
          if (decl.kind === "function") {
            functions.push(decl.function);
          } else {
            parameters.push(decl.parameter);
          }
        }
      } else {
        this.addDiagnostic("warning", "Skipping unexpected token", token);
        this.next();
      }
    }

    return {
      version: 1,
      sourceName: this.sourceName,
      includes: this.includes,
      defines: this.defines,
      parameters,
      offscreenRenderTargets: this.buildOffscreenTargets(parameters),
      samplers,
      structs,
      functions,
      techniques,
    };
  }

  private buildOffscreenTargets(parameters: ParameterDecl[]): OffscreenRenderTargetDecl[] {
    const targets: OffscreenRenderTargetDecl[] = [];
    for (const parameter of parameters) {
      if (parameter.semantic && parameter.semantic.toUpperCase() === "OFFSCREENRENDERTARGET") {
        targets.push({
          name: parameter.name,
          description: findStringAnnotation(parameter.annotations, "Description"),
          viewportRatio: findVectorAnnotation(parameter.annotations, "ViewPortRatio", 2) as [number, number] | null,
          clearColor: findVectorAnnotation(parameter.annotations, "ClearColor", 4) as [number, number, number, number] | null,
          clearDepth: findNumberAnnotation(parameter.annotations, "ClearDepth"),
          antiAlias: findBooleanAnnotation(parameter.annotations, "AntiAlias"),
          defaultEffect: findStringAnnotation(parameter.annotations, "DefaultEffect"),
          annotations: parameter.annotations,
          location: parameter.location,
        });
      }
    }
    return targets;
  }

  private parseTechnique(): TechniqueDecl {
    const start = this.next();
    const name = this.expectIdentifier("Expected technique name");
    const annotations: Annotation[] = [];
    if (this.peek()?.text === "<") {
      annotations.push(...this.parseAnnotations());
    }
    const passes: PassDecl[] = [];
    if (this.peek()?.text === "{") {
      this.next();
      while (!this.atEnd() && this.peek()?.text !== "}") {
        const token = this.peek();
        if (token?.kind === "identifier" && token.text === "pass") {
          passes.push(this.parsePass());
        } else if (token?.text === ";") {
          this.next();
        } else {
          this.addDiagnostic("warning", "Skipping unknown member inside technique", token);
          this.skipToStatementEnd();
        }
      }
      this.expectToken("}");
    } else if (this.peek()?.text === ";") {
      this.next();
    } else {
      this.addDiagnostic("error", "Expected '{' or ';' after technique declaration", this.peek());
    }
    return {
      name,
      annotations,
      passes,
      mmdPass: findStringAnnotation(annotations, "MMDPass"),
      location: this.loc(start),
    };
  }

  private parsePass(): PassDecl {
    const start = this.next();
    const name = this.expectIdentifier("Expected pass name");
    const annotations: Annotation[] = [];
    if (this.peek()?.text === "<") {
      annotations.push(...this.parseAnnotations());
    }
    const renderStates: RenderStateDecl[] = [];
    const shaders: PassShaderDecl[] = [];
    if (this.peek()?.text === "{") {
      this.next();
      while (!this.atEnd() && this.peek()?.text !== "}") {
        const token = this.peek();
        if (token?.text === ";") {
          this.next();
          continue;
        }
        if (token?.kind === "identifier") {
          const assignment = token.text;
          this.next();
          if (this.peek()?.text === "=") {
            this.next();
            const { raw, binding } = this.parsePassAssignmentValue();
            if (binding) {
              shaders.push({ assignment, binding });
            }
            renderStates.push({ name: assignment, value: raw });
            if (this.peek()?.text === ";") {
              this.next();
            } else {
              this.addDiagnostic("warning", "Expected ';' after pass state", this.peek());
            }
          } else {
            this.addDiagnostic("warning", "Expected '=' after pass state name", token);
            this.skipToStatementEnd();
          }
        } else {
          this.addDiagnostic("warning", "Skipping unknown member inside pass", token);
          this.skipToStatementEnd();
        }
      }
      this.expectToken("}");
    }
    return { name, annotations, renderStates, shaders, location: this.loc(start) };
  }

  private parsePassAssignmentValue(): { raw: string; binding: ShaderBinding | null } {
    const token = this.peek();
    if (token?.kind === "identifier" && token.text === "compile") {
      this.next();
      const profileToken = this.peek();
      const profile =
        profileToken?.kind === "identifier" ? profileToken.text : "";
      if (profile !== "") this.next();
      let entryPoint: string | null = null;
      let args: string[] | null = null;
      let raw = `compile ${profile}`;
      const entryPointToken = this.peek();
      if (entryPointToken?.kind === "identifier") {
        entryPoint = entryPointToken.text;
        this.next();
        raw += ` ${entryPoint}`;
        if (this.peek()?.text === "(") {
          args = this.readCallArgs();
          raw += `(${args.join(", ")})`;
        }
      }
      const rest = this.readRawUntil([";"]).trim();
      if (rest) {
        raw += ` ${rest}`;
      }
      return {
        raw,
        binding: {
          stage: profileStage(profile),
          profile: profile || null,
          entryPoint,
          args,
          raw,
        },
      };
    }
    const raw = this.readRawUntil([";"]).trim();
    return { raw, binding: null };
  }

  private parseSampler(): SamplerDecl {
    const start = this.next();
    const name = this.expectIdentifier("Expected sampler name");
    let register: string | null = null;
    if (this.peek()?.text === ":") {
      this.next();
      register = this.parseSemantic();
    }
    const states: SamplerStateDecl[] = [];
    let stateBlock: string | null = null;
    let texture: string | null = null;
    if (this.peek()?.text === "=") {
      this.next();
      const token = this.peek();
      if (token?.text === "<") {
        this.next();
        const tex = this.expectIdentifier("Expected texture name");
        texture = tex;
        this.expectToken(">");
        states.push({ name: "texture", value: `<${tex}>` });
      } else if (token?.kind === "identifier") {
        stateBlock = token.text;
        this.next();
        if (this.peek()?.text === "{") {
          this.next();
          while (!this.atEnd() && this.peek()?.text !== "}") {
            const stateToken = this.peek();
            if (stateToken?.text === ";") {
              this.next();
              continue;
            }
            if (stateToken?.kind === "identifier") {
              const stateName = stateToken.text;
              this.next();
              let value = "";
              if (this.peek()?.text === "=") {
                this.next();
                value = this.readRawUntil([";"]).trim();
              }
              if (stateName.toLowerCase() === "texture") {
                const inner = value.replace(/[<>]/g, "").trim();
                texture = inner || null;
              }
              states.push({ name: stateName, value });
              if (this.peek()?.text === ";") {
                this.next();
              } else {
                this.addDiagnostic("warning", "Expected ';' after sampler state", this.peek());
              }
            } else {
              this.addDiagnostic("warning", "Skipping unknown sampler state", stateToken);
              this.skipToStatementEnd();
            }
          }
          this.expectToken("}");
        }
      } else {
        const raw = this.readRawUntil([";"]).trim();
        states.push({ name: "texture", value: raw });
      }
    }
    if (this.peek()?.text === ";") {
      this.next();
    }
    return { name, register, stateBlock, states, texture, location: this.loc(start) };
  }

  private parseStruct(): StructDecl {
    const start = this.next();
    const name = this.expectIdentifier("Expected struct name");
    const members: StructMemberDecl[] = [];
    if (this.peek()?.text === "{") {
      this.next();
      while (!this.atEnd() && this.peek()?.text !== "}") {
        const token = this.peek();
        if (token?.text === ";") {
          this.next();
          continue;
        }
        const member = this.parseStructMember();
        if (member) {
          members.push(member);
        }
      }
      this.expectToken("}");
      if (this.peek()?.text === ";") {
        this.next();
      }
    }
    this.userTypes.add(name);
    return { name, members, location: this.loc(start) };
  }

  private parseStructMember(): StructMemberDecl | null {
    while (this.peek()?.kind === "identifier" && isQualifier(this.peek()!.text)) {
      this.next();
    }
    if (this.peek()?.kind !== "identifier") {
      this.addDiagnostic("warning", "Expected struct member type", this.peek());
      this.skipToStatementEnd();
      return null;
    }
    const type = this.parseType();
    const name = this.expectIdentifier("Expected struct member name");
    let semantic: string | null = null;
    if (this.peek()?.text === ":") {
      this.next();
      semantic = this.parseSemantic();
    }
    if (this.peek()?.text === "[") {
      this.skipBalanced("[");
    }
    if (this.peek()?.text === ";") {
      this.next();
    } else {
      this.addDiagnostic("warning", "Expected ';' after struct member", this.peek());
    }
    return { type, name, semantic };
  }

  private parseTypedef(): void {
    this.next();
    this.parseType();
    const name = this.expectIdentifier("Expected typedef name");
    this.userTypes.add(name);
    this.skipToStatementEnd();
  }

  private parseDeclaration():
    | { kind: "function"; function: FunctionDecl }
    | { kind: "parameter"; parameter: ParameterDecl } {
    const start = this.peek();
    const qualifiers: string[] = [];
    while (this.peek()?.kind === "identifier" && isQualifier(this.peek()!.text)) {
      qualifiers.push(this.next()!.text);
    }
    const type = this.parseType();
    const nameToken = this.peek();
    let name: string | null = null;
    if (nameToken?.kind === "identifier") {
      name = nameToken.text;
      this.next();
    } else {
      this.addDiagnostic("error", "Expected a name after type", nameToken);
      this.skipToStatementEnd();
      return {
        kind: "parameter",
        parameter: this.makeParameter(type, "<invalid>", qualifiers, null, [], null, start),
      };
    }

    const next = this.peek();
    if (next?.text === "(") {
      const params = this.parseFunctionParams();
      if (this.peek()?.text === ":") {
        this.next();
        this.parseSemantic();
      }
      let hasBody = false;
      if (this.peek()?.text === "{") {
        this.skipBalanced("{");
        hasBody = true;
      } else if (this.peek()?.text === ";") {
        this.next();
      } else {
        this.addDiagnostic("warning", "Expected function body or ';' after parameter list", this.peek());
        this.skipToStatementEnd();
      }
      return {
        kind: "function",
        function: { returnType: type, name: name ?? "", params, hasBody, location: this.loc(start) },
      };
    }

    let semantic: string | null = null;
    const annotations: Annotation[] = [];
    if (next?.text === ":") {
      this.next();
      semantic = this.parseSemantic();
      if (this.peek()?.text === "<") {
        annotations.push(...this.parseAnnotations());
      }
    } else if (next?.text === "<") {
      annotations.push(...this.parseAnnotations());
    }

    let initializer: string | null = null;
    if (this.peek()?.text === "=") {
      this.next();
      initializer = this.parseInitializer();
    }

    if (this.peek()?.text === ";") {
      this.next();
    } else {
      this.addDiagnostic("warning", "Expected ';' after declaration", this.peek());
      this.skipToStatementEnd();
    }

    return {
      kind: "parameter",
      parameter: this.makeParameter(type, name ?? "", qualifiers, semantic, annotations, initializer, start),
    };
  }

  private makeParameter(
    type: string,
    name: string,
    qualifiers: string[],
    semantic: string | null,
    annotations: Annotation[],
    initializer: string | null,
    token: FxToken | null | undefined,
  ): ParameterDecl {
    const kind: ParameterKind = qualifiers.includes("static")
      ? "static"
      : type === "texture"
        ? "texture"
        : "parameter";
    return { kind, qualifiers, type, name, semantic, annotations, initializer, location: this.loc(token) };
  }

  private parseType(): string {
    const token = this.peek();
    if (token?.kind !== "identifier") {
      this.addDiagnostic("error", "Expected a type", token);
      return this.next()?.text ?? "";
    }
    let type = this.next()!.text;
    if (INTEGER_QUALIFIERS.has(type) && this.peek()?.kind === "identifier") {
      type += ` ${this.next()!.text}`;
    }
    return type;
  }

  private parseFunctionParams(): FunctionParamDecl[] {
    const params: FunctionParamDecl[] = [];
    this.expectToken("(");
    while (!this.atEnd() && this.peek()?.text !== ")") {
      const token = this.peek();
      if (token?.text === ",") {
        this.next();
        continue;
      }
      while (this.peek()?.kind === "identifier" && isQualifier(this.peek()!.text)) {
        this.next();
      }
      const type = this.parseType();
      let name: string | null = null;
      const nameToken = this.peek();
      if (nameToken?.kind === "identifier") {
        name = nameToken.text;
        this.next();
      }
      let semantic: string | null = null;
      if (this.peek()?.text === ":") {
        this.next();
        semantic = this.parseSemantic();
      }
      let initializer: string | null = null;
      if (this.peek()?.text === "=") {
        this.next();
        initializer = this.readRawUntil([",", ")"]).trim();
      }
      params.push({ type, name, semantic, initializer });
      if (this.peek()?.text === ",") {
        this.next();
      } else if (this.peek()?.text !== ")") {
        this.addDiagnostic("warning", "Expected ',' or ')' in parameter list", this.peek());
      }
    }
    this.expectToken(")");
    return params;
  }

  private parseSemantic(): string | null {
    const token = this.peek();
    if (token?.kind !== "identifier") {
      this.addDiagnostic("warning", "Expected semantic identifier", token);
      return null;
    }
    const name = this.next()!.text;
    if (name === "register" && this.peek()?.text === "(") {
      const inner = this.readBalancedTokens("(", ")");
      return `register(${inner.map((t) => t.text).join("")})`;
    }
    return name;
  }

  private parseAnnotations(): Annotation[] {
    const result: Annotation[] = [];
    this.expectToken("<");
    while (!this.atEnd() && this.peek()?.text !== ">") {
      const token = this.peek();
      if (!token) break;
      if (token.text === ";") {
        this.next();
        continue;
      }
      if (token.kind !== "identifier") {
        this.addDiagnostic("warning", "Skipping malformed annotation entry", token);
        this.next();
        continue;
      }
      const annotationType = this.next()!.text;
      const annotationName = this.expectIdentifier("Expected annotation name");
      let value: AnnotationValue = { kind: "raw", value: "" };
      if (this.peek()?.text === "=") {
        this.next();
        value = this.readAnnotationValue();
      }
      if (this.peek()?.text === ";") {
        this.next();
      } else {
        this.addDiagnostic("warning", "Expected ';' after annotation value", this.peek());
      }
      result.push({ type: annotationType, name: annotationName, value });
    }
    if (this.peek()?.text === ">") {
      this.next();
    } else {
      this.addDiagnostic("error", "Unterminated annotation block", this.peek());
    }
    return result;
  }

  private readAnnotationValue(): AnnotationValue {
    const token = this.peek();
    if (!token) {
      return { kind: "raw", value: "" };
    }
    if (token.kind === "string") {
      return { kind: "string", value: this.readStringValue() };
    }
    if (token.kind === "number") {
      this.next();
      return { kind: "number", value: token.value ?? Number(parseFloat(token.text)) };
    }
    if (token.kind === "identifier") {
      if (token.text === "true" || token.text === "false") {
        this.next();
        return { kind: "boolean", value: token.text === "true" };
      }
      if (token.text === "null") {
        this.next();
        return { kind: "identifier", value: "null" };
      }
      const macro = this.macros.get(token.text);
      if (macro) {
        this.next();
        if (macro.stringValue != null) {
          return { kind: "string", value: macro.stringValue };
        }
        if (macro.numberValue != null) {
          return { kind: "number", value: macro.numberValue };
        }
        return { kind: "identifier", value: macro.value ?? token.text };
      }
      this.next();
      return { kind: "identifier", value: token.text };
    }
    if (token.text === "{") {
      const braced = this.readBalancedTokens("{", "}");
      const numbers: number[] = [];
      let isVector = true;
      for (const inner of braced) {
        if (inner.kind === "number") {
          numbers.push(inner.value ?? Number(parseFloat(inner.text)));
        } else if (inner.text === "," || inner.text === ";") {
          continue;
        } else {
          isVector = false;
          break;
        }
      }
      if (isVector && numbers.length > 0) {
        return { kind: "vector", value: numbers };
      }
      return { kind: "raw", value: braced.map((t) => t.text).join(" ") };
    }
    const raw = this.readRawUntil([";", ">"]);
    return { kind: "raw", value: raw.trim() };
  }

  private readStringValue(): string {
    let out = "";
    while (!this.atEnd()) {
      const token = this.peek();
      if (token === undefined) break;
      if (token.kind === "string") {
        out += token.stringValue ?? token.text;
        this.next();
      } else if (token.kind === "identifier") {
        const macro = this.macros.get(token.text);
        if (macro && macro.stringValue != null) {
          out += macro.stringValue;
        } else if (macro && macro.value != null && !macro.functionLike) {
          out += macro.value;
        } else {
          this.addDiagnostic("warning", `Cannot expand macro '${token.text}' inside string literal`, token);
        }
        this.next();
      } else {
        break;
      }
    }
    return out;
  }

  private parseInitializer(): string {
    return this.readRawUntil([";"]);
  }

  private readCallArgs(): string[] {
    const args: string[] = [];
    this.expectToken("(");
    while (!this.atEnd() && this.peek()?.text !== ")") {
      if (this.peek()?.text === ",") {
        this.next();
        continue;
      }
      const arg = this.readRawUntil([",", ")"]).trim();
      if (arg) {
        args.push(arg);
      }
    }
    this.expectToken(")");
    return args;
  }

  private readRawUntil(delimiters: string[]): string {
    const parts: string[] = [];
    let depth = 0;
    while (!this.atEnd()) {
      const token = this.peek();
      if (!token) break;
      if (delimiters.includes(token.text) && depth === 0) {
        break;
      }
      if (token.text === "(" || token.text === "{" || token.text === "[") {
        depth += 1;
      } else if (token.text === ")" || token.text === "}" || token.text === "]") {
        if (depth === 0) {
          break;
        }
        depth -= 1;
      }
      parts.push(token.text);
      this.next();
    }
    return parts.join(" ");
  }

  private readBalancedTokens(open: string, close: string): FxToken[] {
    const out: FxToken[] = [];
    if (this.peek()?.text !== open) {
      return out;
    }
    this.next();
    let depth = 1;
    while (!this.atEnd()) {
      const token = this.next();
      if (!token) break;
      if (token.text === open) {
        depth += 1;
      } else if (token.text === close) {
        depth -= 1;
        if (depth === 0) {
          break;
        }
      }
      out.push(token);
    }
    return out;
  }

  private skipBalanced(open: string): void {
    let depth = 0;
    while (!this.atEnd()) {
      const token = this.next();
      if (!token) return;
      if (token.text === open) {
        depth += 1;
      } else if (open === "{" && token.text === "}") {
        depth -= 1;
        if (depth === 0) return;
      } else if (open === "(" && token.text === ")") {
        depth -= 1;
        if (depth === 0) return;
      } else if (open === "[" && token.text === "]") {
        depth -= 1;
        if (depth === 0) return;
      }
    }
  }

  private skipToStatementEnd(): void {
    let depth = 0;
    while (!this.atEnd()) {
      const token = this.next();
      if (!token) return;
      if (token.text === "(" || token.text === "{" || token.text === "[") {
        depth += 1;
      } else if (token.text === ")" || token.text === "}" || token.text === "]") {
        if (depth === 0) {
          return;
        }
        depth -= 1;
      } else if (token.text === ";" && depth === 0) {
        return;
      }
    }
  }

  private skipEmptyStatements(): void {
    while (this.peek()?.text === ";") {
      this.next();
    }
  }

  private expectIdentifier(message: string): string {
    const token = this.peek();
    if (token?.kind === "identifier") {
      this.next();
      return token.text;
    }
    this.addDiagnostic("error", message, token);
    if (token) {
      this.next();
    }
    return "";
  }

  private expectToken(text: string): void {
    const token = this.peek();
    if (token?.text === text) {
      this.next();
      return;
    }
    this.addDiagnostic("error", `Expected '${text}'`, token);
    if (token) {
      this.next();
    }
  }

  private atEnd(): boolean {
    return this.pos >= this.tokens.length;
  }

  private peek(): FxToken | undefined {
    return this.tokens[this.pos];
  }

  private next(): FxToken | undefined {
    const token = this.tokens[this.pos];
    if (token) {
      this.pos += 1;
    }
    return token;
  }

  private loc(token: FxToken | null | undefined): SourceLocation | null {
    if (!token) {
      return null;
    }
    return { offset: token.offset, line: token.line, column: token.column };
  }

  private addDiagnostic(
    severity: "error" | "warning" | "info",
    message: string,
    token: FxToken | null | undefined,
  ): void {
    this.diagnostics.push(makeDiagnostic(severity, "fx.parse", message, this.loc(token)));
  }
}
