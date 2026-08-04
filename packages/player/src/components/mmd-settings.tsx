import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@wallpaper/ui/button";
import { Kbd } from "@wallpaper/ui/kbd";
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
import {
  useLivePerformanceSnapshot,
  useMmdActions,
  useMmdPerformance,
  useMmdState,
} from "../providers/mmd-context";
import { GroupedSelectItems } from "./grouped-select-items";
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
import { useEffect, useState } from "react";
import {
  applyRenderQualityPreset,
  getRenderQualityPreset,
  type MmdQualityPreset,
  type TextureAnisotropyLevel,
} from "../types";

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
const MATERIAL_RENDER_MODE_LABELS = {
  mmd: "MMD accurate",
  balanced: "Balanced",
  performance: "Performance",
} as const;

const QUALITY_PRESET_LABELS: Record<MmdQualityPreset | "custom", string> = {
  performance: "Performance",
  balanced: "Balanced",
  quality: "High quality",
  ultra: "Ultra",
  custom: "Custom",
};

const MSAA_OPTIONS = [1, 2, 4, 8] as const;
const TEXTURE_ANISOTROPY_OPTIONS = [1, 4, 8, 16] as const;
const SUPERSAMPLING_OPTIONS = [1, 1.5, 2] as const;
const SHADOW_MAP_OPTIONS = [1024, 2048, 4096] as const;
const SSR_QUALITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
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
  onValueCommitted,
  formatValue = (current) => current.toFixed(2),
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  onValueCommitted?: (value: number) => void;
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
        onValueCommitted={(nextValue) => {
          onValueCommitted?.(
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

function formatOverlayFps(value: number): string {
  return value >= 100 ? value.toFixed(0) : value.toFixed(1);
}

function LivePerformanceReadout() {
  const snapshot = useLivePerformanceSnapshot();

  if (snapshot === null || snapshot.frameCount === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Waiting for the first rendered frames…
      </p>
    );
  }

  return (
    <div className="space-y-1.5 rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5 font-mono">
      <div className="flex items-baseline justify-between">
        <span className="text-lg font-bold leading-none tabular-nums text-[#7CFC00]">
          {formatOverlayFps(snapshot.fps)} FPS
        </span>
        <span className="text-xs leading-none tabular-nums text-muted-foreground">
          {snapshot.frameTimeMs.toFixed(1)} ms
        </span>
      </div>
      <div className="flex justify-between text-[11px] leading-none tabular-nums text-muted-foreground">
        <span>avg {formatOverlayFps(snapshot.averageFps)}</span>
        <span>1% low {formatOverlayFps(snapshot.low1PercentFps)}</span>
        <span>{snapshot.drawCalls} draws</span>
      </div>
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
  items: readonly { id: string; name: string; group?: string }[];
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
            <GroupedSelectItems
              items={items}
              valueFor={(_item, index) => String(index)}
            />
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
    skyboxes,
    modelIndex,
    motionIndex,
    stageIndex,
    skyboxIndex,
    model,
    motion,
    stage,
    skybox,
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
    selectSkybox,
    previousModel,
    nextModel,
    previousMotion,
    nextMotion,
    previousStage,
    nextStage,
    previousSkybox,
    nextSkybox,
    setBackground,
    setVolume,
    setPlaybackRate,
    previousPlaylistItem,
    nextPlaylistItem,
    setRenderSettings,
    resetRenderSettings,
  } = useMmdActions();
  const { overlayVisible, setOverlayVisible } = useMmdPerformance();

  const colorValue = background.slice(0, 7);

  // The physics limit and strength commit only on release; committing per
  // drag tick would trigger a scene reload for every step.
  const [physicsLimitDraft, setPhysicsLimitDraft] = useState(
    renderSettings.physicsConstraintLimitDegrees,
  );
  const [physicsStrengthDraft, setPhysicsStrengthDraft] = useState(
    renderSettings.physicsStrength,
  );
  useEffect(() => {
    setPhysicsLimitDraft(renderSettings.physicsConstraintLimitDegrees);
    setPhysicsStrengthDraft(renderSettings.physicsStrength);
  }, [
    renderSettings.physicsConstraintLimitDegrees,
    renderSettings.physicsStrength,
  ]);

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
              <p className="truncate text-xs text-muted-foreground">
                {skybox.name}
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
          <ResourceSelector
            items={skyboxes}
            label="Skybox"
            onChange={selectSkybox}
            onNext={nextSkybox}
            onPrevious={previousSkybox}
            value={skyboxIndex}
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
            checked={renderSettings.stageEffectsEnabled}
            description="Applies the stage's built-in look: reflective floor, emissive glow, and bloom tuning."
            label="Stage effects"
            onCheckedChange={(checked) =>
              setRenderSettings({ stageEffectsEnabled: checked })
            }
          />
          <p className="text-xs text-muted-foreground">
            Changing this option reloads the current resources.
          </p>

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

        <section className="space-y-4 rounded-2xl border border-border/70 bg-card/40 p-4">
          <div>
            <SettingHeading title="Render quality" />
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Presets balance visual fidelity against GPU cost. Advanced
              options tune each effect individually.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Quality preset</Label>
            <Select
              onValueChange={(nextValue) => {
                if (
                  nextValue !== null &&
                  nextValue !== "custom" &&
                  nextValue !==
                    getRenderQualityPreset(renderSettings)
                ) {
                  setRenderSettings(
                    applyRenderQualityPreset(
                      renderSettings,
                      nextValue as MmdQualityPreset,
                    ),
                  );
                }
              }}
              value={getRenderQualityPreset(renderSettings)}
            >
              <SelectTrigger aria-label="Quality preset">
                <SelectValue>
                  {
                    QUALITY_PRESET_LABELS[
                      getRenderQualityPreset(renderSettings)
                    ]
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(
                  QUALITY_PRESET_LABELS,
                ) as (MmdQualityPreset | "custom")[])
                  .filter((preset) => preset !== "custom")
                  .map((preset) => (
                    <SelectItem key={preset} value={preset}>
                      {QUALITY_PRESET_LABELS[preset]}
                    </SelectItem>
                  ))}
                {getRenderQualityPreset(renderSettings) === "custom" && (
                  <SelectItem disabled value="custom">
                    Custom
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {getRenderQualityPreset(renderSettings) === "custom" && (
              <p className="text-xs text-muted-foreground">
                Custom values are currently applied.
              </p>
            )}
          </div>

          <SettingSwitch
            checked={renderSettings.rimLightEnabled}
            description="Faint cool back light that separates the model from the background."
            label="Rim light"
            onCheckedChange={(checked) =>
              setRenderSettings({ rimLightEnabled: checked })
            }
          />
          {renderSettings.rimLightEnabled && (
            <div className="space-y-4 rounded-lg border bg-muted/20 p-3">
              <SettingSlider
                label="Rim light intensity"
                max={1}
                min={0}
                onChange={(value) =>
                  setRenderSettings({ rimLightIntensity: value })
                }
                step={0.05}
                value={renderSettings.rimLightIntensity}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Antialiasing samples</Label>
            <Select
              onValueChange={(nextValue) => {
                if (nextValue !== null) {
                  setRenderSettings({ msaaSamples: Number(nextValue) });
                }
              }}
              value={String(renderSettings.msaaSamples)}
            >
              <SelectTrigger aria-label="Antialiasing samples">
                <SelectValue>{renderSettings.msaaSamples}×</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {MSAA_OPTIONS.map((samples) => (
                  <SelectItem key={samples} value={String(samples)}>
                    {samples}×
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Texture filtering</Label>
            <Select
              onValueChange={(nextValue) => {
                if (nextValue !== null) {
                  setRenderSettings({
                    textureAnisotropy: Number(
                      nextValue,
                    ) as TextureAnisotropyLevel,
                  });
                }
              }}
              value={String(renderSettings.textureAnisotropy)}
            >
              <SelectTrigger aria-label="Texture filtering quality">
                <SelectValue>
                  {renderSettings.textureAnisotropy}× anisotropic
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TEXTURE_ANISOTROPY_OPTIONS.map((level) => (
                  <SelectItem key={level} value={String(level)}>
                    {level}× anisotropic
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Sharpens angled and distant model or stage textures.
            </p>
          </div>

          <SettingSwitch
            checked={renderSettings.fxaaEnabled}
            description="Fast post-process filter that smooths remaining jagged edges after MSAA."
            label="FXAA"
            onCheckedChange={(checked) =>
              setRenderSettings({ fxaaEnabled: checked })
            }
          />

          <div className="space-y-2">
            <Label>Supersampling</Label>
            <Select
              onValueChange={(nextValue) => {
                if (nextValue !== null) {
                  setRenderSettings({
                    supersamplingScale: Number(nextValue),
                  });
                }
              }}
              value={String(renderSettings.supersamplingScale)}
            >
              <SelectTrigger aria-label="Supersampling">
                <SelectValue>
                  {renderSettings.supersamplingScale}×
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SUPERSAMPLING_OPTIONS.map((scale) => (
                  <SelectItem key={scale} value={String(scale)}>
                    {scale}×
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Shadow map</Label>
              <Select
                onValueChange={(nextValue) => {
                  if (nextValue !== null) {
                    setRenderSettings({ shadowMapSize: Number(nextValue) });
                  }
                }}
                value={String(renderSettings.shadowMapSize)}
              >
                <SelectTrigger aria-label="Shadow map resolution">
                  <SelectValue>
                    {renderSettings.shadowMapSize >= 1024
                      ? `${renderSettings.shadowMapSize / 1024}K`
                      : renderSettings.shadowMapSize}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SHADOW_MAP_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size >= 1024 ? `${size / 1024}K` : size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Shadow softness</Label>
              <Select
                onValueChange={(nextValue) => {
                  if (nextValue === "pcf" || nextValue === "pcss") {
                    setRenderSettings({ shadowFiltering: nextValue });
                  }
                }}
                value={renderSettings.shadowFiltering}
              >
                <SelectTrigger aria-label="Shadow filtering">
                  <SelectValue>
                    {renderSettings.shadowFiltering === "pcss"
                      ? "Soft (PCSS)"
                      : "Crisp (PCF)"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcf">Crisp (PCF)</SelectItem>
                  <SelectItem value="pcss">Soft (PCSS)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SettingSwitch
            checked={renderSettings.ssaoEnabled}
            description="Darkens crevices between hair, clothes and body for depth."
            label="Ambient occlusion (SSAO)"
            onCheckedChange={(checked) =>
              setRenderSettings({ ssaoEnabled: checked })
            }
          />
          {renderSettings.ssaoEnabled && (
            <div className="space-y-4 rounded-lg border bg-muted/20 p-3">
              <SettingSlider
                formatValue={(value) => value.toFixed(4)}
                label="SSAO radius"
                max={0.005}
                min={0.0001}
                onChange={(value) =>
                  setRenderSettings({ ssaoRadius: value })
                }
                step={0.0001}
                value={renderSettings.ssaoRadius}
              />
              <SettingSlider
                label="SSAO strength"
                max={2}
                min={0}
                onChange={(value) =>
                  setRenderSettings({ ssaoStrength: value })
                }
                step={0.05}
                value={renderSettings.ssaoStrength}
              />
            </div>
          )}

          <SettingSwitch
            checked={renderSettings.ssrEnabled}
            description="Screen-space reflections on glossy surfaces. Experimental with MMD toon materials; best on reflective stages."
            label="Screen-space reflections (SSR)"
            onCheckedChange={(checked) =>
              setRenderSettings({ ssrEnabled: checked })
            }
          />
          {renderSettings.ssrEnabled && (
            <div className="space-y-4 rounded-lg border bg-muted/20 p-3">
              <SettingSlider
                label="SSR strength"
                max={2}
                min={0}
                onChange={(value) =>
                  setRenderSettings({ ssrStrength: value })
                }
                step={0.05}
                value={renderSettings.ssrStrength}
              />
              <div className="space-y-2">
                <Label>SSR quality</Label>
                <Select
                  onValueChange={(nextValue) => {
                    if (nextValue === "low" || nextValue === "medium" || nextValue === "high") {
                      setRenderSettings({ ssrQuality: nextValue });
                    }
                  }}
                  value={renderSettings.ssrQuality}
                >
                  <SelectTrigger aria-label="SSR quality">
                    <SelectValue>
                      {SSR_QUALITY_LABELS[renderSettings.ssrQuality]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <SettingSlider
            formatValue={(value) => `${Math.round(value)}°`}
            label="Physics joint limit"
            max={30}
            min={5}
            onChange={setPhysicsLimitDraft}
            onValueCommitted={(value) =>
              setRenderSettings({ physicsConstraintLimitDegrees: value })
            }
            step={1}
            value={physicsLimitDraft}
          />

          <div className="space-y-2">
            <Label>Physics engine</Label>
            <Select
              onValueChange={(nextValue) => {
                if (nextValue === "ammo" || nextValue === "havok") {
                  setRenderSettings({ physicsBackend: nextValue });
                }
              }}
              value={renderSettings.physicsBackend}
            >
              <SelectTrigger aria-label="Physics engine">
                <SelectValue>
                  {renderSettings.physicsBackend === "ammo"
                    ? "Bullet (MMD accurate)"
                    : "Havok (lighter)"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ammo">Bullet (MMD accurate)</SelectItem>
                <SelectItem value="havok">Havok (lighter)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Bullet matches how MMD itself simulates skirts and hair, and
              honors the model's joint springs. Havok loads faster but drops
              those settings. Changing the engine reloads the current
              resources.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Physics step rate</Label>
            <Select
              onValueChange={(nextValue) => {
                if (nextValue === "30" || nextValue === "60" || nextValue === "120") {
                  setRenderSettings({ physicsStepRate: Number(nextValue) });
                }
              }}
              value={String(renderSettings.physicsStepRate)}
            >
              <SelectTrigger aria-label="Physics step rate">
                <SelectValue>{renderSettings.physicsStepRate} Hz</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 Hz</SelectItem>
                <SelectItem value="60">60 Hz</SelectItem>
                <SelectItem value="120">120 Hz</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Higher rates simulate hair and skirts more smoothly at a CPU
              cost.
            </p>
          </div>

          <div className="space-y-2">
            <div className={renderSettings.physicsBackend === "havok" ? "opacity-50" : undefined}>
              <SettingSlider
                label="Solver iterations"
                max={30}
                min={5}
                onChange={(value) =>
                  setRenderSettings({ physicsSolverIterations: value })
                }
                step={1}
                value={renderSettings.physicsSolverIterations}
              />
            </div>
            {renderSettings.physicsBackend === "havok" ? (
              <p className="text-xs text-muted-foreground">
                Only available with the Bullet engine.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                More iterations resolve clipping between hair, clothes and
                skin more reliably.
              </p>
            )}
          </div>

          <SettingSlider
            formatValue={(value) => `${value.toFixed(2)}×`}
            label="Physics strength"
            max={3}
            min={0.5}
            onChange={setPhysicsStrengthDraft}
            onValueCommitted={(value) =>
              setRenderSettings({ physicsStrength: value })
            }
            step={0.05}
            value={physicsStrengthDraft}
          />
          <p className="text-xs text-muted-foreground">
            Stiffness of the model's joints; below 1 makes hair and skirts
            softer, above 1 stiffer. Changing this value reloads the current
            resources.
          </p>
          <p className="text-xs text-muted-foreground">
            Lower joint limits keep the model's original hair and skirt
            motion; higher values improve stability on broken joints.
            Changing SSAO, SSR, physics or this value reloads the current
            resources.
          </p>
        </section>

        <section className="space-y-4 rounded-2xl border border-border/70 bg-card/40 p-4">
          <div>
            <SettingHeading title="FPS overlay" />
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              RTSS-style frame time monitor over the wallpaper. Toggle it
              anytime with the <Kbd>`</Kbd> key.
            </p>
          </div>
          <SettingSwitch
            checked={overlayVisible}
            description="Shows FPS, frame time, 1% lows and GPU stats over the wallpaper."
            label="Show performance overlay"
            onCheckedChange={setOverlayVisible}
          />
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground/80">
              Live stats
            </p>
            <LivePerformanceReadout />
          </div>
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
