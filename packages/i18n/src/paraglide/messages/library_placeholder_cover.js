/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ kind: NonNullable<unknown> }} Library_Placeholder_CoverInputs */

const en_library_placeholder_cover = /** @type {(inputs: Library_Placeholder_CoverInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.kind} placeholder cover`)
};

const zh_library_placeholder_cover = /** @type {(inputs: Library_Placeholder_CoverInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.kind} 占位封面`)
};

/**
* | output |
* | --- |
* | "{kind} placeholder cover" |
*
* @param {Library_Placeholder_CoverInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_placeholder_cover = /** @type {((inputs: Library_Placeholder_CoverInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Placeholder_CoverInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_placeholder_cover(inputs)
	return en_library_placeholder_cover(inputs)
});