/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Search_PlaceholderInputs */

const en_library_search_placeholder = /** @type {(inputs: Library_Search_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search models, motions, stages, skyboxes…`)
};

const zh_library_search_placeholder = /** @type {(inputs: Library_Search_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`搜索模型、动作、舞台、天空盒……`)
};

/**
* | output |
* | --- |
* | "Search models, motions, stages, skyboxes…" |
*
* @param {Library_Search_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_search_placeholder = /** @type {((inputs?: Library_Search_PlaceholderInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Search_PlaceholderInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_search_placeholder(inputs)
	return en_library_search_placeholder(inputs)
});