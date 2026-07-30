import type { ResourceKind } from "@wallpaper/resource-schema";
import type { ResourceSourceRecord } from "../db";
import {
  AlertCircle,
  AudioLines,
  Box,
  Camera,
  Check,
  Clapperboard,
  Download,
  ExternalLink,
  Image,
  Library,
  Plus,
  RefreshCw,
  Search,
  Server,
  Trash2,
  PersonStanding,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@wallpaper/ui/alert";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@wallpaper/ui/alert-dialog";
import { Badge } from "@wallpaper/ui/badge";
import { Button } from "@wallpaper/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@wallpaper/ui/dialog";
import { Input } from "@wallpaper/ui/input";
import { Label } from "@wallpaper/ui/label";
import { Progress } from "@wallpaper/ui/progress";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@wallpaper/ui/select";
import { Switch } from "@wallpaper/ui/switch";
import {
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@wallpaper/ui/tabs";
import type {
  CatalogSearchOutput,
  InstallProgress,
  ResourceClient,
  ResourceSummary,
} from "./resource-client";

const kinds: { label: string; value: ResourceKind | "all" }[] = [
  { label: "All kinds", value: "all" },
  { label: "Models", value: "model" },
  { label: "Motions", value: "motion" },
  { label: "Audio", value: "audio" },
  { label: "Stages", value: "stage" },
  { label: "Videos", value: "video" },
];

const kindIcons = {
  audio: AudioLines,
  camera: Camera,
  model: PersonStanding,
  motion: Clapperboard,
  stage: Image,
  video: Box,
} as const;

const statusVariants = {
  error: "error",
  idle: "secondary",
  ok: "success",
  stale: "warning",
} as const;

function getProgressLabel(progress: InstallProgress): string {
  switch (progress.phase) {
    case "catalog":
      return "Preparing catalog resource";
    case "downloading":
      return "Downloading artifact";
    case "verifying":
      return "Verifying SHA-256";
    case "extracting":
      return "Preparing local files";
  }
}

function formatTimestamp(value: string | null): string {
  if (value === null) return "Never";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ResourceCover({ resource }: { resource: ResourceSummary }) {
  if (resource.coverUrl !== null) {
    return (
      <img
        alt=""
        className="aspect-video w-full rounded-lg border bg-muted object-cover sm:w-36"
        loading="lazy"
        src={resource.coverUrl}
      />
    );
  }
  const Icon = kindIcons[resource.kind];
  return (
    <div
      aria-label={`${resource.kind} placeholder cover`}
      className="grid aspect-video w-full place-items-center rounded-lg border bg-gradient-to-br from-muted via-muted/70 to-primary/15 text-muted-foreground sm:w-36"
      role="img"
    >
      <Icon className="size-8" />
    </div>
  );
}

export function ResourceLibrary({
  client,
  onLibraryChanged,
}: {
  client: ResourceClient;
  onLibraryChanged: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"browse" | "sources">(
    "browse",
  );
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<ResourceKind | "all">("all");
  const [result, setResult] = useState<CatalogSearchOutput | null>(
    null,
  );
  const [installedIds, setInstalledIds] = useState<Set<string>>(
    new Set(),
  );
  const [installing, setInstalling] = useState<{
    id: string;
    progress: InstallProgress;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [browseError, setBrowseError] = useState<string | null>(null);
  const [sources, setSources] = useState<ResourceSourceRecord[]>([]);
  const [sourceInput, setSourceInput] = useState("");
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [sourceBusy, setSourceBusy] = useState<string | null>(null);
  const [removeSourceId, setRemoveSourceId] = useState<string | null>(
    null,
  );

  const sourceById = useMemo(
    () => new Map(sources.map((source) => [source.id, source])),
    [sources],
  );
  const sourceToRemove =
    removeSourceId === null
      ? null
      : (sourceById.get(removeSourceId) ?? null);

  const refreshSources = useCallback(async () => {
    await client.sourceService.seedDefault();
    setSources(await client.sourceService.list());
  }, [client]);

  const refreshInstalled = useCallback(
    async (items: ResourceSummary[]) => {
      const installed = await Promise.all(
        items.map(async (item) => ({
          id: item.localResourceId,
          installed: await client.isInstalled(item),
        })),
      );
      setInstalledIds(
        new Set(
          installed
            .filter((item) => item.installed)
            .map((item) => item.id),
        ),
      );
    },
    [client],
  );

  const search = useCallback(
    async (cursor?: string) => {
      setIsSearching(true);
      setBrowseError(null);
      try {
        const next = await client.search({
          query: query.trim() || undefined,
          kind: kind === "all" ? undefined : kind,
          cursor,
          limit: 24,
        });
        const combined =
          cursor === undefined || result === null
            ? next
            : {
                ...next,
                items: [...result.items, ...next.items],
              };
        setResult(combined);
        await Promise.all([
          refreshInstalled(combined.items),
          refreshSources(),
        ]);
      } catch (cause) {
        setBrowseError(
          cause instanceof Error ? cause.message : String(cause),
        );
        await refreshSources();
      } finally {
        setIsSearching(false);
      }
    },
    [
      client,
      kind,
      query,
      refreshInstalled,
      refreshSources,
      result,
    ],
  );

  useEffect(() => {
    void search();
    // Initial search seeds the configured default. Later searches are explicit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await search();
  }

  async function install(item: ResourceSummary) {
    setBrowseError(null);
    try {
      await client.install(item, (progress) =>
        setInstalling({ id: item.localResourceId, progress }),
      );
      setInstalledIds((current) =>
        new Set(current).add(item.localResourceId),
      );
      onLibraryChanged();
    } catch (cause) {
      setBrowseError(
        cause instanceof Error ? cause.message : String(cause),
      );
    } finally {
      setInstalling(null);
    }
  }

  async function addSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = sourceInput.trim();
    if (value.length === 0) return;
    setSourceBusy("add");
    setSourceError(null);
    try {
      const { source } = await client.sourceService.add(value);
      setSourceInput("");
      await client.sourceService.refresh(source.id);
      await refreshSources();
      await search();
    } catch (cause) {
      setSourceError(
        cause instanceof Error ? cause.message : String(cause),
      );
      await refreshSources();
    } finally {
      setSourceBusy(null);
    }
  }

  async function setSourceEnabled(
    source: ResourceSourceRecord,
    enabled: boolean,
  ) {
    setSourceBusy(source.id);
    setSourceError(null);
    try {
      if (enabled) {
        await client.sourceService.enable(source.id);
      } else {
        await client.sourceService.disable(source.id);
      }
      await refreshSources();
      await search();
    } catch (cause) {
      setSourceError(
        cause instanceof Error ? cause.message : String(cause),
      );
      await refreshSources();
    } finally {
      setSourceBusy(null);
    }
  }

  async function refreshSource(source: ResourceSourceRecord) {
    setSourceBusy(source.id);
    setSourceError(null);
    try {
      await client.sourceService.refresh(source.id);
      await refreshSources();
      if (source.enabled) await search();
    } catch (cause) {
      setSourceError(
        cause instanceof Error ? cause.message : String(cause),
      );
      await refreshSources();
    } finally {
      setSourceBusy(null);
    }
  }

  async function removeSource(
    mode: "keep-installed" | "delete-installed",
  ) {
    if (sourceToRemove === null) return;
    setSourceBusy(sourceToRemove.id);
    setSourceError(null);
    try {
      await client.removeSource(sourceToRemove.id, mode);
      setRemoveSourceId(null);
      await refreshSources();
      await search();
      if (mode === "delete-installed") onLibraryChanged();
    } catch (cause) {
      setSourceError(
        cause instanceof Error ? cause.message : String(cause),
      );
    } finally {
      setSourceBusy(null);
    }
  }

  return (
    <>
      <Dialog>
        <DialogTrigger
          render={
            <Button
              className="fixed right-[calc(var(--desktop-safe-area-right,0px)+1rem)] top-[calc(var(--desktop-safe-area-top,0px)+1rem)] z-40 shadow-lg"
              variant="secondary"
            />
          }
        >
          <Library />
          Resources
        </DialogTrigger>
        <DialogPopup className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Resource library</DialogTitle>
            <DialogDescription>
              Browse independent resource sources and cache installed
              artifacts on this device.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <Tabs
              onValueChange={(value) =>
                setActiveTab(value as "browse" | "sources")
              }
              value={activeTab}
            >
              <TabsList>
                <TabsTab value="browse">
                  <Search />
                  Browse
                </TabsTab>
                <TabsTab value="sources">
                  <Server />
                  Sources
                  <Badge size="sm" variant="secondary">
                    {sources.length}
                  </Badge>
                </TabsTab>
              </TabsList>

              <TabsPanel className="space-y-4 pt-2" value="browse">
                <form
                  className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto]"
                  onSubmit={(event) => void submit(event)}
                >
                  <Input
                    aria-label="Search resources"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search models, motions, music…"
                    type="search"
                    value={query}
                  />
                  <Select
                    onValueChange={(value) => {
                      if (value !== null) setKind(value);
                    }}
                    value={kind}
                  >
                    <SelectTrigger aria-label="Resource kind">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopup>
                      {kinds.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                  <Button loading={isSearching} type="submit">
                    <Search />
                    Search
                  </Button>
                </form>

                {browseError === null ? null : (
                  <Alert variant="error">
                    <AlertCircle />
                    <AlertTitle>Resource request failed</AlertTitle>
                    <AlertDescription>{browseError}</AlertDescription>
                  </Alert>
                )}

                {result?.sources
                  .filter((source) => source.error !== null)
                  .map((source) => (
                    <Alert
                      key={source.sourceId}
                      variant={
                        source.status === "error" ? "error" : "warning"
                      }
                    >
                      <AlertCircle />
                      <AlertTitle>
                        {source.sourceName} is {source.status}
                      </AlertTitle>
                      <AlertDescription>{source.error}</AlertDescription>
                    </Alert>
                  ))}

                {sources.length === 0 && !isSearching ? (
                  <div className="grid min-h-56 place-items-center rounded-xl border border-dashed bg-muted/20 p-8 text-center">
                    <div className="max-w-md space-y-3">
                      <Server className="mx-auto size-8 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">
                          Add a resource source to get started
                        </h3>
                        <p className="mt-1 text-muted-foreground text-sm">
                          A source can be an R2 public domain, an nginx
                          directory, or any HTTPS URL containing
                          catalog.json.
                        </p>
                      </div>
                      <Button
                        onClick={() => setActiveTab("sources")}
                        variant="outline"
                      >
                        <Plus />
                        Add source
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="max-h-[55dvh] space-y-2 overflow-y-auto pe-1">
                    {result?.items.length === 0 ? (
                      <p className="py-10 text-center text-muted-foreground text-sm">
                        No resources from enabled sources match this search.
                      </p>
                    ) : null}
                    {result?.items.map((item) => {
                      const progress =
                        installing?.id === item.localResourceId
                          ? installing.progress
                          : null;
                      const installed = installedIds.has(
                        item.localResourceId,
                      );
                      const source = sourceById.get(item.sourceId);
                      return (
                        <div
                          className="rounded-xl border bg-background p-4"
                          key={item.localResourceId}
                        >
                          <div className="grid gap-4 sm:grid-cols-[9rem_minmax(0,1fr)]">
                            <ResourceCover resource={item} />
                            <div className="flex min-w-0 items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="truncate font-medium">
                                    {item.name}
                                  </h3>
                                  <Badge variant="outline">
                                    {item.kind}
                                  </Badge>
                                  <Badge variant="info">
                                    <Server />
                                    {item.sourceName}
                                  </Badge>
                                  {source?.isDefault ? (
                                    <Badge variant="secondary">
                                      Default
                                    </Badge>
                                  ) : null}
                                </div>
                                {item.description === null ? null : (
                                  <p className="mt-1 line-clamp-2 text-muted-foreground text-sm">
                                    {item.description}
                                  </p>
                                )}
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {item.categories.map((category) => (
                                    <Badge
                                      key={`category:${category}`}
                                      size="sm"
                                      variant="outline"
                                    >
                                      {category}
                                    </Badge>
                                  ))}
                                  {item.tags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      size="sm"
                                      variant="secondary"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <Button
                                disabled={installed || installing !== null}
                                loading={progress !== null}
                                onClick={() => void install(item)}
                                size="sm"
                                variant={
                                  installed ? "outline" : "default"
                                }
                              >
                                {installed ? <Check /> : <Download />}
                                {installed ? "Installed" : "Add"}
                              </Button>
                            </div>
                          </div>
                          {progress === null ? null : (
                            <div className="mt-3 space-y-1.5">
                              <Progress
                                value={
                                  progress.loaded !== undefined &&
                                  progress.total !== undefined &&
                                  progress.total > 0
                                    ? (progress.loaded / progress.total) *
                                      100
                                    : null
                                }
                              />
                              <p className="text-muted-foreground text-xs">
                                {getProgressLabel(progress)}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {result?.nextCursor === null ||
                result?.nextCursor === undefined ? null : (
                  <Button
                    className="w-full"
                    loading={isSearching}
                    onClick={() => void search(result.nextCursor!)}
                    variant="outline"
                  >
                    Load more
                  </Button>
                )}
              </TabsPanel>

              <TabsPanel className="space-y-4 pt-2" value="sources">
                <form
                  className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
                  onSubmit={(event) => void addSource(event)}
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="resource-source-url">
                      Resource source URL
                    </Label>
                    <Input
                      id="resource-source-url"
                      onChange={(event) =>
                        setSourceInput(event.target.value)
                      }
                      placeholder="https://resource.example.com/wallpaper/"
                      type="url"
                      value={sourceInput}
                    />
                    <p className="text-muted-foreground text-xs">
                      Root URLs, subpaths, and direct catalog.json URLs
                      are supported. The host must allow browser CORS.
                    </p>
                  </div>
                  <Button
                    className="self-end"
                    loading={sourceBusy === "add"}
                    type="submit"
                  >
                    <Plus />
                    Add source
                  </Button>
                </form>

                {sourceError === null ? null : (
                  <Alert variant="error">
                    <AlertCircle />
                    <AlertTitle>Source operation failed</AlertTitle>
                    <AlertDescription>{sourceError}</AlertDescription>
                  </Alert>
                )}

                <div className="max-h-[50dvh] space-y-2 overflow-y-auto pe-1">
                  {sources.length === 0 ? (
                    <p className="rounded-xl border border-dashed py-10 text-center text-muted-foreground text-sm">
                      No resource sources configured.
                    </p>
                  ) : null}
                  {sources.map((source) => (
                    <div
                      className="space-y-3 rounded-xl border bg-background p-4"
                      key={source.id}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate font-medium">
                              {source.name}
                            </h3>
                            <Badge variant={statusVariants[source.status]}>
                              {source.status}
                            </Badge>
                            {source.isDefault ? (
                              <Badge variant="secondary">Default</Badge>
                            ) : null}
                          </div>
                          <a
                            className="mt-1 inline-flex max-w-full items-center gap-1 text-muted-foreground text-xs hover:text-foreground"
                            href={source.baseUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            <span className="truncate">
                              {source.baseUrl}
                            </span>
                            <ExternalLink className="size-3 shrink-0" />
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label
                            className="text-muted-foreground"
                            htmlFor={`source-enabled-${source.id}`}
                          >
                            Enabled
                          </Label>
                          <Switch
                            checked={source.enabled}
                            disabled={sourceBusy !== null}
                            id={`source-enabled-${source.id}`}
                            onCheckedChange={(checked) =>
                              void setSourceEnabled(source, checked)
                            }
                          />
                        </div>
                      </div>

                      {source.description === null ? null : (
                        <p className="text-muted-foreground text-sm">
                          {source.description}
                        </p>
                      )}
                      {source.lastError === null ? null : (
                        <Alert
                          variant={
                            source.status === "error"
                              ? "error"
                              : "warning"
                          }
                        >
                          <AlertTitle>Last refresh failed</AlertTitle>
                          <AlertDescription>
                            {source.lastError}
                          </AlertDescription>
                        </Alert>
                      )}

                      <dl className="grid gap-2 text-xs sm:grid-cols-2">
                        <div>
                          <dt className="text-muted-foreground">
                            Revision
                          </dt>
                          <dd className="truncate font-mono">
                            {source.revision ?? "Not fetched"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">
                            Last successful refresh
                          </dt>
                          <dd>
                            {formatTimestamp(source.lastSuccessfulAt)}
                          </dd>
                        </div>
                      </dl>

                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          loading={sourceBusy === source.id}
                          onClick={() => void refreshSource(source)}
                          size="sm"
                          variant="outline"
                        >
                          <RefreshCw />
                          Refresh
                        </Button>
                        <Button
                          disabled={sourceBusy !== null}
                          onClick={() => setRemoveSourceId(source.id)}
                          size="sm"
                          variant="destructive-outline"
                        >
                          <Trash2 />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsPanel>
            </Tabs>
          </DialogPanel>
        </DialogPopup>
      </Dialog>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open && sourceBusy === null) setRemoveSourceId(null);
        }}
        open={sourceToRemove !== null}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {sourceToRemove?.name ?? "resource source"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Choose whether resources already installed from this source
              should remain available on this device. Both options remove
              the source and its cached catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-wrap">
            <AlertDialogClose
              render={<Button disabled={sourceBusy !== null} variant="ghost" />}
            >
              Cancel
            </AlertDialogClose>
            <Button
              disabled={sourceBusy !== null}
              onClick={() => void removeSource("keep-installed")}
              variant="outline"
            >
              Keep installed resources
            </Button>
            <Button
              loading={sourceBusy === sourceToRemove?.id}
              onClick={() => void removeSource("delete-installed")}
              variant="destructive"
            >
              Delete installed resources
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </>
  );
}
