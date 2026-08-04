/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_TitleInputs */

const en_library_title = /** @type {(inputs: Library_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resource library`)
};

const zh_library_title = /** @type {(inputs: Library_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`资源库`)
};

/**
* | output |
* | --- |
* | "Resource library" |
*
* @param {Library_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_title = /** @type {((inputs?: Library_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_title(inputs)
	return en_library_title(inputs)
});