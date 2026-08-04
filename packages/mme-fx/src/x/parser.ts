import { makeDiagnostic } from "../diagnostics.ts";
import type { Diagnostic, SourceLocation } from "../diagnostics.ts";
import { lexXSource } from "./lexer.ts";
import type { XToken } from "./lexer.ts";
import type { DirectXTextMesh, ParseDirectXTextMeshResult } from "./ir.ts";

interface Parsed<T> {
  value: T;
  next: number;
}

class XMeshParser {
  private readonly tokens: XToken[];
  private readonly diagnostics: Diagnostic[];
  private headerVersion = "";
  private cursor = 0;

  constructor(tokens: XToken[], diagnostics: Diagnostic[]) {
    this.tokens = tokens;
    this.diagnostics = diagnostics;
  }

  parse(): DirectXTextMesh | null {
    this.readHeader();
    while (this.cursor < this.tokens.length) {
      const token = this.tokens[this.cursor];
      if (token.kind === "ident" && token.text === "template") {
        this.skipTemplate();
        continue;
      }
      if (token.kind === "ident" && token.text === "Mesh") {
        let j = this.cursor + 1;
        if (this.tokens[j]?.kind === "ident") {
          j += 1;
        }
        if (this.tokens[j]?.kind === "lt") {
          j += 1;
          if (this.tokens[j]?.kind === "gt") {
            j += 1;
          }
        }
        if (this.tokens[j]?.kind === "lbrace") {
          return this.parseMesh(j + 1);
        }
      }
      this.cursor += 1;
    }
    this.addDiagnostic("error", "No Mesh block found in DirectX text file", null);
    return null;
  }

  private readHeader(): void {
    const first = this.tokens[0];
    if (first?.kind === "ident" && first.text === "xof") {
      const parts: string[] = ["xof"];
      let i = 1;
      while (parts.length < 3 && i < this.tokens.length) {
        const token = this.tokens[i];
        if (token && (token.kind === "ident" || token.kind === "number")) {
          parts.push(token.text);
          i += 1;
        } else {
          break;
        }
      }
      this.headerVersion = parts.join(" ");
      this.cursor = i;
    } else {
      this.addDiagnostic("error", "Not a DirectX text format file (missing 'xof' header)", first ?? null);
      this.cursor = 0;
    }
  }

  private skipTemplate(): void {
    let i = this.cursor + 1;
    if (this.tokens[i]?.kind === "ident") {
      i += 1;
    }
    if (this.tokens[i]?.kind === "lbrace") {
      this.cursor = this.skipBalanced(i);
    } else {
      this.cursor = i;
    }
  }

  private parseMesh(start: number): DirectXTextMesh | null {
    let pos = start;
    const positions: [number, number, number][] = [];
    const faces: number[][] = [];

    const vertexCount = this.readCount(pos);
    if (!vertexCount) {
      this.addDiagnostic("error", "Expected vertex count in Mesh block", this.tokens[pos] ?? null);
      return null;
    }
    pos = vertexCount.next;
    for (let i = 0; i < vertexCount.value; i += 1) {
      const vertex = this.readVector(pos);
      if (!vertex) {
        this.addDiagnostic("error", `Expected vertex ${i} in Mesh block`, this.tokens[pos] ?? null);
        return null;
      }
      positions.push(vertex.value);
      pos = vertex.next;
    }

    const faceCount = this.readCount(pos);
    if (!faceCount) {
      this.addDiagnostic("error", "Expected face count in Mesh block", this.tokens[pos] ?? null);
      return null;
    }
    pos = faceCount.next;
    for (let i = 0; i < faceCount.value; i += 1) {
      const face = this.readFace(pos);
      if (!face) {
        this.addDiagnostic("error", `Expected face ${i} in Mesh block`, this.tokens[pos] ?? null);
        return null;
      }
      faces.push(face.value);
      pos = face.next;
    }

    let uvs: [number, number][] | null = null;

    while (pos < this.tokens.length && this.tokens[pos].kind !== "rbrace") {
      const token = this.tokens[pos];
      if (token.kind === "ident" && this.tokens[pos + 1]?.kind === "lbrace") {
        if (token.text === "MeshTextureCoords") {
          const coords = this.readTextureCoords(pos + 2);
          if (!coords) {
            this.addDiagnostic("error", "Invalid MeshTextureCoords block", token);
            return null;
          }
          uvs = coords.value;
          pos = coords.next;
        } else {
          pos = this.skipBalanced(pos + 1);
        }
      } else {
        this.addDiagnostic("warning", "Skipping unexpected token in Mesh block", token);
        pos += 1;
      }
    }

    if (pos >= this.tokens.length) {
      this.addDiagnostic("error", "Unterminated Mesh block", null);
      return null;
    }

    return this.buildMesh(vertexCount.value, positions, faces, uvs);
  }

  private buildMesh(
    vertexCount: number,
    positions: [number, number, number][],
    faces: number[][],
    uvs: [number, number][] | null,
  ): DirectXTextMesh {
    const indices: number[] = [];
    let triangleCount = 0;

    for (let f = 0; f < faces.length; f += 1) {
      const face = faces[f];
      let valid = face.length >= 3;
      for (const index of face) {
        if (!Number.isInteger(index) || index < 0 || index >= vertexCount) {
          this.addDiagnostic(
            "error",
            `Face ${f} references out-of-range vertex index ${index}`,
            null,
          );
          valid = false;
        }
      }
      if (!valid) {
        continue;
      }
      if (face.length === 3) {
        indices.push(face[0]!, face[1]!, face[2]!);
        triangleCount += 1;
      } else {
        for (let i = 1; i < face.length - 1; i += 1) {
          indices.push(face[0]!, face[i]!, face[i + 1]!);
          triangleCount += 1;
        }
      }
    }

    let min: [number, number, number] = [0, 0, 0];
    let max: [number, number, number] = [0, 0, 0];
    if (positions.length > 0) {
      let minX = Infinity;
      let minY = Infinity;
      let minZ = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      let maxZ = -Infinity;
      for (const [x, y, z] of positions) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        minZ = Math.min(minZ, z);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        maxZ = Math.max(maxZ, z);
      }
      min = [minX, minY, minZ];
      max = [maxX, maxY, maxZ];
    }

