/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ current: NonNullable<unknown>, next: NonNullable<unknown> }} Library_Update_BadgeInputs */

const en_library_update_badge = /** @type {(inputs: Library_Update_BadgeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Update available: v${i?.current} → v${i?.next}`)
};

const zh_library_update_badge = /** @type {(inputs: Library_Update_BadgeInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`有可用更新：v${i?.current} → v${i?.next}`)
};

/**
* | output |
* | --- |
* | "Update available: v{current} → v{next}" |
*
* @param {Library_Update_BadgeInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_update_badge = /** @type {((inputs: Library_Update_BadgeInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Update_BadgeInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_update_badge(inputs)
	return en_library_update_badge(inputs)
});