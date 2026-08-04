import { Settings2 } from "lucide-react";
import { m } from "@wallpaper/i18n";
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
  DEFAULT_SKYBOXES,
  DEFAULT_STAGES,
} from "./defaults";
import type {
  ModelList,
  MotionList,
  PlayerPersistence,
  SkyboxList,
  StageList,
} from "./types";
import type { ReactNode } from "react";

export interface PlayerAppProps {
  emptyState?: ReactNode;
  initialPlayDelayMs?: number;
  models?: readonly ModelList[];
  motions?: readonly MotionList[];
  persistence?: PlayerPersistence;
  settingsContent?: ReactNode;
  skyboxes?: readonly SkyboxList[];
  stages?: readonly StageList[];
}

export default function App({
  emptyState,
  initialPlayDelayMs,
  models = DEFAULT_MODELS,
  motions = DEFAULT_MOTIONS,
  persistence,
  settingsContent,
  skyboxes = DEFAULT_SKYBOXES,
  stages = DEFAULT_STAGES,
}: PlayerAppProps) {
  if (
    models.length === 0 ||
    motions.length === 0 ||
    stages.length === 0 ||
    skyboxes.length === 0
  ) {
    return (
      <Sheet>
        {emptyState ?? (
          <section className="grid h-dvh w-full place-items-center bg-transparent p-6 text-center text-muted-foreground">
            {m.player_add_resources_prompt()}
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
            {m.player_setup()}
          </SheetTrigger>
        </div>
        <SheetPopup className="bg-popover/82 backdrop-blur-2xl">
          <SheetHeader>
            <SheetTitle>{m.player_setup()}</SheetTitle>
            <SheetDescription>
              {m.player_setup_description()}
            </SheetDescription>
          </SheetHeader>
          <SheetPanel>
            {settingsContent ?? (
              <p className="text-sm text-muted-foreground">
                {m.player_no_resource_manager()}
              </p>
            )}
          </SheetPanel>
        </SheetPopup>
      </Sheet>
    );
  }

  return (
    <MmdProvider
      initialPlayDelayMs={initialPlayDelayMs}
      models={models}
      motions={motions}
      persistence={persistence}
      skyboxes={skyboxes}
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
