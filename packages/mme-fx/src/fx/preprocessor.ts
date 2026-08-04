import { makeDiagnostic } from "../diagnostics.ts";
import type { Diagnostic, SourceLocation } from "../diagnostics.ts";
import type { FxToken } from "./lexer.ts";
import type { DefineDecl } from "./ir.ts";

export interface Macro {
  name: string;
  value: string | null;
  stringValue: string | null;
  numberValue: number | null;
  functionLike: boolean;
  params: string[] | null;
  location: SourceLocation | null;
}

export interface PreprocessResult {
  tokens: FxToken[];
  macros: Map<string, Macro>;
  defines: DefineDecl[];
  includes: string[];
}

interface ConditionFrame {
  parentActive: boolean;
  active: boolean;
  branchTaken: boolean;
}

const CONDITIONAL_DIRECTIVES = new Set(["if", "ifdef", "ifndef", "elif", "else", "endif"]);

function locOf(token: FxToken): SourceLocation {
  return { offset: token.offset, line: token.line, column: token.column };
}

function stripDirectiveComment(directive: string): string {
  let inString = false;
  for (let i = 0; i < directive.length - 1; i += 1) {
    const c = directive[i];
    if (c === '"') {
      inString = !inString;
    }
    if (!inString && c === "/" && directive[i + 1] === "/") {
      return directive.slice(0, i);
    }
  }
  return directive;
}

function splitDirective(directive: string): { keyword: string; argument: string } {
  const cleaned = stripDirectiveComment(directive);
  const trimmed = cleaned.trimStart();
  const body = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  const match = /^([A-Za-z_][A-Za-z0-9_]*)\s*/.exec(body);
  if (!match) {
    return { keyword: "", argument: body };
  }
  return {
    keyword: match[1],
    argument: body.slice(match[0].length).trim(),
  };
}

function decodeStringLiteral(value: string): string {
  const inner = value.slice(1, -1);
  let out = "";
  for (let i = 0; i < inner.length; i += 1) {
    const c = inner[i];
    if (c === "\\" && i + 1 < inner.length) {
      const nextChar = inner[i + 1];
      if (nextChar === "n") out += "\n";
      else if (nextChar === "t") out += "\t";
      else if (nextChar === "r") out += "\r";
      else if (nextChar === '"') out += '"';
      else if (nextChar === "\\") out += "\\";
      else out += nextChar;
      i += 1;
    } else {
      out += c;
    }
  }
  return out;
}

function parseDefine(argument: string, token: FxToken): Macro | null {
  const trimmed = argument.trim();
  const nameMatch = /^([A-Za-z_$][A-Za-z0-9_$]*)/.exec(trimmed);
  if (!nameMatch) {
    return null;
  }
  const name = nameMatch[1];
  const afterName = trimmed.slice(name.length);
  const location = locOf(token);

  if (afterName.startsWith("(")) {
    const paramsMatch = /^\(([^)]*)\)(.*)$/s.exec(afterName);
    const params = paramsMatch
      ? paramsMatch[1].split(",").map((p) => p.trim()).filter(Boolean)
      : null;
    const value = paramsMatch ? paramsMatch[2].trim() : null;
    return {
      name,
      value: value || null,
      stringValue: null,
      numberValue: null,
      functionLike: true,
      params,
      location,
    };
  }

  const value = afterName.trim();
  if (value === "") {
    return { name, value: null, stringValue: null, numberValue: null, functionLike: false, params: null, location };
  }
  if (/^"(?:[^"\\]|\\.)*"$/.test(value)) {
    return { name, value, stringValue: decodeStringLiteral(value), numberValue: null, functionLike: false, params: null, location };
  }
  if (/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?[fFhHlLuU]*$/.test(value)) {
    return { name, value, stringValue: null, numberValue: Number(parseFloat(value)), functionLike: false, params: null, location };
  }
  return { name, value, stringValue: null, numberValue: null, functionLike: false, params: null, location };
}

interface ExprToken {
  kind: "num" | "ident" | "op";
  text: string;
  num: number;
}

