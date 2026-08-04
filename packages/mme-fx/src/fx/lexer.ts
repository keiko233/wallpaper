import { makeDiagnostic } from "../diagnostics.ts";
import type { Diagnostic, SourceLocation } from "../diagnostics.ts";

export type FxTokenKind =
  | "identifier"
  | "number"
  | "string"
  | "preprocessor"
  | "punct";

export interface FxToken {
  kind: FxTokenKind;
  text: string;
  value: number | null;
  stringValue: string | null;
  line: number;
  column: number;
  offset: number;
}

const TWO_CHAR_PUNCT = new Set([
  "==", "!=", "<=", ">=", "&&", "||", "<<", ">>", "+=", "-=", "*=", "/=",
  "%=", "&=", "|=", "^=", "->", "++", "--", "::",
]);

function isIdentStart(ch: string | undefined): boolean {
  return ch != null && /[A-Za-z_$]/.test(ch);
}

function isIdentPart(ch: string | undefined): boolean {
  return ch != null && /[A-Za-z0-9_$]/.test(ch);
}

function isDigit(ch: string | undefined): boolean {
  return ch != null && ch >= "0" && ch <= "9";
}

function locationAt(
  offset: number,
  line: number,
  column: number,
): SourceLocation {
  return { offset, line, column };
}

export interface LexResult {
  tokens: FxToken[];
  diagnostics: Diagnostic[];
}

export function lexFxSource(source: string): LexResult {
  const tokens: FxToken[] = [];
  const diagnostics: Diagnostic[] = [];
  const text = source.charCodeAt(0) === 0xfeff ? source.slice(1) : source;
  const n = text.length;
  let i = 0;
  let line = 1;
  let column = 1;

  function advance(): void {
    if (text[i] === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
    i += 1;
  }

  while (i < n) {
    const ch = text[i];
    const startLine = line;
    const startColumn = column;
    const startOffset = i;

    if (ch === " " || ch === "\t" || ch === "\r" || ch === "\n" || ch === "\f" || ch === "\v") {
      advance();
      continue;
    }

    if (ch === "/" && text[i + 1] === "/") {
      while (i < n && text[i] !== "\n") {
        advance();
      }
      continue;
    }

    if (ch === "/" && text[i + 1] === "*") {
      const commentOffset = i;
      advance();
      advance();
      let closed = false;
      while (i < n) {
        if (text[i] === "*" && text[i + 1] === "/") {
          advance();
          advance();
          closed = true;
          break;
        }
        advance();
      }
      if (!closed) {
        diagnostics.push(
          makeDiagnostic(
            "error",
            "fx.unterminatedComment",
            "Unterminated block comment",
            locationAt(commentOffset, startLine, startColumn),
          ),
        );
      }
      continue;
    }

    if (ch === "#") {
      let raw = "";
      while (i < n && text[i] !== "\n") {
        raw += text[i];
        advance();
      }
      while (raw.endsWith("\\")) {
        raw = raw.slice(0, -1);
        if (i < n && text[i] === "\n") {
          advance();
        }
        while (i < n && text[i] !== "\n") {
          raw += text[i];
          advance();
        }
      }
      tokens.push({
        kind: "preprocessor",
        text: raw,
        value: null,
        stringValue: null,
        line: startLine,
        column: startColumn,
        offset: startOffset,
      });
      continue;
    }

    if (isIdentStart(ch)) {
      let value = "";
      while (i < n && isIdentPart(text[i])) {
        value += text[i];
        advance();
      }
      tokens.push({
        kind: "identifier",
        text: value,
        value: null,
        stringValue: null,
        line: startLine,
        column: startColumn,
        offset: startOffset,
      });
      continue;
    }

    if (isDigit(ch) || (ch === "." && isDigit(text[i + 1]))) {
      let value = "";
      while (i < n && isDigit(text[i])) {
        value += text[i];
        advance();
      }
      if (text[i] === ".") {
        value += text[i];
        advance();
        while (i < n && isDigit(text[i])) {
          value += text[i];
          advance();
        }
      }
      if (text[i] === "e" || text[i] === "E") {
        value += text[i];
        advance();
        if (text[i] === "+" || text[i] === "-") {
          value += text[i];
          advance();
        }
        while (i < n && isDigit(text[i])) {
          value += text[i];
          advance();
        }
      }
      while (i < n && /[fFhHlLuU]/.test(text[i])) {
        value += text[i];
        advance();
      }
      tokens.push({
        kind: "number",
        text: value,
        value: Number(parseFloat(value)),
        stringValue: null,
        line: startLine,
        column: startColumn,
        offset: startOffset,
      });
      continue;
    }

    if (ch === '"') {
      const stringOffset = i;
      advance();
      let value = "";
      let closed = false;
      while (i < n && text[i] !== "\n") {
        const c = text[i];
        if (c === "\\") {
          const nextChar = text[i + 1];
          if (nextChar === "n") {
            value += "\n";
            advance();
            advance();
            continue;
          }
          if (nextChar === "t") {
            value += "\t";
            advance();
            advance();
            continue;
          }
          if (nextChar === "r") {
            value += "\r";
            advance();
            advance();
            continue;
          }
          if (nextChar === "\\") {
            value += "\\";
            advance();
            advance();
            continue;
          }
          if (nextChar === '"') {
            value += '"';
            advance();
            advance();
            continue;
          }
          value += c;
          advance();
          continue;
        }
        if (c === '"') {
          advance();
          closed = true;
          break;
        }
        value += c;
        advance();
      }
      if (!closed) {
        diagnostics.push(
          makeDiagnostic(
            "error",
            "fx.unterminatedString",
            "Unterminated string literal",
            locationAt(stringOffset, startLine, startColumn),
          ),
        );
      }
      tokens.push({
        kind: "string",
        text: value,
        value: null,
        stringValue: value,
        line: startLine,
        column: startColumn,
        offset: startOffset,
      });
      continue;
    }

    const two = text.slice(i, i + 2);
    if (TWO_CHAR_PUNCT.has(two)) {
      tokens.push({
        kind: "punct",
        text: two,
        value: null,
        stringValue: null,
        line: startLine,
        column: startColumn,
        offset: startOffset,
      });
      advance();
      advance();
      continue;
    }

    if ("{}()<>[];,:.=!~?&|^+-*/%".includes(ch)) {
      tokens.push({
        kind: "punct",
        text: ch,
        value: null,
        stringValue: null,
        line: startLine,
        column: startColumn,
        offset: startOffset,
      });
      advance();
      continue;
    }

    diagnostics.push(
      makeDiagnostic(
        "warning",
        "fx.unexpectedCharacter",
        `Unexpected character '${ch}'`,
        locationAt(startOffset, startLine, startColumn),
      ),
    );
    advance();
  }

  return { tokens, diagnostics };
}
