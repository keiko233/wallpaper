import { Loader2Icon } from "lucide-react";
import type React from "react";
import { m } from "@wallpaper/i18n";
import { cn } from "@wallpaper/ui/utils";

export function Spinner({
  className,
  ...props
}: React.ComponentProps<typeof Loader2Icon>): React.ReactElement {
  return (
    <Loader2Icon
      aria-label={m.ui_loading()}
      className={cn("animate-spin", className)}
      role="status"
      {...props}
    />
  );
}
