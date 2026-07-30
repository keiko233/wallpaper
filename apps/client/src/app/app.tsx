import {
  WallpaperCacheDatabase,
  WallpaperClientDatabase,
} from "../db";
import { createPlayerPersistence } from "../db/player-persistence";
import Player from "@wallpaper/player";
import { AlertCircle, Library } from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
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

const EMPTY_BUNDLED_RESOURCES: BundledPlayerResources = {
  models: [],
  motions: [],
  stages: [],
};

export default function WallpaperClientApp({
  bundledResources = EMPTY_BUNDLED_RESOURCES,
  defaultSourceUrl,
}: WallpaperClientAppProps) {
  const [database] = useState(() => new WallpaperClientDatabase());
  const [cache] = useState(() => new WallpaperCacheDatabase());
  const [libraryRevision, setLibraryRevision] = useState(0);
  const [materialized, setMaterialized] =
    useState<MaterializedPlayerResources>({
      ...bundledResources,
      models: [...bundledResources.models],
      motions: [...bundledResources.motions],
      stages: [...bundledResources.stages],
      dispose: () => undefined,
    });
  const [materializeError, setMaterializeError] = useState<
    string | null
  >(null);

  const sourceService = useMemo(
    () =>
      new ResourceSourceService(database, {
        defaultSourceUrl,
      }),
    [database, defaultSourceUrl],
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
          stages: materialized.stages.map((item) => item.id),
        },
      }),
    [database, materialized],
  );

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">
      <Player
        emptyState={<EmptyLibrary />}
        models={materialized.models}
        motions={materialized.motions}
        persistence={persistence}
        stages={materialized.stages}
      />

      <ResourceLibrary
        client={client}
        onLibraryChanged={() =>
          setLibraryRevision((revision) => revision + 1)
        }
      />

      {materializeError === null ? null : (
        <Alert
          className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-xl bg-background/90 backdrop-blur"
          variant="error"
        >
          <AlertCircle />
          <AlertTitle>Local library could not be loaded</AlertTitle>
          <AlertDescription>{materializeError}</AlertDescription>
        </Alert>
      )}
    </main>
  );
}

function EmptyLibrary() {
  return (
    <section className="grid min-h-dvh place-items-center bg-muted/30 p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Library className="mx-auto mb-2 size-8 text-muted-foreground" />
          <CardTitle>Your playlist is empty</CardTitle>
          <CardDescription>
            Open Resources, then add at least one model, motion, and
            stage. Audio and camera follow the selected motion. Everything
            you add is cached only on this device.
          </CardDescription>
        </CardHeader>
      </Card>
    </section>
  );
}
