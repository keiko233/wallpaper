/// <reference path="./raw.d.ts" />

import enEula from "../eula/en.txt?raw";
import zhEula from "../eula/zh.txt?raw";
import type { Locale } from "./paraglide/runtime.js";

const EULA_BY_LOCALE: Record<Locale, string> = {
  en: enEula,
  zh: zhEula,
};

export function getEula(locale: Locale): string {
  return EULA_BY_LOCALE[locale];
}
