/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Kind_LabelInputs */

const en_library_kind_label = /** @type {(inputs: Library_Kind_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resource kind`)
};

const zh_library_kind_label = /** @type {(inputs: Library_Kind_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`资源类型`)
};

/**
* | output |
* | --- |
* | "Resource kind" |
*
* @param {Library_Kind_LabelInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_kind_label = /** @type {((inputs?: Library_Kind_LabelInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Kind_LabelInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_kind_label(inputs)
	return en_library_kind_label(inputs)
});