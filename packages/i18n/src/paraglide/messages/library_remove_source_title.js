/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Library_Remove_Source_TitleInputs */

const en_library_remove_source_title = /** @type {(inputs: Library_Remove_Source_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Remove ${i?.name}?`)
};

const zh_library_remove_source_title = /** @type {(inputs: Library_Remove_Source_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`移除 ${i?.name}？`)
};

/**
* | output |
* | --- |
* | "Remove {name}?" |
*
* @param {Library_Remove_Source_TitleInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_remove_source_title = /** @type {((inputs: Library_Remove_Source_TitleInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Remove_Source_TitleInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_remove_source_title(inputs)
	return en_library_remove_source_title(inputs)
});