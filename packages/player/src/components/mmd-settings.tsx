import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { m } from "@wallpaper/i18n";
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
import { LocaleSwitcher } from "./locale-switcher";
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
  type PlanarReflectionTextureSize,
  type TextureAnisotropyLevel,
} from "../types";

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
const MATERIAL_RENDER_MODE_LABELS: Record<
  "mmd" | "balanced" | "performance",
  () => string
> = {
  mmd: () => m.player_settings_render_mode_mmd(),
  balanced: () => m.player_settings_render_mode_balanced(),
  performance: () => m.player_settings_render_mode_performance(),
};

const QUALITY_PRESET_LABELS: Record<
  MmdQualityPreset | "custom",
  () => string
> = {
  performance: () => m.player_settings_quality_preset_performance(),
  balanced: () => m.player_settings_quality_preset_balanced(),
  quality: () => m.player_settings_quality_preset_high_quality(),
  ultra: () => m.player_settings_quality_preset_ultra(),
  custom: () => m.player_settings_quality_preset_custom(),
};

const MSAA_OPTIONS = [1, 2, 4, 8] as const;
const TEXTURE_ANISOTROPY_OPTIONS = [1, 4, 8, 16] as const;
const SUPERSAMPLING_OPTIONS = [1, 1.5, 2] as const;
const SHADOW_MAP_OPTIONS = [1024, 2048, 4096] as const;
const PLANAR_REFLECTION_TEXTURE_SIZE_OPTIONS = [
  0,
  256,
  512,
  1_024,
  2_048,
] as const;
const SSR_QUALITY_LABELS: Record<"low" | "medium" | "high", () => string> = {
  low: () => m.player_settings_quality_low(),
  medium: () => m.player_settings_quality_medium(),
  high: () => m.player_settings_quality_high(),
};

