/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_RefreshInputs */

const en_library_refresh = /** @type {(inputs: Library_RefreshInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Refresh`)
};

const zh_library_refresh = /** @type {(inputs: Library_RefreshInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`刷新`)
};

/**
* | output |
* | --- |
* | "Refresh" |
*
* @param {Library_RefreshInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_refresh = /** @type {((inputs?: Library_RefreshInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_RefreshInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_refresh(inputs)
	return en_library_refresh(inputs)
});