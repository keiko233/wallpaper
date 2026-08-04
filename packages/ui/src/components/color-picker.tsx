"use client";

import ColorPicker from "react-pick-color";
import type { Theme } from "react-pick-color";
import type React from "react";
import { cn } from "@wallpaper/ui/utils";
import { Popover, PopoverPopup, PopoverTrigger } from "./popover";

const PICKER_THEME: Theme = {
  background: "transparent",
  borderColor: "transparent",
  boxShadow: "none",
  color: "var(--color-popover-foreground)",
  inputBackground: "var(--color-muted)",
  borderRadius: "calc(var(--radius-lg) - 2px)",
};

export function ColorPickerField({
  label,
  value,
  disabled = false,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}): React.ReactElement {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={label}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 transition-colors",
          !disabled && "hover:bg-accent/50",
          disabled && "opacity-50",
        )}
        disabled={disabled}
      >
        <span className="text-sm font-medium">{label}</span>
        <span
          aria-hidden="true"
          className="size-7 shrink-0 rounded-md border shadow-xs"
          style={{ backgroundColor: value }}
        />
      </PopoverTrigger>
      <PopoverPopup>
        <ColorPicker
          color={value}
          hideAlpha
          onChange={(color) => onChange(color.hex)}
          theme={PICKER_THEME}
        />
      </PopoverPopup>
    </Popover>
  );
}
