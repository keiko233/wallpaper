/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_EnabledInputs */

const en_library_enabled = /** @type {(inputs: Library_EnabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enabled`)
};

const zh_library_enabled = /** @type {(inputs: Library_EnabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`已启用`)
};

/**
* | output |
* | --- |
* | "Enabled" |
*
* @param {Library_EnabledInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_enabled = /** @type {((inputs?: Library_EnabledInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_EnabledInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_enabled(inputs)
	return en_library_enabled(inputs)
});