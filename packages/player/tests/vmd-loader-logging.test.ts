import { describe, expect, it } from "vitest";
import { aggregateVmdPhysicsToggleWarnings } from "../src/lib/babylon/vmd-loader-logging";

describe("VMD loader warning aggregation", () => {
  it("summarizes duplicate physics-toggle warnings and forwards other warnings", () => {
    const forwardedWarnings: string[] = [];
    const originalWarn = (message: string): void => {
      forwardedWarnings.push(message);
    };
    const loader = {
      loggingEnabled: false,
      warn: originalWarn,
    };

    const finishWarnings = aggregateVmdPhysicsToggleWarnings(
      loader,
      "Model motion",
    );

    loader.warn("Unknown physics toggle info: 5140");
    loader.warn("Unknown physics toggle info: 20");
    loader.warn("Unknown physics toggle info: 5140");
    loader.warn("Useful VMD warning");

    expect(loader.loggingEnabled).toBe(true);
    expect(forwardedWarnings).toEqual(["Useful VMD warning"]);

    finishWarnings();

    expect(forwardedWarnings).toEqual([
      "Useful VMD warning",
      "Model motion VMD contains 3 non-standard physics toggle markers " +
        "(20 x 1, 5140 x 2); duplicate warnings were suppressed. " +
        "babylon-mmd default physics handling is unchanged.",
    ]);

    loader.warn("Warning after load");
    expect(forwardedWarnings.at(-1)).toBe("Warning after load");
  });

  it("does not summarize similar but unrelated messages", () => {
    const forwardedWarnings: string[] = [];
    const loader = {
      loggingEnabled: false,
      warn: (message: string): void => {
        forwardedWarnings.push(message);
      },
    };

    const finishWarnings = aggregateVmdPhysicsToggleWarnings(
      loader,
      "Camera motion",
    );
    loader.warn("Unknown physics toggle info: invalid");
    loader.warn("Unknown physics setting: 5140");
    finishWarnings();

    expect(forwardedWarnings).toEqual([
      "Unknown physics toggle info: invalid",
      "Unknown physics setting: 5140",
    ]);
  });
});
