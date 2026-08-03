import { Fragment } from "react";
import {
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
} from "@wallpaper/ui/select";

interface GroupedSelectItemsProps<T extends { id: string; name: string; group?: string }> {
  items: readonly T[];
  valueFor: (item: T, globalIndex: number) => string;
}

export function GroupedSelectItems<T extends { id: string; name: string; group?: string }>({
  items,
  valueFor,
}: GroupedSelectItemsProps<T>) {
  const groups: { label: string | null; entries: { item: T; index: number }[] }[] =
    [];
  for (const [index, item] of items.entries()) {
    const label = item.group ?? null;
    const current = groups[groups.length - 1];
    if (current === undefined || current.label !== label) {
      groups.push({ label, entries: [{ item, index }] });
    } else {
      current.entries.push({ item, index });
    }
  }

  return (
    <>
      {groups.map((group, groupIndex) => {
        const items = group.entries.map(({ item, index }) => (
          <SelectItem key={item.id} value={valueFor(item, index)}>
            {item.name}
          </SelectItem>
        ));
        const content =
          group.label === null ? (
            items
          ) : (
            <SelectGroup key={group.label}>
              <SelectGroupLabel>{group.label}</SelectGroupLabel>
              {items}
            </SelectGroup>
          );
        return (
          <Fragment key={group.label ?? `ungrouped-${groupIndex}`}>
            {groupIndex > 0 ? <SelectSeparator /> : null}
            {content}
          </Fragment>
        );
      })}
    </>
  );
}
