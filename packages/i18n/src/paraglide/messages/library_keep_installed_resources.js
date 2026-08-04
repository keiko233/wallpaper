/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Keep_Installed_ResourcesInputs */

const en_library_keep_installed_resources = /** @type {(inputs: Library_Keep_Installed_ResourcesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Keep installed resources`)
};

const zh_library_keep_installed_resources = /** @type {(inputs: Library_Keep_Installed_ResourcesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`保留已安装资源`)
};

/**
* | output |
* | --- |
* | "Keep installed resources" |
*
* @param {Library_Keep_Installed_ResourcesInputs} inputs
* @param {{ locale?: "en" | "zh" }} options
* @returns {LocalizedString}
*/
export const library_keep_installed_resources = /** @type {((inputs?: Library_Keep_Installed_ResourcesInputs, options?: { locale?: "en" | "zh" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Keep_Installed_ResourcesInputs, { locale?: "en" | "zh" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "zh") return zh_library_keep_installed_resources(inputs)
	return en_library_keep_installed_resources(inputs)
});