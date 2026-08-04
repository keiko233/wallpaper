/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Add_SourceInputs */

const en_library_add_source = /** @type {(inputs: Library_Add_SourceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add source`)
};

const zh_library_add_source = /** @type {(inputs: Library_Add_SourceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`添加来源`)
};

/**
* | output |
* | --- |
* | "Add source" |
*
* @param {Library_Add_SourceInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_add_source = /** @type {((inputs?: Library_Add_SourceInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Add_SourceInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_add_source(inputs)
	return en_library_add_source(inputs)
});