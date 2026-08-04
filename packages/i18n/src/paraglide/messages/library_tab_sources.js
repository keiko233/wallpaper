/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Tab_SourcesInputs */

const en_library_tab_sources = /** @type {(inputs: Library_Tab_SourcesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sources`)
};

const zh_library_tab_sources = /** @type {(inputs: Library_Tab_SourcesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`来源`)
};

/**
* | output |
* | --- |
* | "Sources" |
*
* @param {Library_Tab_SourcesInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_tab_sources = /** @type {((inputs?: Library_Tab_SourcesInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Tab_SourcesInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_tab_sources(inputs)
	return en_library_tab_sources(inputs)
});