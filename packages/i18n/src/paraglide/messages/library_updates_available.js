/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Library_Updates_AvailableInputs */

const en_library_updates_available = /** @type {(inputs: Library_Updates_AvailableInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} updates available — versions are refreshed from the catalog.`)
};

const zh_library_updates_available = /** @type {(inputs: Library_Updates_AvailableInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`有 ${i?.count} 个可用更新 — 版本会从目录刷新。`)
};

/**
* | output |
* | --- |
* | "{count} updates available — versions are refreshed from the catalog." |
*
* @param {Library_Updates_AvailableInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_updates_available = /** @type {((inputs: Library_Updates_AvailableInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Updates_AvailableInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_updates_available(inputs)
	return en_library_updates_available(inputs)
});