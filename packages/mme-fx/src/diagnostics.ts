export type DiagnosticSeverity = "error" | "warning" | "info";

export interface SourceLocation {
  offset: number;
  line: number;
  column: number;
}

export interface Diagnostic {
  severity: DiagnosticSeverity;
  code: string;
  message: string;
  location: SourceLocation | null;
}

export function makeDiagnostic(
  severity: DiagnosticSeverity,
  code: string,
  message: string,
  location: SourceLocation | null,
): Diagnostic {
  return { severity, code, message, location };
}
