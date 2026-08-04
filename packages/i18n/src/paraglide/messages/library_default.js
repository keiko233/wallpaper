/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_DefaultInputs */

const en_library_default = /** @type {(inputs: Library_DefaultInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Default`)
};

const zh_library_default = /** @type {(inputs: Library_DefaultInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`默认`)
};

/**
* | output |
* | --- |
* | "Default" |
*
* @param {Library_DefaultInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_default = /** @type {((inputs?: Library_DefaultInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_DefaultInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_default(inputs)
	return en_library_default(inputs)
});