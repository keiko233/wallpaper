import { getEula, m, useLocale } from "@wallpaper/i18n";
import { LocaleSwitcher } from "@wallpaper/player/locale-switcher";
import { Button } from "@wallpaper/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@wallpaper/ui/dialog";

export type EulaDecision = "accepted" | "declined" | "pending";

export const EULA_STORAGE_KEY = "wallpaper:eula:v1";

export function EulaDialog({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) {
  const locale = useLocale();
  return (
    <Dialog
      disablePointerDismissal
      onOpenChange={() => undefined}
      open
    >
      <DialogPopup showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{m.web_eula_title()}</DialogTitle>
          <DialogDescription>
            {m.web_eula_description()}
          </DialogDescription>
        </DialogHeader>
        <DialogPanel className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
          {getEula(locale)}
        </DialogPanel>
        <DialogFooter>
          <div className="me-auto w-36 sm:w-40">
            <LocaleSwitcher showLabel={false} />
          </div>
          <DialogClose
            onClick={onDecline}
            render={<Button variant="ghost" />}
          >
            {m.web_eula_decline()}
          </DialogClose>
          <DialogClose onClick={onAccept} render={<Button />}>
            {m.web_eula_accept()}
          </DialogClose>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
