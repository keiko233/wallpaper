/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_NeverInputs */

const en_library_never = /** @type {(inputs: Library_NeverInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Never`)
};

const zh_library_never = /** @type {(inputs: Library_NeverInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`从未`)
};

/**
* | output |
* | --- |
* | "Never" |
*
* @param {Library_NeverInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_never = /** @type {((inputs?: Library_NeverInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_NeverInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_never(inputs)
	return en_library_never(inputs)
});