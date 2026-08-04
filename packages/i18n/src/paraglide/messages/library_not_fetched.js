/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Not_FetchedInputs */

const en_library_not_fetched = /** @type {(inputs: Library_Not_FetchedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Not fetched`)
};

const zh_library_not_fetched = /** @type {(inputs: Library_Not_FetchedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`未获取`)
};

/**
* | output |
* | --- |
* | "Not fetched" |
*
* @param {Library_Not_FetchedInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_not_fetched = /** @type {((inputs?: Library_Not_FetchedInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Not_FetchedInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_not_fetched(inputs)
	return en_library_not_fetched(inputs)
});