/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Search_LabelInputs */

const en_library_search_label = /** @type {(inputs: Library_Search_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search resources`)
};

const zh_library_search_label = /** @type {(inputs: Library_Search_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`搜索资源`)
};

/**
* | output |
* | --- |
* | "Search resources" |
*
* @param {Library_Search_LabelInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_search_label = /** @type {((inputs?: Library_Search_LabelInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Search_LabelInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_search_label(inputs)
	return en_library_search_label(inputs)
});