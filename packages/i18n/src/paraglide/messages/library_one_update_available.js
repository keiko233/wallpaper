/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_One_Update_AvailableInputs */

const en_library_one_update_available = /** @type {(inputs: Library_One_Update_AvailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`1 update available — versions are refreshed from the catalog.`)
};

const zh_library_one_update_available = /** @type {(inputs: Library_One_Update_AvailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`有 1 个可用更新 — 版本会从目录刷新。`)
};

/**
* | output |
* | --- |
* | "1 update available — versions are refreshed from the catalog." |
*
* @param {Library_One_Update_AvailableInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_one_update_available = /** @type {((inputs?: Library_One_Update_AvailableInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_One_Update_AvailableInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_one_update_available(inputs)
	return en_library_one_update_available(inputs)
});