function tokenizeExpr(expr: string): ExprToken[] {
  const out: ExprToken[] = [];
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (c === " " || c === "\t" || c === "\r" || c === "\n") {
      i += 1;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let s = "";
      while (i < expr.length && /[A-Za-z0-9_$]/.test(expr[i])) {
        s += expr[i];
        i += 1;
      }
      out.push({ kind: "ident", text: s, num: 0 });
      continue;
    }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(expr[i + 1] ?? ""))) {
      let s = "";
      while (i < expr.length && /[0-9]/.test(expr[i])) {
        s += expr[i];
        i += 1;
      }
      if (expr[i] === ".") {
        s += ".";
        i += 1;
        while (i < expr.length && /[0-9]/.test(expr[i])) {
          s += expr[i];
          i += 1;
        }
      }
      if (expr[i] === "e" || expr[i] === "E") {
        s += expr[i];
        i += 1;
        if (expr[i] === "+" || expr[i] === "-") {
          s += expr[i];
          i += 1;
        }
        while (i < expr.length && /[0-9]/.test(expr[i])) {
          s += expr[i];
          i += 1;
        }
      }
      out.push({ kind: "num", text: s, num: Number(parseFloat(s)) });
      continue;
    }
    const two = expr.slice(i, i + 2);
    if (["==", "!=", "<=", ">=", "&&", "||"].includes(two)) {
      out.push({ kind: "op", text: two, num: 0 });
      i += 2;
      continue;
    }
    if ("()+-*/%!~<>,?".includes(c)) {
      out.push({ kind: "op", text: c, num: 0 });
      i += 1;
      continue;
    }
    i += 1;
  }
  return out;
}

function evalCondition(expr: string, macros: Map<string, Macro>): number {
  const tokens = tokenizeExpr(expr);
  let index = 0;

  function peek(): ExprToken | undefined {
    return tokens[index];
  }

  function next(): ExprToken | undefined {
    const token = tokens[index];
    index += 1;
    return token;
  }

  function parsePrimary(): number {
    const token = next();
    if (!token) return 0;
    if (token.kind === "num") return token.num;
    if (token.kind === "ident") {
      if (token.text === "defined") {
        let name = "";
        const open = peek();
        if (open?.kind === "op" && open.text === "(") {
          next();
          const inner = next();
          if (inner?.kind === "ident") name = inner.text;
          if (peek()?.kind === "op" && peek()?.text === ")") next();
        } else {
          const inner = next();
          if (inner?.kind === "ident") name = inner.text;
        }
        return macros.has(name) ? 1 : 0;
      }
      const macro = macros.get(token.text);
      if (macro?.numberValue != null) return macro.numberValue;
      return 0;
    }
    if (token.kind === "op" && token.text === "(") {
      const value = parseOr();
      if (peek()?.kind === "op" && peek()?.text === ")") next();
      return value;
    }
    return 0;
  }

  function parseUnary(): number {
    const token = peek();
    if (token?.kind === "op" && token.text === "!") {
      next();
      return parseUnary() ? 0 : 1;
    }
    if (token?.kind === "op" && token.text === "-") {
      next();
      return -parseUnary();
    }
    if (token?.kind === "op" && token.text === "+") {
      next();
      return parseUnary();
    }
    if (token?.kind === "op" && token.text === "~") {
      next();
      return ~parseUnary();
    }
    return parsePrimary();
  }

  function parseMul(): number {
    let value = parseUnary();
    for (;;) {
      const op = peek();
      if (op?.kind !== "op" || (op.text !== "*" && op.text !== "/" && op.text !== "%")) break;
      next();
      const right = parseUnary();
      if (op.text === "*") value = value * right;
      else if (op.text === "/") value = right === 0 ? 0 : value / right;
      else value = right === 0 ? 0 : value % right;
    }
    return value;
  }

  function parseAdd(): number {
    let value = parseMul();
    for (;;) {
      const op = peek();
      if (op?.kind !== "op" || (op.text !== "+" && op.text !== "-")) break;
      next();
      const right = parseMul();
      value = op.text === "+" ? value + right : value - right;
    }
    return value;
  }

  function parseRel(): number {
    let value = parseAdd();
    for (;;) {
      const op = peek();
      if (op?.kind !== "op" || (op.text !== "<" && op.text !== "<=" && op.text !== ">" && op.text !== ">=")) break;
      next();
      const right = parseAdd();
      if (op.text === "<") value = value < right ? 1 : 0;
      else if (op.text === "<=") value = value <= right ? 1 : 0;
      else if (op.text === ">") value = value > right ? 1 : 0;
      else value = value >= right ? 1 : 0;
    }
    return value;
  }

  function parseEq(): number {
    let value = parseRel();
    for (;;) {
      const op = peek();
      if (op?.kind !== "op" || (op.text !== "==" && op.text !== "!=")) break;
      next();
      const right = parseRel();
      value = op.text === "==" ? (value === right ? 1 : 0) : (value !== right ? 1 : 0);
    }
    return value;
  }

  function parseAnd(): number {
    let value = parseEq();
    for (;;) {
      const op = peek();
      if (op?.kind !== "op" || op.text !== "&&") break;
      next();
      const right = parseEq();
      value = value !== 0 && right !== 0 ? 1 : 0;
    }
    return value;
  }

  function parseOr(): number {
    let value = parseAnd();
    for (;;) {
      const op = peek();
      if (op?.kind !== "op" || op.text !== "||") break;
      next();
      const right = parseAnd();
      value = value !== 0 || right !== 0 ? 1 : 0;
    }
    return value;
  }

  return parseOr();
}

