/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Empty_DescriptionInputs */

const en_library_empty_description = /** @type {(inputs: Library_Empty_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A source can be an R2 public domain, an nginx directory, or any HTTPS URL containing catalog.json.`)
};

const zh_library_empty_description = /** @type {(inputs: Library_Empty_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`来源可以是 R2 公共域名、nginx 目录，或任何包含 catalog.json 的 HTTPS URL。`)
};

/**
* | output |
* | --- |
* | "A source can be an R2 public domain, an nginx directory, or any HTTPS URL containing catalog.json." |
*
* @param {Library_Empty_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_empty_description = /** @type {((inputs?: Library_Empty_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Empty_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_empty_description(inputs)
	return en_library_empty_description(inputs)
});