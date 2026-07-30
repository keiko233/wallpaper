import { Settings2 } from "lucide-react";
import { Button } from "@wallpaper/ui/button";
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
  SheetTrigger,
} from "@wallpaper/ui/sheet";
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
  settingsContent?: ReactNode;
  stages?: readonly StageList[];
}

export default function App({
  emptyState,
  models = DEFAULT_MODELS,
  motions = DEFAULT_MOTIONS,
  persistence,
  settingsContent,
  stages = DEFAULT_STAGES,
}: PlayerAppProps) {
  if (
    models.length === 0 ||
    motions.length === 0 ||
    stages.length === 0
  ) {
    return (
      <Sheet>
        {emptyState ?? (
          <section className="grid h-dvh w-full place-items-center bg-transparent p-6 text-center text-muted-foreground">
            Add a model, motion, and stage to begin.
          </section>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-[calc(var(--desktop-safe-area-bottom,0px)+0.75rem)] z-20 flex justify-center px-3">
          <SheetTrigger
            className="pointer-events-auto"
            render={
              <Button
                className="rounded-2xl bg-popover/70 shadow-2xl shadow-overlay backdrop-blur-2xl"
                variant="outline"
              />
            }
          >
            <Settings2 />
            Player setup
          </SheetTrigger>
        </div>
        <SheetPopup className="bg-popover/82 backdrop-blur-2xl">
          <SheetHeader>
            <SheetTitle>Player setup</SheetTitle>
            <SheetDescription>
              Add resources before configuring playback and visuals.
            </SheetDescription>
          </SheetHeader>
          <SheetPanel>
            {settingsContent ?? (
              <p className="text-sm text-muted-foreground">
                No resource manager is available.
              </p>
            )}
          </SheetPanel>
        </SheetPopup>
      </Sheet>
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
          <MmdSettings settingsContent={settingsContent} />
        </Sheet>
      </section>
    </MmdProvider>
  );
}
