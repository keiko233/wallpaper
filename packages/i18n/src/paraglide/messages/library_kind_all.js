/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Kind_AllInputs */

const en_library_kind_all = /** @type {(inputs: Library_Kind_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`All kinds`)
};

const zh_library_kind_all = /** @type {(inputs: Library_Kind_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`全部类型`)
};

/**
* | output |
* | --- |
* | "All kinds" |
*
* @param {Library_Kind_AllInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_kind_all = /** @type {((inputs?: Library_Kind_AllInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Kind_AllInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_kind_all(inputs)
	return en_library_kind_all(inputs)
});