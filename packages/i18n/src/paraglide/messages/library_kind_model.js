/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Kind_ModelInputs */

const en_library_kind_model = /** @type {(inputs: Library_Kind_ModelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Models`)
};

const zh_library_kind_model = /** @type {(inputs: Library_Kind_ModelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`模型`)
};

/**
* | output |
* | --- |
* | "Models" |
*
* @param {Library_Kind_ModelInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_kind_model = /** @type {((inputs?: Library_Kind_ModelInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Kind_ModelInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_kind_model(inputs)
	return en_library_kind_model(inputs)
});