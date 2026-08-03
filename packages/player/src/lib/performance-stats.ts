import type { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";

/** WebGL engine details; the WebGPU engine exposes these too at runtime. */
interface GlInfoProvider {
  getGlInfo(): PerformanceGpuInfo;
}

/** Number of frame times kept in the ring buffer (about 8.5s at 60 fps). */
export const PERFORMANCE_FRAME_BUFFER_SIZE = 512;
/** Frames used to smooth the instantaneous FPS reading. */
export const PERFORMANCE_FPS_SMOOTHING_FRAMES = 30;
/** Bars drawn in the frame time graph. */
export const PERFORMANCE_GRAPH_BARS = 96;
/** How often subscribers are notified, in ms. */
export const PERFORMANCE_NOTIFY_INTERVAL_MS = 250;

export interface PerformanceGpuInfo {
  vendor: string;
  renderer: string;
  version: string;
}

export interface PerformanceSnapshot {
  /** FPS smoothed over the most recent frames. */
  fps: number;
  /** Frame time over the same smoothing window as `fps`. */
  frameTimeMs: number;
  /** Average FPS over the whole ring buffer. */
  averageFps: number;
  /** Average frame time in milliseconds over the whole ring buffer. */
  averageFrameTimeMs: number;
  /** 1% low FPS: the FPS the slowest 1% of frames achieved. */
  low1PercentFps: number;
  /** 0.1% low FPS: the FPS the slowest 0.1% of frames achieved. */
  low0_1PercentFps: number;
  /** Slowest frame time in the buffer, in milliseconds. */
  maxFrameTimeMs: number;
  /** Draw calls issued in the latest rendered frame. */
  drawCalls: number;
  /** Meshes rendered in the latest frame. */
  activeMeshes: number;
  /** Frames recorded since the latest sampling reset. */
  frameCount: number;
  gpu: PerformanceGpuInfo | null;
  resolution: { width: number; height: number } | null;
  /** Oldest to newest frame times (ms), already bucketed for the graph. */
  graph: readonly number[];
  /** Upper bound of the graph scale in milliseconds. */
  graphMaxMs: number;
}

/**
 * Per-frame performance sampler for the render loop. The owning runtime calls
 * `record()` once per rendered frame; subscribers are notified on a fixed
 * interval so React never re-renders at frame rate.
 */
export class PerformanceStats {
  private readonly frameTimes = new Float32Array(
    PERFORMANCE_FRAME_BUFFER_SIZE,
  );
  private frameCount = 0;
  private drawCalls = 0;
  private activeMeshes = 0;
  private gpu: PerformanceGpuInfo | null = null;
  private resolution: { width: number; height: number } | null = null;
  private readonly listeners = new Set<() => void>();
  private lastNotifyAt = 0;
  private latestSnapshot: PerformanceSnapshot | null = null;
  private disposed = false;

  public record(frameTimeMs: number, engine: AbstractEngine): void {
    if (
      this.disposed ||
      !Number.isFinite(frameTimeMs) ||
      frameTimeMs <= 0
    ) {
      return;
    }

    this.frameTimes[this.frameCount % PERFORMANCE_FRAME_BUFFER_SIZE] =
      frameTimeMs;
    this.frameCount += 1;

    try {
      this.drawCalls = engine._drawCalls?.current ?? 0;
    } catch {
      this.drawCalls = 0;
    }
    try {
      const scene = engine.scenes[0];
      this.activeMeshes = scene?.getActiveMeshes().length ?? 0;
    } catch {
      this.activeMeshes = 0;
    }

    if (this.gpu === null) {
      try {
        this.gpu =
          (engine as unknown as GlInfoProvider).getGlInfo?.() ?? null;
      } catch {
        this.gpu = null;
      }
    }
    if (this.resolution === null) {
      try {
        this.resolution = {
          width: engine.getRenderWidth(true),
          height: engine.getRenderHeight(true),
        };
      } catch {
        this.resolution = null;
      }
    }

    const now = performance.now();
    if (now - this.lastNotifyAt >= PERFORMANCE_NOTIFY_INTERVAL_MS) {
      this.lastNotifyAt = now;
      this.latestSnapshot = this.computeSnapshot();
      for (const listener of this.listeners) listener();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Starts a fresh visible-session sample. This keeps time spent in a hidden
   * browser tab (and the first delayed frame after returning) out of the FPS
   * and low-percentile readings.
   */
  public reset(): void {
    if (this.disposed) return;
    this.frameTimes.fill(0);
    this.frameCount = 0;
    this.lastNotifyAt = performance.now();
    this.latestSnapshot = this.computeSnapshot();
    for (const listener of this.listeners) listener();
  }

  /**
   * Returns the latest cached snapshot. The snapshot object is reused until
   * the next notify tick, so it is safe to read from `useSyncExternalStore`.
   */
  public getSnapshot(): PerformanceSnapshot {
    if (this.latestSnapshot === null) {
      this.latestSnapshot = this.computeSnapshot();
    }
    return this.latestSnapshot;
  }

  private computeSnapshot(): PerformanceSnapshot {
    const count = Math.min(this.frameCount, PERFORMANCE_FRAME_BUFFER_SIZE);
    if (count === 0) {
      return {
        fps: 0,
        frameTimeMs: 0,
        averageFps: 0,
        averageFrameTimeMs: 0,
        low1PercentFps: 0,
        low0_1PercentFps: 0,
        maxFrameTimeMs: 0,
        drawCalls: this.drawCalls,
        activeMeshes: this.activeMeshes,
        frameCount: 0,
        gpu: this.gpu,
        resolution: this.resolution,
        graph: new Array(PERFORMANCE_GRAPH_BARS).fill(0),
        graphMaxMs: 16.67,
      };
    }

    // The write cursor wraps after 512 frames. Normalize the ring into
    // chronological order once so every metric reads the newest frames rather
    // than whichever values happen to sit at the end of the backing array.
    const orderedFrameTimes = new Float32Array(count);
    const oldestFrameIndex =
      this.frameCount >= PERFORMANCE_FRAME_BUFFER_SIZE
        ? this.frameCount % PERFORMANCE_FRAME_BUFFER_SIZE
        : 0;
    for (let i = 0; i < count; ++i) {
      orderedFrameTimes[i] =
        this.frameTimes[
          (oldestFrameIndex + i) % PERFORMANCE_FRAME_BUFFER_SIZE
        ];
    }

    const smoothingFrames = Math.min(
      count,
      PERFORMANCE_FPS_SMOOTHING_FRAMES,
    );
    let smoothingTotal = 0;
    for (let i = count - smoothingFrames; i < count; ++i) {
      smoothingTotal += orderedFrameTimes[i];
    }
    const smoothedFrameTimeMs = smoothingTotal / smoothingFrames;
    const fps = smoothedFrameTimeMs > 0 ? 1000 / smoothedFrameTimeMs : 0;

    let frameTimeTotal = 0;
    let maxFrameTimeMs = 0;
    for (let i = 0; i < count; ++i) {
      frameTimeTotal += orderedFrameTimes[i];
      if (maxFrameTimeMs < orderedFrameTimes[i]) {
        maxFrameTimeMs = orderedFrameTimes[i];
      }
    }
    const averageFrameTime = frameTimeTotal / count;
    const averageFps = averageFrameTime > 0 ? 1000 / averageFrameTime : 0;

    const sortedFrameTimes = orderedFrameTimes.slice().sort();
    const lowFps = (fraction: number): number => {
      const sampleCount = Math.max(1, Math.ceil(count * fraction));
      let total = 0;
      for (let i = count - sampleCount; i < count; ++i) {
        total += sortedFrameTimes[i];
      }
      const average = total / sampleCount;
      return average > 0 ? 1000 / average : 0;
    };
    const low1PercentFps = lowFps(0.01);
    const low0_1PercentFps = lowFps(0.001);

    // Keep the newest sample on the right. When there are more samples than
    // pixels, each bar represents the worst frame in an even time bucket.
    const graph = new Array<number>(PERFORMANCE_GRAPH_BARS).fill(0);
    const populatedBars = Math.min(count, PERFORMANCE_GRAPH_BARS);
    const graphOffset = PERFORMANCE_GRAPH_BARS - populatedBars;
    for (let bucket = 0; bucket < populatedBars; ++bucket) {
      let bucketMax = 0;
      const bucketStart = Math.floor((bucket * count) / populatedBars);
      const bucketEnd = Math.floor(((bucket + 1) * count) / populatedBars);
      for (let i = bucketStart; i < bucketEnd; ++i) {
        if (bucketMax < orderedFrameTimes[i]) {
          bucketMax = orderedFrameTimes[i];
        }
      }
      graph[graphOffset + bucket] = bucketMax;
    }

    let graphMaxRaw = 0;
    for (const value of graph) {
      if (graphMaxRaw < value) graphMaxRaw = value;
    }
    // Round the scale up to a multiple of a 60 Hz frame so it stays stable
    // while the graph animates, with a floor of one 60 Hz frame.
    const graphMaxMs = Math.max(16.67, Math.ceil(graphMaxRaw / 8.33) * 8.33);

    return {
      fps,
      frameTimeMs: smoothedFrameTimeMs,
      averageFps,
      averageFrameTimeMs: averageFrameTime,
      low1PercentFps,
      low0_1PercentFps,
      maxFrameTimeMs,
      drawCalls: this.drawCalls,
      activeMeshes: this.activeMeshes,
      frameCount: this.frameCount,
      gpu: this.gpu,
      resolution: this.resolution,
      graph,
      graphMaxMs,
    };
  }

  public dispose(): void {
    this.disposed = true;
    this.listeners.clear();
  }
}
