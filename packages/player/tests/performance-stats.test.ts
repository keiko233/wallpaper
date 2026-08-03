import type { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PERFORMANCE_FRAME_BUFFER_SIZE,
  PERFORMANCE_GRAPH_BARS,
  PerformanceStats,
} from "../src/lib/performance-stats";

function createEngine(): AbstractEngine {
  return {
    _drawCalls: { current: 12 },
    scenes: [{ getActiveMeshes: () => new Array(34) }],
    getGlInfo: () => ({
      vendor: "Test vendor",
      renderer: "Test renderer",
      version: "Test version",
    }),
    getRenderWidth: () => 1920,
    getRenderHeight: () => 1080,
  } as unknown as AbstractEngine;
}

function recordFrames(stats: PerformanceStats, frameTimes: number[]): void {
  const engine = createEngine();
  for (const frameTime of frameTimes) stats.record(frameTime, engine);
}

describe("PerformanceStats", () => {
  let now = 1_000;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function advanceClockForEveryRecord(): void {
    vi.spyOn(performance, "now").mockImplementation(() => {
      now += 251;
      return now;
    });
  }

  it("keeps FPS and frame time on the same smoothing window", () => {
    advanceClockForEveryRecord();
    const stats = new PerformanceStats();

    recordFrames(stats, [10, 10, 20, 20]);

    const snapshot = stats.getSnapshot();
    expect(snapshot.frameTimeMs).toBeCloseTo(15);
    expect(snapshot.fps).toBeCloseTo(1000 / snapshot.frameTimeMs);
  });

  it("reads the newest samples correctly after the ring buffer wraps", () => {
    advanceClockForEveryRecord();
    const stats = new PerformanceStats();

    recordFrames(stats, [
      ...new Array(PERFORMANCE_FRAME_BUFFER_SIZE).fill(10),
      ...new Array(30).fill(20),
    ]);

    const snapshot = stats.getSnapshot();
    const expectedAverageFrameTime = (482 * 10 + 30 * 20) / 512;
    expect(snapshot.frameTimeMs).toBeCloseTo(20);
    expect(snapshot.fps).toBeCloseTo(50);
    expect(snapshot.averageFrameTimeMs).toBeCloseTo(expectedAverageFrameTime);
    expect(snapshot.averageFps).toBeCloseTo(1000 / expectedAverageFrameTime);
    expect(snapshot.low1PercentFps).toBeCloseTo(50);
  });

  it("right-aligns short graph history and clears samples on reset", () => {
    advanceClockForEveryRecord();
    const stats = new PerformanceStats();

    recordFrames(stats, [10, 20, 30]);

    const graph = stats.getSnapshot().graph;
    expect(graph).toHaveLength(PERFORMANCE_GRAPH_BARS);
    expect(graph.slice(-3)).toEqual([10, 20, 30]);
    expect(graph.slice(0, -3).every((value) => value === 0)).toBe(true);

    stats.reset();
    expect(stats.getSnapshot().frameCount).toBe(0);
    expect(stats.getSnapshot().fps).toBe(0);

    recordFrames(stats, [25, 25]);
    expect(stats.getSnapshot().frameCount).toBe(2);
    expect(stats.getSnapshot().fps).toBeCloseTo(40);
  });
});
