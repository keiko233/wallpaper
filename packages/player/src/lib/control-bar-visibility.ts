export type ControlBarState = "hidden" | "pill" | "expanded";

let state: ControlBarState = "pill";
const listeners = new Set<() => void>();

/**
 * Broadcasts the playback control bar's state so overlays (e.g. lyrics) can
 * reposition themselves YouTube-style: sit low while the bar is hidden,
 * clear the collapsed "pill" while it is shown, and lift above the full bar
 * while it is expanded.
 */
export function setControlBarState(next: ControlBarState): void {
  if (state === next) return;
  state = next;
  for (const listener of listeners) listener();
}

export function getControlBarState(): ControlBarState {
  return state;
}

export function subscribeControlBarState(
  listener: () => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
