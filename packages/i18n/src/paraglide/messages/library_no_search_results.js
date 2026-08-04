/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_No_Search_ResultsInputs */

const en_library_no_search_results = /** @type {(inputs: Library_No_Search_ResultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No resources from enabled sources match this search.`)
};

const zh_library_no_search_results = /** @type {(inputs: Library_No_Search_ResultsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`已启用来源中没有与搜索匹配的资源。`)
};

/**
* | output |
* | --- |
* | "No resources from enabled sources match this search." |
*
* @param {Library_No_Search_ResultsInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_no_search_results = /** @type {((inputs?: Library_No_Search_ResultsInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_No_Search_ResultsInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_no_search_results(inputs)
	return en_library_no_search_results(inputs)
});