/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_DescriptionInputs */

const en_library_description = /** @type {(inputs: Library_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Browse independent resource sources and manage artifacts installed on this device.`)
};

const zh_library_description = /** @type {(inputs: Library_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`浏览独立的资源来源，并管理安装在本机上的资源文件。`)
};

/**
* | output |
* | --- |
* | "Browse independent resource sources and manage artifacts installed on this device." |
*
* @param {Library_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_description = /** @type {((inputs?: Library_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_description(inputs)
	return en_library_description(inputs)
});