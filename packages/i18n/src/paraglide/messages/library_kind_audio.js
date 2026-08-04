/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Kind_AudioInputs */

const en_library_kind_audio = /** @type {(inputs: Library_Kind_AudioInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Audio`)
};

const zh_library_kind_audio = /** @type {(inputs: Library_Kind_AudioInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`音频`)
};

/**
* | output |
* | --- |
* | "Audio" |
*
* @param {Library_Kind_AudioInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_kind_audio = /** @type {((inputs?: Library_Kind_AudioInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Kind_AudioInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_kind_audio(inputs)
	return en_library_kind_audio(inputs)
});