/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_UpdateInputs */

const en_library_update = /** @type {(inputs: Library_UpdateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Update`)
};

const zh_library_update = /** @type {(inputs: Library_UpdateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`更新`)
};

/**
* | output |
* | --- |
* | "Update" |
*
* @param {Library_UpdateInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_update = /** @type {((inputs?: Library_UpdateInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_UpdateInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_update(inputs)
	return en_library_update(inputs)
});