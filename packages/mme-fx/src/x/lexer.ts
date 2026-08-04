import { makeDiagnostic } from "../diagnostics.ts";
import type { Diagnostic, SourceLocation } from "../diagnostics.ts";

export type XTokenKind =
  | "ident"
  | "number"
  | "string"
  | "lbrace"
  | "rbrace"
  | "semi"
  | "comma"
  | "lt"
  | "gt"
  | "lbracket"
  | "rbracket";

export interface XToken {
  kind: XTokenKind;
  text: string;
  line: number;
  column: number;
  offset: number;
}

function isDigit(ch: string | undefined): boolean {
  return ch != null && ch >= "0" && ch <= "9";
}

function isIdentStart(ch: string | undefined): boolean {
  return ch != null && /[A-Za-z_]/.test(ch);
}

function isIdentPart(ch: string | undefined): boolean {
  return ch != null && /[A-Za-z0-9_]/.test(ch);
}

export function lexXSource(source: string, diagnostics: Diagnostic[]): XToken[] {
  const tokens: XToken[] = [];
  const text = source.charCodeAt(0) === 0xfeff ? source.slice(1) : source;
  const n = text.length;
  let i = 0;
  let line = 1;
  let column = 1;

  function push(kind: XTokenKind, value: string, offset: number, startLine: number, startColumn: number): void {
    tokens.push({ kind, text: value, line: startLine, column: startColumn, offset });
  }

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
            "x.unterminatedComment",
            "Unterminated block comment",
            { offset: commentOffset, line: startLine, column: startColumn } satisfies SourceLocation,
          ),
        );
      }
      continue;
    }

    if (ch === "#") {
      while (i < n && text[i] !== "\n") {
        advance();
      }
      continue;
    }

    if (ch === "{") {
      push("lbrace", ch, startOffset, startLine, startColumn);
      advance();
      continue;
    }
    if (ch === "}") {
      push("rbrace", ch, startOffset, startLine, startColumn);
      advance();
      continue;
    }
    if (ch === ";") {
      push("semi", ch, startOffset, startLine, startColumn);
      advance();
      continue;
    }
    if (ch === ",") {
      push("comma", ch, startOffset, startLine, startColumn);
      advance();
      continue;
    }
    if (ch === "<") {
      push("lt", ch, startOffset, startLine, startColumn);
      advance();
      continue;
    }
    if (ch === ">") {
      push("gt", ch, startOffset, startLine, startColumn);
      advance();
      continue;
    }
    if (ch === "[") {
      push("lbracket", ch, startOffset, startLine, startColumn);
      advance();
      continue;
    }
    if (ch === "]") {
      push("rbracket", ch, startOffset, startLine, startColumn);
      advance();
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
          if (nextChar === '"') {
            value += '"';
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
            "x.unterminatedString",
            "Unterminated string literal",
            { offset: stringOffset, line: startLine, column: startColumn } satisfies SourceLocation,
          ),
        );
      }
      push("string", value, startOffset, startLine, startColumn);
      continue;
    }

    if (
      isDigit(ch) ||
      ((ch === "-" || ch === "+") && isDigit(text[i + 1])) ||
      (ch === "." && isDigit(text[i + 1]))
    ) {
      let value = "";
      if (ch === "-" || ch === "+") {
        value += ch;
        advance();
      }
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
      let kind: XTokenKind = "number";
      if (isIdentStart(text[i])) {
        while (i < n && isIdentPart(text[i])) {
          value += text[i];
          advance();
        }
        kind = "ident";
      }
      push(kind, value, startOffset, startLine, startColumn);
      continue;
    }

    if (isIdentStart(ch)) {
      let value = "";
      while (i < n && isIdentPart(text[i])) {
        value += text[i];
        advance();
      }
      push("ident", value, startOffset, startLine, startColumn);
      continue;
    }

    if (ch === "-" || ch === "+") {
      if (isIdentStart(text[i + 1])) {
        let value = ch;
        advance();
        while (i < n && isIdentPart(text[i])) {
          value += text[i];
          advance();
        }
        push("ident", value, startOffset, startLine, startColumn);
        continue;
      }
    }

    diagnostics.push(
      makeDiagnostic(
        "warning",
        "x.unexpectedCharacter",
        `Unexpected character '${ch}'`,
        { offset: startOffset, line: startLine, column: startColumn } satisfies SourceLocation,
      ),
    );
    advance();
  }

  return tokens;
}
