/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_LanguageInputs */

const en_common_language = /** @type {(inputs: Common_LanguageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Language`)
};

const zh_common_language = /** @type {(inputs: Common_LanguageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`语言`)
};

/**
* | output |
* | --- |
* | "Language" |
*
* @param {Common_LanguageInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const common_language = /** @type {((inputs?: Common_LanguageInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_LanguageInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_common_language(inputs)
	return en_common_language(inputs)
});