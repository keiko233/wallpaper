import { useSyncExternalStore } from "react";
import {
  getLocale as resolveLocale,
  setLocale as setParaglideLocale,
  type Locale,
} from "./paraglide/runtime.js";

const subscribers = new Set<() => void>();

function notifySubscribers(): void {
  for (const subscriber of subscribers) {
    subscriber();
  }
}

export function getLocale(): Locale {
  return resolveLocale();
}

export function setLocale(locale: Locale): void {
  const result = setParaglideLocale(locale, { reload: false });
  document.documentElement.lang = locale;
  notifySubscribers();
  if (result instanceof Promise) {
    void result.catch(() => undefined);
  }
}

export function subscribeLocale(subscriber: () => void): () => void {
  subscribers.add(subscriber);
  return () => {
    subscribers.delete(subscriber);
  };
}

export function initI18n(): void {
  document.documentElement.lang = getLocale();
}

export function useLocale(): Locale {
  return useSyncExternalStore(subscribeLocale, getLocale);
}
