import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@wallpaper/ui/button";
import { Label } from "@wallpaper/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@wallpaper/ui/select";
import { Slider } from "@wallpaper/ui/slider";
import { Switch } from "@wallpaper/ui/switch";
import {
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@wallpaper/ui/tabs";
import { cn } from "@wallpaper/ui/utils";
import { useMmdActions, useMmdState } from "../providers/mmd-context";
import { PlaylistEditor } from "./playlist-editor";
import {
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
} from "@wallpaper/ui/sheet";
import type { ReactNode } from "react";

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
const MATERIAL_RENDER_MODE_LABELS = {
  mmd: "MMD accurate",
  balanced: "Balanced",
  performance: "Performance",
} as const;

const STATUS_LABELS = {
  idle: "Waiting for canvas",
  loading: "Loading resources",
  ready: "Ready",
  error: "Load failed",
} as const;

function SettingHeading({ title, value }: { title: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-sm font-medium">{title}</h3>
      {value !== undefined && (
        <span className="text-xs tabular-nums text-muted-foreground">
          {value}
        </span>
      )}
    </div>
  );
}

function SettingsGroup({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-border/70 bg-card/40 p-4 shadow-sm backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {description === undefined ? null : (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function SettingSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue = (current) => current.toFixed(2),
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}) {
  return (
    <div className="space-y-2">
      <SettingHeading title={label} value={formatValue(value)} />
      <Slider
        aria-label={label}
        max={max}
        min={min}
        onValueChange={(nextValue) => {
          onChange(
            typeof nextValue === "number" ? nextValue : nextValue[0],
          );
        }}
        step={step}
        value={value}
      />
    </div>
  );
}

function SettingSwitch({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-control/35 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch
        aria-label={label}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

function ResourceSelector({
  label,
  value,
  items,
  onChange,
  onPrevious,
  onNext,
}: {
  label: string;
  value: number;
  items: readonly { name: string }[];
  onChange: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const hasMultipleItems = items.length > 1;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-2">
        <Button
          aria-label={`Previous ${label.toLowerCase()}`}
          disabled={!hasMultipleItems}
          onClick={onPrevious}
          size="icon"
          variant="outline"
        >
          <ChevronLeft />
        </Button>

        <Select
          onValueChange={(nextValue) => {
            if (nextValue !== null) onChange(Number(nextValue));
          }}
          value={String(value)}
        >
          <SelectTrigger aria-label={label}>
            <SelectValue>{items[value].name}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {items.map((item, index) => (
              <SelectItem key={`${item.name}-${index}`} value={String(index)}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          aria-label={`Next ${label.toLowerCase()}`}
          disabled={!hasMultipleItems}
          onClick={onNext}
          size="icon"
          variant="outline"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

export function MmdSettings({
  settingsContent,
}: {
  settingsContent?: ReactNode;
}) {
  const {
    models,
    motions,
    stages,
    modelIndex,
    motionIndex,
    stageIndex,
    model,
    motion,
    stage,
    background,
    status,
    error,
    volume,
    playbackRate,
    renderSettings,
    playlist,
    playlistIndex,
    isPreloading,
  } = useMmdState();
  const {
    selectModel,
    selectMotion,
    selectStage,
    previousModel,
    nextModel,
    previousMotion,
    nextMotion,
    previousStage,
    nextStage,
    setBackground,
    setVolume,
    setPlaybackRate,
    previousPlaylistItem,
    nextPlaylistItem,
    setRenderSettings,
    resetRenderSettings,
  } = useMmdActions();

  const colorValue = background.slice(0, 7);

  return (
    <SheetPopup className="bg-popover/82 backdrop-blur-2xl">
      <SheetHeader className="border-b border-border/60 bg-card/20">
        <SheetTitle>Player settings</SheetTitle>
        <SheetDescription className="truncate pe-8">
          {model.name} · {motion.name}
        </SheetDescription>
      </SheetHeader>

      <SheetPanel className="space-y-4">
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border border-border/70 bg-control/35 px-3 py-2 text-xs",
            status === "error"
              ? "border-destructive/40 bg-destructive/8 text-destructive-foreground"
              : "text-muted-foreground",
          )}
        >
          <span
            className={cn(
              "size-2 shrink-0 rounded-full",
              status === "ready" && "bg-success",
              status === "loading" && "animate-pulse bg-warning",
              status === "idle" && "bg-muted-foreground",
              status === "error" && "bg-destructive",
            )}
          />
          <span>
            {error?.message ??
              (status === "ready" && isPreloading
                ? "Ready · preparing next item"
                : STATUS_LABELS[status])}
          </span>
        </div>

        <Tabs defaultValue="content">
          <TabsList className="grid w-full grid-cols-3 bg-muted/60 backdrop-blur-xl">
            <TabsTab value="content">Content</TabsTab>
            <TabsTab value="look">Look</TabsTab>
            <TabsTab value="render">Render</TabsTab>
          </TabsList>

          <TabsPanel className="space-y-4 pt-2" value="content">
            {settingsContent === undefined ? null : (
              <SettingsGroup
                description="Browse and manage resources cached on this device."
                title="Library"
              >
                {settingsContent}
              </SettingsGroup>
            )}

        <section className="space-y-4 rounded-2xl border border-border/70 bg-card/40 p-4">
          <SettingHeading
            title="Playlist"
            value={`${playlistIndex + 1} / ${playlist.length}`}
          />
          <div className="rounded-xl border bg-muted/30 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{model.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {motion.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {stage.name}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <Button
                  aria-label="Previous playlist item"
                  disabled={playlist.length <= 1}
                  onClick={previousPlaylistItem}
                  size="icon-sm"
                  variant="outline"
                >
                  <ChevronLeft />
                </Button>
                <Button
                  aria-label="Next playlist item"
                  disabled={playlist.length <= 1}
                  onClick={nextPlaylistItem}
                  size="icon-sm"
                  variant="outline"
                >
                  <ChevronRight />
                </Button>
              </div>
              <PlaylistEditor />
            </div>
          </div>

          <SettingHeading title="Current combination" />
          <ResourceSelector
            items={models}
            label="Model"
            onChange={selectModel}
            onNext={nextModel}
            onPrevious={previousModel}
            value={modelIndex}
          />
          <ResourceSelector
            items={motions}
            label="Motion"
            onChange={selectMotion}
            onNext={nextMotion}
            onPrevious={previousMotion}
            value={motionIndex}
          />
          <ResourceSelector
            items={stages}
            label="Stage"
            onChange={selectStage}
            onNext={nextStage}
            onPrevious={previousStage}
            value={stageIndex}
          />
        </section>

        <section className="space-y-4 rounded-2xl border border-border/70 bg-card/40 p-4">
          <div className="space-y-2">
            <Label>Playback speed</Label>
            <Select
              onValueChange={(nextValue) => {
                if (nextValue !== null) setPlaybackRate(Number(nextValue));
              }}
              value={String(playbackRate)}
            >
              <SelectTrigger aria-label="Playback speed">
                <SelectValue>{playbackRate}×</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PLAYBACK_RATES.map((rate) => (
                  <SelectItem key={rate} value={String(rate)}>
                    {rate}×
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-border/70 bg-card/40 p-4">
          <SettingHeading title="Appearance" value={colorValue} />
          <Label className="flex w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2">
            Background color
            <span
              className="size-7 rounded-md border shadow-xs"
              style={{ backgroundColor: colorValue }}
            />
            <input
              aria-label="Background color"
              className="sr-only"
              onChange={(event) => setBackground(event.currentTarget.value)}
              type="color"
              value={colorValue}
            />
          </Label>
        </section>
          </TabsPanel>

          <TabsPanel className="space-y-4 pt-2" value="look">
        <section className="space-y-4 rounded-2xl border border-border/70 bg-card/40 p-4">
          <SettingHeading title="Lighting" />
          <SettingSlider
            label="Ambient light"
            max={1}
            min={0}
            onChange={(value) =>
              setRenderSettings({ ambientLightIntensity: value })
            }
            step={0.01}
            value={renderSettings.ambientLightIntensity}
          />
          <SettingSlider
            label="Fill light"
            max={1.5}
            min={0}
            onChange={(value) =>
              setRenderSettings({ hemisphericLightIntensity: value })
            }
            step={0.01}
            value={renderSettings.hemisphericLightIntensity}
          />
          <SettingSlider
            label="Key light"
            max={2}
            min={0}
            onChange={(value) =>
              setRenderSettings({ directionalLightIntensity: value })
            }
            step={0.01}
            value={renderSettings.directionalLightIntensity}
          />
          <Label className="flex w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2">
            Key light color
            <span
              className="size-7 rounded-md border shadow-xs"
              style={{ backgroundColor: renderSettings.directionalLightColor }}
            />
            <input
              aria-label="Key light color"
              className="sr-only"
              onChange={(event) =>
                setRenderSettings({
                  directionalLightColor: event.currentTarget.value,
                })
              }
              type="color"
              value={renderSettings.directionalLightColor}
            />
          </Label>
          <SettingSlider
            formatValue={(value) => `${Math.round(value * 100)}%`}
            label="Shadow opacity"
            max={1}
            min={0}
            onChange={(value) => setRenderSettings({ shadowOpacity: value })}
            step={0.01}
            value={renderSettings.shadowOpacity}
          />
          <SettingSlider
            label="Exposure"
            max={2}
            min={0.25}
            onChange={(value) => setRenderSettings({ exposure: value })}
            step={0.01}
            value={renderSettings.exposure}
          />
          <SettingSlider
            label="Contrast"
            max={2}
            min={0.5}
            onChange={(value) => setRenderSettings({ contrast: value })}
            step={0.01}
            value={renderSettings.contrast}
          />
        </section>

        <section className="space-y-4 rounded-2xl border border-border/70 bg-card/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <SettingHeading title="MME effects" />
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Browser-native versions of common MME post effects.
              </p>
            </div>
            <Button
              onClick={resetRenderSettings}
              size="sm"
              variant="ghost"
            >
              <RotateCcw />
              Reset
            </Button>
          </div>

          <SettingSwitch
            checked={renderSettings.bloomEnabled}
            description="Soft glow around bright highlights, similar to AutoLuminous."
            label="Bloom"
            onCheckedChange={(checked) =>
              setRenderSettings({ bloomEnabled: checked })
            }
          />
          {renderSettings.bloomEnabled && (
            <div className="space-y-4 rounded-lg border bg-muted/20 p-3">
              <SettingSlider
                label="Bloom intensity"
                max={1}
                min={0}
                onChange={(value) =>
                  setRenderSettings({ bloomIntensity: value })
                }
                step={0.01}
                value={renderSettings.bloomIntensity}
              />
              <SettingSlider
                label="Bloom threshold"
                max={1}
                min={0}
                onChange={(value) =>
                  setRenderSettings({ bloomThreshold: value })
                }
                step={0.01}
                value={renderSettings.bloomThreshold}
              />
            </div>
          )}

          <SettingSwitch
            checked={renderSettings.depthOfFieldEnabled}
            description="Camera-focused blur inspired by ikBokeh and PowerDOF."
            label="Depth of field"
            onCheckedChange={(checked) =>
              setRenderSettings({ depthOfFieldEnabled: checked })
            }
          />
          {renderSettings.depthOfFieldEnabled && (
            <div className="space-y-4 rounded-lg border bg-muted/20 p-3">
              <SettingSlider
                formatValue={(value) => `${Math.round(value)} mm`}
                label="Focus distance"
                max={10000}
                min={100}
                onChange={(value) =>
                  setRenderSettings({ depthOfFieldFocusDistance: value })
                }
                step={50}
                value={renderSettings.depthOfFieldFocusDistance}
              />
              <SettingSlider
                formatValue={(value) => `f/${value.toFixed(1)}`}
                label="Aperture"
                max={16}
                min={1}
                onChange={(value) =>
                  setRenderSettings({ depthOfFieldAperture: value })
                }
                step={0.1}
                value={renderSettings.depthOfFieldAperture}
              />
            </div>
          )}

          <SettingSwitch
            checked={renderSettings.vignetteEnabled}
            description="Darkens the frame edges to draw attention to the model."
            label="Vignette"
            onCheckedChange={(checked) =>
              setRenderSettings({ vignetteEnabled: checked })
            }
          />
          {renderSettings.vignetteEnabled && (
            <div className="rounded-lg border bg-muted/20 p-3">
              <SettingSlider
                label="Vignette weight"
                max={5}
                min={0}
                onChange={(value) =>
                  setRenderSettings({ vignetteWeight: value })
                }
                step={0.05}
                value={renderSettings.vignetteWeight}
              />
            </div>
          )}

          <SettingSwitch
            checked={renderSettings.toneMappingEnabled}
            description="ACES tone mapping keeps bright areas filmic and controlled."
            label="Filmic tone mapping"
            onCheckedChange={(checked) =>
              setRenderSettings({ toneMappingEnabled: checked })
            }
          />
          <SettingSlider
            formatValue={(value) =>
              `${value > 0 ? "+" : ""}${Math.round(value)}`
            }
            label="Color saturation"
            max={100}
            min={-100}
            onChange={(value) =>
              setRenderSettings({ colorSaturation: value })
            }
            step={1}
            value={renderSettings.colorSaturation}
          />
        </section>
          </TabsPanel>

          <TabsPanel className="space-y-4 pt-2" value="render">
        <section className="space-y-4 rounded-2xl border border-border/70 bg-card/40 p-4">
          <SettingHeading title="Materials" />

          <div className="space-y-2">
            <Label>Rendering mode</Label>
            <Select
              onValueChange={(nextValue) => {
                if (nextValue !== null) {
                  setRenderSettings({
                    materialRenderMode:
                      nextValue as typeof renderSettings.materialRenderMode,
                  });
                }
              }}
              value={renderSettings.materialRenderMode}
            >
              <SelectTrigger aria-label="Material rendering mode">
                <SelectValue>
                  {
                    MATERIAL_RENDER_MODE_LABELS[
                      renderSettings.materialRenderMode
                    ]
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mmd">MMD accurate</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Changing this option reloads the current model.
            </p>
          </div>

          <SettingSwitch
            checked={renderSettings.applyAmbientColorToDiffuse}
            description="Uses the model's ambient color in the final diffuse color."
            label="Ambient material color"
            onCheckedChange={(checked) =>
              setRenderSettings({ applyAmbientColorToDiffuse: checked })
            }
          />
          <SettingSwitch
            checked={renderSettings.ignoreDiffuseWhenToonTextureIsNull}
            description="Keeps materials without a toon texture from becoming too dark."
            label="Missing toon fallback"
            onCheckedChange={(checked) =>
              setRenderSettings({
                ignoreDiffuseWhenToonTextureIsNull: checked,
              })
            }
          />
          <SettingSwitch
            checked={renderSettings.sphereTextureEnabled}
            description="Enables sphere maps used for metallic and glossy highlights."
            label="Sphere maps"
            onCheckedChange={(checked) =>
              setRenderSettings({ sphereTextureEnabled: checked })
            }
          />
          <SettingSwitch
            checked={renderSettings.toonTextureEnabled}
            description="Enables the model's toon-ramp shading textures."
            label="Toon maps"
            onCheckedChange={(checked) =>
              setRenderSettings({ toonTextureEnabled: checked })
            }
          />
        </section>
          </TabsPanel>
        </Tabs>
      </SheetPanel>

      <SheetFooter>
        <div className="flex-1 space-y-1">
          <SettingHeading
            title="Volume"
            value={`${Math.round(volume * 100)}%`}
          />

          <Slider
            className="mb-2"
            aria-label="Volume"
            max={1}
            min={0}
            onValueChange={(nextVolume) => {
              setVolume(
                typeof nextVolume === "number" ? nextVolume : nextVolume[0],
              );
            }}
            step={0.01}
            value={volume}
          />
        </div>
      </SheetFooter>
    </SheetPopup>
  );
}
