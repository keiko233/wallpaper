import { GripHorizontal } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useKey, useLocalStorage } from "react-use";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import {
  PERFORMANCE_GRAPH_BARS,
  type PerformanceSnapshot,
} from "../lib/performance-stats";
import { OVERLAY_POSITION_STORAGE_KEY } from "../lib/overlay-storage";
import {
  useLivePerformanceSnapshot,
  useMmdPerformance,
} from "../providers/mmd-context";

export interface PerformanceOverlayProps {
  /** Keyboard key that toggles the overlay. Defaults to Backquote (`). */
  toggleKey?: string;
}

const DEFAULT_POSITION = { x: 16, y: 16 };
const GRAPH_WIDTH = 224;
const GRAPH_HEIGHT = 40;
const TARGET_FRAME_MS = 1000 / 60;
const GRAPH_X_VALUES = Array.from(
  { length: PERFORMANCE_GRAPH_BARS },
  (_, index) => index,
);

function formatFps(value: number): string {
  return value >= 100 ? value.toFixed(0) : value.toFixed(1);
}

function frameTimeColor(frameTimeMs: number): string {
  if (frameTimeMs <= TARGET_FRAME_MS) return "#7CFC00";
  if (frameTimeMs <= TARGET_FRAME_MS * 2) return "#FFD700";
  if (frameTimeMs <= TARGET_FRAME_MS * 3) return "#FF8C00";
  return "#FF4D4D";
}

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.closest("input, textarea, select") !== null)
  );
}

/**
 * RTSS-style FPS and performance overlay. Draws live frame times, FPS
 * statistics (average, 1% / 0.1% lows), GPU and scene metrics, plus an
 * auto-scaling frame time bar graph. Visibility is controlled through the
 * player settings (and a hotkey); the position is draggable by its grip
 * handle and persists.
 */
