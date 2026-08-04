import { makeDiagnostic } from "../diagnostics.ts";
import type { EmdMaterialBinding, ParseEmdResult } from "./ir.ts";

function effectPath(value: string): string | null {
  const normalized = value.trim().replaceAll("\\", "/");
  return normalized.toLowerCase() === "none" || normalized === ""
    ? null
    : normalized;
}

/** Parses MME's INI-like .emd material-to-effect assignment format. */
export function parseEmdEffectMap(source: string): ParseEmdResult {
  const diagnostics = [];
  const materials: EmdMaterialBinding[] = [];
  let section = "";
  let version: number | null = null;
  let objectEffectPath: string | null = null;
  let objectVisible = true;

  for (const [lineIndex, rawLine] of source.replace(/^\uFEFF/u, "").split(/\r?\n/u).entries()) {
    const line = rawLine.trim();
    if (line === "" || line.startsWith(";") || line.startsWith("#")) continue;
    const sectionMatch = /^\[([^\]]+)\]$/u.exec(line);
    if (sectionMatch !== null) {
      section = sectionMatch[1]!.trim().toLowerCase();
      continue;
    }
    const equals = line.indexOf("=");
    if (equals < 0) {
      diagnostics.push(
        makeDiagnostic(
          "warning",
          "emd.invalidLine",
          `Ignoring malformed EMD line ${lineIndex + 1}`,
          null,
        ),
      );
      continue;
    }
    const key = line.slice(0, equals).trim();
    const value = line.slice(equals + 1).trim();
    if (section === "info" && key.toLowerCase() === "version") {
      const parsed = Number.parseInt(value, 10);
      version = Number.isFinite(parsed) ? parsed : null;
      continue;
    }
    if (section !== "effect") continue;
    if (key.toLowerCase() === "obj") {
      objectEffectPath = effectPath(value);
      continue;
    }
    if (key.toLowerCase() === "obj.show") {
      objectVisible = value.toLowerCase() !== "false" && value !== "0";
      continue;
    }
    const materialMatch = /^Obj\[(\d+)\]$/iu.exec(key);
    if (materialMatch !== null) {
      materials.push({
        materialIndex: Number.parseInt(materialMatch[1]!, 10),
        effectPath: effectPath(value),
      });
    }
  }

  materials.sort((left, right) => left.materialIndex - right.materialIndex);
  if (version === null && materials.length === 0 && objectEffectPath === null) {
    diagnostics.push(
      makeDiagnostic("error", "emd.empty", "No EMD effect assignments found", null),
    );
    return { effectMap: null, diagnostics };
  }
  return {
    effectMap: { version, objectEffectPath, objectVisible, materials },
    diagnostics,
  };
}
