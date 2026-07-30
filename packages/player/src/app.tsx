import { Sheet } from "@wallpaper/ui/sheet";
import { MmdSettings } from "./components/mmd-settings";
import { PlaybackControls } from "./components/playback-controls";
import { MmdCanvas, MmdProvider } from "./providers/mmd-provider";
import {
  DEFAULT_MODELS,
  DEFAULT_MOTIONS,
  DEFAULT_STAGES,
} from "./defaults";
import type {
  ModelList,
  MotionList,
  PlayerPersistence,
  StageList,
} from "./types";
import type { ReactNode } from "react";

export interface PlayerAppProps {
  emptyState?: ReactNode;
  models?: readonly ModelList[];
  motions?: readonly MotionList[];
  persistence?: PlayerPersistence;
  stages?: readonly StageList[];
}

export default function App({
  emptyState,
  models = DEFAULT_MODELS,
  motions = DEFAULT_MOTIONS,
  persistence,
  stages = DEFAULT_STAGES,
}: PlayerAppProps) {
  if (
    models.length === 0 ||
    motions.length === 0 ||
    stages.length === 0
  ) {
    return (
      emptyState ?? (
        <section className="grid h-dvh w-full place-items-center bg-background p-6 text-center text-muted-foreground">
          Add a model, motion, and stage to begin.
        </section>
      )
    );
  }

  return (
    <MmdProvider
      models={models}
      motions={motions}
      persistence={persistence}
      stages={stages}
    >
      <section className="w-full h-dvh relative">
        <MmdCanvas className="size-full" />

        <Sheet>
          <PlaybackControls />
          <MmdSettings />
        </Sheet>
      </section>
    </MmdProvider>
  );
}
