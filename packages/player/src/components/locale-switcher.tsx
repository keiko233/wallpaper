import { locales, m } from "@wallpaper/i18n";
import { setLocale, useLocale } from "@wallpaper/i18n";
import { Label } from "@wallpaper/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@wallpaper/ui/select";

export function LocaleSwitcher({ showLabel = true }: {
  showLabel?: boolean;
}) {
  const locale = useLocale();
  return (
    <div className="space-y-2">
      {showLabel ? <Label>{m.common_language()}</Label> : null}
      <Select
        onValueChange={(value) => {
          if (value !== null) setLocale(value);
        }}
        value={locale}
      >
        <SelectTrigger aria-label={m.common_language()}>
          <SelectValue>
            {m.common_current_language()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {locales.map((locale) => (
            <SelectItem key={locale} value={locale}>
              {m.common_current_language(undefined, {
                locale
              })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