export function preprocessFx(
  tokens: FxToken[],
  diagnostics: Diagnostic[],
): PreprocessResult {
  const macros = new Map<string, Macro>();
  const defines: DefineDecl[] = [];
  const includes: string[] = [];
  const out: FxToken[] = [];
  const stack: ConditionFrame[] = [];

  function isActive(): boolean {
    return stack.every((frame) => frame.active);
  }

  for (const token of tokens) {
    if (token.kind !== "preprocessor") {
      if (isActive()) out.push(token);
      continue;
    }

    const { keyword, argument } = splitDirective(token.text);

    if (!isActive() && !CONDITIONAL_DIRECTIVES.has(keyword)) {
      continue;
    }

    switch (keyword) {
      case "define": {
        if (!isActive()) break;
        const macro = parseDefine(argument, token);
        if (macro) {
          macros.set(macro.name, macro);
          defines.push({ name: macro.name, value: macro.value, location: macro.location });
        }
        break;
      }
      case "undef": {
        if (isActive()) {
          const name = argument.trim();
          macros.delete(name);
        }
        break;
      }
      case "include": {
        if (!isActive()) break;
        const match = /^[<"]([^>"]+)[>"]$/u.exec(argument.trim());
        if (match === null) {
          diagnostics.push(
            makeDiagnostic(
              "warning",
              "fx.invalidInclude",
              `Unable to parse #include ${argument}`,
              locOf(token),
            ),
          );
        } else {
          includes.push(match[1]!.replaceAll("\\", "/"));
        }
        break;
      }
      case "if": {
        const active = isActive();
        const taken = active ? evalCondition(argument, macros) !== 0 : false;
        stack.push({ parentActive: active, active: active && taken, branchTaken: active && taken });
        break;
      }
      case "ifdef": {
        const active = isActive();
        const taken = macros.has(argument.trim());
        stack.push({ parentActive: active, active: active && taken, branchTaken: active && taken });
        break;
      }
      case "ifndef": {
        const active = isActive();
        const taken = !macros.has(argument.trim());
        stack.push({ parentActive: active, active: active && taken, branchTaken: active && taken });
        break;
      }
      case "elif": {
        const frame = stack[stack.length - 1];
        if (!frame) break;
        const active = frame.parentActive && !frame.branchTaken;
        const taken = active ? evalCondition(argument, macros) !== 0 : false;
        frame.active = active && taken;
        frame.branchTaken = frame.branchTaken || (active && taken);
        break;
      }
      case "else": {
        const frame = stack[stack.length - 1];
        if (!frame) break;
        const active = frame.parentActive && !frame.branchTaken;
        frame.active = active;
        frame.branchTaken = frame.branchTaken || active;
        break;
      }
      case "endif": {
        stack.pop();
        break;
      }
      default: {
        if (isActive()) {
          diagnostics.push(
            makeDiagnostic(
              "warning",
              "fx.unsupportedDirective",
              `Unsupported preprocessor directive '#${keyword || "?"}'`,
              locOf(token),
            ),
          );
        }
        break;
      }
    }
  }

  if (stack.length > 0) {
    diagnostics.push(
      makeDiagnostic(
        "warning",
        "fx.unterminatedConditional",
        "Unterminated preprocessor conditional block",
        null,
      ),
    );
  }

  return { tokens: out, macros, defines, includes };
}