export function PerformanceOverlay({
  toggleKey = "Backquote",
}: PerformanceOverlayProps) {
  const { overlayVisible, setOverlayVisible } = useMmdPerformance();
  const [positionStored, setPosition] = useLocalStorage(
    OVERLAY_POSITION_STORAGE_KEY,
    DEFAULT_POSITION,
  );
  const position = positionStored ?? DEFAULT_POSITION;
  const snapshot = useLivePerformanceSnapshot();
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  useKey(
    (event) =>
      event.key === toggleKey && !isEditableTarget(event.target),
    () => {
      setOverlayVisible(!overlayVisible);
    },
    { event: "keydown" },
    [toggleKey, overlayVisible, setOverlayVisible],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      const container = containerRef.current;
      if (container === null) return;
      const rect = container.getBoundingClientRect();
      dragRef.current = {
        pointerId: event.pointerId,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      event.preventDefault();
    },
    [],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (drag === null || event.pointerId !== drag.pointerId) return;
      const container = containerRef.current;
      if (container === null) return;
      const host = container.parentElement;
      const hostRect = host?.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const hostLeft = hostRect?.left ?? 0;
      const hostTop = hostRect?.top ?? 0;
      const hostWidth = hostRect?.width ?? 0;
      const hostHeight = hostRect?.height ?? 0;
      setPosition({
        x: Math.min(
          Math.max(0, event.clientX - hostLeft - drag.offsetX),
          Math.max(0, hostWidth - containerRect.width),
        ),
        y: Math.min(
          Math.max(0, event.clientY - hostTop - drag.offsetY),
          Math.max(0, hostHeight - containerRect.height),
        ),
      });
    },
    [setPosition],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (drag === null || event.pointerId !== drag.pointerId) return;
      dragRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    },
    [],
  );

  useEffect(() => {
    if (!overlayVisible) return;
    const container = containerRef.current;
    const host = container?.parentElement;
    if (container === null || host === null || host === undefined) return;

    const keepInsideHost = (): void => {
      const hostRect = host.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      if (hostRect.width === 0 || hostRect.height === 0) return;

      setPosition((storedPosition) => {
        const current = storedPosition ?? DEFAULT_POSITION;
        const next = {
          x: Math.min(
            Math.max(0, current.x),
            Math.max(0, hostRect.width - containerRect.width),
          ),
          y: Math.min(
            Math.max(0, current.y),
            Math.max(0, hostRect.height - containerRect.height),
          ),
        };
        return next.x === current.x && next.y === current.y
          ? storedPosition
          : next;
      });
    };

    keepInsideHost();
    const resizeObserver = new ResizeObserver(keepInsideHost);
    resizeObserver.observe(host);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [overlayVisible, setPosition]);

  if (!overlayVisible || snapshot === null || snapshot.frameCount === 0) {
    return null;
  }

  const gpuLabel =
    snapshot.gpu !== null && snapshot.gpu.renderer.length > 0
      ? snapshot.gpu.renderer
      : "Unknown GPU";
  const accentColor = frameTimeColor(snapshot.frameTimeMs);

  return (
    <div
      aria-label="Live rendering performance"
      ref={containerRef}
      className="group pointer-events-auto absolute z-30 w-60 select-none font-mono text-white [text-shadow:1px_1px_0_#000]"
      role="region"
      style={{ left: position.x, top: position.y }}
    >
      <div className="relative contain-paint rounded-lg border border-transparent bg-transparent transition-colors duration-150 group-hover:border-white/10 group-hover:bg-[#0b0d10]/90">
        <div
          aria-label="Drag performance overlay"
          className="pointer-events-none absolute -top-2 left-1/2 z-10 flex h-4 w-8 -translate-x-1/2 cursor-grab touch-none items-center justify-center rounded-full bg-[#0b0d10] opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 active:cursor-grabbing"
          onPointerCancel={handlePointerUp}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          title="Drag to reposition"
        >
          <GripHorizontal
            aria-hidden
            className="size-3 text-white/40"
          />
        </div>

        <div className="p-2">
          <div className="grid grid-cols-[1fr_auto] items-end gap-3">
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-[25px] font-bold leading-none tabular-nums tracking-[-0.05em]"
                style={{ color: accentColor }}
              >
                {formatFps(snapshot.fps)}
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-white/45">
                FPS
              </span>
            </div>
            <div className="pb-0.5 text-right text-[11px] font-semibold leading-none tabular-nums text-white/75">
              {snapshot.frameTimeMs.toFixed(1)}
              <span className="ml-1 text-[8px] font-normal uppercase text-white/35">
                ms
              </span>
            </div>
          </div>

          <div className="mt-1.5 flex items-center gap-3 text-[9px] leading-none tabular-nums text-white/55">
            <span>
              <span className="text-white/30">AVG</span>{" "}
              {formatFps(snapshot.averageFps)}
            </span>
            <span>
              <span className="text-white/30">1% LOW</span>{" "}
              {formatFps(snapshot.low1PercentFps)}
            </span>
            <span>
              <span className="text-white/30">0.1%</span>{" "}
              {formatFps(snapshot.low0_1PercentFps)}
            </span>
          </div>

          <FrameTimeGraph snapshot={snapshot} />

          <div className="mt-1.5 truncate text-[8px] leading-none text-white/40" title={gpuLabel}>
            {gpuLabel}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[8px] leading-none tabular-nums text-white/40">
            <span>
              {snapshot.resolution === null
                ? "Unknown"
                : `${snapshot.resolution.width}×${snapshot.resolution.height}`}
            </span>
            <span className="text-white/20">·</span>
            <span>{snapshot.drawCalls} draws</span>
            <span className="text-white/20">·</span>
            <span>{snapshot.activeMeshes} meshes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FrameTimeGraph({ snapshot }: { snapshot: PerformanceSnapshot }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<uPlot | null>(null);
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) return;

    const drawGuides = (plot: uPlot): void => {
      const { ctx, bbox } = plot;
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = uPlot.pxRatio;
      for (let row = 1; row < 3; ++row) {
        const y = bbox.top + (bbox.height * row) / 3;
        ctx.beginPath();
        ctx.moveTo(bbox.left, y);
        ctx.lineTo(bbox.left + bbox.width, y);
        ctx.stroke();
      }

      if (snapshotRef.current.graphMaxMs >= TARGET_FRAME_MS) {
        const targetY = plot.valToPos(TARGET_FRAME_MS, "y", true);
        ctx.setLineDash([3 * uPlot.pxRatio, 3 * uPlot.pxRatio]);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
        ctx.beginPath();
        ctx.moveTo(bbox.left, targetY);
        ctx.lineTo(bbox.left + bbox.width, targetY);
        ctx.stroke();
      }
      ctx.restore();
    };

    const plot = new uPlot(
      {
        width: GRAPH_WIDTH,
        height: GRAPH_HEIGHT,
        padding: [0, 0, 0, 0],
        legend: { show: false },
        cursor: { show: false },
        scales: {
          x: { time: false, range: [0, PERFORMANCE_GRAPH_BARS - 1] },
          y: { range: () => [0, snapshotRef.current.graphMaxMs] },
        },
        axes: [{ show: false }, { show: false }],
        series: [
          {},
          {
            width: 1.5,
            stroke: () => frameTimeColor(snapshotRef.current.frameTimeMs),
            fill: (self) => {
              const accent = frameTimeColor(snapshotRef.current.frameTimeMs);
              const gradient = self.ctx.createLinearGradient(
                0,
                self.bbox.top,
                0,
                self.bbox.top + self.bbox.height,
              );
              gradient.addColorStop(0, `${accent}55`);
              gradient.addColorStop(1, `${accent}05`);
              return gradient;
            },
            points: { show: false },
            spanGaps: true,
          },
        ],
        hooks: { drawClear: [drawGuides] },
      },
      [GRAPH_X_VALUES, graphValues(snapshotRef.current.graph)],
      host,
    );
    plotRef.current = plot;

    return () => {
      plotRef.current = null;
      plot.destroy();
    };
  }, []);

  useEffect(() => {
    plotRef.current?.setData([
      GRAPH_X_VALUES,
      graphValues(snapshot.graph),
    ]);
  }, [snapshot.graph]);

  return (
    <div className="mt-1.5">
      <div className="mb-1 flex items-center justify-between text-[7px] uppercase tracking-[0.1em] text-white/25">
        <span>Frame history</span>
        <span className="tabular-nums">0–{snapshot.graphMaxMs.toFixed(1)} ms</span>
      </div>
      <div
        className="h-10 w-56 overflow-hidden [&_.u-over]:hidden"
        ref={hostRef}
      />
    </div>
  );
}

function graphValues(
  graph: readonly number[],
): (number | null)[] {
  return graph.map((value) => (value > 0 ? value : null));
}
