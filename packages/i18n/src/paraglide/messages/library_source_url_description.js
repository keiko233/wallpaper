/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Source_Url_DescriptionInputs */

const en_library_source_url_description = /** @type {(inputs: Library_Source_Url_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Root URLs, subpaths, and direct catalog.json URLs are supported. The host must allow browser CORS.`)
};

const zh_library_source_url_description = /** @type {(inputs: Library_Source_Url_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`支持根 URL、子路径和直接的 catalog.json URL。主机必须允许浏览器 CORS。`)
};

/**
* | output |
* | --- |
* | "Root URLs, subpaths, and direct catalog.json URLs are supported. The host must allow browser CORS." |
*
* @param {Library_Source_Url_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_source_url_description = /** @type {((inputs?: Library_Source_Url_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Source_Url_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_source_url_description(inputs)
	return en_library_source_url_description(inputs)
});