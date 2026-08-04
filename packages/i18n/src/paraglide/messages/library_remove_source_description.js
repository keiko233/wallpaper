/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Remove_Source_DescriptionInputs */

const en_library_remove_source_description = /** @type {(inputs: Library_Remove_Source_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Choose whether resources already installed from this source should remain available on this device. Both options remove the source and its cached catalog.`)
};

const zh_library_remove_source_description = /** @type {(inputs: Library_Remove_Source_DescriptionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`请选择从此来源已安装的资源是否在本机继续可用。两个选项都会移除该来源及其缓存的目录。`)
};

/**
* | output |
* | --- |
* | "Choose whether resources already installed from this source should remain available on this device. Both options remove the source and its cached catalog." |
*
* @param {Library_Remove_Source_DescriptionInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_remove_source_description = /** @type {((inputs?: Library_Remove_Source_DescriptionInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Remove_Source_DescriptionInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_remove_source_description(inputs)
	return en_library_remove_source_description(inputs)
});