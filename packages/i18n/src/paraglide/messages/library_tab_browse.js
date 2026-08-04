/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Tab_BrowseInputs */

const en_library_tab_browse = /** @type {(inputs: Library_Tab_BrowseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Browse`)
};

const zh_library_tab_browse = /** @type {(inputs: Library_Tab_BrowseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`浏览`)
};

/**
* | output |
* | --- |
* | "Browse" |
*
* @param {Library_Tab_BrowseInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_tab_browse = /** @type {((inputs?: Library_Tab_BrowseInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Tab_BrowseInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_tab_browse(inputs)
	return en_library_tab_browse(inputs)
});