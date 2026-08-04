/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Update_AllInputs */

const en_library_update_all = /** @type {(inputs: Library_Update_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Update all`)
};

const zh_library_update_all = /** @type {(inputs: Library_Update_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`全部更新`)
};

/**
* | output |
* | --- |
* | "Update all" |
*
* @param {Library_Update_AllInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_update_all = /** @type {((inputs?: Library_Update_AllInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Update_AllInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_update_all(inputs)
	return en_library_update_all(inputs)
});