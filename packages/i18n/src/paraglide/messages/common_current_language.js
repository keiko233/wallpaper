/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_Current_LanguageInputs */

const en_common_current_language = /** @type {(inputs: Common_Current_LanguageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`English`)
};

const zh_common_current_language = /** @type {(inputs: Common_Current_LanguageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`简体中文`)
};

/**
* | output |
* | --- |
* | "English" |
*
* @param {Common_Current_LanguageInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const common_current_language = /** @type {((inputs?: Common_Current_LanguageInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Current_LanguageInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_common_current_language(inputs)
	return en_common_current_language(inputs)
});