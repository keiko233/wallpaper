interface VmdLoaderLogging {
  loggingEnabled: boolean;
  warn: (message: string) => void;
}

const UNKNOWN_PHYSICS_TOGGLE_WARNING =
  /^Unknown physics toggle info: (\d+)$/u;
const MAX_REPORTED_PHYSICS_TOGGLE_VALUES = 8;

/**
 * Coalesces a warning that babylon-mmd otherwise emits once per bone keyframe.
 * Other loader warnings continue to be forwarded immediately.
 */
export function aggregateVmdPhysicsToggleWarnings(
  loader: VmdLoaderLogging,
  motionLabel: string,
): () => void {
  loader.loggingEnabled = true;

  const originalWarn = loader.warn;
  const forwardWarning = (message: string): void => {
    originalWarn.call(loader, message);
  };
  const counts = new Map<number, number>();

  loader.warn = (message) => {
    const match = UNKNOWN_PHYSICS_TOGGLE_WARNING.exec(message);
    if (match === null) {
      forwardWarning(message);
      return;
    }

    const value = Number(match[1]);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  };

  return () => {
    loader.warn = originalWarn;

    const entries = [...counts.entries()].sort(([left], [right]) => left - right);
    if (entries.length === 0) {
      return;
    }

    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    const reportedEntries = entries.slice(0, MAX_REPORTED_PHYSICS_TOGGLE_VALUES);
    const valueSummary = reportedEntries
      .map(([value, count]) => `${value} x ${count}`)
      .join(", ");
    const omittedValueCount = entries.length - reportedEntries.length;
    const omittedSummary =
      omittedValueCount > 0 ? `, plus ${omittedValueCount} other values` : "";

    forwardWarning(
      `${motionLabel} VMD contains ${total} non-standard physics toggle markers ` +
        `(${valueSummary}${omittedSummary}); duplicate warnings were suppressed. ` +
        "babylon-mmd default physics handling is unchanged.",
    );
  };
}
