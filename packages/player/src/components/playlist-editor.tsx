import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ListMusic,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@wallpaper/ui/button";
import { m } from "@wallpaper/i18n";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@wallpaper/ui/dialog";
import { Label } from "@wallpaper/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@wallpaper/ui/select";
import { cn } from "@wallpaper/ui/utils";
import { useMmdActions, useMmdState } from "../providers/mmd-context";
import type { MmdPlaylistItem } from "../types";
import { GroupedSelectItems } from "./grouped-select-items";

function createPlaylistId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `playlist-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function PlaylistEditor() {
  const { models, motions, stages, skyboxes, playlist, playlistIndex } =
    useMmdState();
  const { setPlaylist, selectPlaylistItem, resetPlaylist } = useMmdActions();
  const [modelIndex, setModelIndex] = useState(0);
  const [motionIndex, setMotionIndex] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [skyboxIndex, setSkyboxIndex] = useState(0);

  const activeId = playlist[playlistIndex].id;

  const commitPlaylist = (next: MmdPlaylistItem[], preferredId = activeId) => {
    setPlaylist(next);
    const nextActiveIndex = next.findIndex((item) => item.id === preferredId);
    selectPlaylistItem(
      nextActiveIndex >= 0
        ? nextActiveIndex
        : Math.min(playlistIndex, next.length - 1),
    );
  };

  const updateItem = (
    index: number,
    update: Partial<
      Pick<
        MmdPlaylistItem,
        "modelId" | "motionId" | "stageId" | "skyboxId"
      >
    >,
  ) => {
    commitPlaylist(
      playlist.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...update } : item,
      ),
    );
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= playlist.length) return;
    const next = [...playlist];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    commitPlaylist(next);
  };

  const removeItem = (index: number) => {
    if (playlist.length <= 1) return;
    const next = playlist.filter((_, itemIndex) => itemIndex !== index);
    const preferredId =
      playlist[index].id === activeId
        ? next[Math.min(index, next.length - 1)].id
        : activeId;
    commitPlaylist(next, preferredId);
  };

  const addItem = () => {
    const next = [
      ...playlist,
      {
        id: createPlaylistId(),
        modelId: models[modelIndex].id,
        motionId: motions[motionIndex].id,
        stageId: stages[stageIndex].id,
        skyboxId: skyboxes[skyboxIndex].id,
      },
    ];
    commitPlaylist(next);
  };

  return (
    <Dialog>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <ListMusic />
        {m.player_playlist_edit()}
      </DialogTrigger>

      <DialogPopup className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{m.player_playlist_title()}</DialogTitle>
          <DialogDescription>
            {m.player_playlist_description()}
          </DialogDescription>
        </DialogHeader>

        <DialogPanel className="space-y-5">
          <div className="space-y-2">
            {playlist.map((item, index) => (
              <div
                className={cn(
                  "grid grid-cols-[1.5rem_repeat(4,minmax(0,1fr))_auto] items-center gap-2 rounded-xl border p-2 transition-colors",
                  index === playlistIndex && "border-primary/50 bg-primary/5",
                )}
                key={item.id}
              >
                <button
                  aria-label={m.player_playlist_play_item({ n: index + 1 })}
                  className="text-center text-xs tabular-nums text-muted-foreground hover:text-foreground"
                  onClick={() => selectPlaylistItem(index)}
                  type="button"
                >
                  {index + 1}
                </button>

                <Select
                  onValueChange={(value) => {
                    if (value !== null) {
                      updateItem(index, { modelId: value });
                    }
                  }}
                  value={item.modelId}
                >
                  <SelectTrigger
                    aria-label={m.player_playlist_model_for_item({
                      n: index + 1,
                    })}
                  >
                    <SelectValue>
                      {
                        models.find((model) => model.id === item.modelId)!
                          .name
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <GroupedSelectItems
                      items={models}
                      valueFor={(model) => model.id}
                    />
                  </SelectContent>
                </Select>

                <Select
                  onValueChange={(value) => {
                    if (value !== null) {
                      updateItem(index, { motionId: value });
                    }
                  }}
                  value={item.motionId}
                >
                  <SelectTrigger
                    aria-label={m.player_playlist_motion_for_item({
                      n: index + 1,
                    })}
                  >
                    <SelectValue>
                      {
                        motions.find((motion) => motion.id === item.motionId)!
                          .name
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {motions.map((motion) => (
                      <SelectItem key={motion.id} value={motion.id}>
                        {motion.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  onValueChange={(value) => {
                    if (value !== null) {
                      updateItem(index, { stageId: value });
                    }
                  }}
                  value={item.stageId}
                >
                  <SelectTrigger
                    aria-label={m.player_playlist_stage_for_item({
                      n: index + 1,
                    })}
                  >
                    <SelectValue>
                      {
                        stages.find((stage) => stage.id === item.stageId)!
                          .name
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <GroupedSelectItems
                      items={stages}
                      valueFor={(stage) => stage.id}
                    />
                  </SelectContent>
                </Select>

                <Select
                  onValueChange={(value) => {
                    if (value !== null) {
                      updateItem(index, { skyboxId: value });
                    }
                  }}
                  value={item.skyboxId}
                >
                  <SelectTrigger
                    aria-label={m.player_playlist_skybox_for_item({
                      n: index + 1,
                    })}
                  >
                    <SelectValue>
                      {
                        skyboxes.find(
                          (skybox) => skybox.id === item.skyboxId,
                        )!.name
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <GroupedSelectItems
                      items={skyboxes}
                      valueFor={(skybox) => skybox.id}
                    />
                  </SelectContent>
                </Select>

                <div className="flex gap-1">
                  <Button
                    aria-label={m.player_playlist_move_up({ n: index + 1 })}
                    disabled={index === 0}
                    onClick={() => moveItem(index, -1)}
                    size="icon-xs"
                    variant="ghost"
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    aria-label={m.player_playlist_move_down({ n: index + 1 })}
                    disabled={index === playlist.length - 1}
                    onClick={() => moveItem(index, 1)}
                    size="icon-xs"
                    variant="ghost"
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    aria-label={m.player_playlist_delete_item({ n: index + 1 })}
                    disabled={playlist.length <= 1}
                    onClick={() => removeItem(index)}
                    size="icon-xs"
                    variant="destructive-outline"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-dashed p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium">
                  {m.player_playlist_add_combination()}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {m.player_playlist_duplicates_allowed()}
                </p>
              </div>
              <Button onClick={addItem} size="sm">
                <Plus />
                {m.player_playlist_add()}
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="space-y-1.5">
                <Label>{m.player_settings_model()}</Label>
                <Select
                  onValueChange={(value) => {
                    if (value !== null) setModelIndex(Number(value));
                  }}
                  value={String(modelIndex)}
                >
                  <SelectTrigger>
                    <SelectValue>{models[modelIndex].name}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <GroupedSelectItems
                      items={models}
                      valueFor={(_model, index) => String(index)}
                    />
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{m.player_settings_motion()}</Label>
                <Select
                  onValueChange={(value) => {
                    if (value !== null) setMotionIndex(Number(value));
                  }}
                  value={String(motionIndex)}
                >
                  <SelectTrigger>
                    <SelectValue>{motions[motionIndex].name}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {motions.map((motion, index) => (
                      <SelectItem key={motion.id} value={String(index)}>
                        {motion.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{m.player_settings_stage()}</Label>
                <Select
                  onValueChange={(value) => {
                    if (value !== null) setStageIndex(Number(value));
                  }}
                  value={String(stageIndex)}
                >
                  <SelectTrigger>
                    <SelectValue>{stages[stageIndex].name}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <GroupedSelectItems
                      items={stages}
                      valueFor={(_stage, index) => String(index)}
                    />
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{m.player_settings_skybox()}</Label>
                <Select
                  onValueChange={(value) => {
                    if (value !== null) setSkyboxIndex(Number(value));
                  }}
                  value={String(skyboxIndex)}
                >
                  <SelectTrigger>
                    <SelectValue>{skyboxes[skyboxIndex].name}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <GroupedSelectItems
                      items={skyboxes}
                      valueFor={(_skybox, index) => String(index)}
                    />
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </DialogPanel>

        <DialogFooter className="justify-between sm:justify-between">
          <Button onClick={resetPlaylist} variant="outline">
            <RotateCcw />
            {m.player_playlist_restore_default()}
          </Button>
          <span className="self-center text-xs text-muted-foreground">
            {m.player_playlist_items_saved({ count: playlist.length })}
          </span>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