const STATUS_LABELS = {
  idle: () => m.player_status_waiting_for_canvas(),
  loading: () => m.player_status_loading_resources(),
  ready: () => m.player_status_ready(),
  error: () => m.player_status_load_failed(),
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
        {m.player_settings_waiting_for_frames()}
      </p>
    );
  }

  return (
    <div className="space-y-1.5 rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5 font-mono">
      <div className="flex items-baseline justify-between">
        <span className="text-lg font-bold leading-none tabular-nums text-[#7CFC00]">
          {formatOverlayFps(snapshot.fps)} {m.player_settings_fps()}
        </span>
        <span className="text-xs leading-none tabular-nums text-muted-foreground">
          {snapshot.frameTimeMs.toFixed(1)} {m.player_settings_ms()}
        </span>
      </div>
      <div className="flex justify-between text-[11px] leading-none tabular-nums text-muted-foreground">
        <span>{m.player_settings_avg_fps({ value: formatOverlayFps(snapshot.averageFps) })}</span>
        <span>{m.player_settings_low1_percent_fps({ value: formatOverlayFps(snapshot.low1PercentFps) })}</span>
        <span>{m.player_settings_draws_count({ count: snapshot.drawCalls })}</span>
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
          aria-label={m.player_settings_previous_resource({ label })}
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
          aria-label={m.player_settings_next_resource({ label })}
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
        <SheetTitle>{m.player_settings_title()}</SheetTitle>
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
                ? m.player_settings_ready_preparing_next()
                : STATUS_LABELS[status]())}
          </span>
        </div>

        <Tabs defaultValue="content">
          <TabsList className="grid w-full grid-cols-3 bg-muted/60 backdrop-blur-xl">
            <TabsTab value="content">{m.player_settings_tab_content()}</TabsTab>
            <TabsTab value="look">{m.player_settings_tab_look()}</TabsTab>
            <TabsTab value="render">{m.player_settings_tab_render()}</TabsTab>
          </TabsList>

          <TabsPanel className="space-y-4 pt-2" value="content">
            {settingsContent === undefined ? null : (
              <SettingsGroup
                description={m.player_settings_library_description()}
                title={m.player_settings_library()}
              >
                {settingsContent}
              </SettingsGroup>
            )}

        <section className="space-y-2 rounded-2xl border border-border/70 bg-card/40 p-4">
          <LocaleSwitcher />
        </section>

        <section className="space-y-4 rounded-2xl border border-border/70 bg-card/40 p-4">
          <SettingHeading
            title={m.player_settings_playlist()}
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
                  aria-label={m.player_previous_playlist_item()}
                  disabled={playlist.length <= 1}
                  onClick={previousPlaylistItem}
                  size="icon-sm"
                  variant="outline"
                >
                  <ChevronLeft />
                </Button>
                <Button
                  aria-label={m.player_next_playlist_item()}
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

          <SettingHeading title={m.player_settings_current_combination()} />
          <ResourceSelector
            items={models}
            label={m.player_settings_model()}
            onChange={selectModel}
            onNext={nextModel}
            onPrevious={previousModel}
            value={modelIndex}
          />
          <ResourceSelector
            items={motions}
            label={m.player_settings_motion()}
            onChange={selectMotion}
            onNext={nextMotion}
            onPrevious={previousMotion}
            value={motionIndex}
          />
          <ResourceSelector
            items={stages}
            label={m.player_settings_stage()}
            onChange={selectStage}
            onNext={nextStage}
            onPrevious={previousStage}
            value={stageIndex}
          />
          <ResourceSelector
            items={skyboxes}
            label={m.player_settings_skybox()}
            onChange={selectSkybox}
            onNext={nextSkybox}
            onPrevious={previousSkybox}
            value={skyboxIndex}
          />
        </section>

        <section className="space-y-4 rounded-2xl border border-border/70 bg-card/40 p-4">
          <div className="space-y-2">
            <Label>{m.player_settings_playback_speed()}</Label>
            <Select
              onValueChange={(nextValue) => {
                if (nextValue !== null) setPlaybackRate(Number(nextValue));
              }}
              value={String(playbackRate)}
            >
              <SelectTrigger aria-label={m.player_settings_playback_speed()}>
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
          <SettingHeading title={m.player_settings_appearance()} value={colorValue} />
          <Label className="flex w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2">
            {m.player_settings_background_color()}
            <span
              className="size-7 rounded-md border shadow-xs"
              style={{ backgroundColor: colorValue }}
            />
            <input
              aria-label={m.player_settings_background_color()}
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
          <SettingHeading title={m.player_settings_lighting()} />
          <SettingSlider
            label={m.player_settings_ambient_light()}
            max={1}
            min={0}
            onChange={(value) =>
              setRenderSettings({ ambientLightIntensity: value })
            }
            step={0.01}
            value={renderSettings.ambientLightIntensity}
          />
          <SettingSlider
            label={m.player_settings_fill_light()}
            max={1.5}
            min={0}
            onChange={(value) =>
              setRenderSettings({ hemisphericLightIntensity: value })
            }
            step={0.01}
            value={renderSettings.hemisphericLightIntensity}
          />
          <SettingSlider
            label={m.player_settings_key_light()}
            max={2}
            min={0}
            onChange={(value) =>
              setRenderSettings({ directionalLightIntensity: value })
            }
            step={0.01}
            value={renderSettings.directionalLightIntensity}
          />
          <Label className="flex w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2">
            {m.player_settings_key_light_color()}
            <span
              className="size-7 rounded-md border shadow-xs"
              style={{ backgroundColor: renderSettings.directionalLightColor }}
            />
            <input
              aria-label={m.player_settings_key_light_color()}
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
            label={m.player_settings_shadow_opacity()}
            max={1}
            min={0}
            onChange={(value) => setRenderSettings({ shadowOpacity: value })}
            step={0.01}
            value={renderSettings.shadowOpacity}
          />
          <SettingSlider
            label={m.player_settings_exposure()}
            max={2}
            min={0.25}
            onChange={(value) => setRenderSettings({ exposure: value })}
            step={0.01}
            value={renderSettings.exposure}
          />
          <SettingSlider
            label={m.player_settings_contrast()}
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
              <SettingHeading title={m.player_settings_mme_effects()} />
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {m.player_settings_mme_effects_description()}
              </p>
            </div>
            <Button
              onClick={resetRenderSettings}
              size="sm"
              variant="ghost"
            >
              <RotateCcw />
              {m.player_settings_reset()}
            </Button>
          </div>

          <SettingSwitch
            checked={renderSettings.stageEffectsEnabled}
            description={m.player_settings_stage_effects_description()}
            label={m.player_settings_stage_effects()}
            onCheckedChange={(checked) =>
              setRenderSettings({ stageEffectsEnabled: checked })
            }
          />
          <p className="text-xs text-muted-foreground">
            {m.player_settings_reload_on_change()}
          </p>

          {renderSettings.stageEffectsEnabled && (
            <div className="space-y-4 rounded-lg border bg-muted/20 p-3">
              <SettingSwitch
                checked={renderSettings.planarReflectionEnabled}
                description={m.player_settings_planar_reflections_description()}
                label={m.player_settings_planar_reflections()}
                onCheckedChange={(checked) =>
                  setRenderSettings({ planarReflectionEnabled: checked })
                }
              />
              {renderSettings.planarReflectionEnabled && (
                <div className="space-y-2">
                  <Label>{m.player_settings_mirror_resolution()}</Label>
                  <Select
                    onValueChange={(nextValue) => {
                      if (nextValue !== null) {
                        setRenderSettings({
                          planarReflectionTextureSize: Number(
                            nextValue,
                          ) as PlanarReflectionTextureSize,
                        });
                      }
                    }}
                    value={String(
                      renderSettings.planarReflectionTextureSize,
                    )}
                  >
                    <SelectTrigger aria-label={m.player_settings_mirror_resolution()}>
                      <SelectValue>
                        {renderSettings.planarReflectionTextureSize === 0
                          ? m.player_settings_stage_default()
                          : `${renderSettings.planarReflectionTextureSize} × ${renderSettings.planarReflectionTextureSize}`}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PLANAR_REFLECTION_TEXTURE_SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size === 0
                            ? m.player_settings_stage_default()
                            : `${size} × ${size}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {m.player_settings_reload_on_reflection_change()}
                  </p>
                </div>
              )}
            </div>
          )}

          <SettingSwitch
            checked={renderSettings.bloomEnabled}
            description={m.player_settings_bloom_description()}
            label={m.player_settings_bloom()}
            onCheckedChange={(checked) =>
              setRenderSettings({ bloomEnabled: checked })
            }
          />
          {renderSettings.bloomEnabled && (
            <div className="space-y-4 rounded-lg border bg-muted/20 p-3">
              <SettingSlider
                label={m.player_settings_bloom_intensity()}
                max={1}
                min={0}
                onChange={(value) =>
                  setRenderSettings({ bloomIntensity: value })
                }
                step={0.01}
                value={renderSettings.bloomIntensity}
              />
              <SettingSlider
                label={m.player_settings_bloom_threshold()}
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
            description={m.player_settings_depth_of_field_description()}
            label={m.player_settings_depth_of_field()}
            onCheckedChange={(checked) =>
              setRenderSettings({ depthOfFieldEnabled: checked })
            }
          />
          {renderSettings.depthOfFieldEnabled && (
            <div className="space-y-4 rounded-lg border bg-muted/20 p-3">
              <SettingSlider
                formatValue={(value) => `${Math.round(value)} mm`}
                label={m.player_settings_focus_distance()}
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
                label={m.player_settings_aperture()}
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
            description={m.player_settings_vignette_description()}
            label={m.player_settings_vignette()}
            onCheckedChange={(checked) =>
              setRenderSettings({ vignetteEnabled: checked })
            }
          />
          {renderSettings.vignetteEnabled && (
            <div className="rounded-lg border bg-muted/20 p-3">
              <SettingSlider
                label={m.player_settings_vignette_weight()}
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
            description={m.player_settings_filmic_tone_mapping_description()}
            label={m.player_settings_filmic_tone_mapping()}
            onCheckedChange={(checked) =>
              setRenderSettings({ toneMappingEnabled: checked })
            }
          />
          <SettingSlider
            formatValue={(value) =>
              `${value > 0 ? "+" : ""}${Math.round(value)}`
            }
            label={m.player_settings_color_saturation()}
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
          <SettingHeading title={m.player_settings_materials()} />

          <div className="space-y-2">
            <Label>{m.player_settings_rendering_mode()}</Label>
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
              <SelectTrigger aria-label={m.player_settings_rendering_mode()}>
                <SelectValue>
                  {
                    MATERIAL_RENDER_MODE_LABELS[
                      renderSettings.materialRenderMode
                    ]()
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mmd">{m.player_settings_render_mode_mmd()}</SelectItem>
                <SelectItem value="balanced">{m.player_settings_render_mode_balanced()}</SelectItem>
                <SelectItem value="performance">{m.player_settings_render_mode_performance()}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {m.player_settings_reload_on_rendering_mode_change()}
            </p>
          </div>

          <SettingSwitch
            checked={renderSettings.applyAmbientColorToDiffuse}
            description={m.player_settings_ambient_material_color_description()}
            label={m.player_settings_ambient_material_color()}
            onCheckedChange={(checked) =>
              setRenderSettings({ applyAmbientColorToDiffuse: checked })
            }
          />
          <SettingSwitch
            checked={renderSettings.ignoreDiffuseWhenToonTextureIsNull}
            description={m.player_settings_missing_toon_fallback_description()}
            label={m.player_settings_missing_toon_fallback()}
            onCheckedChange={(checked) =>
              setRenderSettings({
                ignoreDiffuseWhenToonTextureIsNull: checked,
              })
            }
          />
          <SettingSwitch
            checked={renderSettings.sphereTextureEnabled}
            description={m.player_settings_sphere_maps_description()}
            label={m.player_settings_sphere_maps()}
            onCheckedChange={(checked) =>
              setRenderSettings({ sphereTextureEnabled: checked })
            }
          />
          <SettingSwitch
            checked={renderSettings.toonTextureEnabled}
            description={m.player_settings_toon_maps_description()}
            label={m.player_settings_toon_maps()}
            onCheckedChange={(checked) =>
              setRenderSettings({ toonTextureEnabled: checked })
            }
          />
        </section>

        <section className="space-y-4 rounded-2xl border border-border/70 bg-card/40 p-4">
          <div>
            <SettingHeading title={m.player_settings_render_quality()} />
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {m.player_settings_render_quality_description()}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{m.player_settings_quality_preset()}</Label>
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
              <SelectTrigger aria-label={m.player_settings_quality_preset()}>
                <SelectValue>
                  {
                    QUALITY_PRESET_LABELS[
                      getRenderQualityPreset(renderSettings)
                    ]()
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
                      {QUALITY_PRESET_LABELS[preset]()}
                    </SelectItem>
                  ))}
                {getRenderQualityPreset(renderSettings) === "custom" && (
                  <SelectItem disabled value="custom">
                    {m.player_settings_quality_preset_custom()}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {getRenderQualityPreset(renderSettings) === "custom" && (
              <p className="text-xs text-muted-foreground">
                {m.player_settings_custom_values_applied()}
              </p>
            )}
          </div>

          <SettingSwitch
            checked={renderSettings.rimLightEnabled}
            description={m.player_settings_rim_light_description()}
            label={m.player_settings_rim_light()}
            onCheckedChange={(checked) =>
              setRenderSettings({ rimLightEnabled: checked })
            }
          />
          {renderSettings.rimLightEnabled && (
            <div className="space-y-4 rounded-lg border bg-muted/20 p-3">
              <SettingSlider
                label={m.player_settings_rim_light_intensity()}
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
            <Label>{m.player_settings_antialiasing_samples()}</Label>
            <Select
              onValueChange={(nextValue) => {
                if (nextValue !== null) {
                  setRenderSettings({ msaaSamples: Number(nextValue) });
                }
              }}
              value={String(renderSettings.msaaSamples)}
            >
              <SelectTrigger aria-label={m.player_settings_antialiasing_samples()}>
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
            <Label>{m.player_settings_texture_filtering()}</Label>
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
              <SelectTrigger aria-label={m.player_settings_texture_filtering()}>
                <SelectValue>
                  {m.player_settings_anisotropic({ level: renderSettings.textureAnisotropy })}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TEXTURE_ANISOTROPY_OPTIONS.map((level) => (
                  <SelectItem key={level} value={String(level)}>
                    {m.player_settings_anisotropic({ level })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {m.player_settings_texture_filtering_description()}
            </p>
          </div>

          <SettingSwitch
            checked={renderSettings.fxaaEnabled}
            description={m.player_settings_fxaa_description()}
            label={m.player_settings_fxaa()}
            onCheckedChange={(checked) =>
              setRenderSettings({ fxaaEnabled: checked })
            }
          />

          <div className="space-y-2">
            <Label>{m.player_settings_supersampling()}</Label>
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
              <SelectTrigger aria-label={m.player_settings_supersampling()}>
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
              <Label>{m.player_settings_shadow_map()}</Label>
              <Select
                onValueChange={(nextValue) => {
                  if (nextValue !== null) {
                    setRenderSettings({ shadowMapSize: Number(nextValue) });
                  }
                }}
                value={String(renderSettings.shadowMapSize)}
              >
                <SelectTrigger aria-label={m.player_settings_shadow_map()}>
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
              <Label>{m.player_settings_shadow_softness()}</Label>
              <Select
                onValueChange={(nextValue) => {
                  if (nextValue === "pcf" || nextValue === "pcss") {
                    setRenderSettings({ shadowFiltering: nextValue });
                  }
                }}
                value={renderSettings.shadowFiltering}
              >
                <SelectTrigger aria-label={m.player_settings_shadow_softness()}>
                  <SelectValue>
                    {renderSettings.shadowFiltering === "pcss"
                      ? m.player_settings_shadow_soft()
                      : m.player_settings_shadow_crisp()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcf">{m.player_settings_shadow_crisp()}</SelectItem>
                  <SelectItem value="pcss">{m.player_settings_shadow_soft()}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SettingSwitch
            checked={renderSettings.ssaoEnabled}
            description={m.player_settings_ambient_occlusion_description()}
            label={m.player_settings_ambient_occlusion()}
            onCheckedChange={(checked) =>
              setRenderSettings({ ssaoEnabled: checked })
            }
          />
          {renderSettings.ssaoEnabled && (
            <div className="space-y-4 rounded-lg border bg-muted/20 p-3">
              <SettingSlider
                formatValue={(value) => value.toFixed(4)}
                label={m.player_settings_ssao_radius()}
                max={0.005}
                min={0.0001}
                onChange={(value) =>
                  setRenderSettings({ ssaoRadius: value })
                }
                step={0.0001}
                value={renderSettings.ssaoRadius}
              />
              <SettingSlider
                label={m.player_settings_ssao_strength()}
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
            description={m.player_settings_screen_space_reflections_description()}
            label={m.player_settings_screen_space_reflections()}
            onCheckedChange={(checked) =>
              setRenderSettings({ ssrEnabled: checked })
            }
          />
          {renderSettings.ssrEnabled && (
            <div className="space-y-4 rounded-lg border bg-muted/20 p-3">
              <SettingSlider
                label={m.player_settings_ssr_strength()}
                max={2}
                min={0}
                onChange={(value) =>
                  setRenderSettings({ ssrStrength: value })
                }
                step={0.05}
                value={renderSettings.ssrStrength}
              />
              <div className="space-y-2">
                <Label>{m.player_settings_ssr_quality()}</Label>
                <Select
                  onValueChange={(nextValue) => {
                    if (nextValue === "low" || nextValue === "medium" || nextValue === "high") {
                      setRenderSettings({ ssrQuality: nextValue });
                    }
                  }}
                  value={renderSettings.ssrQuality}
                >
                  <SelectTrigger aria-label={m.player_settings_ssr_quality()}>
                    <SelectValue>
                      {SSR_QUALITY_LABELS[renderSettings.ssrQuality]()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{m.player_settings_quality_low()}</SelectItem>
                    <SelectItem value="medium">{m.player_settings_quality_medium()}</SelectItem>
                    <SelectItem value="high">{m.player_settings_quality_high()}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <SettingSlider
            formatValue={(value) => `${Math.round(value)}°`}
            label={m.player_settings_physics_joint_limit()}
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
            <Label>{m.player_settings_physics_engine()}</Label>
            <Select
              onValueChange={(nextValue) => {
                if (nextValue === "ammo" || nextValue === "havok") {
                  setRenderSettings({ physicsBackend: nextValue });
                }
              }}
              value={renderSettings.physicsBackend}
            >
              <SelectTrigger aria-label={m.player_settings_physics_engine()}>
                <SelectValue>
                  {renderSettings.physicsBackend === "ammo"
                    ? m.player_settings_physics_bullet()
                    : m.player_settings_physics_havok()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ammo">{m.player_settings_physics_bullet()}</SelectItem>
                <SelectItem value="havok">{m.player_settings_physics_havok()}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {m.player_settings_physics_engine_description()}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{m.player_settings_physics_step_rate()}</Label>
            <Select
              onValueChange={(nextValue) => {
                if (nextValue === "30" || nextValue === "60" || nextValue === "120") {
                  setRenderSettings({ physicsStepRate: Number(nextValue) });
                }
              }}
              value={String(renderSettings.physicsStepRate)}
            >
              <SelectTrigger aria-label={m.player_settings_physics_step_rate()}>
                <SelectValue>{renderSettings.physicsStepRate} Hz</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 Hz</SelectItem>
                <SelectItem value="60">60 Hz</SelectItem>
                <SelectItem value="120">120 Hz</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {m.player_settings_physics_step_rate_description()}
            </p>
          </div>

          <div className="space-y-2">
            <div className={renderSettings.physicsBackend === "havok" ? "opacity-50" : undefined}>
              <SettingSlider
                label={m.player_settings_solver_iterations()}
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
                {m.player_settings_solver_bullet_only()}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {m.player_settings_solver_iterations_description()}
              </p>
            )}
          </div>

          <SettingSlider
            formatValue={(value) => `${value.toFixed(2)}×`}
            label={m.player_settings_physics_strength()}
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
            {m.player_settings_physics_strength_description()}
          </p>
          <p className="text-xs text-muted-foreground">
            {m.player_settings_joint_limit_description()}
          </p>
        </section>

        <section className="space-y-4 rounded-2xl border border-border/70 bg-card/40 p-4">
          <div>
            <SettingHeading title={m.player_settings_fps_overlay()} />
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {m.player_settings_fps_overlay_description()}{" "}
              <Kbd>`</Kbd>{" "}
              {m.player_settings_fps_overlay_key_suffix()}
            </p>
          </div>
          <SettingSwitch
            checked={overlayVisible}
            description={m.player_settings_show_performance_overlay_description()}
            label={m.player_settings_show_performance_overlay()}
            onCheckedChange={setOverlayVisible}
          />
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground/80">
              {m.player_settings_live_stats()}
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
            title={m.player_settings_volume()}
            value={`${Math.round(volume * 100)}%`}
          />

          <Slider
            className="mb-2"
            aria-label={m.player_settings_volume()}
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
