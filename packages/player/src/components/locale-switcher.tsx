import { m } from "@wallpaper/i18n";
import { setLocale, useLocale } from "@wallpaper/i18n";
import { Label } from "@wallpaper/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@wallpaper/ui/select";

export function LocaleSwitcher() {
  const locale = useLocale();
  return (
    <div className="space-y-2">
      <Label>{m.common_language()}</Label>
      <Select
        onValueChange={(value) => {
          if (value !== null) setLocale(value);
        }}
        value={locale}
      >
        <SelectTrigger aria-label={m.common_language()}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{m.common_locale_en()}</SelectItem>
          <SelectItem value="zh">{m.common_locale_zh()}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
