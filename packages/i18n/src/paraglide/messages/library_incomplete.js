/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_IncompleteInputs */

const en_library_incomplete = /** @type {(inputs: Library_IncompleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Incomplete`)
};

const zh_library_incomplete = /** @type {(inputs: Library_IncompleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`不完整`)
};

/**
* | output |
* | --- |
* | "Incomplete" |
*
* @param {Library_IncompleteInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_incomplete = /** @type {((inputs?: Library_IncompleteInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_IncompleteInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_incomplete(inputs)
	return en_library_incomplete(inputs)
});