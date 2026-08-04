/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_AddInputs */

const en_library_add = /** @type {(inputs: Library_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add`)
};

const zh_library_add = /** @type {(inputs: Library_AddInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`添加`)
};

/**
* | output |
* | --- |
* | "Add" |
*
* @param {Library_AddInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_add = /** @type {((inputs?: Library_AddInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_AddInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_add(inputs)
	return en_library_add(inputs)
});