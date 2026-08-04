import {
  WallpaperCacheDatabase,
  WallpaperClientDatabase,
} from "../db";
import { createPlayerPersistence } from "../db/player-persistence";
import Player from "@wallpaper/player";
import { LoadingScreen } from "@wallpaper/player/loading-screen";
import { m, useLocale } from "@wallpaper/i18n";
import {
  AlertCircle,
  Library,
} from "lucide-react";
import { AnimatePresence, motion as Motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocalStorage } from "react-use";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@wallpaper/ui/alert";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@wallpaper/ui/card";
import {
  materializeLibrary,
  type MaterializedPlayerResources,
} from "../resources/materialize-library";
import { ResourceClient } from "../resources/resource-client";
import { ResourceLibrary } from "../resources/resource-library";
import { ResourceSourceService } from "../resources/resource-sources";
import type {
  BundledPlayerResources,
  WallpaperClientAppProps,
} from "./types";
import {
  EULA_STORAGE_KEY,
  EulaDialog,
  type EulaDecision,
} from "./eula-dialog";

const EMPTY_BUNDLED_RESOURCES: BundledPlayerResources = {
  models: [],
  motions: [],
  skyboxes: [],
  stages: [],
};

// The reveal transition takes APP_REVEAL_DURATION_MS to complete; the initial
// MMD playback waits a little longer so the render loop never starts while the
// transition is still animating.
const APP_REVEAL_DURATION_MS = 600;
const APP_REVEAL_PLAY_BUFFER_MS = 400;
const INITIAL_PLAY_DELAY_MS =
  APP_REVEAL_DURATION_MS + APP_REVEAL_PLAY_BUFFER_MS;

export default function WallpaperClientApp({
  bundledResources = EMPTY_BUNDLED_RESOURCES,
  defaultSourceUrl,
}: WallpaperClientAppProps) {
  useLocale();
  const [database] = useState(() => new WallpaperClientDatabase());
  const [cache] = useState(() => new WallpaperCacheDatabase());
  const [libraryRevision, setLibraryRevision] = useState(0);
  const [materialized, setMaterialized] =
    useState<MaterializedPlayerResources>({
      ...bundledResources,
      models: [...bundledResources.models],
      motions: [...bundledResources.motions],
      skyboxes: [...bundledResources.skyboxes],
      stages: [...bundledResources.stages],
      dispose: () => undefined,
    });
  const [materializeError, setMaterializeError] = useState<
    string | null
  >(null);
  const [isLibraryReady, setIsLibraryReady] = useState(false);
  const [eulaDecision, setEulaDecision] = useLocalStorage<EulaDecision>(
    EULA_STORAGE_KEY,
    "pending",
    { raw: true },
  );

  const defaultSourceEnabled =
    defaultSourceUrl !== null && eulaDecision === "accepted";
  const sourceService = useMemo(
    () =>
      new ResourceSourceService(database, {
        defaultSourceUrl: defaultSourceEnabled
          ? defaultSourceUrl
          : null,
      }),
    [database, defaultSourceEnabled, defaultSourceUrl],
  );
  const client = useMemo(
    () => new ResourceClient(database, cache, sourceService),
    [cache, database, sourceService],
  );

  useEffect(() => {
    void navigator.storage?.persist?.().catch(() => false);
  }, []);

  useEffect(() => {
    let active = true;
    let current: MaterializedPlayerResources | undefined;
    void materializeLibrary(database, cache, bundledResources)
      .then((next) => {
        if (!active) {
          next.dispose();
          return;
        }
        current = next;
        setMaterialized(next);
        setMaterializeError(null);
        setIsLibraryReady(true);
      })
      .catch((error: unknown) => {
        if (active) {
          setMaterializeError(
            error instanceof Error ? error.message : String(error),
          );
        }
      });
    return () => {
      active = false;
      current?.dispose();
    };
  }, [bundledResources, cache, database, libraryRevision]);

  const persistence = useMemo(
    () =>
      createPlayerPersistence({
        database,
        resources: {
          models: materialized.models.map((item) => item.id),
          motions: materialized.motions.map((item) => item.id),
          skyboxes: materialized.skyboxes.map((item) => item.id),
          stages: materialized.stages.map((item) => item.id),
        },
      }),
    [database, materialized],
  );

  const acceptEula = useCallback(() => {
    setEulaDecision("accepted");
  }, [setEulaDecision]);

  const declineEula = useCallback(() => {
    setEulaDecision("declined");
  }, [setEulaDecision]);

  // Keep the main application (and its WebGL scene) unloaded until the EULA is
  // accepted and the local library has finished materializing. The loading
  // screen covers the async IndexedDB gap in the meantime.
  const eulaSatisfied =
    defaultSourceUrl === null || eulaDecision !== "pending";
  const ready =
    (isLibraryReady || materializeError !== null) && eulaSatisfied;

  return (
    <main className="relative min-h-dvh overflow-hidden bg-transparent">
      <AnimatePresence>
        {ready ? null : <LoadingScreen key="loading-screen" />}
      </AnimatePresence>

      {ready ? (
        <Motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="min-h-dvh"
          initial={{ opacity: 0, scale: 0.985 }}
          transition={{
            duration: APP_REVEAL_DURATION_MS / 1_000,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <Player
            emptyState={<EmptyLibrary />}
            initialPlayDelayMs={INITIAL_PLAY_DELAY_MS}
            models={materialized.models}
            motions={materialized.motions}
            persistence={persistence}
            settingsContent={
              <ResourceLibrary
                client={client}
                onLibraryChanged={() =>
                  setLibraryRevision((revision) => revision + 1)
                }
              />
            }
            skyboxes={materialized.skyboxes}
            stages={materialized.stages}
          />
        </Motion.div>
      ) : null}

      {defaultSourceUrl !== null &&
      eulaDecision === "pending" ? (
        <EulaDialog onAccept={acceptEula} onDecline={declineEula} />
      ) : null}

      {materializeError === null ? null : (
        <Alert
          className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-xl bg-popover/90 shadow-xl backdrop-blur-2xl"
          variant="error"
        >
          <AlertCircle />
          <AlertTitle>{m.web_local_library_load_failed()}</AlertTitle>
          <AlertDescription>{materializeError}</AlertDescription>
        </Alert>
      )}
    </main>
  );
}

function EmptyLibrary() {
  return (
    <section className="grid min-h-dvh place-items-center bg-transparent p-6">
      <Card className="w-full max-w-lg shadow-2xl shadow-overlay">
        <CardHeader className="text-center">
          <Library className="mx-auto mb-2 size-8 text-muted-foreground" />
          <CardTitle>{m.web_empty_playlist_title()}</CardTitle>
          <CardDescription>
            {m.web_empty_playlist_description()}
          </CardDescription>
        </CardHeader>
      </Card>
    </section>
  );
}