    if (uvs && uvs.length !== vertexCount) {
      this.addDiagnostic(
        "warning",
        `MeshTextureCoords count (${uvs.length}) does not match vertex count (${vertexCount})`,
        null,
      );
    }

    return {
      headerVersion: this.headerVersion,
      positions,
      indices,
      uvs,
      bounds: { min, max },
      vertexCount,
      faceCount: faces.length,
      triangleCount,
    };
  }

  private readCount(pos: number): Parsed<number> | null {
    const number = this.tokens[pos];
    if (number?.kind !== "number") {
      return null;
    }
    if (this.tokens[pos + 1]?.kind !== "semi") {
      return null;
    }
    return { value: Number(number.text), next: pos + 2 };
  }

  private readVector(pos: number): Parsed<[number, number, number]> | null {
    const a = this.tokens[pos];
    const s1 = this.tokens[pos + 1];
    const b = this.tokens[pos + 2];
    const s2 = this.tokens[pos + 3];
    const c = this.tokens[pos + 4];
    const s3 = this.tokens[pos + 5];
    if (
      !a || a.kind !== "number" ||
      s1?.kind !== "semi" ||
      !b || b.kind !== "number" ||
      s2?.kind !== "semi" ||
      !c || c.kind !== "number" ||
      s3?.kind !== "semi"
    ) {
      return null;
    }
    let next = pos + 6;
    const separator = this.tokens[next];
    if (separator?.kind === "comma" || separator?.kind === "semi") {
      next += 1;
    }
    return {
      value: [Number(a.text), Number(b.text), Number(c.text)],
      next,
    };
  }

  private readFace(pos: number): Parsed<number[]> | null {
    const countToken = this.tokens[pos];
    if (countToken?.kind !== "number") {
      return null;
    }
    const count = Number(countToken.text);
    if (this.tokens[pos + 1]?.kind !== "semi") {
      return null;
    }
    let p = pos + 2;
    const indices: number[] = [];
    for (let i = 0; i < count; i += 1) {
      const number = this.tokens[p];
      if (number?.kind !== "number") {
        return null;
      }
      indices.push(Number(number.text));
      p += 1;
      if (i < count - 1) {
        if (this.tokens[p]?.kind !== "comma") {
          return null;
        }
        p += 1;
      }
    }
    const terminator = this.tokens[p]?.kind;
    if (terminator !== "semi" && terminator !== "comma") {
      return null;
    }
    p += 1;
    if (terminator === "semi") {
      const separator = this.tokens[p];
      if (separator?.kind === "comma" || separator?.kind === "semi") {
        p += 1;
      }
    }
    return { value: indices, next: p };
  }

  private readTextureCoords(pos: number): Parsed<[number, number][]> | null {
    const countToken = this.tokens[pos];
    if (countToken?.kind !== "number") {
      return null;
    }
    const count = Number(countToken.text);
    if (this.tokens[pos + 1]?.kind !== "semi") {
      return null;
    }
    let p = pos + 2;
    const uvs: [number, number][] = [];
    for (let i = 0; i < count; i += 1) {
      const u = this.tokens[p];
      const su = this.tokens[p + 1];
      const v = this.tokens[p + 2];
      const sv = this.tokens[p + 3];
      if (
        !u || u.kind !== "number" ||
        (su?.kind !== "semi" && su?.kind !== "comma") ||
        !v || v.kind !== "number" ||
        sv?.kind !== "semi"
      ) {
        return null;
      }
      uvs.push([Number(u.text), Number(v.text)]);
      let np = p + 4;
      const separator = this.tokens[np];
      if (separator?.kind === "comma" || separator?.kind === "semi") {
        np += 1;
      }
      p = np;
    }
    return { value: uvs, next: p };
  }

  private skipBalanced(start: number): number {
    let depth = 0;
    let i = start;
    while (i < this.tokens.length) {
      const token = this.tokens[i];
      if (token.kind === "lbrace") {
        depth += 1;
      } else if (token.kind === "rbrace") {
        depth -= 1;
        if (depth === 0) {
          return i + 1;
        }
      }
      i += 1;
    }
    this.addDiagnostic("error", "Unbalanced braces in DirectX text file", null);
    return i;
  }

  private addDiagnostic(severity: "error" | "warning" | "info", message: string, token: XToken | null): void {
    this.diagnostics.push(
      makeDiagnostic(severity, "x.mesh", message, token ? this.locOf(token) : null),
    );
  }

  private locOf(token: XToken): SourceLocation {
    return { offset: token.offset, line: token.line, column: token.column };
  }
}

export function parseDirectXTextMesh(source: string): ParseDirectXTextMeshResult {
  const diagnostics: Diagnostic[] = [];
  const tokens = lexXSource(source, diagnostics);
  const parser = new XMeshParser(tokens, diagnostics);
  const mesh = parser.parse();
  return { mesh, diagnostics };
}
